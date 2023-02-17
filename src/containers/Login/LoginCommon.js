import React from "react";
import { toast } from "react-toastify";
import isEmpty from "lodash/isEmpty";
import { ERROR_CODE, MESSAGE, PARAMS_TYPE, LOGIN_TYPE, LOCALSTORAGE, DTH_TYPE, CODE, TOAST_ID, PRIVATE_DEEPLINKS } from "@constants";
import store from "@src/store";
import { closePopup, openPopup } from "@common/Modal/action";
import { MODALS } from "@common/Modal/constants";
import { pubnub } from "@config/bootup";
import {
    getClientIPDetails,
    updateUserInfo,
    getEnvironmentConstants,
    isUserloggedIn, callLogOut,
    showConfetti,
    getAnalyticsSource,
    safeNavigation,
    isMobile,
    isSubscriptionDiscount,
    noop,
    handleLogoutAllDevices,
} from "@utils/common";
import { createNewBingeUser, updateBingeUser, forceLogout, onManualLogin, updateLoginStep, closeLoginPopup, updateSilentLoginFailed } from "./APIs/actions";
import { setKey, getKey, deleteKey } from "@utils/storage";
import LoginNotNow from "@containers/Login/LoginNotNow";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import trackEvent from "../../utils/trackEvent";
import { URL } from "@constants/routeConstants";
import { openMiniSubscription, setUpdatedTenure, validateSelectedPack, clearPackList, getPlanSummaryUrl, getWebPortalBackLink, getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";
import get from "lodash/get";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";
import { handleSubscriptionCall, isSubscriptionFreemium } from '@containers/Subscription/APIs/subscriptionCommon';
import { fromLoginLoader } from "@src/action";
import { rmnMaskingFunction, redirectToHomeScreen } from "@containers/BingeLogin/bingeLoginCommon";
import { SUBSCRIBED_MESSAGE } from './APIs/constants';
import googleConversionConfig from "@utils/googleCoversion";
import googleConversion from "@utils/constants/googleConversion";
import DeviceManagement from "@containers/DeviceManagement";
import mobile from "@assets/images/mobile.png";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import { history } from "@utils/history";
import FIREBASE from "@utils/constants/firebase";
import _ from "lodash";
import { removePubNubListener } from "@utils/pubnub";

export const userLoginHandle = async (response, params) => {
    if (response.code === 0) {
        let state = store.getState();
        let forceLogoutRes = get(state.loginReducer, 'forceLogoutRes.data');
        if (!isEmpty(forceLogoutRes)) {
            response.data = {
                ...response?.data,
                ...forceLogoutRes,
            }
            // for (const [ key, value ] of Object.entries(forceLogoutRes)) {
            //     response.data[key] = value;
            // }
        }
        await updateUserInfo(response, params);
        pubnub(true);
        // mixPanelLoginSuccessEvents(params);
    } else {
        // mixPanelLoginFailEvents(response, params);
    }
};

export const trackMixpanelError = (message, code) => {
    let discountPageName = isSubscriptionDiscount(history) ? { [`${MIXPANEL.PARAMETER.PAGE_NAME}`]: MIXPANEL.VALUE.DISCOUNTING_PAGE } : {}
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_FAILURE, {
        [`${MIXPANEL.PARAMETER.ERROR}`]: message || MESSAGE.ERROR_OCCURRED,
        [`${MIXPANEL.PARAMETER.ERROR_CODE}`]: code || -1,
        ...discountPageName
    });
}

export const errorForAPIFailure = (message, history) => {
    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal',
        headingMessage: 'Error Message',
        instructions: message ? message : MESSAGE.ERROR_OCCURRED,
        primaryButtonAction: () => {
            {
                history && safeNavigation(history, URL.DEFAULT)
            }
        },
        primaryButtonText: 'Ok',
        errorIcon: 'icon-alert-upd',
        closeModal: true,
        hideCloseIcon: true,
    }));
}

export const updateUser = async (data, onLoginSuccess, history, source, callback, selectedPlan) => {
    const { baId, dthStatus, subscriberId, bingeSubscriberId, loginErrorMessage, rmn, otp, isPastBingeUser,
        userAuthenticateToken, deviceAuthenticateToken, helpCenterSilentLogin, packageId, forceLogout, cartId, temporaryId, silentLoginEvent,
        showLoader = true } = data;

    if (loginErrorMessage) {
        errorForAPIFailure(loginErrorMessage);
        trackEvent.loginFail(data)
        trackMixpanelError(loginErrorMessage)
    } else {
        const params = {
            rmn,
            type: PARAMS_TYPE.LOGIN,
            userAuthenticateToken,
            deviceAuthenticateToken,
            helpCenterSilentLogin
        };
        const payload = {
            dthStatus,
            subscriberId,
            bingeSubscriberId,
            baId,
            login: LOGIN_TYPE.OTP,
            mobileNumber: rmn,
            isPastBingeUser,
            payment_return_url: `${getEnvironmentConstants().ENV_CALLBACK_URL}/${URL.SUBSCRIPTION_TRANSACTION_REDIRECT}`,
            eulaChecked: true,
            packageId,
            cartId,
            temporaryId,
            silentLoginEvent,
        };
        /* when we are passing platform as WEB_SMALL , then at backend that device is not getting registered
        And device remove popup appear for such cases when pubnub push is receive
        to avoid device removal in these case we are storing "BE_REGISTERED_DEVICE" in local storage */
        setKey(LOCALSTORAGE.BE_REGISTERED_DEVICE, JSON.stringify(helpCenterSilentLogin));
        await store.dispatch(updateBingeUser(payload, params, helpCenterSilentLogin, showLoader)).then(async existingUser => {
            if (existingUser?.code === 0) {
                onLoginSuccess && onLoginSuccess(existingUser, data, history, source, callback, selectedPlan, cartId)
                trackEvent.loginSuccess(data);
                trackEvent.completeRegistration();
            } else {
                if (existingUser?.code === 200007) {
                    mixPanelConfig.trackEvent(MIXPANEL.EVENT.MAX_DEVICE_LIMIT, {
                        [`${MIXPANEL.PARAMETER.SID}`]: subscriberId,
                    });
                    mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_LIMIT_POPUP, {
                        [MIXPANEL.PARAMETER.SOURCE]: MIXPANEL.VALUE.LOGIN,
                    });
                    deviceLimitExceededPopup(
                        existingUser,
                        data,
                        history,
                        source,
                        callback,
                    );
                }
                else if (existingUser?.code === ERROR_CODE.ERROR_130007) {
                    const { message, title = "Force Logout" } = existingUser;
                    handleLogoutAllDevices(title, message);
                }
                else {
                    if (get(data, 'silentLoginTimestamp')) {
                        let state = store.getState();
                        let shouldHandleSilentLoginError = !get(state.loginReducer, 'silentLoginFailed');
                        store.dispatch(updateSilentLoginFailed(true));
                        shouldHandleSilentLoginError && updateUser(data, onLoginSuccess, history);
                    } else {
                        existingUser?.response?.status !== CODE.CODE_200 && forceLogout && callLogOut(true, history);
                        existingUser?.response?.status !== ERROR_CODE.ERROR_500 && errorForAPIFailure(existingUser?.message, history)
                        store.dispatch(setUpdatedTenure());
                    }
                }
                trackEvent.loginFail(data);
                trackMixpanelError(existingUser?.message, existingUser?.code);
            }
        }).catch(error => {
            console.log(error, 'error on login')
        });
    }
}

export const createUser = async (data, onLoginSuccess, history, source, callback, selectedPlan) => {
    // baIld : If exist for DTH_WITHOUT_BINGE
    const { loginErrorMessage, rmn, otp, subscriberId, dthStatus, baId, userAuthenticateToken, deviceAuthenticateToken,
        helpCenterSilentLogin, isPastBingeUser, packageId, referenceId, forceLogout, cartId } = data;

    const payload = {
        dthStatus,
        subscriberId,
        login: LOGIN_TYPE.OTP,
        mobileNumber: rmn,
        baId,
        isPastBingeUser,
        eulaChecked: true,
        packageId,
        referenceId,
        source,
        cartId
    };
    const params = { rmn, type: PARAMS_TYPE.LOGIN, userAuthenticateToken, deviceAuthenticateToken };

    await getClientIPDetails();
    if (loginErrorMessage) {
        errorForAPIFailure(loginErrorMessage);
        trackEvent.loginFail(data);
        trackMixpanelError(loginErrorMessage);
    } else {
        trackEvent.loginSuccess(data);
        trackEvent.completeRegistration();
        await store.dispatch(createNewBingeUser(payload, params, helpCenterSilentLogin)).then(newUser => {
            if (newUser?.code === 0) {
                onLoginSuccess && onLoginSuccess(newUser, data, history, source, callback, selectedPlan, cartId);
            } else {
                store.dispatch(setUpdatedTenure());
                newUser?.response?.status !== CODE.CODE_200 && forceLogout && callLogOut(true, history);
                newUser?.response?.status !== ERROR_CODE.ERROR_500 && errorForAPIFailure(newUser?.message);
            }
        });
    }
}

export const notNow = async (props) => {
    let paramData = new URLSearchParams(window.location.search);
    let status = paramData.get('status');
    let cartId = paramData.get('cartId');

    if (props?.isFromCampaign) {
        history.back()
    }
    else if (status === 'login') {
        await store.dispatch(getWebPortalBackLink(cartId));
    } else {
        handleLoginClose(props)
        toast(<LoginNotNow />, {
            autoClose: 3000,
            toastId: TOAST_ID.LOGIN_NOT_NOW_TOAST,
            position: toast.POSITION.BOTTOM_CENTER,
            pauseOnFocusLoss: false,
            className: "login-fail login-toast-wrapper",
        })
    }
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_PAGE_NOTNOW);
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_SKIP);
    dataLayerConfig.trackEvent(DATALAYER.EVENT.NOT_NOW_LOGIN_JOURNEY)
}

export const licenceAgreement = () => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_LIC_AGREEMENT);
}

export const LoginSuccessToast = ({ message = "", freeTrailMessage = "", isFreeTrail = false }) => {
    const messageToShow = isFreeTrail ? freeTrailMessage : message;
    return (
        <div className="login-body-container">
            <div className="login-success-image">
                <img src={`../../assets/images/Success-tick.png`} alt="" />
            </div>
            <div className="login-success-text">
                <div>{messageToShow ? messageToShow : SUBSCRIBED_MESSAGE.SUCCESSFULLY_LOGGED_IN}</div>
                {isFreeTrail && <div className="free-trail">Free Trial Started!</div>}
            </div>
        </div>
    );
};

const toastHandler = (loginFreeTrialAvailed) => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    let { loginToastMessage } = userInfo?.subscriptionStatusInfo;
    toast(
        <LoginSuccessToast
            isFreeTrail={loginFreeTrialAvailed}
            message={loginToastMessage || SUBSCRIBED_MESSAGE.SUCCESSFULLY_LOGGED_IN}
            freeTrailMessage="Successfully Logged in."
        />,
        {
            position: toast.POSITION.BOTTOM_CENTER,
            className: `login-toast-wrapper ${loginFreeTrialAvailed ? "free-trial-toast" : ""
                }`,
        },
    );
}

export const isOldBingeUser = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    let anonymousId = getKey(LOCALSTORAGE.ANONYMOUS_ID);
    let isOldUserloggedIn = isUserloggedIn();
    // let isDthStatusEmpty = isEmpty(userInfo?.dthStatus)
    let isDthStatusEmpty = [DTH_TYPE.DTH_W_BINGE_OLD_USER, DTH_TYPE.DTH_W_BINGE_NEW_USER, DTH_TYPE.DTH_W_BINGE_USER, DTH_TYPE.DTH_WO_BINGE_USER, DTH_TYPE.NON_DTH_USER].includes(userInfo?.dthStatus);
    return isOldUserloggedIn && !anonymousId && !isDthStatusEmpty;
}

export const loginOldBingeUserInFreemium = async (history, counter = 0) => {
    await store.dispatch(forceLogout());
    let state = store.getState();
    let forceLogoutRes = get(state.loginReducer, 'forceLogoutRes.data');
    if (forceLogoutRes) {
        let dthStatus = get(forceLogoutRes, 'dthStatus');
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const data = {
            baId: get(userInfo, "baId"),
            bingeSubscriberId: null,
            dthStatus: get(forceLogoutRes, "dthStatus"),
            subscriberId: get(userInfo, "sId"),
            rmn: get(forceLogoutRes, "rmn"),
            otp: get(forceLogoutRes, "otp"),
            userAuthenticateToken: get(userInfo, "accessToken"),
            deviceAuthenticateToken: get(userInfo, "deviceToken"),
            helpCenterSilentLogin: false,
            isPastBingeUser: get(forceLogout, 'isPastBingeUser'),
            referenceId: get(forceLogoutRes, 'referenceId'),
            forceLogout: true,
            // packageId: updatedTenure?.tenureId||"",
        };
        if (dthStatus === DTH_TYPE.DTH_WO_BINGE_USER) {
            await createUser(data, onLoginSuccess, history);
        } else {
            await updateUser(data, onLoginSuccess, history);
        }
    } else if (counter <= 2) {
        counter += 1
        await loginOldBingeUserInFreemium(history, counter);
    } else {
        // Fallback for API failure
    }
}

const isDetailPage = (history) => {
    const urlArr = history?.location?.pathname.split("/");
    return [URL.DETAIL].includes(urlArr[1])
}

export const onLoginSuccess = async (response, value, history, source = FIREBASE.VALUE.HOME, callback = () => {
}, selectedPlan, cartId) => {
    let loginFreeTrialAvailed = response?.data?.loginFreeTrialAvailed;
        if(isSubscriptionDiscount(history) || (isMobile.any() && history.location?.state?.prevPath === `/${URL.SUBSCRIPTION_DISCOUNT}`)){
            isMobile.any() && safeNavigation(history,URL.SUBSCRIPTION_DISCOUNT)
            callback()
            toastHandler(loginFreeTrialAvailed);
        }
        else if (get(value, 'silentLoginTimestamp')) {
        setKey(LOCALSTORAGE.SILENT_LOGIN_TIMESTAMP, value?.silentLoginTimestamp);
        store.dispatch(openPopup(MODALS.ALERT_MODAL, {
            imageUrl: `../../assets/images/Success-tick.png`,
            modalClass: "alert-modal silent-login-success",
            headingMessage: 'Account Updated Successfully',
            primaryButtonText: 'Ok',
            hideCloseIcon: true,
            primaryButtonAction: async (bingeCheck, primeCheck, newHistory) => {
                redirectToHomeScreen(!isEmpty(newHistory) ? newHistory : history);
            },
        }));
    } else {
        deleteKey(LOCALSTORAGE.HOME_PAGE_LAUNCH_COUNTER);
        deleteKey(LOCALSTORAGE.SHOW_SUBSCRIPTION_POPUP_COUNTER);
        deleteKey(LOCALSTORAGE.NUDGE_LAUNCH_COUNTER);
        await store.dispatch(getCurrentSubscriptionInfo()).then(() => {
            store.dispatch(onManualLogin(source));
        });
        nativeLoginFlow(response, value, history, source = FIREBASE.VALUE.HOME, callback = () => {}, selectedPlan, cartId)
        window.scrollTo(0, 0);
        trackEventsOnLoginSuccess(response, value, history, source);
        store.dispatch(closePopup());
        store.dispatch(openMiniSubscription());
    }
};

export const trackEventsOnLoginSuccess = (response, value, history, source = FIREBASE.VALUE.HOME) => {
    let loginFreeTrialAvailed = response?.data?.loginFreeTrialAvailed,
        state = store.getState(),
        newUser = get(state.loginReducer, "newUser");
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SET_DEFAULT_PROFILE);
    loginFreeTrialAvailed && showConfetti(3 * 1000);
    source = source === FIREBASE.VALUE.PLAY_CLICK ? FIREBASE.VALUE.PLAYBACK : source
    if (loginFreeTrialAvailed) {
        let mixpanelData = {
            [`${MIXPANEL.PARAMETER.SOURCE}`]: getAnalyticsSource(history.location.pathname) || '',
        };
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.START_FREE_TRIAL, mixpanelData);
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.FREE_TRIAL_SUCCESS, {
            [APPSFLYER.PARAMETER.SOURCE]: source,
        });
    }
    let appsFlyerData = {
        [APPSFLYER.PARAMETER.TYPE]: value.rmn,
        [APPSFLYER.PARAMETER.AUTH]: value.otp,
        [APPSFLYER.PARAMETER.VALUE]: rmnMaskingFunction(value.rmn),
        [APPSFLYER.PARAMETER.SOURCE]: source,
    }


    if (newUser && !_.isEmpty(newUser)) {
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SIGN_UP, appsFlyerData);
        trackEvent.signUpEvent(getFireBaseData({ ...value, source }))
    } else {
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.LOGIN_SUCCESS, appsFlyerData);
        googleConversionConfig.trackEvent(googleConversion.EVENT.LOGIN_SUCCESS)
    }
}

export const updateLocalStorage = (response) => {
    setKey(LOCALSTORAGE.ANONYMOUS_ID, get(response, "data.anonymousId"));
    setKey(LOCALSTORAGE.G_AUTH_TOKEN, get(response, "data.gAuthToken"));
}

const deviceLimitExceededPopup = (existingUserRes, data, history, source, closeLoginPopup, onDeviceRemoved) => {
    const state = {
        data: data,
        source: source,
        isBeforeLogin: true,
    }
    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
        imageUrl: mobile,
        modalClass: "device-limit-popup",
        headingMessage: existingUserRes.message,
        instructions: existingUserRes?.subMessage,
        primaryButtonText: `Review Devices`,
        hideCloseIcon: true,
        isCloseModal: isMobile.any(),
        primaryButtonAction: () => {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_LIMIT_REVIEW, {
                [MIXPANEL.PARAMETER.SOURCE]: MIXPANEL.VALUE.LOGIN,
            });
            if (!isMobile.any()) {
                DeviceRemovalModal(onDeviceRemoved, existingUserRes?.subMessage, state)
            } else {
                closeLoginPopup()
                safeNavigation(history, {
                    pathname: `/${URL.DEVICE_MANAGEMENT}`,
                    state: state
                }
                );
            }
        },
        secondaryButtonText: "Not now",
        secondaryButtonAction: () => {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_LIMIT_SKIP, {
                [MIXPANEL.PARAMETER.SOURCE]: MIXPANEL.VALUE.LOGIN,
            })
            notNow()
        },
    }))
}
const DeviceRemovalModal = (onDeviceRemoved, subMessage, state) => {
    store.dispatch(
        openPopup(MODALS.CUSTOM_MODAL, {
            modalClass: "device-listing-popup",
            childComponent: (
                <DeviceManagement isBeforeLogin={true} subTitle={subMessage} onDeviceRemoved={onDeviceRemoved}
                    pathState={state} />
            ),
            hideCloseIcon: true,
        }),
    );
}
export const handleLoginClose = (props) => {
    let paramData = new URLSearchParams(window.location.search),
        action = paramData.get('action'),
        isAppsFlyerDeeplinkUrl = PRIVATE_DEEPLINKS.includes(action),
        state = store.getState();
    store.dispatch(closePopup());
    store.dispatch(openMiniSubscription());
    isAppsFlyerDeeplinkUrl && props?.history && safeNavigation(props.history, URL.DEFAULT);

    if (state?.loginReducer?.showLoginPopup) {
        store.dispatch(closeLoginPopup());
        store.dispatch(updateLoginStep(1));
    }
};

export const getFireBaseData = (value) => {
    return {
        [FIREBASE.PARAMETER.TYPE]: FIREBASE.VALUE.RMN,
        [FIREBASE.PARAMETER.AUTH]: FIREBASE.VALUE.OTP,
        [FIREBASE.PARAMETER.VALUE]: rmnMaskingFunction(value.rmn),
        [FIREBASE.PARAMETER.SOURCE]: value?.source,
    }
}

export const nativeLoginFlow = (response, value, history, source = FIREBASE.VALUE.HOME, callback = () => {}, selectedPlan, cartId) =>{
    let loginFreeTrialAvailed = response?.data?.loginFreeTrialAvailed,
    state = store.getState(),
    isManagedApp = get(state.headerDetails, "isManagedApp"),
    userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    if(!isManagedApp){
        miniLoginSuccess(userInfo, loginFreeTrialAvailed, history, callback, selectedPlan)
    }else{
        tickTickLoginSuccess(userInfo, loginFreeTrialAvailed, history, callback, cartId)
    }
}


export const miniLoginSuccess = async (userInfo, loginFreeTrialAvailed, history, callback, selectedPlan) => {
    let state = store.getState(),
    isNonFreemiumDthUser = !isSubscriptionFreemium() && userInfo?.dthStatus !== DTH_TYPE.NON_DTH_USER, // non freemium and non dth user
    updatedTenure = get(state.subscriptionDetails, 'selectedTenureValue'),
    newUser = get(state.loginReducer, "newUser");
    if (userInfo?.subscriptionStatusInfo) {
        let { loginToastFlag, nonSubscribedToSamePack, allowPG } = userInfo?.subscriptionStatusInfo;
        if (!updatedTenure || isEmpty(updatedTenure) || loginToastFlag) {
            // normal login flow with toast message
            if (!isDetailPage(history)) {
                if (history.location?.state?.isFromPi) {
                    setKey(LOCALSTORAGE.PI_DETAIL_URL, history.location.state.url);
                    setKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI, `true`)
                }
                history.location?.state?.isFromPi ? safeNavigation(history, `${history.location?.state?.url}`) : safeNavigation(history, URL.DEFAULT);
                loginToastFlag && toastHandler(loginFreeTrialAvailed);
            }
            callback();
        } else if (nonSubscribedToSamePack) {
            callback();
            await store.dispatch(clearPackList())
            safeNavigation(history, {
                pathname: URL.SUBSCRIPTION,
                state: { tenureOpen: true, selectedPlan: selectedPlan },
            });
            toastHandler(loginFreeTrialAvailed);
        } else if (allowPG) {
            if (isNonFreemiumDthUser) {
                // if user is non-freemium i.e subscriptionType !== FREEMIUM and non dth user,
                // then in this case add and modify will be called on Make payment button click on balane info page
                setKey(LOCALSTORAGE.IS_NON_FREEMIUM_NON_DTH_SUBSCRIPTION_FLOW, true);
                safeNavigation(history, `/${URL.BALANCE_INFO}`);
                // this.handleLoginClose();
                callback();
                toastHandler(loginFreeTrialAvailed);
            } else {
                // pack validate API will be called only for FREEMIUM users.
                store.dispatch(fromLoginLoader(true))
                setTimeout(async () => {
                    isSubscriptionFreemium() && await store.dispatch(validateSelectedPack(updatedTenure?.tenureId));
                    await handleSubscriptionCall(history, true)
                    store.dispatch(fromLoginLoader(false))
                    callback();
                    toastHandler(loginFreeTrialAvailed);
                }, 4000)
            }
        } else {
            callback();
            !isDetailPage(history) && safeNavigation(history, URL.DEFAULT);
        }
    } else {
        callback();
        !isDetailPage(history) && safeNavigation(history, URL.DEFAULT);
    }

    let { loginToastFlag, allowPG, nonSubscribedToSamePack } = userInfo?.subscriptionStatusInfo;
    if ((!loginToastFlag && !allowPG && !nonSubscribedToSamePack) || (!isEmpty(newUser) && isEmpty(updatedTenure) && !loginToastFlag && !nonSubscribedToSamePack)) {
        toastHandler(loginFreeTrialAvailed);
    }

}

export const tickTickLoginSuccess = async(userInfo, loginFreeTrialAvailed, history, callback, cartId) =>{
    if (userInfo?.subscriptionStatusInfo) {
      let { loginToastFlag, nonSubscribedToSamePack, allowPG } =
        userInfo?.subscriptionStatusInfo;
      if (loginToastFlag) {
        // normal login flow with toast message
        if (!isDetailPage(history)) {
          if (history.location?.state?.isFromPi) {
            setKey(LOCALSTORAGE.PI_DETAIL_URL, history.location.state.url);
            setKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI, `true`);
          }
          history.location?.state?.isFromPi
            ? safeNavigation(history, `${history.location?.state?.url}`)
            : safeNavigation(history, URL.DEFAULT);
        }
      } else if (nonSubscribedToSamePack) {
        cartId && (await store.dispatch(getPlanSummaryUrl(cartId)));
      } else if (allowPG) {
        cartId && (await store.dispatch(getPlanSummaryUrl(cartId)));
      } else {
        !isDetailPage(history) && safeNavigation(history, URL.DEFAULT);
      }
    }
        callback();
        toastHandler(loginFreeTrialAvailed);
}