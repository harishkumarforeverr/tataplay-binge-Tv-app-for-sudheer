import React, { Fragment } from 'react';
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import get from "lodash/get";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import isEmpty from 'lodash/isEmpty';
import _ from "lodash";

import Button from "@common/Buttons";
import { closePopup, openPopup } from "@common/Modal/action";

import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import { URL } from "@constants/routeConstants";
import { BROWSER_TYPE } from "@constants/browser";
import { ERROR_MESSAGES, GENERIC_DEVICE_OS, PLAY_AUTH_TYPE, PROVIDER_NAME, SHEMAROO_ANALYTICS_EVENT } from "@constants/playerConstant";
import {
    CONSTANT,
    CONTENTTYPE,
    CONTRACT,
    LEARN_ACTION_TYPE,
    LOCALSTORAGE,
    MESSAGE,
    PARTNER_SUBSCRIPTION_TYPE,
    PLAYER_SOURCE,
    PLAYER_URL_TYPE,
} from "@constants";

import {
    clearContent,
    fetchContinueWatchingDetails,
    fetchPIData,
    getShemarooContent,
    trackPlanetMarathiAnalytics,
    trackShemarooAnalytics,
    fetchLiveContentData,
    setLiveContentData,
} from "@containers/PIDetail/API/actions";
import PlayerFooter from "@containers/PlayerWeb/PlayerFooter";
import PlayerControls from "@containers/PlayerWeb/PlayerControls";
import PlayerNext from "@containers/PlayerWeb/PlayerNext";
import {
    addWatchlist,
    checkPrevNextEpisode,
    checkWatchlistContent,
    generateToken,
    getChaupalUrl,
    getGenericDrm,
    getLionsGatePlaybackData,
    getHoiChoiToken,
    getPlanetMarathiUrl,
    getSonyToken,
    getVideoQualityOfPlayer,
    getVootUrl,
    setContinueWatching,
    setEpiconDocubayAnalyticsData,
    setLA,
    setPlayerAPIError,
    setLionsgateAnalyticsData,
    getDigitalFeedStream,
} from "@containers/PlayerWeb/APIs/actions";
import { getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";

import { hideFooter, hideHeader, hideMainLoader, showMainLoader } from "@src/action";


import { getPlayerDetail } from "@utils/player";
import { PLAY_ACTION } from "@utils/constants";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import { getSystemDetails } from "@utils/browserEnvironment";
import { deleteKey, getKey, setKey } from "@utils/storage";
import {
    checkPlayBackEligibility,
    getAnalyticsContentType,
    getAnalyticsRailCategoryRegular,
    getAnonymousId,
    getContentLanguage,
    getDeviceId,
    getEnvironmentConstants,
    getPlayAction,
    getPrimaryLanguage,
    getShemarooAnalyticsData,
    getSmartUrl,
    getTrailerUrl,
    isFreeContentEvent,
    isMobile,
    isUserloggedIn,
    logoutHandling,
    openSubscriptionPopup,
    playContentEventTrack,
    safeNavigation,
    triggerLearnAction,
    isFreeContentMixpanel,
    setLALogic,
    getAllGenricProvider,
    checkLivePlaybackEligibility,
    convertEpochTimeStamp,
} from "@utils/common";

import BitmovinPlayer from "../../common/BMPlayer";

import './style.scss';
import HungamaWebPlayer from "@common/HungamaWebPlayer";
import ErosWebPlayer from "@common/ErosWebPlayer";
import MxPlayer from "@common/MXPlayer";


import { openLoginPopup } from "@containers/Login/APIs/actions";
import { clearAPIRequestCache } from '@services';
import SonyWebPlayer from "@common/SonyWebPlayer";
import { resetSeasonData } from "@components/Seasons/APIs/actions";
import { getParentContentData, isLivePlayable } from "@containers/PIDetail/PIDetailCommon";
import appsFlyerConfig from '@utils/appsFlyer';
import APPSFLYER from '@utils/constants/appsFlyer';
import trackEvent from '@utils/trackEvent';
import firebase from '@utils/constants/firebase';
import MainSeo from '@common/MainSeo';
import {TSAnalyticsMitigtionSDK} from 'tatasky-analytics-mitigation';
import CryptoJS, { enc } from 'crypto-js';

class Player extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            playbackUrl: null,
            play: true,
            pause: false,
            playerDuration: "00:00:00",
            playerCurrentTime: 0,
            videoPercent: 0,
            showControls: false,
            enlarge: false,
            showHeader: false,
            showBack: true,
            isLoader: false,
            addedWatchlist: false,
            playNextBack: false,
            showWatchlist: false,
            showSubtitle: false,
            showVideoQuality: false,
            subtitleText: "",
            showFooter: false,
            volumePercent: false,
            volumeBarControls: false,
            volumeIcon: false,
            isLoadError: false,
            playerErrorMessage: "",
            id: null,
            playerSource: {},
            isNetworkError: false,
            isPartnerURLError: false,
            partnerErrorHeading: "",
            partnerErrorMessage: "",
            partnerErrorCode: "",
            activeSubtitleItem: {},
            activeAudioItem: {},
            playerAPIError: false,
            isSeeking: false,
            lastPlayedDetails: {},
            favoriteStatus: false,
            isTrailer: false,
            shemarooHLSTrailer: false,
            isHungama: false,
            isErosnow: false,
            isSonyLiv: false,
            isPlanetMarathi: '',
            genricAuthType: '',
            isMxPlayer: false,
            isLiveContent: false,
        }
        this.videoQualityList = null;
        this.audioList = null;
        this.subtitleList = null;
        this.ended = false;
        this.contentTypeVal = '';
        this.playback = true;
        this.watchedSeconds = 0;
        this.bufferTime = 0;
        this.pauseCount = 0;
        this.resumeContent = 0;
        this.startTime = 0;
        this.playerState = 'play';
        this.refresh = false;
        this.initialLoad = false;
        this.systemDetail = '';
        this.previousTimer = 0;
        this.kid='';
        this.drmToken='';
        this.sdk = new TSAnalyticsMitigtionSDK();
        /*
        This variable will track the current time value for hungama content and will be reset when cw api hit is made at intervals
         */
        this.currentTimeDuration = 0;
        this.pmPlaybackUrl = '';
        this.previousTimer = 0;
        this.liveTimer = 0;
        this.retry = 0;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.id && nextProps.match.params.id !== prevState.id && !prevState.updated) {
            return { id: nextProps.match.params.id, updated: true }
        }
        return null;
    }

    async componentDidMount() {
        const { hideHeader, hideFooter, showMainLoader } = this.props;
        showMainLoader();
        hideHeader(true);
        hideFooter(true);

        this.systemDetail = getSystemDetails();
        clearAPIRequestCache();
        await this.detailApiCall();
        isUserloggedIn() && await this.trackShemarooAnalyticsData(SHEMAROO_ANALYTICS_EVENT.PLAY);
        this.trackPlanetMarathiAnalytics(SHEMAROO_ANALYTICS_EVENT.PLAY);
        this.addPlayerWindowEvents();
    }

    componentDidUpdate = async (previousProps) => {
        let element = document.getElementsByClassName('current-time')[0];
        if (element && this.resumeBool) {
            element.style.display = 'none'
        }
        if (this.state.updated) {
            this.props.showMainLoader();
            setTimeout(() => this.setState({
                isLoader: true,
                volumePercent: '',
                volumeIcon: '',
                subtitleText: '',
                showControls: false,
                showFooter: false,
            }), 10);
            this.videoQualityActiveIndex = 0;
            this.subtitleActiveIndex = 0;
            this.audioActiveIndex = 0;
            !this.state.isMxPlayer && this.destroy();
            await this.detailApiCall();
        }
        if (!this.state.isTrailer) {
            this.trackPlayerProgressEvent();
        }
        this.previousTimer = this.state.videoPercent
        if (previousProps.playerApiError !== this.props.playerApiError) {
            this.player && this.player.destroy();
            setTimeout(() => this.setState({ playerAPIError: true }), 10);
        }

    }

    componentWillUnmount = async () => {
        const { hideHeader, hideFooter, showMainLoader, hideMainLoader, liveMetaData, detail } = this.props;
        hideHeader(false);
        hideFooter(false);

        this.removePlayerWindowEvents();
        this.props.clearContent();
        this.props.resetSeasonData();

        const {isTrailer, isLiveContent} = this.state;

        if (this.watchedSeconds > 0 && !isTrailer) {
            showMainLoader();
            await this.setLionsgateAnalyticsData();
            await this.setEpiconDocubayAnalyticsData();
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.PLAY_CONTENT, this.playContentObj(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.PLAY_CONTENT, this.playContentObj(MOENGAGE));
            let data = isLiveContent ? liveMetaData : detail;
            playContentEventTrack(data);
            trackEvent.playPremiumContent(this.getFireBaseData())
            hideMainLoader();
        }
        this.sdk.unregisterApplication();
        this.sdk=null;
        !this.state.isMxPlayer && this.player && this.player.destroy();
        this.player = null;
        deleteKey(LOCALSTORAGE.PLAYED);
        deleteKey(LOCALSTORAGE.INTERNET_AVAILABLE);
        deleteKey(LOCALSTORAGE.TRAILER_RESUME_TIME);
        deleteKey(LOCALSTORAGE.HUNGAMA_PLAYED);
        deleteKey(LOCALSTORAGE.EROS_PLAYED);
        deleteKey(LOCALSTORAGE.SONY_PLAYED);
        this.props.getVideoQualityOfPlayer(CONSTANT.VIDEOQUALITY.AUTO);
        document?.fullscreen && document.exitFullscreen();
    }

    trackPlayerProgressEvent() {
        if (!this.previousTimer && this.state.lastPlayedDetails?.secondsWatched) {
            return;
        }
        if (this.state.videoPercent > 50 && this.previousTimer <= 50) {
            const data = this.getPlaybackAnalyticsData(APPSFLYER);
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.PLAY_CONTENT_PREMIUM_VTR50, data);
            trackEvent.playContentPremiumFiftyPrecent(data)
        }
        if (this.state.videoPercent > 75 && this.previousTimer <= 75) {
            const data = this.getPlaybackAnalyticsData(APPSFLYER);
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.PLAY_CONTENT_PREMIUM_VTR75, data);
            trackEvent.playContentPremiumSeventyPrecent(data)
        }
    }

    trackPlanetMarathiAnalytics = async (eventName) => {
        const { detail, match: { params: { contentType } }, trackPlanetMarathiAnalytics } = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let providerName = detail?.provider, eventType, eventID = `${getDeviceId()}${userInfo.sId}`;

        if (providerName?.toLowerCase() === PROVIDER_NAME.PLANET_MARATHI) {
            let signedUrl = isEmpty(this.pmPlaybackUrl) ? this.getPlanetMarathiPlaybackUrl(contentType) : this.pmPlaybackUrl;
            if (eventName === SHEMAROO_ANALYTICS_EVENT.PLAY) {
                eventType = 'play'
            } else if (eventName === SHEMAROO_ANALYTICS_EVENT.BUFFERING) {
                eventType = 'buffer';
            } else if (eventName === SHEMAROO_ANALYTICS_EVENT.REGULAR_INTERVAL) {
                eventType = 'playback';
            }
            let payload = {
                "eventID": eventID,
                "eventType": eventType,
                "signedUrl": signedUrl,
                "timestamp": Math.round(Date.now() / 1000),
                "entityID": detail.providerContentId,
            };

            await trackPlanetMarathiAnalytics(payload);
        }
    }

    setEpiconDocubayAnalyticsData = async () => {
        const { setEpiconDocubayAnalyticsData, currentSubscription, detail } = this.props;

        let providerName = detail?.provider;
        let analyticsInfo = currentSubscription?.analyticsInfo && currentSubscription?.analyticsInfo[providerName?.toUpperCase()];
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let epiconDocubayPartner = [PROVIDER_NAME.EPICON, PROVIDER_NAME.DOCUBAY].includes(providerName?.toLowerCase());

        if (epiconDocubayPartner && analyticsInfo?.enabled && !isEmpty(analyticsInfo?.partnerId) && !isEmpty(analyticsInfo.deviceId) && !isEmpty(detail)) {
            let data = {
                contentType: detail.contentType,
                duration: detail.duration,
                partnerContentType: detail.partnerContentType,
                partnerUserID: analyticsInfo?.partnerId,
                providerContentID: detail.providerContentId,
                providerName: providerName,
                subscriberID: userInfo.sId,
                title: detail.title,
            };

            await setEpiconDocubayAnalyticsData(providerName, analyticsInfo?.deviceId, data)
        }
    }

    setLionsgateAnalyticsData = async () => {
        const { setLionsgateAnalyticsData, currentSubscription, detail ,match: { params: { contentType } }} = this.props;

        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        this.systemDetail = getSystemDetails();
        let partnerUniqueId = currentSubscription?.partnerUniqueIdInfo?.[detail?.provider?.toUpperCase()]?.partnerUniqueId;
        let { data, index } = JSON.parse(getKey(LOCALSTORAGE?.SUBTITLE)) || '';
        let getSubtitleLang = data ? this.subtitleList[index].lang : '';
        if ([PROVIDER_NAME.LIONS_GATE].includes(detail?.provider?.toLowerCase())) {
        let dataLions = {
                "content_id": detail.providerContentId,
                "title": detail.title,
                "genre":detail.genre.join(),
                "category":contentType || '',
                "video_language":getContentLanguage(detail?.audio),
                "video_length_in_seconds":detail.duration,
                "is_trailer":this.state.isTrailer,
                "unique_user_id":partnerUniqueId || '',
                "subtitle": this.subtitleSet ? 'on':'',
                "subtitle_language":getSubtitleLang,
                "seconds_watched":  this.state.playerCurrentTime || 0,
                "percentage_complete": `${this.state.videoPercent.toFixed(2)}%`,
                "subscription_status": currentSubscription?.subscriptionStatus,
                "source": 'TSMOBILE',
                "device_type": userInfo?.deviceList[0]?.deviceType,
                "device_os":this.systemDetail.os,
                "partner": detail?.provider,
            };
            await setLionsgateAnalyticsData(dataLions)
        }
    }

    getFireBaseData = () => {
        const { detail, match: { params: { contentType } }, liveChannelMetaData } = this.props;
        let title = contentType === CONTENTTYPE.TYPE_MOVIES ? detail?.vodTitle || detail?.title : (detail?.title || detail?.vodTitle || detail?.brandTitle) || liveChannelMetaData?.title;
        let durationWatched = this.player.getCurrentTime();
        let { updatedContentType } = getParentContentData(detail);

        let data = {
            [`${firebase.PARAMETER.DURATION_SECONDS}`]: durationWatched.toFixed(2),
            [`${firebase.PARAMETER.CONTENT_LANGUAGE}`]: getContentLanguage(detail?.audio),
            [`${firebase.PARAMETER.CONTENT_TITLE}`]: title,
            [`${firebase.PARAMETER.CONTENT_TYPE}`]: getAnalyticsContentType(contentType),
            [`${firebase.PARAMETER.DURATION_SECONDS}`]: durationWatched.toFixed(2),
            [`${firebase.PARAMETER.DURATION_MINUTES}`]: (durationWatched / 60).toFixed(2),
            [`${firebase.PARAMETER.CONTENT_CATEGORY}`]: updatedContentType,
            [`${firebase.PARAMETER.CONTENT_PARENT_TITLE}`]: detail?.brandTitle || detail?.vodTitle,
            [`${firebase.PARAMETER.PARTNER_NAME}`]: detail?.provider,
            [firebase.PARAMETER.CONTENT_GENRE]: detail?.genre?.join()
        }
        return data
    }

    removePlayerWindowEvents = () => {
        window.removeEventListener('popstate', this.redirectionCase);
        window.removeEventListener('mousemove', this.mouseMoveEvent, false);
        window.removeEventListener('contextmenu', this.rightClickEvent);
    };

    addPlayerWindowEvents = () => {
        window.addEventListener('popstate', this.redirectionCase);
        window.addEventListener('mousemove', this.mouseMoveEvent);
        window.addEventListener('contextmenu', this.rightClickEvent)

        document.addEventListener("fullscreenchange", () => {
            if (document.fullscreenElement) {
                this.setState({
                    enlarge: true,
                    showBack: false,
                })
            } else {
                this.setState({
                    enlarge: false,
                    showBack: true,
                })
            }
        })
        document.addEventListener("keydown", this.detectSpacePresent, false);
    };

    setVolumePercent = () => {
        let volumeIconState;
        if (getKey(LOCALSTORAGE.PLAYER_MUTE) === null) {
            volumeIconState = 'icon-mute';
        } else {
            let mute = JSON.parse(getKey(LOCALSTORAGE.PLAYER_MUTE));
            // volumeIconState = !mute ? 'icon-percent' : 'icon-mute'; //refactor code

            volumeIconState = mute ? 'icon-percent' : 'icon-mute';
        }

        this.setState(() =>
            this.setState((prevState) => {
                prevState.volumeIcon = prevState.volumeIcon ? prevState.volumeIcon : volumeIconState;

                // prevState.volumeIcon == volumeIconState ? prevState.volumeIcon : volumeIconState; //refactor code
                return {
                    volumeIcon: prevState.volumeIcon === 'icon-mute' ? 'icon-percent' : 'icon-mute',
                    volumePercent: prevState.volumeIcon === 'icon-mute' ? '100' : '0',
                }
                // return {
                //     volumeIcon: volumeIconState,
                //     volumePercent: volumeIconState !== 'icon-mute' ? '100' : '0',
                // }  //refactor code
            }))
    }

    rightClickEvent = (e) => {
        e.preventDefault();
    }

    mouseMoveEvent = () => {
        if (!this.ended && !this.state.showWatchlist && !this.state.updated && !this.props.isLoading) {
            this.setState({ showControls: true, showHeader: true, showFooter: true });
            this.controlsVisibility();
        }
    }

    redirectionCase = () => {
        if (location.href.includes('player')) {
            this.destroy();
            this.playerBack();
        }
    }
    getAnalyticsData = (analytics = MIXPANEL, playerInfoNeeded = false) => {
        let { detail, match: { params: { contentType } }, location, currentSubscription, playDetail, liveMetaData, liveChannelMetaData } = this.props;
        let isLiveContent = false;
        if(contentType?.toUpperCase() === CONTENTTYPE.TYPE_LIVE) {
            isLiveContent = true;
            detail = liveMetaData;
        }
        const railTitle = get(location.state, "railTitle");
        let title = contentType === CONTENTTYPE.TYPE_MOVIES ? detail?.vodTitle || detail?.title : (detail?.title || detail?.vodTitle || detail?.brandTitle);

        let actor = detail?.actor.join() || '';
        const source = get(location.state, 'source');
        const railPosition = get(location.state, "railPosition");
        const endTime = new Date().toISOString();
        const contentPosition = get(location.state, "conPosition");
        let { updatedContentType } = getParentContentData(detail);
        const { configType, sectionType, contentSectionSource } = location?.state || {};
        let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || [];
        const contentAuth = (isFreeContentEvent(playDetail?.contractName, partnerInfo, detail?.partnerId, currentSubscription?.subscriptionStatus) || (detail?.partnerSubscriptionType?.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()));
        let isFreeContent = isFreeContentMixpanel(detail);
        // let title = contentType === CONTENTTYPE.TYPE_MOVIES ? detail.vodTitle || detail.title : (detail.title || detail.vodTitle || detail.brandTitle);
        let commonData = {
            [`${analytics.PARAMETER.CONTENT_GENRE}`]: detail?.genre.join(),
            [`${analytics.PARAMETER.CONTENT_LANGUAGE}`]: getContentLanguage(detail?.audio),
            [`${analytics.PARAMETER.RAIL}`]: railTitle || '',
            [`${analytics.PARAMETER.CONTENT_GENRE_PRIMARY}`]: detail?.genre[0] || "",
            [`${analytics.PARAMETER.CONTENT_LANGUAGE_PRIMARY}`]: getPrimaryLanguage(detail?.audio),
            [`${analytics.PARAMETER.RELEASE_YEAR}`]: detail?.releaseYear || "",
            [`${analytics.PARAMETER.DEVICE_TYPE}`]: MIXPANEL.VALUE.WEB,
            [`${analytics.PARAMETER.FREE_CONTENT}`]: isFreeContent,
            [`${analytics.PARAMETER.CONTENT_RATING}`]: detail?.masterRating,
            [`${analytics.PARAMETER.PAGE_NAME}`]: this.props.location?.state?.source,
            [`${analytics.PARAMETER.CONTENT_TITLE}`]: isLiveContent ? liveChannelMetaData?.channelName : title,
            [`${analytics.PARAMETER.ACTOR}`]: actor,
            [`${analytics.PARAMETER.SOURCE}`]: source,
            [`${analytics.PARAMETER.CONTENT_PARTNER}`]: isLiveContent ? MIXPANEL.VALUE.TATAPLAY : detail?.provider,
            [`${analytics.PARAMETER.RAIL_POSITION}`]: railPosition,
            [`${analytics.PARAMETER.PACK_PRICE}`]: currentSubscription?.amountValue || MIXPANEL.VALUE.FREEMIUM,
            [`${analytics.PARAMETER.PACK_NAME}`]: currentSubscription?.productName || MIXPANEL.VALUE.FREEMIUM,
            [`${analytics.PARAMETER.RAIL_TYPE}`]: configType,
            [`${analytics.PARAMETER.CONTENT_TYPE}`]: contentSectionSource,
            [`${analytics.PARAMETER.RAIL_CATEGORY}`]: getAnalyticsRailCategoryRegular(sectionType, analytics),
            [`${analytics.PARAMETER.CONTENT_AUTH}`]: contentAuth ? MIXPANEL.VALUE.CAPITALIZED_YES : MIXPANEL.VALUE.CAPITALIZED_NO,
            [`${analytics.PARAMETER.CONTENT_CATEGORY}`]: updatedContentType,
            [`${analytics.PARAMETER.CONTENT_POSITION}`]: contentPosition,
            [`${analytics.PARAMETER.CONTENT_PARENT_TITLE}`]: isLiveContent ? liveChannelMetaData?.channelName : (detail?.brandTitle || detail?.vodTitle),
            [`${analytics.PARAMETER.AUTO_PLAYED}`]: MIXPANEL.VALUE.CAPITALIZED_NO,
            [`${analytics.PARAMETER.LIVE_CONTENT}`]: MIXPANEL.VALUE.CAPITALIZED_NO,
        }
        if (playerInfoNeeded) {
            let durationWatched = !this.state.isMxPlayer && !isLiveContent && this.player?.getCurrentTime() || 0;
            const seekBarProgress = !this.state.isMxPlayer && !isLiveContent && (durationWatched / this.player?.getDuration() * 100).toFixed(0) || 0;
            commonData = {
                ...commonData,
                [`${analytics.PARAMETER.START_TIME}`]: this.startTime || 0,
                [`${analytics.PARAMETER.STOP_TIME}`]: endTime,
                [`${analytics.PARAMETER.BUFFER_DURATION_SECONDS}`]: this.bufferTime.toFixed(2) || 0,
                [`${analytics.PARAMETER.BUFFER_DURATION_MINUTES}`]: (this.bufferTime / 60).toFixed(2) || 0,
                [`${analytics.PARAMETER.NUMBER_OF_PAUSE}`]: this.pauseCount || 0,
                [`${analytics.PARAMETER.NUMBER_OF_RESUME}`]: this.resumeContent || 0,
                [`${analytics.PARAMETER.VIDEO_QUALITY}`]: this.props.videoQuality,
                [`${analytics.PARAMETER.SEEK_BAR_PROGRESS}`]: !isLiveContent ? (seekBarProgress || 0) : '',
            }
        }
        return commonData;
    }


    initialBufferObj = () => {
        let mixpanelData = this.getAnalyticsData(MIXPANEL, true);
        return {
            ...mixpanelData
        };
    }

    playContentObj = () => {
        return this.getAnalyticsData(MIXPANEL, true);
    }

    detectSpacePresent = (e) => {
        if (e.keyCode === 32) {
            this.playerState === "play" ? this.pause() : this.play();
            this.controlsVisibility();
        }
    }

    detailApiCall = async (idExist, contentTypeExist) => {
        try {
            let {
                fetchPIData, match: { url, params: { id, contentType } }, checkPrevNextEpisode, playDetail,
                currentSubscription, fetchContinueWatchingDetails, history, fetchLiveContentData, liveMetaData,
                liveChannelMetaData,
            } = this.props;
            let isTrailer = url.includes(URL.TRAILER);
            let idItem = idExist || id;
            let contentTypeItem = contentTypeExist || contentType;

            if (url.indexOf('seriesDetail') !== -1) {
                this.contentTypeVal = this.setContentType(contentTypeItem)
            } else {
                this.contentTypeVal = contentTypeItem;
            }

            this.setState({
                id: idItem,
                updated: false,
                isTrailer: isTrailer,
            });

            const isLiveDetail = contentType?.toUpperCase() === CONTENTTYPE.TYPE_LIVE;
            this.setState({
                isLiveContent: isLiveDetail,
            });

            if(isLiveDetail) {
                await fetchLiveContentData(id);
                let partnerPlayable = await checkLivePlaybackEligibility(openPopup, closePopup, openLoginPopup, liveMetaData) && isLivePlayable(id);

                isUserloggedIn() && isEmpty(currentSubscription) && await this.props.getCurrentSubscriptionInfo();

                if (partnerPlayable) {
                    await this.playableUrl(id, contentType);
                } else {
                    this.props.hideMainLoader('PLAYERWEB'); 
                    openSubscriptionPopup({ currentSubscription, liveChannelMetaData, history });
                }
                
                this.setState({
                    videoPercent: 100,
                });

            } else {
                await fetchPIData(idItem, this.contentTypeVal);
                 /** calling fetchContinueWatchingDetails here with parameters passed in URL from PI page**/
                await fetchContinueWatchingDetails(idItem, this.contentTypeVal, this.props.detail?.partnerId);

                this.setState({
                    lastPlayedDetails: this.props.contentLastPlayedDetails,
                    favoriteStatus: this.props.contentLastPlayedDetails?.isFavourite,
                })

                const { detail, openPopup, closePopup, openLoginPopup, contentLastPlayedDetails } = this.props;
                let partnerPlayable = !isTrailer && await checkPlayBackEligibility(detail, openPopup, closePopup, openLoginPopup, history, contentLastPlayedDetails, playDetail?.contractName);

                /** checking if content has any parent, if id passed in URL will be different from getParentContentData
                 * id and contentType then we will call fetchContinueWatchingDetails to get value of isFavourite**/
                let { updatedId, updatedContentType } = getParentContentData(this.props.detail);
                if (updatedId !== undefined && updatedContentType !== undefined && updatedId !== idItem && updatedContentType !== this.contentTypeVal) {
                    await fetchContinueWatchingDetails(updatedId, updatedContentType, this.props.detail?.partnerId);
                    this.setState({
                        favoriteStatus: this.props.contentLastPlayedDetails?.isFavourite,
                    })
                }
    
                let isTataSkyProvider = detail?.provider?.toLowerCase() === PROVIDER_NAME.TATASKY;
                let isHungamaProvider = detail?.provider?.toLowerCase() === PROVIDER_NAME.HUNGAMA;
                let isErosNowProvider = detail?.provider?.toLowerCase() === PROVIDER_NAME.EROS_NOW;
                let isSonyLivProvider = detail?.provider?.toLowerCase() === PROVIDER_NAME.SONYLIV;
                let isHoiChoiProvider = detail?.provider?.toLowerCase() === PROVIDER_NAME.HOICHOI;
                let isPlanetMarathiProvider = detail?.provider?.toLowerCase() === PROVIDER_NAME.PLANET_MARATHI;
                let isMxPlayer = detail?.provider?.toLowerCase() === PROVIDER_NAME.MX_PLAYER;


                this.setState({
                    isHungama: isHungamaProvider,
                    isSonyLiv: isSonyLivProvider,
                    isErosnow: isErosNowProvider,
                    isHoiChoi: isHoiChoiProvider,
                    isPlanetMarathi: isPlanetMarathiProvider,
                    isMxPlayer: isMxPlayer,
                });

                let contentId = detail?.providerContentId;

                isUserloggedIn() && isEmpty(currentSubscription) && await this.props.getCurrentSubscriptionInfo();

                let durationInSeconds = get(detail, 'duration', 0);
                isUserloggedIn() && this.state.isMxPlayer && this.trackCW(durationInSeconds, '1');

                if (partnerPlayable || isTataSkyProvider) {
                    await this.playableUrl(contentId, contentType);
                } else {
                    this.props.hideMainLoader('PLAYERWEB');
                    if (!isTrailer) {
                        openSubscriptionPopup({ currentSubscription, detail, history });
                        return false;
                    } else {
                        await this.playableUrl();
                    }
                }

                let { lastPlayedDetails } = this.state;
                let secondsWatched = get(lastPlayedDetails, 'secondsWatched', 0);
                let playerAction;
                if (secondsWatched > 0) {
                    playerAction = getPlayAction(get(lastPlayedDetails, 'durationInSeconds'), get(lastPlayedDetails, 'secondsWatched'));
                }
                this.setState({ playerAction });
                await checkPrevNextEpisode(idItem);

                let isVOD = playDetail?.contractName === CONTRACT.RENTAL || detail?.provider?.toLowerCase() === PROVIDER_NAME.TATASKY 
                // this is TVOD and IVOD check
                !isVOD && await setLALogic(id) && this.triggerLA() ;
        }
        } catch (err) {
            console.log(err);
        }
    }

    trackShemarooAnalyticsData = async (eventName) => {
        const { trackShemarooAnalytics, detail, currentSubscription } = this.props;
        let analyticsInfo = currentSubscription?.analyticsInfo && currentSubscription?.analyticsInfo?.[detail?.provider?.toUpperCase()];

        if (detail?.provider?.toLowerCase() === PROVIDER_NAME.SHEMAROOME && analyticsInfo?.enabled
            && !isEmpty(analyticsInfo?.partnerId) && !isEmpty(analyticsInfo?.deviceId)) {
            let shemarooAnalyticsUserId = analyticsInfo.partnerId,
                dsn = analyticsInfo.deviceId,
                idSiteValue = analyticsInfo.idSiteValue,
                en, ea, ev, dimension2 = '', dimension5 = '', dimension15 = detail?.providerContentId,
                dimension16 = detail?.vodTitle,
                dimension17 = detail?.duration;

            let partnerDeepLinkUrl = detail?.partnerDeepLinkUrl || get(detail, 'partnerSubscriptionType', '');
            let smartUrl = getSmartUrl(partnerDeepLinkUrl);

            if (detail?.audio?.length > 0) {
                dimension2 = detail?.audio[0];
            }
            if (detail?.genre?.length > 0) {
                dimension5 = detail?.genre[0];
            }

            if (eventName === SHEMAROO_ANALYTICS_EVENT.PLAY) {
                en = 'play';
                ea = 'play';
                ev = 1;
            } else if (eventName === SHEMAROO_ANALYTICS_EVENT.BUFFERING) {
                en = 'buffer_time';
                ea = 'buffer';
                ev = 1;
            } else if (eventName === SHEMAROO_ANALYTICS_EVENT.REGULAR_INTERVAL) {
                en = 'playback_time';
                ea = 'playback';
                ev = 20;
            }
            let analyticsData = {
                shemarooAnalyticsUserId,
                idSiteValue,
                smartUrl,
                e_n: en,
                e_a: ea,
                e_v: ev,
                dimension2,
                dimension5,
                dimension15,
                dimension16,
                dimension17,
                dimension23: dsn,
            }

            let payload = getShemarooAnalyticsData(analyticsData);
            await trackShemarooAnalytics(payload);
        }
    }


    triggerLA = async () => {
        const { setLA, detail, match: { params: { id } }, playDetail, contentLastPlayedDetails, location } = this.props;
        const refUseCase = get(location, 'state.refUseCase', '');
        let checkedId = contentLastPlayedDetails?.durationInSeconds > 0 ? id : detail.vodId;
        let checkedContentType = contentLastPlayedDetails?.durationInSeconds > 0 ? contentLastPlayedDetails.contentType : detail.vodContentType ? detail.vodContentType : detail.contentType;

        let result = {
            checkedContentType,
            learnAction: LEARN_ACTION_TYPE.CLICK,
            checkedId,
            provider: get(detail, 'provider', ''),
            setLA,
            refUseCase,
        };
        await triggerLearnAction(result, playDetail, detail, false);
    }

    playableUrl = async (id, contentType) => {
        const {
            detail,
            playDetail,
            liveChannelMetaData,
        } = this.props;
        let { favoriteStatus, isTrailer, isSonyLiv, isLiveContent } = this.state;
        let provider = get(detail, 'provider'), errorSet = false,
            playbackUrl, drm = '', providerLowerCase = provider?.toLowerCase(), vootPlaybackData = {},
            certificateURL = '', token;

        const genericData = JSON.parse(getKey(LOCALSTORAGE.genericProviders)) ?? getAllGenricProvider();
        const genericProviders = genericData && Object.keys(genericData) || [];
        const getGenericProvider = genericProviders.includes(providerLowerCase) ? providerLowerCase : ""
        genericData && this.setState({
            genricAuthType: genericData[getGenericProvider]?.authType?.WEB?.playAuthType
        })
        const checkGenricProvider = genericProviders.includes(providerLowerCase)
        let { trailerPlaybackUrl = '' } = getTrailerUrl(detail, playDetail)
        
        if(isLiveContent) {
            let isDigitalFeed = liveChannelMetaData?.digitalFeed;
            if(isDigitalFeed) {
                playbackUrl = await this.getDigitalFeed();
            } else {
                playbackUrl = await this.getTataSkyPlaybackUrl();
            }
        } else {
            if (providerLowerCase === PROVIDER_NAME.SHEMAROOME) {
                playbackUrl = await this.getShemarooPlaybackUrl();
            } else if (providerLowerCase === PROVIDER_NAME.TATASKY) {
                playbackUrl = await this.getTataSkyPlaybackUrl();
            } else if (providerLowerCase === PROVIDER_NAME.CHAUPAL) {
    
                let playbackData = await this.getChaupalPlaybackData(id, contentType, trailerPlaybackUrl);
                errorSet = playbackData.errorSet;
                playbackUrl = playbackData.playbackUrl;
                drm = playbackData.drm;
                certificateURL = playbackData.certificateURL;               
            } else if (providerLowerCase === PROVIDER_NAME.LIONS_GATE) {
    
                let playbackData = await this.getLionsGatePlaybackData(trailerPlaybackUrl);
                errorSet = playbackData.errorSet;
                playbackUrl = playbackData.playbackUrl;
                drm = playbackData.drm;
                certificateURL = playbackData.certificateURL;
    
            } else if ([PROVIDER_NAME.VOOTSELECT, PROVIDER_NAME.VOOTKIDS].includes(providerLowerCase)) {
                vootPlaybackData = await this.getVootPlaybackUrl(id, contentType);
                playbackUrl = vootPlaybackData.playbackUrl;
                errorSet = vootPlaybackData.errorSet;
                drm = vootPlaybackData.drm;
            } else if (providerLowerCase?.includes(PROVIDER_NAME.HOICHOI)) {
                await this.props.getHoiChoiToken();
                playbackUrl = isTrailer ? trailerPlaybackUrl : playDetail.playUrl;
                playbackUrl = playbackUrl + '?' + this.props.hoiChoiToken;
            }
             else if (providerLowerCase?.includes(PROVIDER_NAME.CURIOSITY_STREAM)) {
                if (isTrailer) {
                    playbackUrl = trailerPlaybackUrl;
                } else {
                    playbackUrl = this.getCuriosityLionsGatePlaybackUrl();
                }
            } else if ([PROVIDER_NAME.HUNGAMA, PROVIDER_NAME.EROS_NOW, PROVIDER_NAME.MX_PLAYER].includes(providerLowerCase)) {
                playbackUrl = isTrailer ? trailerPlaybackUrl : true;
            } else if ([PROVIDER_NAME.EPICON, PROVIDER_NAME.DOCUBAY].includes(providerLowerCase)) {
                playbackUrl = isTrailer ? trailerPlaybackUrl : playDetail.playUrl;
            } else if (providerLowerCase?.includes(PROVIDER_NAME.PLANET_MARATHI)) {
                let pmPlayUrl = await this.getPlanetMarathiPlaybackUrl(contentType);
                this.pmPlaybackUrl = pmPlayUrl;
                playbackUrl = isTrailer ? trailerPlaybackUrl : pmPlayUrl;
            } else {
                if (checkGenricProvider) {
                    if (this.state.genricAuthType === PLAY_AUTH_TYPE.NONE) {
                        let updatedPlaybackUrl = playDetail?.fairplayUrl ? playDetail.fairplayUrl : playDetail.playUrl;
                        if (isTrailer) {
                            playbackUrl = trailerPlaybackUrl;
                        } else {
                            if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
                                playbackUrl = updatedPlaybackUrl;
                            } else {
                                playbackUrl = playDetail.dashWidewinePlayUrl;
                                if (isEmpty(playbackUrl)) {
                                    playbackUrl = updatedPlaybackUrl;
                                }
                            }
                        }
                    }  else if (this.state.genricAuthType === PLAY_AUTH_TYPE.DRM_PLAYBACK) {
                        let playbackData = await this.getGenericPlaybackData(trailerPlaybackUrl);
                        errorSet = playbackData.errorSet;
                        playbackUrl = playbackData.playbackUrl;
                        drm = playbackData.drm;
                        certificateURL = playbackData.certificateURL;
                        token = playbackData.token;
                    } else if (this.state.genricAuthType === PLAY_AUTH_TYPE.JWT_TOKEN) {
                        playbackUrl = await this.getTataSkyPlaybackUrl()
                    }
                }
                else {
                    playbackUrl = isTrailer ? trailerPlaybackUrl : '';
                }
            }
        }

        this.setState({ playbackUrl, isLoader: true, addedWatchlist: favoriteStatus });

        if (!errorSet && playbackUrl === '' && !isSonyLiv) {
            this.setPartnerError();
        }
        this.initialisePlayer(playbackUrl, drm, providerLowerCase, certificateURL, token);
    }

    getDigitalFeed = async () => {
        let {getDigitalFeedStream, liveChannelMetaData} = this.props;
        let payload = {
            partnerName: liveChannelMetaData?.digitalPartner,
            channelId: liveChannelMetaData?.id,
        }

        await getDigitalFeedStream(payload);

        let res = this.getPartnerPlayerSource();
        let source = res.source, playbackUrl = '';
        
        if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
            playbackUrl = source.hls;
        } else {
            playbackUrl = source.dash;
        }
        this.setState({ playerSource: source, playbackUrl: playbackUrl });

        return playbackUrl;
    }

    decryptUrl = (encryptedCipherText) => {
        let last2 = encryptedCipherText.slice(-2);
        let text = encryptedCipherText;
        text = text.slice(0, -3);
        let secretKey = this.props.configValue.dd[last2];
        let parsedBase64Key = CryptoJS.enc.Base64.parse(secretKey);
        let decryptedData = CryptoJS.AES.decrypt( text, parsedBase64Key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        let url = decryptedData.toString( CryptoJS.enc.Utf8 );
        console.log(" decryptUrl ",url, " secretKey ",secretKey);
        return url;
    }

    getPartnerPlayerSource = () =>{
        let source = {};
        let { getDigitalFeedData} = this.props;
        const { playerSource } = getPlayerDetail(getDigitalFeedData);
        
        if (getDigitalFeedData) {
            switch (playerSource) {
                case PLAYER_SOURCE.WIDEVINE :  
                    source ={
                        dash: this.decryptUrl(getDigitalFeedData.dashUrl),
                        drm: {
                            [`${PLAYER_SOURCE.WIDEVINE}`]: {
                                LA_URL: this.decryptUrl(getDigitalFeedData.ldashUrl),
                                mediaKeySystemConfig: {
                                    persistentState: 'required'
                                }
                            }
                        }
                    }
                    break;
                case PLAYER_SOURCE.FAIR_PLAY:
                    source = {
                            hls: this.decryptUrl(getDigitalFeedData.hlsUrl),
                        };
                    break;
                default:break;
            }
        }
        return {source};
    };

    getLionsGatePlaybackData = async (trailerPlaybackUrl) => {
        let playbackUrl, errorSet, drm, certificateURL;

        if (this.state.isTrailer) {
            playbackUrl = trailerPlaybackUrl;
        } else {
            playbackUrl = this.getCuriosityLionsGatePlaybackUrl();
            let getLionsGateData = await this.getLionsGatePlaybackUrl(playbackUrl);
            let response = getLionsGateData.response;
            errorSet = getLionsGateData.errorSet;

            this.kid = get(response, 'data.kid');
            this.drmToken = get(response, 'data.token');

            if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
                drm = get(response, 'data.lionsGateFairplayLicenseUrl');
                certificateURL = get(response, 'data.lionsGateFairplayCertificateUrl');
            } else {
                drm = get(response, 'data.widevineLicenceUrl');
            }
        }

        return {errorSet, playbackUrl, drm, certificateURL};
    }

    getChaupalPlaybackData = async (id, contentType, trailerPlaybackUrl) => {
        let chaupalData = await this.getChaupalPlaybackUrl(id, contentType),
            chaupalResponse = chaupalData.response,
            errorSet = chaupalData.errorSet, playbackUrl, drm, certificateURL;
        if (this.state.isTrailer) {
            playbackUrl = trailerPlaybackUrl;
        } else {
            if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
                playbackUrl = get(chaupalResponse, 'data.playUrls[0].url');
                drm = get(chaupalResponse, 'data.playUrls[0].licenceUrl');
                certificateURL = get(chaupalResponse, 'data.playUrls[0].certificateUrl');
            } else {
                playbackUrl = get(chaupalResponse, 'data.playUrls[1].url');
                drm = get(chaupalResponse, 'data.playUrls[1].licenceUrl');
            }
        }

        return {errorSet, playbackUrl, drm, certificateURL};
    }


    getGenericPlaybackData = async (trailerPlaybackUrl) => {
        let genericData = await this.getGenericPlaybackUrl(),
        getGenericDrmUrl = genericData.response,
            errorSet = genericData.errorSet, playbackUrl, drm, certificateURL, token;
        if (this.state.isTrailer) {
            playbackUrl = trailerPlaybackUrl;
        } else {
            if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
                certificateURL = get(getGenericDrmUrl, 'data.playerDetail.fairplayCertUrl');
            }
            playbackUrl = get(getGenericDrmUrl, 'data.playerDetail.playUrl');
            drm = get(getGenericDrmUrl, 'data.playerDetail.licenseUrl');
            token = get(getGenericDrmUrl, 'data.playerDetail.token');
        }

        return {errorSet, playbackUrl, drm, certificateURL, token};
    }

    getCuriosityLionsGatePlaybackUrl = () => {
        let playbackUrl = '';
        const {playDetail} = this.props;

        if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
            playbackUrl = playDetail.playUrl;
        } else {
            playbackUrl = playDetail.dashWidewinePlayUrl;
        }

        return playbackUrl;
    };

    getPlanetMarathiPlaybackUrl = async (contentType) => {
        const {
            detail,
            playDetail,
        } = this.props;

        let isPlayUrl = contentType === CONTENTTYPE.TYPE_WEB_SHORTS && playDetail.playUrl;
        { !isPlayUrl && await this.props.getPlanetMarathiUrl(detail?.providerContentId) }
        let playBackUrlPlanetMarathi = this.props?.planetMarathiUrl;
        return isPlayUrl ? playDetail.playUrl : playBackUrlPlanetMarathi;
    }

    getShemarooPlaybackUrl = async () => {
        const {
            detail,
            getShemarooContent,
            playDetail,
        } = this.props;
        let playbackUrl = '', playUrl = '';

        if (this.state.isTrailer) {
            let { isPartnerTrailer, trailerPlaybackUrl } = getTrailerUrl(detail, playDetail);

            if (isPartnerTrailer) {
                this.setState({
                    shemarooHLSTrailer: true,
                });
                playUrl = trailerPlaybackUrl;
            } else {
                playbackUrl = trailerPlaybackUrl;
            }
        } else {
            playUrl = detail.partnerDeepLinkUrl;
        }

        if (isEmpty(playbackUrl)) {
            let partnerDeepLinkUrl = playUrl ||
                get(detail, 'partnerSubscriptionType', '');
            this.props.showMainLoader();
            let shemarooSmartUrl = getSmartUrl(partnerDeepLinkUrl);

            await getShemarooContent(shemarooSmartUrl).then((response) => {
                playbackUrl = get(response, 'adaptive_urls[0].playback_url');
                this.props.hideMainLoader();
            }).catch(() => this.setPartnerError());
        }

        return playbackUrl;
    };

    getChaupalPlaybackUrl = async (id, contentType) => {
        const {
            detail,
            getChaupalUrl

        } = this.props;
        let response = '', errorSet;
        let contentId = detail.providerContentId;

        this.props.showMainLoader();

        await getChaupalUrl(id, contentType, contentId)
        if (this.props.chaupalResponse) {
            if (this.props.chaupalResponse?.code === 4003) {
                let error = this.props.chaupalResponse;
                let errorResponse = error?.message;
                errorSet = true;
                this.setPartnerError(errorResponse?.code, errorResponse);
            } else {
                response = this.props.chaupalResponse;
            }
        } else if (this.props.chaupalError) {
            let error = this.props.chaupalError;
            let errorResponse = error?.response?.data;
            errorSet = true;
            this.setPartnerError(errorResponse?.code, errorResponse);
        }
        this.props.hideMainLoader();
        return { response, errorSet };
    };

    getGenericPlaybackUrl = async () => {
        const {
            detail,
            getGenericDrm,
            match: { params: { id } }
        } = this.props;
        let response = '', errorSet;
        let provider = get(detail, 'provider'), providerUpperCase = provider.toUpperCase()
        let deviceOs = this.systemDetail.browser === BROWSER_TYPE.SAFARI ? GENERIC_DEVICE_OS.IOS: GENERIC_DEVICE_OS.ANDROID;
        let payload = {partnerContentId:detail.providerContentId,deviceOs:deviceOs,provider:providerUpperCase}

        this.props.showMainLoader();

        await getGenericDrm(payload)
        if (this.props.getGenericDrmUrl) {
                response = this.props.getGenericDrmUrl;
        } else if (this.props.getGenericError) {
            let error = this.props.getGenericError;
            let errorResponse = error?.response?.data;
            errorSet = true;
            this.setPartnerError(errorResponse?.code, errorResponse);
        }
        this.props.hideMainLoader();
        return { response, errorSet };
    };

    getLionsGatePlaybackUrl = async (playbackUrl) => {
        let response = '', errorSet;
        const {showMainLoader, hideMainLoader} = this.props;

        showMainLoader();

        let data = {"mpdUrl": playbackUrl};
        await this.props.getLionsGatePlaybackData(data);

        if(this.props.getLionsGateData) {
            response = this.props.getLionsGateData;
        } else if (this.props.getLionsGateError) {
            let error = this.props.getLionsGateError;
            let errorResponse = error?.response?.data;
            errorSet = true;
            this.setPartnerError(errorResponse?.code, errorResponse);
        }

        hideMainLoader();

        return { response, errorSet };
    };

    getTataSkyPlaybackUrl = async () => {
        const {
            detail,
            playDetail,
        } = this.props;
        let provider = get(detail, 'provider'), providerLowerCase = provider?.toLowerCase()

        let isVOD = playDetail?.contractName === CONTRACT.RENTAL || (providerLowerCase === PROVIDER_NAME.TATASKY) || (this.state.genricAuthType === PLAY_AUTH_TYPE.JWT_TOKEN),
            // this is TVOD and IVOD check 
            playbackUrl = '';

        if (isVOD || this.state.isLiveContent) {
            await this.getPlayerSource().then(res => {
                let { source, parameter } = res;
                if (isEmpty(source)) {
                    if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
                        playbackUrl = parameter.hls;
                    } else {
                        playbackUrl = parameter.dash;
                    }
                    this.setState({ playerSource: parameter, playbackUrl: playbackUrl });
                } else {
                    if (this.systemDetail.browser === BROWSER_TYPE.SAFARI) {
                        playbackUrl = source.hls;
                    } else {
                        playbackUrl = source.dash;
                    }
                    this.setState({ playerSource: source, playbackUrl: playbackUrl });
                }
            });
        } else {
            if (this.state.isTrailer) {
                let { trailerPlaybackUrl } = getTrailerUrl(detail, playDetail)
                playbackUrl = trailerPlaybackUrl;
            } else {
                playbackUrl = get(playDetail, 'playUrl');
            }
        }

        return playbackUrl;
    };

    getVootPlaybackUrl = async (id, contentType) => {
        const {
            detail,
            getVootUrl,
            playDetail,
            currentSubscription,
        } = this.props;
        let provider = get(detail, 'provider'), errorSet = false,
            playbackUrl = '', drm;

        if (this.state.isTrailer) {
            let { trailerPlaybackUrl } = getTrailerUrl(detail, playDetail);
            playbackUrl = trailerPlaybackUrl;
        } else {
            if (!isEmpty(currentSubscription?.partnerUniqueIdInfo)) {
                let partnerUniqueId;
                if (currentSubscription?.partnerUniqueIdInfo?.hasOwnProperty([provider?.toUpperCase()])) {
                    partnerUniqueId = currentSubscription?.partnerUniqueIdInfo?.[provider?.toUpperCase()]?.partnerUniqueId;
                } else {
                    if (provider?.toLowerCase() === PROVIDER_NAME.VOOTSELECT) {
                        provider = PROVIDER_NAME.VOOTKIDS;
                    } else {
                        provider = PROVIDER_NAME.VOOTSELECT;
                    }
                    partnerUniqueId = currentSubscription?.partnerUniqueIdInfo?.[provider?.toUpperCase()]?.partnerUniqueId;
                }

                await getVootUrl(id, contentType, provider, partnerUniqueId).then((response) => {
                    if (isEmpty(response.data)) {
                        errorSet = true;
                        this.setPartnerError(response.code, response);
                    } else {
                        playbackUrl = get(response.data, 'url');
                        drm = get(response.data, 'drm')
                    }
                }).catch(() => {
                    let error = this.props.vootPlayerError;
                    let errorResponse = error?.response?.data;
                    errorSet = true;
                    this.setPartnerError(errorResponse?.code, errorResponse);
                });
            }
        }

        return { playbackUrl, errorSet, drm };
    };

    getUrlType = (isVOD, drm, providerLowerCase) => {
        const { playerSource } = getPlayerDetail(this.props.playDetail);
        if ((isVOD && playerSource === PLAYER_SOURCE.FAIR_PLAY) || ([PROVIDER_NAME.DOCUBAY, PROVIDER_NAME.EPICON].includes(providerLowerCase))) {
            return PLAYER_URL_TYPE.HLS;
        } else if (isVOD || !isEmpty(drm) && this.systemDetail.browser !== BROWSER_TYPE.SAFARI || (providerLowerCase === PROVIDER_NAME.CURIOSITY_STREAM && this.systemDetail.browser !== BROWSER_TYPE.SAFARI)) {
            return PLAYER_URL_TYPE.DASH;
        } else {
            return PLAYER_URL_TYPE.HLS;
        }
    }

    getUrlTypeForTrailer = (providerLowerCase) => {
        if (([PROVIDER_NAME.TATASKY, PROVIDER_NAME.VOOTSELECT, PROVIDER_NAME.VOOTKIDS, PROVIDER_NAME.CHAUPAL].includes(providerLowerCase)
            && this.systemDetail.browser === BROWSER_TYPE.SAFARI) ||
            (providerLowerCase === PROVIDER_NAME.SHEMAROOME && this.state.shemarooHLSTrailer) ||
            [PROVIDER_NAME.DOCUBAY, PROVIDER_NAME.EPICON, PROVIDER_NAME.HOICHOI, PROVIDER_NAME.PLANET_MARATHI, PROVIDER_NAME.CURIOSITY_STREAM, PROVIDER_NAME.LIONS_GATE].includes(providerLowerCase)) {
            return PLAYER_URL_TYPE.HLS;
        } else {
            return PLAYER_URL_TYPE.DASH;
        }
    }

    initialisePlayer = async (data, drm, providerLowerCase, certificateURL, token) => {
        const {isHungama, isErosnow, isSonyLiv, isTrailer, genricAuthType, isMxPlayer} = this.state;
        if (isHungama) {
            const { currentSubscription } = this.props;
            let partnerUniqueId;
            if (!isEmpty(currentSubscription?.partnerUniqueIdInfo)) {
                partnerUniqueId = currentSubscription.partnerUniqueIdInfo[providerLowerCase.toUpperCase()].partnerUniqueId;
            } else {
                partnerUniqueId = '1234567890';
            }

            let playerInstance = {
                props: this.props,
                playerCallback: this.playerCallback,
                partnerUniqueId: partnerUniqueId,
            }
            this.player = new HungamaWebPlayer(playerInstance);
        } else if (isErosnow) {
            let playerInstance = {
                props: this.props,
                playerCallback: this.playerCallback,
            }

            this.player = new ErosWebPlayer(playerInstance);
        } else if (isSonyLiv && !isTrailer) {
            await this.props.getSonyToken();
            let playerInstance = {
                props: this.props,
                playerCallback: this.playerCallback,
            };
            this.player = new SonyWebPlayer(playerInstance);
        } else if(isMxPlayer){
            let playerInstance = {
                props: this.props,
                playerCallback: this.playerCallback,
                playerBack: this.playerBack,
                nextPrevClick: this.nextPrevClick,
            }

            this.player = new MxPlayer(playerInstance);
        }
         else {
            const { playDetail, detail } = this.props;
            const systemDetail = getSystemDetails();
            let isVODorLive = playDetail?.contractName === CONTRACT.RENTAL || providerLowerCase === PROVIDER_NAME.TATASKY || genricAuthType === PLAY_AUTH_TYPE.JWT_TOKEN || this.state.isLiveContent;
            // this is TVOD and IVOD check 
            let providerName = detail?.provider?.toLowerCase();

            let playerInstance = {
                playerId: 'player',
                playerCallback: this.playerCallback,
                playerKey: CONSTANT.BITMOVIN_KEY,
                appId: 'tatasky',
                streamUrl: data,
                urlType: isTrailer ? this.getUrlTypeForTrailer(providerLowerCase) : this.getUrlType(isVODorLive, drm, providerLowerCase, systemDetail),
                props: this.props,
                renewSession: this.renewSession,
                isTrailer: isTrailer,
                genricAuthType: genricAuthType,
                playerSdk: this.sdk,
            };
            if (isVODorLive || !isEmpty(drm)) {
                const { playerSource } = getPlayerDetail(playDetail);
                playerInstance.mediaKeySystemConfig = !isEmpty(this.state.playerSource) ? this.state.playerSource.drm[playerSource]?.mediaKeySystemConfig : '';
                playerInstance.liceseUrl = this.getLicenseUrl(drm, playerSource, systemDetail, providerName);
                playerInstance.isDrm = true;
                playerInstance.drmType = this.getDRMType(drm, playerSource, systemDetail);
                playerInstance.playerSource = !isEmpty(this.state.playerSource) ? this.state.playerSource : '';
                playerInstance.certificateURl = this.getCertificateURL(drm, systemDetail, providerName, certificateURL);
                playerInstance.kid = this.kid;
                playerInstance.drmToken = this.drmToken;
                playerInstance.token = token;
            }
            console.log('playerInstance:',playerInstance);

            this.player = new BitmovinPlayer(playerInstance);

        }
        this.props.hideMainLoader();
    }

    getCertificateURL = (drm, systemDetail, providerName, certificateURL) => {
        if (!isEmpty(drm) && systemDetail.browser === BROWSER_TYPE.SAFARI && [PROVIDER_NAME.CHAUPAL, PROVIDER_NAME.LIONS_GATE].includes(providerName)  || this.state.genricAuthType === PLAY_AUTH_TYPE.DRM_PLAYBACK) {
            return certificateURL;
        }
         else if (!isEmpty(drm) && systemDetail.browser === BROWSER_TYPE.SAFARI && ![PROVIDER_NAME.CHAUPAL, PROVIDER_NAME.LIONS_GATE].includes(providerName)) {
            return drm[0]?.certificate;
        } else {
            return '';
        }
    };

    getDRMType = (drm, playerSource, systemDetail) => {
        if (!isEmpty(drm) && systemDetail.browser === BROWSER_TYPE.SAFARI) {
            return PLAYER_SOURCE.FAIR_PLAY;
        } else {
            return playerSource;
        }
    }

    getLicenseUrl = (drm, playerSource, systemDetail, providerName) => {
        if (!isEmpty(drm) && systemDetail.browser !== BROWSER_TYPE.SAFARI) {
            if ([PROVIDER_NAME.CHAUPAL, PROVIDER_NAME.LIONS_GATE].includes(providerName) || this.state.genricAuthType === PLAY_AUTH_TYPE.DRM_PLAYBACK) {
                return drm;
            } else {
                return this.getVootWidevineLicenseUrl(drm)[0]?.licenseURL;
            }
        } else if (!isEmpty(drm) && systemDetail.browser === BROWSER_TYPE.SAFARI) {
            if ([PROVIDER_NAME.CHAUPAL, PROVIDER_NAME.LIONS_GATE].includes(providerName) || this.state.genricAuthType === PLAY_AUTH_TYPE.DRM_PLAYBACK) {
                return drm;
            } else {
                return drm[0]?.licenseURL;
            }
        } else {
            return !isEmpty(this.state.playerSource) ? this.state.playerSource.drm[playerSource]?.LA_URL : ''
        }
    };

    renewSession = () => {
        const { detail, match: { params: { contentType } } } = this.props;
        let contentId = detail.providerContentId;
        this.playableUrl(contentId, contentType);
    }

    getVootWidevineLicenseUrl = (drm) => {
        return drm.filter((item) => item.scheme.includes('WIDEVINE'));
    }

    setContinueWatching = (currentTime, totalDuration) => {
        const { setContinueWatching, detail } = this.props;
        setContinueWatching(detail.vodId, currentTime, totalDuration, this.contentTypeVal)
    }

    //to resume trailer after internet connection is resumed.
    resumeTrailer = () => {
        setKey(LOCALSTORAGE.INTERNET_AVAILABLE, true);
        let seekTime = JSON.parse(getKey(LOCALSTORAGE.TRAILER_RESUME_TIME));
        this.props.showMainLoader();
        this.setState({
            videoPercent: (seekTime / this.player.getDuration()) * 100,
        })
        this.player.seek(seekTime);
    }

    playerCallback = async (action, data, data1, subtitlesList, audioList, videoList) => {
        const { playerAction, lastPlayedDetails, isTrailer, isLiveContent } = this.state;
        const { match: { url }, liveMetaData } = this.props;
        switch (action) {
            case 'READY':
                console.log('READY--- ');
                if (this.state.isErosnow) {
                    if (getKey(LOCALSTORAGE.EROS_PLAYED) && !this.refresh && !this.networkCheck) {
                        this.pause();
                        this.refresh = true;
                    } else {
                        setKey(LOCALSTORAGE.EROS_PLAYED, true)
                    }

                } else if (this.state.isSonyLiv) {
                    // if (JSON.parse(getKey(LOCALSTORAGE.PLAYER_MUTE)) === true || getKey(LOCALSTORAGE.PLAYER_MUTE)==null) { // refactor code
                    if (JSON.parse(getKey(LOCALSTORAGE.PLAYER_MUTE)) === true) {
                        this.player.setVolume('mute');
                    } else {
                        this.player.setVolume(1);
                    }
                    if (getKey(LOCALSTORAGE.SONY_PLAYED) && !this.refresh && !this.networkCheck) {
                        this.refresh = true;
                        this.pause();
                    } else {
                        setKey(LOCALSTORAGE.SONY_PLAYED, true);
                    }

                    this.setVolumePercent();

                }
                else if (this.state.isHungama) {
                    if (getKey(LOCALSTORAGE.HUNGAMA_PLAYED) && !this.refresh && !this.networkCheck) {
                        this.refresh = true;
                        this.pause();
                    } else {
                        setKey(LOCALSTORAGE.HUNGAMA_PLAYED, true);
                    }

                    // if (JSON.parse(getKey(LOCALSTORAGE.PLAYER_MUTE)) === true || getKey(LOCALSTORAGE.PLAYER_MUTE)==null) { // refactor code
                    if (JSON.parse(getKey(LOCALSTORAGE.PLAYER_MUTE)) === true) {
                        this.player.setVolume(0);
                    } else {
                        this.player.setVolume(1);
                    }
                    if (getKey(LOCALSTORAGE.SUBTITLE)) {
                        let {index} = JSON.parse(getKey(LOCALSTORAGE.SUBTITLE));
                        this.player.setSubtitle(true,index);
                    }
                    else{ 
                        this.player.setSubtitle(true,0)
                    }      
                    this.setVolumePercent();
                } else {
                    console.log('bitmoviPlayer this.player', this, this.player)

                    if (getKey(LOCALSTORAGE.PLAYED) && !this.refresh && !this.networkCheck) {
                        this.pause();
                        this.refresh = true;
                    } else {
                        setKey(LOCALSTORAGE.PLAYED, true)
                    }
                    if (getKey(LOCALSTORAGE.SUBTITLE)) {
                        let { data, index } = JSON.parse(getKey(LOCALSTORAGE.SUBTITLE));
                        this.setSubtitle(data, index);
                    }
                    if (JSON.parse(getKey(LOCALSTORAGE.PLAYER_MUTE)) === true) {
                        this.player.mute();
                    } else {
                        this.player.unmute();
                    }
                    this.setVolumePercent();
                }

                this.setState({
                    showHeader: false,
                });
                this.props.hideMainLoader();

                break;
            case 'METADATALOADED':
                console.log('METADATALOADED--- ', data, data1);

                if (isTrailer && JSON.parse(getKey(LOCALSTORAGE.INTERNET_AVAILABLE)) === false) {
                    this.resumeTrailer();
                }

                if ((playerAction && playerAction.includes(PLAY_ACTION.RESUME) || this.networkCheck) && !this.state.isErosnow) {
                    this.resumeBool = true;
                    let resumeTime = this.networkCheck ? this.state.playerCurrentTime : get(lastPlayedDetails, 'secondsWatched', 0);
                    !url.includes(URL.TRAILER) && this.resume(resumeTime);
                    this.networkCheck = false;
                }
                this.setState(
                    {
                        playerDuration: data,
                        isLoader: false,
                    },
                );
                this.initialSeconds = Date.now();
                this.initialLoad = true;
                this.subtitleList = subtitlesList;
                this.audioList = !isEmpty(audioList) &&  !!audioList[0].lang ? audioList : (isLiveContent ? liveMetaData?.audio :this.props.detail?.audio);
                this.videoQualityList = videoList;
                console.log(audioList, subtitlesList)
                // this.setVideoQuality(CONSTANT.VIDEOQUALITY.AUTO);
                this.controlsVisibility();
                break;
            case 'TIMEUPDATE':
                console.log('timeupdate', data1, data);

                if(isLiveContent) {
                    let endOfLiveStream = convertEpochTimeStamp(liveMetaData?.endTime, true);
                    parseInt(endOfLiveStream) === 0 && await this.changeLiveMetaData();
                    console.log('time', endOfLiveStream)
                }

                if (this.state.isHoiChoi || this.state.isPlanetMarathi) {
                    data1 += 1;
                }
                let deviceRemoved = JSON.parse(getKey(LOCALSTORAGE.DEVICE_REMOVED)) === true;
                deviceRemoved && this.player.pause();

                if (isTrailer && (data1 % 3 === 0 || (Math.abs(this.playerCurrentTime - data1) > 3))) {
                    setKey(LOCALSTORAGE.TRAILER_RESUME_TIME, data1);
                }

                if (data1 === 1 && !url.includes(URL.TRAILER) && !isLiveContent) {
                    this.trackCW(data, data1);
                }

                if ((data1 % 10 === 0 || (Math.abs(this.playerCurrentTime - data1) > 10)) && !url.includes(URL.TRAILER) && !isLiveContent) {
                    this.trackCW(data, data1);
                }

                if (data1 % 20 === 0 && !isTrailer && !isLiveContent) {
                    await this.trackShemarooAnalyticsData(SHEMAROO_ANALYTICS_EVENT.REGULAR_INTERVAL);
                    await this.trackPlanetMarathiAnalytics(SHEMAROO_ANALYTICS_EVENT.REGULAR_INTERVAL);
                }

                let element = document.getElementsByClassName('current-time')[0];
                if (element && this.resumeBool) {
                    element.style.display = '';
                    this.resumeBool = false
                }
                if (!this.state.isHungama && getKey(LOCALSTORAGE.SUBTITLE) && !this.subtitleSet) {
                    let { data, index } = JSON.parse(getKey(LOCALSTORAGE.SUBTITLE));
                    this.setSubtitle(data, index);
                    this.subtitleSet = true;
                }
                this.watchedSeconds++;
                this.setState({
                    playerDuration: data,
                    videoPercent: isLiveContent? 100: (data1 / data) * 100,
                    playerCurrentTime: data1,
                });
                this.playerCurrentTime = data1;
                if (this.state.isLoader) {
                    this.setState({
                        isLoader: false,
                    });
                }
                if (data1 === data) {
                    this.trackPlayerEndEvent();
                    if (this.props.nextEpisodeDetail) {
                        console.log('next episode auto');
                        this.setState({
                            playNextBack: true,
                        })
                        this.timeout = setTimeout(() => {
                            if (this.player)
                                this.nextPlay();
                        }, 10000);
                    } else {
                        this.ended = true;
                        this.resetPlayContentObj();
                        this.player.destroy();
                        this.setState({
                            showControls: false,
                            showFooter: false,
                        });
                        this.trackOfflineMode();
                    }
                    if (!url.includes(URL.TRAILER) && !isLiveContent) {
                        this.setContinueWatching(data1, data)
                    }
                }
                this.playerState = 'play';
                break;
            case 'PLAYING':
                if (!this.startTime) {
                    this.startTime = new Date().toISOString();
                    this.bufferTime = (Date.now() - this.initialSeconds) / 1000;
                    if (!this.state.isTrailer) {
                        mixPanelConfig.trackEvent(MIXPANEL.EVENT.INITIAL_BUFFER_TIME, this.initialBufferObj(MIXPANEL));
                        moengageConfig.trackEvent(MOENGAGE.EVENT.INITIAL_BUFFER_TIME, this.initialBufferObj(MOENGAGE));
                    }
                }
                console.log('PLAYING---- ');
                this.setState({
                    pause: false,
                    play: true,
                    showSubtitle: false,
                    showVideoQuality: false,
                });
                break;
            case 'PAUSE':
                console.log('PAUSE---- ');
                this.setState({
                    pause: true,
                    play: false,
                    showSubtitle: false,
                    isSeeking: false,
                    showVideoQuality: false,
                });
                break;
            case 'WAITING':
                console.log('WAITING---- ');
                this.setState({
                    isLoader: true,
                });
                break;
            case 'SEEKING':
                console.log('SEEKING---- ', data1, data);
                if (!navigator.onLine) {
                    this.player && this.player.destroy();
                    this.setState({ isNetworkError: true, playerErrorMessage: ERROR_MESSAGES.NO_INTERNET });
                    setKey(LOCALSTORAGE.INTERNET_AVAILABLE, JSON.stringify(false));
                    this.trackAnalyticsPlayerFailure();
                    this.trackAnalyticsPlayerError();
                }
                this.props.showMainLoader();
                this.setState({
                    isLoader: true,
                    playerCurrentTime: this.player.getCurrentTime(),
                    showControls: true,
                    showFooter: true,
                    isSeeking: true,
                });
                break;
            case 'SEEKED':
                console.log('SEEKED---- ', data1, data);
                this.setState({
                    isLoader: false,
                    showControls: true,
                    showFooter: true,
                    isSeeking: false,
                });
                this.props.hideMainLoader();
                break;
            case 'ENDED':
                console.log("ended")
                // if (!this.ended) {
                //     this.ended = true;
                //  }
                break;
            case 'ERROR':
                console.log('ERROR---- ');
                if (data.type === 'error') {
                    if (data.message === 'NETWORK') {
                        this.setState({ isNetworkError: true, playerErrorMessage: ERROR_MESSAGES.NO_INTERNET });
                        this.trackAnalyticsPlayerFailure();
                        this.trackAnalyticsPlayerError();
                        setKey(LOCALSTORAGE.INTERNET_AVAILABLE, JSON.stringify(false));
                    } else if (data.message === 'LOAD_ERROR') {
                        this.setPartnerError(data.code);
                    } else if (data.message === 'TVOD_ERROR') {
                        if (data.errorMsg === ERROR_MESSAGES.TVOD_CONTENT_EXPIRED) {
                            this.setState({ isLoadError: true, playerErrorMessage: ERROR_MESSAGES.TVOD_CONTENT_EXPIRED });
                            this.trackAnalyticsPlayerFailure();
                            this.trackAnalyticsPlayerError(data.code);
                        } else {
                            this.setPartnerError(data.code, { message: data.errorMsg });
                        }
                    }
                }
                break;
            case 'SUBTITLETEXT':
                this.setState({ subtitleText: data });
                break;
            case 'PLAYER_MSG_RESOLUTION_CHANGED':
            case 'PLAYER_MSG_BITRATE_CHANGE':
                break;
            case 'QUALITYCHANGED':
                this.setState({
                    isLoader: false,
                });
                // alert('quality changed');
                break;
            case 'STALLSTARTED':
                console.log('STALLSTARTED---- ');
                this.setState({
                    isLoader: true,
                });
                this.trackOfflineMode();
                break;
            case 'STALLENDED':
                console.log('STALLENDED---- ');
                await this.trackShemarooAnalyticsData(SHEMAROO_ANALYTICS_EVENT.BUFFERING);
                await this.trackPlanetMarathiAnalytics(SHEMAROO_ANALYTICS_EVENT.BUFFERING);
                this.setState({
                    isLoader: false,
                });
                break;
            default:
                break;
        }
    };

    changeLiveMetaData = async() => {
        const {fetchLiveContentData, match: { params: { id } }, configValue, setLiveContentData} = this.props
        await fetchLiveContentData(id, true);
        const {updatedLiveDetailError, updatedliveChannelMetaData, liveChannelMetaData, updatedLiveData} = this.props;
        let sameEpg = updatedliveChannelMetaData.id === liveChannelMetaData.id;
        let retryTime = configValue.channelDetailRetry;

        if(!sameEpg || !isEmpty(updatedLiveDetailError)) {
            this.liveTimer = setInterval(async () => {
                if(this.retry < 6) {
                    this.retry += 1;
                    this.changeLiveMetaData()
                } else {
                    clearInterval(this.liveTimer);
                    this.retry = 0;
                } 
            }, parseInt(retryTime * 1000) );
        } else {
            setLiveContentData(updatedLiveData);
        }
    }

    trackPlayerEndEvent = () => {
        let parameter = this.getAnalyticsData(MIXPANEL, true);
        let durationWatched = this.player.getCurrentTime();
        parameter[`${MIXPANEL.PARAMETER.DURATION_MINUTES}`] = (durationWatched / 60).toFixed(2);
        parameter[`${MIXPANEL.PARAMETER.DURATION_SECONDS}`] = (durationWatched).toFixed(2);

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_PLAY_END, parameter);
    }

    trackOfflineMode = () => {
        if (!navigator.onLine) {
            this.player && this.player.destroy();
            this.setState({ isNetworkError: true, playerErrorMessage: ERROR_MESSAGES.NO_INTERNET });
            setKey(LOCALSTORAGE.INTERNET_AVAILABLE, JSON.stringify(false));
            this.trackAnalyticsPlayerFailure();
            this.trackAnalyticsPlayerError();
        }
    }

    trackCW = (totalDuration, currentTime) => {
        if (this.state.isHungama && totalDuration && currentTime !== this.currentTimeDuration) {
            this.currentTimeDuration = currentTime;
            this.setContinueWatching(currentTime, totalDuration);
        } else if (!this.state.isHungama) {
            this.setContinueWatching(currentTime, totalDuration);
        }
    };

    trackAnalyticsPlayerFailure = (msg = '') => {
        let parameter = this.trackAnalyticsData(MIXPANEL);
        let errorMsg = msg || this.state.playerErrorMessage
        parameter[`${MIXPANEL.PARAMETER.REASON}`] = errorMsg;

        let result = this.trackAnalyticsData(MOENGAGE);
        result[`${MOENGAGE.PARAMETER.REASON}`] = errorMsg;

        if (!this.state.isTrailer) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.PLAYBACK_FAILURE, parameter);
            moengageConfig.trackEvent(MOENGAGE.EVENT.PLAYBACK_FAILURE, result);
            let data = this.getAnalyticsData(MIXPANEL, MIXPANEL.EVENT.CONTENT_PLAY_FAIL);
            data[`${MIXPANEL.PARAMETER.REASON}`] = errorMsg;
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_PLAY_FAIL, data);
        }
    }

    trackAnalyticsPlayerError = (code = -1, msg) => {
        let errorMsg = msg || this.state.playerErrorMessage;
        let provider = get(this.props.detail, 'provider');
        let mixpanelData = {
            [`${MIXPANEL.PARAMETER.ERROR_CODE}`]: code || -1,
            [`${MIXPANEL.PARAMETER.ERROR_MESSAGE}`]: errorMsg,
            [`${MIXPANEL.PARAMETER.ORIGIN}`]: MIXPANEL.VALUE.PI_PAGE,
            [`${MIXPANEL.PARAMETER.TYPE}`]: MIXPANEL.VALUE.PLAYER,
            [`${MIXPANEL.PARAMETER.PARTNER}`]: provider,
        },
            moengageData = {
                [`${MOENGAGE.PARAMETER.ERROR_CODE}`]: code,
                [`${MOENGAGE.PARAMETER.ERROR_MESSAGE}`]: errorMsg,
                [`${MOENGAGE.PARAMETER.ORIGIN}`]: MOENGAGE.VALUE.PI_PAGE,
                [`${MOENGAGE.PARAMETER.TYPE}`]: MOENGAGE.VALUE.PLAYER,
                [`${MOENGAGE.PARAMETER.PARTNER}`]: provider,
            };

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.ERROR, mixpanelData);
        moengageConfig.trackEvent(MOENGAGE.EVENT.ERROR, moengageData);
    }

    controlsVisibility = () => {
        if (this.controlsTimer) {
            clearTimeout(this.controlsTimer);
        }
        // this.setState({showHeader: true, showControls: true, showFooter: true});
        this.controlsTimer = setTimeout(() => {
            // const {showSubtitle,showVideoQuality}=this.state;
            let showSubtitle = document.getElementsByClassName('tracks')[0] && window.getComputedStyle(document.getElementsByClassName('tracks')[0]).getPropertyValue('display');
            let showVideoQuality = document.getElementsByClassName('video-quality')[0] && window.getComputedStyle(document.getElementsByClassName('video-quality')[0]).getPropertyValue('display');
            let showVolume = document.getElementsByClassName('volume')[0] && window.getComputedStyle(document.getElementsByClassName('volume')[0]).getPropertyValue('display');
            if ((!showSubtitle || showSubtitle === 'none') && (!showVideoQuality || showVideoQuality === 'none') && !this.ended && showVolume === 'none' && this.playerState !== 'pause' && !this.state.isSeeking) {
                this.setState({ showControls: false, showHeader: false, showFooter: false });
            }
        }, 3000);
    };

    setSubtitle = (data, index) => {
        let prevSubtitle = getKey(LOCALSTORAGE.SUBTITLE);
        prevSubtitle && deleteKey(prevSubtitle);
        if (data) {
            this.setState({
                subtitleText: '',
            })
            // this.player.setSubtitle(this.subtitlePrev, data);
            this.state.isHungama ? this.player.setSubtitle(false,index):this.player.setSubtitle(this.subtitlePrev,data);

        } else {
            this.setState({
                subtitleText: '',
            })
            // this.player.setSubtitle(this.subtitlePrev);
            this.state.isHungama ? this.player.setSubtitle(false,index):this.player.setSubtitle(this.subtitlePrev);

        }
        setKey(LOCALSTORAGE.SUBTITLE, { data: data, index: index });
        this.subtitlePrev = data;
    };

    setVideoQuality = (item, index) => {
        // this.setState({
        //     isLoader:true
        // });
        this.player.setVideoQuality(item);
        this.videoQualityActiveIndex = index;
        this.getCommonVideoQuality(item);
    };

    getCommonVideoQuality = (item) => {
        const { isHungama, isSonyLiv } = this.state;
        if (item === CONSTANT.VIDEOQUALITY.AUTO || isHungama || isSonyLiv) {
            this.props.getVideoQualityOfPlayer(item)
        } else {
            this.props.getVideoQualityOfPlayer(item.height)
        }
    }

    setAudio = (id) => {
        this.player.setAudio(id);
    }

    rewind = () => {
        if (!this.player.getCurrentTime() && this.playerState !== 'pause') {
            return;
        }
        if (!this.seeked) {
            this.seeked = true;
        }
        this.player.pause();
        if (this.FRTimer) {
            clearTimeout(this.FRTimer);
        }
        this.FRTimer = setTimeout(() => {
            this.setState({ isLoader: true, showSubtitle: false, showVideoQuality: false });
            this.player.rewind(10);
            this.calculateDuration();
            if (this.ended) {
                this.endedCheck();
                return;
            }
            if (this.playerState === 'play') {
                this.player.play();
            } else {
                this.player.pause();
            }
        }, 100);
    };

    calculateDuration = () => {
        this.setState({
            videoPercent: (this.player.getCurrentTime() / this.player.getDuration()) * 100,
            playerCurrentTime: this.player.getCurrentTime(),
        });
    }

    forward = () => {
        this.setState({ isLoader: true });
        if (!this.player.getCurrentTime() && this.playerState !== 'pause') {
            return;
        }
        if (!this.seeked) {
            this.seeked = true;
        }
        this.player.pause();
        if (this.FRTimer) {
            clearTimeout(this.FRTimer);
        }
        this.FRTimer = setTimeout(() => {
            this.setState({ isLoader: true, showSubtitle: false, showVideoQuality: false });
            this.player.forward(10);
            this.calculateDuration();
            if (this.ended) {
                this.endedCheck();
                return;
            }
            if (this.playerState === 'play') {
                this.player.play();
            } else {
                this.player.pause();
            }
        }, 100);
    };

    play = () => {
        this.resumeContent++;
        this.playerState = 'play';
        if (this.state.pause && !this.state.isTrailer) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.RESUME_CONTENT, this.getAnalyticsData(MIXPANEL, true, MIXPANEL.EVENT.RESUME_CONTENT));
            moengageConfig.trackEvent(MOENGAGE.EVENT.RESUME_CONTENT, this.trackAnalyticsData(MOENGAGE))
        }
        this.player.play();
        this.setState({
            pause: false,
            play: true,
            showSubtitle: false,
            showVideoQuality: false,
        });
    };

    pause = () => {
        this.pauseCount++;
        this.playerState = 'pause';
        this.player.pause();
        this.setState({
            pause: true,
            play: false,
            showSubtitle: false,
            showVideoQuality: false,
        });
        if (!this.state.isTrailer) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.PAUSE_CONTENT, this.getAnalyticsData(MIXPANEL, true));
            moengageConfig.trackEvent(MOENGAGE.EVENT.PAUSE_CONTENT, this.trackAnalyticsData(MOENGAGE));
        }
    };

    progressClickHandler = (e, setTimeCallback) => {
        if (this.player && this.player.getDuration()) {
            this.player.pause();
            let percent = e;
            const currentTime = (this.player.getDuration() * percent) / 100;
            this.setState(() => {
                return {
                    videoPercent: percent,
                    playerCurrentTime: currentTime,
                };
            });
            setTimeCallback(currentTime);
            if (this.FRTimer) {
                clearTimeout(this.FRTimer);
            }
            this.controlsVisibility();
            this.FRTimer = setTimeout(() => {
                this.setState({ isLoader: true });
                this.player.seek(currentTime);
                if (this.ended) {
                    this.endedCheck();
                    return;
                }
                if (this.playerState === 'play') {
                    this.player.play();
                } else {
                    this.player.pause();
                }
            }, 100);
        }
    };

    progressCompleteHandler = () => {
        const { match: { url } } = this.props;
        if (!url.includes(URL.TRAILER) && !this.state.isLiveContent) {
            this.setContinueWatching(this.state.playerCurrentTime, this.player.getDuration())
        }
    }

    endedCheck = () => {
        if (this.player.getCurrentTime() === this.player.getDuration()) {
            this.ended = true;
            let parameter = this.getAnalyticsData(MIXPANEL, true);
            let durationWatched = this.player.getCurrentTime();
            parameter[`${MIXPANEL.PARAMETER.DURATION_MINUTES}`] = (durationWatched / 60).toFixed(2);
            parameter[`${MIXPANEL.PARAMETER.DURATION_SECONDS}`] = (durationWatched).toFixed(2);

            mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_PLAY_END, parameter);
            this.resetPlayContentObj();
            this.player.destroy();
            this.setState({
                showControls: false,
                showFooter: false,
            });
            this.trackOfflineMode();
        }
    }

    resetPlayContentObj = () => {
        this.bufferTime = 0;
        this.pauseCount = 0;
        this.resumeContent = 0;
        this.watchedSeconds = 0;
        this.startTime = 0;
        this.playback = true;
        this.setState({
            videoPercent: 0,
            playerCurrentTime: 0,
            playNextBack: false,
        });
    }

    nextPrevClick = async (check) => {
        if (getKey(LOCALSTORAGE.PLAYED)) deleteKey(LOCALSTORAGE.PLAYED)
        if (getKey(LOCALSTORAGE.HUNGAMA_PLAYED)) deleteKey(LOCALSTORAGE.HUNGAMA_PLAYED)
        if (getKey(LOCALSTORAGE.EROS_PLAYED)) deleteKey(LOCALSTORAGE.EROS_PLAYED)
        if (getKey(LOCALSTORAGE.SONY_PLAYED)) deleteKey(LOCALSTORAGE.SONY_PLAYED);

        let contentType, id;
        const { nextEpisodeDetail, previousEpisodeDetail } = this.props;
        if (check === 'prev' && previousEpisodeDetail) {
            contentType = get(previousEpisodeDetail, 'contentType');
            id = get(previousEpisodeDetail, 'id');
        } else {
            if(nextEpisodeDetail) {
                contentType = get(nextEpisodeDetail, 'contentType');
                id = get(nextEpisodeDetail, 'id');
            }
        }

        if(contentType && id) {
            safeNavigation(this.props.history, `/player/${contentType}/${id}`);
        } 
    }

    subtitleClickHandler = (audioActiveIndex, subtitleActiveIndex) => {
        {
            this.setState((prevState) => {
                return { showSubtitle: !prevState.showSubtitle, showVideoQuality: false }
            })
        }
        this.subtitleActiveIndex = subtitleActiveIndex || 0;
        this.audioActiveIndex = audioActiveIndex || 0;
    }

    videoQualityClickHandler = () => {
        this.videoQualityActiveIndex = this.videoQualityActiveIndex ? this.videoQualityActiveIndex : 0;
        this.setState((prevState) => {
            return { showVideoQuality: !prevState.showVideoQuality, showSubtitle: false }
        })
    }

    addWatchList = async () => {
        const {
            match: { params: { id } },
            addWatchlist,
            setLA,
            detail,
            playDetail,
            fetchContinueWatchingDetails,
        } = this.props;
        let { favoriteStatus } = this.state;
        let { updatedId, updatedContentType } = getParentContentData(detail);
        await addWatchlist(updatedId, updatedContentType, false);
        //await checkWatchlistContent(updatedId, updatedContentType, false);
        await fetchContinueWatchingDetails(updatedId, updatedContentType, detail?.partnerId);
        let { contentLastPlayedDetails } = this.props;
        this.setState((prev) => {
            return {
                addedWatchlist: !prev.addedWatchlist,
                showWatchlist: true,
                showControls: false,
            }
        });
        setTimeout(() => this.setState({ showWatchlist: false, showControls: true }), 1000);

        if (!favoriteStatus) {
            let checkedId = contentLastPlayedDetails.secondsWatched > 0 ? id : detail.vodId;
            let checkedContentType = contentLastPlayedDetails.secondsWatched > 0 ? contentLastPlayedDetails.contentType : detail.vodContentType ? detail.vodContentType : detail.contentType;

            let data = {
                checkedContentType,
                learnAction: LEARN_ACTION_TYPE.FAVOURITE,
                checkedId,
                provider: get(detail, 'provider', ''),
                setLA,
            };
            triggerLearnAction(data, playDetail, detail);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.ADD_WATCHLIST, this.getAnalyticsData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.ADD_CONTENT_FAVOURITE, this.trackAnalyticsData(MOENGAGE));
        } else {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.REMOVE_WATCHLIST, this.getAnalyticsData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.DELETE_FAVOURITE, this.trackAnalyticsData(MOENGAGE));
        }
    }

    volumeClick = () => {
        const { isHungama, isSonyLiv, isErosnow, volumeIcon } = this.state;
        if (volumeIcon === 'icon-mute') {
            if (!isHungama && !isErosnow && !isSonyLiv) {
                this.player.unmute();
                this.player.setVolume(100);
            } else {
                this.player.setVolume((isHungama || isSonyLiv) ? 1 : 100);
            }
            isHungama && this.player.isMuted(true);
            setKey(LOCALSTORAGE.PLAYER_MUTE, JSON.stringify(false));

        } else {
            if (!isHungama && !isErosnow && !isSonyLiv) {
                this.player.mute();
            } else {
                this.player.setVolume(isSonyLiv ? 'mute' : 0);
            }
            setKey(LOCALSTORAGE.PLAYER_MUTE, JSON.stringify(true));
        }
        this.setState(() =>
            this.setState((prevState) => {
                return {
                    volumeIcon: prevState.volumeIcon === 'icon-mute' ? 'icon-percent' : 'icon-mute',
                    volumePercent: prevState.volumeIcon === 'icon-mute' ? '100' : '0',
                }
            }))
    }

    replay = async () => {
        setKey(LOCALSTORAGE.TRAILER_RESUME_TIME, JSON.stringify(0));
        this.trackOfflineMode();
        this.props.showMainLoader();
        this.refresh = true;
        this.destroy();
        this.ended = false;
        await this.detailApiCall();
        this.setState({
            showControls: true,
            showFooter: true,
            play: true,
            pause: false,
        });
        this.props.hideMainLoader();
    }

    resume = (seekTime) => {
        this.props.showMainLoader();
        this.setState({
            videoPercent: (seekTime / this.player.getDuration()) * 100,
        });
        this.player.seek(seekTime);
    }

    volumeBarClick = (e) => {
        const percent = e;
        let iconValue;
        if (percent <= 0) {
            iconValue = 'icon-mute';
        } else if (percent <= 33) {
            iconValue = 'icon-percent2';
        } else if (percent <= 90) {
            iconValue = 'icon-percent1';
        } else {
            iconValue = 'icon-percent'
        }
        this.setState({
            volumePercent: percent,
            volumeIcon: iconValue,
        });

        const { isHungama, isSonyLiv } = this.state;
        let hungamaVolume = parseFloat((percent / 100).toFixed(1));
        let sonyVolume = parseFloat((percent / 100));
        let volume = percent;
        if (isHungama) {
            volume = hungamaVolume;
        } else if (isSonyLiv) {
            volume = sonyVolume;
        }
        this.player.setVolume(volume);
    }

    playNextBack = () => {
        this.playerBack()
    }

    nextPlay = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.nextPrevClick('next')
    }

    volumeHover = () => {
        this.setState({
            showSubtitle: false,
            showVideoQuality: false,
        })
    }

    expand = () => {
        this.toggleExapnd();
        document.querySelector("#app").requestFullscreen();
    }

    minimise = () => {
        this.toggleExapnd();
        document.exitFullscreen();
    }

    toggleExapnd = () => {
        this.setState((prevState) => {
            return {
                enlarge: !prevState.enlarge,
                showBack: !prevState.showBack,
            }
        })

    }

    trackAnalyticsData = (analytics) => {
        const { detail, match: { params: { contentType } }, location, liveMetaData } = this.props;
        let isLiveContent = contentType?.toUpperCase() === CONTENTTYPE.TYPE_LIVE; 
        let title = contentType === CONTENTTYPE.TYPE_MOVIES ? detail?.vodTitle || detail?.title : (detail?.title || detail?.vodTitle || detail?.brandTitle);
        return {
            [`${analytics.PARAMETER.CONTENT_TITLE}`]: isLiveContent ? liveMetaData.title: title,
            [`${analytics.PARAMETER.CONTENT_TYPE}`]: isLiveContent ? contentType :location?.state?.contentSectionSource,
            [`${analytics.PARAMETER.CONTENT_GENRE}`]: isLiveContent ? liveMetaData.genre :detail?.genre.join(),
            [`${analytics.PARAMETER.PARTNER_NAME}`]: detail?.provider,
        };
    }

    playerBack = () => {
        if (document.fullscreen) {
            document.exitFullscreen();
        }
        
        if(this.state.isMxPlayer) {
            const piUrl = getKey(LOCALSTORAGE.PI_URL);
            if (piUrl) {
                safeNavigation(this.props.history, `${piUrl}`)
            } else {
                this.playerBackHandling();
            }
        } else {
           this.playerBackHandling();
        }
    }

    playerBackHandling = () => {
        let historyPath = this.props.history?.location?.state?.prevPath;
        if (historyPath !== '' && historyPath !== undefined) {
            this.props.history.goBack();
        }
        else {
            safeNavigation(this.props.history, URL.DEFAULT);
        }
    }

    destroy = () => {
        this.setState({
            videoPercent: 0,
            volumePercent: 100,
            volumeIcon: 'icon-percent',
            play: true,
            pause: false,
        })
        this.resetPlayContentObj();
        this.player && this.player.destroy();
    }

    generateJWTToken = async () => {
        let { playDetail, detail, match: { params: { id } } } = this.props;
        let tokenList = JSON.parse(getKey(LOCALSTORAGE.JWT_TOKEN)) || [];
        let data = tokenList && tokenList?.find(i => i.contentId === id);

        let isIVOD = detail?.provider?.toLowerCase() === PROVIDER_NAME.TATASKY && playDetail?.contractName !== CONTRACT.RENTAL;

        if (data && !isIVOD) {
            let index = tokenList.findIndex(i => i.contentId === id);
            if (((tokenList[index].expiry * 1000) - new Date().getTime()) > 0) {
                return tokenList[index].token;
            } else {
                await this.getTVODToken();
                let { tokenData } = this.props;
                if (tokenData) {
                    tokenList[index].token = tokenData.token;
                    tokenList[index].expiry = tokenData.expiresIn;

                    setKey(LOCALSTORAGE.JWT_TOKEN, tokenList);

                    return tokenData.token;
                } else {
                    this.setPartnerError();
                }
            }
        } else if (this.state.genricAuthType === PLAY_AUTH_TYPE.JWT_TOKEN) {
            await this.getTVODToken();
            let { tokenData } = this.props;
            if (tokenData) {
                return tokenData.token;
            }
            else {
                this.setPartnerError();
            }
        } else {
            await this.getTVODToken();
            let { tokenData } = this.props;
            if (tokenData) {
                !isIVOD && tokenList.push({
                    contentId: id,
                    expiry: tokenData.expiresIn,
                    token: tokenData.token,
                });

                !isIVOD && setKey(LOCALSTORAGE.JWT_TOKEN, tokenList);

                return tokenData.token;
            } else {
                this.setPartnerError();
            }
        }
    }

    getTVODToken = async () => {
        let { playDetail, generateToken, detail, liveChannelMetaData } = this.props;
        let epids, provider;
        if(this.state.isLiveContent) {
            epids = this.getLiveContentEpids();
            provider = liveChannelMetaData?.channelName;
        } else {
            epids = playDetail?.offerId?.epids;
            provider = detail?.provider;
        }
        this.getLiveContentEpids();
        let body = {
            "action": "stream",
            "epids": epids,
            "provider": provider
        }
        await generateToken(body).catch(() => {
            this.setPartnerError();
        });
    }

    getLiveContentEpids = () => {
        let {liveDetailData} = this.props;

        let nonEmptyEpids = liveDetailData?.offerId?.epids.filter(item => {
            return Object.fromEntries(Object.entries(item).filter(([_, v]) => {
                return v !== null && v !== "" && item 
            }))
        })

        return [nonEmptyEpids[0]];
    }

    setPartnerError = (code = '', response = {}) => {
        let errorMsg = response?.message ? response.message : ERROR_MESSAGES.DEFAULT_ERROR_MESSAGE,
            errorCode = code === 0 ? '' : code;

        this.setState({
            isPartnerURLError: true,
            partnerErrorCode: errorCode,
            partnerErrorHeading: response?.title ? response.title : ERROR_MESSAGES.DEFAULT_ERROR_HEADING,
            partnerErrorMessage: errorMsg,
        });

        this.sdk.reportError(errorCode, errorMsg);
        this.trackAnalyticsPlayerFailure(errorMsg);
        this.trackAnalyticsPlayerError(errorCode, errorMsg);
    }

    getPlayerSource = () => {
        let source = {};
        let { playDetail, match: { url }, detail, liveDetailData } = this.props;
        let parameter = "";
        return this.generateJWTToken().then(token => {
            let playbackDetail = playDetail;
            if(this.state.isLiveContent) {
                playbackDetail = liveDetailData;
            }
            if (playbackDetail && token) {
                parameter = `ls_session=${token}`;
                const { playerSource } = getPlayerDetail(playbackDetail);
                let isTrailer = url.includes(URL.TRAILER);
                let updatedFairplayCertificateUrl=this.state.genricAuthType === PLAY_AUTH_TYPE.JWT_TOKEN ? playDetail.fairplayCertificateUrl || getEnvironmentConstants().FAIRPLAY_CERTIFICATE_URL + '?accountId=tatasky&applicationId=tatasky' : getEnvironmentConstants().FAIRPLAY_CERTIFICATE_URL + '?accountId=tatasky&applicationId=tatasky'

                if (playbackDetail) {
                    if (_.includes([PLAYER_SOURCE.WIDEVINE, PLAYER_SOURCE.PLAYREADY, PLAYER_SOURCE.SS_PLAYREADY, PLAYER_SOURCE.FAIR_PLAY], playerSource)) {
                        switch (playerSource) {
                            case PLAYER_SOURCE.WIDEVINE:
                                source = {
                                    dash: !isTrailer ? playbackDetail.dashWidewinePlayUrl : (detail.partnerTrailerInfo || playbackDetail.dashWidewineTrailerUrl),
                                    drm: {
                                        [`${PLAYER_SOURCE.WIDEVINE}`]: {
                                            LA_URL: !isTrailer ? `${playbackDetail.dashWidewineLicenseUrl}&${parameter}` : "",
                                            mediaKeySystemConfig: {
                                                persistentState: 'required',
                                            },
                                        },
                                    },
                                };

                                break;
                            case PLAYER_SOURCE.FAIR_PLAY:
                                source = {
                                    hls: !isTrailer ? (!!playbackDetail.fairplayUrl ? playbackDetail.fairplayUrl : playDetail.playUrl) :
                                        (detail.partnerTrailerInfo || playbackDetail.trailerUrl),
                                    drm: {
                                        fairplay: isTrailer ? '' : !!playbackDetail.fairplayUrl ? {
                                            certificateURL: updatedFairplayCertificateUrl,
                                            prepareContentId: function (contentId) {
                                                return contentId.match(/ContentId=([^&]+)/)[1];
                                            },
                                            prepareMessage: function (event) {
                                                return new Uint8Array(event.message);
                                            },
                                            prepareLicense: function (license) {
                                                return new Uint8Array(license);
                                            },
                                            licenseResponseType: 'arraybuffer',
                                            getLicenseServerUrl: function (licenseS) {
                                                return licenseS.replace("skd", "https") + `&${parameter}`;
                                            },
                                        } : '',
                                    },
                                };
                                break;
                            default:
                                console.log("This format is currently unavailable");
                                break;
                        }
                    }
                }

                return { source, parameter };
            }
        });
    }

    playerFooterProps = () => {
        const {
            playerCurrentTime,
            volumeBarControls,
            volumePercent,
            activeAudioItem,
            activeSubtitleItem,
            volumeIcon,
            videoPercent,
            playerDuration,
            showSubtitle,
            showVideoQuality,
            addedWatchlist,
            enlarge,
            isHungama,
            isSonyLiv,
            isTrailer,
            isLiveContent,
            play,
        } = this.state;
        const { match: { url }, openPopup, closePopup, openLoginPopup, detail } = this.props;
        return {
            volumePercent: volumePercent,
            volumeIcon: volumeIcon,
            url: url,
            controlsVisibility: this.controlsVisibility,
            setSubtitle: this.setSubtitle,// set subtitle on click
            videoPercent: videoPercent,
            currentTime: playerCurrentTime,
            playerDuration: playerDuration,
            showSubtitle: showSubtitle,
            subtitleClickHandler: this.subtitleClickHandler,
            subtitleList: this.subtitleList,
            audioList: this.audioList,
            videoQualityList: this.videoQualityList,
            setAudio: this.setAudio,
            watchlistClick: this.addWatchList,
            addedWatchlist: addedWatchlist,
            volumeBarClick: this.volumeBarClick,
            showVideoQuality: showVideoQuality,
            videoQualityClickHandler: this.videoQualityClickHandler,
            videoQualityListClickHandler: this.setVideoQuality,
            videoQualityActiveIndex: this.videoQualityActiveIndex,
            volumeClick: this.volumeClick,
            volumeHover: this.volumeHover,
            volumeBarControls: volumeBarControls,
            audioActive: this.audioActive,
            audioActiveIndex: this.audioActiveIndex,
            subtitleActiveIndex: this.subtitleActiveIndex,
            expand: this.expand,
            minimise: this.minimise,
            enlarge: enlarge,
            progressClickHandler: this.progressClickHandler,
            nextPrevClick: this.nextPrevClick,
            toggleActiveSubtitleItem: this.toggleActiveSubtitleItem,
            toggleActiveAudioItem: this.toggleActiveAudioItem,
            activeAudioItem: activeAudioItem,
            activeSubtitleItem: activeSubtitleItem,
            progressCompleteHandler: this.progressCompleteHandler,
            isHungama: isHungama,
            isSonyLiv: isSonyLiv,
            openPopup: openPopup,
            closePopup: closePopup,
            openLoginPopup: openLoginPopup,
            provider: detail?.provider?.toLowerCase(),
            isTrailer,
            isLiveStatus: detail?.liveContent,
            isLiveContent: isLiveContent,
            liveClick: this.liveClick,
            play: play,
        }
    }

    liveClick = () => {
        const {pause} = this.state;
        if(pause) {
            this.player.timeShift(0);
            this.play();
        }
    }

    retryHandle = () => {
        if (navigator.onLine) {
            this.refresh = !this.refresh;
            this.ended = false;
            this.networkCheck = true;
            const { detail, match: { url, params: { contentType } } } = this.props;
            this.setState({ isNetworkError: false }, () => {
                let isTrailer = url.includes(URL.TRAILER);
                if (isTrailer) {
                    this.playableUrl();
                } else {
                    let contentId = detail.providerContentId;
                    this.playableUrl(contentId, contentType)
                }
            })
        } else {
            this.props.showMainLoader();
            setTimeout(() => {
                this.props.hideMainLoader()
            }, 200)
        }
    }

    errorJSX = () => {
        const { partnerErrorCode, isNetworkError, isPartnerURLError, playerAPIError } = this.state;
        return (
            <div
                className={isNetworkError ? "network-error" : isPartnerURLError || playerAPIError ? "partner-error" : ''}>
                {
                    isNetworkError &&
                    <header>
                        <i className="icon-back-2" onClick={() => this.playerBack()} />
                    </header>
                }
                <main>
                    <i className={isNetworkError ? "icon-no-internet" : isPartnerURLError || playerAPIError ? "icon-alert-upd" : ''} />
                    <h6>{this.getErrorHeadings()}</h6>
                    <p>{this.getErrorMessages()}</p>
                    <Button bValue={isNetworkError ? "Retry" : isPartnerURLError || playerAPIError ? "Ok" : ''}
                        cName="btn primary-btn"
                        clickHandler={this.handler} />
                    {isPartnerURLError && partnerErrorCode &&
                        <div className="error-number">Error code: {partnerErrorCode}</div>}
                </main>
            </div>
        )
    }

    getErrorHeadings = () => {
        const { partnerErrorHeading, isNetworkError, isPartnerURLError, playerAPIError } = this.state;
        if (isNetworkError) {
            return ERROR_MESSAGES.NO_INTERNET;
        } else if (isPartnerURLError) {
            return partnerErrorHeading;
        } else if (playerAPIError) {
            return ERROR_MESSAGES.DEVICE_REMOVED;
        }
    }

    getErrorMessages = () => {
        const { partnerErrorMessage, isNetworkError, isPartnerURLError, playerAPIError } = this.state;
        if (isNetworkError) {
            return isMobile.any() ? MESSAGE.NETWORK_MESSAGE_MOBILE : MESSAGE.NETWORK_MESSAGE_WEB;
        } else if (isPartnerURLError) {
            return partnerErrorMessage;
        } else if (playerAPIError) {
            return ERROR_MESSAGES.DEVICE_REMOVED_MESSAGE;
        }
    }

    handler = async () => {
        const { isNetworkError, isPartnerURLError, playerAPIError } = this.state;
        if (isNetworkError) {
            this.retryHandle();
        } else if (isPartnerURLError) {
            this.playerBack();
        } else if (playerAPIError) {
            await logoutHandling();
            getDeviceId();
            await getAnonymousId();
            this.props.setPlayerAPIError(false);
            safeNavigation(this.props.history, URL.DEFAULT)
        }
    };

    toggleActiveSubtitleItem = (e, imgId) => {
        e.stopPropagation();
        this.controlsVisibility();
        const currentState = this.state.activeSubtitleItem && this.state.activeSubtitleItem[imgId];
        this.setState({ activeSubtitleItem: { [imgId]: currentState || true } });
    }

    toggleActiveAudioItem = (e, imgId) => {
        e.stopPropagation();
        this.controlsVisibility();
        const currentState = this.state.activeAudioItem && this.state.activeAudioItem[imgId];
        this.setState({ activeAudioItem: { [imgId]: currentState || true } })
    }

    getPlaybackAnalyticsData = (analytics = APPSFLYER) => {
        const { detail, match: { params: { contentType } }, liveChannelMetaData } = this.props;
        let title = contentType === CONTENTTYPE.TYPE_MOVIES ? detail?.vodTitle || detail?.title : (detail?.title || detail?.vodTitle || detail?.brandTitle) || liveChannelMetaData?.title;
        let durationWatched = this.state.playerCurrentTime;
        let { updatedContentType } = getParentContentData(detail);
        let data = {
            [`${analytics.PARAMETER.CONTENT_LANGUAGE}`]: getContentLanguage(detail?.audio),
            [`${analytics.PARAMETER.CONTENT_TITLE}`]: title,
            [`${analytics.PARAMETER.CONTENT_TYPE}`]: getAnalyticsContentType(contentType),
            [`${analytics.PARAMETER.DURATION_SECONDS}`]: durationWatched.toFixed(2),
            [`${analytics.PARAMETER.DURATION_MINUTES}`]: (durationWatched / 60).toFixed(2),
            [`${analytics.PARAMETER.CONTENT_CATEGORY}`]: updatedContentType,
            [`${analytics.PARAMETER.CONTENT_PARENT_TITLE}`]: detail?.brandTitle || detail?.vodTitle,
            [`${analytics.PARAMETER.PARTNER_NAME}`]: detail?.provider
        }
        return data
    }

    render() {
        const {
            showBack,
            playerCurrentTime,
            playNextBack,
            playbackUrl,
            isLoadError,
            play,
            pause,
            isLoader,
            showHeader,
            playerAPIError,
            subtitleText,
            showControls,
            isNetworkError,
            showFooter,
            addedWatchlist,
            showWatchlist,
            isPartnerURLError,
            isSeeking,
            isHungama,
            isErosnow,
            isSonyLiv,
            isTrailer,
            playerDuration,
            genricAuthType,
            isMxPlayer,
            isLiveContent,
        } = this.state;
        const { match: { params: { contentType } }, detail, nextEpisodeDetail, liveMetaData } = this.props;
        return (
            <React.Fragment>
                <MainSeo
                    metaName="robots"
                    metaContent="noindex,nofollow"
                />
                {isNetworkError || playerAPIError ? this.errorJSX() :
                    (playbackUrl || isSonyLiv) && !isPartnerURLError && !isLoadError ?
                        <div className="player-container">
                            {
                                !isErosnow && !isMxPlayer &&
                                <Fragment>
                                    {(showHeader || this.ended) && <header>
                                        {showBack &&
                                            <i className="icon-back-2" onClick={() => this.playerBack()} />}
                                        {<h3 className="user-selection"
                                        >{contentType === "MOVIES" ? detail?.vodTitle || detail?.title : (detail?.title || detail?.vodTitle || detail?.brandTitle) || liveMetaData?.title}</h3>} </header>}
                                    {
                                        !isHungama && !(isSonyLiv && !isTrailer) ? <div id="player" style={{
                                            opacity: `${showControls || showHeader ? '.5' : '1'}`,
                                            backgroundImage: `url(${this.ended ? detail.boxCoverImage : ''})`,
                                        }} onClick={() => this.controlsVisibility()}
                                        /> :
                                            (isHungama ?
                                                <div id="player-container" style={{
                                                    opacity: `${showControls || showHeader ? '.5' : '1'}`,
                                                    backgroundImage: `url(${this.ended ? detail.boxCoverImage : ''})`,
                                                }} onClick={() => this.controlsVisibility()} /> :
                                                <div className="player-container" id="playerContainer" style={{
                                                    opacity: `${showControls || showHeader ? '.5' : '1'}`,
                                                    backgroundImage: `url(${this.ended ? detail.boxCoverImage : ''})`,
                                                }} onClick={() => this.controlsVisibility()} >
                                                    <div className={`${isSonyLiv && `sony-wrapper`} ${genricAuthType && `reel-wrapper`} player-wrapper`} id="playerWrapper" />
                                                </div>)
                                    }
                                    {this.ended && <div className="replay">
                                        <p onClick={() => this.replay()}>Replay</p>
                                    </div>}
                                    {showWatchlist && <div className="watchlist-parent">
                                        <p onClick={() => this.replay()}>{addedWatchlist ? MESSAGE.ADDED_TO_BINGE_LIST : MESSAGE.REMOVE_FROM_BINGE_LIST}</p>
                                    </div>}
                                    {subtitleText &&
                                        <p className={`subtitleText user-selection ${showFooter ? 'subtitleText-footer' : 'subtitleText-no-footer'}`}
                                            dangerouslySetInnerHTML={{ __html: subtitleText }}
                                        />}
                                    <PlayerControls isLoader={isLoader} controlVisibility={this.controlsVisibility}
                                        rewind={this.rewind} playerCurrentTime={playerCurrentTime} isSeeking={isSeeking}
                                        showControls={showControls} pause={pause} play={play} pauseHandling={this.pause}
                                        forward={this.forward} playHandling={this.play} playerDuration={playerDuration} 
                                        isLiveStatus={detail?.liveContent} isLiveContent={isLiveContent} />
                                    {showFooter && this.initialLoad &&
                                        <PlayerFooter playerFooter={this.playerFooterProps()} />}
                                    {playNextBack && this.playback &&
                                        <PlayerNext playerNextVal={nextEpisodeDetail} nextPlay={this.nextPlay}
                                            initialVal={10}
                                            playNextBack={this.playNextBack} />}
                                </Fragment>
                            }
                            {
                                isErosnow && !isMxPlayer && <>
                                    {(showHeader || this.ended) && <header>
                                        {showBack &&
                                            <i className="icon-back-2" onClick={() => this.playerBack()} />}
                                        {detail && <h3 className="user-selection"
                                        >{contentType === "MOVIES" ? detail.vodTitle || detail.title : (detail.title || detail.vodTitle || detail.brandTitle)}</h3>} </header>}
                                    {
                                        <div id="player" style={{
                                            opacity: `${showControls || showHeader ? '.5' : '1'}`,
                                            backgroundImage: `url(${this.ended ? detail.boxCoverImage : ''})`,
                                        }} onClick={() => this.controlsVisibility()}
                                        />
                                    }
                                    {this.ended && <div className="replay">
                                        <p onClick={() => this.replay()}>Replay</p>
                                    </div>}
                                    <div id={!this.ended ? 'eros-player' : 'erose-none'} />
                                </>

                            }
                            {
                                isMxPlayer && <div id = "mxplayer"/>
                            }
                            
                        </div> : isLoadError ?
                            <p className="play-error">{this.state.playerErrorMessage}</p> : isPartnerURLError ? this.errorJSX() : null}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    detail: get(state.PIDetails.data, 'meta'),
    playDetail: get(state.PIDetails.data, 'detail'),
    watchlistStatus: get(state.playerWatchlist, 'status'),
    nextEpisodeDetail: get(state.playerWatchlist, 'checkEpisode.nextEpisode'),
    previousEpisodeDetail: get(state.playerWatchlist, 'checkEpisode.previousEpisode'),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    playerApiError: get(state.playerWatchlist, 'playerApiError'),
    contentLastPlayedDetails: get(state.PIDetails, 'continueWatchingDetails.data'),
    tokenData: get(state.playerWatchlist, 'getToken.data'),
    vootPlayerError: get(state.playerWatchlist, 'getVootUrl'),
    chaupalResponse: get(state.playerWatchlist, 'getChaupalUrl'),
    getGenericDrmUrl:get(state.playerWatchlist, 'getGenericDrmUrl'),
    getGenericError:get(state.playerWatchlist, 'getGenericError'),
    getLionsGateData: get(state.playerWatchlist, 'getLionsGateData'),
    chaupalError: get(state.playerWatchlist, 'getChaupalerror'),
    isLoading: state.commonContent.isLoading,
    sonyToken: get(state.playerWatchlist, 'sonyToken.data.token'),
    planetMarathiUrl: get(state.playerWatchlist, 'planetMarathiUrl.data.playUrl'),
    hoiChoiToken: get(state.playerWatchlist, 'hoiChoiToken.data.token'),
    videoQuality: get(state.playerWatchlist, 'videoQuality'),
    liveMetaData: get(state.PIDetails, 'liveDetail.data.meta[0]'),
    liveChannelMetaData: get(state.PIDetails, 'liveDetail.data.channelMeta'),
    updatedliveChannelMetaData: get(state.PIDetails, 'updatedLiveDetail.data.channelMeta'),
    liveDetailData:  get(state.PIDetails, 'liveDetail.data.detail'),
    getDigitalFeedData: get(state.playerWatchlist, 'digitalFeed.data'),
    getDigitalFeedError: get(state.playerWatchlist, 'digitalFeedError'),
    configValue: get(state.headerDetails, "configResponse.data.config"),
    updatedLiveDetailError: get(state.PIDetails, 'updatedLiveDetailError'),
    updatedLiveData: get(state.PIDetails, 'updatedLiveDetail'),
});

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators({
        hideHeader,
        hideMainLoader,
        showMainLoader,
        hideFooter,
        fetchPIData,
        getShemarooContent,
        setContinueWatching,
        checkWatchlistContent,
        addWatchlist,
        checkPrevNextEpisode,
        generateToken,
        openPopup,
        closePopup,
        openLoginPopup,
        setLA,
        getVootUrl,
        getPlanetMarathiUrl,
        getChaupalUrl,
        getGenericDrm,
        getLionsGatePlaybackData,
        setPlayerAPIError,
        fetchContinueWatchingDetails,
        getCurrentSubscriptionInfo,
        trackShemarooAnalytics,
        setEpiconDocubayAnalyticsData,
        getSonyToken,
        getHoiChoiToken,
        clearContent,
        resetSeasonData,
        getVideoQualityOfPlayer,
        trackPlanetMarathiAnalytics,
        setLionsgateAnalyticsData,
        fetchLiveContentData,
        getDigitalFeedStream,
        setLiveContentData,
    }, dispatch),
})

Player.propTypes = {
    match: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    history: PropTypes.object,
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    detail: PropTypes.object,
    fetchPIData: PropTypes.func,
    checkWatchlistContent: PropTypes.func,
    checkPrevNextEpisode: PropTypes.func,
    getShemarooContent: PropTypes.func,
    favoriteStatus: PropTypes.bool,
    playDetail: PropTypes.object,
    setContinueWatching: PropTypes.func,
    nextEpisodeDetail: PropTypes.object,
    previousEpisodeDetail: PropTypes.object,
    addWatchlist: PropTypes.func,
    generateToken: PropTypes.func,
    setLA: PropTypes.func,
    openPopup: PropTypes.func,
    currentSubscription: PropTypes.object,
    getVootUrl: PropTypes.func,
    getPlanetMarathiUrl: PropTypes.func,
    getChaupalUrl: PropTypes.func,
    getGenericDrm:PropTypes.func,
    playerApiError: PropTypes.bool,
    setPlayerAPIError: PropTypes.func,
    contentLastPlayedDetails: PropTypes.object,
    tokenData: PropTypes.object,
    vootPlayerError: PropTypes.object,
    chaupalResponse: PropTypes.object,
    getGenericDrmUrl:PropTypes.object,
    getGenericError:PropTypes.object,
    getLionsGateData: PropTypes.object,
    chaupalError: PropTypes.object,
    fetchContinueWatchingDetails: PropTypes.func,
    getCurrentSubscriptionInfo: PropTypes.func,
    location: PropTypes.object,
    trackShemarooAnalytics: PropTypes.func,
    setEpiconDocubayAnalyticsData: PropTypes.func,
    setLionsgateAnalyticsData:PropTypes.func,
    closePopup: PropTypes.func,
    openLoginPopup: PropTypes.func,
    getSonyToken: PropTypes.func,
    getHoiChoiToken: PropTypes.func,
    clearContent: PropTypes.func,
    resetSeasonData: PropTypes.func,
    getVideoQualityOfPlayer: PropTypes.func,
    hoiChoiToken: PropTypes.func,
    trackPlanetMarathiAnalytics: PropTypes.func,
    getLionsGatePlaybackData: PropTypes.func,
    getLionsGateError: PropTypes.func,
    planetMarathiUrl: PropTypes.string,
    videoQuality: PropTypes.func,
    isLoading: PropTypes.bool,
    fetchLiveContentData: PropTypes.func,
    liveMetaData: PropTypes.object,
    liveChannelMetaData: PropTypes.object,
    liveDetailData: PropTypes.object,
    getDigitalFeedStream: PropTypes.func,
    getDigitalFeedData: PropTypes.object,
    getDigitalFeedError: PropTypes.object,
    configValue: PropTypes.object,
    updatedliveChannelMetaData: PropTypes.object,
    updatedLiveDetailError: PropTypes.object,
    setLiveContentData: PropTypes.func,
    updatedLiveData: PropTypes.object,
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(Player);

