import {
    CONTENTTYPE,
    CONTRACT,
    LAYOUT_TYPE,
    LOCALSTORAGE,
    PARTNER_SUBSCRIPTION_TYPE,
    SECTION_SOURCE,
    SECTION_TYPE,
    TA_MAX_CONTENT
} from "@constants";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import {
    checkPartnerPlayable,
    getAnalyticsContentType,
    getAnalyticsRailCategory,
    getAnalyticsRailCategoryRegular,
    getAnalyticsSource,
    getContentLanguage,
    getPrimaryLanguage,
    getProviderLogo,
    isFreeContentEvent,
    isMobile,
    isUserloggedIn,
    isFreeContentMixpanel,
    providerImage
} from "@utils/common";
import { getKey } from "@utils/storage";
import get from "lodash/get";
import queryString from "querystring";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@constants/appsFlyer";
import { isArray } from "lodash";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import { PROVIDER_NAME, INTEGRATED_PARTNER_LIST } from '@utils/constants/playerConstant';
import { openPopup } from '@common/Modal/action';
import store from "@src/store";
import { MODALS } from '@common/Modal/constants';
import { FORMATTED_CONTENT_TYPE } from '@utils/constants';
import moment from "moment";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import isEmpty from "lodash/isEmpty";
export const getTitleAndDesc = (meta, contentType, desc = false) => {
    if ([CONTENTTYPE.TYPE_BRAND, CONTENTTYPE.TYPE_BRAND_CHILD, CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL].includes(contentType)) {
        return desc ? meta?.brandDescription : meta?.brandTitle;
    } else if ([CONTENTTYPE.TYPE_SERIES, CONTENTTYPE.TYPE_SERIES_CHILD, CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL].includes(contentType)) {
        return desc ? meta?.seriesDescription : meta?.seriesTitle;
    } else {
        return desc ? (meta?.description || meta?.vodDescription || '' ) : (meta?.title || meta?.vodTitle || '');
    }
}

export const getAnalyticsData = (analytics = MIXPANEL, isForDeepLink = false, props, state) => {
    const storeState = store.getState();
    const { meta = {} } = props;
    const { mixpanelData: { configType, conPosition, sectionType, contentSectionSource, sectionSource } } = state;
    const { updatedContentType } = getParentContentData(meta);
    const detail = get(storeState.PIDetails.data, 'detail');
    const currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data');
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || [];
    const contentAuth = (isFreeContentEvent(detail?.contractName, partnerInfo, meta.partnerId, currentSubscription?.subscriptionStatus) ||
        (meta?.partnerSubscriptionType?.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()))

    let commonData = {
        [`${analytics.PARAMETER.CONTENT_TITLE}`]: getTitleAndDesc(meta, meta?.contentType),
        [`${analytics.PARAMETER.CONTENT_TYPE}`]: contentSectionSource,
        [`${analytics.PARAMETER.CONTENT_GENRE}`]: meta?.genre?.join(),
        // [`${analytics.PARAMETER.PARTNER_NAME}`]: meta?.provider,
        [`${analytics.PARAMETER.RAIL_TYPE}`]: sectionSource || "",
        [`${analytics.PARAMETER.RAIL_CATEGORY}`]: getAnalyticsRailCategoryRegular(sectionType, analytics),
        [`${analytics.PARAMETER.CONTENT_PARTNER}`]: meta?.provider || "",
        [`${analytics.PARAMETER.CONTENT_AUTH}`]: contentAuth ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
        [`${analytics.PARAMETER.CONTENT_CATEGORY}`]: updatedContentType,
        [`${analytics.PARAMETER.CONTENT_POSITION}`]: conPosition,
        [`${analytics.PARAMETER.CONTENT_PARENT_TITLE}`]: getTitleAndDesc(meta, meta?.contentType),
        [`${analytics.PARAMETER.AUTO_PLAYED}`]: MIXPANEL.VALUE.CAPITALIZED_NO,
        [`${analytics.PARAMETER.LIVE_CONTENT}`]: MIXPANEL.VALUE.CAPITALIZED_NO,
    };
    let deeplinkReqData = {
        [`${analytics.PARAMETER.DURATION_SECONDS}`]: '',
        [`${analytics.PARAMETER.DURATION_MINUTES}`]: '',
        [`${analytics.PARAMETER.START_TIME}`]: '',
        [`${analytics.PARAMETER.STOP_TIME}`]: '',
        [`${analytics.PARAMETER.BUFFER_DURATION_MINUTES}`]: '',
        [`${analytics.PARAMETER.BUFFER_DURATION_SECONDS}`]: '',
        [`${analytics.PARAMETER.NUMBER_OF_PAUSE}`]: '',
        [`${analytics.PARAMETER.NUMBER_OF_RESUME}`]: '',
    }
    if (isForDeepLink) {
        return { ...commonData, ...deeplinkReqData }
    } else {
        return commonData;
    }
};

export const getCommonAnalyticsAttributes = (eventName, props, state) => {
    let { meta } = props;
    const reduxState = store.getState();
    const currentSubscription = reduxState?.subscriptionDetails?.currentSubscription?.data;
    const location = props?.location || props?.history?.location || {};
    const { mixpanelData: { configType, conPosition, sectionType, sectionSource } } = state;
    let mixpanelData = getAnalyticsData(MIXPANEL, false, props, state);
    let moengageData = getAnalyticsData(MOENGAGE, false, props, state);
    let isFreeContent = isFreeContentMixpanel(meta);
    let noSource = state?.mixpanelData?.source !== MIXPANEL.VALUE.OTHERS && state?.mixpanelData?.source !== ""
    let data = {
        [`${MIXPANEL.PARAMETER.SOURCE}`]: state.mixpanelData.source || '',
        // [`${MIXPANEL.PARAMETER.ORIGIN}`]: state.mixpanelData.origin || '',
        [`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE}`]: getContentLanguage(props?.meta?.audio) || '',
        [`${MIXPANEL.PARAMETER.PACK_NAME}`]: currentSubscription?.productName,
        [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: currentSubscription?.amountValue,
        [`${MIXPANEL.PARAMETER.RELEASE_YEAR}`]: meta?.releaseYear || "",
        [`${MIXPANEL.PARAMETER.CONTENT_GENRE}`]: meta?.genre?.join() || meta?.genres?.join() || '',
        [`${MIXPANEL.PARAMETER.CONTENT_GENRE_PRIMARY}`]: meta?.genre?.[0] || meta?.genres?.[0] || "",
        [`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE_PRIMARY}`]: getPrimaryLanguage(meta?.audio) || "",
        [`${MIXPANEL.PARAMETER.PAGE_NAME}`]: location?.state?.source, //: getAnalyticsSource(props.location.pathname);
        [`${MIXPANEL.PARAMETER.CONTENT_RATING}`]: meta?.rating,
        [`${MIXPANEL.PARAMETER.FREE_CONTENT}`]: isFreeContent,
        [`${MIXPANEL.PARAMETER.DEVICE_TYPE}`]: MIXPANEL.VALUE.WEB,
        [`${MIXPANEL.PARAMETER.ACTOR}`]: meta?.actor?.join() || "",

        [`${MIXPANEL.PARAMETER.PACK_TYPE}`] : currentSubscription?.productName,

    };

    if (eventName !== MIXPANEL.EVENT.HERO_BANNER_CLICKS) {
        data[`${MIXPANEL.PARAMETER.RAIL_POSITION}`] = eventName === MIXPANEL.EVENT.CONTENT_CLICK && noSource ? (state.mixpanelData.railPosition > 0 ? state.mixpanelData.railPosition - 1 : 0) : state.mixpanelData.railPosition;
        data[`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`] = getAnalyticsRailCategory(location?.state?.sectionSource, MIXPANEL);
        data[`${MIXPANEL.PARAMETER.RAIL}`] = state.mixpanelData.railTitle || '';
        data[`${MIXPANEL.PARAMETER.RAIL_TYPE}`] = configType || "";
        data[`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`] = getAnalyticsRailCategoryRegular(sectionType, MIXPANEL);
        // data[`${MIXPANEL.PARAMETER.PARTNER_NAME}`] = meta?.provider;
        data[`${MIXPANEL.PARAMETER.CONTENT_POSITION}`] = conPosition;
        // mixpanelData[`${MIXPANEL.PARAMETER.RAIL_TYPE}`] = configType || "";
        mixpanelData[`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`] = getAnalyticsRailCategoryRegular(sectionType, MIXPANEL);
    }
    if (eventName === MIXPANEL.EVENT.PLAY_CONTENT) {
        data[`${MIXPANEL.PARAMETER.START_TIME}`] = ""
        data[`${MIXPANEL.PARAMETER.STOP_TIME}`] = ""
    }

    mixpanelData = { ...mixpanelData, ...data };
    moengageData = { ...moengageData, ...data };
    return { mixpanelData, moengageData };
};

export const apiCall = async (id, contentType, obj) => {
    let { fetchPIData, showMainLoader, hideMainLoader, fetchContinueWatchingDetails } = obj.props;
    showMainLoader();
    await fetchPIData(id, contentType);

    /** ------ if contentType is TV_SHOW or any series episode then we need parent id and content type
     *  because fetchContinueWatchingDetails will give data of last-played content of passed ID and in case of
     *  TV_SHOW or any series episode we need data of their parent i.e BRAND to show correct information
     *  on play resume button and isFavourite star icon ------ **/
    let { updatedId, updatedContentType } = getParentContentData(obj.props.meta);
    await fetchContinueWatchingDetails(updatedId, updatedContentType, obj.props.meta?.partnerId);

    if (obj.props.meta) {
        const { meta: { taShowType, vodId }, detail } = obj.props;
        let data = taShowType.split('-');
        let content = data[1];
        let updatedId = getTAUpdatedId(id, contentType, vodId);
        if (detail?.contractName !== CONTRACT.RENTAL) {
            await fetchTARecommendedData(updatedId, content, obj.props, obj);
            hideMainLoader();
        } else {
            await fetchVrRecommendedRail(obj.props);
            hideMainLoader();
        }

        trackEvent(obj);
    } else {
        hideMainLoader();
    }
}

export const getTAUpdatedId = (id, contentType, vodId) => {
    let updatedId = id;
    if ([CONTENTTYPE.TYPE_BRAND, CONTENTTYPE.TYPE_BRAND_CHILD, CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL,
    CONTENTTYPE.TYPE_SERIES, CONTENTTYPE.TYPE_SERIES_CHILD, CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL,
    CONTENTTYPE.TYPE_TV_SHOWS, CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL].includes(contentType)) {
        updatedId = vodId;
    }
    return updatedId;
}

export const fetchTARecommendedData = async (id, contentType, props, obj) => {
    const { configResponse, getTARecommendationRail, meta } = props;
    let taRelatedRail = get(configResponse, 'config.taRelatedRail');
    let data = taRelatedRail && taRelatedRail.filter(item => item.contentType === contentType);
    let useCase = data && data[0]?.useCase;
    let layout = queryString.parse(props.location.search)['?layout'];

    let result = {
        contentType: contentType,
        placeholder: useCase,
        id: id,
        layout: layout ? layout : LAYOUT_TYPE.LANDSCAPE,
        provider: meta.provider,
        max: TA_MAX_CONTENT.TA_MAX
    }
    data && await getTARecommendationRail(result).catch(() => {
        fetchVrRecommendedRail(props);
    });

    let state = store.getState()
    let taRecommendationList = get(state.PIDetails, 'taRecommendation.data');
    let taRecommendationCode = get(state.PIDetails, 'taRecommendation.code');

    if (taRecommendationCode === 0) {
        if (taRecommendationList.contentList.length === 0) {
            await fetchVrRecommendedRail(props);
        } else {
            obj.setState({ taRecommendedRail: true });
        }
    } else {
        await fetchVrRecommendedRail(props);
    }
}

export const fetchVrRecommendedRail = async (props) => {
    let { updatedId, updatedContentType } = getParentContentData(props.meta);
    let recommendedData = {
        seeAll: false,
        id: updatedId,
        contentType: updatedContentType,
        from: 0,
        max: 10,
        preferredLanguages: 'English',
    };
    await props.fetchPIRecommendedData(recommendedData);
}

export const trackEvent = (obj) => {
    const { location, meta } = obj.props;
    const { railTitle = '', source = '', sectionSource = '' } = location?.state || {};
    const { audio, provider, contentType } = meta;
    let value = '', updatedAnalyticsData = {};
    let isFreeContent = isFreeContentMixpanel(meta);
    if ([SECTION_SOURCE.EDITORIAL, SECTION_SOURCE.TVOD, SECTION_SOURCE.CONTINUE_WATCHING].includes(sectionSource)) {
        value = MIXPANEL.VALUE.EDITORIAL;
    } else if (sectionSource === SECTION_SOURCE.RECOMMENDATION) {
        value = MIXPANEL.VALUE.RECOMMENDATION;
    } else if ([SECTION_SOURCE.LANGUAGE, SECTION_SOURCE.GENRE, SECTION_SOURCE.SEARCH].includes(sectionSource)) {
        value = MIXPANEL.VALUE.SEARCH;
    }
    appsFlyerConfig.trackEvent(APPSFLYER.EVENT.CONTENT_DETAIL, {
        [APPSFLYER.PARAMETER.CONTENT_TITLE]: getTitleAndDesc(meta, contentType),
        [APPSFLYER.PARAMETER.CONTENT_TYPE]: getAnalyticsContentType(contentType, APPSFLYER),
        [APPSFLYER.PARAMETER.FREE_CONTENT]: isFreeContent,
        [APPSFLYER.PARAMETER.SOURCE]: source,
        [APPSFLYER.PARAMETER.PARTNER_NAME]: provider,
        [APPSFLYER.PARAMETER.CONTENT_LANGUAGE]: getContentLanguage(audio),
    });

    obj.setState(
        {
            mixpanelData: {
                railTitle: railTitle,
                source: source,
                origin: value,
                conPosition: get(location.state, "conPosition"),
                railPosition: setRailPosition(obj.props),
                sectionSource: get(location.state, "sectionSource"),
                configType: get(location.state, "configType"),
                contentSectionSource: get(location.state, "contentSectionSource"),
                sectionType: get(location.state, "sectionType"),
            },
        },
        () => {
            if (obj.props?.location?.state?.isFromHeroBanner) {
                const sectionType = get(location.state, "sectionType")
                updatedAnalyticsData = getCommonAnalyticsAttributes(MIXPANEL.EVENT.HERO_BANNER_CLICKS, obj.props, obj.state)
                updatedAnalyticsData.mixpanelData[MIXPANEL.PARAMETER.TIMESTAMP] = moment().valueOf();
                updatedAnalyticsData.mixpanelData[MIXPANEL.PARAMETER.HERO_BANNER_NUMBER] = sectionType === SECTION_TYPE.HERO_BANNER ? Number(obj?.props?.location?.state?.conPosition) + 1 : "";
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.HERO_BANNER_CLICKS, updatedAnalyticsData.mixpanelData);
            }
            updatedAnalyticsData = getCommonAnalyticsAttributes(MIXPANEL.EVENT.CONTENT_CLICK, obj.props, obj.state);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_CLICK, updatedAnalyticsData.mixpanelData);
            updatedAnalyticsData = getCommonAnalyticsAttributes(MIXPANEL.EVENT.VIEW_CONTENT_DETAIL, obj.props, obj.state);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.VIEW_CONTENT_DETAIL, updatedAnalyticsData.mixpanelData);
            moengageConfig.trackEvent(MOENGAGE.EVENT.VIEW_CONTENT_DETAIL, updatedAnalyticsData.moengageData);
        }
    );
};

export const setRailPosition = (props) => {
    const { location } = props;
    const source = get(location.state, 'source');
    const railPosition = get(location.state, 'railPosition');

    if ([MIXPANEL.VALUE.HOME, MIXPANEL.VALUE.MOVIES, MIXPANEL.VALUE.TV_SHOWS, MIXPANEL.VALUE.SPORTS, MIXPANEL.VALUE.SEE_ALL].includes(source) &&
        !(railPosition === undefined || railPosition === null)) {
        return parseInt(railPosition) + 1;
    }
    return railPosition;
}

export const trackTrailerEvent = async (props, state) => {
    const { meta, detail, match: { params }, location, currentSubscription } = props;
    const { source, railPosition, conPosition: contentPosition, sectionSource, sectionType, configType } = location.state || {};
    let mixpanelData = getAnalyticsData(MIXPANEL, false, props, state);
    let partnerPlayable = isUserloggedIn() && await checkPartnerPlayable(meta?.partnerId, meta?.provider);
    let contentType = FORMATTED_CONTENT_TYPE[params?.contentType];
    let isFreeContent = isFreeContentMixpanel(meta);
    let { updatedContentType } = getParentContentData(props.meta);

    let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || [];

    const contentAuth = (isFreeContentEvent(detail.contractName, partnerInfo, meta.partnerId, currentSubscription?.subscriptionStatus) ||
        (meta?.partnerSubscriptionType?.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()))

    mixpanelData[`${MIXPANEL.PARAMETER.RAIL_TYPE}`] = configType || "";
    mixpanelData[`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`] = getAnalyticsRailCategoryRegular(sectionType, MIXPANEL);
    mixpanelData[`${MIXPANEL.PARAMETER.SUBSCRIBED}`] = partnerPlayable ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO;
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE}`] = getContentLanguage(meta?.audio) || "";
    mixpanelData[`${MIXPANEL.PARAMETER.FREE_CONTENT}`] = isFreeContent;
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_RATING}`] = meta?.rating;
    mixpanelData[`${MIXPANEL.PARAMETER.RAIL}`] = state.mixpanelData.railTitle || '';
    mixpanelData[`${MIXPANEL.PARAMETER.RAIL_POSITION}`] = railPosition;
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_GENRE_PRIMARY}`] = meta?.genre?.[0] || meta?.genres?.[0] || "";
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE_PRIMARY}`] = getPrimaryLanguage(meta?.audio) || "";
    mixpanelData[`${MIXPANEL.PARAMETER.RELEASE_YEAR}`] = meta?.releaseYear || "";
    mixpanelData[`${MIXPANEL.PARAMETER.DEVICE_TYPE}`] = MIXPANEL.VALUE.WEB;
    mixpanelData[`${MIXPANEL.PARAMETER.ACTOR}`] = meta?.actor.join() || '';
    mixpanelData[`${MIXPANEL.PARAMETER.PACK_NAME}`] = currentSubscription?.productName;
    mixpanelData[`${MIXPANEL.PARAMETER.PACK_PRICE}`] = currentSubscription?.amountValue;
    mixpanelData[`${MIXPANEL.PARAMETER.SOURCE}`] = source;
    mixpanelData[`${MIXPANEL.PARAMETER.RAIL_TYPE}`] = sectionSource;
    mixpanelData[`${MIXPANEL.PARAMETER.RAIL_CATEGORY}`] = getAnalyticsRailCategory(sectionType, MIXPANEL);
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_AUTH}`] =contentAuth ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO;
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_CATEGORY}`] = updatedContentType;
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_POSITION}`] = contentPosition;
    mixpanelData[`${MIXPANEL.PARAMETER.CONTENT_PARENT_TITLE}`] = getTitleAndDesc(meta, contentType);
    mixpanelData[`${MIXPANEL.PARAMETER.LIVE_CONTENT}`] = MIXPANEL.VALUE.NO;
    mixpanelData[`${MIXPANEL.PARAMETER.PAGE_NAME}`] = getAnalyticsSource(props.location.pathname);
    mixpanelData[`${MIXPANEL.PARAMETER.PACK_TYPE}`] = currentSubscription?.productName;


    mixPanelConfig.trackEvent(MIXPANEL.EVENT.PLAY_TRAILER, mixpanelData);
}

export const getCircularLogo = (meta) => {
    let imageUrl = '';
    let providerLogo = getProviderLogo();
    imageUrl = meta ? providerImage(meta?.provider, LAYOUT_TYPE.CIRCULAR) : imageUrl;

    /*if (meta && providerLogo && Object.entries(providerLogo).length !== 0) {
        let circularLogo = {
            width: 40,
            height: 40,
        };
        if(isMobile.any()) {
            circularLogo = {
                width: 45,
                height: 45,
            };
        }
        let url = this.providerImage(meta.provider, providerLogo);
        imageUrl = url ? `${cloudinaryCarousalUrl('', '', circularLogo.width, circularLogo.height)}${url}` : '';
    }*/

    return imageUrl;
};

 

/**
 * @function getParentContentData - will return id and type of parent of particular contentType
 * @param data - expected meta object from detail API
 * @returns object with {updatedId, updatedContentType}
 */
export const getParentContentData = (data) => {
    let updatedContentType = get(data, "parentContentType"),
        updatedId;

    if ([CONTENTTYPE.TYPE_BRAND, CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL, CONTENTTYPE.TYPE_BRAND_CHILD].includes(updatedContentType)
    ) {
        updatedId = data.brandId;
    } else if (
        [CONTENTTYPE.TYPE_SERIES, CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL, CONTENTTYPE.TYPE_SERIES_CHILD].includes(updatedContentType)
    ) {
        updatedId = data.seriesId;
    } else {
        updatedContentType = get(data, "contentType");
        updatedId = get(data, "vodId");
    }

    return { updatedId, updatedContentType };
};

export const checkForNonIntegratedPartner = (provider, isTrailer = false) => {
    const providerLowerCase = provider.toLowerCase();
    const genericData = JSON.parse(getKey(LOCALSTORAGE.genericProviders));
    const genericProviders = genericData && Object.keys(genericData)
    let isHungamaTrailer = providerLowerCase === PROVIDER_NAME.HUNGAMA && isTrailer;
    let All_INTEGRATED_PARTNER_LIST = [...INTEGRATED_PARTNER_LIST,...genericProviders || []]
    if (All_INTEGRATED_PARTNER_LIST.includes(providerLowerCase) || isHungamaTrailer) {
        return true;
    }
    else {
        store.dispatch(
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal',
                instructions: 'Partner playback integration is pending',
                primaryButtonText: 'Ok',
                closeModal: true,
                hideCloseIcon: true,
            })
        );
        return false;
    }
};

export const fireProductLandingCtasEvent = (data, buttonName, episodeNumber) => {
    let title = data?.contentType === CONTENTTYPE.TYPE_MOVIES ? data?.vodTitle : (data?.brandTitle || data?.seriesTitle || data?.vodTitle || data?.title)
    dataLayerConfig.trackEvent(DATALAYER.EVENT.PRODUCT_LANDING_CTAS, {
        [DATALAYER.PARAMETER.CONTENT_TITLE]: title,
        [DATALAYER.PARAMETER.CONTENT_TYPE]: data?.contentType,
        [DATALAYER.PARAMETER.BUTTON_NAME]: buttonName,
        [DATALAYER.PARAMETER.EPISODE_NUMBER]: episodeNumber,
        [DATALAYER.PARAMETER.MORE_BUTTON_NAME]: buttonName,
    })
}

export const isLivePlayable = (channelId) => {
    const storeState = store.getState();
    const currentSubscription = get(storeState.subscriptionDetails, 'currentSubscription.data');

    return !isEmpty(currentSubscription) && currentSubscription?.liveChannelIds && currentSubscription?.liveChannelIds.includes(channelId)
}