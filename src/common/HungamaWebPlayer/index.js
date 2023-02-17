import React, {Component} from 'react';
import PropTypes from "prop-types";
import {CONSTANT, CONTENTTYPE, LOCALSTORAGE} from "@constants";
import { loadScript } from '@utils/common';
import { getKey } from '@utils/storage';

const loadHungamaScript = (onLoad) =>{
    loadScript('/assets/hungamaPlayer/moment.min.js', 'hungama-moment');
    loadScript('/assets/hungamaPlayer/client.min.js', 'hungama-client');
    loadScript('/assets/hungamaPlayer/crypto-js.min.js', 'hungama-crypto');
    loadScript('/assets/hungamaPlayer/native-shim.js', 'hungama-shim');
    loadScript('/assets/hungamaPlayer/ha.min.js', 'hungama-ha');
    loadScript('/assets/hungamaPlayer/hls.min.js', 'hungama-hls', () => loadHSMain(onLoad));
    
}

const loadHSMain = (onLoad) => {
    loadScript('/assets/hungamaPlayer/hungamaplayer.min.js', 'hungamaPlayer', onLoad);
}
export default class HungamaWebPlayer extends Component {

    constructor(configObj) {
        super(configObj);
        this.props = configObj.props;
        this.playerCallback = configObj.playerCallback;
        this.partnerUniqueId = configObj.partnerUniqueId;
        this.prevTime = 0;
        this.ready = 0
        loadHungamaScript(() => this.initPlayer.call(this));
    }

    initPlayer = () => {
        try{
        HungamaPlayer.HungamaPlayerManager.initialize();
        HungamaPlayer.HungamaPlayerManager.getInstance().setPartnerUniqueId(this.partnerUniqueId);
        this.definePlayerView();
        // this.onLoad()
        setTimeout(() => this.onLoad(), 2000);
        }
        catch(e){
            this.handleError(e);
        }
    }

    definePlayerView = () => {
        customElements.whenDefined('hungama-player-view').then(() => {
            const playerView = document.createElement('hungama-player-view');
            playerView.id = 'player-view';
            const playerContainer = document.getElementById('player-container');
            playerContainer.appendChild(playerView);
          //  console.log('hungama player ready!');
        });
    }

    onLoad = () => {
        let content = {};

        content.title = ''; //"Garmi";
        content.id = this?.props?.detail?.providerContentId; //"50844790"
        content.type = this.setHungamaContentType(); //HungamaWebPlayer.ContentType.MusicVideo;
        content.posterURL = ""; //"https://images.hungama.com/c/1/0e4/4fc/50844790/50844790_700x394.jpg";

        try {
            HungamaPlayer.HungamaPlayerManager.getInstance().load(content, {
                onContentLoadSuccess: () => {
                    this.startPlayback();
                },
                onContentLoadFailed: (error) => {
                    this.handleError(error);
                },
            });
        } catch (err) {
            this.handleError(err);
        }
    };

    startPlayback = () => {
        try {
            let playerView = document.getElementById("player-view");
            
            HungamaPlayer.HungamaPlayerManager.getInstance().initializePlayer();
            HungamaPlayer.HungamaPlayerManager.getInstance().preparePlayer(playerView, {
                onPlayerStateChanged: (state) => {
                    //console.log("Player State:" + state);
                    switch (state) {
                        case HungamaPlayer.PlayerState.LOADING:
                            this.onWaiting();
                            //console.log('loading');
                            break;
                        case HungamaPlayer.PlayerState.BUFFERING:
                            this.onWaiting();
                            //console.log('buffering');
                            break;
                        case HungamaPlayer.PlayerState.READY:
``                           // console.log("Playing");
                            this.onSourceLoaded();
                            const hungamaPlayed = getKey(LOCALSTORAGE.HUNGAMA_PLAYED);
                            this.onReady();
                            if(!hungamaPlayed){
                                this.onPlaying();
                            }
                            //this.play();
                            break;
                        case HungamaPlayer.PlayerState.ENDED:
                            console.log("Ended");
                            this.unload();
                            break;
                    }
                },
                onPlayerTimeUpdate: (obj) => {
                    console.log("time update: " + obj);
                    const time = parseInt(obj, 10);
                    console.log('prevtime, time', this.prevTime, time);
                    if (this.playerCallback && HungamaPlayer?.HungamaPlayerManager?.getInstance().isPlaying()) {
                        this.prevTime = time;
                        this.playerCallback('TIMEUPDATE', this.duration, time, 10);
                    }
                },
                onPlayerError: (error) => {
                    this.handleError(error);
                },
            });
            HungamaPlayer.HungamaPlayerManager.getInstance().start();
        } catch (err) {
            console.error(err);
            this.handleError(err);
        }
    }

    handleError = (error) => {
        console.log("ErrorCode:" + error.code);
        switch (error.code) {
            case 1020:
                console.log("PartnerId/HungamaIdNotAvailable");
                this.defaultLoadError(error);
                break;
            case 1028:
                console.log(
                    'A network error caused the video download to fail part-way.',
                );
                if (this.playerCallback && error) {
                    this.playerCallback('ERROR', {
                        type: error.name.toLowerCase(),
                        message: 'NETWORK',
                        code: error.code,
                    });
                }
                break;
            default:
                console.log(error.message);
                this.defaultLoadError(error);
                break;
        }
    };

    defaultLoadError = (error) => {
        if (this.playerCallback && error) {
            this.playerCallback('ERROR', {
                type: error.name.toLowerCase(),
                message: 'LOAD_ERROR',
                code: error.code,
            });
        }
    }

    onSourceLoaded = () => {
        this.prevTime = 0;
        this.duration = parseInt(HungamaPlayer.HungamaPlayerManager.getInstance().getTotalDuration(), 10);
        if (this.playerCallback) {
            this.playerCallback(
                'METADATALOADED',
                HungamaPlayer.HungamaPlayerManager.getInstance().getTotalDuration(),
                HungamaPlayer.HungamaPlayerManager.getInstance().getCurrentPosition(),
                HungamaPlayer.HungamaPlayerManager.getInstance().getSubtitleLanguages(),
                [],
                this.getHungamaVideoQuality(),
            );
            // this.setVideoQuality();
        }
    };

    onReady = () => {
        if(this.ready===1){
            return;
        }
        this.duration = parseInt(HungamaPlayer.HungamaPlayerManager.getInstance().getTotalDuration(), 10);
        if (this.playerCallback) {
            this.playerCallback(
                'READY',
                HungamaPlayer.HungamaPlayerManager.getInstance().getTotalDuration(),
                HungamaPlayer.HungamaPlayerManager.getInstance().getCurrentPosition(),
            );
        }
        this.ready = 1;
    };

    play = () => {
        let isPlaying = HungamaPlayer.HungamaPlayerManager.getInstance().isPlaying();
        !isPlaying && HungamaPlayer.HungamaPlayerManager.getInstance().togglePlayPause();
    }

    unload = () => {
        HungamaPlayer.HungamaPlayerManager.getInstance().stop();
        HungamaPlayer.HungamaPlayerManager.getInstance().releasePlayer();
        this.onEnded();
    }

    onEnded = () => {
        if (this.playerCallback) {
            this.playerCallback('ENDED');
        }
    };

    setHungamaContentType = () => {
        if (this.props.detail) {
            let contentType = this.props.detail.contentType;
            if (contentType === CONTENTTYPE.TYPE_MOVIES || contentType === CONTENTTYPE.TYPE_CUSTOM_MOVIES_DETAIL) {
                return HungamaPlayer.ContentType.Movie;
            } else if (contentType === CONTENTTYPE.TYPE_WEB_SHORTS || contentType === CONTENTTYPE.TYPE_CUSTOM_WEB_SHORTS_DETAIL) {
                return HungamaPlayer.ContentType.TVShowEpisode;
            } else if (contentType === CONTENTTYPE.TYPE_TV_SHOWS || contentType === CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL) {
                return HungamaPlayer.ContentType.TVShowEpisode;
            } else
                return HungamaPlayer.ContentType.Movie;
        }
        return HungamaPlayer.ContentType.Movie;
    }

    setSubtitle = (initalState = false) => {
        if (!HungamaPlayer.HungamaPlayerManager.getInstance().isSubtitleAvailable()) {
            return;
        }
        if (initalState) {
            if (HungamaPlayer.HungamaPlayerManager.getInstance().isSubtitleEnabled()) {
                HungamaPlayer.HungamaPlayerManager.getInstance().setSubtitleEnabled(!HungamaPlayer.HungamaPlayerManager
                    .getInstance().isSubtitleEnabled());
            }
        } else {
            HungamaPlayer.HungamaPlayerManager.getInstance().setSubtitleEnabled(!HungamaPlayer.HungamaPlayerManager
                .getInstance().isSubtitleEnabled());
        }
    }

    setVolume = (data) => {
        let isMuted = HungamaPlayer.HungamaPlayerManager.getInstance().isMuted();
        if(isMuted)
        {
            this.setMuted(!isMuted)
        }
        HungamaPlayer.HungamaPlayerManager.getInstance().setVolume(data);
    }

    setVideoQuality = (item) => {
        HungamaPlayer.HungamaPlayerManager.getInstance().setPlaybackVariant(item);
        this.onVideoPlaybackQualityChanged();
    }

    pause = () => {
        let isPlaying = HungamaPlayer.HungamaPlayerManager.getInstance().isPlaying();
        isPlaying && HungamaPlayer.HungamaPlayerManager.getInstance().togglePlayPause() && this.onPause();
        return isPlaying;
    };

    destroy = () => {
        this.playerCallback = null;
        this.url = null;
        this.prevTime = 0;
        this.duration = 0;
        this.unload();
    };

    getDuration = () => {
        return this.duration;
    };

    seek = time => {
        HungamaPlayer.HungamaPlayerManager.getInstance().seekTo(time);
        this.prevTime = time;  
    };

    getCurrentTime = () => {
        return this.prevTime;
    };

    forward = time => {
        if (
            HungamaPlayer.HungamaPlayerManager.getInstance().getCurrentPosition() + time >=
            HungamaPlayer.HungamaPlayerManager.getInstance().getTotalDuration()
        ) {
            HungamaPlayer.HungamaPlayerManager.getInstance().seekTo(this.duration);
            this.prevTime = this.duration;
        } else {
            HungamaPlayer.HungamaPlayerManager.getInstance().seekTo(this.prevTime + time);
            this.prevTime = this.prevTime + time < HungamaPlayer.HungamaPlayerManager.getInstance().getTotalDuration() ?
                this.prevTime + time : HungamaPlayer.HungamaPlayerManager.getInstance().getTotalDuration();
        }
    };

    rewind = time => {
        if (time <= 0) {
            HungamaPlayer.HungamaPlayerManager.getInstance().seekTo(0);
            this.prevTime = 0;
        } else {
            HungamaPlayer.HungamaPlayerManager.getInstance().seekTo(this.prevTime - time);
            this.prevTime = this.prevTime - time > 0 ? this.prevTime - time : 0;
        }
    };

    onPlaying = () => {
        if (this.playerCallback) {
            this.playerCallback('PLAYING');
        }
    };

    onPause = () => {
        if (this.playerCallback) {
            this.playerCallback('PAUSE');
        }
    };

    onVideoPlaybackQualityChanged = () => {
        if (this.playerCallback) {
            this.playerCallback('QUALITYCHANGED');
        }
    };

    isMuted = (unMute) => {
        let isMuted = HungamaPlayer.HungamaPlayerManager.getInstance().isMuted();
        // isMuted && unMute && this.setMuted(false);
        if(unMute === isMuted){
        this.setMuted(!unMute)
        }
    }

    setMuted = (mute = false) => {
        // 0 and false mean == mute 
        HungamaPlayer.HungamaPlayerManager.getInstance().setMuted(mute);
    }

    getHungamaVideoQuality = () => {
        let videoQualityArr = HungamaPlayer.HungamaPlayerManager.getInstance().getPlaybackVarints();
        if (videoQualityArr?.length > 0) {
            videoQualityArr.map((i, index) => {
                if (videoQualityArr[index] === 0) {
                    videoQualityArr[index] = CONSTANT.VIDEOQUALITY.AUTO;
                } else if (videoQualityArr[index] <= 100000) {
                    videoQualityArr[index] = "144p"
                } else if (videoQualityArr[index] > 100000 && videoQualityArr[index] <= 400000) {
                    videoQualityArr[index] = "240p"
                } else if (videoQualityArr[index] > 400000 && videoQualityArr[index] <= 750000) {
                    videoQualityArr[index] = "360p"
                } else if (videoQualityArr[index] > 750000 && videoQualityArr[index] <= 1000000) {
                    videoQualityArr[index] = "480p"
                } else if (videoQualityArr[index] > 1000000 && videoQualityArr[index] <= 1600000) {
                    videoQualityArr[index] = "576p"
                } else if (videoQualityArr[index] > 1600000 && videoQualityArr[index] <= 3000000) {
                    videoQualityArr[index] = "720p"
                } else if (videoQualityArr[index] > 3000000 && videoQualityArr[index] <= 6500000) {
                    videoQualityArr[index] = "1080p"
                } else {
                    videoQualityArr[index] = "1080p"
                }
            });
        }
        return videoQualityArr;
    }

    onWaiting = () => {
        if (this.playerCallback) {
            this.playerCallback('WAITING');
        }
    };
}

HungamaWebPlayer.propTypes = {
    detail: PropTypes.object,
}