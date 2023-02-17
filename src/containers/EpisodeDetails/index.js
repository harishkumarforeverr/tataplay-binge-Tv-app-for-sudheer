import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { showMainLoader } from "@src/action";
import backArrowImage from "@assets/images/back-arrow.png";
import searchImage from "@assets/images/search.png";
import { openMobilePopup } from '../Languages/APIs/actions'
import crossImage from "@assets/images/cross.png";

import "./styles.scss";
import {
    fetchSearchPIData,
    fetchSeasonData,
    resetSeasonData,
} from "@components/Seasons/APIs/actions";
import { fetchPIData, clearContent, fetchContinueWatchingDetails } from "@containers/PIDetail/API/actions";
import BottomSheet from '@common/BottomSheet';
import PropTypes from "prop-types";
import { get } from "lodash";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    isMobile,
    safeNavigation,
    horizontalScroll,
    getAnalyticsContentType,
    getAnalyticsSource,
    time_convert,
    initialArrowState,
    getContentLanguage,
    getPrimaryLanguage,
    isFreeContentMixpanel,
    isFreeContentEvent,
} from "@utils/common";
import { CONTENTTYPE, BOTTOM_SHEET, MOBILE_BREAKPOINT, LAYOUT_TYPE, LOCALSTORAGE, PARTNER_SUBSCRIPTION_TYPE } from "@constants";
import { moviePopup, getAnalyticsRailCategory, isUserloggedIn } from '@utils/common';
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import PaginationLoader from "../../common/PaginationLoader";
import EpisodeListItem from "@src/common/EpisodeListItem";
import { URL } from "@routeConstants";
import isEmpty from "lodash/isEmpty";
import { getParentContentData } from "@containers/PIDetail/PIDetailCommon";
import { EpisodeSearchBlock } from "@containers/EpisodeDetails/components/EpisodeSearchBlock";
import { EpisodeSeasonsTray } from "@containers/EpisodeDetails/components/EpisodeSeasonsTray";
import { EpisodeResult } from "@containers/EpisodeDetails/components/EpisodeResult";
import { fetchEpisodeDetailsHistory } from './EpisodeDetails';
import { getKey } from "@utils/storage";



const PAGINATION_LIMIT = 10;
const HANDLE_OFFSET = 10;
const PAGE_NUMBER = 1;

class EpisodeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offset: 0,
            searchText: "",
            limit: PAGINATION_LIMIT,
            seriesId: "",
            episode: {},
            leftSeasonArrow: false,
            rightSeasonArrow: false,
            pageNumber: 1,
        };
    }

    async componentDidMount() {
        const seasonId = this.props?.location?.state?.seriesId;
        seasonId && this.setState({ seriesId: seasonId });
        await this.apiCall();
        window.addEventListener("resize", this.handleOnResize);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEE_ALL_EPISODES, this.getAnalyticsData(MIXPANEL));
    }

    componentDidUpdate = async (previousProps, previousState) => {
        let currentSeason;
        if (
            previousProps.seriesList &&
            previousProps.seriesList.length > 0 &&
            this.props.seriesList &&
            this.props.seriesList.length > 0
        ) {
            if (previousProps.seriesList[0].id !== this.props.seriesList[0].id) {
                currentSeason = this.props?.meta?.seriesId;
            }
            if (
                get(previousProps, "lastWatch.seriesId") !== undefined &&
                get(previousProps, "lastWatch.seriesId") !== null &&
                get(this.props, "lastWatch.seriesId") !== undefined &&
                get(this.props, "lastWatch.seriesId") !== null &&
                parseInt(previousProps?.lastWatch?.seriesId) !==
                parseInt(this.props?.lastWatch?.seriesId)
            ) {
                currentSeason = this.props?.meta?.seriesId;
            }
        }

        !isEmpty(currentSeason) && await this.fetchDataForSeasons(currentSeason);
    }

    componentWillUnmount() {
        if (!this.props.history?.location?.pathname?.includes(URL.DETAIL)) {
            this.props.clearContent();
            this.props.resetSeasonData();
        } else {
            this.props.resetSeasonData();
            this.props.fetchSeasonData(
                this.props.meta?.seriesId,
                PAGINATION_LIMIT,
                0,
            );
        }
    };

    getAnalyticsData = (analytics) => {
        const { meta, detail, match: { params: { contentType } }, location, currentSubscription } = this.props;
        let title = meta.contentType === CONTENTTYPE.TYPE_MOVIES ? meta.vodTitle : (meta.brandTitle || meta.seriesTitle || meta.vodTitle || meta.title)
        const { source, conPosition, sectionSource, railTitle, railPosition, sectionType, contentSectionSource } = location.state || {}
        let { updatedId, updatedContentType } = getParentContentData(this.props.meta);
        let isFreeContent = isFreeContentMixpanel(meta);
        let mixpanelData = {
            [`${analytics.PARAMETER.CONTENT_TITLE}`]: title,
            [`${analytics.PARAMETER.CONTENT_GENRE}`]: meta?.genre?.join(),
            [`${analytics.PARAMETER.PARTNER_NAME}`]: meta.provider,
        };
        let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || [];
        const contentAuth = (isFreeContentEvent(detail.contractName, partnerInfo, meta.partnerId, currentSubscription?.subscriptionStatus) ||
            (meta?.partnerSubscriptionType?.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()))

        mixpanelData[`${MIXPANEL.PARAMETER.FREE_CONTENT}`] = meta.freeEpisodesAvailable ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_RATING}`] = meta.rating;
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL}`] = railTitle || '';
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE}`] = getContentLanguage(this.props?.meta?.audio) || '';
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL_POSITION}`] = railPosition;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_GENRE_PRIMARY}`] = meta?.genre[0] || "";
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE_PRIMARY}`] = getPrimaryLanguage(meta?.audio) || "";
        mixpanelData[`${MIXPANEL.PARAMETER.RELEASE_YEAR}`] = meta.releaseYear || "";
        mixpanelData[`${MIXPANEL.PARAMETER.DEVICE_TYPE}`] = MIXPANEL.VALUE.WEB;
        mixpanelData[`${MIXPANEL.PARAMETER.ACTOR}`] = meta?.actor.join() || '';
        mixpanelData[`${MIXPANEL.PARAMETER.PACK_NAME}`] = currentSubscription?.productName;
        mixpanelData[`${MIXPANEL.PARAMETER.PACK_PRICE}`] = currentSubscription?.amountValue;
        mixpanelData[`${MIXPANEL.PARAMETER.SOURCE}`] = source;
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL_TYPE}`] = sectionSource;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_TYPE}`] = contentSectionSource;
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`] = getAnalyticsRailCategory(sectionType, MIXPANEL);
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_AUTH}`] =  contentAuth ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_CATEGORY}`] = updatedContentType;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_POSITION}`] = conPosition;
        mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_PARENT_TITLE}`] = title;
        mixpanelData[`${MIXPANEL.PARAMETER.LIVE_CONTENT}`] = MIXPANEL.VALUE.NO;
        mixpanelData[`${MIXPANEL.PARAMETER.PACK_TYPE}`] = currentSubscription?.productName;
        mixpanelData[`${MIXPANEL.PARAMETER.AUTO_PLAYED}`] = MIXPANEL.VALUE.NO;
        mixpanelData[`${MIXPANEL.PARAMETER.PAGE_NAME}`] = getAnalyticsSource(this.props.location.pathname, MIXPANEL);

        return mixpanelData
    }

    handleOnResize = () => {
        horizontalScroll(
            "seasons-list",
            this,
            "leftSeasonArrow",
            "rightSeasonArrow",
        );
    };

    async apiCall() {
        let contentTypeVal;
        const {
            match: {
                params: { contentType, id },
            },
            fetchPIData,
            fetchContinueWatchingDetails,
            location
        } = this.props;
        const { url } = this.props.match;
        if (url.indexOf(URL.SERIESDETAIL) !== -1) {
            contentTypeVal = this.setContentType(contentType);
        } else {
            contentTypeVal = contentType;
        }
        showMainLoader();
        await fetchPIData(id, contentTypeVal);
        let { updatedId, updatedContentType } = getParentContentData(this.props.meta);
        await fetchContinueWatchingDetails(updatedId, updatedContentType, this.props.meta?.partnerId);
        await this.fetchDataForSeasons(this.state.seriesId);
        initialArrowState("seasons-list", this, "rightSeasonArrow");
    }

    async fetchDataForSeasons(seasonId) {
        let currentSeason;
        let { lastWatch } = this.props;
        if (seasonId) {
            currentSeason = seasonId;
        } else {
            if (isEmpty(this.props?.seriesList)) {
                currentSeason = this.props?.meta?.seriesId;
            } else if (!isEmpty(this.props.seriesList)) {
                if (lastWatch && lastWatch?.seriesId) {
                    currentSeason = parseInt(lastWatch?.seriesId);
                } else {
                    currentSeason = this.props.seriesList[0].id;
                }
            }
        }

        this.setState({
            seriesId: currentSeason,
        });

        currentSeason && await this.props.fetchSeasonData(
            currentSeason,
            PAGINATION_LIMIT,
            this.state.offset,
        );
        await fetchEpisodeDetailsHistory(currentSeason);
    }

    showModal = (episode) => {
        this.setState({
            episode,
        }, () => {
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                this.props.openMobilePopup();
            } else {
                moviePopup(window.innerWidth, { isShowMore: false, episode: episode, meta: this.props.meta })
            }
        })
    }

    getHoverView = (item) => {
        return (
            <div className="sports-rail-item">
                <span className="sports-duration-detail">
                    {time_convert(item?.totalDuration, false)}
                </span>
                <div className="sport-rail-detail bottom-desc-padding">
                    <span className="play">
                        <img
                            className="play-video-icon"
                            alt="play-vedio-icon"
                            src={`../../assets/images/play-next-circle.svg`}
                        />
                    </span>
                    <span className="sports-video-title">{item.title}</span>
                    <span
                        className="three-dots"
                        data-tip="Know more"
                        data-effect="solid"
                        data-offset="{'left': 30}"
                        onClick={e => {
                            this.showModal(item);
                            e.stopImmediatePropagation();
                        }} >
                        <img
                            className="three-dots-icon"
                            alt="three-dots-icon"
                            src={`../../assets/images/three-dots.png`}
                        />
                    </span>
                </div>
            </div>
        );
    };

    loadMoreDetails() {
        if (!isEmpty(this.state.searchText)) {
            this.setState(
                {
                    pageNumber: this.state.pageNumber + PAGE_NUMBER,
                },
                async () => {
                    await this.searchEpisodeAPICall(this.state.searchText, true);
                },
            );
        } else {
            this.setState(
                {
                    offset: this.state.offset + HANDLE_OFFSET,
                },
                async () => {
                    await this.props.fetchSeasonData(
                        this.state.seriesId,
                        this.state.limit,
                        this.state.offset,
                        true,
                    );
                },
            );
        }
    }

    fetchSeasonDetail(id) {
        this.setState(
            {
                limit: PAGINATION_LIMIT,
                seriesId: id,
                offset: 0,
            },
            async () => {
                await this.props.fetchSeasonData(id, PAGINATION_LIMIT, this.state.offset);
            },
        );
    }

    searchEpisode = e => {
        const searchStr = e.target.value;
        this.setState({
            seriesId: searchStr
                ? null
                : this.props.meta?.seriesId,
            searchText: searchStr
        });
        if (isEmpty(searchStr)) {
            this.props.fetchSeasonData(
                this.props.meta?.seriesId,
                PAGINATION_LIMIT,
                this.state.offset,
            );
        } else {
            this.searchEpisodeAPICall(searchStr);
        }
    }

    searchEpisodeAPICall = (searchStr = this.state.searchText, loadPagination = false) => {
        let data = {
            queryString: searchStr,
            id:
                this.props.meta.parentContentType ===
                    CONTENTTYPE.TYPE_BRAND
                    ? this.props.meta.brandId
                    : this.props.meta.seriesId,
            parentType: this.props.meta.parentContentType,
            pageNumber: this.state.pageNumber,
        };
        this.props.fetchSearchPIData(data, loadPagination);
    }

    resetOnBackArrowClick = () => {
        this.props.history.goBack()
    }

    searchCrossClick = () => {
        if (this.state.searchText.length > 0) {
            this.setState({
                searchText: "",
                seriesId: this.props.meta?.seriesId,
            });
            this.props.fetchSeasonData(
                this.props.meta?.seriesId,
                PAGINATION_LIMIT,
                this.state.offset,
            );
        }
    }

    allClick = () => {
        this.setState({ seriesId: null });
        this.searchEpisodeAPICall();
    }

    spaceCheck = (e) => {
        const searchStr = e.target.value?.trim();
        if (isEmpty(searchStr) && e.which === 32) {
            e.preventDefault();
            return false;
        }
    }

    render() {
        const { detail, loadMore, seriesList, showMobilePopup } = this.props;
        let { episode, leftSeasonArrow, rightSeasonArrow, searchText, seriesId } = this.state;

        return (
            <Fragment>
                <div className="search-section">
                    <div className="episode-details section">
                        <EpisodeSearchBlock resetOnBackArrowClick={this.resetOnBackArrowClick}
                            searchEpisode={(e) => this.searchEpisode(e)}
                            searchCrossClick={this.searchCrossClick}
                            searchText={searchText}
                            spaceCheck={(e) => this.spaceCheck(e)}
                        />
                    </div>
                    {!isEmpty(searchText) && loadMore && detail.length > 0 && (
                        <p className="total-season-list">
                            {loadMore} Results from {`"${searchText}"`}
                        </p>
                    )}
                    <EpisodeSeasonsTray detail={detail}
                        leftSeasonArrow={leftSeasonArrow}
                        rightSeasonArrow={rightSeasonArrow}
                        searchText={searchText}
                        seriesId={seriesId}
                        seriesList={seriesList}
                        allClick={this.allClick}
                        fetchSeasonDetail={(id) => this.fetchSeasonDetail(id)}
                        seasonsScroll={() => horizontalScroll("seasons-list", this, "leftSeasonArrow", "rightSeasonArrow")}
                    />

                    {detail && detail.length === 0 && searchText !== "" && (
                        <p className='search-no-result'>No results found</p>
                    )}

                    <EpisodeResult detail={detail} loadMore={loadMore} showModal={this.showModal} loadMoreDetails={() => this.loadMoreDetails()} />
                </div>
                {showMobilePopup && <div className='pi-page-bottom-sheet'><BottomSheet big={true} episode={episode} type={BOTTOM_SHEET.PI_DETAIL_DESCRIPTION} /></div>}
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    detail: get(state.seasonReducer, "items"),
    loadMore: get(state.seasonReducer, "total"),
    contentList: get(state.seasonReducer, "contentList"),
    itemCount: get(state.seasonReducer, "itemCount"),
    meta: get(state.PIDetails.data, "meta"),
    seriesList: get(state.PIDetails.data, "seriesList"),
    showMobilePopup: get(state.languageReducer, 'showMobilePopup'),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    lastWatch: get(state.PIDetails, 'continueWatchingDetails.data', {}),
    episodeDetailsData: get(state.seasonReducer, "episodeDetails.data"),
});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(
            {
                fetchSearchPIData,
                fetchSeasonData,
                fetchPIData,
                openMobilePopup,
                clearContent,
                resetSeasonData,
                fetchContinueWatchingDetails,
            },
            dispatch,
        ),
    };
};

EpisodeDetails.propTypes = {
    fetchSeasonData: PropTypes.func,
    detail: PropTypes.array,
    loadMore: PropTypes.number,
    fetchSearchPIData: PropTypes.func,
    history: PropTypes.object,
    fetchPIData: PropTypes.func,
    seriesList: PropTypes.array,
    meta: PropTypes.object,
    contentList: PropTypes.object,
    match: PropTypes.object,
    openMobilePopup: PropTypes.func,
    showMobilePopup: PropTypes.bool,
    location: PropTypes.object,
    clearContent: PropTypes.func,
    resetSeasonData: PropTypes.func,
    fetchContinueWatchingDetails: PropTypes.func,
    lastWatch: PropTypes.object,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(EpisodeDetails);
