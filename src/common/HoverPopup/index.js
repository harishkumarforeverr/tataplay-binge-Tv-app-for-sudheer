import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { addWatchlist, setLA } from "@containers/PlayerWeb/APIs/actions";
import { URL } from "@constants/routeConstants";
import { closePopup, openPopup } from "@common/Modal/action";
import {
    fetchContinueWatchingDetails,
    fetchPIData,
} from "@containers/PIDetail/API/actions";
import {
    isUserloggedIn,
    loginInFreemium,
    classNameToApply,
    showToast,
    getFormattedURLValue,
    getFormattedContentTitle,
} from "@utils/common";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import { LOCALSTORAGE, LAYOUT_TYPE, MESSAGE, MINI_SUBSCRIPTION, SECTION_SOURCE } from "@utils/constants";
import { getKey } from "@utils/storage";
import "./style.scss";
import playImage from '../../assets/images/play-next-circle.svg';
import firebase from '@utils/constants/firebase';
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import CrownImage from '@assets/images/crown-icon-upd.svg';

class HoverText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFav: null,
        };
    }

    addToFavourite = async (e) => {
        e.stopPropagation();
        this.fireEvent(DATALAYER.VALUE.ADD_TO_BINGE_LIST);
        if (isUserloggedIn()) {
            const { id, contentType } = this.props.item;
            this.props.addWatchlist(id, contentType, true);
            if (this.checkIsFav(this.props.item.id)) {
                showToast(MESSAGE.REMOVE_FROM_BINGE_LIST);
            } else {
                showToast(MESSAGE.ADDED_TO_BINGE_LIST);
            }
        } else {
            const { openPopup, closePopup, openLoginPopup } = this.props;
            await loginInFreemium({
                openPopup, closePopup, openLoginPopup,
                source: firebase.VALUE.PLAY_CLICK,
                getSource: firebase.VALUE.PLAYBACK,
                ComponentName: MINI_SUBSCRIPTION.LOGIN,
            });
        }
    };

    checkIsFav = (contentId) => {
        const watchListId = JSON.parse(getKey(LOCALSTORAGE.WATCHLIST));
        return watchListId?.includes(parseInt(contentId));
    };

    fireEvent = (buttonName) => {
        const data = this.props.item;
        dataLayerConfig.trackEvent(DATALAYER.EVENT.VIDEO_TILES_HOMEPAGE_CTAS, {
            [DATALAYER.PARAMETER.BUTTON_NAME]: buttonName,
            [DATALAYER.PARAMETER.RAIL_TITLE]: this.props.railTitle,
            [DATALAYER.PARAMETER.CONTENT_TITLE]: data?.title,
            [DATALAYER.PARAMETER.CONTENT_TYPE]: data?.contentType,


        })
    }

    getHoverPopupClass = () => {
        const {
            displayItem,
        } = this.props;
        const landscape = LAYOUT_TYPE.LANDSCAPE;
        const TOP_PORTRAIT = LAYOUT_TYPE.TOP_PORTRAIT;
        return `popover  ${this.props.classNameSetHover} ${!displayItem ? "dispay-none" : ""
            } ${"position_absolute"} ${classNameToApply(
                "listing-landscape-container",
                landscape,
                this.props.view,
            )} ${classNameToApply(
                "listing-top_portrait",
                TOP_PORTRAIT,
                this.props.view,
            )} `;
    }

    onHoverPopupClick = () => {
        const data = this.props.item;
        dataLayerConfig.trackEvent(DATALAYER.EVENT.VIDEO_TILE_CLICK, {
            [DATALAYER.PARAMETER.CTA_NAME]: "",
            [DATALAYER.PARAMETER.RAIL_TITLE]: this.props.railTitle,
            [DATALAYER.PARAMETER.CONTENT_TITLE]: data?.title,
            [DATALAYER.PARAMETER.CONTENT_TYPE]: data?.contentType,

        })
        this.props.clickImageOnHover();
    }

    render() {
        const {
            item,
            clickImageOnHover,
            isTitleRail,
            cardImage,
            shouldShowCrown,
            sectionSource
        } = this.props;
        let isWatchListSeeAllPage = sectionSource === SECTION_SOURCE.WATCHLIST;
        const TOP_PORTRAIT = LAYOUT_TYPE.TOP_PORTRAIT;

        return (
            <div className={`hover-popup overlap-hover`}>
                <div className={this.getHoverPopupClass()}>
                    <div onClick={() => this.onHoverPopupClick()} className="image-top">
                        <img src={cardImage ? cardImage : item.boxCoverImage} onError={(e) => {
                            e.target.onerror = null;
                            e.target.className = "broken-image";
                        }} />
                    </div>
                    {
                        shouldShowCrown &&
                        <img
                            className="crown-image"
                            alt="freemium-image"
                            src={CrownImage}
                        />
                    }
                    <div className={`info-section ${classNameToApply("listing-top_portrait_info-section", TOP_PORTRAIT, this.props.view)} `}>
                        {isTitleRail ?
                            // <div className={`info-section`}>
                            <>
                                <div className="set-title-tile">
                                    <img src={playImage} className="playimage-image" />
                                    <h4>{item.title} </h4>
                                </div>
                                <hr className="border-line" />
                            </>
                            // </div>
                            :
                            <>
                                <div className="info-header">
                                    <h4>{item.title} </h4>
                                </div>
                                <div className="pop-info">
                                    {item && item.genre && item.genre[0] ? (
                                        <span className="genre"> {item.genre[0]} </span>
                                    ) : null}
                                    {
                                        <span className={item.masterRating ? "age-resptriction" : null}>
                                            {item.masterRating}{" "}
                                        </span>
                                    }
                                </div>
                            </>
                        }
                        <div
                            className={`footer-section ${classNameToApply("listing-top_portrait_footer_section", TOP_PORTRAIT, this.props.view)} `}>
                            
                            {!isWatchListSeeAllPage &&
                                <div onClick={(e) => this.addToFavourite(e)} className="movieButtonContainer">
                                    <i className={this.checkIsFav(this.props.item.id) ? "icon-check imagesBlock" : "icon-plus imagesBlock"}
                                    />
                                    <span className="textBlock">{ MESSAGE.ADD_TO_BINGE_LIST}</span>
                                </div>
                            }
                            <div
                                onClick={(e) => {
                                    e.stopPropagation(),
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/${URL.DETAIL}/${getFormattedURLValue(item.contentType)}/${item.id || item.contentId}/${getFormattedContentTitle(item.title)}`,
                                        );
                                    this.fireEvent(DATALAYER.VALUE.SHARE)
                                    showToast(MESSAGE.SHARE_URL_MESSAGE);
                                }}
                                className="icon-share2 imagesBlock"
                            >
                                <span className="textBlock">Share</span>
                            </div>
                        </div>
                    </div>
                    {this.props.hoverTopTenImage && (
                        <span
                            className={`${classNameToApply("listing-top_portrait_topten", TOP_PORTRAIT, this.props.view)}`}>
                            {this.props.hoverTopTenImage && this.props.getHoverTopTenImage(this.props.getContentPosition)}
                        </span>
                    )}
                </div>
            </div>
        );
    }
}

HoverText.propTypes = {
    meta: PropTypes.object,
    fetchPIData: PropTypes.func,
    detail: PropTypes.object,
    addWatchlist: PropTypes.func,
    isFavouriteMarked: PropTypes.bool,
    setLA: PropTypes.func,
    fetchContinueWatchingDetails: PropTypes.func,
    lastWatch: PropTypes.object,
    getHoverTopTenImage: PropTypes.func,
    watchlistItems: PropTypes.array,
    item: PropTypes.object,
    displayItem: PropTypes.bool,
    showCrownImg: PropTypes.bool,
    clickImageOnHover: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    openLoginPopup: PropTypes.func,
    classNameSetHover: PropTypes.string,
    view: PropTypes.string,
    hoverTopTenImage: PropTypes.bool,
    getContentPosition: PropTypes.number,
    cardImage: PropTypes.string,
    isTitleRail: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    meta: get(state.PIDetails.data, "meta"),
    detail: get(state.PIDetails.data, "detail"),
    isFavouriteMarked: get(
        state.PIDetails,
        "continueWatchingDetails.data.isFavourite",
    ),
    lastWatch: get(state.PIDetails, "continueWatchingDetails.data", {}),
    watchlistItems: get(state.watchlist, "watchlistItems"),
});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(
            {
                fetchPIData,
                addWatchlist,
                setLA,
                fetchContinueWatchingDetails,
                openPopup,
                closePopup,
                openLoginPopup,
            },
            dispatch,
        ),
    };
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(HoverText);
