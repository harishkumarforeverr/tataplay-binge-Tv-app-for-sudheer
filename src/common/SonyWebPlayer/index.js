import React, {Component} from 'react';
import PropTypes from "prop-types";
import {getDeviceId, loadScript} from "@utils/common";

import {CONSTANT, CONTENTTYPE, LOCALSTORAGE} from "@constants";
import {getKey} from "@utils/storage";


const loadSonyPlayerScript = (onLoad) => {
    loadScript('https://static-assets.sonyliv.com/filesystem/platform/web/tatasky/v1/spn-partner-sdk.js', 'sony-player-sdk', onLoad)
}

export default class SonyWebPlayer extends Component {

    constructor(configObj) {
        super(configObj);
        this.props = configObj.props;
        this.playerEventsCallback = configObj.playerCallback;
        this.prevTime = 0;
        this.urlParams = '';
        this.isPlayerCreated = false;
        this.nativeEvents = '';
        this.customEvents = '';
        this.adsEvents = '';
        this.currentPosition = '';
        this.playerDiv = document.getElementById("playerWrapper")
        this.sdkConfig = {
            playerDiv: this.playerDiv,
            video: {
                videoId: null,
            },
            playerConfig: this.getPlayerConfig(),
            playerCallback: this.playerCallback,
            playerCustomCallback: this.playerCustomCallback,
            adCallback: this.adCallback,
        };
        this.adServerUrl =
            "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpostpodbumper&cmsid=496&vid=short_onecue&correlator=";

        loadSonyPlayerScript(() => this.initPlayer.call(this));
    }

    getPlayerConfig = () => {
        let enableTestAd = false;
        return {
            enableUI: false,
            useIFrame: false,
            enableAds: false,
            adServerUrl: enableTestAd ? this.adServerUrl : null,
        };
    }

    initPlayer = () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
            window.SPN_MANAGER.initSDK(
                  {
                      shortToken: "73Wi8uC1MJJIQ5kHM7k7DnKJujTkYL6D",
                      uniqueId: "TATASky",
                     deviceType: "TSMOBILE",
                      deviceToken: userInfo.deviceSerialNumber,
                      partnerToken: this.props.sonyToken,
                      useIFrame: true,
                      createPlayer: true,
                      deviceId: getDeviceId().toString(),
                },
           /* {
                shortToken: "73Wi8uC1MJJIQ5kHM7k7DnKJujTkYL6D",
                uniqueId: "TATASky",
                deviceType: "TSMOBILE",
                deviceToken: "G070L822932321XJ",
                partnerToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXJ0bmVyIjoiVEFUQV9TS1lfQklOR0VfTU9CSUxFIiwiYWNjZXNzS2V5IjoiYWM0NzM2YjJmNDExNTE4NzY5MGYiLCJpc3N1ZXIiOiJTb255TElWIiwic3ViamVjdCI6IlBhcnRuZXIgU3BlY2lmaWMgVG9rZW4iLCJhdWRpZW5jZSI6Iiouc29ueWxpdi5jb20iLCJpYXQiOjE2NjM1MjYxMzQsImV4cCI6MTY2MzYxOTczNH0.kO-8xJhGdYDrQJjZ9XUDnB_gDD-PTVctVpDrgrTCNT6g1yV_YfbElI2XgXfSvPDV0ygm4TTbsjyND7V_BCWBvw",
                useIFrame: true,
                createPlayer: true,
                deviceId: getDeviceId().toString(),
            },*/
            (res) => {
                console.log('res', res);
                this.loadPlayer(res);
            },
        );
    }

    loadPlayer = (res) => {
        let success = res.success, message = res.message, result = res.result, player = res.player;

        if (this.urlParams?.createplayer === "false" && !this.isPlayerCreated) {
            player = window.SPN_MANAGER.createPlayer();
            this.isPlayerCreated = true;
        }

        if (success) {
            console.log("initializeCallback :: ", result);
            window.TATA_PLAYER = player;
            window.TATA_PLAYER.on("error", (error) => {
                // setTimeout(() => {
                //     alert("Error :: " + error.errorMessage);
                // }, 0);
                console.error("error :: ", error);
                this.defaultLoadError(error);

            });
            if (this.urlParams?.prefetchplayer === "true") {
                const config = {
                    playerDiv: this.playerDiv,
                };
                window.TATA_PLAYER.prefetchPlayerSdk(config, function (res) {
                    console.log("prefetchPlayerSdk :: ", res);
                });
            }
            this.nativeEvents = window.SPN_MANAGER.EVENTS.NATIVE_EVENTS;
            this.customEvents = window.SPN_MANAGER.EVENTS.CUSTOM_EVENTS;
            this.adsEvents = window.SPN_MANAGER.EVENTS.ADS_EVENTS;
            this.launchPlayer(this.props.detail.providerContentId);
            // console.log('launchPlayer contentiD:',this.props.detail.providerContentId)
            // this.launchPlayer(1000009246);
        } else {
            console.error("initializeCallback Error :: ", res);
        }
    }
    durationChanged = async()=>{
       await window.TATA_PLAYER.getTotalDuration().then((duration) => {
        this.duration = parseInt(duration, 10);
          });
    }

    launchPlayer = (videoId) => {
        if (window.TATA_PLAYER) {
            this.sdkConfig.video.videoId = videoId;
            /*document.getElementById("togglePlay").innerHTML = "Pause";*/
            window.TATA_PLAYER.playContent(this.sdkConfig, (err, data) => {
                if (err) {
                    this.defaultLoadError(err)
                    console.error("Error :: ", err);
                    return;
                }
                console.info("data :: ", data);
                if (window.TATA_CONTROLS) {
                    window.TATA_CONTROLS.destroy();
                    window.TATA_CONTROLS = null;
                }
            });
        } else {
            console.log("SPNManager not found");
        }
    }

    playerCallback = async (eventName, eventData) => {

        if (window.TATA_CONTROLS && window.TATA_CONTROLS.playerCallback) {
            window.TATA_CONTROLS.playerCallback(eventName, eventData);
        }

        if (eventName === this.nativeEvents.LOADSTART) {
            //registerUIEvents();
            await this.onReady();
        }


        switch (eventName) {
            case this.nativeEvents.LOADEDDATA:
                break;
            case this.nativeEvents.LOADEDMETADATA:
                await this.onSourceLoaded();
                break;
            case this.nativeEvents.SEEKING:
                await this.onSeeking();
                break;
            case this.nativeEvents.SEEKED:
                await this.onSeeked();
                break;
            case this.nativeEvents.ENDED:
                await this.onEnded();
                break;
            case this.nativeEvents.TEXT_TRACK_CUE_CHANGE:
                await this.onCueEnter(eventData)
                break;
            case this.nativeEvents.ERROR:
                await this.onError(eventData);
                break;
            case this.nativeEvents.DURATIONCHANGE:
                await this.durationChanged()
                break;
        }

        if (
            [
                this.nativeEvents.PROGRESS,
                this.nativeEvents.SEEKBAR_UPDATE,
                this.nativeEvents.TIMEUPDATE,
            ].includes(eventName)
        ) {
            return;
        }
        console.log("playerCallback :: ", eventName, eventData);
    }


    playerCustomCallback = async (eventName, eventData) => {
        if (window.TATA_CONTROLS && window.TATA_CONTROLS.playerCustomCallback) {
            window.TATA_CONTROLS.playerCustomCallback(eventName, eventData);
        }
        if ([this.customEvents.TIMEUPDATE].includes(eventName)) {
            let currentTime = eventData.currentTime;
            await this.onTimeUpdate(currentTime);
            return;
        }
        if ([this.customEvents.BITRATE_CHANGED].includes(eventName)) {
            await this.onVideoPlaybackQualityChanged();
            return;
        }
        console.log("playerCustomCallback :: ", eventName, eventData);
    }

    adCallback = (eventName, eventData) => {
        console.log("adCallback :: ", eventName, eventData);
        if (window.TATA_CONTROLS && window.TATA_CONTROLS.adCallback) {
            window.TATA_CONTROLS.adCallback(eventName, eventData);
        }

        if ([this.adsEvents.ADINIT].includes(eventName)) {
            // debugger
            return;
        }
        if ([this.adsEvents.ADCLICK].includes(eventName)) {
            // debugger
            return;
        }
        if ([this.adsEvents.ADPAUSED].includes(eventName)) {
            // debugger
            return;
        }
    }
    onCueEnter = (data) => {
        if (data.text !== '') {
            this.playerEventsCallback('SUBTITLETEXT', data.text);
        } else {
            this.playerEventsCallback('SUBTITLETEXT', '');
        }
    };
    onError = error => {
            this.defaultLoadError(error)
    }
 
    defaultLoadError = (error) => {
        if(!navigator.onLine){
            this.playerEventsCallback('ERROR', {
            type: 'error',
            message: 'NETWORK',
            code: '',
            });
        }
        else{ 
            if (this.playerEventsCallback && error) {   
              this.playerEventsCallback('ERROR', {
                type: 'error',
                message: 'LOAD_ERROR',
                // message: error.errorMessage,
                code: error.errorCode,
            });
        }
         };
    }

  

    getDuration = () => {
        return this.duration;
    };

    setAudio = (id) => {
        window.TATA_PLAYER.setMultiAudio(id);
    }

    setVideoQuality = (item) => {
        let id = item.id ? item.id : 'auto';
        window.TATA_PLAYER.setPlaybackVariant(id);
    };

    onVideoPlaybackQualityChanged = () => {
        if (this.playerEventsCallback) {
            this.playerEventsCallback('QUALITYCHANGED');
        }
    };

    onReady = async () => {
        let duration = await window.TATA_PLAYER.getTotalDuration();
        this.duration = parseInt(duration, 10);
        if (this.playerEventsCallback) {
            this.playerEventsCallback(
                'READY',
                duration,
                await window.TATA_PLAYER.getCurrentPosition(),
            );
        }
    }

    onSourceLoaded = async () => {
        this.prevTime = 0;
        let duration = await window.TATA_PLAYER.getTotalDuration();
        let getMultiAudio = await window.TATA_PLAYER.getMultiAudio();
        let getSubtitleLanguages = await window.TATA_PLAYER.getSubtitleLanguages();

        this.duration = parseInt(duration, 10);
        if (this.playerEventsCallback) {
            this.playerEventsCallback(
                'METADATALOADED',
                duration,
                await window.TATA_PLAYER.getCurrentPosition(),
                getSubtitleLanguages,
                getMultiAudio,
                await window.TATA_PLAYER.getPlaybackVariants(),
            );
            // this.setVideoQuality();
        }
    };

    pause = async () => {
        let isPlaying = await window.TATA_PLAYER.isPlaying();
        isPlaying && window.TATA_PLAYER.togglePlayPause() && this.onPause();
    }

    play = async () => {
        let isPlaying = await window.TATA_PLAYER.isPlaying();
        !isPlaying && window.TATA_PLAYER.togglePlayPause();
    }

    onPause = () => {
        if (this.playerEventsCallback) {
            this.playerEventsCallback('PAUSE');
        }
    };

    setVolume = (data) => {
        window.TATA_PLAYER.setVolume(data);
    };

    onEnded = () => {
        if (this.playerCallback) {
            this.playerCallback('ENDED');
        }
    };

    destroy = () => {
        this.playerDiv = null;
        let playerWrapper  = document.getElementById("playerWrapper")
        playerWrapper?playerWrapper.innerHTML='':''
        this.playerEventsCallback = null;
        this.prevTime = 0;
        this.duration = 0;
        if (window.TATA_PLAYER) {
            window.TATA_PLAYER.destroyPlayer();
        }
    };

    seek = async (position) => {
        let duration = await window.TATA_PLAYER.getTotalDuration();
        if (position > 0 && position <= duration) {
            window.TATA_PLAYER.seekTo({position});
        }
        this.prevTime = position;
    };

    getCurrentTime = () => {
        return this.prevTime;
    };

    rewind = time => {
        if (time <= 0) {
            window.TATA_PLAYER.seekTo({position: 0});
            this.prevTime = 0;
        } else {
            window.TATA_PLAYER.seekTo({position: this.prevTime - time});
            this.prevTime = this.prevTime - time > 0 ? this.prevTime - time : 0;
        }
    };

    forward = async time => {
        let currentTime = await window.TATA_PLAYER.getCurrentPosition();
        let duration = await window.TATA_PLAYER.getTotalDuration();
        if (currentTime + time >= duration) {
            window.TATA_PLAYER.seekTo({position: this.duration});
            this.prevTime = this.duration;
        } else {
            window.TATA_PLAYER.seekTo({position: this.prevTime + time});
            let dur = await window.TATA_PLAYER.getTotalDuration();
            this.prevTime = this.prevTime + time < dur ? this.prevTime + time : dur;
        }
    };

    onSeeking = () => {
        if (this.playerEventsCallback) {
            this.playerEventsCallback('SEEKING');
        }
    };

    onSeeked = () => {
        if (this.playerEventsCallback) {
            this.playerEventsCallback('SEEKED');
        }
    };


    onTimeUpdate = async (obj) => {
        const time = parseInt(obj, 10);
        let isPlaying = await window.TATA_PLAYER.isPlaying();
        if (this.prevTime !== time && this.playerEventsCallback && isPlaying ) {
            this.prevTime = time;
            this.playerEventsCallback('TIMEUPDATE', this.duration, time, 10);
        }
    };

    setSubtitle = async (prev, current) => {
        await window.TATA_PLAYER.setSubtitleEnabled();
        try {
            if (current.label !== undefined) {
                await window.TATA_PLAYER.setSubtitleLanguage(current.label);
            } else {
                await window.TATA_PLAYER.setSubtitleLanguage(current);

            }

        } catch (e) {
            console.log(e);
        }
    };
}

SonyWebPlayer.propTypes = {
    detail: PropTypes.object,
    sonyToken: PropTypes.string,
}