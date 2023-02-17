import React, { Component, PureComponent } from "react";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import get from "lodash/get";
import CrownImage from '@assets/images/crown-icon-upd.svg';
// import { PARTNER_SUBSCRIPTION_TYPE } from "../../utils/constants";
import {
    getLayeredIcon,
    isUserloggedIn,
    getProviderLogo,
    getContentDetailSource,
    convertNumToString,
    cloudinaryCarousalUrl,
    convertEpochTimeStamp,
    safeNavigation,
    isMobile,
    queryStringToObject,
    showCrown,
    convertTimeString,
    getAnalyticsSource,
    getAnalyticsContentType,
    getAnalyticsRailCategory,
    isFreeContentEvent,
    getFormattedURLValue,
    getFormattedContentTitle,
    getEpisodeVerbiage,
    checkPartnerSubscribed,
    providerImage,
} from "@utils/common";
import {
    LAYOUT_TYPE,
    CONTENTTYPE,
    LOCALSTORAGE,
    SECTION_SOURCE,
    CONTRACT,
    PARTNER_SUBSCRIPTION_TYPE,
} from "@utils/constants";
import MIXPANEL from "@constants/mixpanel";
import { URL } from "@constants/routeConstants";
import overlayImage from "../../assets/images/overlay.svg";
import imagePlaceholderPortrait from "@assets/images/image-placeholder-portrait.png";
import imagePlaceholderLandscape from "@assets/images/image-placeholder-landscape.png";
import imagePlaceholderAppRail from "@assets/images/app-icon-place.svg";
import imagePlaceholderRailLogoLandscape from "@assets/images/image-placeholder-rail-logo-landscape.png";
import imagePlaceholderRailLogoPortrait from "@assets/images/image-placeholder-rail-logo-potrait.png";
import imagePlaceholderForBrowseByGenre from "@assets/images/browse-by-genre-background.png";
import imagePlaceholderForBrowseByGLanguage from "@assets/images/browse-by-lang-background.png";
import HoverText from "../HoverPopup";
import "./style.scss";
import { getKey, setKey } from "@utils/storage";
import isEmpty from "lodash/isEmpty";
import { BROWSE_TYPE } from "@containers/BrowseByDetail/APIs/constants";
import { PROVIDER_NAME } from "@constants/playerConstant";
import withContentPlay from '@components/HOC/withContentPlay';
import { LazyLoadImage } from "react-lazy-load-image-component";

class ListingItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredData: {
                hovered: false,
                id: null,
            },
            onErrorData: {
                error: false,
                id: null,
            },
            isHover: false,
        };
    }

    componentDidMount() {
        /* const {
             item: {contentId, secondsWatched, id, durationInSeconds},
             isContinueWatching,
         } = this.props;
         let ele =
             document.getElementsByClassName(contentId)[0] ||
             document.getElementsByClassName(id)[0];
         isContinueWatching && secondsWatched && ele
             ? (ele.style.width = `${Math.ceil(
                 (secondsWatched / durationInSeconds) * 100,
             )}%`)
             : "";*/
    }

    getImage = (view) => {
        if (view === LAYOUT_TYPE.LANDSCAPE) {
            return imagePlaceholderLandscape;
        } else if (
            [LAYOUT_TYPE.PORTRAIT, LAYOUT_TYPE.TOP_PORTRAIT].includes(view)
        ) {
            return imagePlaceholderPortrait;
        } else if (view === LAYOUT_TYPE.CIRCULAR) {
            return imagePlaceholderAppRail;
        } else {
            return imagePlaceholderLandscape;
        }
    };

    getRailLogoImagePlaceholder = (view) => {
        if (view === LAYOUT_TYPE.LANDSCAPE) {
            return imagePlaceholderRailLogoLandscape;
        } else if (
            [LAYOUT_TYPE.PORTRAIT, LAYOUT_TYPE.TOP_PORTRAIT].includes(view)
        ) {
            return imagePlaceholderRailLogoPortrait;
        } else {
            return imagePlaceholderRailLogoLandscape;
        }
    };

    getPartnerData = (item) => {
        let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || [];
        let data =
            partnerInfo &&
            partnerInfo.find &&
            partnerInfo.find(
                (i) => parseInt(i.partnerId) === parseInt(item.partnerId),
            );
        !data &&
            partnerInfo.push({
                pageType: item.pageType,
                title: item.title,
                provider: item.provider,
                partnerId: parseInt(item.partnerId),
            });
        setKey(LOCALSTORAGE.PARTNER_INFO, JSON.stringify(partnerInfo));
    };

    getLogoImageUrl = (item, view, sectionSource) => {
        let logoWidth = "auto",
            logoHeight = !!isMobile.any() ? 24 : 52;
        let imageUrl = "";
        let providerLogo = getProviderLogo();

        if (sectionSource === SECTION_SOURCE.BINGE_TOP_10_RAIL) {
            logoHeight = !!isMobile.any() ? 28 : 68;
        }

        if (providerLogo && Object.entries(providerLogo).length !== 0) {
            let url = providerImage(item.provider, view);
            imageUrl = url
                ? `${cloudinaryCarousalUrl(
                    "",
                    "",
                    logoWidth,
                    this.state.hoveredData.hovered ? 32 : logoHeight,
                )}${url}`
                : "";
        }
        return imageUrl;
    };

    getPathNameOnClick = () => {
        let {
            sectionSource,
            view,
            title,
            item,
            location: { pathname },
            routeName,
            pageType,
            pathUpdated,
            newRailTitle,
            source,
            taRecommendedRail,
            railPosition,
            history,
            contentPosition,
            configType,
            sectionType,
            contentSectionSource,
            refUseCase,
            railId,
        } = this.props;
        let path = pathname;
        let railTitle = title;
        let updatedSource = sectionSource;
        if (pageType === "seeAll") {
            path = routeName;
        } else if (pageType === "browseBy") {
            path = pathUpdated;
            updatedSource = source;
        } else if (pageType === "search") {
            railTitle = "";
        } else if (pageType === "searchLanguage" || pageType === "searchGenre") {
            railTitle = newRailTitle;
        }

        let routeUrl = pathname && pathname.split("/");
        let breadCrumbSource = pathname && routeUrl[1];
        breadCrumbSource = isEmpty(breadCrumbSource) ? URL.HOME : breadCrumbSource;

        if (
            [SECTION_SOURCE.LANGUAGE, SECTION_SOURCE.GENRE].includes(sectionSource)
        ) {
            return {
                pathname: `/${URL.BROWSE_BY}/${getFormattedURLValue(sectionSource)}/${getFormattedURLValue(item?.title)}`,
                state: {
                    railTitle: railTitle,
                    pathUpdated: path,
                    pageType: pageType,
                    bannerImg: item.backgroundImage,
                    bannerLogoImg: item.image,
                    breadCrumbSource: breadCrumbSource,
                    refUseCase,
                },
                // search: `?layout=${getFormattedURLValue(view)}`,
            };
        } else if (item.contentType === CONTENTTYPE.TYPE_SUB_PAGE && sectionSource !== SECTION_SOURCE.CATEGORY) {
            return {
                pathname: `/${URL.PARTNER}/${getFormattedURLValue(item.provider)}/${item.partnerId}`,
                state:{partnerName:item.provider},
                search: `?breadCrumbSource=${breadCrumbSource}`,
                // search: `?layout=${getFormattedURLValue(view)}&breadCrumbSource=${breadCrumbSource}`,
            };
        } else if (item.contentType !== CONTENTTYPE.TYPE_SUB_PAGE) {
            let updatedContentType = item.contentType;
            let updatedId = item.id ? item.id : item.contentId;

            if (taRecommendedRail) {
                updatedContentType = item.seriescontentType
                    ? item.seriescontentType
                    : updatedContentType;
                updatedId = item.seriesvrId ? item.seriesvrId : updatedId;
            }

            let search = queryStringToObject(location.search);
            let sourcePath = routeUrl.includes("breadCrumbSource")
            let pathValid = "";
            if (sourcePath === false) {
                pathValid = history.location;
            }

            breadCrumbSource = breadCrumbSource === URL.BROWSE_BY ?
                ((routeUrl[2] === BROWSE_TYPE.LANGUAGE) ? URL.LANGUAGE : (routeUrl[2] === BROWSE_TYPE.GENRE) ? BROWSE_TYPE.GENRE.toLowerCase() : breadCrumbSource)
                : breadCrumbSource;
            return {
                pathname: `/${URL.DETAIL}/${getFormattedURLValue(updatedContentType)}/${updatedId}/${getFormattedContentTitle(item.title)}`,
                state: {
                    railTitle: railTitle,
                    railPosition: railPosition,
                    source: getContentDetailSource(
                        pathname,
                        updatedContentType,
                        item.contractName
                    ),
                    sectionSource: updatedSource,
                    title: item.title,
                    setPathIs: pathValid,
                    conPosition: contentPosition + 1,
                    configType: configType,
                    sectionType: sectionType,
                    contentSectionSource: contentSectionSource,
                    refUseCase,
                    railId: railId
                },
                search: `?breadCrumbSource=${search.breadCrumbSource
                    ? search.breadCrumbSource
                    : breadCrumbSource
                    }`,
                // search: `?layout=${getFormattedURLValue(view)}&breadCrumbSource=${search.breadCrumbSource
                //     ? search.breadCrumbSource
                //     : breadCrumbSource
                //     }`,
            };
        } else if (item.contentType === CONTENTTYPE.TYPE_SUB_PAGE && sectionSource ===SECTION_SOURCE.CATEGORY) {
            return {
                pathname: `/${URL.CATEGORIES}/${getFormattedURLValue(item.provider)}`,
            };
        }
    };

    getBrowseByPlaceholder = (sectionSourceName) => {
        if (sectionSourceName === SECTION_SOURCE.LANGUAGE) {
            return imagePlaceholderForBrowseByGLanguage;
        } else {
            return imagePlaceholderForBrowseByGenre;
        }
    };

    handleDrag = (e) => {
        e.preventDefault();
        return false;
    };

    itemDetailVisibility = () => {
        const { sectionSource, pageType } = this.props;
        return !([SECTION_SOURCE.BINGE_DARSHAN_CHANNEL, SECTION_SOURCE.BINGE_CHANNEL,SECTION_SOURCE.LANGUAGE, SECTION_SOURCE.GENRE, SECTION_SOURCE.BACKGROUND_BANNER_RAIL, SECTION_SOURCE.CATEGORY].includes(sectionSource) ||
            // (!!isMobile.any() && sectionSource === SECTION_SOURCE.TITLE_RAIL) ||
            (sectionSource === SECTION_SOURCE.PROVIDER && pageType !== "seeAll"));
    };

    getContentImageUrl = () => {
        const { view, item, taRecommendedRail } = this.props;

        if (view === LAYOUT_TYPE.CIRCULAR) {
            return providerImage(item.provider, view);
        } else {
            if (taRecommendedRail) {
                return item.seriesimage ? item.seriesimage : item.image;
            } else {
                return item.image;
            }
        }
    };

    onMouseEvent = (e, hovered, id) => {
        if (this.props.dragging) {
            return false;
        }
        let { onErrorData } = this.state;
        let data = {
            hovered: hovered,
            id: id,
        };
        let errorID = onErrorData.id;
        if (this.state.hoveredData.hovered !== hovered) {
            if (errorID === null || (id === errorID && !onErrorData.error)) {
                this.setState({
                    hoveredData: data,
                });
            }
        }
    };

    setErrorData = (error, id) => {
        let data = {
            error: error,
            id: id,
        };
        this.setState({
            onErrorData: data,
        });
    };

    getBingeTopTenImage = (key) => {
        const image = convertNumToString(key + 1);
        return (
            <span className={`top-ten-image ${image === 'ten' && `ten-img`}`}>
                <img alt="freemium-image" src={`../../assets/images/${image}.svg`} />
            </span>
        );
    };

    isTopTenRail = (sectionSource, view) => {
        return (
            sectionSource === SECTION_SOURCE.BINGE_TOP_10_RAIL &&
            view === LAYOUT_TYPE.TOP_PORTRAIT
        );
    };
    isTitleRail = (sectionSource, view) => {
        return (
            sectionSource === SECTION_SOURCE.TITLE_RAIL &&
            view === LAYOUT_TYPE.LANDSCAPE
        )
    }

    getClassName = (sectionSource) => {
        if (sectionSource === SECTION_SOURCE.LANGUAGE) {
            return "browse-by-lang-listing";
        } else if (sectionSource === SECTION_SOURCE.GENRE) {
            return "browse-by-genre-listing";
        } else if (sectionSource === SECTION_SOURCE.PROVIDER) {
            return "provider-listing";
        }else if (sectionSource === SECTION_SOURCE.CATEGORY) {
            return "browse-by-category-listing";
        }
        else if (sectionSource === SECTION_SOURCE.BINGE_CHANNEL) {
            return "live-channel-listing";
        }
        else if (sectionSource === SECTION_SOURCE.BINGE_DARSHAN_CHANNEL) {
            return "listing-darshan-live-item";
        }
        return "";
    };

    getLanguageRail = (sectionSource, item, placeHolderImage) => {
        return (
            <React.Fragment>
                <div className="language-rail-item">
                    <span className="lang-item-icon">
                        {" "}
                        <img
                            onDragStart={(e) => {
                                this.handleDrag(e);
                            }}
                            src={item.image}
                            alt=""
                            onError={(e) => {
                                e.target.onerror = null;
                                if (item?.image === null) {
                                    e.target.className = "broken-image";
                                }
                                this.setErrorData(true, item.id);
                            }}
                        />
                    </span>
                    <span className="lang-item-title">{item.title}</span>
                </div>
            </React.Fragment>
        );
    };


    secondsToHms(d) {
        d = Number(d);
        const h = Math.floor(d / 3600);
        const m = Math.floor((d % 3600) / 60);
        const s = Math.floor((d % 3600) % 60);
        const hDisplay = h > 0 ? h + (h === 1 ? "h " : "h ") : "";
        const mDisplay = m > 0 ? m + (m === 1 ? "m " : "m ") : "";
        return hDisplay + mDisplay;
    }

    getSportsRailView = (item) => {
        return (
            <>
                {[SECTION_SOURCE.SEASONS].includes(this.props.sectionSource) ? (
                    <div className="sports-rail-item">
                        {item?.duration && (
                            <span className="sports-duration-detail duration-season">
                                {convertTimeString(item?.duration)}
                            </span>
                        )}
                        {item?.totalDuration && (
                            <span className="sports-duration-detail duration-season">
                                {this.secondsToHms(item?.totalDuration)}
                            </span>
                        )}
                        <div className="sport-rail-detail bottom-desc-padding">
                            <span className="play">
                                <img
                                    className="play-video-icon"
                                    alt="play-vedio-icon"
                                    /*
                                      Need to check
                                      src={`../../assets/images/${!!isMobile.any() ? "play-next.svg" : "play-next-circle.png"}`}
                                    */
                                    src={`../../assets/images/play-next-circle.svg`}
                                />
                            </span>
                            <span className="sports-video-title season-title">
                                {item.title}
                            </span>
                            {isMobile.any() && (
                                <span className="three-dots">
                                    <img
                                        // style={{ width: 3, height: 10 }}
                                        className="three-dots-icon"
                                        alt="three-dots-icon"
                                        src={`../../assets/images/three-dots.png`}
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="sports-rail-item">
                        {item?.duration && (
                            <span className="sports-duration-detail">
                                {convertTimeString(item?.duration)}
                            </span>
                        )}
                        {item?.totalDuration && (
                            <span className="sports-duration-detail">
                                {this.secondsToHms(item?.totalDuration)}
                            </span>
                        )}
                        <div className="sport-rail-detail">
                            <span>
                                {" "}
                                <img
                                    className={"play-video-icon"}
                                    alt="play-vedio-icon"
                                    /*
                                      Need to check
                                      src={`../../assets/images/${!!isMobile.any() ? "play-next.svg" : "play-next-circle.png"}`}
                                    */
                                    src={`../../assets/images/play-next-circle.svg`}
                                />
                            </span>
                            <span className="sports-video-title">{item.title}</span>
                        </div>
                    </div>
                )}
            </>
        );
    };

    selectWatchList = (d) => {
        const { checkSelectedValue } = this.props;
        return (
            <div
                className={`select-content ${checkSelectedValue(d.contentId) ? 'active' : ''} `}
            >
                {checkSelectedValue(d.contentId) ?
                    <img className="tick" src="../../assets/images/tick.png" alt="" /> : null}
            </div>
        );
    }

    showCrownImage = () => {
        const { item, view, sectionSource } = this.props;
        return (
            sectionSource !== SECTION_SOURCE.PROVIDER &&
            !this.isTopTenRail(sectionSource, view) &&
            item?.partnerSubscriptionType?.toLowerCase() ===
            PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()
        );
    };

    onHoverHandler = () => {
        this.setState({ isHover: true });
    };

    onOutHandler = () => {
        this.setState({ isHover: false });
    };

    handleContentClick = (e) => {
        const {
            item,
            sectionSource,
            sectionType,
            contentPosition,
            title,
            railPosition,
            isPartnerPage,
            onClickHandler,
            meta,
            onPlayContent,
            location,
            configType,
            contentSectionSource
        } = this.props;
        let data = {
            sectionSource,
            sectionType,
            contentPosition,
            title,
            railPosition,
            isPartnerPage,
            configType
        }
        e.stopPropagation();
        if (!this.props.select) {
            const isEpisodeContent = sectionSource === SECTION_SOURCE.SEASONS;
            if (isEpisodeContent) {
                onPlayContent({
                    ...item,
                    type: 'seasonsType',
                    isEpisodeContent: true
                })
            } else {
                safeNavigation(this.props.history, this.getPathNameOnClick());
            }
        }
        onClickHandler && onClickHandler(e, item, data);
    }

    render() {
        const {
            item,
            view,
            handleOnMouseDown,
            isContinueWatching = false,
            key,
            sectionSource,
            contentPosition,
            pageType,
            isPartnerPage,
            isWatchlist,
            select,
            handleButtonPress,
            handleButtonRelease,
            isToolTipRequired = false,
            customContents,
            isAbsolute = true,
            episodePage = false,

        } = this.props;

        let placeHolderImage = this.getImage(
            sectionSource === SECTION_SOURCE.LANGUAGE ? LAYOUT_TYPE.LANDSCAPE : view,
        ),
            imageUrl = this.getLogoImageUrl(item, view, sectionSource),
            isTVOD = item.contractName === CONTRACT.RENTAL,
            isIVOD = item?.provider?.toLowerCase() === PROVIDER_NAME.TATASKY && item?.contractName !== CONTRACT.RENTAL;

        const isSportsRail = [SECTION_SOURCE.TITLE_RAIL, SECTION_SOURCE.BACKGROUND_BANNER_RAIL].includes(sectionSource);
        const isEpisode = sectionSource === SECTION_SOURCE.SEASONS;

        item.contentType === CONTENTTYPE.TYPE_SUB_PAGE && this.getPartnerData(item);

        let cardImage = `${sectionSource === SECTION_SOURCE.GENRE
            ? `${cloudinaryCarousalUrl(
                "",
                "",
                180,
                180,
                isMobile.any(),
            )}${this.getContentImageUrl()}`
            : `${cloudinaryCarousalUrl(
                this.state.hoveredData.hovered,
                view,
                "",
                "",
                !!isMobile.any(),
            )}${this.getContentImageUrl()}`
            }`;
        let shouldShowCrown = showCrown(item) && ![SECTION_SOURCE.BINGE_DARSHAN_CHANNEL, SECTION_SOURCE.BINGE_CHANNEL, SECTION_SOURCE.PROVIDER, SECTION_SOURCE.LANGUAGE, SECTION_SOURCE.GENRE, SECTION_SOURCE.CATEGORY].includes(sectionSource);
        let showEpisode = !checkPartnerSubscribed(this.props.currentSubscription, item?.partnerId, item.provider) && item.freeEpisodesAvailable &&  sectionSource !== SECTION_SOURCE.SEASONS;
        return (
            <span
                className="listing-block"
                onClick={this.handleContentClick}
                onMouseOver={() => this.onHoverHandler()}
                onMouseLeave={() => {
                    if (isWatchlist) {
                        handleButtonRelease && handleButtonRelease();
                    } else {
                        this.onOutHandler();
                    }
                }}
            >
                <li
                    className={`listing-item ${this.getClassName(sectionSource)} ${isEpisode && !episodePage && "seasons-list"}`}
                    key={item.id || item.contentId || key}
                    onMouseDown={(e) => {
                        if (isWatchlist) {
                            handleButtonPress && handleButtonPress();
                            handleOnMouseDown && handleOnMouseDown(e);
                        } else {
                            handleOnMouseDown && handleOnMouseDown(e);
                        }
                    }}
                    // onClick={this.handleContentClick}
                    onTouchStart={handleButtonPress}
                    onTouchEnd={handleButtonRelease}
                    onMouseUp={handleButtonRelease}

                /* onMouseEnter={(e) =>
                        navigator.onLine && this.onMouseEvent(e, true, item.id)
                    }
                    onMouseLeave={(e) =>
                        navigator.onLine && this.onMouseEvent(e, false, item.id)
                    }*/
                >
                    {isContinueWatching &&
                        !pageType &&
                        view !== LAYOUT_TYPE.CIRCULAR &&
                        !isWatchlist &&
                        getLayeredIcon("icon-play-icon")}
                    <div>

                        {/*  {
                    view === LAYOUT_TYPE.CIRCULAR && subscribed &&
                    <img className="subscribed" src={`../../assets/images/plus-copy1.png`} alt=""/>
                }*/}

                        {sectionSource === SECTION_SOURCE.LANGUAGE ? (
                            this.getLanguageRail(sectionSource, item, placeHolderImage)
                        ) : (
                            <React.Fragment>
                                <LazyLoadImage
                                    className={`card-image ${isEpisode && !episodePage && "season-img"}`}
                                    src={cardImage}
                                    alt=""
                                    scrollPosition={this.props.scrollPosition}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.className = "broken-image";
                                        this.setErrorData(true, item.id);
                                    }}
                                />
                                {/* <img className={`card-image ${isEpisode && !episodePage && "season-img"}`}
                             src={cardImage}
                             alt=""
                             onError={(e) => {
                                 e.target.onerror = null;
                                 e.target.className = "broken-image";
                                 this.setErrorData(true, item.id);
                             }}
                        /> */}
                                {
                                    shouldShowCrown &&
                                    <img
                                        className="crown-image"
                                        alt="freemium-image"
                                        src={CrownImage}
                                    />
                                }
                                {(sectionSource === SECTION_SOURCE.GENRE || sectionSource === SECTION_SOURCE.CATEGORY) && 
                                    view === LAYOUT_TYPE.LANDSCAPE && (
                                        <React.Fragment>
                                            <div className="genre-item-title">{item.title}</div>
                                        </React.Fragment>
                                    )}
                                {isSportsRail && this.getSportsRailView(item)}
                                {isWatchlist && select && this.selectWatchList(item)}
                            </React.Fragment>
                        )}
                    </div>
                    {showEpisode && 
                        <div className={`episode-free ${view === LAYOUT_TYPE.TOP_PORTRAIT && "top-portrait-episode-free"}`}>{getEpisodeVerbiage(false)}</div>}
                    {item.liveContent && sectionSource !== SECTION_SOURCE.SEASONS &&
                        <div className={`sports-live-tag`}> Live</div>}
                    {isUserloggedIn() && isContinueWatching && !pageType && !isWatchlist && (
                        <p className="continue-watching-range">
                            <span
                                className={`range-background ${item.id ? item.id : item.contentId
                                    }`}
                            />
                        </p>
                    )}
                    {
                        ((isToolTipRequired && !this.state.isHover) || this.itemDetailVisibility()) && (
                            <>
                                <div
                                    className={`item-detail 
                ${isUserloggedIn() &&
                                        view !== LAYOUT_TYPE.CIRCULAR &&
                                        isContinueWatching &&
                                        `detail-overlay`
                                        }`}
                                >
                                    {/* <span
                            className='title'>{taRecommendedRail ? (item.seriesTitle ? item.seriesTitle : item.title) : item.title}</span> */}
                                    {isTVOD && (
                                        <span className="expires">
                                            Expires in {convertEpochTimeStamp(item.rentalExpiry)}
                                        </span>
                                    )}
                                    {!isTVOD && view !== LAYOUT_TYPE.CIRCULAR ? (
                                        <span>
                                            {!imageUrl ? (
                                                <img
                                                    src={this.getRailLogoImagePlaceholder(view)}
                                                    alt={"place-holder-image"}
                                                    className="tatasky rail-logo-placeholder place-holder-image"
                                                />
                                            ) : (
                                                !isPartnerPage && !isEpisode && !isIVOD &&
                                                <img
                                                    className={`tatasky ${item?.provider.toLowerCase() === PROVIDER_NAME.DOCUBAY ? 'active-docubay' : ''}`}
                                                    src={imageUrl}
                                                    alt=""
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.className = "broken-image";
                                                        this.setErrorData(true, item.id);
                                                    }}
                                                />
                                            )}
                                        </span>
                                    ) : null}
                                    <span>
                                    </span>
                                </div>
                            </>
                        )}
                    {customContents && customContents(item)}
                    {this.isTopTenRail(sectionSource, view) &&
                        this.getBingeTopTenImage(contentPosition)}
                </li>

                {isToolTipRequired && (
                    <React.Fragment>
                        {this.state.isHover && !isMobile.any() && !isEpisode && (
                            <HoverText
                                view={view}
                                clickImageOnHover={() => {

                                }}
                                item={item}
                                displayItem={true}
                                showCrownImg={this.showCrownImage()}
                                meta={view}
                                isAbsolute={isAbsolute}
                                classNameSetHover={this.props.classNameSetHover}
                                hoverTopTenImage={this.isTopTenRail(sectionSource, view)}
                                getHoverTopTenImage={this.getBingeTopTenImage}
                                getContentPosition={contentPosition}
                                isTitleRail={this.isTitleRail(sectionSource, view)}
                                cardImage={cardImage}
                                shouldShowCrown={shouldShowCrown}
                                railTitle={this.props.title}
                                sectionSource={sectionSource}
                            />
                        )}
                    </React.Fragment>
                )}
            </span>
        );
    }
}

ListingItem.propTypes = {
    item: PropTypes.object,
    sectionSource: PropTypes.string,
    isContinueWatching: PropTypes.bool,
    view: PropTypes.string,
    title: PropTypes.string,
    contentPosition: PropTypes.number,
    pageType: PropTypes.string,
    isPartnerPage: PropTypes.bool,
    handleOnMouseDown: PropTypes.func,
    onClickHandler: PropTypes.func,
    key: PropTypes.number,
    railPosition: PropTypes.number,
    sectionType: PropTypes.string,
    subscribed: PropTypes.bool,
    width: PropTypes.number,
    isWatchlist: PropTypes.bool,
    history: PropTypes.object,
    location: PropTypes.object,
    routeName: PropTypes.string,
    pathUpdated: PropTypes.string,
    newRailTitle: PropTypes.string,
    source: PropTypes.string,
    taRecommendedRail: PropTypes.bool,
    dragging: PropTypes.bool,
    handleSelectWatchList: PropTypes.func,
    checkSelectedValue: PropTypes.func,
    select: PropTypes.bool,
    handleButtonPress: PropTypes.func,
    handleButtonRelease: PropTypes.func,
    isToolTipRequired: PropTypes.bool,
    pidetailpage: PropTypes.bool,
    customContents: PropTypes.func,
    classNameSetHover: PropTypes.string,
    configType: PropTypes.string,
    currentSubscription: PropTypes.object,
    onPlayContent: PropTypes.func
};


const mapStateToProps = (state) => ({
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    meta: get(state.PIDetails.data, 'meta'),
})

export default withRouter(connect(mapStateToProps)(withContentPlay(ListingItem)));
