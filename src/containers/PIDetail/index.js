import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import get from 'lodash/get';
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { bindActionCreators, compose } from 'redux';
import isEmpty from 'lodash/isEmpty';
import Seasons from "@components/Seasons";
import { closePopup, openPopup } from "@common/Modal/action";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import { URL } from "@constants/routeConstants";
import {
    CONTENTTYPE,
    CONTRACT,
    LEARN_ACTION_TYPE,
    LOCALSTORAGE,
    MINI_SUBSCRIPTION,
    PARTNER_SUBSCRIPTION_TYPE,
} from "@constants";
import { resetSeasonData } from "@components/Seasons/APIs/actions";
import { accountDropDown, notificationDropDown, setSearch, switchAccountDropDown } from "@components/Header/APIs/actions";
import {
    addWatchlist,
    checkWatchlistContent,
    getZee5Tag,
    setContinueWatching,
    setLA,
} from '@containers/PlayerWeb/APIs/actions';
import {
    cloudinaryCarousalUrl,
    dropDownDismissalCases,
    getAnalyticsContentType,
    isUserloggedIn,
    safeNavigation,
    triggerLearnAction,
    moviePopup,
    loginInFreemium,
    getAnalyticsSource,
    getAnalyticsRailCategory,
    isFreeContentEvent,
    getContentLanguage,
    getPrimaryLanguage,
    isFreeContentMixpanel,
    getSEOData,
    checkLivePlaybackEligibility,
    openSubscriptionPopup,
} from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import { getKey, setKey } from "@utils/storage";
import { hideMainLoader, showMainLoader, showMainLoaderImmediate } from "@src/action";

import {
    clearContent,
    fetchContinueWatchingDetails,
    fetchPIData,
    fetchPIRecommendedData,
    getShemarooContent,
    getTARecommendationRail,
    getTVODExpiry,
    hidePIDetailMobilePopup,
    openPIDetailMobilePopup,
} from './API/actions';
import './style.scss';
import { BOTTOM_SHEET, MOBILE_BREAKPOINT, FORMATTED_CONTENT_TYPE,REVERSE_FORMATTED_CONTENT_TYPE} from '@utils/constants';
import BottomSheet from '@common/BottomSheet';
import { openLoginPopup } from "@containers/Login/APIs/actions";
import firebase from "@utils/constants/firebase";
import ErrorPopup from "../../common/ErrorPopup";
import {
    apiCall,
    getAnalyticsData,
    getCircularLogo,
    getCommonAnalyticsAttributes,
    getParentContentData,
    getTitleAndDesc,
    trackTrailerEvent,
    checkForNonIntegratedPartner,
    isLivePlayable,
} from "@containers/PIDetail/PIDetailCommon";
import { PIUpperContent } from "@containers/PIDetail/components/PIUpperContent";
import { PIRelatedRail } from "@containers/PIDetail/components/PIRelatedRail";
import { showPaymentSuccessPopup } from "@containers/Subscription/APIs/subscriptionCommon";
import MainSeo from '@common/MainSeo';
import LiveContentDetail from './components/LiveContentDetail';

class PIDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            taRecommendedRail: false,
            mixpanelData: {
                railTitle: '',
                source: '',
                origin: '',
                railPosition: '',
                conPosition: ''
            },
            episode: {},
            modalType: BOTTOM_SHEET.PI_DETAIL,
            isLoading: false,
            metaTitle: '',
            metaDescription: '',
            isLiveDetail: false
        };
    }

    async componentDidMount() {
        let { id } = this.props.match.params;
        let result = id.split("?");
        let contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];

        setKey(LOCALSTORAGE.PI_URL, `${window.location.pathname}${window.location.search}`);

        if (isEmpty(contentType)) {
            let cType = this.props.match?.params?.contentType?.toUpperCase();
            let resultContentType = REVERSE_FORMATTED_CONTENT_TYPE[cType];
            this.props.history.replace({ pathname: `/${URL.DETAIL}/${resultContentType}/${id}` })
        } else {
            const isLiveDetail = contentType?.toUpperCase() === CONTENTTYPE.TYPE_LIVE;
            this.setState({ isLoading: true, isLiveDetail });
            this.props.showMainLoaderImmediate();
            !isLiveDetail && await apiCall(result[0], contentType, this);
            this.setState({ isLoading: false });
            this.props.hideMainLoader();
            this.callTaLearnAction();
            this.getSEOMappedData();
        }
    }

    shouldComponentUpdate(prevProps, _prevState) {
        if (prevProps.showPIDetailMobilePopup !== this.props.showPIDetailMobilePopup) {
            this.setState({
                episode: {},
            })
        }
        return true;
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.location.pathname !== this.props.location.pathname) {
            const { id } = this.props.match.params;
            const contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];
            const isLiveDetail = contentType?.toUpperCase() === CONTENTTYPE.TYPE_LIVE;
            let result = id.split("?");
            setTimeout(() => this.setState({ taRecommendedRail: false, isLiveDetail}), 0);
            this.props.clearContent();
            this.props.resetSeasonData();
            this.setState({ isLoading: true });
            this.props.showMainLoaderImmediate();
            !isLiveDetail && await apiCall(result[0], contentType, this);
            this.setState({ isLoading: false });
            this.props.hideMainLoader();
            this.executeOnClick("", true);
        }
    }

    componentWillUnmount() {
        if (!this.props.history?.location?.pathname?.includes(URL.PLAYER)) {
            this.props.clearContent();
            this.props.resetSeasonData();
        }
    };

    getSEOMappedData = () => {
        let { location: { pathname } } = this.props;
        const { match, meta } = this.props;
        let contentType = FORMATTED_CONTENT_TYPE[match?.params?.contentType];
        let { metaTitle, metaDescription } = getSEOData(pathname, meta, contentType);
        this.setState({
            metaTitle,
            metaDescription,
        });
    }

    executeOnClick = (event, isTrue) => {
        event !== "" && event.stopPropagation();
        dropDownDismissalCases('closeCondition');
    };

    time_convert(d) {
        const t = Number(d);
        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const hDisplay = h < 10 ? `${h}` : h;
        const mDisplay = m < 10 ? `${m}` : m;

        if (h === 0) {
            return `${mDisplay}m`;
        } else if (h === 0 && m === 0) {
            return `${d}s`;
        } else if (m === 0) {
            return `${hDisplay}h`;
        }

        return `${hDisplay}h ${mDisplay}m`;
    }

    favoriteAnalytics = () => {
        let {
            meta,
            location,
            currentSubscription,
        } = this.props;
        let mixpanelData = getAnalyticsData(MIXPANEL, false, this.props, this.state);
        let contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];

        const { railPosition, conPosition: contentPosition, sectionSource, prevPath, contentSectionSource } = location.state || {};
        const { mixpanelData: { sectionType } } = this.state;
        let { updatedContentType } = getParentContentData(this.props.meta);
        let isFreeContent = isFreeContentMixpanel(meta);
        let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || [];
        const contentAuth = (isFreeContentEvent(meta.contractName, partnerInfo, meta?.partnerId, currentSubscription?.subscriptionStatus) || (meta?.partnerSubscriptionType.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()))
        mixpanelData[`${MIXPANEL.PARAMETER.FREE_CONTENT}`] = isFreeContent;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_RATING}`] = meta?.rating;
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL}`] = this.state.mixpanelData.railTitle || '';
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE}`] = getContentLanguage(this.props?.meta?.audio) || '';
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL_POSITION}`] = railPosition;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_GENRE_PRIMARY}`] = meta?.genre[0] || "";
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE_PRIMARY}`] = getPrimaryLanguage(meta?.audio) || "";
        mixpanelData[`${MIXPANEL.PARAMETER.RELEASE_YEAR}`] = meta?.releaseYear || "";
        mixpanelData[`${MIXPANEL.PARAMETER.DEVICE_TYPE}`] = MIXPANEL.VALUE.WEB;
        mixpanelData[`${MIXPANEL.PARAMETER.ACTOR}`] = meta?.actor.join() || '';
        mixpanelData[`${MIXPANEL.PARAMETER.PACK_NAME}`] = currentSubscription?.productName;
        mixpanelData[`${MIXPANEL.PARAMETER.PACK_PRICE}`] = currentSubscription?.amountValue;
        mixpanelData[`${MIXPANEL.PARAMETER.SOURCE}`] = getAnalyticsSource(this.props.location.pathname);
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL_TYPE}`] = sectionSource;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_TYPE}`] = contentSectionSource;
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`] = getAnalyticsRailCategory(sectionType, MIXPANEL) || MIXPANEL.VALUE.REGULAR;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_AUTH}`] = contentAuth ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_CATEGORY}`] = updatedContentType;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_POSITION}`] = contentPosition;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_PARENT_TITLE}`] = getTitleAndDesc(meta, contentType);
        mixpanelData[`${MIXPANEL.PARAMETER.LIVE_CONTENT}`] = MIXPANEL.VALUE.NO;
        mixpanelData[`${MIXPANEL.PARAMETER.PAGE_NAME}`] = getAnalyticsSource(this.props.location.pathname);

        return mixpanelData;
    }

    addToFavourite = async () => {
        if (isUserloggedIn()) {
            const {
                addWatchlist,
                isFavouriteMarked,
                setLA,
                meta,
                detail,
                fetchContinueWatchingDetails,
                lastWatch,
            } = this.props;

            const { id } = this.props.match.params;
            let { updatedId, updatedContentType } = getParentContentData(this.props.meta);
            
            const refUseCase = get(this.props, 'history.location.state.refUseCase', '');

            await addWatchlist(updatedId, updatedContentType);
            await fetchContinueWatchingDetails(updatedId, updatedContentType, this.props.meta?.partnerId, true);

            let mixpanelData = this.favoriteAnalytics();
            if (!isFavouriteMarked) {
                let checkedId = lastWatch.secondsWatched > 0 ? id : meta.vodId;
                let checkedContentType = lastWatch.secondsWatched > 0 ? lastWatch?.contentType : meta?.vodContentType ? meta.vodContentType : meta.contentType;
                let data = {
                    checkedContentType,
                    learnAction: LEARN_ACTION_TYPE.FAVOURITE,
                    checkedId,
                    provider: meta.provider,
                    setLA,
                    refUseCase,
                };
                triggerLearnAction(data, detail, meta, true);
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.ADD_WATCHLIST, mixpanelData);
                moengageConfig.trackEvent(MOENGAGE.EVENT.ADD_CONTENT_FAVOURITE, mixpanelData);
            } else {
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.REMOVE_WATCHLIST, mixpanelData);
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.DELETE_FAVORITE, mixpanelData);
                moengageConfig.trackEvent(MOENGAGE.EVENT.DELETE_FAVOURITE, mixpanelData);
            }
        } else {
            const { openPopup, closePopup, openLoginPopup } = this.props;
            let getSource = firebase.VALUE.PLAYBACK;
            await loginInFreemium({
                openPopup, closePopup, openLoginPopup, source: firebase.VALUE.PLAY_CLICK, getSource, ComponentName: MINI_SUBSCRIPTION.LOGIN
            });
        }
    };

    seriesProps = () => {
        const { lastWatch, match: { params: { id } }, detail, meta } = this.props;
        const contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];
        return {
            contentType,
            id,
            detail,
            lastWatch,
            playTrailer: this.playTrailer,
            title: getTitleAndDesc(meta, contentType),
        }
    }

    movieProps = () => {
        const { match: { params: { id } }, detail, meta } = this.props;
        let contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];
        return {
            contentType,
            id,
            detail,
            playTrailer: this.playTrailer,
            title: getTitleAndDesc(meta, contentType),
        }
    }

    commonProps = () => {
        const {
            meta,
            history,
            match,
            isFavouriteMarked,
            detail,
            currentSubscription,
            openPopup,
            closePopup,
            openLoginPopup
        } = this.props;
        return {
            match,
            history,
            meta,
            currentSubscription,
            isFavouriteMarked,
            addToFavourite: this.addToFavourite,
            isTVOD: detail?.contractName === CONTRACT.RENTAL,
            tvodExpiry: this.tvodExpiry,
            mixpanelData: this.state.mixpanelData,
            openPopup,
            closePopup,
            openLoginPopup,
            contractName: detail?.contractName,
        }
    }

    tvodExpiry = async () => {
        let { meta, getTVODExpiry, match: { params: { id } } } = this.props;
        if (!meta?.showcase && !meta?.isPlaybackStarted) {
            meta?.vodId && await getTVODExpiry(meta?.vodId, true);
            let result = id.split("?");
            let tvodInfo = JSON.parse(getKey(LOCALSTORAGE.TVOD_DATA));
            let data = tvodInfo && tvodInfo?.find(i => i.id === parseInt(result[0]));
            if (data && this.props?.getTVODExpiryTime) {
                let index = tvodInfo && tvodInfo?.findIndex(i => i.id === parseInt(result[0]));
                tvodInfo[index].rentalExpiry = this.props.getTVODExpiryTime;
                setKey(LOCALSTORAGE.TVOD_DATA, tvodInfo);
            }
        }
    }

    showModal = (episode) => {
        let seriesProps = this.seriesProps();
        let commonProps = this.commonProps();
        this.setState({
            episode,
            modalType: BOTTOM_SHEET.PI_DETAIL_DESCRIPTION,
        }, () => {
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                this.props.openPIDetailMobilePopup();
            } else {
                moviePopup(window.innerWidth, { isShowMore: false, episode, seriesProps, commonProps })
            }
        })
    }

    playTrailer = async (contentTypeVal, id) => {
        const { meta, history } = this.props;
        if (!checkForNonIntegratedPartner(meta.provider, true)) return;
        await trackTrailerEvent(this.props, this.state);
        safeNavigation(history, `/${URL.TRAILER}/${contentTypeVal}/${id}`);
    };

    fetchSeasons = (contentType) => {
        return [CONTENTTYPE.TYPE_BRAND, CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL, CONTENTTYPE.TYPE_TV_SHOWS, CONTENTTYPE.TYPE_SERIES, CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL, CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL].includes(contentType)
    }

    setCWForPartner = async (useCWData = false, cwData) => {
        const { match: { params: { id } }, setContinueWatching, lastWatch, meta } = this.props;
        let contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];

        if (useCWData) {
            await setContinueWatching(
                cwData.id,
                1,
                cwData.totalDuration,
                cwData.contentType);
        } else {
            if (contentType === CONTENTTYPE.TYPE_BRAND || contentType === CONTENTTYPE.TYPE_TV_SHOWS || contentType === CONTENTTYPE.TYPE_SERIES) {
                await setContinueWatching(
                    lastWatch.id ? lastWatch.id : meta.vodId,
                    1
                    , meta.duration,
                    lastWatch.contentType ? lastWatch.contentType : meta.vodContentType ? meta.vodContentType : meta.contentType
                )
            } else {
                await setContinueWatching(
                    id,
                    1,
                    meta.duration,
                    contentType);
            }
        }
    }

    handleModal = () => {
        this.setState({
            episode: {},
            modalType: BOTTOM_SHEET.PI_DETAIL,
        }, () => {
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                this.props.openPIDetailMobilePopup();
            } else {
                moviePopup(window.innerWidth, { isShowMore: true })
            }
        });
        let updatedAnalyticsData = getCommonAnalyticsAttributes(MIXPANEL.EVENT.SYNOPSIS_MORE_CLICK, this.props, this.state);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SYNOPSIS_MORE_CLICK, updatedAnalyticsData.mixpanelData);
    };

    callTaLearnAction = () => {
        if (JSON.parse(getKey(LOCALSTORAGE.CALL_TO_LEARN_API))) {
            const { setLA, meta, detail, lastWatch } = this.props;
            const { id } = this.props.match.params;
            const refUseCase = get(this.props, 'history.location.state.refUseCase', '');

            let checkedId = lastWatch.secondsWatched > 0 ? id : meta.vodId;
            let checkedContentType = lastWatch.secondsWatched > 0 ? lastWatch.contentType : meta.vodContentType ? meta.vodContentType : meta.contentType;
            let data = {
                checkedContentType,
                learnAction: LEARN_ACTION_TYPE.SEARCH,
                checkedId,
                provider: meta.provider,
                setLA,
                refUseCase,
            };
            triggerLearnAction(data, detail, meta, true);
            setKey(LOCALSTORAGE.CALL_TO_LEARN_API, JSON.stringify(false))
        }
    }
    playLiveClick = async () => {
        const { openPopup, closePopup, openLoginPopup, liveMetaData, history, liveChannelMetaData, location } = this.props;
        const { id } = this.props?.match?.params;
        let contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];
        liveMetaData && (liveMetaData.partnerId = id);

        let isPlayable = await checkLivePlaybackEligibility(openPopup, closePopup, openLoginPopup, liveMetaData);
        
        if(isPlayable) {
            if (isLivePlayable(id)) {
                let mixpanelState = {
                    railTitle: location?.state?.railTitle,
                    source: location?.state?.source,
                    origin: location?.state?.prevPath,
                    railPosition: location?.state?.railPosition,
                    conPosition: location?.state?.conPosition,
                    sectionSource: location?.state?.sectionSource,
                    configType: location?.state?.configType,
                    sectionType: location?.state?.sectionType,
                    contentSectionSource: location?.state?.contentSectionSource,
                    refUseCase: location?.state?.refUseCase,
                };
    
                safeNavigation(history, {
                    pathname: `/${URL.PLAYER}/${contentType}/${id}`,
                    state: mixpanelState,
                });
            } else {
                let { isManagedApp, currentSubscription } = this.props;
                await openSubscriptionPopup({ currentSubscription, meta: liveChannelMetaData, history, isManagedApp });
                if (!isLivePlayable(id)) {
                    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_POPUP);
                }
            }
        }

    };
    render() {
        const {
            list, meta, code, lastWatch, match: { params: { id } }, detail, taRecommendationList,
            configResponse, currentSubscription, isFavouriteMarked, location
        } = this.props;
        let contentType = FORMATTED_CONTENT_TYPE[this.props.match?.params?.contentType];
        const { taRecommendedRail, episode, modalType, isLoading, isLiveDetail  } = this.state;
        let width = 926, height = 462;

        return (
            <Fragment>
                <MainSeo
                    metaTitle={this.state.metaTitle}
                    metaDescription={this.state.metaDescription}
                    metaName="robots"
                    metaContent="noindex,nofollow"
                />
                {meta && !this.props.status && !isLiveDetail && !isLoading &&
                    <div className="detail-container">
                        <div
                            className={`detail-background ${window.location.pathname.toString().includes('BRAND') && 'series-banner'}`}>
                            <img
                                src={`${cloudinaryCarousalUrl('', '', width, height)}${(meta.partnerBoxCoverImage || meta.partnerPosterImage || meta.boxCoverImage || meta.posterImage)}`}
                                alt="" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                    e.target.className = 'broken-image'
                                }} />
                        </div>
                        {
                            this.props.showPIDetailMobilePopup &&
                            <div className='pi-page-bottom-sheet'>
                                <BottomSheet onClose={this.props.hidePIDetailMobilePopup} big={true} episode={episode}
                                    type={modalType} />
                            </div>
                        }
                        <PIUpperContent meta={meta} contentType={contentType}
                            detail={detail}
                            handleModal={this.handleModal}
                            id={id}
                            isFavouriteMarked={isFavouriteMarked}
                            seriesList={this.props.seriesList}
                            lastWatch={lastWatch}
                            mixpanelData={this.state.mixpanelData}
                            seriesProps={this.seriesProps}
                            commonProps={this.commonProps}
                            movieProps={this.movieProps}
                            time_convert={this.time_convert}
                            parentContentType={meta.parentContentType}
                            currentSubscription={currentSubscription}
                        />
                        {this.fetchSeasons(contentType) &&
                            <Seasons
                                list={this.props.seriesList}
                                seriesId={meta.seriesId}
                                lastWatch={lastWatch}
                                title={getTitleAndDesc(meta, contentType)}
                                showModal={this.showModal}
                                mixpanelData={this.state.mixpanelData}
                                currentSubscription={currentSubscription}
                                recommendedLength={!taRecommendedRail ? list?.contentList?.length : taRecommendationList?.contentList?.length}
                                showEpisodeModal={this.handleModal}
                            />}
                        <PIRelatedRail taRecommendedRail={taRecommendedRail}
                            list={list}
                            meta={meta}
                            detail={detail}
                            configResponse={configResponse}
                            id={id}
                            contentType={contentType}
                            taRecommendationList={{ ...taRecommendationList, sectionType: MIXPANEL.VALUE.RECOMMENDATION }}
                            location = {location}
                        />
                    </div>}
                {isLiveDetail && <LiveContentDetail playLiveClick={this.playLiveClick} railId={location?.state?.railId}/>}   
                {code === 8 || !isEmpty(this.props.status) ? <ErrorPopup /> : null}
            </Fragment>)
    }
}


PIDetail.propTypes = {
    meta: PropTypes.object,
    detail: PropTypes.object,
    fetchPIData: PropTypes.func,
    fetchPIRecommendedData: PropTypes.func,
    list: PropTypes.object,
    contentType: PropTypes.string,
    id: PropTypes.string,
    checkWatchlistContent: PropTypes.func,
    getShemarooContent: PropTypes.func,
    clearContent: PropTypes.func,
    addWatchlist: PropTypes.func,
    history: PropTypes.object,
    match: PropTypes.object,
    seriesList: PropTypes.array,
    status: PropTypes.object,
    lastWatch: PropTypes.object,
    code: PropTypes.number,
    isFavouriteMarked: PropTypes.bool,
    setSearch: PropTypes.func,
    switchAccountDropDown: PropTypes.func,
    accountDropDown: PropTypes.func,
    notificationDropDown: PropTypes.func,
    location: PropTypes.object,
    openPopup: PropTypes.func,
    currentSubscription: PropTypes.array,
    configResponse: PropTypes.object,
    setContinueWatching: PropTypes.func,
    getTARecommendationRail: PropTypes.func,
    taRecommendationList: PropTypes.object,
    setLA: PropTypes.func,
    taShowType: PropTypes.string,
    secondsWatched: PropTypes.number,
    taRecommendationCode: PropTypes.number,
    hideMainLoader: PropTypes.func,
    showMainLoader: PropTypes.func,
    resetSeasonData: PropTypes.func,
    getZee5Tag: PropTypes.func,
    closePopup: PropTypes.func,
    profileDetails: PropTypes.object,
    fetchContinueWatchingDetails: PropTypes.func,
    getTVODExpiry: PropTypes.func,
    getTVODExpiryTime: PropTypes.string,
    showPIDetailMobilePopup: PropTypes.bool,
    openPIDetailMobilePopup: PropTypes.func,
    hidePIDetailMobilePopup: PropTypes.func,
    openLoginPopup: PropTypes.func,
    showMainLoaderImmediate: PropTypes.func,
    liveMetaData: PropTypes.object,
    isManagedApp: PropTypes.bool,
    liveChannelMetaData: PropTypes.object,
};

const mapStateToProps = (state) => ({
    meta: get(state.PIDetails.data, 'meta'),
    detail: get(state.PIDetails.data, 'detail'),
    code: get(state.PIDetails, 'code'),
    seriesList: get(state.PIDetails.data, 'seriesList'),
    lastWatch: get(state.PIDetails, 'continueWatchingDetails.data', {}),
    list: state.PIDetails.recommended,
    status: state.PIDetails.config,
    shemarooContent: get(state.PIDetail, 'shemarooContent'),
    isFavouriteMarked: get(state.PIDetails, 'continueWatchingDetails.data.isFavourite'),
    secondsWatched: get(state.PIDetails, 'continueWatchingDetails.data.secondsWatched'),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    configResponse: get(state.headerDetails, 'configResponse.data'),
    taRecommendationList: get(state.PIDetails, 'taRecommendation.data'),
    taRecommendationCode: get(state.PIDetails, 'taRecommendation.code'),
    profileDetails: get(state.profileDetails, 'userProfileDetails'),
    getTVODExpiryTime: get(state.PIDetails, 'tvodExpiryDetails.data.purchaseExpiry'),
    showPIDetailMobilePopup: get(state.PIDetails, 'showPIDetailMobilePopup'),
    liveMetaData: get(state.PIDetails, 'liveDetail.data.meta[0]'),
    liveChannelMetaData: get(state.PIDetails, 'liveDetail.data.channelMeta'),
    isManagedApp: get(state.headerDetails, "isManagedApp"),
});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            fetchPIData,
            fetchPIRecommendedData,
            getShemarooContent,
            clearContent,
            addWatchlist,
            checkWatchlistContent,
            setSearch,
            accountDropDown,
            switchAccountDropDown,
            notificationDropDown,
            openPopup,
            getTARecommendationRail,
            setContinueWatching,
            setLA,
            hideMainLoader,
            showMainLoader,
            resetSeasonData,
            getZee5Tag,
            closePopup,
            fetchContinueWatchingDetails,
            getTVODExpiry,
            openPIDetailMobilePopup,
            hidePIDetailMobilePopup,
            openLoginPopup,
            showMainLoaderImmediate,
        }, dispatch),
    }
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(PIDetail)
