import React, {Component} from 'react';
import PropTypes from "prop-types";
import './style.scss'
import {getDeviceId, loadLinktag, loadScript} from "@utils/common";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";
import isEmpty from 'lodash/isEmpty';


const loadErosPlayerScript = (onLoad) => {
    loadLinktag('/assets/erosPlayer/en-web-sdk.css','eros-player-style')
    loadScript('/assets/erosPlayer/en-web-sdk.js', 'eros-player-sdk', onLoad)
}

export default class ErosWebPlayer extends Component {

    constructor(configObj) {
        super(configObj);
        this.props = configObj.props;
        this.playerCallback = configObj.playerCallback;
        this.prevTime = 0;
        this.contentData = ''
        this.authToken = '';
        loadErosPlayerScript(()=>this.loadPlayer.call(this)) ;
    }

    loadPlayer = () => {
        let partnerCode = 'TSKY'
        let deviceId = getDeviceId()
        let country = 'IN'
        let env = 'PRODUCTION';

        //console.log('this.playerCallback:', this.playerCallback);

        let environment = (process.env.NODE_ENV || 'development').toString().trim().toLowerCase();

        if(environment === 'staging'){
            env = 'PRODUCTION'
        }
        else if (environment !== 'production' && typeof window !== "undefined") {
            env = 'STAGING'
        }

        let config = {
            partnerCode: partnerCode,
            deviceId: deviceId,
            country: country,
            env: env,
        };

        this.sdkInstance = new WebSDK(config);
        this.initPlayer();
    }

    initPlayer = () => {
       // console.log("web sdk instance: ", this.sdkInstance);
        const {detail, currentSubscription} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let partnerId = currentSubscription?.partnerUniqueIdInfo?.[detail?.provider?.toUpperCase()]?.partnerUniqueId;
        let partnerUserToken = userInfo.deviceToken

        try {
            this.sdkInstance.doLogin(partnerUserToken, partnerId).then((res) => {
                this.authToken = res?.data?.auth_token;
                let contentId = this.props.contentLastPlayedDetails.providerContentId || '';
                setTimeout(() =>{
                    this.checkNetworkError();
                     this.load(this.sdkInstance, contentId)
                    }, 100);
            }).catch((err) => {
                this.handleError(err);
                console.log("login error: ", err);
            });
        } catch (err) {
            console.error(err);
            this.handleError(err);
        }
    }

    load = (sdkInstance, contentId) => {
        sdkInstance.playContent('eros-player', contentId).then((res) => {
            console.log('play content: ', res);
            this.initialData()
        }).catch((err) => {
            console.log("play content error: ", err);
            this.handleError(err);
        });
    }

    onPlay = () => {
        if (this.playerCallback) {
            this.playerCallback('PLAY');
        }
    };

    onPlaying = () => {
        if (this.playerCallback) {
            this.playerCallback('PLAYING');
        }
    };

    onPause = () => {
        this.checkNetworkError();
        if (this.playerCallback) {
            this.playerCallback('PAUSE');
        }
    };

    onEnded = () => {
        if (this.playerCallback) {
            this.playerCallback('ENDED');
        }
    };

    unload = () => {
        this.sdkInstance.eventHandler.playerEvent.addEventListener('onClose', function (event) {

        })
        this.onEnded();
    }

    initialData = () => {
        let contentId = this.props.contentLastPlayedDetails.providerContentId || '';
        let response = '', statusCode;
        this.sdkInstance.fetchContentProfile(contentId, this.authToken).then((res) => {
            console.log('fetch content: ', res);
            let data = res?.data;
            this.contentData = data;
            if (!isEmpty(data)) {
                this.duration = parseInt(data.duration, 10);
                this.initialEvent()
            }
        }).catch((err) => {
            console.log("fetch content error: ", err);
            this.handleError(err);
        });
    }

    ready = () => {
        if (this.playerCallback) {
            this.playerCallback('READY', this.duration, this.contentData.play_state.progress);
        }
    };

    onTimeUpdate = (obj) => {
        let fixedTime = Math.ceil(obj.detail.currentTime);
        if (this.playerCallback) {
            this.prevTime = fixedTime;
            this.playerCallback('TIMEUPDATE', this.duration, fixedTime, 10);
        }
    };

    getDuration = () => {
        return this.duration;
    };

    onSeeking = () => {
        if (this.playerCallback) {
            this.playerCallback('SEEKING');
        }
    };

    onSeeked = () => {
        if (this.playerCallback) {
            this.playerCallback('SEEKED');
        }
    };

    play = () => {
        this.sdkInstance.eventHandler.playerEvent.addEventListener('onPlay', function (event) {
            console.log('on playing event called');
        });
    };

    destroy = () => {
        this.playerCallback = null;
        this.url = null;
        this.prevTime = 0;
        this.duration = 0;
        this.unload();
    };

    initialEvent = () => {
        if (this.playerCallback) {
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onPlayerReady', this.ready);
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onTimeUpdate', this.onTimeUpdate)
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onSeeking', this.onSeeking)
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onSeeked', this.onSeeked)
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onLoadedMetadata', this.onMetadataParsed)
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onPlay', this.onPlay);
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onPlaying', this.onPlaying);
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onPause', this.onPause);
            this.sdkInstance.eventHandler.playerEvent.addEventListener('onEnded', this.onEnded);
        }
    };

    pause = () => {
        this.sdkInstance.eventHandler.uiEvent.addEventListener('onPauseClick', this.onPause);
    }

    getCurrentTime = () => {
        return this.prevTime;
    };

    onMetadataParsed = () => {
        if (this.playerCallback) {
            this.duration = parseInt(this.contentData?.duration, 10);
            this.playerCallback('METADATALOADED', this.duration, this.contentData?.play_state?.progress);
        }
    }

    handleError = (error) => {
        this.checkNetworkError();
        if (this.playerCallback && error) {
            this.playerCallback('ERROR', {
                type: error.name.toLowerCase(),
                message: 'LOAD_ERROR',
                code: error.code,
            });
        }
    };

    checkNetworkError = ()=>{
        if(!navigator.onLine){
            this.playerCallback('ERROR', {
                type: 'error',
                message: 'NETWORK',
                code: '',
            });
        }
    }
}

ErosWebPlayer.propTypes = {
    detail: PropTypes.object,
    contentLastPlayedDetails: PropTypes.object,
    currentSubscription: PropTypes.object,
}
