import React, { Component, Fragment } from 'react';
import PropTypes from "prop-types";
import { clearContent, editorialSeeAll } from './APIs/actions';
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty';
import { connect } from "react-redux";

import ListingItem from "@common/ListingItem";
import './style.scss';
import { COMMON_ERROR, CONTENTTYPE, LAYOUT_TYPE, TA_MAX_CONTENT } from "@constants";
import { URL } from "@constants/routeConstants";
import {
    clearContent as PIClearContent,
    fetchPIRecommendedData,
    getTARecommendationRail,
} from "@containers/PIDetail/API/actions";
import { fetchContinueWatchingData, fetchTARailData, fetchTVODData, resetHomeData } from "@containers/Home/APIs/actions";
import { fetchWatchlistItems, clearWatchlistData } from "@containers/Watchlist/API/action";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import moengageConfig from "@utils/moengage";

import InfiniteScroll from "react-infinite-scroll-component";
import AppListing from "./AppListing/index";
import { bindActionCreators } from "redux";
import { SEE_ALL_LIMIT } from "@containers/SeeAll/APIs/constant";
import { isMobile, safeNavigation, getAnalyticsRailCategory } from "@utils/common";
import { getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";
import PaginationLoader from "@src/common/PaginationLoader";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";
import { openErrorPopup } from "@common/Modal/action";
import { withRouter } from "react-router-dom";

class SeeAll extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recommended: false,
            continueWatching: false,
            watchListSeeAll: false,
            isTVOD: false,
            taRecommended: false,
            taSeeAll: false,
            vrSeeAll: false,
            vrRecommended: false,
            fetchedTAData: false,
            renderPage: false,
        }
        this.offset = 0;
    }

    componentDidMount = async () => {
        const {
            match: { params, url },
            fetchContinueWatchingData,
            editorialSeeAll,
            fetchTVODData,
            location,
            fetchWatchlistItems,
        } = this.props;
        const { railTitle } = location?.state || {};
        let updatedUrl = url.split("/");
        const { id } = params;
        try {
            if (updatedUrl[1] === URL.RECOMMENDED_SEE_ALL) {
                await this.loadRecommendedSeeAll();
            } else if (updatedUrl[1] === URL.CONTINUE_WATCHING_SEE_ALL) {
                this.setState({ continueWatching: true });
                await fetchContinueWatchingData(this.offset, true, false, true);
                this.handleDefaultLoading();
            } else if (updatedUrl[1] === URL.WATCHLIST_SEE_ALL) {
                this.setState({ watchListSeeAll: true });
                await fetchWatchlistItems();
                isEmpty(this.props.watchlistItems) && this.props.openErrorPopup("Content not found!", null, () => safeNavigation(this.props.history, '/'))
                this.handleDefaultLoading();
            } else if (updatedUrl[1] === URL.TVOD) {
                this.setState({ isTVOD: true });
                await fetchTVODData(0, 20, true);
            } else if (updatedUrl[1] === URL.TA_SEE_ALL) {
                await this.loadTASeeAll();
            } else {
                this.setState({ vrSeeAll: true });
                await editorialSeeAll(id, 0, true);
                this.handleDefaultLoading();
            }
        }
        catch (e) {
            console.log("seeAllError", e);
            this.props.openErrorPopup("Content not found!", null, () => safeNavigation(this.props.history, '/'))
            return;
        }
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEE_ALL, this.trackAnalytics(MIXPANEL));
        moengageConfig.trackEvent(MOENGAGE.EVENT.SEE_ALL, this.trackAnalytics(MOENGAGE));
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SEE_ALL, {
            [APPSFLYER.PARAMETER.RAIL_TITLE]: railTitle,
            [APPSFLYER.PARAMETER.SOURCE]: "",
        });
    };

    componentDidUpdate = async (prevProps) => {
        if (this.props.loggedStatus !== prevProps.loggedStatus) {
            setTimeout(() => this.setState({
                renderPage: true,
            }), 0);
        }
    }

    componentWillUnmount = async () => {
        const { PIClearContent, resetHomeData, clearContent, clearWatchlistData } = this.props;
        await clearContent();
        await PIClearContent();
        await resetHomeData();
        await clearWatchlistData();
    }

    /**
     * @function handleDefaultLoading - to call API to fetch data when count is less than default count
     * @returns {Promise<void>}
     */
    handleDefaultLoading = async () => {
        const {
            match: { params },
            editorialSeeAll,
            continueWatchingDetail,
            fetchContinueWatchingData,
            recommendedDetail,
            recommendedExactCount,
            fetchPIRecommendedData,
            contentList,
            seeAllContentDetail,
            seeAllExactCount,
            seeAllFilteredCount,
            watchListData,
            watchlistItems,
            fetchWatchlistItems,
        } = this.props;
        const { id, contentType } = params;
        let { continueWatching, recommended, vrRecommended, watchListSeeAll } = this.state;
        if (recommended && vrRecommended && recommendedExactCount !== recommendedDetail.totalCount &&
            recommendedExactCount < SEE_ALL_LIMIT) {
            let result = id.split("?"), recommendedData = {
                seeAll: true,
                id: result[0],
                contentType: contentType,
                from: recommendedExactCount,
                max: 10,
                preferredLanguages: 'English',
            };
            await fetchPIRecommendedData(recommendedData, true);
        } else if (continueWatching && continueWatchingDetail.continuePagination && contentList?.length < SEE_ALL_LIMIT) {
            this.offset++;
            await fetchContinueWatchingData(this.offset, true, continueWatchingDetail.pagingState);
            this.handleDefaultLoading();
        } else if (watchListSeeAll && watchListData?.continuePaging && watchlistItems?.length < SEE_ALL_LIMIT) {
            await fetchWatchlistItems(false, get(watchListData, "pagingState"));
            this.handleDefaultLoading();
        }
        else if (seeAllContentDetail?.totalCount !== seeAllExactCount &&
            seeAllContentDetail.updatedCount + seeAllFilteredCount < SEE_ALL_LIMIT) {
            await editorialSeeAll(id, seeAllExactCount);
            this.handleDefaultLoading();
        }
    }

    loadRecommendedSeeAll = async () => {
        const {
            match: { params }, fetchPIRecommendedData, location,
        } = this.props;
        const {
            isTVOD,
            taShowType,
            taRelatedRail,
            taRecommendedRail,
        } = location.state || {};
        const { id, contentType } = params;

        setTimeout(() => this.setState({ recommended: true }), 500);
        let result = id.split("?");
        let data = taShowType.split('-');
        let content = data[1];
        if (taRecommendedRail && !isTVOD) {
            setTimeout(() => this.setState({ taRecommended: true }), 500);
            await this.fetchTARecommendedData(result[0], content, taRelatedRail);
        } else {
            let recommendedData = {
                seeAll: true,
                id: result[0],
                contentType: contentType,
                from: 0,
                max: 10,
                preferredLanguages: 'English',
            };
            setTimeout(() => this.setState({ vrRecommended: true }), 500);
            await fetchPIRecommendedData(recommendedData, true);
            this.handleDefaultLoading();
        }
    }

    loadTASeeAll = async () => {
        const {
            match: { params, url }, editorialSeeAll, fetchTARailData, location,
        } = this.props;
        const {
            layoutType,
            placeHolder,
            railTitle,
            mixedRail,
            recommendationPosition,
            isPartnerPage,
            provider,
        } = location.state || {};
        url.split('/');
        const { id } = params;

        setTimeout(() => this.setState({ taSeeAll: true }), 1);
        let data = {
            max: TA_MAX_CONTENT.TA_MAX_RECOMMEND,
            layout: layoutType,
            placeHolder,
            id,
            railTitle,
            seeAll: true,
            mixedRail,
            recommendationPosition,
            isPartnerPage,
            provider,
        };
        mixedRail && await editorialSeeAll(id, 0, true);
        // if(isUserloggedIn()) {
        await fetchTARailData(data);
        this.setState({
            fetchedTAData: true,
        });
        // }
    }

    async fetchTARecommendedData(id, contentType, taRelatedRail) {
        const { getTARecommendationRail, location } = this.props;
        const { provider } = location.state || {};
        let data = taRelatedRail && taRelatedRail.filter(item => item.contentType === contentType);
        let useCase = data && data[0].useCase;
        let result = {
            contentType: contentType,
            placeholder: useCase,
            id: id,
            layout: LAYOUT_TYPE.LANDSCAPE,
            provider: provider,
            max: TA_MAX_CONTENT.TA_MAX,
        };
        data && await getTARecommendationRail(result, true, true);
    }

    trackAnalytics = (analytics) => {
        const { location, } = this.props;
        const {
            railPosition = '',
            configType = '',
            railTitle = '',
            pageName = '',
            isPartnerPage = false,
            provider = '',
            sectionType = ''
        } = location.state || {};
        let position = pageName === analytics.VALUE.CONTENT_DETAIL ? 1 : parseInt(railPosition);
        let searchParams = new URLSearchParams(location.state);
        const sectionSource = searchParams.get("sectionSource");

        return {
            [`${analytics.PARAMETER.PAGE_NAME}`]: pageName || '',
            [`${analytics.PARAMETER.CONFIG_TYPE}`]: configType,
            [`${analytics.PARAMETER.PARTNER}`]: isPartnerPage ? provider : analytics.VALUE.MIX,
            [`${analytics.PARAMETER.RAIL_TITLE}`]: railTitle,
            [`${analytics.PARAMETER.RAIL_POSITION}`]: position,
            [`${analytics.PARAMETER.PARTNER_HOME}`]: isPartnerPage ? analytics.VALUE.YES : analytics.VALUE.NO,
            [`${analytics.PARAMETER.RAIL_TYPE}`]: sectionSource || "",
            [`${analytics.PARAMETER.RAIL_CATEGORY}`]: getAnalyticsRailCategory(sectionType, MIXPANEL),

        };
    };

    loadMore = async () => {
        const {
            match: { params, url },
            fetchContinueWatchingData,
            continueWatchingDetail,
            editorialSeeAll,
            recommendedExactCount,
            fetchPIRecommendedData,
            seeAllExactCount,
            location,
            watchListData,
            fetchWatchlistItems,
        } = this.props;
        let updatedUrl = url.split('/');
        const { id, contentType } = params;
        const { isTVOD, taRecommendedRail } = location.state || {};

        if (updatedUrl[1] === URL.RECOMMENDED_SEE_ALL) {
            let result = id.split("?"),
                recommendedData = {
                    seeAll: true,
                    id: result[0],
                    contentType: contentType,
                    from: recommendedExactCount,
                    max: 10,
                    preferredLanguages: 'English',
                };
            this.setState({ recommended: true });
            !(taRecommendedRail && !isTVOD && contentType !== CONTENTTYPE.TYPE_WEB_SHORTS) &&
                await fetchPIRecommendedData(recommendedData);

        } else if (updatedUrl[1] === URL.CONTINUE_WATCHING_SEE_ALL) {
            this.setState({ continueWatching: true });
            this.offset++;
            await fetchContinueWatchingData(this.offset, true, continueWatchingDetail.pagingState);
        } else if (updatedUrl[1] === URL.WATCHLIST_SEE_ALL) {
            this.setState({ watchListSeeAll: true });
            await fetchWatchlistItems(false, get(watchListData, "pagingState"));
        } else {
            await editorialSeeAll(id, seeAllExactCount);
        }
    }

    checkMore = (detail) => {
        const {
            seeAllContentDetail,
            recommendedDetail = [],
            continueWatchingDetail,
            recommendedExactCount,
            seeAllExactCount,
            watchListData,
        } = this.props;
        return (
            continueWatchingDetail?.continuePagination ||
            watchListData?.continuePaging ||
            (!isEmpty(seeAllContentDetail) && seeAllExactCount < seeAllContentDetail.totalCount) ||
            (!isEmpty(recommendedDetail) && recommendedExactCount < detail.totalCount));
    }

    getListingData = () => {
        const {
            seeAllContentDetail,
            recommendedDetail = [],
            continueWatchingDetail,
            contentList,
            tvodDetail,
            taRecommendationList,
            taRailData,
            watchListData,
            watchlistItems,
        } = this.props;
        const { recommended, taRecommended, isTVOD, taSeeAll, watchListSeeAll, continueWatching } = this.state;
        if (recommended) {
            if (taRecommended) {
                return taRecommendationList;
            } else {
                return recommendedDetail;
            }
        } else if (!isEmpty(contentList) && continueWatching) {
            return continueWatchingDetail;
        } else if (!isEmpty(watchlistItems) && watchListSeeAll) {
            return watchListData;
        } else if (isTVOD) {
            return tvodDetail;
        } else if (taSeeAll) {
            // return isUserloggedIn() ? taRailData : seeAllContentDetail;
            return taRailData;
        } else {
            return seeAllContentDetail;
        }
    }

    setContentList = (detail) => {
        const {
            continueWatchingDetail,
            contentList,
            seeAllContentList,
            seeAllRecommendContentList,
            tvodDetail,
            taRailData,
            taRecommendationList,
            watchListData,
            watchlistItems,
        } = this.props;
        const { recommended, taRecommended, isTVOD, taSeeAll, vrSeeAll, continueWatching, watchListSeeAll } = this.state;

        if (!isEmpty(continueWatchingDetail) && continueWatching) {
            return contentList;
        }
        else if (!isEmpty(watchListData) && watchListSeeAll) {
            return watchlistItems;
        }
        else if (detail && recommended === true) {
            if (!taRecommended) {
                return seeAllRecommendContentList;
            } else {
                return taRecommendationList?.contentList;
            }
        }
        //  else if (taSeeAll) {
        //     return isUserloggedIn() ? taRailData.contentList : seeAllContentList;
        // }
        else if (taSeeAll) {
            return taRailData.contentList;
        }
        else if (detail && vrSeeAll) {
            return seeAllContentList;
        }
        if (isTVOD && !isEmpty(tvodDetail)) {
            return tvodDetail.items;
        }
    }

    showErrorMsg = (detail) => {
        const { taSeeAll, fetchedTAData } = this.state;
        if (!(detail.contentList && detail.contentList.length > 0)) {
            return taSeeAll && fetchedTAData;
        }
    }

    getSeeAllTitle = (detail) => {
        const { location } = this.props;
        const { continueWatching, watchListSeeAll } = this.state;
        const { railTitle } = location?.state || {};
        if (continueWatching || watchListSeeAll) {
            return railTitle;
        } else {
            return detail?.title ? detail.title : railTitle;
        }
    }

    render() {
        const { location, currentSubscription, getCurrentSubscriptionInfo } = this.props;
        const routeName = location?.state?.routeName;
        const { isTVOD, renderPage, watchListSeeAll } = this.state;
        const { sectionSource, configType, sectionType, railPosition, refUseCase } = location?.state || {};
        let detail = this.getListingData();
        let appView = detail && detail.layoutType === LAYOUT_TYPE.CIRCULAR;

        if (detail) {
            detail.contentList = this.setContentList(detail);
            detail.layoutType = (isTVOD || watchListSeeAll) && !detail.layoutType ? LAYOUT_TYPE.LANDSCAPE : detail.layoutType;
        }
        return (
            <Fragment>
                {!appView && detail &&
                    <div className="seeall-content">
                        <h3>{this.getSeeAllTitle(detail)}</h3>
                        <ul className={`seeall grid-view listing-${detail.layoutType && detail.layoutType.toLowerCase()
                            } `}>
                            {detail.contentList && detail.contentList.length > 0 ?
                                <InfiniteScroll
                                    dataLength={detail.contentList && detail.contentList.length}
                                    next={this.loadMore}
                                    hasMore={this.checkMore(detail)}
                                    scrollThreshold={isMobile.any() ? 0.3 : 0.8}
                                    loader={<PaginationLoader />}
                                >
                                    {detail.contentList.map((item, index) =>
                                        <ListingItem
                                            sectionSource={sectionSource}
                                            pageType="seeAll"
                                            item={item}
                                            key={item.id}
                                            view={detail.layoutType}
                                            title={detail.title}
                                            subscribed={true}
                                            routeName={routeName}
                                            isToolTipRequired={true}
                                            sectionType={sectionType}
                                            configType={configType}
                                            contentPosition={index}
                                            railPosition={railPosition}
                                            isContinueWatching={this.state.continueWatching}
                                            // isWatchlist={this.state.watchListSeeAll}
                                            classNameSetHover="set-hover-seeall"
                                            refUseCase={refUseCase}
                                        />)}
                                </InfiniteScroll>
                                : this.showErrorMsg(detail) && <p>{COMMON_ERROR.SOME_ERROR}</p>}
                        </ul>
                    </div>
                }
                {
                    appView && <AppListing detail={detail} renderPage={renderPage}
                        currentSubscription={currentSubscription}
                        getCurrentSubscriptionInfo={getCurrentSubscriptionInfo} />
                }
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    seeAllContentDetail: state.seeAll.seeAllResult,
    recommendedDetail: state.PIDetails.recommended,
    recommendedExactCount: state.PIDetails.exactCount,
    seeAllExactCount: state.seeAll.exactCount,
    seeAllFilteredCount: state.seeAll.updatedCount,
    continueWatchingDetail: get(state.homeDetails, 'continueWatchingData', {}),
    contentList: get(state.homeDetails, 'contentList', []),
    seeAllContentList: get(state.seeAll, 'contentList', []),
    seeAllRecommendContentList: get(state.PIDetails, 'contentList', []),
    tvodDetail: get(state.homeDetails, 'tvodData', []),
    taRecommendationList: get(state.PIDetails, 'taRecommendation.data'),
    taRailData: get(state, 'homeDetails.taRailData', {}),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription'),
    loggedStatus: state.commonContent.loggedStatus,
    watchListData: get(state.watchlist, "watchListData"),
    watchlistItems: get(state.watchlist, "watchlistItems"),
});

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators(
        {
            editorialSeeAll,
            fetchPIRecommendedData,
            fetchContinueWatchingData,
            fetchWatchlistItems,
            clearContent,
            fetchTVODData,
            getTARecommendationRail,
            PIClearContent,
            resetHomeData,
            fetchTARailData,
            getCurrentSubscriptionInfo,
            openErrorPopup,
            clearWatchlistData
        },
        dispatch
    ),
});

SeeAll.propTypes = {
    seeAllContentDetail: PropTypes.object,
    continueWatchingDetail: PropTypes.object,
    editorialSeeAll: PropTypes.func,
    fetchPIRecommendedData: PropTypes.func,
    fetchContinueWatchingData: PropTypes.func,
    fetchWatchlistItems: PropTypes.func,
    fetchTVODData: PropTypes.func,
    clearContent: PropTypes.func,
    id: PropTypes.string,
    list: PropTypes.array,
    recommendedDetail: PropTypes.array,
    match: PropTypes.object,
    contentList: PropTypes.array,
    seeAllContentList: PropTypes.array,
    seeAllRecommendContentList: PropTypes.array,
    location: PropTypes.object,
    tvodDetail: PropTypes.object,
    getTARecommendationRail: PropTypes.func,
    taRecommendationList: PropTypes.object,
    PIClearContent: PropTypes.func,
    resetHomeData: PropTypes.func,
    fetchTARailData: PropTypes.func,
    taRailData: PropTypes.object,
    recommendedExactCount: PropTypes.number,
    seeAllExactCount: PropTypes.number,
    seeAllUpdatedCount: PropTypes.number,
    seeAllFilteredCount: PropTypes.number,
    currentSubscription: PropTypes.object,
    getCurrentSubscriptionInfo: PropTypes.func,
    loggedStatus: PropTypes.bool,
    openErrorPopup: PropTypes.func,
    history: PropTypes.object,
    watchListData: PropTypes.object,
    watchlistItems: PropTypes.array,
    clearWatchlistData: PropTypes.func
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SeeAll));
