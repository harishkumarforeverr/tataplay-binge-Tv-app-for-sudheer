import get from "lodash/get";
import {LOCALSTORAGE, LOGIN_TYPE, MESSAGE, RESPONSE_STATUS_CODE, SUBSCRIPTION_TYPE} from "@constants";
import store from "@src/store";
import {closePopup, openPopup} from "@common/Modal/action";
import {MODALS} from "@common/Modal/constants";
import {pubnub} from "@config/bootup";
import {checkBingeDTHStatus, safeNavigation, showRechargePopup, updateUserInfo} from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import {ACCOUNT_STATUS, ERROR_MESSAGES, FORM_NAME} from "@containers/BingeLogin/APIs/constants";
import isEmpty from "lodash/isEmpty";
import {hideFooter, hideHeader, hideMainLoader, showMainLoader} from "@src/action";
import {quickRecharge} from "@containers/PackSelection/APIs/action";
import {createBingeUser, loginExistingUser} from "@containers/BingeLogin/APIs/action";
import {deleteKey, getKey, setKey} from "@utils/storage";
import {URL} from "@constants/routeConstants";
import {toast} from "react-toastify";

export const errorForAPIFailure = (error) => {
    let errorResponse = error.response;
    let message = get(errorResponse, 'data.message');
    if (errorResponse && errorResponse.status === RESPONSE_STATUS_CODE.RES_500) {
        store.dispatch(openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal',
            instructions: message ? message : MESSAGE.ERROR_OCCURRED,
            primaryButtonText: 'Ok',
            closeModal: true,
            hideCloseIcon: true,
        }));
    }
}

export const userLoginHandle = (response ,params) => {
    if (response.code === 0) {
        updateUserInfo(response, params);
        pubnub();
        // mixPanelLoginSuccessEvents(params);
    } else {
        // mixPanelLoginFailEvents(response, params);
    }
};

export const mixPanelLoginEvents = (response, params) => {
    if (response) {
        if (response.code === 0) {
            mixPanelLoginSuccessEvents(params);
        } else {
            mixPanelLoginFailEvents(response, params);
        }
    }
};

export const mixPanelLoginSuccessEvents = ({loginWithRMN, authType}) => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_SUCCESS, {
        [`${MIXPANEL.PARAMETER.TYPE}`]: getAnalyticsLoginType(MIXPANEL, loginWithRMN),
        [`${MIXPANEL.PARAMETER.AUTH}`]: getAuthType(authType, MIXPANEL),
        [`${MIXPANEL.PARAMETER.VALUE}`]: getRmnSidValue(loginWithRMN),
    });
    moengageConfig.trackEvent(MOENGAGE.EVENT.LOGIN_SUCCESS, {
        [`${MOENGAGE.PARAMETER.TYPE}`]: getAnalyticsLoginType(MOENGAGE, loginWithRMN),
        [`${MOENGAGE.PARAMETER.AUTH}`]: getAuthType(authType, MOENGAGE),
        [`${MOENGAGE.PARAMETER.VALUE}`]: getRmnSidValue(loginWithRMN),
    });
    deleteKey(LOCALSTORAGE.LOGIN_DETAILS);
    deleteKey(LOCALSTORAGE.LOGIN_SID);
};

export const mixPanelLoginFailEvents = (response, {loginWithRMN, authType}) => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_FAILED, {
        [`${MIXPANEL.PARAMETER.TYPE}`]: getAnalyticsLoginType(MIXPANEL, loginWithRMN),
        [`${MIXPANEL.PARAMETER.AUTH}`]: getAuthType(authType, MIXPANEL),
        [`${MIXPANEL.PARAMETER.VALUE}`]: getKey(LOCALSTORAGE.LOGIN_DETAILS),
        [`${MIXPANEL.PARAMETER.REASON}`]: response.message,
    });
    moengageConfig.trackEvent(MOENGAGE.EVENT.LOGIN_FAILED, {
        [`${MOENGAGE.PARAMETER.TYPE}`]: getAnalyticsLoginType(MOENGAGE, loginWithRMN),
        [`${MOENGAGE.PARAMETER.AUTH}`]: getAuthType(authType, MOENGAGE),
        [`${MOENGAGE.PARAMETER.VALUE}`]: getKey(LOCALSTORAGE.LOGIN_DETAILS),
        [`${MOENGAGE.PARAMETER.REASON}`]: response.message,
    });
    deleteKey(LOCALSTORAGE.LOGIN_DETAILS);
    deleteKey(LOCALSTORAGE.LOGIN_SID);
};

export const getRmnSidValue = (loginWithRMN) => {
    const state = store.getState();
    let userData = get(state.profileDetails, 'userProfileDetails', {}),
        userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    if (loginWithRMN) {
        return userData?.rmn;
    } else {
        return userInfo.sId;
    }
}

export const getAuthType = (authType, analytics) => {
    if (authType === FORM_NAME.OTP) {
        return analytics.VALUE.OTP;
    } else if (authType === FORM_NAME.PASSWORD) {
        return analytics.VALUE.PASSWORD;
    }
}

export const getAnalyticsLoginType = (analytics, loginWithRMN) => {
    let type;
    if (loginWithRMN) {
        type = analytics.VALUE.RMN;
    } else {
        type = analytics.VALUE.SID;
    }
    return type;
};

/*
* Checks if the user is a new user then redirects it to the Eula screen otherwise if its an existing user then checks if it has
* multiple binge account then redirects to binge account selection screen and if it has only singe binge account then the
* dth and binge status flow executes
* */
export const selectSubscriberScreen = (item, updateStepNumber, updateSubscriberDetails, openPopup, history, params) => {
    let stepNo;
    setKey(LOCALSTORAGE.LOGIN_SID, item.subscriberId);
    if (item.accountStatus === ACCOUNT_STATUS.PENDING && item.loginErrorMessage) {
        openPopup(MODALS.ALERT_MODAL, {
            headingMessage: 'Error Message',
            modalClass: 'alert-modal inactive-alert',
            instructions: item.loginErrorMessage,
            primaryButtonText: 'Ok',
            closeModal: true,
            hideCloseIcon: true,
            errorIcon: 'icon-alert-upd',
        })
    } else if (isEmpty(item.accountDetailList)) {
        if (item.loginErrorMessage) {
            nonBingeUserNoSubscriptionPopup({message: item.loginErrorMessage});
        } else {
            let {loginWithRMN, authType} = params;
            createUser(item, loginWithRMN, authType, history, "", openPopup)
        }
    } else {
        if (item.accountDetailList.length > 1) {
            stepNo = 3;
            store.dispatch(hideMainLoader());
            updateStepNumber(stepNo);
        } else {
            if (item.accountDetailList[0].baId === null) {
                store.dispatch(hideMainLoader());
                let {loginWithRMN, authType} = params;
                createUser(item, loginWithRMN, authType, history, item.accountDetailList[0].deviceSerialNumber, openPopup)
            } else {

                loginUser(true, item?.accountDetailList[0], openPopup, history, params);

                /*let subscriptionInformationDTO = item?.accountDetailList[0]?.subscriptionInformationDTO;
                let partnerSubscriptionsDetails = item?.accountDetailList[0]?.partnerSubscriptionsDetails;
                let data = {
                    accountDetailList: item?.accountDetailList[0],
                    history: history,
                    params: params,
                    expiryDate: partnerSubscriptionsDetails?.expirationDate,
                    detailPage: false,
                }

                checkBingeDTHStatus(item?.accountStatus, subscriptionInformationDTO?.bingeAccountStatus, subscriptionInformationDTO?.migrated,
                    subscriptionInformationDTO?.planType, item?.accountSubStatus, data);*/
            }
        }
    }
    updateSubscriberDetails(item);
}

export const loginUser = (loaderShown, item, openPopup, history, params, skip) => {
    let subscriptionType = item?.subscriptionInformationDTO?.subscriptionType?.toUpperCase();
    let isHybridUser = subscriptionType === SUBSCRIPTION_TYPE.ANYWHERE ||
        subscriptionType === SUBSCRIPTION_TYPE.ANDROID_STICK && item?.subscriptionInformationDTO?.migrated;
    let payload = {
        "baId": item.baId,
        "loginType": (get(params, 'authType', LOGIN_TYPE.OTP)),
        "sid": item.subscriberId,
        "isHybrid": isHybridUser,
    };
    !loaderShown && store.dispatch(showMainLoader());

    store.dispatch(loginExistingUser(payload, params)).then((response) => {
        store.dispatch(hideMainLoader());
        loginResponse(response, item, openPopup, history, params, skip)
    }).catch(() => {
        store.dispatch(hideMainLoader());
    });
};

export const loginResponse = (response, item, openPopup, history) => {
    const state = store.getState();
    let accountDetailsFromSid = get(state.bingeLoginDetails, 'accountDetailsFromSid.data');

    if (response && response.code !== 0) {
        if (response.code === 80002) {
            let heading = 'Account Status',
                instructions = response.message,
                rechargeBtn = true,
                skipBtn = false;
            showRechargePopup(heading, instructions, rechargeBtn, skipBtn, openPopup, quickRecharge, history, item.subscriberId, true);
        } else if (response.code === 3006) {
            store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal inactive-alert',
                headingMessage: 'Subscription Inactive',
                instructions: response.message,
                primaryButtonText: 'Ok',
                primaryButtonAction: () => {
                    store.dispatch(closePopup());
                    accountDetailsFromSid.accountDetailList.length === 1 && document.getElementById('back-btn').click();
                },
                closeModal: true,
                isCloseModal: false,
                hideCloseIcon: true,
                errorIcon: 'icon-alert-upd',
            }));
        } else if (response && response.code === 20011) {
            nonBingeUserNoSubscriptionPopup(response);
        } else if (response.code === 200007) {
            response.message = !response.message ? ERROR_MESSAGES.DEVICE_LIMIT : response.message;
            store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal',
                instructions: response && response.message ?
                    response.message : MESSAGE.ERROR_OCCURRED,
                primaryButtonAction: () => {
                    store.dispatch(closePopup());
                    accountDetailsFromSid.accountDetailList.length === 1 && document.getElementById('back-btn').click();
                },
                primaryButtonText: 'Ok',
                hideCloseIcon: true,
            }));
            let sid = getKey(LOCALSTORAGE.LOGIN_SID);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.MAX_DEVICE_LIMIT, {
                [`${MIXPANEL.PARAMETER.SID}`]: sid,
            });
            moengageConfig.trackEvent(MOENGAGE.EVENT.MAX_DEVICE_LIMIT, {
                [`${MOENGAGE.PARAMETER.SID}`]: sid,
            });
        } else if (response.code === 700014) {
            toast(response?.message ? response.message : MESSAGE.ERROR_OCCURRED);
        } else {
            store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal',
                instructions: response && response.message ?
                    response.message : MESSAGE.ERROR_OCCURRED,
                primaryButtonText: 'Ok',
                closeModal: true,
                hideCloseIcon: true,
            }));
        }
    } else if (response?.code === 0) {
        afterLoginView(response, history, item);
    }
};

export const afterLoginView = (response, history, item) => {
    //accountStatus key is binge status and subscriberAccountStatus key is dth account status
    let dthStatus = response?.data?.subscriberAccountStatus,
        subscriptionInformationDTO = response?.data?.subscriptionInformationDTO,
        bingeStatus = subscriptionInformationDTO?.bingeAccountStatus,
        migrated = subscriptionInformationDTO?.migrated,
        packType = subscriptionInformationDTO?.planType,
        accountSubStatus = response?.data?.accountSubStatus;

    if (response?.data?.userAuthenticateToken != null) {
        store.dispatch(hideHeader(false));
        store.dispatch(hideFooter(false));
    }

    let data = {
        history: history,
        expiryDate: item?.partnerSubscriptionsDetails?.expirationDate,
        detailPage: false,
    }

    checkBingeDTHStatus(dthStatus, bingeStatus, migrated, packType, accountSubStatus, data);

    /*if ([ACCOUNT_STATUS.DEACTIVATED, ACCOUNT_STATUS.DEACTIVE, ACCOUNT_STATUS.INACTIVE].includes(dthStatus?.toUpperCase()) ||
        (dthStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE && accountSubStatus?.toUpperCase() === ACCOUNT_STATUS.SUB_STATUS_PARTIALLY_DUNNED)) {
        //DTH status is inactive or partially dunned

        if (bingeStatus?.toUpperCase() === ACCOUNT_STATUS.WRITTEN_OFF || isDBR || isMBR && freePack ||
            isMBR && paidPack && [ACCOUNT_STATUS.DEACTIVATED, ACCOUNT_STATUS.DEACTIVE, ACCOUNT_STATUS.INACTIVE].includes(bingeStatus?.toUpperCase()) ||
            isMBR && paidPack && bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE
        ) {
            //binge subscription type is (written off, DBR FREE (Active/ Inactive), DBR PAID (Active/ Inactive),
            // MBR FREE (Active/ Inactive), MBR PAID (inactive))
            //binge subscription type is MBR PAID (active)
            skip && redirectToHomeScreen(history);
        }
    } else if (dthStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE && accountSubStatus?.toUpperCase() !== ACCOUNT_STATUS.SUB_STATUS_PARTIALLY_DUNNED) {
        if ([ACCOUNT_STATUS.DEACTIVATED, ACCOUNT_STATUS.DEACTIVE, ACCOUNT_STATUS.INACTIVE].includes(bingeStatus?.toUpperCase()) && isMBR) {
            if (skip) {
                redirectToHomeScreen(history);
            } else {
                safeNavigation(history, {
                    pathname: `${URL.PACK_SELECTION}`,
                    search: `?source=${MIXPANEL.VALUE.LOGIN}&aboutSubscription=true&contentRecharge=true`,
                    state: {subscription: 'recharge', accountDropDown: true, source: MIXPANEL.VALUE.LOGIN},
                });
            }
        } else if (bingeStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE && isMBR) {
            if (skip) {
                redirectToHomeScreen(history);
            } else if (get(state.homeDetails, 'dunningRecharge') && get(state.homeDetails, 'dunningRecharge.code') === 0) {
                safeNavigation(history, {
                    pathname: `/${URL.PACK_SELECTION}`,
                    search: `?source=${MIXPANEL.VALUE.LOGIN}&aboutSubscription=true&contentRecharge=true`,
                    state: {subscription: 'recharge', accountDropDown: true, source: MIXPANEL.VALUE.LOGIN},
                })
            } else {
                safeNavigation(history, `/${URL.MY_SUBSCRIPTION}?source=${MIXPANEL.VALUE.LOGIN}`);
            }
            /!*Commented as this was fixed long back but now npt sure if we have this requirement or not*!/
            /!*else if (!response.data.partnerSubscriptionsDetails && response.data.freeTrialAvailed) {
                // free trial availed on ott
                safeNavigation(history, `/${URL.MY_SUBSCRIPTION}?source=Login`);
            }*!/
        } else {
            bingeStatus?.toUpperCase() === ACCOUNT_STATUS.WRITTEN_OFF ?
                safeNavigation(history, `/${URL.PACK_SELECTION}?source=${MIXPANEL.VALUE.LOGIN}`) :
                safeNavigation(history, `/${URL.MY_SUBSCRIPTION}?source=${MIXPANEL.VALUE.LOGIN}`);
        }
    } else if (dthStatus?.toUpperCase() === ACCOUNT_STATUS.TEMP_SUSPENSION) {
        redirectToHomeScreen(history);
    } else {
        redirectToHomeScreen(history);
    }*/
}

export const redirectToHomeScreen = (history) => {
    let isHelpCenterInMobileApp = JSON.parse(getKey(LOCALSTORAGE.IS_HELP_CENTER_IN_MOBILE_APP)) === true;
    isHelpCenterInMobileApp ? safeNavigation(history, `${URL.HELP_CENTER}`) : safeNavigation(history, `${URL.DEFAULT}`);
}

export const maskingFunction = (phoneNumber) => {
    let subNum = phoneNumber.toString().substring(5, 10);
    subNum = `+91 xxxxx${subNum}`;
    return subNum;
};
export const rmnMaskingFunction=(phoneNumber)=>{
    let subNum = phoneNumber.toString().substring(0, 5);
    subNum = `${subNum}xxxxx`;
    return subNum;
}
export const createUser = async (sidDetails, loginWithRMN, authType, history, dsn = "", openPopup, skip = false) => {
    let payload = {
        // "email": sidDetails.emailId,
        "eulaChecked": true,
        "login": authType,
        "subscriberId": sidDetails.subscriberId,
        "dsn": dsn,
        "isHybrid": true,
        "hybrid": true,
    };

    let params = {loginWithRMN, authType};
    store.dispatch(showMainLoader());
    await store.dispatch(createBingeUser(payload, params)).then(res => {
        store.dispatch(hideMainLoader());
        loginResponse(res, sidDetails.accountDetailList[0], openPopup, history, params, skip)
    });
};

export const nonBingeUserNoSubscriptionPopup = (response) => {
    const state = store.getState();
    let accountDetailsFromSid = get(state.bingeLoginDetails, 'accountDetailsFromSid');
    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal',
        instructions: response.message,
        primaryButtonText: 'Okay',
        primaryButtonAction: () => {
            store.dispatch(closePopup());
            if (accountDetailsFromSid && accountDetailsFromSid?.data?.accountDetailList?.length === 1) {
                document.getElementById('back-btn').click();
            } else if (Object.keys(accountDetailsFromSid?.data).length === 0) {
                document.getElementById('back-btn').click();
            }
        },
        closeModal: true,
        isCloseModal: false,
        hideCloseIcon: false,
    }));
}