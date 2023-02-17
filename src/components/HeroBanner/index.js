import React, { Component } from 'react';
import { compose } from "redux";
import { withRouter } from 'react-router';
import get from 'lodash/get';
import PropTypes from "prop-types";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import isEmpty from "lodash/isEmpty";
import * as moment from "moment";

import {
    analyticsHomeClickEvent,
    categoryDropdownHeader,
    cloudinaryCarousalUrl,
    getAnalyticsSource,
    getContentDetailSource,
    getContentLanguage,
    getPrimaryLanguage,
    getProviderLogo,
    isFreeContentEvent,
    isMobile,
    queryStringToObject,
    safeNavigation,
    showCrown,
    getFormattedURLValue,
    getFormattedContentTitle,
} from "@utils/common";
import { URL } from "@constants/routeConstants";

import imagePlaceholderHeroBanner from "@assets/images/image-placeholder-hero-banner.png";
import { TAB_BREAKPOINT, BOTTOM_SHEET, SECTION_TYPE, PARTNER_SUBSCRIPTION_TYPE, LOCALSTORAGE } from "@utils/constants";
import MIXPANEL from "@constants/mixpanel";
import "./style.scss";
import dataLayerConfig from '@utils/dataLayer';
import DATALAYER from '@utils/constants/dataLayer';
import mixPanelConfig from "@utils/mixpanel";
import { connect } from "react-redux";
import { getTitleAndDesc } from "@containers/PIDetail/PIDetailCommon";
import { getKey } from "@utils/storage";

class HeroBanner extends Component {
    constructor(props) {
        super(props);
        let appWidth = document.getElementById('app').clientWidth;
        let bannerImgHeight = (appWidth / (appWidth < 500 ? 1.77 : 3)).toString();
        let providerLogoSize = appWidth / 10.8;
        this.state = {
            heroBannerWidth: document.getElementById('app').clientWidth,
            heroBannerHeight: parseInt(bannerImgHeight),
            providerLogoWidth: Math.ceil(providerLogoSize),
            providerLogoHeight: Math.ceil(providerLogoSize / 3.75),
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleOnResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleOnResize);
    }

    handleOnResize = () => {
        let appWidth = document.getElementById('app').clientWidth;
        let bannerImgHeight = (appWidth / (appWidth < 500 ? 2 : 3)).toString();
        let providerLogoSize = appWidth / 10.8;
        this.setState({
            heroBannerWidth: appWidth,
            heroBannerHeight: parseInt(bannerImgHeight),
            providerLogoWidth: Math.ceil(providerLogoSize),
            providerLogoHeight: Math.ceil(providerLogoSize / 3.75),
        })
    };

    bannerClick = (item, contentPosition) => {
        let { heroBannerItems: { sectionType } = {}, location: { pathname } } = this.props;
        let data = { sectionSource: item.sectionSource, sectionType, contentPosition };
        data.pathname = pathname;
        dataLayerConfig.trackEvent(DATALAYER.EVENT.BANNER_CLICKS, {
            [DATALAYER.PARAMETER.CONTENT_TITLE]: item?.contentType,
            [DATALAYER.PARAMETER.PAGE_NAME]: pathname,

        })
        analyticsHomeClickEvent(item, data);
        this.redirectToDetailPage(item, data);
    };

    providerImage = (provider, logoWidth, logoHeight, imageType) => {
        let imageUrl = '';
        let providerLogo = getProviderLogo();

        if (provider && providerLogo && Object.entries(providerLogo).length !== 0) {
            provider = provider.toUpperCase();
            let providerImages = providerLogo[provider];
            let url = providerImages ? providerImages[imageType] : '';
            imageUrl = url ? `${cloudinaryCarousalUrl('', '', logoWidth, logoHeight)}${url}` : '';
        }
        return imageUrl;
    };

    showHeroBannerItems = () => {
        let { isPartnerPage, heroBannerItems } = this.props;
        if (isPartnerPage && heroBannerItems) {
            return true;
        } else if (!isPartnerPage) {
            return true;
        }
    }

    redirectToDetailPage = (item, data) => {
        let { history, location: { pathname }, location } = this.props;
        let routeUrl = pathname && pathname.split("/");
        let breadCrumbSource = pathname && routeUrl[1];
        let search = queryStringToObject(location.search);
        breadCrumbSource = isEmpty(breadCrumbSource) ? URL.HOME : breadCrumbSource;

        let sourcePath = routeUrl.includes("breadCrumbSource")
        let pathValid = "";
        if (sourcePath === false) {
            pathValid = history.location;
        }

        safeNavigation(history, {
            pathname: `/${URL.DETAIL}/${getFormattedURLValue(item.contentType)}/${item.id}/${getFormattedContentTitle(item.title)}`,
            state: {
                railTitle: MIXPANEL.VALUE.HERO_BANNER,
                railPosition: 0,
                source: getContentDetailSource(
                    pathname,
                    item.contentType,
                    item.contractName,
                ),
                sectionSource: item.sectionSource,
                configType: item.sectionSource,
                title: item.title,
                setPathIs: pathValid,
                isFromHeroBanner: true,
                sectionType: data?.sectionType,
                conPosition: data?.contentPosition,
                contentSectionSource: item?.contentSectionSource,
            },
            search: `?breadCrumbSource=${!isEmpty(search.breadCrumbSource) ? search.breadCrumbSource : breadCrumbSource}`,
        });
    };

    getAnalyticsData = (analytics = MIXPANEL, value, item) => {
        let {
            sectionType,
            sectionSource,
            title: railTitle = "",
            railPosition,
            isPartnerPage = false,
            pathname,
            contentPosition,
        } = value;
        const {
            position,
            contentType,
            provider,
            title,
        } = item;
        return {
            [`${MIXPANEL.PARAMETER.HERO_BANNER_NUMBER}`]:
                sectionType === SECTION_TYPE.HERO_BANNER ? Number(contentPosition) + 1 : "",
            [`${MIXPANEL.PARAMETER.CONTENT_TYPE}`]: sectionSource,
            [`${MIXPANEL.PARAMETER.PARTNER}`]: `${provider}`,
            [`${MIXPANEL.PARAMETER.CONTENT_TITLE}`]: `${title}`,
            [`${MIXPANEL.PARAMETER.RAIL_TYPE}`]: sectionSource,
            [`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`]: sectionType,
            [`${MIXPANEL.PARAMETER.TIMESTAMP}`]: moment().valueOf(),
            [`${MIXPANEL.PARAMETER.PARTNER_HOME}`]: isPartnerPage
                ? MIXPANEL.VALUE.YES
                : MIXPANEL.VALUE.NO,
            [`${MIXPANEL.PARAMETER.PAGE_NAME}`]: isPartnerPage
                ? MIXPANEL.VALUE.PARTNER_HOME
                : getAnalyticsSource(pathname, MIXPANEL),
        };
    };

    handleAfterChange = (currentIndex) => {
        let screenTopOffset = window.scrollY;

        if (screenTopOffset < 5) {
            let bannerData = this.props.heroBannerItems.contentList.find((_, index) => index === currentIndex);
            let isFreeContent = !showCrown(bannerData) ? MIXPANEL.VALUE.CAPITALIZED_YES : MIXPANEL.VALUE.CAPITALIZED_NO
            let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || []
            const contentAuth = (isFreeContentEvent(bannerData.contractName, partnerInfo, bannerData?.partnerId, this.props.currentSubscription?.subscriptionStatus) ||
                (bannerData?.partnerSubscriptionType?.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()))
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.VIEW_HERO_BANNER, {
                [MIXPANEL.PARAMETER.TIMESTAMP]: moment().valueOf(),
                [MIXPANEL.PARAMETER.HERO_BANNER_NUMBER]: currentIndex + 1,
                [MIXPANEL.PARAMETER.PAGE_NAME]: getAnalyticsSource(this.props.location.pathname),
                [MIXPANEL.PARAMETER.CONTENT_TYPE]: bannerData?.sectionSource,
                [MIXPANEL.PARAMETER.CONTENT_LANGUAGE]: getContentLanguage(bannerData.audio) || '',
                [MIXPANEL.PARAMETER.CONTENT_LANGUAGE_PRIMARY]: getPrimaryLanguage(bannerData?.audio) || "",
                [MIXPANEL.PARAMETER.CONTENT_GENRE]: bannerData?.genre?.join() || bannerData?.genres?.join() || '',
                [MIXPANEL.PARAMETER.CONTENT_GENRE_PRIMARY]: bannerData?.genre?.[0] || bannerData?.genres?.[0] || "",
                [MIXPANEL.PARAMETER.CONTENT_PARTNER]: bannerData?.provider,
                [MIXPANEL.PARAMETER.CONTENT_AUTH]: contentAuth ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
                [MIXPANEL.PARAMETER.CONTENT_CATEGORY]: bannerData?.contentType,
                [MIXPANEL.PARAMETER.CONTENT_RATING]: bannerData?.rating,
                [MIXPANEL.PARAMETER.CONTENT_PARENT_TITLE]: getTitleAndDesc(bannerData, bannerData?.contentType),
                [MIXPANEL.PARAMETER.CONTENT_TITLE]: getTitleAndDesc(bannerData, bannerData?.contentType),
                [MIXPANEL.PARAMETER.FREE_CONTENT]: isFreeContent,
                [MIXPANEL.PARAMETER.RELEASE_YEAR]: bannerData?.releaseYear,
                [MIXPANEL.PARAMETER.DEVICE_TYPE]: MIXPANEL.VALUE.WEB,
                [MIXPANEL.PARAMETER.ACTOR]: bannerData?.actor?.join() || "",
                [MIXPANEL.PARAMETER.PACK_PRICE]: this.props?.currentSubscription?.amountValue,
                [MIXPANEL.PARAMETER.PACK_TYPE]: this.props?.currentSubscription?.productName,
                [MIXPANEL.PARAMETER.AUTO_PLAYED]: MIXPANEL.VALUE.CAPITALIZED_NO,
                [MIXPANEL.PARAMETER.LIVE_CONTENT]: MIXPANEL.VALUE.CAPITALIZED_NO,
            })
        }
    }
    render() {
        let { heroBannerItems, location: { pathname }, isCampaign } = this.props;
        let { heroBannerWidth, heroBannerHeight } = this.state;
        let settings = {
            dots: true,
            autoplay: true,
            infinite: true,
            adaptiveHeight: true,
            swipeToSlide: true,
            centerMode: !isMobile.any(),
            variableWidth: !isMobile.any(),
            appendDots: dots => <ul>{dots}</ul>,
            customPaging: () => (
                <div className="slick-dot-container" />
            ),
        };
        const urlArr = pathname.split("/");
        settings = isCampaign ? { ...settings, ...{ centerMode: isCampaign, variableWidth: isCampaign } } : settings
        return (
            <div className={`container ${categoryDropdownHeader(this.props?.location) && `category-page-banner`}`}
                style={{ height: heroBannerHeight }}>
                {(urlArr[1] === BOTTOM_SHEET.CATEGORIES?.toLowerCase() && window.innerWidth > TAB_BREAKPOINT) && (
                    <div className="categoryPopup">{urlArr[2]}</div>
                )}
                {this.showHeroBannerItems() &&
                    heroBannerItems &&
                    get(heroBannerItems, "contentList") && (
                        <Slider {...settings} afterChange={(e) => this.handleAfterChange(e)}>
                            {heroBannerItems.contentList.map((item, index) => {
                                return (
                                    <span key={index}>
                                        <div
                                            key={item.id}
                                            className="hero-banner"
                                            style={{ height: heroBannerHeight }}
                                            onClick={() => !isCampaign && this.bannerClick(item, index)}
                                        >
                                            {/* <img src={imagePlaceholderHeroBanner} alt={'place-holder-image'}/> */}
                                            <img
                                                alt=""
                                                src={isMobile.any() ? (item?.appImageBM ? item.appImageBM : item.image) : item?.webImageBM ? item.webImageBM : item.image}
                                                //height={heroBannerWidth / 2.70}
                                                //src={item.appImageBM }
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    //e.target.src = imagePlaceholderHeroBanner;
                                                }}
                                            />
                                            {showCrown(item) &&
                                                <img
                                                    className="crown-image"
                                                    alt="freemium-image"
                                                    src={`../../assets/images/crown-icon-upd.svg`}
                                                />
                                            }
                                        </div>
                                    </span>
                                );
                            })}
                        </Slider>
                    )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),

});

HeroBanner.propTypes = {
    heroBannerItems: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
    isPartnerPage: PropTypes.bool,
    partnerSubscribed: PropTypes.bool,
    location: PropTypes.object,
};

export default compose(withRouter, connect(mapStateToProps))(HeroBanner);
