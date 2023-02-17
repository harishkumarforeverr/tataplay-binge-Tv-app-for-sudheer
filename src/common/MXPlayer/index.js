import React, {Component} from 'react';
import {CONTENTTYPE, LOCALSTORAGE, PARTNER_SUBSCRIPTION_TYPE} from "@constants";
import {getKey, setKey} from "@utils/storage";
import { isMobile, loadScript } from '@utils/common';
import PropTypes from 'prop-types';
import { MX_PLAYER_CONTENT_TYPE } from '@utils/constants/playerConstant';
import CONSTANT from "@environment/index";

const loadMxPlayerScript = (onLoad) => {
    if (!window.MXPlayer) {
        loadScript(CONSTANT.MX_SCRIPT, 'mx-script', onLoad)
    }
    onLoad();
}

export default class MxPlayer extends Component {

    constructor(configObj) {
        super(configObj);
        this.contentId = configObj.props.detail.providerContentId;
        this.contentType = configObj.props.detail.contentType;
        this.playerCallback = configObj.playerCallback;
        this.playerSource = configObj.playerSource;
        this.props = configObj.props;
        this.playerBack = configObj.playerBack;
        this.nextPrevClick = configObj.nextPrevClick;
        this.partnerSubscriptionType = configObj.props.detail?.partnerSubscriptionType;
        
        loadMxPlayerScript(()=>this.initPlayer.call(this));
    } 


    initPlayer = () => {
        console.log('mx', window.MXPlayer);
        let platformData = this.getPlatformData();
        let contentType = this.getContentType();
        window?.MXPlayer?.initialize('#mxplayer', this.contentId, contentType, platformData, this.getPlatformCallBacks())
    } 

    getPlatformData = () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let volume = 0;
        if (JSON.parse(getKey(LOCALSTORAGE.PLAYER_MUTE)) === true) {
            volume = 0;
        } else {
            volume = 100;
        }
        return {
            identifier: CONSTANT.MX_IDENTIFIER,
            token : this.partnerSubscriptionType.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase() ? userInfo.accessToken : '',
            source: "TSMOBILE",
            dsn: userInfo.deviceSerialNumber,
            isMobile: isMobile.any() || false,
            playerSettings: {
                volume: volume,
            }
        };
    }

    getPlatformCallBacks = () => {
       return {
            eventCallback: (event) => {
                console.log('platformCallbacks:',event);
                
                switch (event.type) {
                    case "BACK_PRESS":
                        this.playerBack();
                        break;
                    case "NEXT_EPISODE":
                        this.nextPrevClick('next');
                        break;
                    case "VOLUME_CHANGE":
                        this.volumeChange(event);
                        break;
                    case "PLAYER_LOADED":
                        this.playerLoaded();
                        break;

                }
            },
            errorCallback: (error) => {
                console.log(error);
                this.handleError(error);
            },
        }
    }

    playerLoaded = () => {
        if(this.props.isLoading) {
            this.props.hideMainLoader();
        }
      };
    
    getContentType = () => {
        if (this.contentType === CONTENTTYPE.TYPE_MOVIES || this.contentType === CONTENTTYPE.TYPE_CUSTOM_MOVIES_DETAIL) {
            return MX_PLAYER_CONTENT_TYPE.MOVIE
        } else if (this.contentType === CONTENTTYPE.TYPE_WEB_SHORTS || this.contentType === CONTENTTYPE.TYPE_CUSTOM_WEB_SHORTS_DETAIL) {
            return MX_PLAYER_CONTENT_TYPE.SHORTS
        } else {
            return MX_PLAYER_CONTENT_TYPE.EPISODE;
        }
    }


    handleError = (error) => {
        this.checkNetworkError(error);
        if (this.playerCallback && error) {
            this.playerCallback('ERROR', {
                type: 'error',
                message: 'LOAD_ERROR',
                code: error.code,
            });
        }
    };

    checkNetworkError = (error)=>{
        if(!navigator.onLine){
            this.playerCallback('ERROR', {
                type: 'error',
                message: 'NETWORK',
                code: error.code,
            });
        }
    }

    volumeChange = (event) => {
        if(event.value === 0) {
            setKey(LOCALSTORAGE.PLAYER_MUTE, JSON.stringify(true));
        } else {
            setKey(LOCALSTORAGE.PLAYER_MUTE, JSON.stringify(false));
        }
    }

}
MxPlayer.propTypes = {
    currentSubscription: PropTypes.object,
    detail: PropTypes.object,
    isLoading: PropTypes.bool,
    hideMainLoader: PropTypes.func,
};