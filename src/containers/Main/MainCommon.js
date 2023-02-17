import store from "@src/store";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import { openPopup, closePopup } from "@common/Modal/action";
import { URL } from "@constants/routeConstants";
import {
    isMobile,
    isWebSmallLinkPayment,
    isUserloggedIn,
    showLanguageOnboardingPopup,
    loginInFreemium,
    isHomePage,
    safeNavigation,
    getSearchParamsAsObject,
    redirectToMangeApp
} from "@utils/common";
import { isHideDownloadHeaderAction } from "@components/Header/APIs/actions";
import { deleteKey, getKey, setKey } from "@utils/storage";
import { openMobilePopup } from "@containers/Languages/APIs/actions";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import { LOCALSTORAGE, MINI_SUBSCRIPTION, APP_LAUNCH_COUNTER, MOBILE_BREAKPOINT, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import firebase from "@utils/constants/firebase";
import { openMiniSubscription, getPackListing, getNotLoggedInPack, setUpdatedTenure, checkFallbackFlow } from "@containers/Subscription/APIs/action";
import { checkCurrentSubscription } from "@containers/Subscription/APIs/subscriptionCommon";
import MIXPANEL from "@constants/mixpanel";
import { handleNativeFlow } from "@containers/CampaignPage/APIs/campaignCommon";
export const getHomePageLaunchCounter = (current) => {
    let { location: { pathname } } = current?.props;
    const urlArr = pathname.split("/");
    let isHomePage = [URL.HOME, URL.DEFAULT].includes(urlArr[1]) || isEmpty(urlArr[1]);
    let counter = JSON.parse(getKey(LOCALSTORAGE.HOME_PAGE_LAUNCH_COUNTER));
    if (isHomePage) {
        if (!counter) {
            counter = APP_LAUNCH_COUNTER.ONE;
            let lastSubcriptionCounter = JSON.parse(getKey(LOCALSTORAGE.SHOW_SUBSCRIPTION_POPUP_COUNTER));
            lastSubcriptionCounter && deleteKey(LOCALSTORAGE.SHOW_SUBSCRIPTION_POPUP_COUNTER);
        } else {
            counter = counter + 1;
        }
        setKey(LOCALSTORAGE.HOME_PAGE_LAUNCH_COUNTER, counter);
    }
    return counter;
}

export const showLangOrSubPopup = async (current) => {
    let { location: { pathname } } = current?.props,
        sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
    
    if (!isHomePage(pathname) || sourceIsMSales) {
        return false;
    }

    const state = store.getState();
    // skip if login popup is already visible
    if (state?.loginReducer?.isLoginPopupVisible) {
        return
    }
    let drawerTimer = get(state.headerDetails, "configResponse.data.config.SubscriptionDrawer"),
        homePageLaunchCounter = getHomePageLaunchCounter(current),
        isFirstAppLaunch = homePageLaunchCounter === APP_LAUNCH_COUNTER.ONE,
        languagePopupAlreadyShowed = JSON.parse(getKey(LOCALSTORAGE.SHOW_LANGUAGE_POPUP_COUNTER)) === true;
    let { openSubscriptionDrawer } = drawerTimer,
        isLanguageUnSelected = showLanguagePopupInSmall(current);

    if (isFirstAppLaunch && !languagePopupAlreadyShowed) {
        if (isLanguageUnSelected) {
            isMobile.any() ? store.dispatch(openMobilePopup()) : showLanguageOnboardingPopup(current?.state?.windowContainerWidth);
            setKey(LOCALSTORAGE.SHOW_LANGUAGE_POPUP_COUNTER, true);
        } else if (openSubscriptionDrawer) {
            await showSubscriptionPopup(homePageLaunchCounter, current, isLanguageUnSelected);
        }

    } else if (openSubscriptionDrawer) {
        await showSubscriptionPopup(homePageLaunchCounter, current, isLanguageUnSelected)
    }
}

export const showSubscriptionPopup = async (homePageLaunchCounter, current, isLanguageUnSelected) => {
    // await store.dispatch(checkFallbackFlow())
    let state = store.getState(),
        isManagedApp = get(state.headerDetails, "isManagedApp"),
        enableTickTickJourney = get(state.headerDetails, "configResponse.data.config.enableTickTickJourney"),
        drawerTimer = !isManagedApp ? get(state.headerDetails, "configResponse.data.config.SubscriptionDrawer") : (enableTickTickJourney ? get(state.headerDetails, "configResponse.data.config.tickTickDrawerScreen") : get(state.headerDetails, "configResponse.data.config.tickTickFixedPlanDrawerScreen"));
    let { delayToOpenSubscriptionDrawer, loggedInDrawerFrequency = 1, guestDrawerFrequency = 1 } = drawerTimer,
        drawerFrequency = isUserloggedIn() ? loggedInDrawerFrequency : guestDrawerFrequency;

    let lastSubcriptionCounter = JSON.parse(getKey(LOCALSTORAGE.SHOW_SUBSCRIPTION_POPUP_COUNTER)),
        languagePopupAlreadyShowed = JSON.parse(getKey(LOCALSTORAGE.SHOW_LANGUAGE_POPUP_COUNTER)) === true;

    let isExpectedDrawerfrequency = homePageLaunchCounter == parseInt(drawerFrequency) + lastSubcriptionCounter + 1,
        isSecondAppLaunch = homePageLaunchCounter === APP_LAUNCH_COUNTER.TWO,
        isFirstAppLaunch = homePageLaunchCounter === APP_LAUNCH_COUNTER.ONE,
        showSubscriptionModal = isExpectedDrawerfrequency || ((languagePopupAlreadyShowed || !isLanguageUnSelected) && isFirstAppLaunch) || (!lastSubcriptionCounter && languagePopupAlreadyShowed && isSecondAppLaunch);

    if (showSubscriptionModal) {
        !isManagedApp && (isUserloggedIn() ? await store.dispatch(getPackListing()) : await store.dispatch(getNotLoggedInPack()));
        state = store.getState();
        let currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data');
        let packListingData = get(state.subscriptionDetails, 'packListingData', []);
        let { location: { pathname } } = current?.props;
        const urlArr = pathname.split("/");
        let tickTick = get(state.headerDetails.configResponse, 'data.config.tickTickDrawerScreen.openTickTickDrawer')

        let isHelpCenterPage = [URL.HELP_CENTER].includes(urlArr[1]);
        let webSmallPaymentJourney = isWebSmallLinkPayment(location);
        let isValidUrl = (urlArr[1] === URL.HOME || !urlArr[1]) && !webSmallPaymentJourney && !isHelpCenterPage;

        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let shouldShowSubscription = isValidUrl && (isEmpty(userInfo) || (checkCurrentSubscription(currentSubscription)));
        shouldShowSubscription && setKey(LOCALSTORAGE.SHOW_SUBSCRIPTION_POPUP_COUNTER, homePageLaunchCounter);
        if (shouldShowSubscription && tickTick && isNotRedirectedFromManageApp() && isManagedApp) {
            setTimeout(async () => {
                await loginInFreemium({
                    openPopup, closePopup, openLoginPopup, source: MIXPANEL.VALUE.TICK_TICK_APP_LAUNCH, ComponentName: MINI_SUBSCRIPTION.SELECTION_DRAWER
                });
            })
        }else  if (shouldShowSubscription && !isEmpty(packListingData) && !isManagedApp) {
            setTimeout(async () => {
                    await loginInFreemium({
                        openPopup, closePopup, openLoginPopup, source: firebase.VALUE.HOME, ComponentName: MINI_SUBSCRIPTION.PLAN_SELECT
                    });
            })
        }

    }
}

export const isNotRedirectedFromManageApp = () => {
    let searchParams = getSearchParamsAsObject();
    let statusInfo = searchParams?.hasOwnProperty('status'),
        cartId = searchParams?.hasOwnProperty('cartId'),
        tickTick = searchParams?.hasOwnProperty("tickTick")

    return !(tickTick || (statusInfo && cartId));
}

export const showLanguagePopupInSmall = (current) => {
    let { location: { pathname }, showMobilePopup } = current?.props;
    const urlArr = pathname.split("/");
    const urls = [URL.HELP_CENTER, URL.SUBSCRIPTION, URL.SUBSCRIPTION_TRANSACTION_REDIRECT, URL.SUBSCRIPTION_TRANSACTION, URL.BALANCE_INFO, URL.TRANSACTIONS];
    let isFSPaymentValidateWebURL = isWebSmallLinkPayment(location);

    let showLanguageMiniDrawer = false;
    let userLanguage = JSON.parse(getKey(LOCALSTORAGE.PREFERRED_LANGUAGES));
    let deviceRemoved = JSON.parse(getKey(LOCALSTORAGE.DEVICE_REMOVED)) === true;

    if (isMobile.any()) {
        showLanguageMiniDrawer = (isEmpty(userLanguage) || showMobilePopup) && !urls.some((url) => url === urlArr[1]) && !isFSPaymentValidateWebURL;
    } else {
        showLanguageMiniDrawer = isEmpty(userLanguage) && !urls.some((url) => url === urlArr[1]) && !deviceRemoved;
    }
    return showLanguageMiniDrawer;
};

export const checkHomePage = (current) => {
    let {
        location: { pathname },
    } = current?.props;
    const urlArr = pathname.split("/");
    if ([`${URL.HOME}`, `${URL.MOVIES}`, `${URL.TV_Shows}`, `${URL.KIDS}`, `${URL.PARTNER}`, `${URL.BROWSE_BY}`, `${URL.CATEGORIES}`].includes(urlArr[1].toLowerCase())
        || [`${URL.DEFAULT}`].includes(pathname.toLowerCase())) {
        return true;
    }
};

export const accordingToMobileShowHideDownload = (current) => {
    const savedISDownload = JSON.parse(getKey(LOCALSTORAGE.IS_HIDE_DOWNLOAD_HEADER));
    current?.state?.windowContainerWidth > MOBILE_BREAKPOINT ? callBackToHideDownload(true) : callBackToHideDownload(savedISDownload);
}

export const callBackToHideDownload = (data) => {
    store.dispatch(isHideDownloadHeaderAction(data));
}

export const campaignPageFlow = async (current) => {
    let { location: { state }, history } = current?.props;
    let reduxState = store.getState();
    let packListingData = get(reduxState.subscriptionDetails, 'packListingData', []);
    if (state?.isExplorePlans && !isEmpty(packListingData) && state?.isHigher) {
        await loginInFreemium({
            openPopup, closePopup, ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE, isFromCampaign: true, selectedPlan: state?.selectedPack
        })
    }
    else if (state?.isTenure && !isEmpty(packListingData)) {
        await loginInFreemium({
            openPopup, closePopup, ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE, isFromCampaign: true, selectedPlan: state?.selectedPack
        });
     }
     else if(state?.isExplorePlans && !isEmpty(packListingData)){
        handleNativeFlow(history)
        // redirectToMangeApp(MIXPANEL.VALUE.CAMPAIGN)
     }
     else{
        return
    }
}

export const showRegionalAppNudge = (history) => {
    const state = store.getState(),
    configResponse = get(state.headerDetails, "configResponse"),
    currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data'),
    nudgeStatus =  get(state.subscriptionDetails, 'regionalNudgeStatus');
    if(!nudgeStatus){
        return false
    }
    let { location: { pathname } } = history,
    nudgeFrequency = Number(get(configResponse ,'data.config.regionalAppFrequency')),
    urlArr = pathname.split("/"),
    homePageFrequency = JSON.parse(getKey(LOCALSTORAGE.NUDGE_LAUNCH_COUNTER)),
    isNudgeShow = homePageFrequency !== null  && homePageFrequency % nudgeFrequency === 0;
    return ([URL.HOME].includes(urlArr[1]) || isEmpty(urlArr[1])) && isNudgeShow && !!get(currentSubscription,'regionalAppNudge.enableRegionalAppNudge')
}

 