import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import {withRouter} from "react-router";
import get from "lodash/get";
import {fetchSeasonData} from "./APIs/actions";
import ReactTooltip from 'react-tooltip';
import "./style.scss";
import {
    horizontalScroll,
    initialArrowState,
    playContent,
    isMobile,
    isUserloggedIn,
    getTimeline,
    time_convert,
    safeNavigation,
    contentType,
    showCrown,
} from "@utils/common";
import Listing from "@common/Listing";
import PropTypes from "prop-types";
import {LAYOUT_TYPE, SECTION_SOURCE, SECTION_TYPE} from "@constants";
import isEmpty from "lodash/isEmpty";
import {URL} from "@routeConstants";
import {fetchEpisodeDetailsHistory} from '@containers/EpisodeDetails/EpisodeDetails';
import {fireProductLandingCtasEvent} from "@containers/PIDetail/PIDetailCommon";
import DATALAYER from "@utils/constants/dataLayer";
import PlayNext from '@assets/images/play-next-circle.svg';
import ThreeDots from '@assets/images/three-dots.png';

const PAGINATION_LIMIT = 10;

class Seasons extends Component {
    constructor(props) {
        super(props);
        const sIndex = this.props.meta?.season - 1;
        this.state = {
            offset: 0,
            limit: PAGINATION_LIMIT,
            leftSeasonArrow: false,
            rightSeasonArrow: false,
            visitedSliderID: [],
            currentSeason: '',
            seasonIndex: isNaN(sIndex) ? 0 : sIndex,
        };
    }

    componentDidMount = async () => {
        const {seriesId} = this.props;
        await this.fetchDataForSeasons(seriesId);
        window.addEventListener("resize", this.handleOnResize);
    }

    componentDidUpdate = async (previousProps, previousState) => {
        const {
            match: {
                params: {id},
            },
            seriesId,
        } = this.props;
        if (
            previousProps.list &&
            previousProps.list.length > 0 &&
            this.props.list &&
            this.props.list.length > 0
        ) {
            if (previousProps.list[0].id !== this.props.list[0].id) {
                await this.fetchDataForSeasons(seriesId);
            }
            if (
                get(previousProps, "lastWatch.seriesId") !== undefined &&
                get(previousProps, "lastWatch.seriesId") !== null &&
                get(this.props, "lastWatch.seriesId") !== undefined &&
                get(this.props, "lastWatch.seriesId") !== null &&
                parseInt(previousProps?.lastWatch?.seriesId) !==
                parseInt(this.props?.lastWatch?.seriesId)
            ) {
                await this.fetchDataForSeasons(seriesId);
            }
        } else if (id !== previousProps.match.params.id) {
            await this.fetchDataForSeasons(seriesId);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleOnResize);
    }

    async fetchDataForSeasons(id) {
        let {list, seriesId, lastWatch, detail} = this.props;
        let currentSeason;
        if (id) {
            currentSeason = id;
        } else {
            if (isEmpty(list)) {
                currentSeason = seriesId;
            } else if (!isEmpty(list)) {
                if (lastWatch && lastWatch?.seriesId) {
                    currentSeason = parseInt(lastWatch?.seriesId);
                } else {
                    currentSeason = list[0].id;
                }
            }
        }

        if (currentSeason) {
            isEmpty(detail) && await this.props.fetchSeasonData(
                currentSeason,
                PAGINATION_LIMIT,
                this.state.offset,
            );
            isEmpty(this.props.episodeDetailsData) && await fetchEpisodeDetailsHistory(seriesId);
            initialArrowState("seasons-list", this, "rightSeasonArrow");
            this.setState({
                currentSeason: currentSeason,
            })
        }
    }

    fetchSeasonDetail(id, index) {
        this.setState(
            {
                limit: PAGINATION_LIMIT,
            },
            async () => {
                const {fetchSeasonData, episodeDetailsData} = this.props;
                await fetchSeasonData(id, PAGINATION_LIMIT, this.state.offset);
                isEmpty(episodeDetailsData) && await fetchEpisodeDetailsHistory(id);
                this.setState({
                    currentSeason: id,
                    seasonIndex: index,
                })
            },
        );
    }

    loadMore(limit) {
        this.setState(
            {
                limit: limit + PAGINATION_LIMIT,
            },
            async () => {
                await this.props.fetchSeasonData(
                    this.state.currentSeason,
                    this.state.limit,
                    this.state.offset,
                );
                await fetchEpisodeDetailsHistory(this.state.currentSeason);
            },
        );
    }

    handleOnResize = () => {
        horizontalScroll(
            "seasons-list",
            this,
            "leftSeasonArrow",
            "rightSeasonArrow",
        );
    };

    handleModal = (item) => {
        this.props.showModal(item)
    };

    redirectToEpisodePage = () => {
        let {history, mixpanelData, meta} = this.props;
        let mixpanelState = {
            title: meta.brandTitle,
            railTitle: mixpanelData?.railTitle,
            source: mixpanelData?.source,
            origin: mixpanelData?.origin,
            railPosition: mixpanelData?.railPosition,
            conPosition: mixpanelData?.conPosition,
            sectionSource: mixpanelData?.sectionSource,
            configType: mixpanelData?.configType,
            sectionType: mixpanelData?.sectionType,

        };

        safeNavigation(history, {
            pathname: `/${URL.EPISODE}/${meta.contentType}/${meta[contentType(meta.contentType) + "Id"]
            }`,
            state: {
                ...mixpanelState,
                seriesId: this.state.currentSeason === "" ? meta.seriesId : this.state.currentSeason
            },
            search: this.props?.location?.search,
        })
    }

    getCustomContents = (item) => {
        return <React.Fragment>
            <div className="overBottomContent">
                <div className="overBottomContentLeft">
                    <img
                        className={"botmIcon"}
                        alt="freemium-image"
                        src={PlayNext}
                    />
                    <p>{`Ep.${item.episodeId} ${item?.title}`}</p>
                    <span
                        className="three-dots"
                        data-tip="Know more"
                        data-effect="solid"
                        data-offset="{'left': 30}"
                        onClick={e => {
                            e.stopPropagation();
                            fireProductLandingCtasEvent(this.props?.meta, DATALAYER.VALUE.THREE_DOTS, item?.episodeId)
                            this.handleModal(item);
                        }}>
                        <img
                            className={"three-dots"}
                            alt="freemium-image"
                            src={ThreeDots}
                        />
                    </span>
                </div>
            </div>
            <div className="cardTime">{time_convert((item?.totalDuration || item?.durationInSeconds), true)}</div>
            <div className="time-line"><span style={{width: `${getTimeline(item)}%`}}/></div>
            <ReactTooltip/>
        </React.Fragment>
    }

    constructRail() {
        const {detail} = this.props;
        return {
            autoScroll: false,
            contentList: detail,
            // id: new Date().getTime(),
            layoutType: LAYOUT_TYPE.LANDSCAPE,
            sectionSource: SECTION_SOURCE.SEASONS,
            sectionType: SECTION_TYPE.RAIL,
            shuffleList: [],
            specialRail: false,
            subscribed: false,
            totalCount: detail.length,
            unSubscribed: false,
        }
    }

    render() {
        const seasonList = this.props.list;
        const {detail, seriesId, meta, recommendedLength} = this.props;
        let {leftSeasonArrow, rightSeasonArrow} = this.state;

        return (
            <React.Fragment>
                <div className={`seasons ${leftSeasonArrow && !isMobile.any() && 'left-arrow'}`}>
                    <ul
                        className="seasons-number"
                        id="seasons-list"
                        onScroll={() =>
                            horizontalScroll(
                                "seasons-list",
                                this,
                                "leftSeasonArrow",
                                "rightSeasonArrow",
                            )
                        }
                    >
                        {leftSeasonArrow && !isMobile.any() && (
                            <i
                                className="left-icon"
                                onClick={() =>
                                    (document.getElementById("seasons-list").scrollLeft -= 500)
                                }
                            />
                        )}
                        {seasonList &&
                            seasonList.length > 0 &&
                            seasonList.map((item, index) => {
                                return (
                                    <li
                                        className={this.state.currentSeason === item.id ? "active" : ""}
                                        key={index}
                                        onClick={() => {
                                            this.setState({
                                                seasonIndex: index,
                                            });
                                            this.fetchSeasonDetail(item.id, index)
                                        }}
                                    >
                                        {item.seriesName}
                                    </li>
                                );
                            })}
                        {rightSeasonArrow && !isMobile.any() && (
                            <i
                                className="right-icon"
                                onClick={() =>
                                    (document.getElementById("seasons-list").scrollLeft += 500)
                                }
                            />
                        )}
                        {seasonList.length === 0 && seriesId && (
                            <li className="active">Episodes</li>
                        )}
                    </ul>
                </div>
                <div className="listing-container seasons-listing">
                    <div className="listing-vertical season-rail">
                        {detail && detail.length && (
                            <Listing
                                items={[this.constructRail()]}
                                contentType={"listing-vertical"}
                                id={new Date().getTime()}
                                pidetailpage
                                customContents={this.getCustomContents}
                                isSeasons={true}
                            />
                        )}
                    </div>
                    {detail?.length > 0 && <div className="view-all-episode-container">
                        <a
                            onClick={() => this.redirectToEpisodePage()}
                            className="view-all"
                        >
                            View all Episodes
                        </a>
                    </div>}
                    {recommendedLength > 0 && <div className="mobile-border-bottom"/>}
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    meta: get(state.PIDetails.data, "meta"),
    seriesList: get(state.PIDetails.data, "seriesList"),
    detail: get(state.seasonReducer, "items"),
    loadMore: get(state.seasonReducer, "total"),
    episodeDetailsData: get(state.seasonReducer, "episodeDetails"),
    contentType: get(state.PIDetails, "data.meta.contentType", "TV_SHOWS"),
});

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators(
        {
            fetchSeasonData,
        },
        dispatch,
    ),
});

Seasons.propTypes = {
    history: PropTypes.object,
    list: PropTypes.array,
    seriesId: PropTypes.number,
    fetchSeasonData: PropTypes.func,
    detail: PropTypes.array,
    loadMore: PropTypes.number,
    match: PropTypes.object,
    openPopupSubscriptionUpgrade: PropTypes.func,
    lastWatch: PropTypes.object,
    currentSubscription: PropTypes.object,
    seasonData: PropTypes.object,
    episodeDetailsData: PropTypes.object,
    mixpanelData: PropTypes.object,
    meta: PropTypes.object,
    seriesList: PropTypes.array,
    location: PropTypes.object,
    showModal: PropTypes.func,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Seasons);
