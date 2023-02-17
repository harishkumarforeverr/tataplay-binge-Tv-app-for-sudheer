import React from 'react';
import PropTypes from "prop-types";

import './style.scss'
import {CONTENTTYPE, CONTRACT, LOCALSTORAGE, PLAYER_SOURCE, LIONSGATE} from "@constants";
import {ERROR_MESSAGES, PLAYER_CODES, PLAY_AUTH_TYPE, PROVIDER_NAME} from "@constants/playerConstant";
import {getSystemDetails} from "@utils/browserEnvironment";
import {BROWSER_TYPE} from "@constants/browser";
import store from "@src/store";
import {resendLicenseChallenge} from "@containers/PlayerWeb/APIs/actions";
import {getDeviceId, loadScript, _base64ToArrayBuffer} from "@utils/common";
import {getKey} from "@utils/storage";

const loadBMPlayerScript = (onLoad) => {
    loadScript('https://cdn.bitmovin.com/player/web/8.96.0/bitmovinplayer.js', 'bm-player', onLoad)
}

export default class BitmovinPlayer extends React.Component {

    constructor(configObj) {
        super(configObj);
        this.playerId = configObj.playerId;
        this.playerCallback = configObj.playerCallback;
        this.streamUrl = configObj.streamUrl;
        this.drmType = configObj.drmType;
        this.licenseUrl = configObj.liceseUrl;
        this.headers = configObj.headers;
        this.playerKey = configObj.playerKey;
        this.appId = configObj.appId;
        this.urlType = configObj.urlType;
        this.isDrm = configObj.isDrm;
        this.kid = configObj.kid;
        this.key = configObj.key;
        this.ads = configObj.ads;
        this.sdk = configObj.playerSdk;
        this.playerSource = configObj.playerSource;
        this.props = configObj.props;
        this.mediaKeySystemConfig = configObj.mediaKeySystemConfig;
        this.prevTime = 0;
        this.bitmovinInstance = null;
        this.source = null;
        this.renewSession = configObj.renewSession;
        this.genricAuthType = configObj.genricAuthType;
        this.certificateURl = configObj.certificateURl;
        let providerLowerCase = this.props?.detail?.provider?.toLowerCase();
        this.provider = providerLowerCase;
        this.isVOD = this.props?.playDetail?.contractName === CONTRACT.RENTAL || (providerLowerCase === PROVIDER_NAME.TATASKY);
        // this is TVOD and IVOD check
        this.isVoot = [PROVIDER_NAME.VOOTSELECT, PROVIDER_NAME.VOOTKIDS].includes(providerLowerCase);
        this.isHoichoi = PROVIDER_NAME.HOICHOI === providerLowerCase;
        this.isSafariRenewal = false;
        this.url = null;
        this.body = null;
        this.irdetoTimer = null;
        this.timerRunning = false;
        this.drmToken = configObj.drmToken;
        this.isTrailer = configObj.isTrailer;
        this.token = configObj.token;
        this.isTravelXp = providerLowerCase === PROVIDER_NAME.TRAVEL_XP;
        this.isLiveContent = configObj.props?.liveMetaData?.contentType?.toUpperCase() === CONTENTTYPE.TYPE_LIVE;

        loadBMPlayerScript(() => this.initPlayer.call(this));
    }

    initPlayer() {
        try {
            this.prevTime = 0;
            const container = document.getElementById(this.playerId);
            const config = {
                key: this.playerKey,
                playback: {
                    autoplay: true,
                },
                tweaks: {
                    file_protocol: true,
                    app_id: 'tataSky',
                    fairplay_ignore_duplicate_init_data_key_errors: true,
                },
                logs: {
                    //level: "debug",
                },
                cast: {
                    enable: false,
                },
                ui: false, // disable the built-in UI
                analytics: false, // disable the built-in analytics
                style: {
                    width: '100%',
                    aspectratio: '16:9',
                    controls: false,
                },
                skin: {
                    screenLogoImage: '',
                },
                adaptation: {
                    // desktop: {
                    //     preload: true,
                    // },
                    desktop: {
                        preload: true,                        
                        bitrates: {
                           // minSelectableVideoBitrate: '3mbps', 
                            maxSelectableVideoBitrate: this.provider === PROVIDER_NAME.CHAUPAL ? '12mbps':null, 
                        }
                      }
                },
                poster: this.props?.detail?.boxCoverImage,
                network: {
                    preprocessHttpRequest: (requestType, requestConfig) => {
                        if (requestConfig.method === "POST") {
                            this.url = requestConfig.url;
                            this.body = requestConfig.body;

                            const systemDetail = getSystemDetails();

                            if ((systemDetail.browser === BROWSER_TYPE.SAFARI)) {

                                if (!this.isSafariRenewal) {
                                    //  requestConfig.headers["X-Irdeto-Renewal-Request"] = 0;
                                    this.isSafariRenewal = true;
                                }
                            }
                        }
                        if (['manifest/dash'].indexOf(requestType) >= 0 && this.isVOD) {
                            requestConfig.headers["device_id"] = getDeviceId();
                            let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

                            requestConfig.headers["s_id"] = userInfo.sId;

                            /*********** content specific headers  ************/
                            if (this.props?.detail?.contentType) {
                                const contentType = this.props?.detail?.contentType;
                                switch (contentType) {
                                    case CONTENTTYPE.TYPE_SERIES:
                                    case CONTENTTYPE.TYPE_BRAND:
                                    case CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL:
                                    case CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL:
                                    case CONTENTTYPE.TYPE_MOVIES:
                                    case CONTENTTYPE.TYPE_TV_SHOWS:
                                    case CONTENTTYPE.TYPE_WEB_SHORTS:
                                    case CONTENTTYPE.TYPE_CUSTOM_MOVIES_DETAIL:
                                    case CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL:
                                    case CONTENTTYPE.TYPE_CUSTOM_WEB_SHORTS_DETAIL:
                                        requestConfig.headers["asset_id"] = this.props?.detail?.vodAssetId;
                                        break;
                                    default :
                                        break;

                                }

                            }
                            return requestConfig;
                        }
                        if (requestType === window.bitmovin.player.HttpRequestType.DRM_LICENSE_FAIRPLAY && 
                            ![PROVIDER_NAME.CHAUPAL, PROVIDER_NAME.TATASKY, PROVIDER_NAME.LIONS_GATE].includes(this.provider) 
                            && !([PLAY_AUTH_TYPE.JWT_TOKEN, PLAY_AUTH_TYPE.DRM_PLAYBACK].includes(this.genricAuthType)) && 
                            !this.isLiveContent) {
                            requestConfig.headers['Content-Type'] = 'Content-Type: application/json';
                            const split1 = requestConfig.body.split('spc=');
                            const split2 = split1[1].split('&assetId=');
                            const requestObj = {};
                            requestObj.licenseDuration = 0
                            requestObj.spc = split2[0]
                            requestObj.id = "JioCinemaID"
                            requestConfig.body = JSON.stringify(requestObj);
                        }
                        return Promise.resolve(requestConfig);
                    },
                    preprocessHttpResponse: (type, response) => {
                        let res = response;
                        if (response.request.method === "POST") {
                            let renewalDuration = null;
                            if (Array.isArray(response.headers))
                                for (let x = 0; x < response.headers.length; x++) {
                                    if (response.headers[x].name === "x-irdeto-renewal-duration") {
                                        renewalDuration = parseInt(response.headers[x].value);
                                        // renewalDuration = 30;
                                    }
                                }
                            const systemDetail = getSystemDetails();
                            if (renewalDuration && renewalDuration > 0 && systemDetail.browser === BROWSER_TYPE.SAFARI) {
                                this.timerRunning = true;
                                this.irdetoTimer = setInterval(() => {
                                    this.resendLicenseChallenge()
                                }, renewalDuration * 1000);
                                console.log("Interval timer is now running");
                            }
                        }
                        if (type === 'manifest/dash' && this.provider === PROVIDER_NAME.CHAUPAL) {
                            if (response.body) {
                                let parser = new DOMParser();
                                let xmlBody = parser.parseFromString(response.body,"text/xml");
                                let adaptationVideoSet = xmlBody.querySelector('AdaptationSet[mimeType="video/mp4"]');
                                adaptationVideoSet.querySelector('Representation[height="2160"]').remove();
                                //process the response.body xml and assign it back to response.body
                                //response.body =  processed value
                                const serializer = new XMLSerializer();
                                const xmlStr = serializer.serializeToString(xmlBody);
                                response.body = xmlStr;
                            }
                            res = Promise.resolve(response);
                        }
                        return res;
                    },
                },
            };
            this.bitmovinInstance = new window.bitmovin.player.Player(container, config);
            this.initiatePlayBack(this.bitmovinInstance);
            this.source = {};
            this.source[this.urlType] = this.streamUrl;
            if (this.isDrm) {
                this.source.drm = {};
                this.source.drm[this.drmType] = {};

                if (this.provider === PROVIDER_NAME.LIONS_GATE && !this.isTrailer) {
                    this.source = this.getDrm(); // for lionsgate
                }

                if (this.drmType === 'clearkey') {
                    this.source.drm[this.drmType] = [
                        {
                            kid: this.kid,
                            key: this.key,
                        },
                    ];
                } else if (this.drmType === PLAYER_SOURCE.FAIR_PLAY) {
                    if (this.isVOD || this.isLiveContent || this.genricAuthType === PLAY_AUTH_TYPE.JWT_TOKEN) {
                        this.source = this.playerSource;
                    } else {
                        this.source = this.getDrm();
                    }
                } else {
                    this.source.drm[this.drmType].LA_URL = this.licenseUrl;
                    this.source.drm[this.drmType].mediaKeySystemConfig = this.mediaKeySystemConfig;
                   
                    if (this.drmType === PLAYER_SOURCE.WIDEVINE) {
                        this.source.drm[this.drmType].videoRobustness = 'SW_SECURE_CRYPTO';
                        this.source.drm[this.drmType].audioRobustness = 'SW_SECURE_CRYPTO';
                    }
                    this.source.drm[this.drmType].headers = this.getHeaders(this.headers);
                }
            }
            console.log('source', this.source)
            this.bitmovinInstance.load(this.source).then(
                () => {
                    console.log('loaded');
                    const enSubtitle = this.props?.detail?.subtitlePlayUrl && this.props?.detail?.subtitlePlayUrl.map((item, index) => {
                                return ({
                                        id: `sub${index+1}`,
                                        lang: item.lang,
                                        label: item.lang,
                                        url: item.url,
                                        kind: "subtitle"
                                    })});
                    this.isHoichoi && enSubtitle.forEach(element => {
                        this.bitmovinInstance.subtitles.add(element)
                    });
                },
                error => {
                    console.log('Error while creating Bitmovin Player instance', error);
                },
            );
            this.addPlayerEvents();
        } catch (error) {
            console.trace(error);
        }
    }

    getHeaders = (headers) => {
        if (this.isTravelXp) {
            let data = {
                "X-AxDRM-Message": this.token
            };
            return {...headers, ...data};
        }
        return headers;
    }

    getDrm = () => {
        if (this.provider === PROVIDER_NAME.CHAUPAL) {
            this.source.drm = {
                fairplay: {
                    LA_URL: this.licenseUrl,
                    certificateURL: this.certificateURl,
                    prepareContentId: (contentId) => {
                        const uri = contentId;
                        let uriParts = uri.split('://', 1);
                        const protocol = uriParts[0].slice(-3);
                        uriParts = uri.split(';', 2);
                        contentId = uriParts.length > 1 ? uriParts[1] : '';
                        return protocol.toLowerCase() === 'skd' ? contentId : '';
                    },
                    prepareLicenseAsync: (ckc) => {
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.addEventListener('loadend', () => {
                                const array = new Uint8Array(reader.result);
                                resolve(array);
                            });
                            reader.addEventListener('error', () => {
                                reject(reader.error);
                            });
                            reader.readAsArrayBuffer(ckc);
                        });
                    },
                    prepareMessage: (event, session) => {
                        return new Blob([event.message], {type: 'application/octet-binary'});
                    },
                    headers: {
                        'content-type': 'application/octet-stream',
                    },
                    useUint16InitData: true,
                    licenseResponseType: 'blob'
                },
            }
        }
        else if (this.provider === PROVIDER_NAME.LIONS_GATE) {
            this.source.drm = {
                widevine: {
                    LA_URL: this.licenseUrl,
                    prepareMessage:  (keyMessage) => {
                        return JSON.stringify({
                            token: this.drmToken,
                            drm_info: Array.apply(null, new Uint8Array(keyMessage.message)),
                            kid: this.kid,
                        });
                    }
                },
                fairplay: {
                    LA_URL: this.licenseUrl,
                    certificateURL: this.certificateURl,
                    certificateHeaders: {
                        "x-vudrm-token": [this.drmToken]
                    },
                    headers: {
                        "Content-Type": "application/json"
                    },
                    prepareMessage:  (keyMessageEvent, keySession) => {
                        return JSON.stringify({
                            token: this.drmToken,
                            contentId: keySession.contentId,
                            payload: keyMessageEvent.messageBase64Encoded
                        });
                    },
                    prepareContentId: function (rawContentId) {
                        var tmp = rawContentId.split('/');
                        return tmp[tmp.length - 1];
                    },
                    prepareCertificate: function (cert) {
                        return new Uint8Array(cert);
                    },
                    prepareLicense: function (license) {
                        return new Uint8Array(license);
                    },
                    licenseResponseType: 'arraybuffer'
                }
            }
        } else if (this.isVoot) {
            this.source.drm = {
                fairplay: {
                    LA_URL: this.licenseUrl,
                    serverCertificate: _base64ToArrayBuffer(this.certificateURl),
                    prepareContentId: function (contentId) {
                        const link = document.createElement('a');
                        link.href = contentId.substring(2);
                        return link.hostname;
                    },
                    prepareLicense: function (license) {
                        return JSON.parse(license).ckc;
                    }
                },
            }
        } else if (this.isTravelXp) {
            this.source.drm = {
                fairplay: {
                    LA_URL: this.licenseUrl,
                    certificateURL: this.certificateURl,
                    prepareContentId : function(contentId) {
                        var idx = contentId.indexOf("skd://");
                        if (idx > -1) {
                            console.log('test', contentId.substring(8));
                          return contentId.substring(8);
                        }
                    },
                    prepareLicenseAsync: (ckc) => {
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.addEventListener('loadend', () => {
                                const array = new Uint8Array(reader.result);
                                resolve(array);
                            });
                            reader.addEventListener('error', () => {
                                reject(reader.error);
                            });
                            reader.readAsArrayBuffer(ckc);
                        });
                    },
                    prepareMessage: (event, session) => {
                        return new Blob([event.message], {type: 'application/octet-binary'});
                    },
                    headers: {
                        'content-type': 'application/octet-stream',
                        ...this.getHeaders(),
                    },
                    useUint16InitData: true,
                    licenseResponseType: 'blob'
                },
            }
        }
        else {
            //buy drm for manorama or genric drm token api impl.
            this.source.drm = {
                fairplay: {
                    LA_URL: this.licenseUrl,
                    certificateURL: this.certificateURl,
                    headers : {
                        "X-myplex-platform": "iOS",
                        "Content-type": "text/xml"
                    },
                    prepareMessage : function(event, session) {
                        return "spc=" + event.messageBase64Encoded + "&assetId=" + session.contentId;
                    },
                    prepareContentId : function(contentId) {
                        var idx = contentId.indexOf("skd://");
                        if (idx > -1) {
                        return contentId.substring(8, 40);
                        }
                    }
                },
            }  
        }
        return this.source;
    }

    initiatePlayBack = (player) => {
        let { match: { params: { id, contentType } }, detail, liveChannelMetaData, liveMetaData } = this.props;
        let assetInfo = {
            AssetID: parseInt(id),
            Provider: detail?.provider || liveChannelMetaData?.channelName,
            ContentType: contentType,
            CDN: "AKAMAI",
            ContentTitle: `${contentType === "MOVIES" ? detail?.vodTitle || detail?.title : (detail?.title || detail?.vodTitle || detail?.brandTitle || liveMetaData?.title)}`,
            playerVersion: "8.96.0",
        };
        let _player_autoplay = false;
        this.sdk.getMitigationConfiguration(player);
        this.sdk.registerPlaybackSession(assetInfo, player, _player_autoplay);
    }

    resendLicenseChallenge = () => {

        const systemDetail = getSystemDetails();
        let headerForResendLicense = (systemDetail.browser === BROWSER_TYPE.SAFARI) ?
            {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Irdeto-Renewal-Request": "1",
                "Accept": "*/*",
            } :
            {
                "Content-Type": "text/xml",
                "SOAPAction": "http://schemas.microsoft.com/DRM/2007/03/protocols/AcquireLicense",
            };


        console.log("Re-sending license challenge to: " + this.url);

        let store = store.getState();
        store.dispatch(resendLicenseChallenge(this.url, this.body, headerForResendLicense).then(res => {
            console.log("License call is successful.");
            console.log(JSON.stringify(res));
        }).catch(err => {
            console.log("License request has failed.", err);
            clearInterval(this.irdetoTimer);
            console.log("Stopping playback...");
            this.timerRunning = false;
            this.bitmovinInstance.unload();
        }));
    };

    addPlayerEvents() {
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.SourceLoaded, this.onSourceLoaded);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.MetadataParsed, this.onMetadataParsed);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.Ready, this.onReady);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.TimeChanged, this.onTimeUpdate);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.Error, this.onError);
        this.bitmovinInstance.on(
            window.bitmovin.player.PlayerEvent.VideoPlaybackQualityChanged,
            this.onVideoPlaybackQualityChanged,
        );
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.PlaybackFinished, this.onEnded);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.Play, this.onPlay);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.Playing, this.onPlaying);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.Paused, this.onPause);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.Seek, this.onSeeking);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.Seeked, this.onSeeked);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.StallEnded, this.onStallEnded);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.StallStarted, this.onStallStarted);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.SourceUnloaded, this.onSourceUnloaded);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.CueEnter, this.onCueEnter);
        this.bitmovinInstance.on(window.bitmovin.player.PlayerEvent.CueExit, this.onCueExit);
    }

    setVolume = (data) => {
        this.bitmovinInstance && this.bitmovinInstance.setVolume(data);
        if (data !== 0) {
            this.bitmovinInstance && this.bitmovinInstance.unmute();
        }
    }

    onCueEnter = data => {
        if (data) {
            this.playerCallback('SUBTITLETEXT', data.text);
        } else {
            this.playerCallback('SUBTITLETEXT', '');
        }
    };

    onCueExit = () => {
        this.playerCallback('SUBTITLETEXT', '');
    };

    onSourceLoaded = () => {
        this.prevTime = 0;
        this.duration = parseInt(this.bitmovinInstance.getDuration(), 10);
        if (this.playerCallback) {
            this.playerCallback(
                'METADATALOADED',
                this.bitmovinInstance.getDuration(),
                this.bitmovinInstance?.getCurrentTime(),
                this.bitmovinInstance.subtitles.list(),
                this.bitmovinInstance.getAvailableAudio(),
                this.bitmovinInstance.getAvailableVideoQualities(),
            );
            if (this.isVoot) {
                let id = this.setDefaultVideoQuality();
                this.setVideoQuality({id});
            }
        }

    };

    setDefaultVideoQuality = () => {
        let videoQualityList = this.bitmovinInstance.getAvailableVideoQualities();
        const checkAutoIndex = (element) => element.height === 480 ? 480 : 0;
        let videoQuality = videoQualityList.find(checkAutoIndex);
        return videoQuality.id;
    }

    setVideoQuality = (item) => {
        let id = item.id ? item.id : 'auto';
        this.bitmovinInstance.setVideoQuality(id);
    };

    getVideoQuality = () => {
        return this.bitmovinInstance.getVideoQuality();
    }

    onReady = () => {
        this.duration = parseInt(this.bitmovinInstance.getDuration(), 10);
        if (this.playerCallback) {
            this.playerCallback(
                'READY',
                this.bitmovinInstance.getDuration(),
                this.bitmovinInstance?.getCurrentTime(),
            );
            // this.setVideoQuality();
        }
    };

    onMetadataParsed = () => {
        if (this.playerCallback) {
            this.playerCallback('METADATAPARSED');
        }
    };

    onPlay = () => {
        if (this.playerCallback) {
            this.playerCallback('PLAY');
        }
    };

    onPause = () => {
        if (this.playerCallback) {
            this.playerCallback('PAUSE');
        }
    };

    onTimeUpdate = obj => {
        const time = parseInt(obj.time, 10);
        if (this.prevTime !== time && this.playerCallback) {
            this.prevTime = time;
            this.playerCallback('TIMEUPDATE', this.duration, time, 10);
        }
    };

    onWaiting = () => {
        if (this.playerCallback) {
            this.playerCallback('WAITING');
        }
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

    onStallEnded = () => {
        if (this.playerCallback) {
            this.playerCallback('STALLENDED');
        }
    };

    onStallStarted = () => {
        if (this.playerCallback) {
            this.playerCallback('STALLSTARTED');
        }
    };

    onSourceUnloaded = () => {
        if (this.playerCallback) {
            this.playerCallback('SOURCEUNLOADED');
        }
    };

    onVideoPlaybackQualityChanged = () => {
        if (this.playerCallback) {
            this.playerCallback('QUALITYCHANGED');
        }
    };

    onPlaying = () => {
        if (this.playerCallback) {
            this.playerCallback('PLAYING');
        }
    };

    onEnded = () => {
        if (this.playerCallback) {
            this.playerCallback('ENDED');
        }
    };

    onPlaybackError = error => {
        if (this.playerCallback && error) {
            this.playerCallback('ERROR', {type: error.type, message: 'NETWORK'});
        }
    };

    onError = error => {
        switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
                console.log('You aborted the video playback.');
                break;
            case error.MEDIA_ERR_NETWORK:
                console.log(
                    'A network error caused the video download to fail part-way.',
                );
                if (this.playerCallback && error) {
                    this.playerCallback('ERROR', {
                        type: error.type,
                        message: 'NETWORK',
                        code: error.code,
                    });
                }
                break;
            case error.MEDIA_ERR_DECODE:
                console.log('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
                break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                console.log('The video could not be loaded, either because the server or network failed or because the format is not supported.');
                break;
            case PLAYER_CODES.ERROR_2003:
                let errorCode = error?.data?.responseCode;
                let checkResponse = error?.data?.serverResponse ? (!!String.fromCharCode.apply(null, new Uint8Array(error.data.serverResponse))) : false;
                let responseObj = checkResponse ? JSON.parse(String.fromCharCode.apply(null, new Uint8Array(error.data.serverResponse))) : {};

                switch (errorCode) {
                    case PLAYER_CODES.ERROR_403 :
                        // Forbidden: Access is denied.
                        switch (responseObj.code) {
                            case PLAYER_CODES.ERROR_130301:
                                //GEO_BLOCKING
                                this.tvodError(error, responseObj.code, ERROR_MESSAGES.CONTENT_UNAVAILABLE);
                                break;
                            case PLAYER_CODES.ERROR_130302:
                                //PROXY_ERROR
                                this.tvodError(error, responseObj.code, ERROR_MESSAGES.CONTENT_UNAVAILABLE);
                                break;
                            case PLAYER_CODES.ERROR_130401:
                                //CONCURRENCY
                                this.tvodError(error, responseObj.code, ERROR_MESSAGES.CONCURRENCY);
                                break;
                            default:
                                this.tvodError(error, responseObj.code, ERROR_MESSAGES.TVOD_CONTENT_EXPIRED);
                        }
                        break;
                    case PLAYER_CODES.ERROR_401 :
                        //Unauthorized: Access is denied due to invalid credentials.
                        switch (responseObj.code) {
                            case PLAYER_CODES.ERROR_100209:
                                this.renewSession();
                                break;
                            default:
                                this.defaultLoadError(error);
                        }
                        break;
                    default:
                        this.defaultLoadError(error);
                        break;
                }
                break;
            default:
                this.defaultLoadError(error);
                console.log('An unknown error occurred.');
                break;
        }
    };

    defaultLoadError = (error) => {
        if (this.playerCallback && error) {
            this.playerCallback('ERROR', {
                type: error.type,
                message: 'LOAD_ERROR',
                code: error.code,
            });
        }
    }

    tvodError = (error, errorCode, errorMsg) => {
        if (this.playerCallback && error) {
            this.playerCallback('ERROR', {
                type: error.type,
                message: 'TVOD_ERROR',
                code: errorCode,
                errorMsg: errorMsg,
            });
        }
    }

    play = () => {
        this.bitmovinInstance.play();
    };

    pause = () => {
        this.bitmovinInstance.pause();
    };

    rewind = time => {
        if (time <= 0) {
            this.bitmovinInstance.seek(0);
            this.prevTime = 0;
        } else {
            this.bitmovinInstance.seek(this.prevTime - time);
            this.prevTime = this.prevTime - time > 0 ? this.prevTime - time : 0;
        }
    };

    forward = time => {
        if (
            this.bitmovinInstance?.getCurrentTime() + time >=
            this.bitmovinInstance.getDuration()
        ) {
            this.bitmovinInstance.seek(this.duration);
            this.prevTime = this.duration;
        } else {
            this.bitmovinInstance.seek(this.prevTime + time);
            this.prevTime = this.prevTime + time < this.bitmovinInstance.getDuration() ? this.prevTime + time : this.bitmovinInstance.getDuration();
        }
    };

    seek = time => {
        this.bitmovinInstance.seek(time);
        this.prevTime = time;
    };

    stop = () => {
    };

    suspend = () => {
    };

    resume = () => {
    };

    destroy = () => {
        this.playerId = null;
        this.playerCallback = null;
        this.url = null;
        this.prevTime = 0;
        this.duration = 0;
        if (this.bitmovinInstance) {
            this.bitmovinInstance.destroy();
            this.bitmovinInstance = null;
        }
    };

    setSubtitle = (prev, current) => {
        try {
            this.bitmovinInstance.subtitles.disable(prev);
            this.bitmovinInstance.subtitles.enable(current);
        } catch (e) {
            console.log(e);
        }
    };

    setAudio = (id) => {
        this.bitmovinInstance.setAudio(id);
    }

    getDuration = () => {
        return this.duration;
    };

    getCurrentTime = () => {
        return this.prevTime;
    };

    getPlayerInstance = () => {
        return this.bitmovinInstance;
    };

    mute = () => {
        this.bitmovinInstance.mute();
    };

    unmute = () => {
        this.bitmovinInstance.unmute();
    };

    timeShift = (data) => {
        this.bitmovinInstance.timeShift(data);
    }

};

BitmovinPlayer.propTypes = {
    detail: PropTypes.object,
    playDetail: PropTypes.object,
};
