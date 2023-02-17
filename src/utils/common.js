import React from "react";
import confetti from "canvas-confetti";

import {
    accountDropDown,
    clearStore,
    fetchAnonymousId,
    notificationDropDown,
    recentSearch,
    refreshAccount,
    refreshAccountOldStack,
    setSearch,
    switchAccountDropDown,
} from "@components/Header/APIs/actions";
import { updateSearchData, vootTokenapi } from "@containers/Search/APIs/actions";
import { URL } from "@constants/routeConstants";
import { MODALS } from "@common/Modal/constants";
import {
    COMMON_ERROR,
    COMMON_HEADINGS,
    CONTENTTYPE,
    CONTRACT,
    DIRECTIONS,
    DTH_BINGE_POPUP,
    DTH_TYPE,
    MESSAGE,
    MINI_SUBSCRIPTION,
    MOBILE_BREAKPOINT,
    PACK_NAME,
    PACK_TYPE,
    PARAMS_TYPE,
    PARTNER_SUBSCRIPTION_TYPE,
    PLAY_STORE_URL,
    RAIL_TITLE,
    RENTAL_STATUS,
    SECTION_SOURCE,
    SECTION_TYPE,
    SUBSCRIPTION_TYPE,
    TA_MAX_CONTENT,
    TAB_BREAKPOINT,
    WEB_SMALL_PAYMENT_SOURCE,
    SUBSCRIPTION_TYPE_HEADER,
    REGEX,
    LEARN_ACTION_TYPE,
    CATEGORY_NAME,
} from "@constants";
import ENV_CONFIG from "@config/environment/index";
import { getSystemDetails } from "@utils/browserEnvironment";
import { BROWSER_TYPE, OS } from "@constants/browser";

import md5 from "md5";
import { BOTTOM_SHEET, HEADER_CONSTANTS, LAYOUT_TYPE, LOCALSTORAGE, PLAY_ACTION, USELESS_WORDS } from "@utils/constants";

import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import get from "lodash/get";
import { clearKey, deleteKey, getKey, setKey } from "@utils/storage";
import moengageConfig from "@utils/moengage";
import store from "../store";

import isEmpty from "lodash/isEmpty";
import { dunningRecharge, getBalanceInfo, quickRechargeBeforeLogin } from "@containers/PackSelection/APIs/action";
import {
  getCurrentSubscriptionInfo,
  openMiniSubscription,
  getWebPortalLink,
  checkFallbackFlow,
} from "@containers/Subscription/APIs/action";
import { ACCOUNT_STATUS } from "@containers/BingeLogin/APIs/constants";
import { closePopup, openPopup } from "@common/Modal/action";
import { SUBSCRIPTION } from "@containers/PIDetail/API/constant";
import { fetchMixpanelId, hideMainLoader, loggedIn, showMainLoader, showMainLoaderImmediate } from "@src/action";
import { redirectToHomeScreen } from "@containers/BingeLogin/bingeLoginCommon";
import { ERROR_MESSAGES, PROVIDER_NAME, INTEGRATED_PARTNER_LIST } from "@constants/playerConstant";
import { removePubNubListener } from "@utils/pubnub";
import { logOut } from "@containers/BingeLogin/APIs/action";
import { setPlayerAPIError, viewCountLearnAction } from "@containers/PlayerWeb/APIs/actions";
import { CURRENT_SUBSCRIPTION } from "@containers/MySubscription/constant";
import mixpanel from "mixpanel-browser";
import { getProfileDetails, switchToAtvAccount } from "@containers/Profile/APIs/action";
import { toast } from "react-toastify";
import bingeMobileAsset from "@assets/images/binge-mobile-asset.png";
import bingeAsset from "@assets/images/binge-asset.svg";
import { postSwitchAccountReq } from "@containers/SwitchAccount/API/action";
import { getDeviceStatus, handleDeviceCancelledUser, setDeviceStatus } from "@utils/cancellationFlowCommon";
import SelectLanguage from "@containers/Languages/SelectLanguage";
import { fetchUserSelectedData, openMobilePopup } from "@containers/Languages/APIs/actions";
import Movie from "@containers/Movie";
import Login from "@containers/Login";
import { SUBSCRIPTION_STATUS, JOURNEY_SOURCE } from "@containers/Subscription/APIs/constant";
import { checkPlaybackEligibility, fetchRedemptionUrl } from "@containers/PIDetail/API/actions";
import { checkCurrentSubscription, getComponentList, checkPartnerSubscriptionType, renewSusbcription } from "@containers/Subscription/APIs/subscriptionCommon";
import { getSubscriberDeviceList } from "@containers/DeviceManagement/APIs/action";
import { getClientIP, subscriberListing, onManualLogin } from "@containers/Login/APIs/actions";
import { history } from "@utils/history";
import { OPEL_STATUS } from "@containers/SubscriptionPayment/APIs/constants";
import { setPaymentStatusFromPubnub } from "@containers/SubscriptionPayment/APIs/action";
import { BROWSE_TYPE } from '@containers/BrowseByDetail/APIs/constants';
import { fetchTARecommendedFilterOrder, fetchTARecommendedSearchData } from '@containers/BrowseByDetail/APIs/action';
import firebase from "./constants/firebase";
import trackEvent from "./trackEvent";
import appsFlyerConfig from "./appsFlyer";
import APPSFLYER, { APPSFLYER_CONTENT_PLAY_EVENTS } from "./constants/appsFlyer";
import PlanSelection from "@containers/Subscription/PlanSelection";
import ChangeTenureModal from '@containers/Subscription/ChangeTenureModal';
import SelectionDrawer from '@containers/Subscription/SelectionDrawer';
import { isOldBingeUser, updateUser, onLoginSuccess } from "@containers/Login/LoginCommon";
import dataLayerConfig from "./dataLayer";
import DATALAYER from "./constants/dataLayer";
import { SIDE_MENU_HEADERS } from "@components/Header/APIs/constants";
import FIREBASE from "./constants/firebase";
import { DRP_STATE } from "@containers/Home/APIs/constants";
import { getTitleAndDesc } from "@containers/PIDetail/PIDetailCommon";
import { managedAppPushChanges } from "@components/Header/APIs/actions";
import {TSAnalyticsMitigtionSDK} from "tatasky-analytics-mitigation";
import CrownImage from '@assets/images/crown-icon.svg';

export const isUserUnSubscribed = (currentSubscription) => {
    return !!(isEmpty(currentSubscription) || (currentSubscription?.subscriptionStatus?.toUpperCase() === ACCOUNT_STATUS.DEACTIVE && currentSubscription?.freeTrialStatus));
}

export const showConfetti = (
    duration = 1000,
    delay = 0.25 * 1000,
    zIndex = 1301,
) => {
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: [
                    "#A0752B",
                    "#FDD551",
                    "#FFFFBF",
                    "#FDD551",
                    "#A0752B",
                    "#FDD551",
                    "#FDD551",
                ],
            }),
        );
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: [
                    "#A0752B",
                    "#FDD551",
                    "#FFFFBF",
                    "#FDD551",
                    "#A0752B",
                    "#FDD551",
                    "#FDD551",
                ],
            }),
        );
    }, delay);
};
export const formatAMPM = (date, amPmRequire = true) => {
    if (date) {
        date = new Date(date);
        let hours = date.getHours(),
            minutes = date.getMinutes(),
            ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = amPmRequire ? hours + ':' + minutes + ' ' + ampm : hours + ':' + minutes;
        return strTime;
    }
}
export const removeClass = (element, ...classNames) => {
    classNames.forEach((className) => {
        element && element.classList !== undefined
            ? element.classList.contains(className) &&
            element.classList.remove(className)
            : console.log("Element not Found! Cannot remove " + className + " class");
    });
};

export const addClass = (element, ...classNames) => {
    classNames.forEach((className) => {
        element
            ? !element.classList.contains(className) &&
            element.classList.add(className)
            : console.log("Element not Found! Cannot add " + className + " class");
    });
};
export const checkLivePlaybackEligibility = async(openPopup, closePopup, openLoginPopup, meta) => {
    if(isUserloggedIn()) {
        return true;
    } else {
        await showLoginScreen(openPopup, closePopup, openLoginPopup, meta, MINI_SUBSCRIPTION.LOGIN); 
        return false;
    }
}
export const setLALogic = async (id) => {
    let laFlag = false;
        let laData = JSON.parse(getKey(LOCALSTORAGE.LA_FIRED_DATE)) || [];
        let data = laData && laData.find && laData.find(i => i.contentId === id);

        if (data) {
            let contentWatchedTime = new Date(data.time);
            let today = new Date();
            if (compareDate(contentWatchedTime, today)) {
                laFlag = true;
                data.time = new Date();
                let index = laData.findIndex(i => i.contentId === id);
                laData[index] = data;
            }
        } else {
            laData.push({
                contentId: id,
                time: new Date(),
            });
            laFlag = true;
        }
        setKey(LOCALSTORAGE.LA_FIRED_DATE, laData);
        return laFlag;
}
export const capitalizeFirstLetter = (string) => {
    if (string && isNaN(string)) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    } else {
        return string;
    }
};

export const formDataGenerator = (data) => {
    let formDataValue = new FormData();
    let keys = Object.keys(data);
    keys.map((key) => {
        formDataValue.append(key, data[key]);
    });

    return formDataValue;
};

// export const encryptText = (text) => {
//     if(typeof window !== "undefined") {
//         let { JSEncrypt } = require('jsencrypt');
//         const encrypt = new JSEncrypt();
//         encrypt.setPublicKey(RSA_PUBLIC_KEY);
//         return encrypt.encrypt(text)
//     }
//     return text;
// };

export const getDeviceId = () => {
    if (!getKey(LOCALSTORAGE.DEVICE_ID)) {
        let deviceId = new Date().getTime();
        setKey(LOCALSTORAGE.DEVICE_ID, deviceId);
        return deviceId;
    } else {
        return getKey(LOCALSTORAGE.DEVICE_ID);
    }
};

export const getAnonymousId = async (isLoader = true) => {
    if (!getKey(LOCALSTORAGE.ANONYMOUS_ID)) {
        await store.dispatch(fetchAnonymousId(isLoader));
        const { headerDetails } = store.getState();
        let anonymousId = get(headerDetails, "anonymousUserData.anonymousId");
        setKey(LOCALSTORAGE.ANONYMOUS_ID, anonymousId);
        setKey(LOCALSTORAGE.G_AUTH_TOKEN, get(headerDetails, "anonymousUserData.gAuthToken"));
    } else {
        return getKey(LOCALSTORAGE.ANONYMOUS_ID);
    }
};

export const moviePopup = (width, props) => {

    if (width > MOBILE_BREAKPOINT) {
        store.dispatch(
            openPopup(MODALS.CUSTOM_MODAL, {
                modalClass: "alert-modal language-selection-container gradiant-bg movie-container",
                childComponent: <Movie {...props} />,
                closeModal: true,
                hideCloseIcon: true,
                movieSeries: true,
            }),
        );
    } else if (width <= MOBILE_BREAKPOINT) {
        store.dispatch(closePopup());
        store.dispatch(openMobilePopup());
    }
};

export const showLanguageOnboardingPopup = (width) => {
    let data = getVerbiages(CATEGORY_NAME.LANGUAGE_DRAWER);
    if (width > MOBILE_BREAKPOINT) {
        store.dispatch(
            openPopup(MODALS.CUSTOM_MODAL, {
                modalClass: "alert-modal language-selection-container ",
                heading: data?.header || 'Select Content Languages',
                childComponent: <SelectLanguage />,
                closeModal: true,
                hideCloseIcon: true,
            }),
        );
    } else if (width <= MOBILE_BREAKPOINT) {
        store.dispatch(closePopup());
        store.dispatch(openMobilePopup());
    }
};

export const getLayeredIcon = (iconName) => {
    iconName = iconName.split(" ")[0];

    switch (iconName) {
        case "icon-info":
            return (
                <i className="icon-info">
                    <span className="path1" />
                    <span className="path2" />
                </i>
            );
        case "icon-circle-copy":
            return <i className="icon-circle-copy" />;
        case "icon-play":
            return <span className="triangle-right" />;
        case "icon-download":
            return (
                <span className="icon-download">
                    <i className="path1" />
                    <i className="path2" />
                </span>
            );
        case "icon-delete":
            return (
                <span className="icon-delete">
                    <i className="path1" />
                    <i className="path2" />
                </span>
            );
        case "icon-camera":
            return (
                <span className="icon-camera">
                    <span className="path1" />
                    <span className="path2" />
                </span>
            );
        case "icon-play-icon":
            return (
                <span className="icon-play-icon">
                    <span className="path1" />
                    <span className="path2" />
                </span>
            );
        case "icon-replay":
            return (
                <span className="icon-replay">
                    <i className="path1" />
                    <i className="path2" />
                </span>
            );
        case "icon-notification_settings":
            return (
                <span className="icon-notification_settings">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                    <span className="path4" />
                </span>
            );
        case "icon-Notification-Bell-upd":
            return (
                <span className="icon-Notification-Bell-upd">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                </span>
            );
        case "icon-arrow-see-all":
            return (
                <span className="icon-arrow-see-all">
                    <span className="path1" />
                    <span className="path2" />
                </span>
            );
        case "icon-upgrade":
            return <i className="icon-upgrade" />;
        case "icon-my-subscription-1":
            return <i className="icon-my-subscription-1" />;
        case "icon-alert-upd":
            return <i className="icon-alert-upd" />;
        case "icon-radio_active":
            return (
                <span className="icon-radio_active">
                    <span className="path1" />
                    <span className="path2" />
                </span>
            );
        case "icon-remove-phon":
            return <i className="icon-remove-phon" />;
        default:
            return <i className={iconName} />;
    }
};

export const goToHome = (history, type) => {
    safeNavigation(history, { pathname: `/${URL.HOME}`, state: { type: type } });
};

export const getIconSuccessTick = () => {
    return (
        <span className="get-icon-success-tick">
            <i className={"icon-check"} />
        </span>
    );
};

export const getIconSuccessTickUpd = () => {
    return (
        <i className={"icon-success-upd"} />
    );
};

export const featureUnderDevelopment = (openPopup) => {
    openPopup(MODALS.ALERT_MODAL, {
        modalClass: "alert-modal ",
        headingMessage: COMMON_HEADINGS.FEATURE_UNDER_DEVELOPMENT,
        primaryButtonText: "Ok",
        closeModal: true,
        hideCloseIcon: true,
    });
};

export const getSmartUrl = (deepLinkUrl) => {
    let accessToken = ENV_CONFIG.SMART_URL_CONFIG.ACCESS_KEY,
        params = `${deepLinkUrl}?service_id=${ENV_CONFIG.SMART_URL_CONFIG.SHEMAROOME_SERVICE_ID}&play_url=yes&protocol=hls&us=`;
    let encryptedToken = md5(`${accessToken}${params}`);
    return `${deepLinkUrl}?service_id=${ENV_CONFIG.SMART_URL_CONFIG.SHEMAROOME_SERVICE_ID}&play_url=yes&protocol=hls&us=${encryptedToken}`;
};

export const getBaseUrl = () => {
    return ENV_CONFIG.API_BASE_URL;
};

export const getEnvironmentConstants = () => {
    return ENV_CONFIG;
};

export const convertNumToString = (number) => {
    const numArr = [
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
    ];
    return numArr[number];
};

export const contentType = (contentType) => {
    if (
        contentType === CONTENTTYPE.TYPE_BRAND_CHILD ||
        contentType === CONTENTTYPE.TYPE_SERIES_CHILD ||
        contentType === CONTENTTYPE.TYPE_MOVIES ||
        contentType === CONTENTTYPE.TYPE_WEB_SHORTS ||
        contentType === CONTENTTYPE.TYPE_TV_SHOWS ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_MOVIES_DETAIL ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_WEB_SHORTS_DETAIL
    ) {
        return "vod";
    } else if (
        contentType === CONTENTTYPE.TYPE_BRAND ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL
    ) {
        return "brand";
    } else if (
        contentType === CONTENTTYPE.TYPE_SERIES ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL
    ) {
        return "series";
    } else if (
        contentType === CONTENTTYPE.TYPE_CATCH_UP ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_CATCH_UP_DETAIL
    ) {
        return "catchupEpg";
    }
};

export const cloudinaryCarousalUrl = (
    zoomed = false,
    view = "",
    width = 0,
    height = 0,
    isMobileView = false,
    renderWithoutDimension = false,
) => {
    const { headerDetails } = store.getState();
    let configResponse = get(headerDetails, "configResponse");
    let url = get(configResponse, "data.config.url.image.cloudAccountUrl");

    if (location.href.includes(URL.SEE_ALL)) {
        if (view === LAYOUT_TYPE.CIRCULAR) {
            if (isMobileView) {
                width = 128;
                height = 128;
            } else {
                width = 430;
                height = 430;
            }
        } else if (view === LAYOUT_TYPE.LANDSCAPE) {
            if (isMobileView) {
                width = 312;
                height = 178;
            } else {
                width = 428;
                height = 248;
            }
        } else if (view === LAYOUT_TYPE.PORTRAIT) {
            if (isMobileView) {
                width = 201;
                height = 306;
            } else {
                width = 400;
                height = 532;
            }
        }
    } else if (view === LAYOUT_TYPE.CIRCULAR) {
        if (isMobileView) {
            width = 128;
            height = 128;
        } else {
            if (zoomed) {
                width = 222;
                height = 222;
            } else {
                width = 180;
                height = 180;
            }
        }
    } else if (view === LAYOUT_TYPE.LANDSCAPE) {
        if (isMobileView) {
            width = 280;
            height = 160;
        } else {
            if (zoomed) {
                width = 552;
                height = 350;
            } else {
                width = 428;
                height = 248;
            }
        }
    } else if (view === LAYOUT_TYPE.PORTRAIT) {
        if (isMobileView) {
            width = 186;
            height = 280;
        } else {
            if (zoomed) {
                width = 500;
                height = 600;
            } else {
                width = 400;
                height = 532;
            }
        }
    } else if (view === LAYOUT_TYPE.TOP_PORTRAIT) {
        if (isMobileView) {
            width = 306;
            height = 460;
        } else {
            if (zoomed) {
                width = 700;
                height = 904;
            } else {
                width = 620;
                height = 824;
            }
        }
    }
    url += "f_auto,fl_lossy,q_auto";
    return renderWithoutDimension ? url + '/' :url + ",w_" + width + ",h_" + height + "/";
};

export const isUserloggedIn = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    return !!(userInfo.accessToken && userInfo.loggedIn);
};

export const resetSearchData = () => {
    store.dispatch(setSearch(false));
    store.dispatch(updateSearchData());
};

export const dropDownDismissalCases = (closeCondition) => {
    const { headerDetails, modal } = store.getState();
    let searchStatus = get(headerDetails, "search");
    let accountDropDownStatus = get(headerDetails, "accountDropDown");
    let notificationDropDownStatus = get(headerDetails, "notificationDropDown");
    let switchAccountDropDownStatus = get(headerDetails, "switchAccountDropDown");
    let recentSearchStatus = get(headerDetails, "recentSearch");
    let showModal = get(modal, "showModal");
    if (searchStatus) {
        !location.href.includes(URL.SEARCH) && store.dispatch(setSearch(false));
    }
    if (accountDropDownStatus) {
        store.dispatch(accountDropDown(false));
    }
    if (notificationDropDownStatus) {
        store.dispatch(notificationDropDown(false));
    }
    if (switchAccountDropDownStatus) {
        store.dispatch(switchAccountDropDown(false));
    }
    if (recentSearchStatus) {
        !location.href.includes(URL.SEARCH) && store.dispatch(recentSearch(false));
    }
    if (showModal && !closeCondition) {
        store.dispatch(closePopup());
    }
};

export const secondsToHms = (d) => {
    if (!d) {
        return "00:00";
    }
    const t = Number(d);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor((t % 3600) % 60);

    const hDisplay = h < 10 ? `0${h}` : h;
    const mDisplay = m < 10 ? `0${m}` : m;
    const sDisplay = s < 10 ? `0${s}` : s;
    if (h === 0) {
        return `${mDisplay}:${sDisplay}`;
    }
    return `${hDisplay}:${mDisplay}:${sDisplay}`;
};

export const time_convert = (d, secondAppend = true) => {
    const t = Number(d);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor((t % 3600) % 60);

    const hDisplay = h < 10 ? `0${h}` : h;
    const mDisplay = m < 10 ? `0${m}` : m;
    const sDisplay = s < 10 ? `0${s}` : s;
    if (h === 0) {
        if (secondAppend) {
            if (m === 0) {
                return `${sDisplay}s`;
            }
            return `${mDisplay}m ${sDisplay}s`;
        }
        return `${mDisplay}m`;
    }

    if (secondAppend) {
        return `${hDisplay}h ${mDisplay}m ${sDisplay}s`;
    } else {
        return `${hDisplay}h ${mDisplay}m`;
    }
};

export const getSeeAllUrl = (recommended, contentType, id, railItem) => {
    let url;
    if (recommended) {
        url = `/${URL.RECOMMENDED_SEE_ALL}/${contentType}/${id}`;
    }
    else if (railItem.sectionSource === SECTION_SOURCE.CONTINUE_WATCHING) {
        url = `/${URL.CONTINUE_WATCHING_SEE_ALL}/${railItem.id}`;
    }
    else if (railItem.sectionSource === SECTION_SOURCE.WATCHLIST) {
        url = `/${URL.WATCHLIST_SEE_ALL}/${railItem.id}`;
    }
    else if (railItem.sectionSource === SECTION_SOURCE.TVOD) {
        url = `/${URL.TVOD}`;
    } else if (railItem.sectionSource === SECTION_SOURCE.RECOMMENDATION) {
        url = `/${URL.TA_SEE_ALL}/${railItem.id}`;
    } else {
        url = `/${URL.SEE_ALL}/${railItem.id}`;
    }
    return url;
};

export const openResponseModal = (openPopup, message) => {
    openPopup(MODALS.ALERT_MODAL, {
        modalClass: "alert-modal",
        instructions: message,
        primaryButtonText: "Ok",
        closeModal: true,
        hideCloseIcon: true,
    });
};

export const getPlayAction = (totalDuration, watchedDuration) => {
    let { PIDetails } = store.getState();
    let lastWatch = get(PIDetails, "continueWatchingDetails.data");
    let meta = get(PIDetails, "data.meta");
    if (lastWatch) {
        if (watchedDuration === 0) {
            if (meta?.parentContentType === CONTENTTYPE.TYPE_BRAND || meta?.parentContentType === CONTENTTYPE.TYPE_SERIES) {
                return `${PLAY_ACTION.PLAY} ${lastWatch.season !== 0 ? `S${lastWatch.season}` : `${meta.season ? `S${meta.season}` : ""}`
                    } ${lastWatch.episodeId !== 0 ? `E${lastWatch.episodeId}` : `${meta.episodeId ? `E${meta.episodeId}` : ""}`}`;
            } else {
                return isMobile.any() ? PLAY_ACTION.PLAY_MOBILE : PLAY_ACTION.PLAY;
            }
        } else if (watchedDuration > 0) {
            if ((watchedDuration / totalDuration) * 100 >= 99) {
                if (meta?.parentContentType === CONTENTTYPE.TYPE_BRAND || meta?.parentContentType === CONTENTTYPE.TYPE_SERIES) {
                    return `${PLAY_ACTION.REPLAY} ${lastWatch.season ? `S${lastWatch.season}` : ""
                        } ${lastWatch.episodeId ? `E${lastWatch.episodeId}` : ""}`;
                } else {
                    return PLAY_ACTION.REPLAY;
                }
            } else {
                if (meta?.parentContentType === CONTENTTYPE.TYPE_BRAND || meta?.parentContentType === CONTENTTYPE.TYPE_SERIES) {
                    return `${PLAY_ACTION.RESUME} ${lastWatch.season ? `S${lastWatch.season}` : ""
                        } ${lastWatch.episodeId ? `E${lastWatch.episodeId}` : ""}`;
                } else {
                    return PLAY_ACTION.RESUME;
                }
            }
        } else {
            return isMobile.any() ? PLAY_ACTION.PLAY_MOBILE : PLAY_ACTION.PLAY;
        }
    } else {
        return isMobile.any() ? `${PLAY_ACTION.PLAY_MOBILE} ${meta.season ? `S${meta.season}` : ""} ${meta.episodeId ? `E${meta.episodeId}` : ""}`
            : `${PLAY_ACTION.PLAY} ${meta.season ? `S${meta.season}` : ""} ${meta.episodeId ? `E${meta.episodeId}` : ""}`
    }
};

export const updateUserInfo = async (response, params, cb) => {
    // cb added to handle a flow during cancellation flow, to avoid wrong data passing in APIs like baId
    let callBackFunc = cb || function () {
    };
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let deviceList = response?.data?.deviceDTOList?.slice(0, 4);
    // let packDetails = response.data.partnerSubscriptionsDetails;
    // let packCreatedDate = packDetails ? packDetails.packCreatedDate : null;
    // let userInfo = {
    //     firstName: response.data.firstName,
    //     lastName: response.data.lastName,
    //     baId: response.data.baId,
    //     profileId: response.data.defaultProfile,
    //     bingeAccountStatus:
    //     response?.data?.subscriptionInformationDTO?.bingeAccountStatus,
    //     freeTrialAvailed: response.data.freeTrialAvailed,
    //     accessToken: response.data.userAuthenticateToken,
    //     deviceToken: response.data.deviceAuthenticateToken,
    //     alternatePackId: packDetails && packDetails.alternatePackId,
    //     packId: packDetails && packDetails.packId,
    //     expirationDate: packDetails && packDetails.expirationDate,
    //     sId: response.data.subscriberId,
    //     loggedIn: true,
    //     firstTimeLogin: response.data.firstTimeLogin,
    //     firstTimeLoginDate: response.data.firstTimeLoginDate,
    //     bingeAccountCount: parseInt(response.data.bingeAccountCount),
    //     dateOfSubscription: packCreatedDate,
    //     deviceLoginCount: parseInt(response.data.deviceLoginCount),
    //     dthStatus: response?.data?.subscriberAccountStatus,
    //     accountSubStatus: response.data.accountSubStatus,
    //     sufficientBalance: response.data.sufficientBalance
    //         ? response.data.sufficientBalance
    //         : true,
    //     subscriptionType:
    //     response?.data?.subscriptionInformationDTO?.subscriptionType,
    //     deviceSerialNumber: response.data.deviceSerialNumber,
    //     packCreationDate:
    //     response.data?.partnerSubscriptionsDetails?.packCreationDate,
    //     loginWith: "RMN" ,
    //     rmn: response.data.rmn,
    //     emailId: response.data.emailId,
    //     subscriptionInformationDTO: response?.data?.subscriptionInformationDTO,
    //     packPrice: packDetails && packDetails.packPrice,
    //     packName: packDetails && packDetails.packName,
    //     planType: response.data?.subscriptionInformationDTO?.planType,
    //     rechargeDue: packDetails && packDetails.rechargeDue,
    //     dummyUser: response.data?.partnerSubscriptionsDetails?.dummyUser,

    //     //Added new login key to ensure that dth/binge popup is shown on login screen
    //     showLoginScreen: true,
    // };
    if (params.type === PARAMS_TYPE.LOGIN) {
        userInfo = {
            ...userInfo,
            sId: response.data.subscriberId,
            bingeSubscriberId: response.data.bingeSubscriberId, // It is subscriber id of non dth user which is coming from conviva backend
            baId: response.data.baId,
            profileId: response.data.profileId,
            parentalPinExist: response.data.parentalPinExist,
            accessToken: response.data.userAuthenticateToken,
            deviceToken: response.data.deviceAuthenticateToken,
            subscriptionStatus: response.data.subscriptionStatus,
            rmn: params.rmn,
            dthStatus: response.data.dthStatus,
            fsTaken: response.data.fsTaken,
            loggedIn: true,
            showLoginScreen: true,
            freeTrialAvailed: response.data.freeTrialAvailed,
            loginFreeTrialAvailed: response.data.loginFreeTrialAvailed,
            helpCenterSilentLogin: params?.helpCenterSilentLogin,
            subscriptionType: response?.data?.subscriptionType,
            freemiumUser: response?.data?.subscriptionType.toUpperCase() === SUBSCRIPTION_TYPE.FREEMIUM,
            firstTimeLoginDate: response.data.firstTimeLoginDate,
            mixpanelId: response?.data?.mixpanelid,
            packCreationDate: response?.data?.firstPaidPackSubscriptionDate,
            lastPackType: response?.data?.lastPackType,
            lastPackName: response?.data?.lastPackName,
            lastPackPrice: response?.data?.lastPackPrice,
            packStartDate: response?.data?.packStartDate,
            totalPaidPackRenewal: response?.data?.totalPaidPackRenewal,
            lastBillingType: response?.data?.lastBillingType,
            referenceId: response?.data?.referenceId,
            subscriptionStatusInfo: response?.data?.subscriptionStatusInfo,
            firstPaidPackSubscriptionDate: response?.data?.firstPaidPackSubscriptionDate,
            deviceSerialNumber: response.data.deviceSerialNumber,
            deviceList: deviceList,
        };
    }
    if (params.type === PARAMS_TYPE.USER_DETAILS) {
        userInfo = {
            ...userInfo,
            email: response?.data?.email,
            firstName: response?.data?.firstName,
            lastName: response?.data?.lastName,
            rmn: response?.data?.rmn,
            languageList: response?.data?.languageList,
            autoPlayTrailer: response?.data?.autoPlayTrailer,
            aliasName: response?.data?.aliasName,
            profileImage: response?.data?.profileImage,
            transactionalNotification: response?.data?.transactionalNotification,
            watchNotification: response?.data?.watchNotification,
        };
    }
    if (params.type === PARAMS_TYPE.SUBSCRIPTON_DETAILS) {
        userInfo = {
            ...userInfo,
            subscriptionStatus: get(response, 'data.subscriptionStatus', userInfo?.subscriptionStatus),
            subscriptionType: get(response, 'data.subscriptionType', userInfo?.subscriptionType),
            freemiumUser: response?.data?.subscriptionType ? response?.data?.subscriptionType === SUBSCRIPTION_TYPE.FREEMIUM : userInfo?.freemiumUser
        };
    }
    setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(userInfo));
    params?.type === PARAMS_TYPE.LOGIN && await initializeQoeSdk();
    callBackFunc();
};

export const initializeQoeSdk = async () => {
    let sdk = new TSAnalyticsMitigtionSDK()
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let appProperties = {
        ApplicationName: "bitmovin_based_react_app",
        PlayerName: "bitmovin player",
        UEID: userInfo.rmn,
        SubscriberID: userInfo.sId,
    };
    await sdk.registerApplication(appProperties);
}

export const getParamsAPICall = () => {
    const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    const authorization = user_info && user_info.accessToken;
    const { baId, sId, dthStatus } = user_info ? user_info : {};
    return { authorization, baId, sId, dthStatus };
};

export const getCommonHeaders = (accessToken, subscriberId) => {
    const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    const authorization = user_info && user_info.accessToken;
    const { baId, sId, dthStatus } = user_info ? user_info : {};
    return {
        authorization: accessToken ? accessToken : authorization,
        subscriberId: subscriberId ? subscriberId : sId,
        // baId: baIdExist ? baIdExist : baId,
        dthStatus
    }
}
export const getHomeUrlHeader = (homeData) => { //DRP API headers respect to conditions
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO))
    let anonymousId = getKey(LOCALSTORAGE.ANONYMOUS_ID);
    let packName = getPackName();
    if (homeData.drpState === DRP_STATE.TA) {
        return {
            Authorization: `bearer ${userInfo.accessToken}`,
            subscriberId: userInfo.sId,
            profileId: userInfo.profileId,
            platform: HEADER_CONSTANTS.BINGE_ANYWHERE_WEB,
            dthStatus: userInfo.dthStatus,
            baId: userInfo.baId,
            packName
        }
    }
    else if (homeData.drpState === DRP_STATE.TA_GUEST) {
        return {
            anonymousid: anonymousId,
            subscriberId: anonymousId,
            profileId: anonymousId,
            platform: HEADER_CONSTANTS.BINGE_ANYWHERE_WEB,
            dthStatus: "Guest",
            packName
        }
    }
    else {
        return {
            platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
        }
    }
}

export const updatePackDetailStorage = async (
    data,
    updatePeopleProperty = false,
    checkSubscriptionChange = false,
) => {
    const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    if (data.packId) user_info["packId"] = data.packId;
    if (data.alternatePackId) user_info["alternatePackId"] = data.alternatePackId;
    if (data.expirationDate) user_info["expirationDate"] = data.expirationDate;
    if (data?.subscriptionInformationDTO?.bingeAccountStatus)
        user_info["bingeAccountStatus"] =
            data?.subscriptionInformationDTO?.bingeAccountStatus;
    if (data?.subscriptionInformationDTO?.subscriptionType)
        user_info["subscriptionType"] =
            data?.subscriptionInformationDTO?.subscriptionType;
    if (data.packCreationDate)
        user_info["packCreationDate"] = data.packCreationDate;
    if (data?.subscriptionInformationDTO?.planType)
        user_info["planType"] = data?.subscriptionInformationDTO?.planType;
    if (data?.packName) user_info["packName"] = data?.packName;
    if (data?.packPrice) user_info["packPrice"] = data?.packPrice;

    checkSubscriptionChange && (await checkSubscriptionTypeChanged(data));

    if (data?.subscriptionInformationDTO?.subscriptionType)
        user_info["subscriptionType"] =
            data?.subscriptionInformationDTO?.subscriptionType;
    if (data?.rechargeDue) user_info["rechargeDue"] = data?.rechargeDue;
    if (data?.dummyUser) user_info["dummyUser"] = data.dummyUser;

    setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(user_info));
    data && setDeviceStatus(data?.deviceCancellationFlag);
    if (updatePeopleProperty) {
        mixPanelConfig.subscriptionDetailChanges();
        moengageConfig.subscriptionDetailChanges();
    }
};

export const checkSubscriptionTypeChanged = async (data) => {
    const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    let currentSubscriptionType = user_info["subscriptionType"];
    let updatedSubscriptionType =
        data?.subscriptionInformationDTO?.subscriptionType;
    if (
        !(isEmpty(currentSubscriptionType) || isEmpty(updatedSubscriptionType)) &&
        currentSubscriptionType !== updatedSubscriptionType
    ) {
        await store.dispatch(getProfileDetails());
    }
};

export const getDate = (initialDate) => {
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    let date;
    if (initialDate) {
        let date_components = initialDate.split("/");
        let day = date_components[0];
        let month = date_components[1];
        let year = date_components[2];
        date = new Date(year, month - 1, day);
    }
    date = date ? date : new Date();
    return `${date.getDate()} ${monthNames[date.getMonth()]
        } ${date.getFullYear()}`;
};

export const getAnalyticsRailCategory = (type, analytics = MIXPANEL) => {
    if (type === SECTION_TYPE.RAIL) {
        return analytics.VALUE.REGULAR_RAIL
    }
    return type?.toUpperCase()
}

export const getAnalyticsRailCategoryRegular = (type, analytics = MIXPANEL) => {
    if (type === SECTION_TYPE.RAIL) {
        return analytics.VALUE.REGULAR
    }
    return type
}

export const trackFilterToggle = (analytics = MIXPANEL, freeToggle, browseType, currentSubscription) => {
    let pathname = window.location.pathname;
    let source = getAnalyticsSource(pathname);
    let valueMix = analytics.VALUE
    let data = {
        [`${analytics.PARAMETER.SOURCE}`]: source,
        [`${analytics.PARAMETER.STATE}`]: freeToggle ? valueMix.FREE : valueMix.ALL_CONTENT,
        [`${analytics.PARAMETER.PACK_NAME}`]: currentSubscription?.productName,
        [`${analytics.PARAMETER.PACK_PRICE}`]: currentSubscription?.amountValue,
        [`${analytics.PARAMETER.FILTER_SELECTED}`]: browseType,
    }
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.FILTER_TOGGLE, data);

}

export const getAnalyticsSource = (route, analytics = MIXPANEL) => {
    route = route?.toLowerCase();
    let routeUrl = route?.split("/");
    let routeUpdated = routeUrl?.[1] || routeUrl?.[0];
    let source = "";

    if (
        route === URL.DEFAULT ||
        (routeUpdated &&
            [URL.HOME, URL.DEFAULT, URL.PARTNER].includes(routeUpdated))
    ) {
        source = analytics.VALUE.HOME;
    } else if (routeUpdated === URL.MOVIES) {
        source = analytics.VALUE.MOVIES;
    } else if (routeUpdated === URL.TV_Shows) {
        source = analytics.VALUE.TV_SHOWS;
    } else if (routeUpdated === URL.SPORTS) {
        source = analytics.VALUE.SPORTS;
    } else if (routeUpdated === URL.WATCHLIST) {
        source = analytics.VALUE.WATCHLIST;
    } else if (routeUpdated === URL.DETAIL) {
        source = analytics.VALUE.CONTENT_DETAIL;
    } else if (routeUpdated === URL.SEARCH) {
        source = analytics.VALUE.SEARCH;
    } else if (routeUrl?.includes(URL.PLAYER)) {
        source = analytics.VALUE.PLAYER
    } else if (routeUrl?.includes(URL.DEVICE_MANAGEMENT)) {
        source = analytics.VALUE.DEVICE_MANAGEMENT
    } else if (routeUpdated === URL.EPISODE) {
        source = analytics.VALUE.EPISODE;
    }
    else if (routeUpdated === URL.BROWSE_BY) {
        if (routeUrl[2]?.toUpperCase() === SECTION_SOURCE.LANGUAGE) {
            source = analytics.VALUE.BROWSE_BY_LANGUAGE;
        } else if (routeUrl[2]?.toUpperCase() === SECTION_SOURCE.GENRE) {
            source = analytics.VALUE.BROWSE_BY_GENRE;
        }
    }

    return source;
};

export const getContentDetailSource = (
    route,
    contentType,
    contractName,
    analytics = MIXPANEL,
) => {
    route = route && route.toLowerCase();
    let routeUrl = route && route.split("/");
    let routeUpdated = route && routeUrl[1];
    let source = "";
    if (
        route === URL.DEFAULT ||
        (routeUpdated &&
            [URL.HOME, URL.DEFAULT, URL.PARTNER].includes(routeUpdated))
    ) {
        source = analytics.VALUE.HOME;
    } else if (routeUpdated === URL.MOVIES) {
        source = analytics.VALUE.MOVIES;
    } else if (routeUpdated === URL.TV_Shows) {
        source = analytics.VALUE.TV_SHOWS;
    } else if (routeUpdated === URL.SPORTS) {
        source = analytics.VALUE.SPORTS;
    } else if (routeUpdated === URL.SEARCH) {
        source = analytics.VALUE.SEARCH;
    } else if (routeUpdated === URL.WATCHLIST) {
        source = analytics.VALUE.WATCHLIST;
    } else if (routeUpdated === URL.DETAIL) {
        if (contractName?.toUpperCase() === CONTRACT.RENTAL) {
            source = analytics.VALUE.TVOD;
        } else {
            if (
                [
                    CONTENTTYPE.TYPE_BRAND,
                    CONTENTTYPE.TYPE_BRAND_CHILD,
                    CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL,
                ].includes(contentType?.toUpperCase())
            ) {
                source = analytics.VALUE.BRAND_SEASON;
            } else if (
                [
                    CONTENTTYPE.TYPE_SERIES,
                    CONTENTTYPE.TYPE_SERIES_CHILD,
                    CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL,
                ].includes(contentType?.toUpperCase())
            ) {
                source = analytics.VALUE.SERIES;
            } else {
                source = analytics.VALUE.CONTENT_DETAIL;
            }
        }
    } else if ([URL.SEE_ALL, URL.CONTINUE_WATCHING_SEE_ALL, URL.WATCHLIST_SEE_ALL, URL.RECOMMENDED_SEE_ALL, URL.TVOD, URL.TA_SEE_ALL].includes(routeUpdated)) {
        source = analytics.VALUE.SEE_ALL;
    } else if (routeUpdated === URL.BROWSE_BY) {
        if (routeUrl[2]?.toUpperCase() === SECTION_SOURCE.LANGUAGE) {
            source = analytics.VALUE.BROWSE_BY_LANGUAGE;
        } else if (routeUrl[2]?.toUpperCase() === SECTION_SOURCE.GENRE) {
            source = analytics.VALUE.BROWSE_BY_GENRE;
        }
    }
    return source;
};

export const getAnalyticsContentType = (contentType, analytics = MIXPANEL) => {
    let result = "";
    if (
        contentType === CONTENTTYPE.TYPE_BRAND ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL
    ) {
        result = analytics.VALUE.BRAND;
    } else if (
        contentType === CONTENTTYPE.TYPE_SERIES ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL
    ) {
        result = analytics.VALUE.SERIES;
    } else if (
        contentType === CONTENTTYPE.TYPE_TV_SHOWS ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL
    ) {
        result = analytics.VALUE.TV_SHOWS;
    } else if (
        contentType === CONTENTTYPE.TYPE_MOVIES ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_MOVIES_DETAIL
    ) {
        result = analytics.VALUE.MOVIES;
    } else if (
        contentType === CONTENTTYPE.TYPE_TVOD ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_TVOD_DETAIL
    ) {
        result = analytics.VALUE.TVOD;
    } else if (
        contentType === CONTENTTYPE.TYPE_WEB_SHORTS ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_WEB_SHORTS_DETAIL
    ) {
        result = analytics.VALUE.WEB_SHORTS;
    }
    return result;
};

export const analyticsRailClickEvent = ({ item, data, currentSubscription }) => {
    const {
        sectionSource,
        contentPosition,
        title: railTitle = "",
        railPosition,
        isPartnerPage,
        pathname,
        configType
    } = data;
    const {
        title,
    } = item;
    if ([SECTION_SOURCE.PROVIDER, SECTION_SOURCE.LANGUAGE, SECTION_SOURCE.GENRE].includes(sectionSource)) {
        let analyticsData = {

            [MIXPANEL.PARAMETER.PAGE_NAME]: isPartnerPage ?
                MIXPANEL.VALUE.PARTNER_HOME :
                getAnalyticsSource(pathname, MIXPANEL),
            [MIXPANEL.PARAMETER.RAIL_TITLE]: railTitle,
            [MIXPANEL.PARAMETER.RAIL_POSITION]: railPosition,
            [MIXPANEL.PARAMETER.DEVICE_TYPE]: MIXPANEL.VALUE.WEB,
            [MIXPANEL.PARAMETER.PACK_PRICE]: currentSubscription?.amountValue || MIXPANEL.VALUE.FREEMIUM,

        };

        let languageGenreData = {
            [MIXPANEL.PARAMETER.PACK_NAME]: currentSubscription?.productName || MIXPANEL.VALUE.FREEMIUM,
            [MIXPANEL.PARAMETER.PAGE_RESULT_SWIPE]: 0,
            [MIXPANEL.PARAMETER.FILTER_SELECTED]: MIXPANEL.VALUE.ALL,
        };

        let eventName = ''

        switch (sectionSource) {
            case SECTION_SOURCE.PROVIDER:
                analyticsData = {
                    ...analyticsData,
                    [MIXPANEL.PARAMETER.CONTENT_PARTNER]: title,
                    [MIXPANEL.PARAMETER.CONTENT_PARTNER_POSITION]: contentPosition,
                    [MIXPANEL.PARAMETER.RAIL_TYPE]: configType,
                    [MIXPANEL.PARAMETER.PACK_NAME]: currentSubscription?.productName || MIXPANEL.VALUE.FREEMIUM,
                }
                eventName = MIXPANEL.EVENT.APPS_RAIL_CLICK;
                break;
            case SECTION_SOURCE.LANGUAGE:
                analyticsData = {
                    ...analyticsData,
                    ...languageGenreData,
                    [MIXPANEL.PARAMETER.LANGUAGE_SELECTED]: title,
                    [MIXPANEL.PARAMETER.RAIL_LANGUAGE_POSITION]: contentPosition,
                }
                eventName = MIXPANEL.EVENT.BROWSE_BY_LANGUAGE_RAIL_CLICK
                break;
            case SECTION_SOURCE.GENRE:
                analyticsData = {
                    ...analyticsData,
                    ...languageGenreData,
                    [MIXPANEL.PARAMETER.GENRE_SELECTED]: title,
                    [MIXPANEL.PARAMETER.RAIL_GENRE_POSITION]: contentPosition,
                }
                eventName = MIXPANEL.EVENT.BROWSE_BY_GENRE_RAIL_CLICK
        }
        mixPanelConfig.trackEvent(eventName, analyticsData);
    }
}

export const analyticsHomeClickEvent = (item, data) => {
    let {
        sectionSource,
        sectionType,
        contentPosition,
        title: railTitle = "",
        railPosition,
        isPartnerPage = false,
        pathname,
    } = data;
    if (
        !(
            sectionType?.toUpperCase() === SECTION_TYPE.RAIL &&
            sectionSource === SECTION_SOURCE.PROVIDER
        )
    ) {
        let section =
            sectionType === SECTION_TYPE.HERO_BANNER
                ? MIXPANEL.VALUE.HERO
                : MIXPANEL.VALUE.RAIL;
        const { position, contentType, provider, title, genre, language, releaseYear } = item;
        let mixPanelConfigType;
        if (sectionSource === SECTION_SOURCE.RECOMMENDATION) {
            mixPanelConfigType = MIXPANEL.VALUE.RECOMMENDATION;
        } else {
            mixPanelConfigType = MIXPANEL.VALUE.EDITORIAL;
        }

        let data = {
            [`${MIXPANEL.PARAMETER.SECTION}`]: `${section}`,
            [`${MIXPANEL.PARAMETER.HERO_BANNER_NUMBER}`]:
                sectionType === SECTION_TYPE.HERO_BANNER ? position : "",
            [`${MIXPANEL.PARAMETER.CONFIG_TYPE}`]: `${mixPanelConfigType}`,
            [`${MIXPANEL.PARAMETER.CONTENT_TYPE}`]: item?.sectionSource,
            [`${MIXPANEL.PARAMETER.PARTNER}`]: `${provider}`,
            [`${MIXPANEL.PARAMETER.RAIL_TITLE}`]: railTitle,
            [`${MIXPANEL.PARAMETER.CONTENT_TITLE}`]: `${title}`,
            [`${MIXPANEL.PARAMETER.CONTENT_GENRE}`]: genre?.join() || "",
            [`${MIXPANEL.PARAMETER.RAIL_POSITION}`]:
                sectionType === SECTION_TYPE.HERO_BANNER
                    ? 0
                    : parseInt(railPosition) + 1,
            [`${MIXPANEL.PARAMETER.CONTENT_POSITION}`]: parseInt(contentPosition) + 1,
            [`${MIXPANEL.PARAMETER.PARTNER_HOME}`]: isPartnerPage
                ? MIXPANEL.VALUE.YES
                : MIXPANEL.VALUE.NO,
            [`${MIXPANEL.PARAMETER.PAGE_NAME}`]: isPartnerPage
                ? MIXPANEL.VALUE.PARTNER_HOME
                : getAnalyticsSource(pathname, MIXPANEL),
            [`${MIXPANEL.PARAMETER.CONTENT_LANGUAGE}`]: getContentLanguage(language) || "",
            [`${MIXPANEL.PARAMETER.RELEASE}`]: releaseYear || '',

        };

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.HOME_CLICK, data);
        moengageConfig.trackEvent(MOENGAGE.EVENT.HOME_CLICK, data);
    }
};

export const checkEmptyValue = (name, value, errorName, currentState) => {
    let element =
        document.getElementsByName(name) && document.getElementsByName(name)[0];
    if (!value.length) {
        currentState.errors[name] = `Please ${errorName}`;
        currentState.setState(
            {
                errors: currentState.errors,
            },
            () => {
                currentState.errors[name] && element.classList.add("error");
            },
        );
    }
};

export const getProviderLogo = () => {
    const { headerDetails } = store.getState();
    let configResponse = get(headerDetails, "configResponse");
    return get(configResponse, "data.config.providerLogo");
};

export const scrollToTop = () => {
    document.documentElement.scrollTop = 0;
};
export const convertEpochTimeStamp = (epochTimeMilliseconds) => {
    let currentDate = new Date(), // to get current date with timestamp
        currentTimeMilliseconds = currentDate.getTime(), // to get the number of milliseconds since currentDate
        timeDifference = epochTimeMilliseconds - currentTimeMilliseconds, // to get diff between epoch and current time
        timeLeft = timeDifference / 60000,
        timeLeftLabel,
        timeLeftInHours = timeLeft / 60, time;

    if (timeLeft < 60) {
        time = Math.ceil(timeLeft);
        timeLeftLabel = (time < 0 ? 0 : time) + " min";
        return timeLeftLabel;
    } else if (timeLeftInHours <= 48) {
        timeLeftLabel = String(Math.ceil(timeLeftInHours)) + " hrs";
        return timeLeftLabel;
    } else {
        let timeLeftInDays = timeLeft / 1440;
        timeLeftLabel = Math.ceil(timeLeftInDays) + " Days";
        return timeLeftLabel;
    }
};

export const filterTVODContent = (list, tvodDetail) => {
    list = list?.filter((item, index) => {
        if (item.contractName === CONTRACT.RENTAL) {
            let id = item.id ? item.id : item.contentId;
            let data = tvodDetail?.items?.find((i) => i.id === id);
            item.rentalExpiry = data ? data.rentalExpiry : null;
            return !(data?.rentalStatus !== RENTAL_STATUS.ACTIVE || !data);
        } else {
            return true;
        }
    });
    return list;
};

export const showRail = (railItem) => {
    if (get(railItem, "contentList") && railItem.contentList.length && railItem.sectionSource !== SECTION_SOURCE.PROVIDER_BROWSE_APPS) {
        return isUserloggedIn() ? !(get(railItem, "mixedRail") && !get(railItem, "paintMixedRail")) : true;
    } else if (
        (railItem.sectionSource === SECTION_SOURCE.LANGUAGE_NUDGE)
    ) {
        return true;
    }
    return false;
};
export const getPackName = () => {
    let guestUser = !isUserloggedIn(),
        packName = PACK_NAME.FREEMIUM,
        { packExpired } = getPackInfo(),
        result = getPartnerSubscriptionInfo();
    if (guestUser) {
        packName = PACK_NAME.GUEST;
    } else {
        if (!packExpired) {
            packName = result ? result?.productName : packName;
        } else {
            packName = PACK_NAME.FREEMIUM;
        }
    }

    return packName;
}

export const getHomepageUrl = (url, isPartnerPage, providerId) => {
    let subscribed = checkIsUserSubscribed(isPartnerPage, providerId),
        guestUser = !isUserloggedIn(),
        packName = PACK_NAME.FREEMIUM,
        { packExpired } = getPackInfo(),
        result = getPartnerSubscriptionInfo();

    url = subscribed
        ? `${url}&Subscribed=${subscribed}`
        : `${url}&Subscribed=${subscribed}&UnSubscribed=${!subscribed}`;

    if (guestUser) {
        packName = PACK_NAME.GUEST;
    } else {
        if (!packExpired) {
            packName = result ? result?.productName : packName;
        } else {
            packName = PACK_NAME.FREEMIUM;
        }
    }

    url = `${url}&packName=${packName}`;

    return url;
};

/**
 * Checks if user is subscribed user or unsubscried user
 * @param isPartnerPage
 * @param providerId
 * @returns {boolean}
 */
export const checkIsUserSubscribed = (isPartnerPage, providerId) => {
    let result = getPartnerSubscriptionInfo();
    let subscribed = false, partnerList = getComponentList(result)?.partnerList;
    let state = store.getState();
    let subscriptionStatus = get(state, "subscriptionDetails.currentSubscription.data.subscriptionStatus");

    if (!isEmpty(partnerList)) {
        if (isPartnerPage) {
            subscribed =
                partnerList &&
                partnerList.some((i) => {
                    return parseInt(i.partnerId) === parseInt(providerId);
                });
        } else {
            subscribed = isUserloggedIn() ? partnerList?.length > 0 : false;
        }
    }
    if (isUserloggedIn() && ((subscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.DEACTIVE) || (subscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.EXPIRED))) {
        subscribed = false;
    }

    return subscribed;
};

export const getPartnerSubscriptionInfo = () => {
    let state = store.getState(),
        newUserLoginDetails = get(
            store.getState(),
            "loginReducer.newUser",
            {},
        ),
        existingUserLoginDetails = get(
            store.getState(),
            "loginReducer.existingUser",
            {},
        ),
        response = get(state, "subscriptionDetails.currentSubscription.data");

    if (!isEmpty(response)) {
        return response;
    } else {
        let result;
        if (!isEmpty(newUserLoginDetails)) {
            result = get(newUserLoginDetails, "data");
        } else if (!isEmpty(existingUserLoginDetails)) {
            result = get(existingUserLoginDetails, "data");
        }
        return result ? result : false;
    }
};

export async function getUserLoginDetails() {
    let state = store.getState();
    let newUserLoginDetails = get(state, "loginReducer.newUser", {}),
        existingUserLoginDetails = get(state, "loginReducer.existingUser", {}),
        response = get(state, "subscriptionDetails.currentSubscription.data");
    if (
        isEmpty(newUserLoginDetails) &&
        isEmpty(existingUserLoginDetails) &&
        isEmpty(response) &&
        isUserloggedIn()
    ) {
        await store.dispatch(getCurrentSubscriptionInfo(false));
    }
}

export const getPlayerHeaderParams = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let accessToken = userInfo.accessToken;
    return {
        locale: "IND",
        deviceId: getDeviceId(),
        deviceType: "WEB",
        authorization: `bearer ${accessToken}`,
        platform: "BINGE_ANYWHERE",
        baId: userInfo?.baId,
        subscriberId: userInfo?.sId,
        dthStatus: userInfo?.dthStatus
    };
};

export const getPubnubChannelName = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    //return 'sub_3000583801';
    let dthStatus = userInfo.dthStatus;

    if (dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER) {
        return userInfo.sId ? `sub_${userInfo.sId}` : null
    } else {
        return userInfo.rmn ? `rmn_${userInfo.rmn}` : null;
    }
};

export const getDateFromString = (data) => {
    let selectedDate = data;
    if (typeof data === "string" && data.includes("/")) {
        const [d, m, y] = data.split("/");
        selectedDate = new Date(y, m - 1, d);
    }
    return selectedDate;
};

export const dateTimeConversion = (data) => {
    let selectedDate = data;
    if (typeof data === "string" && data.includes("/")) {
        const [d, m, y] = data.split("/");
        selectedDate = new Date(y, m - 1, d);
    }
    let year = selectedDate.getFullYear();
    let date = selectedDate.getDate();
    let month = selectedDate.getMonth() + 1;

    if (date < 10) date = "0" + date;

    if (month < 10) month = "0" + month;

    let cur_day = year + "-" + month + "-" + date;

    let hours = selectedDate.getHours();
    let minutes = selectedDate.getMinutes();
    let seconds = selectedDate.getSeconds();

    if (hours < 10) hours = "0" + hours;

    if (minutes < 10) minutes = "0" + minutes;

    if (seconds < 10) seconds = "0" + seconds;

    return cur_day + " " + hours + ":" + minutes + ":" + seconds;
};

export const checkPartnerSubscribed = (currentSubscription, partnerId, provider) => {
    let subscribed = false, componentList = getComponentList(currentSubscription);
    if (!isEmpty(componentList?.partnerList) && currentSubscription?.subscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.ACTIVE) {
        if (partnerId !== "" && partnerId !== undefined && partnerId !== null && partnerId !== 0) {
            subscribed = !!componentList?.partnerList.find(item => item.included && parseInt(item?.partnerId) === parseInt(partnerId));
        } else {
            subscribed = componentList?.partnerList.some(item => {
                if (item.included) {
                    let partnerName = [PROVIDER_NAME.ZEE5, "zeefive"].includes(item?.partnerName?.toLowerCase());
                    let providerName = [PROVIDER_NAME.ZEE5, "zeefive"].includes(provider?.toLowerCase());
                    if (partnerName && providerName) {
                        return true;
                    } else if (item?.partnerName?.toLowerCase() === provider?.toLowerCase()) {
                        return true;
                    }
                    return false;
                }
            })
        }
    }
    return subscribed;
};

export const checkPartnerPlayable = (partnerId, provider) => {
    let state = store.getState();
    let currentSubscription = get(state.subscriptionDetails, 'currentSubscription');
    let response = false;
    if (isEmpty(currentSubscription)) {
        return store
            .dispatch(getCurrentSubscriptionInfo(false, true))
            .then((resp) => {
                return checkSubscribedPartnerContent(resp, partnerId, provider);
            });
    } else {
        response = checkSubscribedPartnerContent(currentSubscription, partnerId, provider);
    }
    return response;
};

export const checkSubscribedPartnerContent = (currentSubscription, partnerId, provider) => {
    let data = currentSubscription?.data;
    return checkPartnerSubscribed(data, partnerId, provider);
    /* if (
       data?.dthStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE &&
       data?.status?.toUpperCase() === ACCOUNT_STATUS.ACTIVE &&
       subscribed
   ) {
       return true;
   } else if (
       data?.status?.toUpperCase() === ACCOUNT_STATUS.ACTIVE &&
       data?.migrated &&
       data?.packType?.toLowerCase() === PACK_TYPE.PAID &&
       subscribed
   ) {
       return true;
   }
   return false;*/

};

export const loginInFreemium = async (props) => {
    const {
        openPopup,
        closePopup,
        openLoginPopup,
        source,
        getSource,
        ComponentName,
        selectedPlan,
        isfromMiniModal,
        partnerData,
        fromLogin,
        cartId,
        isFromCampaign
    } = props;
    let setSource = getSource ? getSource : FIREBASE.VALUE.PLAYBACK;
    let appWidth = document.getElementById("app").clientWidth;

    if (!!isMobile.any() || appWidth <= MOBILE_BREAKPOINT) {
        let props = {
            isfromMiniModal: isfromMiniModal,
            selectedPlan: selectedPlan,
            ComponentName: ComponentName,
            partnerData: partnerData,
            source: source,
            fromLogin: fromLogin,
            cartId: cartId,
            isFromCampaign: isFromCampaign
        }

        let mixpanel = {
            [`${MIXPANEL.PARAMETER.SOURCE}`]: source || '',
        }
        source === MIXPANEL.VALUE.DISCOUNTING_PAGE && (mixpanel = { ...mixpanel, ...{ [`${MIXPANEL.PARAMETER.PAGE_NAME}`]: source || '', } })
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_PAGE_VISIT, mixpanel);
        //  store.dispatch(closePopup());
        store.dispatch(openMiniSubscription(props));
    } else {

        if (ComponentName === MINI_SUBSCRIPTION.LOGIN) {
            trackEvent.loginEnter(source);
            if (!!isMobile.any() || appWidth <= MOBILE_BREAKPOINT) {
                store.dispatch(closePopup());
                store.dispatch(openLoginPopup());
            } else {
                store.dispatch(
                    openPopup(MODALS.CUSTOM_MODAL, {
                        modalClass: `alert-modal login-with-otp-modal ${source === 'DISCOUNTING PAGE' ? 'rm-overlay' : ''}`,
                        childComponent: <Login source={source} selectedPlan={selectedPlan} isFromCampaign={isFromCampaign} cartId={cartId} />,
                        hideCloseIcon: true,
                        isPadding: false,
                    }),
                );
            }
            let mixpanel = {
                [`${MIXPANEL.PARAMETER.SOURCE}`]: source || '',
            }
            source === MIXPANEL.VALUE.DISCOUNTING_PAGE && (mixpanel = { ...mixpanel, ...{ [`${MIXPANEL.PARAMETER.PAGE_NAME}`]: source || '', } })
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_PAGE_VISIT, mixpanel);
        } else if (ComponentName === MINI_SUBSCRIPTION.PLAN_SELECT) {
            store.dispatch(
                openPopup(MODALS.CUSTOM_MODAL, {
                    modalClass: "alert-modal plan-wrapper",
                    childComponent: <PlanSelection source={source} partnerData={partnerData} selectedPlan={selectedPlan} isFromCampaign={isFromCampaign} />,
                    hideCloseIcon: true,
                    isPadding: false,
                }))
        } else if (ComponentName === MINI_SUBSCRIPTION.CHANGE_TENURE) {
            store.dispatch(
                openPopup(MODALS.CUSTOM_MODAL, {
                    modalClass: "tenure-selection-modal",
                    childComponent: <ChangeTenureModal selectedPlan={selectedPlan} isfromMiniModal={isfromMiniModal} isFromCampaign={isFromCampaign} />,
                    hideCloseIcon: true,
                    isPadding: false,
                }))
        } else if (ComponentName === MINI_SUBSCRIPTION.SELECTION_DRAWER) {
            store.dispatch(
                openPopup(MODALS.CUSTOM_MODAL, {
                    modalClass: " alert-modal selection-drawer",
                    childComponent: <SelectionDrawer source={source} partnerData={partnerData} />,
                    hideCloseIcon: true,
                    isPadding: false,
                }))
        } else {
            store.dispatch(
                openPopup(MODALS.CUSTOM_MODAL, {
                    modalClass: "alert-modal plan-wrapper",
                    childComponent: <PlanSelection source={source} partnerData={partnerData} />,
                    hideCloseIcon: true,
                    isPadding: false,
                }))
        }
    }
};

export const showLoginScreen = async (openPopup, closePopup, openLoginPopup, partnerData, componentName) => {
    let getSource = FIREBASE.VALUE.PLAYBACK
    return await loginInFreemium({
        openPopup,
        closePopup,
        openLoginPopup,
        source: MIXPANEL.VALUE.CONTENT_PLAYBACK,
        getSource,
        ComponentName: componentName,
        partnerData: partnerData
    });
};

const getPartnerSubscriptionType = (meta, lastWatch) => {
    let playMovieBtn = getPlayAction(get(lastWatch, 'durationInSeconds'), get(lastWatch, 'secondsWatched'));
    let isPlayButton = playMovieBtn?.includes(PLAY_ACTION.PLAY), isResumeButton = playMovieBtn?.includes(PLAY_ACTION.RESUME), partnerSubscriptionType;
    if (!isUserloggedIn()) {
        if (isPlayButton) {
            partnerSubscriptionType = meta?.firstEpisodeSubscriptionType || meta?.partnerSubscriptionType;
        } else {
            partnerSubscriptionType = meta?.partnerSubscriptionType;
        }
    }
    else {
        partnerSubscriptionType = isResumeButton && !meta?.isEpisodeContent ? lastWatch?.partnerSubscriptionType : (meta?.firstEpisodeSubscriptionType || meta?.partnerSubscriptionType);
    }
    return partnerSubscriptionType?.toUpperCase();
}

export const checkPlayBackEligibility = async (meta, openPopup, closePopup, openLoginPopup, history, lastWatch, contractName) => {
    let partnerSubscriptionType = getPartnerSubscriptionType(meta, lastWatch);
    let playMovieBtn = getPlayAction(get(lastWatch, 'durationInSeconds'), get(lastWatch, 'secondsWatched'));
    let isPlayButton = playMovieBtn?.includes(PLAY_ACTION.PLAY);
    let firstEpisodeSubscriptionType = isPlayButton && (partnerSubscriptionType === PARTNER_SUBSCRIPTION_TYPE.FREE || partnerSubscriptionType === PARTNER_SUBSCRIPTION_TYPE.FREE_ADVERTISEMENT);
    let isIVOD = meta?.provider?.toLowerCase() === PROVIDER_NAME.TATASKY && contractName !== CONTRACT.RENTAL;
    let state = store.getState();
    await store.dispatch(checkFallbackFlow())
    let isManagedApp = get(state.headerDetails, "isManagedApp")

    if (!isUserloggedIn()) {
        if (isIVOD) {
            return await showLoginScreen(openPopup, closePopup, openLoginPopup, meta, MINI_SUBSCRIPTION.LOGIN);
        }
        if (partnerSubscriptionType === PARTNER_SUBSCRIPTION_TYPE.PREMIUM) {
            if(!isManagedApp){
                return safeNavigation(history, {
                    pathname: `/${URL.SUBSCRIPTION}`,
                    state: { partnerName: meta, isFromPi: true, url: `${window.location.pathname}${window.location.search}` }
                });
            }else{
            const state = store.getState()
            const enableTickTickJourney = get(state.headerDetails, 'configResponse.data.config.enableTickTickJourney');
            if (enableTickTickJourney) {
                await showLoginScreen(openPopup, closePopup, openLoginPopup, meta, MINI_SUBSCRIPTION.SELECTION_DRAWER)
            } else {
                handlePiRedirection(history);
                store.dispatch(getWebPortalLink({ initiateSubscription: JOURNEY_SOURCE.CONTENT_PLAY, journeySource: JOURNEY_SOURCE.HOME_CONTENT, journeySourceRefId: get(meta, 'partnerId'), analyticSource: MIXPANEL.VALUE.CONTENT_PLAYBACK }))
            }
        }

        }
        else if (partnerSubscriptionType === PARTNER_SUBSCRIPTION_TYPE.FREE || firstEpisodeSubscriptionType) {
            return await showLoginScreen(openPopup, closePopup, openLoginPopup, meta, MINI_SUBSCRIPTION.LOGIN);
        }
        else {
            await store.dispatch(checkPlaybackEligibility(true));
            const { PIDetails } = store.getState();
            let eligibleForFreePlayback = get(PIDetails, 'eligibleForFreePlayback');
            if (eligibleForFreePlayback?.code === 0) {
                if (!eligibleForFreePlayback?.data?.contentPlayBackAllowed) {
                    return await showLoginScreen(openPopup, closePopup, openLoginPopup, meta, MINI_SUBSCRIPTION.LOGIN);
                } else {
                    return true;
                }
            } else {
                return await showLoginScreen(openPopup, closePopup, openLoginPopup, meta, MINI_SUBSCRIPTION.LOGIN);
            }
        }
    }
    else {
        if (firstEpisodeSubscriptionType || partnerSubscriptionType !== PARTNER_SUBSCRIPTION_TYPE.PREMIUM) {
            return true;
        }
        else {
            //to check partner subscribed or not
            let partnerPlayable = (meta?.partnerId || meta?.provider) && (await checkPartnerPlayable(meta?.partnerId, meta?.provider));
            //partnerPlayable = true;
            let isTataSkyProvider = meta?.provider?.toLowerCase() === PROVIDER_NAME.TATASKY;

            if (partnerPlayable || isTataSkyProvider) {
                return true;
            } else {
                const state = store.getState();
                let currentSubscription = get(state, "subscriptionDetails.currentSubscription.data");
                await openSubscriptionPopup({ currentSubscription, meta, history, isManagedApp });
                if (!partnerPlayable && currentSubscription == null) {
                    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_POPUP);
                } else {
                    mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPGRADE_POPUP);
                }
            }
        }
    }
}


export const playContent = async (props, type) => {
    const {
        history,
        checkForNonIntegratedPartner,
        contentType,
        id,
        meta,
        mixpanelData,
        playZee5Content,
        playHotStarContent,
        deepLinkContent,
        redirectionHandling,
        playMXPlayerContent,
        isTVOD,
        tvodExpiry,
        lastWatch,
        openPopup,
        closePopup,
        openLoginPopup,
        contractName,
        playAppleTVContent,
    } = props;

    let checkedId = lastWatch.secondsWatched > 0 ? id : meta.vodId;
    let checkedContentType = lastWatch.secondsWatched > 0 ? lastWatch.contentType : meta.vodContentType ? meta.vodContentType : meta.contentType;
    const refUseCase = get(history, 'location.state.refUseCase', '');

    let learnData = {
        contentType: checkedContentType,
        learnActionType: LEARN_ACTION_TYPE.CLICK,
        id: checkedId,
        provider: meta.provider,
        refUseCase,
    }

    if (meta?.provider?.toLowerCase() === PROVIDER_NAME.MX_PLAYER) {
        playMXPlayerContent(history);
        return;
    }

    if (!checkForNonIntegratedPartner(meta?.provider, false)) return;

    if (getKey(LOCALSTORAGE.SUBTITLE)) {
        deleteKey(LOCALSTORAGE.SUBTITLE);
    }
    const systemDetail = getSystemDetails();

    let playbackAllowed = await checkPlayBackEligibility(meta, openPopup, closePopup, openLoginPopup, history, lastWatch, contractName);
    let checkSubscription = checkPartnerSubscriptionType(meta?.partnerId);
    let playMovieBtn = getPlayAction(get(lastWatch, 'durationInSeconds'), get(lastWatch, 'secondsWatched'));
    let isPlayButton = playMovieBtn?.includes(PLAY_ACTION.PLAY) || playMovieBtn?.includes(PLAY_ACTION.RESUME);
    let firstEpisodeSubscriptionType = isPlayButton && [PARTNER_SUBSCRIPTION_TYPE.FREE, PARTNER_SUBSCRIPTION_TYPE.FREE_ADVERTISEMENT].includes(meta?.firstEpisodeSubscriptionType?.toUpperCase());
    let isIVOD = meta?.provider?.toLowerCase() === PROVIDER_NAME.TATASKY && contractName !== CONTRACT.RENTAL && isMobile.any() && (systemDetail.browser === BROWSER_TYPE.CHROME || systemDetail.browser === BROWSER_TYPE.FIREFOX);
    let isVootSafari = (meta?.provider?.toLowerCase() === PROVIDER_NAME.VOOTSELECT || meta?.provider?.toLowerCase() === PROVIDER_NAME.VOOTKIDS) && systemDetail.browser === BROWSER_TYPE.SAFARI;

    if (playbackAllowed) {
        const handleCancelledUser = getDeviceStatus();

        if (handleCancelledUser) {
            await handleDeviceCancelledUser(history, false, MIXPANEL.VALUE.CONTENT);
        } else {
            if (meta?.provider?.toLowerCase() === PROVIDER_NAME.ZEE5) {
                let deeplink = meta?.isEpisodeContent
                    ? meta?.partnerWebUrl
                    : lastWatch?.partnerWebUrl
                        ? lastWatch?.partnerWebUrl
                        : meta?.partnerWebUrl;
                if (type === "seasonsType") {
                    let durationInSeconds = get(meta, 'totalDuration', 0);
                    let data = {
                        id: meta.id,
                        contentType: meta.contentType,
                        totalDuration: durationInSeconds,
                    }
                    playZee5Content(deeplink, true, data, learnData, firstEpisodeSubscriptionType);
                } else {
                    playZee5Content(deeplink, false, "", learnData, firstEpisodeSubscriptionType);
                }
            } else if (meta?.provider?.toLowerCase() === PROVIDER_NAME.APPLE) {
                let deeplink = meta?.isEpisodeContent ? meta?.partnerDeepLinkUrl : lastWatch?.partnerDeepLinkUrl  ? lastWatch?.partnerDeepLinkUrl : meta?.partnerDeepLinkUrl;
                playAppleTVContent(deeplink, true, learnData);
            }
            else if (meta?.provider?.toLowerCase() === PROVIDER_NAME.HOTSTAR) {
                let deeplink = meta?.isEpisodeContent
                    ? meta?.hotstarWebDeeplink
                    : lastWatch?.hotstarWebDeeplink
                        ? lastWatch?.hotstarWebDeeplink
                        : meta?.hotstarWebDeeplink

                // playHotStarContent(deeplink, true);
                playHotstarDeepLink(deeplink, true, playHotStarContent, learnData);
            } else if (isVootSafari || isIVOD) {
                let msg = 'Voot is currently not available on Safari. Download the Tata Play Binge app or switch to Chrome/Firefox/Edge to watch Voot content.';
                msg = isIVOD ? 'Tata Play is currently not available on Mobile Chrome. Download the Tata Play Binge app to watch content.' : msg;
                deepLinkContent(msg);
            } else if (meta?.provider?.toLowerCase() === PROVIDER_NAME.VOOTSELECT && meta?.partnerSubscriptionType?.toUpperCase() === PARTNER_SUBSCRIPTION_TYPE.FREE && checkSubscription !== SUBSCRIPTION_TYPE_HEADER.SUBSCRIBED || (firstEpisodeSubscriptionType && meta?.provider?.toLowerCase() === PROVIDER_NAME.VOOTSELECT)) {
                let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
                const { rmn: mobileNumber, profileId } = userInfo;
                let data = { "rmn": mobileNumber, "uniqueId": profileId }
                await store.dispatch(vootTokenapi(data))
                const state = store.getState();
                let vootContentparams = get(state.searchReducer, 'vootContentparams');
                let finalDeepLinkURL = lastWatch?.partnerDeepLinkUrl ? lastWatch?.partnerDeepLinkUrl : meta?.partnerDeepLinkUrl;
                let contentData = vootContentparams.data;
                for (var res in contentData) {
                    finalDeepLinkURL = `${finalDeepLinkURL}&${res}=${vootContentparams.data[res]}`;
                }
                redirectionHandling(finalDeepLinkURL, true, learnData);
            } else if (meta?.provider?.toLowerCase() === PROVIDER_NAME.CHAUPAL && systemDetail.os.toLowerCase() === OS.IOS.toLowerCase() && systemDetail.browser === BROWSER_TYPE.CHROME) {
                redirectToApp();
            } else {
                let mixpanelState = {
                    railTitle: mixpanelData?.railTitle,
                    source: mixpanelData?.source,
                    origin: mixpanelData?.origin,
                    railPosition: mixpanelData?.railPosition,
                    conPosition: mixpanelData?.conPosition,
                    sectionSource: mixpanelData?.sectionSource,
                    configType: mixpanelData?.configType,
                    sectionType: mixpanelData?.sectionType,
                    contentSectionSource: mixpanelData?.contentSectionSource,
                    refUseCase: refUseCase,
                };
                if (type === "seasonsType") {
                    safeNavigation(history, {
                        pathname: `/${URL.PLAYER}/${meta.contentType}/${meta.id}`,
                        state: mixpanelState,
                    });
                } else {
                    isTVOD && await tvodExpiry();
                    type === "movieType" && safeNavigation(history, {
                        pathname: `/${URL.PLAYER}/${contentType}/${id}`,
                        state: mixpanelState,
                    });
                    if (type === "seriesType") {
                        let hasLastWatchID = !isEmpty(lastWatch) && (lastWatch?.vodId !== null && lastWatch?.vodId !== undefined) && lastWatch?.vodId !== meta?.vodId;
                        if (hasLastWatchID && !meta?.isEpisodeContent) {
                            let path = `/${URL.PLAYER}/${lastWatch.durationInSeconds > 0 ? lastWatch.contentType : meta.vodContentType ? meta.vodContentType : meta.contentType}/${lastWatch?.vodId}`
                            safeNavigation(history, {
                                pathname: path,
                                state: mixpanelState,
                            });
                        } else {
                            let path = `/${URL.PLAYER}/${meta.vodContentType ? meta.vodContentType : meta.contentType}/${meta?.vodId}`
                            safeNavigation(history, {
                                pathname: path,
                                state: mixpanelState,
                            });
                        }
                    }
                }
            }
        }
    }
};

export const playHotstarDeepLink = async (hotstarWebDeeplink, setCW, playHotStarContent, learnData) => {
    let hotstarFrequency = JSON.parse(getKey(LOCALSTORAGE.HOTSTAR_LAUNCH_FREQUENCY)) || 0
    let periodicFrequency = JSON.parse(getKey(LOCALSTORAGE.HOTSTAR_PERIODIC_FREQUENCY)) || 0
    const state = store.getState()
    const hotstarpopUp = get(state.headerDetails, 'configResponse.data.config.hotstarPopUp.web')
    setKey(LOCALSTORAGE.HOTSTAR_LAUNCH_FREQUENCY, ++hotstarFrequency)
    hotstarFrequency > hotstarpopUp?.launchFrequency && setKey(LOCALSTORAGE.HOTSTAR_PERIODIC_FREQUENCY, ++periodicFrequency)
    if (hotstarFrequency <= hotstarpopUp?.launchFrequency) {
        return playHotStarContent(hotstarWebDeeplink, setCW, true, learnData)
    } else if (periodicFrequency <= hotstarpopUp?.periodicFrequency) {
        if (periodicFrequency === hotstarpopUp?.periodicFrequency) {
            deleteKey(LOCALSTORAGE.HOTSTAR_LAUNCH_FREQUENCY)
            deleteKey(LOCALSTORAGE.HOTSTAR_PERIODIC_FREQUENCY)
        }
        return playHotStarContent(hotstarWebDeeplink, setCW, false, learnData)
    }

}

export const openSubscriptionPopup = async (data) => {
    const { currentSubscription, meta, history, isManagedApp } = data;
    let headingMessage,
        instructions,
        errorIcon,
        primaryBtnText,
        source = MIXPANEL.VALUE.CONTENT;

    let subscribed = checkPartnerSubscribed(currentSubscription, meta?.partnerId, meta?.provider);
    let currentSubscriptionStatus = get(currentSubscription, 'subscriptionStatus');
    let noPack = checkCurrentSubscription(currentSubscription);
    let expired = !checkCurrentSubscription(currentSubscription) && currentSubscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.DEACTIVE;
    let activePlan = currentSubscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.ACTIVE;
    let lowerPack = activePlan && !subscribed;

    if(meta?.contentType?.toUpperCase() === CONTENTTYPE.TYPE_LIVE) {
        if(isEmpty(currentSubscriptionStatus)){
            noPack = true;
        } else if (activePlan) {
            lowerPack = true
        } else if(currentSubscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.DEACTIVE) {
            expired = true;
        }
    }

    if (currentSubscription?.downgradeRequested) {
      errorIcon = "icon-alert-upd";
      primaryBtnText = SUBSCRIPTION.DONE;
      instructions = currentSubscription?.downgradeRequestedMessage;
    } else if (currentSubscription?.upgradeFDOCheck) {
      headingMessage = currentSubscription?.upgradeFDOHeader;
      errorIcon = "icon-alert-upd";
      primaryBtnText = SUBSCRIPTION.DONE;
      instructions = currentSubscription?.upgradeFDOMessage;
    } else if (noPack) {
      headingMessage = SUBSCRIPTION.SELECT_SUBSCRIPTION;
      errorIcon = "icon-my-subscription-1";
      primaryBtnText = SUBSCRIPTION.PROCEED;
      instructions = SUBSCRIPTION.SELECT_SUBSCRIPTION_DETAIL;
    } else if (expired) {
      //TODO: show Nudge for renew plan
      headingMessage = SUBSCRIPTION.EXPIRED_SUBSCRIPTION;
      errorIcon = "icon-my-subscription-1";
      primaryBtnText = SUBSCRIPTION.RENEW;
      instructions = SUBSCRIPTION.EXPIRED_SUBSCRIPTION_DETAIL;
    } else if (lowerPack) {
      if (currentSubscription?.fdoRequested) {
        return safeNavigation(history, {
          pathname: `/${URL.SUBSCRIPTION}`,
        });
      } else {
        if (!isManagedApp) {
          headingMessage = SUBSCRIPTION.UPGRADE_SUBSCRIPTION;
          errorIcon = "icon-upgrade1";
          primaryBtnText = SUBSCRIPTION.UPGRADE;

          if (meta?.contentType === CONTENTTYPE.TYPE_MOVIES) {
            instructions =
              SUBSCRIPTION.UPGRADE_SUBSCRIPTION_DETAIL_1 +
              "movie" +
              SUBSCRIPTION.UPGRADE_SUBSCRIPTION_DETAIL_2;
          } else {
            instructions =
              SUBSCRIPTION.UPGRADE_SUBSCRIPTION_DETAIL_1 +
              "show" +
              SUBSCRIPTION.UPGRADE_SUBSCRIPTION_DETAIL_2;
          }
        } else {
          handlePiRedirection(history);
          return await store.dispatch(
            getWebPortalLink({
              initiateSubscription: JOURNEY_SOURCE.CONTENT_PLAY,
              journeySource: JOURNEY_SOURCE.HOME_CONTENT,
              journeySourceRefId: get(meta, "partnerId"),
              analyticSource: MIXPANEL.VALUE.CONTENT_PLAYBACK,
            })
          );
        }
      }
    }

    openPopupSubscriptionUpgrade({
        headingMessage,
        instructions,
        primaryBtnText,
        errorIcon,
        history,
        meta,
        source,
        currentSubscription,
        noPack,
        isManagedApp
    });
};

export const setTVODData = (item) => {
    let tvodInfo = JSON.parse(getKey(LOCALSTORAGE.TVOD_DATA)) || [];
    let data =
        tvodInfo && tvodInfo.find && tvodInfo.find((i) => i.id === item.id);
    !data &&
        item.rentalExpiry &&
        tvodInfo.push({
            id: item.id,
            rentalExpiry: item.rentalExpiry,
        });
    tvodInfo.length > 0 &&
        setKey(LOCALSTORAGE.TVOD_DATA, JSON.stringify(tvodInfo));
};

export const isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    otherMobileDevice: function () {
        return (
            navigator.userAgent.match(/Mobi/i) &&
            navigator.platform !== "iPad" &&
            !navigator.userAgent.match(/iPad/i)
        );
    },
    any: function () {
        return (
            isMobile.BlackBerry() ||
            isMobile.iOS() ||
            isMobile.Opera() ||
            isMobile.Windows() ||
            isMobile.otherMobileDevice()
        );
    },
};

export const isMobileBrowser = () => {
    return !!isMobile.any();
};

export const redirectToApp = (pathname) => {
    let envUrl = `${getEnvironmentConstants().ENV_URL}`;
    if (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) {
        // var now = new Date().valueOf();
        // setTimeout(function () {
        //     if (new Date().valueOf() - now > 2000) return;
        //     window.location.href = PLAY_STORE_URL.IOS;
        // }, 2000);
        // window.location = pathname ? `tataplaybinge://${pathname}`: "tataplaybinge://app-launch";
        var now = new Date().valueOf();
        window.location.href = pathname ? `tataplaybinge://${pathname}` : "tataplaybinge://app-launch";
        setTimeout(function () {
            if (confirm('Safari cannot open this page because address is invalid')) {
                // if (new Date().valueOf() - now > 3000) return;
                window.location.href = PLAY_STORE_URL.IOS;
            }
        }, 2000);
    } else if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
        setTimeout(function () {
            window.location.replace(PLAY_STORE_URL.ANDROID);
        }, 2000);
        window.location = "tataplaybinge://app-launch";
    } else {
        setTimeout(function () {
            window.location.href = PLAY_STORE_URL.ANDROID;
        }, 2000);
        window.open(`${envUrl}`, "_blank");
    }
};

export const redirectToAppStore = () => {
    if (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) {
        window.location.href = PLAY_STORE_URL.IOS;
    } else if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
        window.location.href = `https://play.app.goo.gl/?link=${PLAY_STORE_URL.ANDROID}`;
    } else {
        // in iPhone this condition is running might be due to navigator.userAgent that is why used IOS constant in else
        window.location.href = PLAY_STORE_URL.IOS;
    }
};
export const getHeroBannerInfo = (pageType) => {
    const { headerDetails } = store.getState();
    let taHeroBanner = get(
        headerDetails,
        "configResponse.data.config.taHeroBanner",
    );
    return (
        taHeroBanner && taHeroBanner.find((item) => item.pageType === pageType)
    );
};

export const getRailTitle = (contentType) => {
    let title = "";
    if (
        contentType === CONTENTTYPE.TYPE_MOVIES ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_MOVIES_DETAIL
    ) {
        title = RAIL_TITLE.MOVIES;
    } else if (
        contentType === CONTENTTYPE.TYPE_TV_SHOWS ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL ||
        contentType === CONTENTTYPE.TYPE_CATCH_UP ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_CATCH_UP_DETAIL
    ) {
        title = RAIL_TITLE.SHOWS;
    } else if (
        contentType === CONTENTTYPE.TYPE_WEB_SHORTS ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_WEB_SHORTS_DETAIL
    ) {
        title = RAIL_TITLE.SHORTS;
    } else if (
        contentType === CONTENTTYPE.TYPE_BRAND ||
        contentType === CONTENTTYPE.TYPE_BRAND_CHILD ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL
    ) {
        title = RAIL_TITLE.BRAND;
    } else if (
        contentType === CONTENTTYPE.TYPE_SERIES ||
        contentType === CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL ||
        contentType === CONTENTTYPE.TYPE_SERIES_CHILD
    ) {
        title = RAIL_TITLE.SERIES;
    }
    return title;
};

export const getTALanguageGenreTitle = (title, genreType, languageType) => {
    let newTitle = title;
    if (genreType) {
        newTitle = newTitle.includes("Genre1")
            ? newTitle.replace(/Genre1/gi, genreType)
            : newTitle;
        newTitle = newTitle.includes("Genre2")
            ? newTitle.replace(/Genre2/gi, genreType)
            : newTitle;
        newTitle = newTitle.includes("Genre_1")
            ? newTitle.replace(/<Genre_1>/gi, genreType)
            : newTitle;
        newTitle = newTitle.includes("Genre_2")
            ? newTitle.replace(/<Genre_2>/gi, genreType)
            : newTitle;
    }
    if (languageType) {
        newTitle = newTitle.includes("Language1")
            ? newTitle.replace(/Language1/gi, languageType)
            : newTitle;
        newTitle = newTitle.includes("Language2")
            ? newTitle.replace(/Language2/gi, languageType)
            : newTitle;
        newTitle = newTitle.includes("Language_1")
            ? newTitle.replace(/<Language_1>/gi, languageType)
            : newTitle;
        newTitle = newTitle.includes("Language_2")
            ? newTitle.replace(/<Language_2>/gi, languageType)
            : newTitle;

    }
    return newTitle;
};

export const triggerLearnAction = (
    { checkedContentType, learnAction, checkedId, provider, setLA, refUseCase },
    detail,
    meta,
    showLoader,
) => {
    if (detail?.contractName !== CONTRACT.RENTAL) {
        let data = {
            learnActionType: learnAction,
            contentType: checkedContentType,
            id: checkedId,
            provider: provider,
            refUseCase: refUseCase || ''
        };
        setLA(data, showLoader);
    } else {
        store.dispatch(viewCountLearnAction(checkedContentType, checkedId));
    }
};

export const compareDate = (contentWatchedTime, today) => {
    let contentWatchedDate = contentWatchedTime.getDate();
    let contentWatchedMonth = contentWatchedTime.getMonth();
    let contentWatchedYear = contentWatchedTime.getFullYear();

    let tDate = today.getDate();
    let tMonth = today.getMonth();
    let tYear = today.getFullYear();

    let dateOne = new Date(
        contentWatchedYear,
        contentWatchedMonth,
        contentWatchedDate,
    );
    let dateTwo = new Date(tYear, tMonth, tDate);

    return dateOne < dateTwo;
};

export const removeLAExpiredData = () => {
    let laData = JSON.parse(getKey(LOCALSTORAGE.LA_FIRED_DATE));
    laData &&
        laData.map((i, index) => {
            let contentWatchedTime = new Date(i.time);
            let today = new Date();
            if (compareDate(contentWatchedTime, today)) {
                laData.splice(index, 1);
            }
        });
    setKey(LOCALSTORAGE.LA_FIRED_DATE, laData);
};

export const openPopupSubscriptionUpgrade = async ({
    headingMessage,
    instructions,
    primaryBtnText,
    errorIcon,
    history,
    meta,
    source,
    currentSubscription,
    noPack,
    isManagedApp
}) => {
    if (noPack) {
        if(!isManagedApp){
            safeNavigation(history, {
                pathname: `/${URL.SUBSCRIPTION}`,
                state: {
                    upgradePack: primaryBtnText === SUBSCRIPTION.UPGRADE,
                    source: MIXPANEL.VALUE.PI_DETAIL,
                    planFocus: [SUBSCRIPTION.PROCEED, SUBSCRIPTION.UPGRADE].includes(primaryBtnText),
                    provider: meta?.provider,
                    partnerName: meta
                },
            });
        }else{
        // if enableTickTickJourney is false then directly send user to manageApp
        const state = store.getState()
        const enableTickTickJourney = get(state.headerDetails, 'configResponse.data.config.enableTickTickJourney');
        if (enableTickTickJourney) {
            await loginInFreemium({ openPopup, closePopup, ComponentName: MINI_SUBSCRIPTION.SELECTION_DRAWER, source: MIXPANEL.VALUE.CONTENT_PLAYBACK, partnerData: meta });
        } else {
            handlePiRedirection(history);
            upgradeModal(meta);
        }
      }
    } else {
        store.dispatch(
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: "alert-modal upgrade-modal inactive-alert",
                headingMessage: headingMessage,
                instructions: instructions,
                primaryButtonText: primaryBtnText,
                errorIcon: errorIcon,
                primaryButtonAction: () => handleSubsciptionPopupAction({
                    primaryBtnText,
                    history,
                    meta,
                    currentSubscription,
                    isManagedApp
                }),
                secondaryButtonText: currentSubscription?.downgradeRequested ? "" : !currentSubscription?.upgradeFDOCheck && "Cancel",
                secondaryButtonAction: () => {
                    store.dispatch(closePopup());
                    mixPanelConfig.trackEvent(primaryBtnText === SUBSCRIPTION.PROCEED ?
                        MIXPANEL.EVENT.SUBSCRIBE_POPUP_CANCEL : MIXPANEL.EVENT.UPGRADE_POPUP_CANCEL);
                },
                isCloseModal: true,
                hideCloseIcon: true,
            }),
        );
    }
};

export const showActivateAppleTV = ( partnerDeepLinkUrl, data, type) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal",
            headingMessage: data[0]?.data?.header,
            imageUrl: CrownImage,
            instructions: data[0]?.data?.subHeader,
            primaryButtonText: data[0]?.data?.others?.buttonTitle,
            primaryButtonAction: !isUserloggedIn
                ? () => {
                    handleNetworkRetry();
                }
                : async () => {
                    await store.dispatch(fetchRedemptionUrl());
                },
                secondaryButtonText: type && data[0]?.data?.others?.buttonHeader,
                secondaryButtonAction: () =>{
                    window.location.href = partnerDeepLinkUrl
                }
        }),
    );
};

const handleSubsciptionPopupAction = async ({
    primaryBtnText,
    history,
    meta,
    currentSubscription,
    isManagedApp
}) => {
    if ((currentSubscription?.upgradeFDOCheck && primaryBtnText === SUBSCRIPTION.OK) || currentSubscription?.downgradeRequested || (currentSubscription?.upgradeFDOCheck && primaryBtnText === SUBSCRIPTION.DONE)) { // last check applied for plan cancellation request raised
        store.dispatch(closePopup());
    } else if (currentSubscription?.fdoRequested) {
        safeNavigation(history, {
            pathname: `/${URL.SUBSCRIPTION}`
        });
    } else {
        setKey(LOCALSTORAGE.PI_DETAIL_URL, `${window.location.pathname}${window.location.search}`);
        setKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI, `true`);
        if (primaryBtnText === SUBSCRIPTION.RENEW) {
            await renewSusbcription(history);
        } else {
            if(!isManagedApp){
               safeNavigation(history, {
                pathname: `/${URL.SUBSCRIPTION}`,
                state: {
                    upgradePack: primaryBtnText === SUBSCRIPTION.UPGRADE,
                    source: MIXPANEL.VALUE.PI_DETAIL,
                    planFocus: [SUBSCRIPTION.PROCEED, SUBSCRIPTION.UPGRADE].includes(primaryBtnText),
                    provider: meta?.provider,
                    partnerName: meta
                },
            });
        }else{
            handlePiRedirection(history);
            await store.dispatch(getWebPortalLink({ initiateSubscription: JOURNEY_SOURCE.CONTENT_PLAY, journeySource: JOURNEY_SOURCE.HOME_CONTENT, journeySourceRefId: get(meta, 'partnerId'), analyticSource: MIXPANEL.VALUE.CONTENT_PLAYBACK }))
        }
        }

    }
    let title = meta?.contentType === CONTENTTYPE.TYPE_MOVIES ? meta?.vodTitle : (meta?.brandTitle || meta?.seriesTitle || meta?.vodTitle || meta?.title)
    if (primaryBtnText === SUBSCRIPTION.PROCEED) {
        let mixpanel = {
            [`${MIXPANEL.PARAMETER.CONTENT_TITLE}`]: title
        }
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_POPUPP_SUBSCRIBE, mixpanel);
    } else {
        let commonData = {
            [`${MIXPANEL.PARAMETER.CONTENT_TITLE}`]: title,
            [`${MIXPANEL.PARAMETER.CONTENT_PARTNER}`]: meta?.provider,
        };
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPGRADE_POPUP_UPGRADE, commonData);
    }
}

export const getWeekNameFromDate = (date, fullName = false) => {
    let weekShotName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let weekLongName = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday ",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    return fullName ? weekLongName[date.getDay()] : weekShotName[date.getDay()];
};

export const getMonthNameFromDate = (date, fullName = false) => {
    let monthShortName = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    let monthFullName = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return fullName
        ? monthFullName[date.getMonth()]
        : monthShortName[date.getMonth()];
};

export const getOrdinalNum = (n) => {
    return (
        n +
        (n > 0
            ? ["th", "st", "nd", "rd"][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
            : "")
    );
};
export const showRechargePopup = (
    heading,
    instructions,
    rechargeBtn,
    skipBtn,
    openPopup,
    quickRecharge,
    history,
    sId = null,
    rechargeBeforeLogin,
    lowBalance = false,
) => {
    let { bingeLoginDetails } = store.getState();
    let isRMN = get(bingeLoginDetails, "accountDetailsFromRmn")
        ? Object.keys(bingeLoginDetails.accountDetailsFromRmn).length !== 0
        : false;
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal inactive-alert",
            headingMessage: heading,
            instructions: instructions,
            primaryButtonText: rechargeBtn ? "Recharge" : "",
            primaryButtonAction: async () => {
                if (rechargeBeforeLogin) {
                    store.dispatch(showMainLoader());
                    await store.dispatch(quickRechargeBeforeLogin(sId));
                    const { packSelectionDetail } = store.getState();
                    let quickRechargeSelfCareUrl = get(
                        packSelectionDetail,
                        "quickRechargeUrl",
                    );
                    if (
                        quickRechargeSelfCareUrl.code === 0 &&
                        !isEmpty(quickRechargeSelfCareUrl.data)
                    ) {
                        trackRechargeEvent();
                        window.location.assign(
                            `${quickRechargeSelfCareUrl.data.rechargeUrl}`,
                        );
                    } else {
                        store.dispatch(hideMainLoader());
                    }
                } else {
                    let packSelectionDetail = store.getState().packSelectionDetail;
                    let recommendedAmount =
                        packSelectionDetail?.balanceInfo?.data?.recommendedAmount;
                    store.dispatch(showMainLoader());
                    await quickRecharge(recommendedAmount, sId);

                    packSelectionDetail = store.getState().packSelectionDetail;
                    let quickRechargeSelfCareUrl = get(
                        packSelectionDetail,
                        "quickRecharge",
                    );
                    if (
                        quickRechargeSelfCareUrl.code === 0 &&
                        !isEmpty(quickRechargeSelfCareUrl.data)
                    ) {
                        trackRechargeEvent();
                        window.location.assign(
                            `${quickRechargeSelfCareUrl.data.rechargeUrl}`,
                        );
                    } else {
                        store.dispatch(hideMainLoader());
                    }
                }
            },
            secondaryButtonText: skipBtn ? (lowBalance ? "Skip" : "Cancel") : "",
            secondaryButtonAction: () => {
                lowBalance ? safeNavigation(history, URL.DEFAULT) : callLogOut(history);
            },
            hideCloseIcon: !isRMN,
            errorIcon: "icon-alert-upd",
        }),
    );
};

export const queryStringToObject = (queryString = {}) => {
    if (isEmpty(queryString)) return queryString;
    let search = queryString.substring(1);
    return JSON.parse(
        '{"' +
        decodeURIComponent(search)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
        '"}',
    );
};

export const rechargeBtnHandler = async (history, currentSubscription) => {
    const handleCancelledUser = getDeviceStatus();
    if (handleCancelledUser) {
        await handleDeviceCancelledUser(history, true, MIXPANEL.VALUE.MY_ACCOUNT);
    } else {
        if (
            isEmpty(currentSubscription) ||
            (!isEmpty(currentSubscription) &&
                currentSubscription?.subscriptionInformationDTO?.bingeAccountStatus?.toUpperCase() ===
                ACCOUNT_STATUS.WRITTEN_OFF)
        ) {
            checkUserDTHStatus(currentSubscription, history, true, false, "");
        } else {
            await getBalanceInfo(get(currentSubscription, "packId"));

            safeNavigation(history, {
                pathname: `/${URL.PACK_SELECTION}`,
                search: `?source=${MIXPANEL.VALUE.MY_ACCOUNT}&aboutSubscription=true&contentRecharge=true`,
                state: {
                    subscription: "recharge",
                    accountDropDown: true,
                    source: MIXPANEL.VALUE.MY_ACCOUNT,
                },
            });
        }
    }
};

/**
 *
 * @param data
 * @param history
 * @param rechargeBtn - method called on click of recharge btn of my account screen/dropdown.
 * @param skipToHome
 * @param freeTrialDthActive
 * @param nudgeSource
 */
export const checkUserDTHStatus = (
    data,
    history,
    rechargeBtn,
    skipToHome,
    nudgeSource,
    freeTrialDthActive = false,
) => {
    const { dthStatus, accountSubStatus } = JSON.parse(
        getKey(LOCALSTORAGE.USER_INFO),
    );
    let popupData = {};

    let updatedDthStatus = data
        ? data?.dthStatus?.toUpperCase()
        : dthStatus?.toUpperCase();
    let updatedAccountSubStatus = data
        ? data?.accountSubStatus?.toUpperCase()
        : accountSubStatus?.toUpperCase();

    /* //Check if user has no pack or cancelled free pack
       if (isEmpty(data) || data?.subscriptionInformationDTO?.bingeAccountStatus?.toUpperCase() === ACCOUNT_STATUS.WRITTEN_OFF) {*/

    if (
        [
            ACCOUNT_STATUS.DEACTIVATED,
            ACCOUNT_STATUS.DEACTIVE,
            ACCOUNT_STATUS.INACTIVE,
        ].includes(updatedDthStatus)
    ) {
        popupData = {
            header: DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE.HEADER,
            instructions:
                DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE.INSTRUCTIONS,
            primaryBtnText:
                DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE
                    .PRIMARY_BTN_TEXT,
            secondaryBtnText:
                DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE
                    .SECONDARY_BTN_TEXT,
        };
        dthBingePopup(history, popupData, skipToHome);
    } else if (updatedDthStatus === ACCOUNT_STATUS.TEMP_SUSPENSION) {
        popupData = {
            header:
                DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_WRITTEN_OFF_INACTIVE.HEADER,
            instructions:
                DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_WRITTEN_OFF_INACTIVE
                    .INSTRUCTIONS,
            primaryBtnText:
                DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_WRITTEN_OFF_INACTIVE
                    .PRIMARY_BTN_TEXT,
        };
        tempSuspendedPopup(history, popupData, skipToHome);
    } else if (
        updatedDthStatus === ACCOUNT_STATUS.ACTIVE &&
        updatedAccountSubStatus === ACCOUNT_STATUS.SUB_STATUS_PARTIALLY_DUNNED
    ) {
        popupData = {
            header: DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE.HEADER,
            instructions:
                DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE.INSTRUCTIONS,
            primaryBtnText:
                DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE.PRIMARY_BTN_TEXT,
            secondaryBtnText:
                DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE
                    .SECONDARY_BTN_TEXT,
        };
        dthBingePopup(history, popupData, skipToHome);
    } else {
        if (!freeTrialDthActive) {
            if (rechargeBtn) {
                safeNavigation(history, {
                    pathname: `/${URL.PACK_SELECTION}`,
                    search: `?source=${MIXPANEL.VALUE.MY_ACCOUNT}&aboutSubscription=true`,
                });
            } else {
                let packSelectionSource = nudgeSource
                    ? MIXPANEL.VALUE.HOME
                    : MIXPANEL.VALUE.MY_ACCOUNT;
                nudgeSource === SECTION_SOURCE.FREE_TRIAL_UPGRADE
                    ? safeNavigation(history, {
                        pathname: `/${URL.UPGRADE_FREE_TRIAL}`,
                        state: {
                            from: history?.location?.pathname,
                        },
                        search: `?source=${MIXPANEL.VALUE.HOME}`,
                    })
                    : safeNavigation(
                        history,
                        `/${URL.PACK_SELECTION}?source=${packSelectionSource}`,
                    );
            }
        }
    }
    //}
};

export const openTimeoutPopup = (history) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal error-state-modal",
            headingMessage: ERROR_MESSAGES.DEVICE_REMOVED,
            instructions: ERROR_MESSAGES.DEVICE_REMOVED_MESSAGE,
            primaryButtonText: "Ok",
            primaryButtonAction: async (bingeCheck, primeCheck, newHistory) => {
                showlogoutToast(MESSAGE.LOGOUT_SUCCESS);
                await logoutHandling();
                getDeviceId();
                await getAnonymousId();
                redirectToHomeScreen(!isEmpty(newHistory) ? newHistory : history);
            },
            errorIcon: "icon-alert-upd",
            hideCloseIcon: true,
        }),
    );
};

export const logOutUser = () => {
    store.dispatch(loggedIn(false));
    clearKey();
    mixpanel.reset();
    //Moengage.destroy_session();
};

export const initialArrowState = (elementId, currentState, right) => {
    const element = document.getElementById(elementId);

    if (
        element &&
        element.scrollLeft + element.clientWidth < element.scrollWidth
    ) {
        currentState.setState({ [right]: true });
    }
};

export const horizontalScroll = (elementId, currentState, left, right) => {
    const element = document.getElementById(elementId);
    let val = element?.scrollLeft;

    if (element?.scrollLeft + element?.clientWidth + 1 >= element?.scrollWidth) {
        currentState.setState({
            [right]: false,
        });
    } else {
        currentState.setState({
            [right]: true,
        });
    }

    if (val === 0) {
        currentState.setState({
            [left]: false,
        });
    } else {
        currentState.setState({
            [left]: true,
        });
    }
};

export const updateSearchList = (searchVal) => {
    const RECENT_SEARCH_MAX_LIMIT = 10;
    let list = JSON.parse(getKey(LOCALSTORAGE.SEARCH));
    let itemExist;
    if (searchVal) {
        if (list)
            itemExist =
                list &&
                list.find((item) => item.toLowerCase() === searchVal.toLowerCase());
        if (list && list.length < RECENT_SEARCH_MAX_LIMIT && !itemExist) {
            list.unshift(searchVal);
        } else if (list && list.length >= RECENT_SEARCH_MAX_LIMIT && !itemExist) {
            list.splice(list.length - 1, 1);
            list.unshift(searchVal);
        } else if (itemExist) {
            list.splice(list.indexOf(itemExist), 1);
            list.unshift(searchVal);
        } else {
            list = [];
            list.push(searchVal);
        }
        setKey(LOCALSTORAGE.SEARCH, JSON.stringify(list));
    }
};

export const openErrorPopUp = (currentProps, apiResp) => {
    currentProps.openPopup(MODALS.ALERT_MODAL, {
        modalClass: "alert-modal",
        instructions:
            apiResp && apiResp.message ? apiResp.message : MESSAGE.ERROR_OCCURRED,
        primaryButtonText: "Ok",
        closeModal: true,
        hideCloseIcon: true,
    });
};

export const deepEqual = (object1, object2) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            (areObjects && !deepEqual(val1, val2)) ||
            (!areObjects && val1 !== val2)
        ) {
            return false;
        }
    }

    return true;
};

export const isObject = (object) => {
    return object != null && typeof object === "object";
};

export const providerImage = (provider, view) => {
    let imageUrl = "";
    let imageType =view === LAYOUT_TYPE.CIRCULAR ? "logoCircular" : "logoRectangular";
    provider = provider.toLowerCase();
    const genericData = JSON.parse(getKey(LOCALSTORAGE.genericProviders));
    const genericProviders = genericData && genericData[provider];   
    if(genericProviders != undefined){
        imageUrl = genericProviders[imageType];
    }
    else{
        if (provider) {
            let providerLogo = getProviderLogo();
            provider = provider.toUpperCase();
            let providerImages = providerLogo && providerLogo[provider];
            imageUrl = providerImages ? providerImages[imageType] : "";
        }
    }
    return imageUrl;
};

export const filterPartnerContents = (list, sectionSource = "") => {
    const genericData = JSON.parse(getKey(LOCALSTORAGE.genericProviders));
     const genericProviders = genericData ? Object.keys(genericData) : [];
        let allProvider = [...INTEGRATED_PARTNER_LIST,...genericProviders || []]
    return (
        list &&
        list.filter((item) => {
            let providerLowerCase = item?.provider?.toLowerCase();
            let contract = item?.contractName?.toUpperCase();
            if (
                [SECTION_SOURCE.LANGUAGE, SECTION_SOURCE.GENRE, SECTION_SOURCE.CATEGORY,SECTION_SOURCE.BINGE_CHANNEL,SECTION_SOURCE.BINGE_DARSHAN_CHANNEL].includes(sectionSource)
            ) {
                return true;
            } else {
                return allProvider.includes(providerLowerCase);

            }
        })
    );
};

export const callLogOut = async (showToast = true, history, redirectToHome = true, allUsers = false, clearStore = true) => {
    store.dispatch(showMainLoader());
    await store.dispatch(logOut(allUsers));
    store.dispatch(hideMainLoader());
    const { bingeLoginDetails } = store.getState();
    let logOutResponse = get(bingeLoginDetails, "logOutResponse");
    const { modal } = store.getState();
    let showModal = get(modal, "showModal");

    if (logOutResponse && logOutResponse.code === 0) {
        if (!isHelpCenterWebView()) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGOUT);
            moengageConfig.trackEvent(MOENGAGE.EVENT.MOE_LOGOUT);
        }
        showToast && showlogoutToast(MESSAGE.LOGOUT_SUCCESS);
        await logoutHandling(clearStore);
        redirectToHome && redirectToHomeScreen(history);
    } else if (logOutResponse && logOutResponse.error) {
        trackAnalyticsLogoutFailure(logOutResponse);
        await logoutHandling(clearStore);
        !showModal &&
            store.dispatch(
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: "alert-modal ",
                    headingMessage: logOutResponse.message,
                    primaryButtonText: "Ok",
                    primaryButtonAction: () => {
                        redirectToHomeScreen(history);
                    },
                    closeModal: true,
                    hideCloseIcon: true,
                }),
            );
    } else if (logOutResponse && logOutResponse.code === 200004) {
        trackAnalyticsLogoutFailure(logOutResponse);
        console.log(`Device removed: LOGOUT RESPONSE 200004`)
        setKey(LOCALSTORAGE.DEVICE_REMOVED, JSON.stringify(true));
        !showModal && openTimeoutPopup(true, history);
    } else {
        await logoutHandling(clearStore);
        !showModal &&
            store.dispatch(
                !showModal &&
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: "alert-modal ",
                    headingMessage: logOutResponse?.error
                        ? logOutResponse.error
                        : "Some Error Occurred",
                    primaryButtonText: "Ok",
                    primaryButtonAction: () => {
                        redirectToHomeScreen(history);
                    },
                    closeModal: true,
                    hideCloseIcon: true,
                }),
            );
    }

    getDeviceId();
    await getAnonymousId();
};

export const logoutHandling = async (shouldClearStore = true) => {
    //mixpanel.reset();
    // Moengage.destroy_session();
    store.dispatch(loggedIn(false));
    await clearKey();
    shouldClearStore && store.dispatch(clearStore());
    removePubNubListener();
};

export const trackAnalyticsLogoutFailure = (logOutResponse) => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGOUT_FAILED, {
        [`${MIXPANEL.PARAMETER.REASON}`]: logOutResponse.message,
    });
    moengageConfig.trackEvent(MOENGAGE.EVENT.LOGOUT_FAILED, {
        [`${MOENGAGE.PARAMETER.REASON}`]: logOutResponse.message,
    });
};

function handleNetworkRetry() {
    store.dispatch(showMainLoaderImmediate());
    if (navigator.onLine) {
        store.dispatch(showMainLoaderImmediate());
        setTimeout(() => {
            store.dispatch(closePopup());
            store.dispatch(hideMainLoader());
        }, 2000);
    } else {
        setTimeout(() => {
            store.dispatch(hideMainLoader());
        }, 2000);
    }
}

export const showNoInternetPopup = () => {
    const isLogin = isUserloggedIn();
    let instructionText = isMobile.any()
        ? MESSAGE.NETWORK_MESSAGE_MOBILE
        : MESSAGE.NETWORK_MESSAGE_WEB;
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal error-state-modal",
            headingMessage: ERROR_MESSAGES.NO_INTERNET,
            hideCloseIcon: isLogin,
            instructions: instructionText,
            primaryButtonText: !isLogin ? "Retry" : "Ok",
            primaryButtonAction: !isLogin
                ? () => {
                    handleNetworkRetry();
                }
                : () => {
                    store.dispatch(closePopup());
                },
            isCloseModal: false,
            errorIcon: "icon-no-internet",
        }),
    );
};

export const safeNavigation = (history, path) => {
    if (navigator.onLine) {
        if (typeof path !== 'object') {
            const [pathname, search = ''] = path.split('?');
            path = { pathname, search: search ? `?${search}` : '' }
        }
        const { state = {} } = path;
        history.push({ ...path, state: { ...state, prevPath: history?.location?.pathname } });
    } else {
        showNoInternetPopup();
    }
};

export const filterRailContent = (response) => {
    response.data.items.filter((item, index) => {
        response.data.items[index].contentList = filterPartnerContents(
            item.contentList,
            item.sectionSource,
        );
    });
    return response;
};

export const getSubscriptionExpiryText = (currentSubscription) => {
    if (currentSubscription?.status?.toUpperCase() === ACCOUNT_STATUS.ACTIVE) {
        if (currentSubscription?.packType?.toLowerCase() === PACK_TYPE.FREE) {
            return `${CURRENT_SUBSCRIPTION.ENDS} ${currentSubscription?.expirationDate}`;
        } else if (
            currentSubscription?.packType?.toLowerCase() === PACK_TYPE.PAID
        ) {
            return `${CURRENT_SUBSCRIPTION.RENEWAL} ${currentSubscription?.expirationDate}`;
        }
    } else if (
        currentSubscription?.status?.toUpperCase() === ACCOUNT_STATUS.DEACTIVATED ||
        currentSubscription?.status === ACCOUNT_STATUS.DEACTIVE
    ) {
        return `${CURRENT_SUBSCRIPTION.EXPIRED} ${currentSubscription?.expirationDate}`;
    }
};

export const taDataFiltering = (list) => {
    list &&
        list.map((item) => {
            if (!isEmpty(item?.actionedItemTitle)) {
                item.title += " aa" + item?.actionedItemTitle;
            }
            if (!isEmpty(item?.seriesvrId)) {
                item.id = item.seriesvrId ? item.seriesvrId : item.id;
                item.title = item.seriesTitle ? item.seriesTitle : item.title;
                item.contentType = item.seriescontentType
                    ? item.seriescontentType
                    : item.contentType;
                item.image = item.seriesimage ? item.seriesimage : item.image;
            }
            item['sectionSource'] = SECTION_SOURCE.RECOMMENDATION;
            return item;
        }
        );
    return list;
};

export const checkBingeDTHStatus = (
    dthStatus,
    bingeStatus,
    migrated,
    packType,
    accountSubStatus,
    { history, expiryDate, detailPage = false },
) => {
    let isDBR = !migrated,
        isMBR = migrated,
        freePack = packType?.toLowerCase() === PACK_TYPE.FREE,
        paidPack = packType?.toLowerCase() === PACK_TYPE.PAID;

    let popupShown = false,
        skipToHome = !detailPage;

    if (
        [
            ACCOUNT_STATUS.DEACTIVATED,
            ACCOUNT_STATUS.DEACTIVE,
            ACCOUNT_STATUS.INACTIVE,
        ].includes(dthStatus?.toUpperCase()) ||
        (dthStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE &&
            accountSubStatus?.toUpperCase() ===
            ACCOUNT_STATUS.SUB_STATUS_PARTIALLY_DUNNED)
    ) {
        let data = {};
        if (
            [
                ACCOUNT_STATUS.DEACTIVATED,
                ACCOUNT_STATUS.DEACTIVE,
                ACCOUNT_STATUS.INACTIVE,
            ].includes(bingeStatus?.toUpperCase()) &&
            (isDBR || isMBR)
        ) {
            //binge subscription type is (DBR FREE (Inactive), DBR PAID (Inactive), MBR FREE (Inactive), MBR PAID (Inactive))
            data = {
                header: DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.HEADER,
                instructions: DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.INSTRUCTIONS,
                primaryBtnText:
                    DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.PRIMARY_BTN_TEXT,
                secondaryBtnText:
                    DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.SECONDARY_BTN_TEXT,
                errorIcon: "icon-alert-upd",
                dunningInactive: false,
            };
            popupShown = true;
            openRechargePopUp(history, data, detailPage);
        }
    }

    if (
        [
            ACCOUNT_STATUS.DEACTIVATED,
            ACCOUNT_STATUS.DEACTIVE,
            ACCOUNT_STATUS.INACTIVE,
        ].includes(dthStatus?.toUpperCase())
    ) {
        //DTH status is inactive
        let data = {};
        if (
            bingeStatus?.toUpperCase() === ACCOUNT_STATUS.WRITTEN_OFF ||
            (bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE &&
                (isDBR || (isMBR && freePack)))
        ) {
            //binge subscription type is (written off, DBR FREE (Active), DBR PAID (Active), MBR FREE (Active))
            data = {
                header: DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE.HEADER,
                instructions:
                    DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE.INSTRUCTIONS,
                primaryBtnText:
                    DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE
                        .PRIMARY_BTN_TEXT,
                secondaryBtnText:
                    DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE
                        .SECONDARY_BTN_TEXT,
            };
            popupShown = true;
            dthBingePopup(history, data, skipToHome);
        } else if (
            isMBR &&
            paidPack &&
            bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE
        ) {
            //binge subscription type is MBR PAID (active)
            data = {
                header: DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_MBR_PAID_ACTIVE.HEADER,
                instructions: `${DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_MBR_PAID_ACTIVE.INSTRUCTIONS} ${expiryDate}.`,
                primaryBtnText:
                    DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_MBR_PAID_ACTIVE.PRIMARY_BTN_TEXT,
                secondaryBtnText:
                    DTH_BINGE_POPUP.DTH_INACTIVE_BINGE_MBR_PAID_ACTIVE.SECONDARY_BTN_TEXT,
            };
            popupShown = !detailPage;
            !detailPage && dthBingePopup(history, data, skipToHome);
        }
    } else if (dthStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE) {
        //DTH Status is active
        let data = {};
        if (
            accountSubStatus?.toUpperCase() ===
            ACCOUNT_STATUS.SUB_STATUS_PARTIALLY_DUNNED
        ) {
            //DTH Status is partially Dunned
            if (
                bingeStatus?.toUpperCase() === ACCOUNT_STATUS.WRITTEN_OFF ||
                (bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE &&
                    (isDBR || (isMBR && freePack)))
            ) {
                //binge subscription type is (written off, DBR FREE (Active), DBR PAID (Active), MBR FREE (Active))
                data = {
                    header: DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE.HEADER,
                    instructions:
                        DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE.INSTRUCTIONS,
                    primaryBtnText:
                        DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE
                            .PRIMARY_BTN_TEXT,
                    secondaryBtnText:
                        DTH_BINGE_POPUP.DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE
                            .SECONDARY_BTN_TEXT,
                };
                popupShown = true;
                dthBingePopup(history, data, skipToHome);
            } else if (
                isMBR &&
                paidPack &&
                bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE
            ) {
                //binge subscription type is MBR PAID (active)
                data = {
                    header: DTH_BINGE_POPUP.DTH_DUNNED_BINGE_MBR_PAID_ACTIVE.HEADER,
                    instructions: `${DTH_BINGE_POPUP.DTH_DUNNED_BINGE_MBR_PAID_ACTIVE.INSTRUCTIONS} ${expiryDate}.`,
                    primaryBtnText:
                        DTH_BINGE_POPUP.DTH_DUNNED_BINGE_MBR_PAID_ACTIVE.PRIMARY_BTN_TEXT,
                    secondaryBtnText:
                        DTH_BINGE_POPUP.DTH_DUNNED_BINGE_MBR_PAID_ACTIVE.SECONDARY_BTN_TEXT,
                };
                popupShown = !detailPage;
                !detailPage && dthBingePopup(history, data, skipToHome);
            }
        } else {
            if (
                [
                    ACCOUNT_STATUS.DEACTIVATED,
                    ACCOUNT_STATUS.DEACTIVE,
                    ACCOUNT_STATUS.INACTIVE,
                ].includes(bingeStatus?.toUpperCase()) &&
                isMBR
            ) {
                //binge subscription type is inactive(MBR/Free, MBR/PAID)
                data = {
                    header: DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.HEADER,
                    instructions: DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.INSTRUCTIONS,
                    primaryBtnText:
                        DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.PRIMARY_BTN_TEXT,
                    secondaryBtnText:
                        DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_INACTIVE.SECONDARY_BTN_TEXT,
                    errorIcon: "icon-alert-upd",
                    dunningInactive: false,
                };
                popupShown = true;
                openRechargePopUp(history, data, detailPage);
            } else if (
                bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE &&
                isMBR
            ) {
                //binge subscription type is MBR FREE/ PAID (active)
                popupShown = !detailPage;
                let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
                !detailPage &&
                    store
                        .dispatch(dunningRecharge(userInfo.sId, userInfo.baId, false))
                        .then((res) => {
                            if (res?.code === 0) {
                                store.dispatch(hideMainLoader());
                                data = {
                                    header: DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_ACTIVE.HEADER,
                                    instructions: res?.data?.response
                                        ? res.data.response
                                        : DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_ACTIVE.INSTRUCTIONS,
                                    primaryBtnText:
                                        DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_ACTIVE.PRIMARY_BTN_TEXT,
                                    secondaryBtnText:
                                        DTH_BINGE_POPUP.DTH_ACTIVE_BINGE_ACTIVE.SECONDARY_BTN_TEXT,
                                    errorIcon: "icon-group-24",
                                    dunningInactive: true,
                                };
                                openRechargePopUp(history, data);
                            } else {
                                toggleLoginScreen();
                                safeNavigation(
                                    history,
                                    `/${URL.MY_SUBSCRIPTION}?source=${MIXPANEL.VALUE.LOGIN}`,
                                );
                                //loginUser(true, accountDetailList, openPopup, history, params);
                            }
                        })
                        .catch(() => {
                            toggleLoginScreen();
                            safeNavigation(
                                history,
                                `/${URL.MY_SUBSCRIPTION}?source=${MIXPANEL.VALUE.LOGIN}`,
                            );
                            //loginUser(true, accountDetailList, openPopup, history, params);
                        });
            } else {
                //binge is written off or any other case
                toggleLoginScreen();
                popupShown = !detailPage;

                !detailPage && bingeStatus?.toUpperCase() === ACCOUNT_STATUS.WRITTEN_OFF
                    ? safeNavigation(
                        history,
                        `/${URL.PACK_SELECTION}?source=${MIXPANEL.VALUE.LOGIN}`,
                    )
                    : safeNavigation(
                        history,
                        `/${URL.MY_SUBSCRIPTION}?source=${MIXPANEL.VALUE.LOGIN}`,
                    );
                //loginUser(true, accountDetailList, openPopup, history, params);
            }
        }
    } else if (dthStatus?.toUpperCase() === ACCOUNT_STATUS.TEMP_SUSPENSION) {
        let data = {};
        if (
            bingeStatus?.toUpperCase() === ACCOUNT_STATUS.WRITTEN_OFF ||
            isDBR ||
            (isMBR && freePack) ||
            (isMBR &&
                paidPack &&
                [
                    ACCOUNT_STATUS.DEACTIVATED,
                    ACCOUNT_STATUS.DEACTIVE,
                    ACCOUNT_STATUS.INACTIVE,
                ].includes(bingeStatus?.toUpperCase()))
        ) {
            //binge subscription type is (written off, DBR FREE (Active/ Inactive), DBR PAID (Active/ Inactive), MBR FREE (Active/ Inactive), MBR PAID (inactive))
            data = {
                header:
                    DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_WRITTEN_OFF_INACTIVE.HEADER,
                instructions:
                    DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_WRITTEN_OFF_INACTIVE
                        .INSTRUCTIONS,
                primaryBtnText:
                    DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_WRITTEN_OFF_INACTIVE
                        .PRIMARY_BTN_TEXT,
            };
            popupShown = true;
            tempSuspendedPopup(history, data, skipToHome);
        } else if (
            isMBR &&
            paidPack &&
            bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE
        ) {
            //binge subscription type is MBR PAID (active)
            data = {
                header: DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_MBR_PAID_ACTIVE.HEADER,
                instructions: `${DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_MBR_PAID_ACTIVE.INSTRUCTIONS} ${expiryDate}.`,
                primaryBtnText:
                    DTH_BINGE_POPUP.DTH_TEMP_SUSPENDED_BINGE_MBR_PAID_ACTIVE
                        .PRIMARY_BTN_TEXT,
            };
            popupShown = !detailPage;
            !detailPage && tempSuspendedPopup(history, data, skipToHome);
        }
    } else {
        toggleLoginScreen();
        redirectToHomeScreen(history);
        //loginUser(true, accountDetailList, openPopup, history, params);
    }

    return popupShown;
};

export const dthBingePopup = (
    history,
    { header, instructions, primaryBtnText, secondaryBtnText },
    skipToHome,
) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal inactive-alert",
            headingMessage: header,
            instructions: instructions,
            primaryButtonText: primaryBtnText,
            primaryButtonAction: async () => {
                store.dispatch(showMainLoader());
                let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
                await store.dispatch(quickRechargeBeforeLogin(userInfo.sId));
                const { packSelectionDetail } = store.getState();
                let quickRechargeSelfCareUrl = get(
                    packSelectionDetail,
                    "quickRechargeUrl",
                );
                if (
                    quickRechargeSelfCareUrl.code === 0 &&
                    !isEmpty(quickRechargeSelfCareUrl.data)
                ) {
                    trackRechargeEvent();
                    window.location.assign(
                        `${quickRechargeSelfCareUrl.data.rechargeUrl}`,
                    );
                    toggleLoginScreen();
                } else {
                    store.dispatch(hideMainLoader());
                }
            },
            secondaryButtonText: secondaryBtnText,
            secondaryButtonAction: () => {
                store.dispatch(closePopup());
                toggleLoginScreen();
                skipToHome && redirectToHomeScreen(history);
            },
            hideCloseIcon: true,
            errorIcon: "icon-alert-upd",
        }),
    );
};

export const openRechargePopUp = (
    history,
    {
        header,
        instructions,
        primaryBtnText,
        secondaryBtnText,
        errorIcon,
        dunningInactive,
    },
    fromPIPage,
) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal inactive-alert",
            headingMessage: header,
            instructions: instructions,
            primaryButtonText: primaryBtnText,
            primaryButtonAction: /*isUserloggedIn() ? */ () => {
                let search, state;

                if (fromPIPage) {
                    let pathname = window.location.pathname;
                    let source = getAnalyticsSource(pathname);
                    search = `?source=${MIXPANEL.VALUE.CONTENT}&aboutSubscription=true`;
                    state = {
                        subscription: "recharge",
                        dunning: !!dunningInactive,
                        source: source,
                        accountDropDown: fromPIPage,
                    };
                } else {
                    search = `?source=${MIXPANEL.VALUE.LOGIN}&aboutSubscription=true&contentRecharge=true`;
                    state = {
                        subscription: "recharge",
                        source: MIXPANEL.VALUE.LOGIN,
                        accountDropDown: true,
                    };
                }

                toggleLoginScreen();
                safeNavigation(history, {
                    pathname: `${URL.PACK_SELECTION}`,
                    search: search,
                    state: state,
                });
            } /*: () => {
            loginUser(false, accountDetailList, openPopup, history, params)
        },*/,
            secondaryButtonText: secondaryBtnText,
            secondaryButtonAction: () => {
                store.dispatch(closePopup());
                toggleLoginScreen();
                !fromPIPage && redirectToHomeScreen(history);
            },
            hideCloseIcon: true,
            errorIcon: errorIcon,
        }),
    );
};

export const tempSuspendedPopup = (
    history,
    { header, instructions, primaryBtnText },
    skipToHome,
) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal inactive-alert",
            headingMessage: header,
            instructions: instructions,
            primaryButtonText: primaryBtnText,
            primaryButtonAction: async () => {
                store.dispatch(closePopup());
                toggleLoginScreen();
                skipToHome && redirectToHomeScreen(history);
            },
            hideCloseIcon: true,
            errorIcon: "icon-alert-upd",
        }),
    );
};

/*export const closeAtvUpgradePopup = async() => {
    await store.dispatch(handleAtvUpgrade());
    closePopup();
};*/

export const switchAtvAcc = async (history) => {
    await store.dispatch(switchToAtvAccount());

    const { profileDetails } = store.getState();
    let switchAtcAccResponse = get(profileDetails, "switchAtcAccResponse");
    //after API call we will check if user has successfully switched or not,
    // if yes then we will update local store with new information

    if (
        switchAtcAccResponse &&
        switchAtcAccResponse?.code === 0 &&
        get(switchAtcAccResponse, "data.baId") !== null
    ) {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let baId = switchAtcAccResponse?.data?.baId;
        let defaultProfile = switchAtcAccResponse?.data?.defaultProfile
            ? switchAtcAccResponse.data.defaultProfile
            : userInfo.profileId;
        userInfo = {
            ...userInfo,
            baId: JSON.parse(baId),
            profileId: defaultProfile,
        };
        setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(userInfo));
        setKey(LOCALSTORAGE.ATV_UPGRADE, JSON.stringify(false));
        await store.dispatch(getProfileDetails());
        history.push(`${URL.DEFAULT}`);
    } else {
        toast("Error in switching to upgraded subscription.");
    }
};

export const showAtvUpgradePopup = (history) => {
    const { packSelectionDetail: { currentSubscription } = {} } =
        store.getState();
    const currentPackPrice = get(currentSubscription, "data.packPrice");
    let instructions;

    if (currentSubscription) {
        const {
            data: { packType },
        } = currentSubscription;
        if (packType.toLowerCase() === PACK_TYPE.FREE) {
            parseFloat(currentPackPrice) === 149
                ? (instructions =
                    "You have been upgraded to Tata Binge Premium with 1 month free trial linked to your Tata Play Binge+.")
                : (instructions =
                    "Your Tata Binge Premium subscription is now linked to your Tata Play Binge+.");
        } else {
            parseFloat(currentPackPrice) === 149
                ? (instructions =
                    "You have been upgraded to Tata Binge Premium with 1 month free trial linked to your Tata Play Binge+.")
                : (instructions =
                    "Your Tata Binge Premium subscription is now linked to your Tata Play Binge+.");
        }
        store.dispatch(
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: "alert-modal ",
                instructions: instructions,
                primaryButtonText: "OK",
                primaryButtonAction: () => switchAtvAcc(history),
                hideCloseIcon: true,
            }),
        );
    }
};

export const getMixpanelPeopleProperties = () => {
    const state = store.getState();
    let userData = get(state.profileDetails, "userProfileDetails", {});
    let currentSubscription = get(state.subscriptionDetails, "currentSubscription.data", {});
    let isFreemiumUser = checkCurrentSubscription(currentSubscription);
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
        firstName = "",
        lastName = "",
        email = "",
        subscriptionType = "",
        packCreationDate = "",
        sid = "",
        bingeAccountCount = 0,
        subscribed = MIXPANEL.VALUE.NO,
        deviceLoginCount = 0,
        firstTimeLoginDate = "",
        loginWith = "",
        planType,
        packPrice = "",
        packName = "",
        migrated = "",
        freeTrialAvailed = MIXPANEL.VALUE.NO,
        packRenewalDate = "",
        packEndDate = "",
        profileId = "",
        packStartDate = "",
        lastPackType = "",
        lastPackPrice = "",
        lastPackName = "",
        lastBillingType = "",
        totalPaidPackRenewal = "",
        firstPaidPackSubscriptionDate = "",
        mixpanelId = ""

    let deviceList = {};
    for (var i = 0; i < 4; i++) {
        deviceList[`DEVICE-${i + 1}`] = userInfo?.deviceList?.[i]?.deviceName || "";
    }

    if (!isEmpty(userInfo)) {
        firstName = userInfo.firstName;
        lastName = userInfo.lastName;
        sid = userInfo.sId;
        bingeAccountCount = userInfo.bingeAccountCount;
        deviceLoginCount = userInfo.deviceLoginCount;
        firstTimeLoginDate = userInfo.firstTimeLoginDate;
        subscriptionType = currentSubscription?.subscriptionType || "";
        packCreationDate = userInfo?.packCreationDate;
        loginWith = userInfo?.loginWith || 'RMN';
        email = userInfo.emailId;
        planType = currentSubscription?.subscriptionType;
        packPrice = currentSubscription?.amountValue || "";
        packName = currentSubscription?.productName || "";
        migrated = currentSubscription?.migrated || "";
        freeTrialAvailed = userInfo?.freeTrialAvailed;
        packRenewalDate = currentSubscription?.rechargeDue || "";
        packEndDate = currentSubscription?.expiryDate || "";
        profileId = userInfo?.profileId;
        packStartDate = userInfo?.packStartDate || "";
        lastPackType = userInfo?.lastPackType;
        lastPackPrice = userInfo?.lastPackPrice;
        lastPackName = userInfo?.lastPackName;
        lastBillingType = userInfo?.lastBillingType;
        totalPaidPackRenewal = userInfo?.totalPaidPackRenewal;
        firstPaidPackSubscriptionDate = userInfo?.firstPaidPackSubscriptionDate || "";
        mixpanelId = userInfo?.mixpanelId;
    }

    let mixpanelPeopleProperties = {
        ...deviceList,
        "FIRST-NAME": `${firstName}`,
        "LAST-NAME": lastName,
        "SID": sid,
        ...(userInfo?.dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER && { "TS-SID": sid }),
        ...(userInfo?.dthStatus !== DTH_TYPE.DTH_W_BINGE_OLD_USER && { "C-ID": userInfo?.bingeSubscriberId }),
        "RMN": loginWith === "RMN" ? userData?.rmn : userInfo?.rmn,
        "EMAIL": email,
        "FIRST-TIME-LOGIN": firstTimeLoginDate || "",
        "FIRST-LOGIN-DATE": firstTimeLoginDate || "",
        // "FIRE-TV":
        //     subscriptionType === SUBSCRIPTION_TYPE.ANDROID_STICK
        //         ? MIXPANEL.VALUE.YES
        //         : MIXPANEL.VALUE.NO,
        // "ATV":
        //     subscriptionType === SUBSCRIPTION_TYPE.ATV
        //         ? MIXPANEL.VALUE.YES
        //         : MIXPANEL.VALUE.NO,
        "BINGE-ACCOUNTS-COUNT": bingeAccountCount,
        // "SUBSCRIBED": subscribed,
        "LOGGED-IN-DEVICE-COUNT": deviceLoginCount,
        // "FREE-TRIAL": !isEmpty(planType)
        //     ? planType?.toLowerCase() === PACK_TYPE.FREE
        //         ? MIXPANEL.VALUE.YES
        //         : MIXPANEL.VALUE.NO
        //     : "",
        // "PACK-NAME": isFreemiumUser ? MIXPANEL.VALUE.FREEMIUM : packName,
        // "PACK-PRICE": isFreemiumUser ? MIXPANEL.VALUE.FREEMIUM : packPrice,
        // "SUBSCRIPTION-TYPE": !isEmpty(planType)
        //     ? subscriptionType
        //     : MIXPANEL.VALUE.UNSUBSCRIBED,
        // "BURN-RATE-TYPE": currentSubscription?.burnType || "",
        // "FREE-TRIAL-ELIGIBLE": freeTrialAvailed
        //     ? MIXPANEL.VALUE.NO
        //     : MIXPANEL.VALUE.YES,
        // "PACK-RENEWAL-DATE": isFreemiumUser ? "" : currentSubscription?.expiryDate,
        // "RENEWAL-DUE-DATE": isFreemiumUser ? "" : currentSubscription?.expiryDate,
        "LAST-USED-AT": new Date(),
        "LAST-APP-USAGE-DATE": new Date(),
        // "PACK-START-DATE": packStartDate,
        // "PACK-END-DATE": packEndDate,
        "PROFILE-ID": profileId,
        // "LAST-PACK-TYPE": isFreemiumUser ? MIXPANEL.VALUE.FREEMIUM : lastPackType,
        // "LAST-PACK-PRICE": isFreemiumUser ? MIXPANEL.VALUE.FREEMIUM : lastPackPrice,
        // "LAST-PACK-NAME": isFreemiumUser ? MIXPANEL.VALUE.FREEMIUM : lastPackName,
        // "LAST-BILLING-TYPE": lastBillingType,
        // "FIRST-PAID-PACK-SUBSCRIPTION-DATE": firstPaidPackSubscriptionDate,
        // "TOTAL-PAID-PACK-RENEWALS": totalPaidPackRenewal,
        // "DATE-OF-SUBSCRIPTION": packStartDate,
        // "FIRST-PACK-SUBSCRIPTION-DATE": firstPaidPackSubscriptionDate,
        "MIXPANEL-ID": mixpanelId,
        $distinctId: sid,
        $CleverTap_user_id: sid,
    };
    console.log('mixpanel People Properties', mixpanelPeopleProperties)
    return mixpanelPeopleProperties;
};

export const getIconInfo = (subscriptionInfo) => {
    let subscriptionType = get(subscriptionInfo, "subscriptionType"),
        complementaryPack = get(subscriptionInfo, "complementaryPlan");
    if (
        subscriptionType?.toUpperCase() === SUBSCRIPTION_TYPE.ANYWHERE &&
        (complementaryPack === "" || complementaryPack === null)
    ) {
        return bingeMobileAsset;
    } else {
        return bingeAsset;
    }
};

export const getPackInfo = () => {
    let result = getPartnerSubscriptionInfo();
    if (result) {
        let userAccountStatus = result?.subscriptionStatus;
        let nonSubscribedPartnerList = get(result, 'nonSubscribedPartnerList');
        let packExpired = userAccountStatus?.toUpperCase() !== SUBSCRIPTION_STATUS.ACTIVE;
        let partnerSubscription;
        if (result && result.hasOwnProperty("providers")) {
            partnerSubscription = get(result, "providers");
        } else if (result && result.hasOwnProperty("partnerSubscriptionsDetails")) {
            partnerSubscription = get(result, "partnerSubscriptionsDetails.providers");
        }
        return { packExpired, partnerSubscription, nonSubscribedPartnerList };
    }
    return false;
};

export const isPartnerSubscribed = (providerId) => {
    let subscribed = false;
    let { packExpired, nonSubscribedPartnerList } = getPackInfo();

    if (!packExpired && isEmpty(nonSubscribedPartnerList)) {
        subscribed = true;
    } else if (!packExpired && !isEmpty(nonSubscribedPartnerList)) {
        let nonSubscribedPartners = [];
        nonSubscribedPartnerList.map((i) => {
            nonSubscribedPartners.push(parseInt(i.partnerId));
        });
        subscribed = !nonSubscribedPartners.includes(parseInt(providerId));
    }
    return subscribed;
}


export const handlePubnubData = async (data, location) => {
    console.log("Received pubnub data", location);
    console.log("Received pubnub data", data);
    let logOutFired = JSON.parse(getKey(LOCALSTORAGE.LOGOUT_FIRED));
    let isSilentLoginInProgress = JSON.parse(getKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS)) === true;
    let referenceId = "";
    if (data && isUserloggedIn() && !logOutFired && !isSilentLoginInProgress) {
        /** --- start --- set dthStatus of local storage whenever a notification received from Pubnub**/
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let dthStatus = userInfo.dthStatus;
        let deviceInfo = data?.deviceInfo, deviceIndex;
       
        if( isSilentLogin(data)){
            await handleSilentLogin(data);
        }
        else{
            if (dthStatus !== DTH_TYPE.DTH_W_BINGE_OLD_USER) {
                userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
                userInfo = data && {
                    ...userInfo,
                    rmn: get(data, "mobileNumber"),
                    bingeSubscriberId: get(data, "accountId"),
                    dthStatus: get(data, "dthStatus"),
                    mixpanelId: get(data, "mixpanelId") || userInfo?.mixpanelId,
                };
                setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(userInfo));
                mixPanelConfig.setSuperProperties();
                mixPanelConfig.setGroup();
                mixPanelConfig.setGroupProperties();
                mixPanelConfig.setPeopleProperties();
                if (!isEmpty(deviceInfo)) {
                    let appDeviceId = getDeviceId();
                    deviceIndex = deviceInfo.findIndex(item => item.deviceId === appDeviceId);
                    let beRegisteredDevice = JSON.parse(getKey(LOCALSTORAGE.BE_REGISTERED_DEVICE)) === true;
                    if (deviceIndex < 0 && !beRegisteredDevice) {
                        if (window.location.pathname.includes(`/${URL.PLAYER}`)) {
                            store.dispatch(setPlayerAPIError(true));
                        } else {
                            openTimeoutPopup(history);
                        }
                        console.log(`Device removed: OTHER DTH STATUS || appDeviceId : ${appDeviceId}`)
                        console.log(`deviceInfo: ${deviceInfo}`)
                        setKey(LOCALSTORAGE.DEVICE_REMOVED, JSON.stringify(true));
                    }
    
                    let atvDeviceInfo = deviceInfo.find(
                        item => item.deviceId === appDeviceId,
                    );
                    atvDeviceInfo?.atvCancelled &&
                        setKey(LOCALSTORAGE.ATV_UPGRADE, atvDeviceInfo.atvCancelled);
                    referenceId = atvDeviceInfo?.referenceId;
                }
            }
    
            /** --- end --- **/
    
            if (dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER) {
                userInfo = data && {
                    ...userInfo,
                    rmn: get(data, "rmn"),
                    mixpanelId: get(data, "mixpanelId") || userInfo?.mixpanelId,
                };
                setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(userInfo));
    
                if (deviceInfo) {
                    let bingeData = deviceInfo.find(i => {
                        if (i.hasOwnProperty('baId')) {
                            return JSON.parse(i?.baId) === JSON.parse(userInfo.baId)
                        }
                        return false
                    });
                    let appDeviceId = getDeviceId();
                    deviceIndex = bingeData?.deviceList && bingeData.deviceList.findIndex(item => item === appDeviceId);
                    let beRegisteredDevice = JSON.parse(getKey(LOCALSTORAGE.BE_REGISTERED_DEVICE)) === true;
                    if (deviceIndex < 0 && !beRegisteredDevice) {
                        if (window.location.pathname.includes(`/${URL.PLAYER}`)) {
                            store.dispatch(setPlayerAPIError(true));
                        } else {
                            openTimeoutPopup();
                        }
                        console.log(`Device removed: ${DTH_TYPE.DTH_W_BINGE_OLD_USER} || appDeviceId : ${appDeviceId}`)
                        console.log(`deviceInfo: ${bingeData}`)
                        setKey(LOCALSTORAGE.DEVICE_REMOVED, JSON.stringify(true));
                    }
                    if (bingeData) {
                        referenceId = bingeData?.referenceId;
                        let atvDeviceInfo = bingeData.deviceDetails.find(item => item.deviceId === appDeviceId);
                        atvDeviceInfo?.atvCancelled && setKey(LOCALSTORAGE.ATV_UPGRADE, atvDeviceInfo.atvCancelled);
                    }
                }
            }
         
    
            await handleMixpanelOnPubnub(referenceId);
            await handleSubscriptionOnPubnub(data);
            handleDeviceOnPubnub();
            setPaymentStatusForPubnub(data);
            updateBingeListOnPubnub(data);
    
            // Whenever we receive notification from Pubnub set FS_POPUP true, this will execute code to open FS popup on home screen
            setKey(LOCALSTORAGE.SHOW_FS_POPUP, JSON.stringify(true));
            
        }
    }
};

export const handleSilentLogin = async (data, history) => {
    console.log('Silent Login In-Progress: Migration Journey 2')
    setKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS, JSON.stringify(true));
    removePubNubListener();
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    const payload = {
        baId: get(data, "baId"),
        bingeSubscriberId: get(data, "accountId"),
        dthStatus: get(data, "dthStatus"),
        subscriberId: get(data, "dthSubscriberId"),
        rmn: userInfo.rmn,
        userAuthenticateToken: userInfo.accessToken,
        deviceAuthenticateToken: userInfo.deviceToken,
        helpCenterSilentLogin: false,
        silentLoginEvent: get(data, 'silentLoginEvent'),
        silentLoginTimestamp: get(data, 'silentLoginTimestamp'),
    };
    await updateUser(payload, onLoginSuccess, history);
    let isSilentLoginInProgress = JSON.parse(getKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS)) === true;
    isSilentLoginInProgress && deleteKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS);
    console.log('Silent Login Completed: Migration Journey 2')
}

export const isSilentLogin = (data) => {
    let silentLoginTimestamp = data?.silentLoginTimestamp,
        localLoginTimeStamp = getKey(LOCALSTORAGE.SILENT_LOGIN_TIMESTAMP);
    return silentLoginTimestamp && (isEmpty(localLoginTimeStamp) || (parseInt(localLoginTimeStamp) !== parseInt(silentLoginTimestamp)));
}

export const handleMixpanelOnPubnub = async (referenceId) => {
    // fetch mixpanelId if doesn't exist for current user
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    if (referenceId && !userInfo?.mixpanelId) {
        await store.dispatch(fetchMixpanelId(referenceId));
        mixPanelConfig.setSuperProperties();
        mixPanelConfig.setPeopleProperties();
        mixPanelConfig.identifyUser(true);
    }
}

export const handleSubscriptionOnPubnub = (data) => {
    let deviceRemoved = JSON.parse(getKey(LOCALSTORAGE.DEVICE_REMOVED)) === true;
    !deviceRemoved && store.dispatch(getCurrentSubscriptionInfo());
    isSilentLogin(data) && store.dispatch(onManualLogin(firebase.VALUE.HOME));
}

export const handleDeviceOnPubnub = () => {
    const currentLocation = window.location.pathname;
    if (currentLocation.includes(URL.DEVICE_MANAGEMENT)) {
        store.dispatch(getSubscriberDeviceList());
    }
}

export const setPaymentStatusForPubnub = (data) => {
    const currentLocation = window.location.pathname;
    if (currentLocation.includes(URL.SUBSCRIPTION_TRANSACTION)) {
        let paymentStatus = data?.paymentStatus;
        paymentStatus?.toUpperCase() === OPEL_STATUS.SUCCESS && store.dispatch(setPaymentStatusFromPubnub());
    }
}

export const updateBingeListOnPubnub = (data) => {
    if (!isEmpty(data?.bingeList)) {
        let bingeList = data.bingeList;
        let added = bingeList?.added;
        let removed = bingeList?.removed;
        let savedList = JSON.parse(getKey(LOCALSTORAGE.WATCHLIST)) || [];

        if (!isEmpty(added)) {
            let duplicateData = savedList.find(i => i === parseInt(added));
            if (!duplicateData) {
                savedList = [...savedList, ...added];
            }
        }
        if (!isEmpty(removed)) {
            removed = removed.map(Number);
            savedList = savedList.filter(v => {
                return !removed.includes(v);
            });
        }
        savedList = savedList.map(Number);
        setKey(LOCALSTORAGE.WATCHLIST, JSON.stringify(savedList));
    }
}

export const getMaxHeightForMobile = () => {
    let appWidth = document.getElementById("app").clientWidth;
    let appHeight = screen.height,
        height;
    if (isMobile.any() && (appWidth <= 320 || appWidth <= 812)) {
        height = appHeight - 576;
        return height > 234 ? height : 234;
    }
};

export const switchAccount = async (
    selectedItemDetail,
    currentBingeAccount,
    history,
    setUpdatedBaId,
    switchAccountWebLarge = true,
    e,
    resetState,
) => {
    const handleCancelledUser = getDeviceStatus();
    handleCancelledUser && store.dispatch(closePopup());
    let payload = {
        sourceBaId: currentBingeAccount,
        targetBaId: selectedItemDetail.baId,
        deviceId: getDeviceId(),
    };
    if (selectedItemDetail.baId === null) {
        payload.dsn = selectedItemDetail.deviceSerialNumber;
    }
    store.dispatch(postSwitchAccountReq(payload)).then(async (response) => {
        if (response && response.code === 0) {
            mixPanelConfig.unsetSuperProperties();
            let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
            let baId = selectedItemDetail.baId;
            let defaultProfile = selectedItemDetail.defaultProfile;
            if (selectedItemDetail.baId === null) {
                baId = response?.data?.baId;
                defaultProfile = response?.data?.defaultProfile;
            }
            userInfo = { ...userInfo, baId: baId, profileId: defaultProfile };
            setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(userInfo));

            //fetch mixpanelId
            const { mixpanelId } = response?.data;
            if (!mixpanelId) {
                await store.dispatch(fetchMixpanelId());
            }

            mixPanelConfig.setSuperProperties();
            mixPanelConfig.setPeopleProperties();
            mixPanelConfig.identifyUser(true);

            setUpdatedBaId && setUpdatedBaId(baId);
            store.dispatch(getProfileDetails(true));
            store.dispatch(getCurrentSubscriptionInfo(false));
            store.dispatch(subscriberListing(userInfo.rmn));
            setDeviceStatus(false);
            trackSwitchAccountEvents();
            switchAccountWebLarge && resetState();
            showSuccessToast(selectedItemDetail.aliasName);
        } else if (response && response.code === 200007) {
            store.dispatch(
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: "alert-modal",
                    headingMessage: get(response, "message", COMMON_ERROR.SOME_ERROR),
                    primaryButtonText: "Ok",
                    primaryButtonAction: () =>
                        handleSwitchAccDeviceLimitError(
                            handleCancelledUser,
                            switchAccountWebLarge,
                            e,
                            history,
                        ),
                    closeModal: true,
                    onCloseAction: () => callLogOut(true, history),
                    hideCloseIcon: true,
                }),
            );
        } else {
            store.dispatch(
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: "alert-modal",
                    instructions: get(response, "message", COMMON_ERROR.SOME_ERROR),
                    primaryButtonText: "Ok",
                    closeModal: true,
                    hideCloseIcon: true,
                }),
            );
        }
        //switchAccountWebLarge && e && toggleHeaderDropdown(e, "AccountDropdown");
    });
};

export const showSuccessToast = (deviceName) => {
    !!deviceName &&
        toast(
            <div className="login-body-container">
                <div className="login-success-image">
                    <img src={`../../assets/images/success-tick.png`} alt="" />
                </div>
                <div className="login-success-text">
                    <div>{`Now using ${deviceName}`}</div>
                </div>
            </div>,
            {
                position: toast.POSITION.BOTTOM_CENTER,
                className: "login-toast-wrapper switch-toast",
                autoClose: 3000,
            },
        );
};

export const trackSwitchAccountEvents = () => {
    mixPanelConfig.profileChanges();
    moengageConfig.profileChanges();

    let userInformation = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SWITCH_PROFILE, {
        [`${MIXPANEL.PARAMETER.TO_BAID}`]: userInformation.baId,
    });
    moengageConfig.trackEvent(MOENGAGE.EVENT.SWITCH_PROFILE, {
        [`${MOENGAGE.PARAMETER.TO_BAID}`]: userInformation.baId,
    });
};

export const ftvWOEvents = (ftvOrder, installationMethod) => {
    let orderedFtv = ftvOrder ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO;
    let orderType = ftvOrder
        ? installationMethod === "fs-diy"
            ? MIXPANEL.VALUE.INSTALLER_DIY
            : MIXPANEL.VALUE.INSTALLER_FSD
        : "";

    let mixpanelData = {
        [`${MIXPANEL.PARAMETER.ORDERED_FTV}`]: orderedFtv,
        [`${MIXPANEL.PARAMETER.FTV_ORDER_TYPE}`]: orderType,
    },
        moengageData = {
            [`${MOENGAGE.PARAMETER.ORDERED_FTV}`]: orderedFtv,
            [`${MOENGAGE.PARAMETER.FTV_ORDER_TYPE}`]: orderType,
        };

    mixPanelConfig.trackEvent(MIXPANEL.EVENT.FTV_WO, mixpanelData);
    moengageConfig.trackEvent(MOENGAGE.EVENT.FTV_WO, moengageData);
};

export const handleSwitchAccDeviceLimitError = (
    handleCancelledUser,
    switchAccountWebLarge,
    e,
    history,
) => {
    if (handleCancelledUser) {
        callLogOut(true, history);
    } else {
        store.dispatch(closePopup());
    }
};

export const getShemarooUniqueId = () => {
    if (!getKey(LOCALSTORAGE.SHEMAROO_UNIQUE_ID)) {
        let uniqueId = new Date().getTime();
        setKey(LOCALSTORAGE.SHEMAROO_UNIQUE_ID, uniqueId);
    } else {
        return getKey(LOCALSTORAGE.SHEMAROO_UNIQUE_ID);
    }
};

export const getShemarooAnalyticsData = ({
    shemarooAnalyticsUserId,
    idSiteValue,
    smartUrl,
    e_n,
    e_a,
    e_v,
    dimension2,
    dimension5,
    dimension15,
    dimension16,
    dimension17,
    dimension23,
}) => {
    return {
        _id: shemarooAnalyticsUserId,
        idsite: idSiteValue,
        rand: new Date().getTime(),
        url: smartUrl,
        pv_id: getShemarooUniqueId(),
        e_n: e_n,
        e_a: e_a,
        e_v: e_v,
        e_c: "media",
        rec: 1,
        dimension1: "tata-sky",
        dimension2: dimension2,
        dimension5: dimension5,
        dimension15: dimension15,
        dimension16: dimension16,
        dimension17: dimension17,
        dimension23: dimension23,
        dimension25: "IN",
    };
};

export const toggleLoginScreen = () => {
    const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    user_info["showLoginScreen"] = false;
    setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(user_info));
};

export const detectSwipe = (className, func, deltaMin = 90, data) => {
    const swipe_det = {
        sX: 0,
        sY: 0,
        eX: 0,
        eY: 0,
    };
    let direction = null;
    const el = document.getElementsByClassName(className)[0];
    el?.addEventListener(
        "touchstart",
        function (e) {
            const t = e.touches[0];
            swipe_det.sX = t.screenX;
            swipe_det.sY = t.screenY;
        },
        false,
    );
    el?.addEventListener(
        "touchmove",
        function (e) {
            // Prevent default will stop user from scrolling, use with care
            // e.preventDefault();
            const t = e.touches[0];
            swipe_det.eX = t.screenX;
            swipe_det.eY = t.screenY;
        },
        false,
    );
    el?.addEventListener(
        "touchend",
        function (e) {
            const deltaX = swipe_det.eX - swipe_det.sX;
            const deltaY = swipe_det.eY - swipe_det.sY;
            // Min swipe distance, you could use absolute value rather
            // than square. It just felt better for personnal use
            if (deltaX ** 2 + deltaY ** 2 < deltaMin ** 2) return;
            // horizontal
            if (deltaY === 0 || Math.abs(deltaX / deltaY) > 1)
                direction = deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            // vertical
            else direction = deltaY > 0 ? DIRECTIONS.UP : DIRECTIONS.DOWN;

            if (direction && typeof func === "function") func(el, direction, data);

            direction = null;
        },
        false,
    );
};

export const unmountSwipeEvents = (className) => {
    const el = document.getElementsByClassName(className)[0];
    el.removeEventListener("touchstart", (d) => {
    });
    el.removeEventListener("touchmove", (d) => {
    });
    el.removeEventListener("touchend", (d) => {
    });
};

export const convertTimeString = (duration) => {
    let time = duration && duration.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    let seconds = +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
    if (seconds === 0) {
        return "";
    }

    const hours = Math.floor(seconds / 3600);
    const minute = Math.floor((seconds % 3600) / 60);

    let returnString = "";
    if (hours > 0) {
        returnString += hours.toString() + "h ";
    }
    if (minute > 0) returnString += minute.toString() + "m ";

    return returnString;
};

export const settingsRedirection = (dimensions, history) => {
    let redirectionUrl =
        dimensions.width >= TAB_BREAKPOINT
            ? `/${URL.SETTING}/profile`
            : `/${URL.SETTING}`;
    safeNavigation(history, redirectionUrl);
};

export const handleRedirectionOnClick = async (item, history, openPopup, closePopup, openLoginPopup, dimensions) => {
    const currentPath = getKey(LOCALSTORAGE.CURRENT_PATH);
    const state = store.getState();
    let checkSubscriptionStatus = checkCurrentSubscription(get(state.subscriptionDetails, "currentSubscription.data"))
    if ((item.linkToRedirect === URL.SUBSCRIPTION || (item.linkToRedirect === URL.SUBSCRIPTION && isUserloggedIn())) && checkSubscriptionStatus) {
        await store.dispatch(checkFallbackFlow())
        let isManagedApp = get(state.headerDetails, "isManagedApp")
        let enableTickTickJourney = get(state.headerDetails, "configResponse.data.config.enableTickTickJourney");
        !isManagedApp ?  safeNavigation(history, {
            pathname: `/${item.linkToRedirect}`,
            state: {
                subscriptionRenderCallback: currentPath.includes(item.linkToRedirect),
                source: item?.pageName
            },
        }) :  (
        (enableTickTickJourney ?
            await loginInFreemium({
                openPopup, closePopup, openLoginPopup, source: item.mobileView ? firebase.VALUE.HAMBURGER_SUBSCRIBE : firebase.VALUE.HOME_SUBSCRIBE, ComponentName: MINI_SUBSCRIPTION.SELECTION_DRAWER
            })
            : redirectToMangeApp(MIXPANEL.VALUE.HOME)
            ))
    } else if (isUserloggedIn()) {
        if (item.linkToRedirect) {
            if (item?.firstLabel === 'Settings') {
                settingsRedirection(dimensions, history);
            } else {
                if (item.linkToRedirect === URL.SUBSCRIPTION) {
                    safeNavigation(history, {
                        pathname: `/${item.linkToRedirect}`,
                        state: {
                            subscriptionRenderCallback: currentPath.includes(item.linkToRedirect),
                            source: item?.pageName
                        },
                    })
                }
                else {
                    safeNavigation(history, `/${item.linkToRedirect}`);
                }

            }
        } else if (!item.linkToRedirect) {
            if (item.funcClick) {
                item.funcClick();
            } else if (item.redirectionUrl) {
                window.open(item.redirectionUrl, '_blank');
            }
        }
    } else {
        let getSource = FIREBASE.VALUE.SUBSCRIBE;
        if (item.linkToRedirect) {
            if (item.accessBeforeLogin) {
                safeNavigation(history, `/${item.linkToRedirect}`);
            } else {
                console.log('login func calling');
                await loginInFreemium({
                    openPopup,
                    closePopup,
                    openLoginPopup,
                    source: FIREBASE.VALUE.HOME,
                    getSource,
                    ComponentName: MINI_SUBSCRIPTION.LOGIN,
                    fromLogin: true
                });
            }
        } else if (!item.linkToRedirect) {
            if (item.redirectionUrl) {
                window.open(item.redirectionUrl, '_blank');
            } else {
                console.log('login func calling');
                await loginInFreemium({
                    openPopup,
                    closePopup,
                    openLoginPopup,
                    source: FIREBASE.VALUE.HOME,
                    getSource,
                    ComponentName: MINI_SUBSCRIPTION.LOGIN,
                });
            }
        }
    }
};

export const showToast = (message) => {
    toast(message, {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        className: "hide-close login-toast-wrapper",
    });
};
export const showlogoutToast = (response) => {
    toast(
        <div className="login-body-container">
            <span className="icon-logout" />
            <div className="login-success-text">
                <div>{response}</div>
            </div>
        </div>
        ,
        {
            position: "bottom-center",
            autoClose: 2000,
            closeOnClick: true,
            className: "login-toast-wrapper",
        },
    );
};

export const accountRefresh = async () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let state = store.getState();
    if (userInfo.dthStatus === DTH_TYPE.NON_DTH_USER || userInfo.dthStatus === DTH_TYPE.DTH_W_BINGE_NEW_USER) {
        await store.dispatch(getProfileDetails(true));
        await store.dispatch(refreshAccount());
        let userData = get(state.profileDetails, "userProfileDetails", {});
        let accountRefreshCode = get(state.headerDetails, "accountRefresh.code", {});

        if (accountRefreshCode === 0 && !isEmpty(userData)) {
            showToast(MESSAGE.ACCOUNT_REFRESH_SUCCESSFUL);
        }
    }
    if (userInfo.dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER) {
        await store.dispatch(refreshAccountOldStack());
        await store.dispatch(getBalanceInfo(true));
        state = store.getState();
        let getBalanceCode = get(state.packSelectionDetail, "balanceInfo.code");
        let accountRefreshOldStackCode = get(state.headerDetails, "accountRefreshOldStack.code");
        if (accountRefreshOldStackCode === 0 && getBalanceCode === 0) {
            showToast(MESSAGE.ACCOUNT_REFRESH_SUCCESSFUL);
        }
    }
};

export const confirmLogoutPopup = ({ history }) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "logout-modal-container",
            headingMessage: MESSAGE.DEVICE_LOGOUT_HEADING,
            hideCloseIcon: true,
            instructions: MESSAGE.LOGOUT_INSTRUCTION,
            primaryButtonText: MESSAGE.LOGOUT_PRIMARY_BTN,
            imageUrl: MESSAGE.LOGOUT_ICON_URL,
            isCloseModal: false,
            secondaryButtonText: MESSAGE.LOGOUT_SECONDARY_BTN,
            primaryButtonAction: async () => {
                await callLogOut(true, history);
                store.dispatch(closePopup());
            },
            secondaryButtonAction: () => {
                store.dispatch(closePopup());
            },
        }),
    );
};

export const showWatchlistToast = (response) => {
    toast(
        <div className="toast-wrapperr">
            <img src={`../../assets/images/Success-tick.png`} alt="" />
            <p>{`${response.data.count} items removed from Binge List`}</p>
        </div>,
        {
            position: "bottom-center",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
        },
    );
};

export let isNonSubscribedPartnerList = (provider) => {
    let { nonSubscribedPartnerList } = getPackInfo();
    const nonSubscribedPartnerLists = nonSubscribedPartnerList?.filter((val) => val.partnerName.toLowerCase() === provider.toLowerCase());
    return nonSubscribedPartnerLists?.length > 0;
};

export const showCrown = (item) => {
    let state = store.getState();
    let subscriptionDetails = get(state, "subscriptionDetails.currentSubscription.data");
    const isPartnerNotSubscribed = isEmpty(subscriptionDetails) ? true : !checkPartnerSubscribed(subscriptionDetails, item?.partnerId, item?.provider);
    const premiumSubscription = !item?.partnerSubscriptionType || (item?.partnerSubscriptionType?.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase());
    return isPartnerNotSubscribed && item.provider.toLowerCase() !== PROVIDER_NAME.TATASKY && (premiumSubscription || (item.provider.toLowerCase() === PROVIDER_NAME.PRIME));
}

export const isFreeContentMixpanel = (item) => {
    const premiumSubscription = item?.partnerSubscriptionType?.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase();
    return premiumSubscription ? MIXPANEL.VALUE.NO : MIXPANEL.VALUE.YES;
}

export const generateUuidV4String = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const getUserSelectedLanguages = async () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    const { baId, rmn: mobileNumber, sId: bingeSubscriberId, profileId } = userInfo;
    const header = { profileId }
    const body = { baId, bingeSubscriberId, mobileNumber };

    await store.dispatch(fetchUserSelectedData(header, body));

    const state = store.getState();
    const selectedLanguages = get(state, 'languages.selectedLanguage.data');
    const filter = selectedLanguages?.profileList?.filter(filter => (
        filter.profileId === header.profileId
    ));
    return filter ? filter[0].preferredLanguages : null;
}

export const setSavedLanguages = async () => {
    if (isUserloggedIn()) {
        let savedLanguages = await getUserSelectedLanguages();
        setKey(LOCALSTORAGE.PREFERRED_LANGUAGES, savedLanguages)
    }
}

export const categoryDropdownHeader = (location) => {
    let { pathname } = location;
    const urlArr = pathname?.split("/");
    return urlArr[1] === BOTTOM_SHEET.CATEGORIES.toLowerCase() &&
        window.innerWidth <= TAB_BREAKPOINT;
};

export const deletePaymentKeysFromLocal = () => {
    deleteKey(LOCALSTORAGE.TRANSACTION_ID);
    deleteKey(LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE);
    deleteKey(LOCALSTORAGE.PAYMENT_ERROR_STATUS_VERBIAGE);
    deleteKey(LOCALSTORAGE.SUBSCRIPTION_CHANGE_TYPE);
    deleteKey(LOCALSTORAGE.PI_DETAIL_URL);
}

export const handlePaymentSDKPrefetch = () => {
    let state = store.getState();
    let configResponse = get(state.headerDetails, "configResponse")
    let paymentPayloadInfo = get(configResponse, 'data.config.paymentGatewayInfo');
    let uuid = generateUuidV4String();
    const preFetchPayload = {
        requestId: uuid,
        service: paymentPayloadInfo?.paymentServiceId,
        payload: {
            clientId: paymentPayloadInfo?.paymentClientId,
        },
    };
    console.log('preFetchPayload', preFetchPayload);
    window?.HyperServices.preFetch(preFetchPayload);
}


export const getTimeline = item => {
    let state = store.getState();
    let episodeDetailsData = get(state.seasonReducer, "episodeDetails.data", []);
    let episodeData = episodeDetailsData.find(episode => episode?.contentId === item?.id);
    if (episodeData) {
        let { durationInSeconds, secondsWatched } = episodeData;
        durationInSeconds = durationInSeconds ? parseInt(durationInSeconds) : 0;
        secondsWatched = secondsWatched ? parseInt(secondsWatched) : 0;
        return secondsWatched === 0 ? 0 : (secondsWatched / durationInSeconds) * 100;
    } else {
        return 0;
    }
}

/**
 * @function getTARecommendationHeader - Get header for All TA Recommendattion APIS
 */
export const getTARecommendationHeader = () => {
    const state = store.getState();
    let bingeProduct = get(state.subscriptionDetails, 'currentSubscription.data') === null
        ? 'FREE'
        : get(state.subscriptionDetails, 'currentSubscription.data.bingeProduct');
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let header;
    if (isUserloggedIn()) {
        let baId = get(userInfo, 'dthStatus') === DTH_TYPE.NON_DTH_USER ? get(userInfo, 'baId') : null;
        header = {
            dthStatus: get(userInfo, 'dthStatus'),
            subscriberId: get(userInfo, 'sId'),
            profileId: get(userInfo, 'profileId'),
            baId,
            bingeProduct,
            platform: "binge_anywhere_web",
            authorization: get(userInfo, 'accessToken'),
            ...getTickTickHeaders()
        }
    } else {
        header = {
            dthStatus: DTH_TYPE.GUEST,
            profileId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            platform: "binge_anywhere_web",
        }
    }
    return header;
}

export const getTickTickHeaders = () => {
    const state = store.getState();
    let currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data')
    if (!isEmpty(currentSubscription) && currentSubscription !== null && currentSubscription?.flexiPlan) {
        let componentList = getComponentList(currentSubscription);
        let partnerList = componentList?.partnerList;
        let filterList = partnerList ? partnerList.map(data => data.partnerName) : [];
        return {
            ticktick: true,
            partners: filterList?.join(',')
        }
    }
    return { ticktick: false }
}


/**
 * @function getTARecommendationBaseURL - get Base URL for All TA Recommendattion APIS
 */
export const getTARecommendationBaseURL = () => {
    let TA_ROUTE = isUserloggedIn() ? ENV_CONFIG.TA_RECOMMENDATION : ENV_CONFIG.TA_GUEST_RECOMMENDATION;
    // return 'https://tatasky-uat-tsmore-kong.videoready.tv/'
    // return 'https://uat-tb.tapi.videoready.tv/'
    return `${ENV_CONFIG.API_BASE_URL}${TA_ROUTE}`;
}

/**
 * @function sortBrowseOrderByTARecommendation - Get sorted filters with Respect to TA Recommended filters
 */
export const sortBrowseOrderByTARecommendation = (array, myorder, key) => {
    let order = myorder.reduce((r, k, i) => {
        return r[k.toLowerCase()] = i + 1, r
    }, {});
    return array.sort((a, b) => (order[a[key]?.toLowerCase()] || Infinity) - (order[b[key]?.toLowerCase()] || Infinity))
}

/**
 * @function getBrowseByData - Get Browse by lang & Genre filters in a order suggested by TA
 * @param response : Array containing genre or language rails
 */
export const getBrowseByData = async (response) => {
    let languageIndex = response?.data?.items.findIndex(element => element.sectionSource === SECTION_SOURCE.LANGUAGE);
    let genreIndex = response?.data?.items.findIndex(element => element.sectionSource === SECTION_SOURCE.GENRE);
    response = await getBrowseByTAOrderedData(languageIndex, response, BROWSE_TYPE.LANGUAGE);
    response = await getBrowseByTAOrderedData(genreIndex, response, BROWSE_TYPE.GENRE);
    return response;
};

/**
 *
 * @param index
 * @param response
 * @param browseBy
 * @returns {Promise<*>}
 */
export const getBrowseByTAOrderedData = async (index, response, browseBy) => {
    if (index < 0) {
        return response;
    }
    // API CALL FOR TA FILTERS
    let payload = {
        browseByType: browseBy,
        layout: LAYOUT_TYPE.LANDSCAPE,
    }
    await fetchTARecommendedFilterOrder(payload);
    let state = store.getState();
    let isGenreFilter = browseBy?.toLowerCase() === BROWSE_TYPE.GENRE.toLowerCase();
    let taRecommendedFilterOrder = isGenreFilter ? get(state, 'browseBy.taRecommendedGenreOrder') : get(state, 'browseBy.taRecommendedLangOrder');
    let arrayToSort = [...get(response.data.items[index], 'contentList')];
    let expectedOrder = [...new Set(get(taRecommendedFilterOrder, 'contentList'))];
    let sortedFilterArr = sortBrowseOrderByTARecommendation(arrayToSort, expectedOrder, 'title');
    response.data.items[index].contentList = [...sortedFilterArr];
    return response;
};

/**
 * @function getSearchDataForLangOrGenre - Get BrowseBy data from TA API
 * @param langFilters : language filter
 * @param genreFilter : genre filter
 *
 */
const getSearchDataForLangOrGenre = (langFilters, genreFilter) => {
    let state = store.getState();
    let { taRecommendedSearchData, taRecommendedSearchGenre, taRecommendedSearchLang } = get(state, 'browseBy');
    let onlyBrowseByGenreData = !isEmpty(genreFilter) && isEmpty(langFilters);
    let onlyBrowseByLangData = isEmpty(genreFilter) && !isEmpty(langFilters);
    let taRecommededData = onlyBrowseByGenreData
        ? get(taRecommendedSearchGenre, 'contentList')
        : onlyBrowseByLangData
            ? get(taRecommendedSearchLang, 'contentList')
            : get(taRecommendedSearchData, 'contentList');
    return taRecommededData || [];
}

/**
 * @param searchResponseArr
 * @param filters
 * @returns {Promise<*[]>}
 */
export const appendTASearchContent = async (searchResponseArr, filters) => {
    let { filterGenre, filterLanguage, pageNumber, freeToggle } = filters;
    let langFilters = filterLanguage && filterLanguage[0], genreFilter = filterGenre && filterGenre[0];
    let browseByData = [];

    if (isEmpty(langFilters) && isEmpty(genreFilter)) {
        return searchResponseArr
    }
    //Fetch TA recommended data for filters
    let payload = {
        langFilters,
        genreFilter,
        freeToggle,
        layout: LAYOUT_TYPE.LANDSCAPE,
        max: TA_MAX_CONTENT.TA_MAX,
    }
    pageNumber === 1 && await fetchTARecommendedSearchData(payload);

    let taRecommededData = langFilters || genreFilter ? getSearchDataForLangOrGenre(langFilters, genreFilter) : [];

    if (!isEmpty(taRecommededData) && pageNumber === 1) {
        browseByData = [...taRecommededData]
    }

    for (let i = 0; i < searchResponseArr.length; i++) {
        let item = searchResponseArr[i]
        let itemInBrowseList = taRecommededData.find(data => data.id === item.id)
        if (!itemInBrowseList) {
            browseByData.push(item);
        }
    }
    return browseByData;
}

export const getClientIPDetails = async () => {
    await store.dispatch(getClientIP(true));
}

/**
 * @function getContinueWatchingHeader - Get header for All Continue watching APIS
 */
export const getContinueWatchingHeader = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let accessToken = userInfo.accessToken;
    let header;

    if (isUserloggedIn()) {
        header = {
            locale: "IND",
            deviceId: getDeviceId(),
            deviceType: "WEB",
            platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
            ...getCommonHeaders(`bearer ${accessToken}`)
        };
    } else {
        header = {
            'g-auth-token': getKey(LOCALSTORAGE.G_AUTH_TOKEN),
            'anonymousId': getKey(LOCALSTORAGE.ANONYMOUS_ID),
        };
    }
    return header;
};

export const classNameToApply = (classname, viewType, view) => {
    if (view === viewType) {
        return classname
    }
}

export const trackRechargeEvent = () => {
    appsFlyerConfig.trackEvent(APPSFLYER.PARAMETER.RECHARGE)
}

export const loadScript = (url, scriptId, onLoad = () => {
}) => {
    const loadedScript = document.getElementById(scriptId);
    if (loadedScript) {
        onLoad();
        return;
    }
    const scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.id = scriptId;
    scriptTag.onload = onLoad;
    document.body.appendChild(scriptTag);
}
export const loadLinktag = (url, linkId, onLoad = () => {
}) => {
    const loadedLink = document.getElementById(linkId);
    if (loadedLink) {
        onLoad();
        return;
    }
    const linkTag = document.createElement('link');
    linkTag.href = url;
    linkTag.id = linkId;
    linkTag.rel = 'stylesheet';
    linkTag.type = 'text/css';
    linkTag.onload = onLoad;
    document.head.appendChild(linkTag);
}
export const playContentEventTrack = (props) => {
    const {
        taShowType,
        vodTitle,
        provider,
        duration,
        partnerSubscriptionType,
    } = props;
    appsFlyerConfig.trackEvent(
        APPSFLYER_CONTENT_PLAY_EVENTS[partnerSubscriptionType],
        {
            [APPSFLYER.PARAMETER.CONTENT_TITLE]: vodTitle,
            [APPSFLYER.PARAMETER.CONTENT_TYPE]: taShowType,
            [APPSFLYER.PARAMETER.DURATION_SECONDS]: duration,
            [APPSFLYER.PARAMETER.DURATION_MINUTES]: (
                Number(duration) / 60
            ).toFixed(2),
            [APPSFLYER.PARAMETER.PARTNER_NAME]: provider,
        }
    );
};

export const isFreeContentEvent = (contractName, subscribedEntitleMents, partnerId, subscriptionStatus) => {
    if (contractName) {
        switch (contractName) {
            case CONTRACT.RENTAL:
                return true;
            case CONTRACT.CLEAR:
            case CONTRACT.FREE:
            case CONTRACT.SUBSCRIPTION: {
                if (subscriptionStatus === ACCOUNT_STATUS.ACTIVE && !(subscribedEntitleMents.length < 0)) {
                    if (subscribedEntitleMents.some((val) => val.partnerId === partnerId)) {
                        return true
                    }
                }
            }
                break;
            default:
                return true
        }
    }
    return false
}

export const _base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    console.log(binary_string)
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export const getPackModificationType = (selectedPlan, currentSubscription = {}, analytics = APPSFLYER) => {
    const { amountValue: currentPackPrice, status, expiredWithinSixtyDays, cancelled } = currentSubscription;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let dummyUserCondition = ((userInfo?.dummyUser || !userInfo.freeTrialAvailed) && userInfo?.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE);
    let modType = '';
    let isRenew = ([ACCOUNT_STATUS.DEACTIVATED, ACCOUNT_STATUS.DEACTIVE, ACCOUNT_STATUS.WRITTEN_OFF].includes(status)
        && cancelled && expiredWithinSixtyDays) || dummyUserCondition || (parseFloat(currentPackPrice) === parseFloat(selectedPlan.amountValue))

    if (parseFloat(currentPackPrice) > parseFloat(selectedPlan.amountValue)) {
        modType = analytics.VALUE.DOWNGRADE;
    } else if (parseFloat(currentPackPrice) < parseFloat(selectedPlan.amountValue)) {
        modType = analytics.VALUE.UPGRADE;
    } else if (isRenew) {
        modType = analytics.VALUE.RENEW;
    } else {
        modType = MIXPANEL.VALUE.FRESH
    }

    return modType;

}

export const getMixpanelSubscriptionAnalyticsData = (selectedPack, currentSubscription, source, analytics = MIXPANEL) => {
    const isFirstSubscription = checkCurrentSubscription(currentSubscription);
    const modType = !isFirstSubscription ? getPackModificationType(selectedPack, currentSubscription, analytics) : "";
    const subscriptionJourneySource = source || '';
    return {
        [analytics.PARAMETER.PACK_NAME]: selectedPack?.productName || '',
        [analytics.PARAMETER.PACK_PRICE]: selectedPack?.amountValue || '',
        [analytics.PARAMETER.MOD_TYPE]: modType || '',
        [analytics.PARAMETER.SOURCE]: getAnalyticsSource(subscriptionJourneySource, analytics),
        [analytics.PARAMETER.PACK_TYPE]: MIXPANEL.VALUE.PAID,
        [analytics.PARAMETER.EXISTING_PACK_NAME]: currentSubscription?.productName || MIXPANEL.VALUE.FREEMIUM,
        [analytics.PARAMETER.EXISTING_PACK_PRICE]: currentSubscription?.amountValue || MIXPANEL.VALUE.FREEMIUM,
        [analytics.PARAMETER.EXISTING_PACK_TYPE]: currentSubscription?.productName ? MIXPANEL.VALUE.PAID : MIXPANEL.VALUE.FREE,
        [analytics.PARAMETER.EXISTING_PACK_TENURE]: getCurrentSubscriptionTenureType(currentSubscription),
        [analytics.PARAMETER.PACK_TENURE]: selectedPack?.tenure?.[0]?.tenureType || "",
        [analytics.PARAMETER.FIRST_SUBSCRIPTION]: isFirstSubscription ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
    }
}

export const trackMixpanelSubsciptionInitiate = (selectedPlan, currentSubscription, source) => {
    const mixpanelData = getMixpanelSubscriptionAnalyticsData(selectedPlan, currentSubscription, source, MIXPANEL);
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_INITIATE, mixpanelData);
}

export const trackMixpanelSubscriptionFailed = (instructions, paymentMethod = MIXPANEL.VALUE.PG) => {
    const subscriptionDetails = JSON.parse(getKey(LOCALSTORAGE.SUBSCRIPTION_SELECTED_PACK));
    const previousSubscription = JSON.parse(getKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS))
    const analyticsData = getMixpanelSubscriptionAnalyticsData(subscriptionDetails, previousSubscription, '');
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_FAILED, {
        ...analyticsData,
        [MIXPANEL.PARAMETER.PAYMENT_TYPE]: getPaymentType(subscriptionDetails.paymentMode),
        [MIXPANEL.PARAMETER.PAYMENT_METHOD]: paymentMethod,
        [MIXPANEL.PARAMETER.REASON]: instructions,
    });
}

export const trackMixpanelSubscriptionSuccess = (currentSubscription, paymentMethod = MIXPANEL.VALUE.PG) => {
    const previousSubscription = JSON.parse(getKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS));
    const analyticsData = getMixpanelSubscriptionAnalyticsData(currentSubscription, previousSubscription, '', MIXPANEL);
    const isSubscribeFromDiscount = getSubscriptionJourneySource() === MIXPANEL.VALUE.DISCOUNTING_PAGE ? { [MIXPANEL.PARAMETER.PAGE_NAME]: MIXPANEL.VALUE.DISCOUNTING_PAGE, [MIXPANEL.PARAMETER.SOURCE]: MIXPANEL.VALUE.DISCOUNTING_PAGE } : {};
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_SUCCESS, {
        ...analyticsData,
        [MIXPANEL.PARAMETER.PAYMENT_TYPE]: getPaymentType(currentSubscription.paymentMode),
        [MIXPANEL.PARAMETER.PAYMENT_METHOD]: paymentMethod,
        ...isSubscribeFromDiscount
    });
}

export const trackMixpanelOnPaymentInitiate = (currentSubscription) => {
    const previousSubscription = JSON.parse(getKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS));
    const analyticsData = getMixpanelSubscriptionAnalyticsData(currentSubscription, previousSubscription, '', MIXPANEL);
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.PAYMENT_INITIATE, analyticsData);
}

export const trackModifyPackSuccess = (currentSubscription) => {
    const previousSubscription = JSON.parse(getKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS));
    const { productName, amountValue, productId, packDuration, promoCode, paymentMethod } = currentSubscription;
    const source = getSubscriptionJourneySource() || "";
    let data = {
        [APPSFLYER.PARAMETER.SOURCE]: getAnalyticsSource(source, MIXPANEL),
        [APPSFLYER.PARAMETER.PACK_NAME]: productName || "",
        [APPSFLYER.PARAMETER.PACK_PRICE]: amountValue || "",
        [APPSFLYER.PARAMETER.PACK_ID]: productId,
        [APPSFLYER.PARAMETER.AF_REVENUE]: amountValue || "",
        [APPSFLYER.PARAMETER.AF_CURRENCY]: APPSFLYER.VALUE.INR,
        [APPSFLYER.PARAMETER.PACK_DURATION]: packDuration,
        [APPSFLYER.PARAMETER.PROMO_CODE]: promoCode,
        [APPSFLYER.PARAMETER.PAYMENT_MODE]: paymentMethod,
    }
    let fireBaseData = {
        [FIREBASE.PARAMETER.SOURCE]: getAnalyticsSource(source, MIXPANEL),
        [FIREBASE.PARAMETER.PACK_NAME]: productName || "",
        [FIREBASE.PARAMETER.PACK_PRICE]: amountValue || "",
        [FIREBASE.PARAMETER.PACK_ID]: productId,
        [FIREBASE.PARAMETER.PACK_DURATION]: packDuration,
        [FIREBASE.PARAMETER.PROMO_CODE]: promoCode,
        [FIREBASE.PARAMETER.PAYMENT_MODE]: paymentMethod,
        [FIREBASE.PARAMETER.OLD_PACK_ID]: previousSubscription?.productId,
        [FIREBASE.PARAMETER.PACK_TYPE]: FIREBASE.VALUE.PAID // tik tik related
    }
    if (previousSubscription?.subscriptionStatus === "ACTIVE") {
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SUBSCRIBE_SUCCESS_MODIFY_PACK,
            {
                ...data,
                [APPSFLYER.PARAMETER.OLD_PACK_ID]: previousSubscription?.productId,
            })
        trackEvent.subscriptionSuccessModifyPack(fireBaseData)
    } else {
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SUBSCRIBE_SUCCESS_REPEAT, data)
        trackEvent.subscriptionSuccessRepeat(fireBaseData)
    }
}


export const getPaymentType = (type) => {
    if (type?.toLowerCase().includes(MIXPANEL.VALUE.RECURRING.toLowerCase())) {
        return MIXPANEL.VALUE.RECURRING;
    } else {
        return MIXPANEL.VALUE.ONE_TIME;
    }
}

export const getSearchParamsAsObject = (url) => {
    const params = getSearchParams(url);
    if (!params) {
        return null;
    }
    return Object.fromEntries(params);
}

export const hasSearchParamKey = (key, url) => {
    return !!getSearchParam(key, url);
}

export const getSearchParams = (url) => {
    const urlString = url || window.location.href;
    const queryParamString = urlString.split('?')?.[1];
    if (!queryParamString) {
        return null;
    }
    const searchParams = new URLSearchParams(queryParamString);
    return searchParams;
}

export const getSearchParam = (key, url = "") => {
    const searchParams = getSearchParams(url);
    return searchParams?.get(key) || ""
}

export const hasSearchParam = (key) => {
    return getSearchParams()?.has(key)
}

export const setMixpanelId = (mixpanelId) => {
    setKey(LOCALSTORAGE.MIXPANEL_DISTINCT_ID, mixpanelId);
}

export const getMixpanelId = () => {
    return getKey(LOCALSTORAGE.MIXPANEL_DISTINCT_ID);
}

export const getSubscriptionJourneySource = () => {
    return getKey(LOCALSTORAGE.SUBSCRIPTION_JOURNEY_SOURCE)
}

export const setSubscriptionJourneySource = (source) => {
    if (source.includes('subscription-transaction')) {
        source = URL.HOME
    }
    setKey(LOCALSTORAGE.SUBSCRIPTION_JOURNEY_SOURCE, source);
}

export const getPackSelectionListingType = () => {
    if (location.pathname.includes(URL.SUBSCRIPTION)) {
        return APPSFLYER.VALUE.LANDING_PAGE;
    } else {
        if (isMobile.any()) {
            return APPSFLYER.VALUE.DRAWER;
        }
        return APPSFLYER.VALUE.POP_UP;
    }
}
export const isSafariBrowser = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /safari/.test(userAgent);
}

export const isAndroidWebview = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return userAgent.includes('wv'); //webview
}

export const isInAppBrowser = () => {
    if (!isMobile.any()) {
        return false;
    }
    const standalone = window.navigator.standalone;
    if (isMobile.iOS()) {
        if (!standalone && !isSafariBrowser()) {
            return true;
        }
    } else if (isAndroidWebview()) {
        return true;
    }
    return false;
}

export const isHelpCenterWebView = () => {
    return window.location.pathname.includes(URL.HELP_CENTER) && isInAppBrowser();
}

export const trackPackSelectionInitiate = (source) => {
    let mixpanel = {
        [`${MIXPANEL.PARAMETER.SOURCE}`]: source,
        // [`${MIXPANEL.PARAMETER.PAYMENT_METHOD}`] :  updatedTenure?.offeredPriceValue,
    }

    appsFlyerConfig.trackEvent(APPSFLYER.EVENT.PACK_SELECTION_INITIATE, {
        [APPSFLYER.PARAMETER.SOURCE]: getAnalyticsSource(getSubscriptionJourneySource(), MIXPANEL),
        [APPSFLYER.PARAMETER.USER_LOGIN_STATE]: isUserloggedIn() ? APPSFLYER.VALUE.LOGGED_IN : APPSFLYER.VALUE.NON_LOGGED_IN,
        [APPSFLYER.PARAMETER.LISTING_TYPE]: getPackSelectionListingType(),
    });
    const parameter = {
        [FIREBASE.PARAMETER.SOURCE]: getAnalyticsSource(getSubscriptionJourneySource(), MIXPANEL),
        [FIREBASE.PARAMETER.USER_LOGIN_STATE]: isUserloggedIn() ? FIREBASE.VALUE.LOGGED_IN : FIREBASE.VALUE.NON_LOGGED_IN,
        [FIREBASE.PARAMETER.LISTING_TYPE]: getPackSelectionListingType(),
    }
    trackEvent.packSelectionInitiate(parameter)
}

export const getContentLanguage = (language = [], shouldMerge = true) => {
    if (Array.isArray(language)) {
        let languages = language.filter(data => data.label !== "None")
            .map(data => data.label ? data.label : data);

        return shouldMerge ? languages.join(",") : languages;
    }

    return language;
}

export const getPrimaryLanguage = (language = []) => {
    let languages = getContentLanguage(language, false);
    return languages[0];
}

export const handleOverflowOnHtml = (isremove = false) => {
    let htmlElement = document.getElementsByTagName('html')[0];
    let bodyElement = document.getElementsByTagName('body')[0];
    if (isremove) {
        htmlElement.classList.remove("hide-overflow");
        bodyElement.classList.remove("hide-overflow");
    } else {
        htmlElement.classList.add("hide-overflow");
        bodyElement.classList.add("hide-overflow");
    }
};

export const mixpanelGetSuperProperties = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    const persistentSuperProperties = JSON.parse(getKey(LOCALSTORAGE.MIXPANEL_SUPER_PROPERTIES));
    let superProperties = {
        [MIXPANEL.PARAMETER.PLATFORM]: MIXPANEL.VALUE.WEB,
        [MIXPANEL.PARAMETER.DEVICE_ID]: getDeviceId(),
        [MIXPANEL.PARAMETER.USER_TYPE]: persistentSuperProperties?.[MIXPANEL.PARAMETER.USER_TYPE] || MIXPANEL.VALUE.GUEST
    };
    if (isUserloggedIn() || !isEmpty(persistentSuperProperties)) {
        if (isUserloggedIn()) {
            superProperties[MIXPANEL.PARAMETER.USER_TYPE] = userInfo?.dthStatus === DTH_TYPE.NON_DTH_USER ? MIXPANEL.VALUE.NON_TP : MIXPANEL.VALUE.TP;
        }
        superProperties[MIXPANEL.PARAMETER.RMN] = userInfo?.rmn || persistentSuperProperties?.[MIXPANEL.PARAMETER.RMN];
        if (userInfo?.dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER) {
            superProperties = {
                ...superProperties,
                [MIXPANEL.PARAMETER.TS_SID]: userInfo?.sId || persistentSuperProperties?.[MIXPANEL.PARAMETER.TS_SID]
            }
        } else {
            superProperties = {
                ...superProperties,
                [MIXPANEL.PARAMETER.C_ID]: userInfo?.bingeSubscriberId || persistentSuperProperties?.[MIXPANEL.PARAMETER.C_ID]
            }
        }
    }
    return superProperties;
}

export const handleLogoutAllDevices = (errorTitle, errorMessage) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal",
            headingMessage: errorTitle,
            hideCloseIcon: true,
            instructions: errorMessage,
            primaryButtonText: "Ok",
            isCloseModal: false,
            primaryButtonAction: async () => {
                await callLogOut(history, true, true);
                store.dispatch(closePopup());
            },
        }),
    );
}

export const handlePackValidationFailed = (errorMessage) => {
    store.dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal",
            headingMessage: "",
            hideCloseIcon: true,
            instructions: errorMessage,
            primaryButtonText: "Ok",
            isCloseModal: false,
        }),
    )
}

export const delay = (time = 1000) => new Promise(resolve => {
    setTimeout(() => resolve(true), time)
})

export const noop = () => { };

export const returnUrlTickTick = (isCampaign) => {
    const state = store.getState();
    let isLiveRailId = get(state.PIDetails, 'liveRailId');
    let searchParams = new URLSearchParams(window.location.search)
    let isMsales = searchParams.get("nonBinge");
    searchParams.set("tickTick", true);
    isMsales && searchParams.set("mSales", true);
    isLiveRailId && searchParams.set("liveRailId",isLiveRailId);
    searchParams.delete('action'); // Deleting it for Deeplink back handling else user will be stuck in a loop
    searchParams.delete('status');
    searchParams.delete('cartId');
    searchParams.delete('nonBinge');
    !!isCampaign && searchParams.delete('packId');
    let newRelativePathQuery = (!!isCampaign ? '/' : window.location.pathname) + '?' + searchParams.toString();
    window.history.pushState(null, '', newRelativePathQuery);
    return window.location.href
}

export const getSEOData = (pathName, piDetailMetaData, contentType) => {
    let urlValue = pathName.split("/"), metaTitle, metaDescription;

    switch (urlValue?.[1]) {
        case URL.HOME:
            metaTitle = "TataPlayBinge- Watch TV Shows, Movies, Specials, Live Cricket & Football";
            metaDescription = "Tata Play Binge is a newly launched app open to everyone, with all the entertainment from 14+ OTTs in one app. No DTH Connection is required to use the Tata Play Binge App. It is your one stop destination for the best premium content across all OTT entertainment apps. Enjoy the latest movies, web series, Originals, TV shows, live sports and more from 14+ OTT apps all in one app"
            break;
        case URL.MOVIES:
            metaTitle = "Watch movies and trailers on TataPlayBinge";
            metaDescription = "Watch movies and trailers on TataPlayBinge";
            break;
        case URL.SHOWS:
            metaTitle = "Watch latest shows and trailers on tataplaybinge";
            metaDescription = "Watch latest shows and trailers on tataplaybinge";
            break;
        case URL.SPORTS:
            metaTitle = "Watch latest live sports on tataplaybinge";
            metaDescription = "Watch latest live sports on tataplaybinge";
            break;
        case URL.CATEGORIES:
            let category = urlValue?.[2];
            metaTitle = `Watch ${category} content on tataplaybinge`;
            metaDescription = `Watch ${category} content on tataplaybinge`;
            break;
        case URL.BROWSE_BY:
            let browseBy = urlValue?.[2];
            metaTitle = `Search content in multiple ${browseBy} on tataplaybinge`;
            metaDescription = `Search content in multiple ${browseBy} on tataplaybinge`;
            break;
        case URL.DETAIL:
            let data = getPIDetailPageMetaData(piDetailMetaData, contentType);
            metaTitle = data?.metaTitle;
            metaDescription = data?.metaDescription;
            break;
        default:
            metaTitle = "TataPlayBinge- Watch TV Shows, Movies, Specials, Live Cricket & Football";
            metaDescription = "Tata Play Binge is a newly launched app open to everyone, with all the entertainment from 14+ OTTs in one app. No DTH Connection is required to use the Tata Play Binge App. It is your one stop destination for the best premium content across all OTT entertainment apps. Enjoy the latest movies, web series, Originals, TV shows, live sports and more from 14+ OTT apps all in one app"
            break;
    }

    return { metaTitle, metaDescription };
}

export const getPIDetailPageMetaData = (meta, contentType) => {
    let contentTitle = getTitleAndDesc(meta, contentType),
        free = meta?.partnerSubscriptionType?.toUpperCase() !== PARTNER_SUBSCRIPTION_TYPE.PREMIUM ? 'Free' : '', metaTitle, metaDescription;

    if ([CONTENTTYPE.TYPE_MOVIES, CONTENTTYPE.TYPE_MOVIE, CONTENTTYPE.TYPE_CUSTOM_MOVIES_DETAIL].includes(contentType)) {
        metaTitle = `Watch ${free} ${contentTitle} on Tataplaybinge`;
        metaDescription = `Watch ${free} ${contentTitle} on Tataplaybinge`
    }
    else if ([CONTENTTYPE.SERIES, CONTENTTYPE.TYPE_BRAND, CONTENTTYPE.TYPE_TV_SHOWS, CONTENTTYPE.TYPE_SERIES, CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL, CONTENTTYPE.TYPE_CUSTOM_TV_SHOWS_DETAIL, CONTENTTYPE.TYPE_CUSTOM_BRAND_DETAIL, CONTENTTYPE.TYPE_CUSTOM_SERIES_DETAIL].includes(contentType)) {
        metaTitle = `Watch ${free} ${contentTitle} and other episodes on Tataplaybinge`;
        metaDescription = `Watch ${free} ${contentTitle} and other episodes on Tataplaybinge`
    }
    else {
        metaTitle = `Watch ${contentTitle} on tataplaybinge`;
        metaDescription = `Watch ${contentTitle} on tataplaybinge`;
    }
    return { metaTitle, metaDescription };
}


export const getAllGenricProvider = () =>{
    const { headerDetails } = store.getState();
    let configResponse = get(headerDetails, "configResponse.data.config");
    let generic_provider = [];
    let filterData = configResponse?.availableProviders.filter((el)=>el.platform.includes(HEADER_CONSTANTS.WEB));
    (filterData.map(function(el) {
         generic_provider = {...generic_provider,[el.providerName.toLowerCase()]:el}
        }));  
    setKey(LOCALSTORAGE.genericProviders, JSON.stringify(generic_provider));
}

export const getTrailerUrl = (detail, playDetail) => {
    let trailerPlaybackUrl, isPartnerTrailer = false,
        provider = get(detail, 'provider'), providerLowerCase = provider?.toLowerCase();

    if ([PROVIDER_NAME.EPICON, PROVIDER_NAME.DOCUBAY, PROVIDER_NAME.HOICHOI, PROVIDER_NAME.PLANET_MARATHI, PROVIDER_NAME.CHAUPAL, PROVIDER_NAME.CURIOSITY_STREAM, PROVIDER_NAME.LIONS_GATE].includes(providerLowerCase)) {
        trailerPlaybackUrl = playDetail?.trailerUrl;
    } else if (!isEmpty(detail?.partnerTrailerInfo)) {
        trailerPlaybackUrl = detail?.partnerTrailerInfo;
        isPartnerTrailer = true;
    } else {
        trailerPlaybackUrl = playDetail?.dashWidewineTrailerUrl;
    }
    return { trailerPlaybackUrl, isPartnerTrailer };
};

export const checkTrailer = (detail, playDetail) => {
    let trailerData = getTrailerUrl(detail, playDetail);
    let trailerUrl = trailerData.trailerPlaybackUrl;
    return !isEmpty(trailerUrl);
};

export const getAppsFlyerComvivaId = (eventName) => {
    const userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    if (eventName === APPSFLYER.EVENT.SIGN_UP) {
        return userInfo?.rmn
    }
    if (userInfo?.dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER) {
        return userInfo?.sid
    }
    return userInfo?.bingeSubscriberId;
}

export const isHomePage = (pathname) => {
    const urlArr = pathname.split("/");
    return [URL.HOME, URL.DEFAULT].includes(urlArr[1]) || isEmpty(urlArr[1]);
};

export const isWebSmallPaymentLink = (location) => {
    let { webSmallRouteParam } = getWebSmallRouteValues();
    let searchPath = get(location, 'search');
    return webSmallRouteParam && searchPath?.includes(webSmallRouteParam);
};

export const getSidValue = () => {
    const userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    return isUserloggedIn() ? (userInfo?.dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER) ? { [DATALAYER.PARAMETER.TS_SID]: userInfo.sid } : { [DATALAYER.PARAMETER.C_ID]: userInfo?.bingeSubscriberId } : { [DATALAYER.PARAMETER.TS_SID]: getKey(LOCALSTORAGE.MIXPANEL_DISTINCT_ID) }
}

export const fireFooterClickEvent = (name) => {
    dataLayerConfig.trackEvent(DATALAYER.EVENT.FOOTER_CLICKS, {
        [DATALAYER.PARAMETER.FOOTER_BTN_NAME]: name,
    })
}

export const isSettingPage = () => {
    const currentPath = getKey(LOCALSTORAGE.CURRENT_PATH);
    return currentPath.includes(URL.SETTING);
}

export const getCurrentSubscriptionPackTenure = (tenures = []) => tenures.find((t) => t.currentTenure);

export const getCurrentSubscriptionTenureType = (currentSubscription) => {
    const currentTenure = !isEmpty(currentSubscription) && getCurrentSubscriptionPackTenure(currentSubscription?.tenure);
    return currentTenure ? currentTenure?.tenureType : MIXPANEL.VALUE.FREEMIUM
}

export const getUserType = () => {
    const userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    return (!isEmpty(userInfo) ? userInfo?.dthStatus === DTH_TYPE.NON_DTH_USER ? MIXPANEL.VALUE.NON_TP : MIXPANEL.VALUE.TP : MIXPANEL.VALUE.GUEST)
}

export const getUserInfo = () => JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

export const getLanguageGenreAPISource = (placeHolder) => {
    let source = getKey(LOCALSTORAGE.LANG_GENRE_PAGE_SOURCE);
    if (source === URL.MOVIES) {
        return `${placeHolder}_MOVIES`;
    } else if (source === URL.TV_Shows) {
        return `${placeHolder}_TVSHOWS`;
    } else {
        return placeHolder;
    }
}

export const getCookie = (name) => document.cookie?.split(';')
    ?.find(row => row.trim()?.startsWith(`${name}=`))
    ?.split('=')[1];

export const getWebSmallRouteValues = () => {
    let searchParams = getSearchParamsAsObject();
    let webSmallQueryParams = [WEB_SMALL_PAYMENT_SOURCE.DETAILS, WEB_SMALL_PAYMENT_SOURCE.INFO, WEB_SMALL_PAYMENT_SOURCE.NON_BINGE, WEB_SMALL_PAYMENT_SOURCE.TRANSACTION_ID, WEB_SMALL_PAYMENT_SOURCE.ID];
    let key = webSmallQueryParams.find(key => searchParams?.hasOwnProperty(key));
    return { webSmallPaymentRouteKey: key, webSmallRouteToken: searchParams?.[key] };
}

export const isWebSmallLinkPayment = (location) => {
    let { webSmallPaymentRouteKey } = getWebSmallRouteValues();
    let searchPath = get(location, 'search');
    return webSmallPaymentRouteKey && searchPath?.includes(webSmallPaymentRouteKey);
};

export const isMSalesPrevInfoExist = () => {
    let { webSmallPaymentRouteKey, webSmallRouteToken } = getWebSmallRouteValues();
    let sourceIsMSales = webSmallPaymentRouteKey === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE,
        previousToken = getKey(LOCALSTORAGE.PAYMENT_SOURCE_TOKEN);
    return isUserloggedIn() && sourceIsMSales && webSmallRouteToken && (isEmpty(previousToken) || (previousToken && webSmallRouteToken !== previousToken));
}

export const isPaymentRedirectURL = (location) => {
    let { pathname } = location;
    const urlArr = pathname.split("/");
    return [URL.SUBSCRIPTION_TRANSACTION_REDIRECT, URL.SUBSCRIPTION_TRANSACTION].includes(urlArr[1]);
}

export const getVerbiages = (categoryName) => {
    const { headerDetails } = store.getState();
    let verbiages = get(headerDetails, "configResponse.data.config.verbiages", '');
    return verbiages?.length > 0 && verbiages?.filter(item => item.categoryName === categoryName)?.[0]?.data;
}

export const handleSilentLogout = () => {
    deleteKey(LOCALSTORAGE.IS_SILENT_LOGOUT);
    store.dispatch(clearStore());
}


export const getFormattedURLValue = (string) => {
    string = string?.trim()?.replace(REGEX.SPACES, " "); // Replaces extra spaces to one space
    string = string?.replace(REGEX.PUNCTUATUIONS, '-'); //Replace special Char with hyphen
    string = string?.replace(REGEX.SPACES, '-'); //Replace spcae with hyphen
    string = string?.replace(/[^A-Z0-9]+/ig, "-"); // Replace multiple hypens to one
    string = string?.replace(/^-|-$/, '');// Replace first and last char if it is hyphen
    return string?.toLowerCase();
}

export const getFormattedContentTitle = (string) => {
    string = string?.toLowerCase();
    string = getFormattedURLValue(string);
    string = string?.split('-');
    string = string.filter(item => !USELESS_WORDS.includes(item));
    string = string?.slice(0, 5)?.join('-');
    return string;
}

export const handlePiRedirection = (history) => {
    const urlArr = history?.location?.pathname.split("/");
    if ([URL.DETAIL].includes(urlArr[1])) {
        setKey(LOCALSTORAGE.PI_DETAIL_URL, `${window.location.pathname}${window.location.search}`);
        setKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI, true)
    } else if (![URL.DETAIL].includes(urlArr[1]) && getKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI)) {
        deleteKey(LOCALSTORAGE.PI_DETAIL_URL)
        deleteKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI)
    }
};

export const isSubscriptionDiscount = (history) => {
    const urlArr = history?.location?.pathname.split("/");
    return urlArr && urlArr[1] && [URL.SUBSCRIPTION_DISCOUNT].includes(urlArr[1]);
}

export const getEpisodeVerbiage = (isPIPage) => {
    const { headerDetails } = store.getState();
    let verbiages = get(headerDetails, "configResponse.data.config", '');
    let updatedVerbiages = isPIPage ? verbiages?.freeEpisodesAvailable : verbiages?.firstEpisodeFree
    return updatedVerbiages;
}

export const redirectToMangeApp = async (source, isCampaign) => {
    const requestHeader = { initiateSubscription: JOURNEY_SOURCE.DRAWER_CYOP, journeySource: JOURNEY_SOURCE.DRAWER_CYOP, journeySourceRefId: "", analyticSource: source }
    await store.dispatch(getWebPortalLink(requestHeader, isCampaign));
}

const upgradeModal = async (meta) => {
        const state = store.getState()
        const headerData = get(state.headerDetails, 'configResponse.data.config.verbiages');
        const appleUpgradeData = headerData.filter((item) => item.categoryName === 'apple-upgrade-popup');
        if(meta?.provider?.toLowerCase() === PROVIDER_NAME.APPLE){
            store.dispatch(
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: "alert-modal",
                    headingMessage: appleUpgradeData[0]?.data?.header,
                    hideCloseIcon: true,
                    imageUrl: CrownImage,
                    instructions: appleUpgradeData[0]?.data?.subHeader,
                    primaryButtonText: appleUpgradeData[0]?.data?.others?.buttonTitle,
                    primaryButtonAction: async() => {
                        return await store.dispatch(
                            getWebPortalLink({
                              initiateSubscription: JOURNEY_SOURCE.CONTENT_PLAY,
                              journeySource: JOURNEY_SOURCE.HOME_CONTENT,
                              journeySourceRefId: get(meta, "partnerId"),
                              analyticSource: MIXPANEL.VALUE.CONTENT_PLAYBACK,
                            })
                          );
                    },
                        secondaryButtonText: appleUpgradeData[0]?.data?.others?.exitButtonTitle,
                        secondaryButtonAction: () =>{
                            store.dispatch(closePopup());
                        }
                }),
            );
        } else {
            await store.dispatch(
            getWebPortalLink({ 
                initiateSubscription: JOURNEY_SOURCE.CONTENT_PLAY,
                journeySource: JOURNEY_SOURCE.HOME_CONTENT,
                journeySourceRefId: get(meta, 'partnerId'),
                analyticSource: MIXPANEL.VALUE.CONTENT_PLAYBACK })
        );
        }
    }