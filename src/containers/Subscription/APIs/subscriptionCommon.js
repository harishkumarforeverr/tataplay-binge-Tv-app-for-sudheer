import store from "@src/store";
import { get, isEmpty } from "lodash";

import { openPopup, closePopup } from "@common/Modal/action";
import { MODALS } from "@common/Modal/constants";
import { getKey, setKey, deleteKey } from "@utils/storage";
import { LOCALSTORAGE, MESSAGE, SUBSCRIPTION_TYPE, ERROR_CODE, DTH_TYPE, WEB_SMALL_PAYMENT_SOURCE, SUBSCRIPTION_TYPE_HEADER } from "@constants";
import { addNewSubscription, modifyExistingSubscription, validateSelectedPack, cancelSubscription, getCurrentSubscriptionInfo } from '../APIs/action';
import { ACCOUNT_STATUS, SUBSCRIPTION_STATUS, PRIME_STATUS, DISCOUNT_SOURCE, JOURNEY_SOURCE } from './constant';
import {
    safeNavigation, getEnvironmentConstants, trackMixpanelSubsciptionInitiate,
    getCurrentSubscriptionTenureType,
    getPackInfo,
    getPartnerSubscriptionInfo,
    setSubscriptionJourneySource
} from "@utils/common";
import { URL } from "@constants/routeConstants";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import { deletePaymentKeysFromLocal } from "@utils/common";

const noop = () => { };

/**
 * @function getComponentList - to fetch componentList for partner images from pack listing 
 * @param {*} item - single pack detail
 * @returns 
 */
export const getComponentList = (item) => {
    let componentList = item?.componentList?.find(packItem => packItem?.componentId === item?.productId);
    if (!componentList) {
        componentList = item?.componentList && item.componentList[0]
    }
    return componentList || [];
};

export const isSubscriptionStatusEmpty = () => {
    const state = store.getState(),
    currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data', {}),
    subscriptionStatus = get(currentSubscription, 'subscriptionStatus');
    
    return (subscriptionStatus === null || subscriptionStatus === undefined || isEmpty(subscriptionStatus));
};
/**
 * @function checkCurrentSubscription
 * @param {*} currentSubscription 
 * @returns boolean, if user is subscribed to any subscription or not , This function will return true if user has no current subscription else return false
 */
export const checkCurrentSubscription = (currentSubscription, isRenew = false) => {
    const isSubscriptionDeactive = get(currentSubscription, 'subscriptionStatus') === ACCOUNT_STATUS.DEACTIVE;
    return isRenew
        ? (isSubscriptionStatusEmpty() || (get(currentSubscription, 'freeTrialStatus') || isSubscriptionDeactive))
        : (isSubscriptionStatusEmpty() || (get(currentSubscription, 'freeTrialStatus') && isSubscriptionDeactive));;
};

/**
 * @function callAddorModifySubscription
 * @param {*} currentSubscription 
 */
export const callAddorModifySubscription = (currentSubscription) => {
    let isSubscriptionDeactive = get(currentSubscription, 'subscriptionStatus') === ACCOUNT_STATUS.DEACTIVE;
    return (currentSubscription === null || currentSubscription === undefined || isEmpty(currentSubscription) || get(currentSubscription, 'freeTrialStatus') || isSubscriptionDeactive);
};

/**
* @function isSubscriptionFreemium
* @returns boolen, is subscription of FREEMIUM type or not
 */
export const isSubscriptionFreemium = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    return (userInfo?.subscriptionType && userInfo?.subscriptionType.toUpperCase() === SUBSCRIPTION_TYPE.FREEMIUM);
};


/**
 * @function handleSubscriptionCall - to handle add/modify API call and redirection of user to payment and balance screens
 * @param {*} history 
 * @param {*} isFromMyPlan - to track from where user has started the renew flow so that after successful renewel we will land user on same flow
 * @param {*} passedPayload - payload keys are different for renew flow so managing it with this parameter
 */
export const handleSubscriptionCall = async (history, isFromMyPlan = false, passedPayload, cartId) => {
    const state = store.getState(),
        userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));

    let isNonFreemiumDthUser = !isSubscriptionFreemium() && userInfo.dthStatus !== DTH_TYPE.NON_DTH_USER;

    let currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data', {}),
        selectedTenure = get(state.subscriptionDetails, 'selectedTenureValue'),
        validateSelectedPackResp = get(state.subscriptionDetails, 'validateSelectedPackResp'),
        tenureAccountBalance = get(state.subscriptionDetails, 'tenureAccountBal'),
        availablePacks = get(state.subscriptionDetails, 'packListingData'),
        dthBalanceApiResponse = get(state?.subscriptionPaymentReducer, "balanceInfo.data"),
        existingUser = get(state.loginReducer, 'existingUser.data'),
        isManagedApp = get(state.headerDetails, "isManagedApp");

    const selectedPack = availablePacks?.find(p => p.productId === get(selectedTenure, 'tenureId')) || currentSubscription; //renewal if selectedPack is empty
    !isManagedApp && setKey(LOCALSTORAGE.SUBSCRIPTION_SELECTED_PACK, JSON.stringify(selectedPack));
    const isFirstSubscription = checkCurrentSubscription(currentSubscription);
    // payload amt will be amount received in valiadte pack API, if not then prorated amount API resp, if not then selected tenure amount
    // There are  3 level checks are there for amount filed, because validate pack API is not getting called for non-freemium users and
    // if user is subscribed to any subscription then only we call prorated API and in case both checks fails we consider selected tenure amount
    let amountForpayload = get(validateSelectedPackResp, 'data.totalAmount') ?
        get(validateSelectedPackResp, 'data.totalAmount')?.toFixed(2)?.toString() :
        get(tenureAccountBalance, 'amount', selectedTenure?.offeredPriceValue);
    let  isMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
    let payload = {
        sid: get(userInfo, 'sId'),
        baId: get(userInfo, 'baId'),
        packId: get(selectedTenure, 'tenureId') || '',
        amount: amountForpayload || "",
        startDate: get(validateSelectedPackResp, 'data.term.startDate', '') || "",
        endDate: get(validateSelectedPackResp, 'data.term.endDate', '') || "",
        return_url: `${getEnvironmentConstants().ENV_CALLBACK_URL}/${URL.SUBSCRIPTION_TRANSACTION_REDIRECT}`,
        deviceType: 'WEB',
        language: "ENGLISH",
        subscriptionType: get(userInfo, 'subscriptionType'),
        offerId: get(validateSelectedPackResp, 'data.discountList') && get(validateSelectedPackResp, 'data.discountList')[0]?.offerId,
        source: !isEmpty(get(validateSelectedPackResp, 'data.discountList')) && DISCOUNT_SOURCE,
        cartId: cartId,
        isTickTick: true,
        externalSourceMSales: (!!existingUser?.externalSourceMSales || !!isMSales) ? true : false
    };

    // passedPayload is payload when user is coming from renew flow in that case there are different handling for some payload values
    let apiPayload = passedPayload ? { ...payload, ...passedPayload } : payload;
    let apiResponse;
    let isFsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;

    if (isFsJourney) {
        let payload = {
            packId: get(existingUser, 'productId'),
            amount: get(dthBalanceApiResponse, 'proRataAmount'),
        };
        apiPayload = { ...apiPayload, ...payload };
    }
    else if (isNonFreemiumDthUser) {
        // specifically to handle non-freemium and non-dth user renew flow
        let payload = {
            amount: get(tenureAccountBalance, 'amount', selectedTenure?.offeredPriceValue) ? get(tenureAccountBalance, 'amount', selectedTenure?.offeredPriceValue) : parseInt(get(currentSubscription, 'amountValue')).toFixed(2)?.toString(),
            packId: get(selectedTenure, 'tenureId') ? get(selectedTenure, 'tenureId') : get(currentSubscription, 'productId'),
        };
        apiPayload = { ...apiPayload, ...payload };
    }

    if (callAddorModifySubscription(currentSubscription)) {
        // checkCurrentSubscription will check if user is subscribed to any subscription or not, if user has no subscription add subscription API will be called else modify
        await store.dispatch(addNewSubscription(apiPayload)).then(addNewPackRes => {
            apiResponse = addNewPackRes;
        }).catch(err => {
            console.log(`Error occoured while adding subscription: ${err}`)
        })
    } else {
        await store.dispatch(modifyExistingSubscription(apiPayload)).then(modifyPackRes => {
            apiResponse = modifyPackRes;
        }).catch(err => {
            console.log(`Error occoured while adding subscription: ${err}`)
        })
    }

    if (isEmpty(apiResponse?.data)) {
        errorForAPIFailure(apiResponse);
    } else if (get(apiResponse, 'data.dth')) {
        // if dth key is true then no payment SDK will be visible to user only balnace info will be there alonf with tatasky balance and make payment button
        safeNavigation(history, `${URL.BALANCE_INFO}`);
    } else if (!get(apiResponse, 'data.upFrontMoneyCollected')) {
        // upFrontMoneyCollected if false then we need to show payment SDK
        payload?.offerId && setKey(LOCALSTORAGE.IS_PAYMENT_FROM_DISCOUNT, true);
        setKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION, isFromMyPlan);
        safeNavigation(history, { pathname: `/${URL.SUBSCRIPTION_TRANSACTION}` })
    } else {
        store.dispatch(getCurrentSubscriptionInfo());
        openSubscriptionSuccessModal(apiResponse, history);
    }
    !isEmpty(apiResponse?.data) && isManagedApp && setKey(LOCALSTORAGE.SUBSCRIPTION_SELECTED_PACK, JSON.stringify({...apiResponse?.data, amountValue:apiResponse?.data?.amount}));
    !isEmpty(get(validateSelectedPackResp, 'data.discountList')) && setSubscriptionJourneySource(MIXPANEL.VALUE.DISCOUNTING_PAGE);
    trackMixpanelSubsciptionInitiate(selectedPack, currentSubscription, history?.location?.state?.prevPath, MIXPANEL);
};


/**
 * @function, renewSusbcription - for handing of renew subscription button click
 * @param {*} history 
 * @param {*} isFromMyPlan - to track from where user has started the renew flow so that after successful renewel we will land user on same flow
 */
export const renewSusbcription = async (history, isFromMyPlan = false) => {
    const state = store.getState();
    const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    let isManagedApp = get(state.headerDetails, "isManagedApp");

    let currentSubscriptionInfo = get(state.subscriptionDetails, 'currentSubscription.data', {}),
        currentPack = get(currentSubscriptionInfo, 'tenure').find(item => item.currentTenure),
        id = get(currentPack, 'tenureId') ? get(currentPack, 'tenureId') : get(currentSubscriptionInfo, 'productId'),
        isNonFreemiumDthUser = !isSubscriptionFreemium() && user_info.dthStatus !== DTH_TYPE.NON_DTH_USER,
        payload = {
            amount: parseInt(get(currentSubscriptionInfo, 'amountValue')).toFixed(2)?.toString(),
            packId: get(currentSubscriptionInfo, 'productId'),
            startDate: '',
            endDate: '',
        };

    if (isNonFreemiumDthUser) {
        // if user is non-freemium i.e subscriptionType !== FREEMIUM and non dth user,
        // then in this case add and modify will be called on Make payment button click on balane info page
        setKey(LOCALSTORAGE.IS_NON_FREEMIUM_NON_DTH_SUBSCRIPTION_FLOW, true);
        safeNavigation(history, `${URL.BALANCE_INFO}`);
    } else if (isSubscriptionFreemium()) {
        if(isManagedApp){
            handleSubscriptionCall(history, isFromMyPlan, payload); // for add/modify APi handling
        }else{
         // if user is on FREEMIUM subscriptionType then first we will call validate pack API then add/modify
        await store.dispatch(validateSelectedPack(id));
        const state = store.getState();
        let validateSelectedPackResp = get(state.subscriptionDetails, 'validateSelectedPackResp');
         if (validateSelectedPackResp?.code === 0 && !isEmpty(validateSelectedPackResp?.data)) {
            let payloadFromValidate = {
                amount: get(validateSelectedPackResp, 'data.totalAmount')?.toFixed(2)?.toString(),
                startDate: get(validateSelectedPackResp, 'data.term.startDate'),
                endDate: get(validateSelectedPackResp, 'data.term.endDate'),
            }
            payload = { ...payload, ...payloadFromValidate }
            handleSubscriptionCall(history, isFromMyPlan, payload); // for add/modify APi handling
        }
        else {
            validateSelectedPackResp?.response?.status !== 500 && errorForAPIFailure(validateSelectedPackResp);
        }
    }
    } else {
        handleSubscriptionCall(history, isFromMyPlan, payload); // for add/modify APi handling
    }
};


/**
 * @function openSubscriptionSuccessModal
 * @param {*} apiResponse - response of add/modify api
 * @param {*} history - history object
 * will open success popup after subscription success
 */
export const openSubscriptionSuccessModal = (apiResponse, history) => {
    let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal error-state-modal plan-success-modal',
        headingMessage: get(apiResponse, 'data.paymentStatusVerbiage.header'),
        extraInstructions: get(apiResponse, 'data.paymentStatusVerbiage.footer'),
        instructions: get(apiResponse, 'data.paymentStatusVerbiage.message'),
        primaryButtonText: sourceIsMSales ? "" : 'Ok',
        primaryButtonAction: () => {
            closePopup();
            safeNavigation(history, `${URL.DEFAULT}`)
        },
        hideCloseIcon: true,
        icon: true,
    }));
};


/**
 * @function errorForAPIFailure - to open error popup for API failure
 * @param {*} response 
 * @param {*} callBack 
 */

export const errorForAPIFailure = (response, callBack) => {
    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal error-state-modal',
        headingMessage: MESSAGE.ERROR_OCCURRED,
        instructions: response?.message ? response.message : MESSAGE.NO_DATA,
        primaryButtonText: 'Ok',
        primaryButtonAction: () => {
            callBack ? callBack() : closePopup()
        },
        errorIcon: 'icon-alert-upd',
        hideCloseIcon: true,
        errorCode: response?.code,
    }));
};

/**
 * @function checkLowerPack - return the lowest pack containing specific provider
 * @param packName
 */
export const checkLowerPack = (packName) => {
    const state = store.getState()
    let packListingData = get(state.subscriptionDetails, 'packListingData');
    let packListContainingPartner = packListingData.filter(packItem => {
        let componentList = getComponentList(packItem);
        return !!get(componentList, 'partnerList').find(item => item?.partnerName?.toLowerCase() === packName?.toLowerCase() && item?.included);
    });
    packListContainingPartner = packListContainingPartner?.length > 1 ? packListContainingPartner.sort((packA, packB) => {
        let packAPrice = getPackAmount(get(packA, 'amount')), packBPrice = getPackAmount(get(packB, 'amount'))
        return packAPrice - packBPrice
    }) : packListContainingPartner;
    return !isEmpty(packListContainingPartner) && packName ? packListContainingPartner[0] : null;
}

const getPackAmount = (amount) => {
    return amount?.split(';')[1]?.split('/')[0];
}
export const getHigherPack = () => {
    const state = store.getState()
    let packListingData = get(state.subscriptionDetails, 'packListingData');
    let sortedPackData = [...packListingData];
    sortedPackData.sort((packA, packB) => {
        let packAPrice = getPackAmount(get(packA, 'amount')), packBPrice = getPackAmount(get(packB, 'amount'))
        return packBPrice - packAPrice;
    });
    return !isEmpty(sortedPackData) ? sortedPackData[0] : null;
}

export const getAnalyticsData = (analytics = MIXPANEL) => {
    let state = store.getState();
    let currentSubscription = get(state.subscriptionDetails, 'currentSubscription', {});
    let isSubscriptionExpired = currentSubscription.data?.subscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.DEACTIVE;
    // let daysRemaining = isSubscriptionExpired ? currentSubscription.data?.subscriptionNudgesDetails?.expiryDaysLeft : currentSubscription.data?.subscriptionNudgesDetails?.currentDay
    const daysRemaining = isSubscriptionExpired ? 0 : currentSubscription.data?.subscriptionNudgesDetails?.expiryDaysLeft;
    return {
        [`${analytics.PARAMETER.PACK_NAME}`]: currentSubscription?.data?.productName || "",
        [`${analytics.PARAMETER.DAYS_REMAINING}`]: daysRemaining ? Math.abs(daysRemaining) : 0,
        [analytics.PARAMETER.TENURE]: getCurrentSubscriptionTenureType(currentSubscription?.data)
    };
};

export const handleCancelActivePlan = async (cancelPrime, cancelCurrentSub) => {
    let state = store.getState();
    let currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data', {});
    if (get(currentSubscription, 'migrated')) {
        return store.dispatch(openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal error-state-modal cancel-plan-error',
            headingMessage: get(currentSubscription, 'migratedVerbiage') || MESSAGE.OPERATION_NOT_COMPLETED,
            primaryButtonText: 'Ok',
            primaryButtonAction: () => store.dispatch(closePopup()),
            hideCloseIcon: true,
        }))
    }
    const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    const payload = {
        baId: get(user_info, 'baId'),
        accountId: get(user_info, 'sId'),
        primeCancellation: cancelPrime,
        bingeCancellation: cancelCurrentSub,
    }
    await store.dispatch(cancelSubscription(payload));
    state = store.getState();
    let cancelSubscriptionRes = get(state.subscriptionDetails, 'cancelSubscriptionRes');
    if (cancelSubscriptionRes?.code === 0) {
        store.dispatch(closePopup());
        store.dispatch(openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal error-state-modal',
            headingMessage: get(cancelSubscriptionRes, 'data.deactivateMessage.header'),
            extraInstructions: get(cancelSubscriptionRes, 'data.deactivateMessage.footer'),
            instructions: get(cancelSubscriptionRes, 'data.deactivateMessage.message'),
            primaryButtonText: 'Done',
            primaryButtonAction: () => {
                store.dispatch(closePopup());
                store.dispatch(getCurrentSubscriptionInfo());
            },
            hideCloseIcon: true,
            icon: true,
        }))
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MY_PLAN_CANCEL_PLAN_PROCEED, getAnalyticsData(MIXPANEL));
    } else if (!isEmpty(cancelSubscriptionRes)) {
        store.dispatch(closePopup())
        cancelSubscriptionRes?.response?.status !== ERROR_CODE.ERROR_500 && errorForAPIFailure(cancelSubscriptionRes)
    }
}

export const isPrimeVisible = () => {
    let state = store.getState();
    let primePackDetails = get(state.subscriptionDetails, 'currentSubscription.data.primePackDetails', {});
    let bundleState = get(primePackDetails, 'bundleState');
    return !!(primePackDetails && (bundleState?.toUpperCase() === PRIME_STATUS.ACTIVATED || bundleState?.toUpperCase() === PRIME_STATUS.SUSPENDED));
}

export const journeySourceHeader = (partnerData, checkPlans) => {
    if (!isEmpty(partnerData)) {
        setKey(LOCALSTORAGE.JOURNEY_SOURCE, JOURNEY_SOURCE.HOME_CONTENT);
        setKey(LOCALSTORAGE.JOURNEY_SOURCE_REF_ID, get(partnerData, 'partnerId'))
    } else if (checkPlans) {
        setKey(LOCALSTORAGE.JOURNEY_SOURCE, JOURNEY_SOURCE.DRAWER_CYOP);
        setKey(LOCALSTORAGE.JOURNEY_SOURCE_REF_ID, null)
    } else {
        setKey(LOCALSTORAGE.JOURNEY_SOURCE, JOURNEY_SOURCE.DRAWER_MYOP);
        setKey(LOCALSTORAGE.JOURNEY_SOURCE_REF_ID, null)
    }
};


export const showPaymentSuccessPopup = async (current) => {
    let { openPopup, closePopup } = current.props
    let paymentStatusVerbiage = JSON.parse(getKey(LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE));
    openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal error-state-modal plan-success-modal',
        headingMessage: get(paymentStatusVerbiage, 'header'),
        extraInstructions: get(paymentStatusVerbiage, 'footer'),
        instructions: get(paymentStatusVerbiage, 'message'),
        primaryButtonText: 'Start Watching',
        primaryButtonAction: () => {
            deletePaymentKeysFromLocal();
            deleteKey(LOCALSTORAGE.IS_TSWALLET_PAYMENT_MODE_SUCCESS);
            deleteKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION);
            closePopup();
        },
        hideCloseIcon: true,
        icon: true,
    })
    // mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_SUCCESS, this.getAnalyticsData(MIXPANEL));
}

export const tickTickAnalytics = (event, source) => {
    mixPanelConfig.trackEvent(event, {
        [`${MIXPANEL.PARAMETER.SOURCE}`]: source,
    });
}


/*
Checks if subscription is expired or not and if not then is the partner passed is subscribd with the pack or not
 */
export const checkPartnerSubscriptionType = (providerId) => {
    let state = store.getState();
    let userAccountStatus = get(state, "subscriptionDetails.currentSubscription.data.subscriptionStatus");
    let packExpired = userAccountStatus && userAccountStatus?.toUpperCase() !== SUBSCRIPTION_STATUS.ACTIVE;

    if (packExpired) {
        return SUBSCRIPTION_TYPE_HEADER.EXPIRED;
    } else {
        let result = getPartnerSubscriptionInfo(),
            subscribed, partnerList = getComponentList(result)?.partnerList;

        subscribed = partnerList &&
            partnerList.some((i) => {
                return parseInt(i.partnerId) === parseInt(providerId);
            });

        return subscribed ? SUBSCRIPTION_TYPE_HEADER.SUBSCRIBED : SUBSCRIPTION_TYPE_HEADER.FREEMIUM;
    }
};

export const isUserEligibileForDiscount = (packData) => {
    let filterDiscountedItems = packData.filter(data =>  data.discountList && data.discountList.length > 0)
    return filterDiscountedItems.length > 0;
};