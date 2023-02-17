import React, { Component } from "react";
import "./style.scss";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import get from "lodash/get";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import * as moment from "moment";
import shuffleImg from "../../assets/images/shuffleImg.png";
import ListingItem from "@common/ListingItem";
import {
  SECTION_SOURCE,
  SECTION_TYPE,
  LAYOUT_TYPE,
  LOCALSTORAGE,
  MOBILE_BREAKPOINT,
  DIRECTIONS,
} from "@constants";
import {
  getAnalyticsSource,
  getSeeAllUrl,
  analyticsHomeClickEvent,
  safeNavigation,
  getProviderLogo,
  isMobile,
  cloudinaryCarousalUrl,
  isPartnerSubscribed,
  categoryDropdownHeader,
  analyticsRailClickEvent,
  isUserloggedIn,
  classNameToApply,
  detectSwipe,
} from "@utils/common";
import LiveDot from "../../assets/images/livedot.svg";
import {
  getVariableWidth,
  afterChangeHandler,
  beforeChangeHandler,
  slidesToShow,
  getDefaultValue,
} from "./constants";
import Languages from "@containers/Languages";
import { getKey } from "@utils/storage";
import isEmpty from "lodash/isEmpty";
import { URL } from "@routeConstants";
import { connect } from "react-redux";
import { trackWindowScroll } from "react-lazy-load-image-component";

class Listing extends Component {
  constructor(props) {
    super(props);
    let appWidth = document.getElementById("app").clientWidth;
    this.state = {
      slidesToScroll: null,
      dragging: false,
      swipe: false,
      reSized: false,
      visitedSliderID: [],
      selectedRailItem: {},
      sportsBannerWidth: appWidth,
      sportsBannerHeight: appWidth > 480 ? 621 : 187,
      prevSlideValue: 0,
      swipeSliderRailId: "",
      railPositionValue: 0,
    };
  }

  componentDidMount = async () => {
    this.handleOnResize();
    window.addEventListener("resize", this.handleOnResize);
    window.addEventListener("touchstart", this.handleBounce);
    //await setSavedLanguages();
  };

  componentDidUpdate = (prevProps) => {
    if (this.props.items !== prevProps.items && isMobile.any()) {
      this.handleSwipeEvent();
    }
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleOnResize);
    this.setState({ reSized: false });
  }

  handleSwipeEvent = () => {
    let { items } = this.props;
    for (let item = 0; item < items.length; item++) {
      let railItem = items[item];
      let className = `railItem-${railItem?.id}`;
      let element = document.getElementsByClassName(className);
      if (element.length > 0) {
        detectSwipe(
          className,
          (el, dir, data) => {
            if (
              dir === DIRECTIONS.LEFT &&
              this.state?.swipeSliderRailId !== data?.id
            ) {
              this.trackMixpanelEvent(data, this.state?.railPositionValue);
              this.setState({
                swipeSliderRailId: data.id,
              });
            }
          },
          90,
          railItem
        );
      }
    }
  };

  handleBounce = (e) => {
    let element = document.getElementsByClassName("listing-horizontal");
    element.length > 0 && e.stopPropagation();
  };

  onRailItemClick = (e, item, data) => {
    const { analyticsHomeEvent, currentSubscription } = this.props;
    if (this.state.dragging) {
      e.stopPropagation();
      e.preventDefault();
    } else {
      if (analyticsHomeEvent) {
        data.pathname = this.props.location.pathname;
        analyticsHomeClickEvent(item, data);
      } else {
        data.pathname = this.props.location.pathname;
      }
      analyticsRailClickEvent({ data, item, currentSubscription });
      // window.scrollTo(0, 0);
    }
    this.setState({
      selectedRailItem: item,
    });
  };

  handleOnMouseDown = (e) => {
    e.preventDefault();
  };

  getAnalyticsPageName = (recommended, isPartnerPage) => {
    let pageName;
    if (recommended) {
      pageName = MIXPANEL.VALUE.CONTENT_DETAIL;
    } else if (isPartnerPage) {
      pageName = MIXPANEL.VALUE.PARTNER_HOME;
    } else {
      pageName = getAnalyticsSource(this.props.location.pathname);
    }
    return pageName;
  };

  seeAll = (seeAllLink) => {
    safeNavigation(this.props.history, seeAllLink);
  };

  getGenreClassName = (sectionSource) => {
    if (sectionSource === SECTION_SOURCE.LANGUAGE) {
      return "browse-by-lang-rail";
    } else if (sectionSource === SECTION_SOURCE.GENRE) {
      return "browse-by-genre-rail";
    } else {
      return "";
    }
  };

  isPartnerSubscribed = (layoutType, providerId, sectionSource) => {
    const { pageType } = this.props;
    let subscribed = false;
    if (
      pageType === "home" &&
      layoutType === LAYOUT_TYPE.CIRCULAR &&
      sectionSource === SECTION_SOURCE.PROVIDER
    ) {
      subscribed = isPartnerSubscribed(providerId);
    }
    return subscribed;
  };

  handleOnResize = () => {
    // on resizing slider width is changing because slider component is working on window width so added thos to re-render the component on resizing
    let appWidth = document.getElementById("app").clientWidth;
    this.setState((previousState) => {
      return {
        reSized: !previousState.reSized,
        sportsBannerWidth: appWidth,
        sportsBannerHeight: appWidth > 480 ? 621 : 187,
      };
    });
    this.state.visitedSliderID &&
      this.state.visitedSliderID.map((item) => {
        let showItemCount = slidesToShow(
          item.layoutType,
          item.sectionSource,
          !!isMobile.any()
        );
        let leftItemsCount =
          item.totalItems - (item.currentSlide + item.showItemCount);
        if (showItemCount > leftItemsCount) {
          this[`slider${item.id}`] &&
            this[`slider${item.id}`].slickGoTo(
              item.currentSlide + item.showItemCount - showItemCount
            );
        }
      });
  };

  getProviderLogoImage = (provider) => {
    if (provider) {
      let providerImageUrl;
      let providerImage = getProviderLogo();
      provider = provider.toUpperCase();
      providerImageUrl =
        providerImage && providerImage[provider].logoRectangular;
      return providerImageUrl;
    }
  };

  getListingClass = (railItem) => {
    if (
      [SECTION_SOURCE.LANGUAGE, SECTION_SOURCE.GENRE].includes(
        railItem.sectionSource
      )
    ) {
      return `listing-landscape listing-small-landscape`;
    } else if (railItem?.sectionSource === SECTION_SOURCE.BINGE_CHANNEL) {
      return "listing-landscape listing-live-item";
    } else if (
      railItem?.sectionSource === SECTION_SOURCE.BINGE_DARSHAN_CHANNEL
    ) {
      return "listing-landscape listing-darshan-live";
    } else {
      return `listing-${railItem.layoutType.toLowerCase()}`;
    }
  };

  getClassBasedOnSource = (railItem) => {
    return `listing-vertical rail-${railItem.id} ${this.props.addClass}
                ${
                  railItem.sectionSource === SECTION_SOURCE.BINGE_TOP_10_RAIL
                    ? "binge-top-rail"
                    : ""
                }
                ${
                  railItem.sectionSource ===
                  SECTION_SOURCE.BACKGROUND_BANNER_RAIL
                    ? "background-banner-rail"
                    : ""
                }`;
  };

  getSeeAllVariables = (railItem, railIndex) => {
    const {
      recommended = false,
      contentType,
      id,
      isPartnerPage,
      provider = "",
      isTVOD = false,
      location: { pathname },
      taShowType = "",
      taRelatedRail = [],
      taRecommendedRail,
      history,
    } = this.props;
    let routeUrl = pathname && pathname.split("/");
    let breadCrumbSource = pathname && routeUrl[1];
    breadCrumbSource = isEmpty(breadCrumbSource) ? URL.HOME : breadCrumbSource;

    const refUseCase = this.filterRefUseCase(railItem?.id);

    return {
      pathname: getSeeAllUrl(recommended, contentType, id, railItem),
      state: {
        railPosition: railIndex,
        configType: railItem.configType,
        railTitle: railItem.title,
        pageName: this.getAnalyticsPageName(recommended, isPartnerPage),
        isPartnerPage: isPartnerPage,
        provider: provider,
        layoutType: railItem.layoutType,
        sectionSource: railItem.sectionSource,
        placeHolder:
          railItem.sectionSource === SECTION_SOURCE.RECOMMENDATION
            ? railItem.placeHolder
            : "",
        isTVOD: isTVOD,
        taShowType: taShowType,
        taRelatedRail: taRelatedRail,
        routeName: pathname,
        taRecommendedRail: taRecommendedRail,
        mixedRail: railItem.mixedRail,
        recommendationPosition: railItem.recommendationPosition || "",
        contentLocation: history?.location,
        sectionType: railItem.sectionType,
        refUseCase,
      },
      search: `?breadCrumbSource=${breadCrumbSource}`,
    };
  };

  isSeeAllLinkVisible = (railItem) => {
    return (
      ![
        SECTION_SOURCE.LANGUAGE,
        SECTION_SOURCE.GENRE,
        SECTION_SOURCE.BINGE_TOP_10_RAIL,
        SECTION_SOURCE.BACKGROUND_BANNER_RAIL,
        SECTION_SOURCE.PROVIDER,
        SECTION_SOURCE.CATEGORY,
        SECTION_SOURCE.BINGE_CHANNEL,
        SECTION_SOURCE.BINGE_DARSHAN_CHANNEL,
      ].includes(railItem.sectionSource) &&
      ((railItem.sectionSource === SECTION_SOURCE.CONTINUE_WATCHING &&
        railItem.contentList.length >= 6) ||
        railItem.sectionSource !== SECTION_SOURCE.CONTINUE_WATCHING)
    );
  };

  filterRefUseCase = (id) => {
    const { heiarchchyData } = this.props;
    const obj =
      !isEmpty(heiarchchyData) &&
      heiarchchyData.filter((data) => id === data.railId);
    return get(obj, "[0].refId", "");
  };

  renderRail = (railItem, railPosition) => {
    console.log("railItem", railItem);
    const {
      pageType,
      isPartnerPage,
      taRecommendedRail,
      pidetailpage,
      customContents,
      isSeasons,
    } = this.props;
    const toolTipToShow = [
      LAYOUT_TYPE.TOP_PORTRAIT,
      LAYOUT_TYPE.LANDSCAPE,
      LAYOUT_TYPE.PORTRAIT,
    ].includes(railItem.layoutType);
    const notShowToolTip = ![
      SECTION_SOURCE.BINGE_CHANNEL,
      SECTION_SOURCE.GENRE,
      SECTION_SOURCE.LANGUAGE,
      SECTION_SOURCE.BACKGROUND_BANNER_RAIL,
      SECTION_SOURCE.SEASONS,
      SECTION_SOURCE.CATEGORY,
      SECTION_SOURCE.BINGE_DARSHAN_CHANNEL,
    ].includes(railItem.sectionSource);
    const refUseCase = this.filterRefUseCase(railItem?.id);
    const isBackgroundRailProviderEmpty = !!!railItem?.provider;
    return (
      railItem.contentList &&
      railItem.contentList.map((item, index) => {
        return (
          <ListingItem
            railId={railItem?.id}
            refUseCase={refUseCase}
            pageType={pageType}
            isContinueWatching={
              railItem.sectionSource === SECTION_SOURCE.CONTINUE_WATCHING
            }
            scrollPosition={this.props.scrollPosition}
            handleOnMouseDown={this.handleOnMouseDown}
            onClickHandler={this.onRailItemClick}
            item={
              railItem.sectionSource === SECTION_SOURCE.SEASONS
                ? { ...item, image: item.boxCoverImage }
                : item
            }
            key={index}
            dragging={this.state.dragging}
            view={railItem.layoutType}
            title={railItem.title}
            sectionSource={railItem.sectionSource}
            contentSectionSource={item.sectionSource}
            sectionType={railItem.sectionType}
            configType={railItem.configType}
            contentPosition={index}
            railPosition={railPosition}
            isPartnerPage={isPartnerPage}
            pidetailpage={pidetailpage}
            customContents={customContents}
            width={getVariableWidth(
              railItem.layoutType,
              railItem.sectionSource,
              false,
              !!isMobile.any()
            )}
            taRecommendedRail={taRecommendedRail}
            subscribed={
              isUserloggedIn() &&
              this.isPartnerSubscribed(
                railItem.layoutType,
                item.partnerId,
                railItem.sectionSource
              )
            }
            isToolTipRequired={notShowToolTip && toolTipToShow}
            isAbsolute={false}
            classNameSetHover={
              isSeasons
                ? "season-hover"
                : classNameToApply(
                    "set-portrait-hover",
                    LAYOUT_TYPE.PORTRAIT,
                    railItem.layoutType
                  )
            }
            isBackgroundRailProviderEmpty={isBackgroundRailProviderEmpty}
          />
        );
      })
    );
  };

  showLanguageNudge = (sectionSource) => {
    let userLanguage = JSON.parse(getKey(LOCALSTORAGE.PREFERRED_LANGUAGES));

    if (
      sectionSource === SECTION_SOURCE.LANGUAGE_NUDGE &&
      isEmpty(userLanguage)
    ) {
      return <Languages />;
    }
    return null;
  };
  setContainerClassName = () => {
    let { isHomePage, homeScreenFilteredDataItems } = this.props;
    let heroBannerItems =
      homeScreenFilteredDataItems &&
      homeScreenFilteredDataItems.filter(
        (item) => item.sectionType === SECTION_TYPE.HERO_BANNER
      );
    return `
       ${
         isHomePage && !heroBannerItems?.length > 0 && !isMobile.any()
           ? "margin-top-30"
           : ""
       }`;
  };

  handleAfterChange = (item, e, railItem, updatedRailPosition) => {
    afterChangeHandler(
      item,
      e,
      railItem?.contentList.length,
      railItem?.id,
      railItem?.layoutType,
      railItem?.sectionSource,
      this,
      !!isMobile.any()
    );

    if (this.state.prevSlideValue <= item) {
      this.trackMixpanelEvent(railItem, updatedRailPosition);
    }
    this.setState({ prevSlideValue: item });
  };

  trackMixpanelEvent = (railItem, updatedRailPosition) => {
    const { currentSubscription, location } = this.props;
    let pageName = location?.state?.setPathIs?.state?.partnerName
      ? location?.state?.setPathIs?.state?.partnerName
      : location?.state?.source ||
        getAnalyticsSource(this.props.location.pathname, MIXPANEL);
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.VIEW_RAIL_CONTENT, {
      [MIXPANEL.PARAMETER.RAIL_TITLE]:
        railItem.sectionSource === SECTION_SOURCE.SEASONS
          ? MIXPANEL.VALUE.SEASONS
          : railItem?.title,
      [MIXPANEL.PARAMETER.RAIL_POSITION]: updatedRailPosition,
      [MIXPANEL.PARAMETER.PAGE_NAME]: pageName,
      [MIXPANEL.PARAMETER.TIMESTAMP]: moment().format("llll"),
      [MIXPANEL.PARAMETER.DEVICE_TYPE]: MIXPANEL.VALUE.WEB,
      [MIXPANEL.PARAMETER.PACK_PRICE]: currentSubscription?.amountValue,
      [MIXPANEL.PARAMETER.PACK_NAME]: currentSubscription?.productName,
    });
  };
  getRailPositionValue = (updatedRailPosition) => {
    this.setState({
      railPositionValue: updatedRailPosition,
    });
  };
  getTitleClassName = (railItem) => {
    if (railItem.sectionSource === SECTION_SOURCE.BACKGROUND_BANNER_RAIL) {
      let className = "";
      if (railItem?.provider === "" || railItem?.provider == null) {
        className = "empty-provider";
      }
      return `${className} sports-rail`;
    } else if (
      railItem.sectionSource === SECTION_SOURCE.BINGE_CHANNEL ||
      railItem.sectionSource === SECTION_SOURCE.BINGE_DARSHAN_CHANNEL
    ) {
      return "live-rail-title";
    }
  };

  //shuffleItems = () =>{
  // const shuffledItems = railItems.sort(()=>
  // Math.random() - 0.5).map((item) => {...item, sID: Math.random()});
  //}
  getClassName = (sectionSource) => {
    if (sectionSource === SECTION_SOURCE.LANGUAGE) {
      return "browse-by-lang-listing";
    } else if (sectionSource === SECTION_SOURCE.GENRE) {
      return "browse-by-genre-listing";
    } else if (sectionSource === SECTION_SOURCE.PROVIDER) {
      return "provider-listing";
    } else if (sectionSource === SECTION_SOURCE.CATEGORY) {
      return "browse-by-category-listing";
    } else if (sectionSource === SECTION_SOURCE.BINGE_CHANNEL) {
      return "live-channel-listing";
    } else if (sectionSource === SECTION_SOURCE.BINGE_DARSHAN_CHANNEL) {
      return "listing-darshan-live-item";
    }
    return "";
  };

  render() {
    const { items } = this.props,
      railItems =
        items &&
        items.filter((item) => item.sectionType !== SECTION_TYPE.HERO_BANNER);
    const { sportsBannerWidth, sportsBannerHeight } = this.state;

    let settings = {
      dots: false,
      infinite: false,
      speed: 1000,
      draggable: true,
      variableWidth: true,
      swipeToSlide: true,
      arrows: !isMobile.any(),
    };
    let appWidth = document.getElementById("app").clientWidth;
    let railPosition = 0;
    return (
      <ul
        className={`listing-container rail-container ${this.setContainerClassName()}
            ${
              categoryDropdownHeader(this.props.location) &&
              `category-page-listing`
            }
            ${
              railItems?.length > 0 &&
              railItems[0].sectionSource === SECTION_SOURCE.LANGUAGE_NUDGE &&
              this.showLanguageNudge(railItems[0].sectionSource) &&
              "language-nudge"
            }`}
      >
        {railItems?.length > 0 &&
          railItems.map((railItem, railIndex) => {
            console.log("railItemrailItem", railItem);
            if (railItem.sectionSource !== SECTION_SOURCE.LANGUAGE_NUDGE) {
              railPosition++;
            }
            const updatedRailPosition = railPosition;
            return (
              <React.Fragment key={railIndex}>
                {railItem.sectionSource === SECTION_SOURCE.LANGUAGE_NUDGE ? (
                  this.showLanguageNudge(railItem.sectionSource)
                ) : (
                  <li
                    className={this.getClassBasedOnSource(railItem)}
                    key={railItem.id}
                  >
                    <>
                      {" "}
                      Hiiiiiiiiiiiiiii
                      <div
                        className={`${
                          railItem.sectionSource ===
                            SECTION_SOURCE.BACKGROUND_BANNER_RAIL &&
                          `sports-rail-wrapper`
                        }`}
                      >
                        {railItem.sectionSource ===
                          SECTION_SOURCE.BACKGROUND_BANNER_RAIL && (
                          <div className="sports-rail-background">
                            <img
                              alt=""
                              src={`${cloudinaryCarousalUrl(
                                "",
                                "",
                                sportsBannerWidth * 2,
                                sportsBannerHeight * 2
                              )}${railItem.backgroundImage}`}
                            />
                          </div>
                        )}
                        <div className={this.getTitleClassName(railItem)}>
                          {railItem?.contentList?.length > 0 && (
                            <div className={`divider-title-section`}>
                              {(railItem?.provider === "" ||
                                railItem?.provider == null) &&
                              isMobile.any() &&
                              railItem?.sectionSource ===
                                SECTION_SOURCE.BACKGROUND_BANNER_RAIL ? null : (
                                <>
                                  {railItem?.sectionSource ===
                                    SECTION_SOURCE.BACKGROUND_BANNER_RAIL &&
                                  isMobile.any() ? (
                                    <img
                                      className="sports-rail-header-image"
                                      src={`${this.getProviderLogoImage(
                                        railItem?.provider
                                      )}`}
                                      alt="sport-tilte"
                                    />
                                  ) : (
                                    <span className="rail-title">
                                      <h3>{railItem.title}</h3>
                                      {(railItem?.sectionSource ===
                                        SECTION_SOURCE.BINGE_CHANNEL ||
                                        railItem?.sectionSource ===
                                          SECTION_SOURCE.BINGE_DARSHAN_CHANNEL) && (
                                        <div className="red-dot">
                                          <img
                                            src={LiveDot}
                                            className="livedot-image"
                                          />
                                        </div>
                                      )}
                                    </span>
                                  )}
                                </>
                              )}
                              {this.isSeeAllLinkVisible(railItem) ? (
                                <span
                                  className={`see-all-link    ${
                                    railItem.sectionSource ===
                                      SECTION_SOURCE.PROVIDER &&
                                    `see-all-margin`
                                  }`}
                                  onClick={() =>
                                    this.seeAll(
                                      this.getSeeAllVariables(
                                        railItem,
                                        updatedRailPosition
                                      )
                                    )
                                  }
                                ></span>
                              ) : (
                                // <span className="icon-Right-Blue-Arrow" onClick={()=>this.seeAll(this.getSeeAllVariables(railItem,
                                //    railIndex ))} ></span>
                                <p
                                  className={`${
                                    ![
                                      SECTION_SOURCE.LANGUAGE,
                                      SECTION_SOURCE.GENRE,
                                      SECTION_SOURCE.BINGE_CHANNEL,
                                      SECTION_SOURCE.BINGE_DARSHAN_CHANNEL,
                                    ].includes(railItem.sectionSource) &&
                                    "browse-by"
                                  }`}
                                />
                              )}
                            </div>
                          )}
                          <ul
                            className={`listing-horizontal ${this.getListingClass(
                              railItem
                            )} ${
                              railItem.sectionSource ===
                                SECTION_SOURCE.SEASONS && "seasons-block"
                            }`}
                            key={railItem.id}
                            ref={(input) => {
                              this[`textInput${railItem.id}`] = input;
                            }}
                          >
                            {appWidth > MOBILE_BREAKPOINT ? (
                              <>
                                <Slider
                                  lazyLoad="ondemand"
                                  {...{
                                    ...settings,
                                    slidesToScroll: this.state[
                                      `slidesToScroll_${railItem.id}`
                                    ]
                                      ? this.state[
                                          `slidesToScroll_${railItem.id}`
                                        ]
                                      : getDefaultValue(
                                          railItem.layoutType,
                                          railItem.contentList.length,
                                          railItem.sectionSource,
                                          !!isMobile.any()
                                        ),
                                  }}
                                  beforeChange={() => beforeChangeHandler(this)}
                                  afterChange={(item, e) =>
                                    this.handleAfterChange(
                                      item,
                                      e,
                                      railItem,
                                      updatedRailPosition
                                    )
                                  }
                                  slidesToShow={slidesToShow(
                                    railItem.layoutType,
                                    railItem.sectionSource,
                                    !!isMobile.any()
                                  )}
                                  ref={(slider) =>
                                    (this[`slider${railItem.id}`] = slider)
                                  }
                                >
                                  <div>
                                    <span class="listing-block">
                                      <li
                                        className={`listing-item ${this.getClassName(
                                          railItem?.sectionSource
                                        )}`}
                                        style={{
                                          position: "relative",
                                        }}
                                      >
                                        <div
                                        className="shuffleCardContainer"
                                          style={{
                                            display: "grid",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            width: "100%",
                                            boxSizing: "border-box",
                                            background: "#220046",
                                            border: "0.603432px solid #e4e4e4",
                                            borderRadius: "6.07203px",
                                            position: "absolute",
                                            top: 0,
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "grid",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              height: "99.6%",
                                              width: "99.6%",
                                              boxSizing: "border-box",
                                              background: "#220046",
                                              border:
                                                "0.603432px solid #e4e4e4",
                                              borderRadius: "6.07203px",
                                              position: "absolute",
                                              top: 0,
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: "grid",
                                                alignItems: "center",
                                                justifyContent: "center",

                                                height: "99.3%",
                                                width: "99.3%",
                                                boxSizing: "border-box",
                                                background: "#220046",
                                                border:
                                                  "0.603432px solid #e4e4e4",
                                                borderRadius: "6.07203px",
                                                position: "absolute",
                                                top: 0,
                                              }}
                                            >
                                              <div
                                                style={{
                                                  display: "grid",
                                                  alignItems: "center",
                                                  justifyContent: "center",

                                                  height: "99.5%",
                                                  width: "99.2%",
                                                  boxSizing: "border-box",
                                                  background: "#220046",
                                                  border:
                                                    "0.603432px solid #e4e4e4",
                                                  borderRadius: "6.07203px",
                                                  position: "absolute",
                                                  top: 0,
                                                }}
                                              >
                                                <div>
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                      marginBottom: ".5rem",
                                                    }}
                                                  >
                                                    <img
                                                      style={{
                                                        height: "100%",
                                                        width: "25%",
                                                        position: "relative",
                                                      }}
                                                      src={shuffleImg}
                                                    />
                                                  </div>
                                                  <div>
                                                    <span
                                                      style={{
                                                        color: "#F3CBE3",
                                                        fontSize: "78%",
                                                        textAlign: "center",
                                                        marginBottom: "10px",
                                                        fontWeight: 600,
                                                        display: "block",
                                                      }}
                                                    >
                                                      Shuffle
                                                    </span>
                                                    <span
                                                      style={{
                                                        color: "#F3CBE3",
                                                        fontSize: "78%",
                                                        textAlign: "center",
                                                        marginBottom: "10px",
                                                        fontWeight: 600,
                                                        display: "block",
                                                      }}
                                                    >
                                                      Content
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    </span>
                                  </div>

                                  {this.renderRail(railItem, railPosition)}
                                </Slider>
                              </>
                            ) : (
                              <div
                                className={`horizontal-rail railItem-${railItem.id}`}
                                onTouchStart={() =>
                                  this.getRailPositionValue(updatedRailPosition)
                                }
                              >
                                {this.renderRail(railItem, railPosition)}
                              </div>
                            )}
                          </ul>
                        </div>
                      </div>
                    </>
                    {/* ) : (
                      <BrowseApp
                        railItem={railItem}
                        browseAppList={
                          browseAppList ? browseAppList.contentList : []
                        }
                        onClickHandler={this.onRailItemClick}
                        dragging={this.state.dragging}
                      />
                    )} */}
                  </li>
                )}
              </React.Fragment>
            );
          })}
      </ul>
    );
  }
}

Listing.propTypes = {
  items: PropTypes.array,
  history: PropTypes.object,
  recommended: PropTypes.bool,
  contentType: PropTypes.string,
  id: PropTypes.any,
  analyticsHomeEvent: PropTypes.bool,
  location: PropTypes.object,
  isPartnerPage: PropTypes.bool,
  provider: PropTypes.string,
  pageType: PropTypes.string,
  isTVOD: PropTypes.bool,
  taShowType: PropTypes.string,
  taRelatedRail: PropTypes.array,
  taRecommendedRail: PropTypes.bool,
  showModal: PropTypes.bool,
  showMobilePopup: PropTypes.bool,
  addClass: PropTypes.string,
  customContents: PropTypes.func,
  pidetailpage: PropTypes.bool,
  currentSubscription: PropTypes.object,
  isHomePage: PropTypes.bool,
  homeScreenFilteredDataItems: PropTypes.array,
};

const mapStateToProps = (state) => ({
  currentSubscription: get(
    state.subscriptionDetails,
    "currentSubscription.data"
  ),
  isHomePage: state?.headerDetails?.isHomePage,
  homeScreenFilteredDataItems: state?.homeDetails?.homeScreenFilteredDataItems,
  heiarchchyData: get(state, "homeDetails.homeScreenHeirarchyData", ""),
});

export default withRouter(connect(mapStateToProps)(trackWindowScroll(Listing)));
