import {CURRENT_SUBSCRIPTION} from "@containers/MySubscription/constant";
import store from "@src/store";
import {MODALS} from "@common/Modal/constants";
import {dthBingePopup, getParamsAPICall, safeNavigation, showNoInternetPopup, tempSuspendedPopup,getAnalyticsSource} from "@utils/common";
import {closePopup, openPopup} from "@common/Modal/action";
import {hideMainLoader, showMainLoader} from "@src/action";
import {cancelPack, clearCancelRevokeData, resumePack} from "@containers/MySubscription/APIs/action";
import {LOCALSTORAGE, PACK_TYPE, SUBSCRIPTION_TYPE} from "@constants";
import {getCurrentSubscriptionInfo} from "@containers/PackSelection/APIs/action";
import get from "lodash/get";
import {ACCOUNT_STATUS, CANCEL_RESUME_ACTION} from "@containers/BingeLogin/APIs/constants";
import {PACK_STATUS, SUBSCRIPTION_SUMMARY} from "@containers/PackSelection/constant";
import isEmpty from 'lodash/isEmpty';
import {URL} from "@routeConstants";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import {getDateFromString} from "@utils/common";
import {getKey} from "@utils/storage";
import React from "react";
import appsFlyerConfig from "@utils/appsFlyer";

export const cancelResumeSubscription = (currentState, action, bingeCancel, primeCancel) => {
    const {packSelectionDetail: {currentSubscription} = {}} = store.getState();
    const {data: {primePackDetails, cancelLinkMessage}} = currentSubscription;
    /* if (primePackDetails?.packStatus && primePackDetails?.bundleState !== PRIMESTATUS.CANCELLED && !bingeCancel && !primeCancel && !action) {
         packCancellationSelectionPopup(currentState);
     } else {*/
    if (action === CANCEL_RESUME_ACTION.CANCEL && !isEmpty(cancelLinkMessage)) {
        store.dispatch(openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal downgrade',
            headingMessage: cancelLinkMessage,
            primaryButtonText: 'Ok',
            errorIcon: 'icon-alert-upd',
            primaryButtonAction: () => closePopup(),
            hideCloseIcon: true,
        }));
    } else {
        cancelResumeConfirmationPopup(currentState, action, bingeCancel, primeCancel);
    }
    //}
}

export const packCancellationSelectionPopup = (currentState) => {
    const {packSelectionDetail: {currentSubscription} = {}} = store.getState();
    if (currentSubscription) {
        const {data: {packName, packPrice}} = currentSubscription;
        let headingMessage, btnAction, primaryButtonText, iconCheck, className;
        headingMessage = "Select the subscription you would like to cancel";
        primaryButtonText = 'Proceed';
        btnAction = (bingeCancel, primeCancel) => cancelResumeSubscription(currentState, bingeCancel, primeCancel);
        iconCheck = false;
        className = 'select-pack';
        openPopupCases(headingMessage, primaryButtonText, btnAction, iconCheck, className, '', '', true, packName, packPrice);
    }
}

export const getCancelResumeHeader = () => {
    const {packSelectionDetail: {currentSubscription} = {}} = store.getState();
    const {data: {verbiage, cancelled}} = currentSubscription;
    if (cancelled) {
        if (verbiage?.revokeSubs.title) {
            return verbiage.revokeSubs.title;
        } else {
            return CURRENT_SUBSCRIPTION.RESUME_SUBSCRIPTION_POPUP;
        }
    } else {
        if (verbiage?.cancelSubs.confirmationDialogBox?.title) {
            return verbiage.cancelSubs.confirmationDialogBox.title;
        } else {
            return CURRENT_SUBSCRIPTION.CANCEL_SUBSCRIPTION_POPUP;
        }
    }
};

export const cancelResumeConfirmationPopup = (currentState, action, bingeCancel = false, primeCancel = false) => {
    const {packSelectionDetail: {currentSubscription} = {}} = store.getState();
    const {data: {primePackDetails}} = currentSubscription;
    let headingMessage, btnAction, primaryButtonText, iconCheck, className, instructions, secondaryBtnAction;

    headingMessage = getCancelResumeHeader();
    primaryButtonText = 'Yes';
    btnAction = () => subscriptionCancelResumeApi(currentState, !primeCancel ? true : bingeCancel, primeCancel);
    iconCheck = action === CANCEL_RESUME_ACTION.RESUME ? 'icon-my-subscription-1' : 'icon-remove-phon';
    className = action === CANCEL_RESUME_ACTION.RESUME ? 'resume-alert' : 'cancel-alert';
    instructions = instructionMessage();
    secondaryBtnAction = () => skipJourney(action);
    let timeout;
    /*  if (primePackDetails?.packType) {
          timeout = 50;
      }*/
    if (navigator.onLine) {
        setTimeout(() => {
            openPopupCases(headingMessage, primaryButtonText, btnAction, iconCheck, className, '', instructions,
                false, '', '', secondaryBtnAction)
        }, timeout);
    } else {
        showNoInternetPopup();
    }
}

export const skipJourney = (action) => {
    if (action === CANCEL_RESUME_ACTION.RESUME) {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_REVOKE_SKIP);
        moengageConfig.trackEvent(MOENGAGE.EVENT.PACK_REVOKE_SKIP);
    } else {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_CANCEL_SKIP);
        moengageConfig.trackEvent(MOENGAGE.EVENT.PACK_CANCEL_SKIP);
    }
    store.dispatch(closePopup());
}
/*
* Generic method to open popup
 */
export const openPopupCases = (headingMessage, primaryButtonText, btnAction, icon, className, errorIcon, instruction, cancelCheck, packName, packPrice, secondaryBtnAction) => {
    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal downgrade cancel-resume ' + className,
        headingMessage: headingMessage,
        errorIcon: icon,
        primaryButtonText: primaryButtonText,
        primaryButtonAction: btnAction,
        closeModal: true,
        icon: errorIcon,
        instructions: instruction,
        hideCloseIcon: true,
        packName: packName,
        packPrice: packPrice,
        secondaryButtonText: secondaryBtnAction && 'Cancel',
        secondaryButtonAction: secondaryBtnAction ? secondaryBtnAction : () => closePopup(),
        cancelCheck: cancelCheck,
    }));
}

export const instructionMessage = () => {
    const {packSelectionDetail: {currentSubscription} = {}} = store.getState();
    const {data: {primePackDetails, verbiage, cancelled}} = currentSubscription;
    if (!isEmpty(primePackDetails) && Object.keys(primePackDetails).length > 0) {
        /*
        Commented code implemented for future
         */
        /* if (verbiage?.cancelSubs.confirmationDialogBox?.message) {
             return verbiage.cancelSubs.confirmationDialogBox.message;
         } else {
             return CURRENT_SUBSCRIPTION.CANCEL_BINGE_PRIME_SUBSCRIPTION;
         }*/
    }

    if (!cancelled) {
        if (verbiage?.cancelSubs?.confirmationDialogBox?.subTitle) {
            return verbiage.cancelSubs.confirmationDialogBox.subTitle;
        }
    }
}
/*
    This method invokes the corresponding cancel or resume api
 */

export const subscriptionCancelResumeApi = async (currentState, bingeCancel = false, primeCancel = false) => {
    const {packSelectionDetail: {currentSubscription} = {}} = store.getState();
    const {data: {cancelled}} = currentSubscription;
    if (!cancelled) {
        store.dispatch(showMainLoader());
        await store.dispatch(cancelPack(bingeCancel, primeCancel));
        store.dispatch(hideMainLoader());
        const {mySubscriptionReducer: {cancelData} = {}} = store.getState();
        currentState.setStateApiSuccess(cancelData);
    } else {
        store.dispatch(showMainLoader());
        await store.dispatch(resumePack());
        store.dispatch(hideMainLoader());
        const {mySubscriptionReducer: {resumeData} = {}} = store.getState();
        currentState.setStateApiSuccess(resumeData);
    }
}
/*
    Returns the header to be shown in popup after cancel api is hit
 */

export const getCancellationConfirmationHeader = () => {
    const {
        mySubscriptionReducer: {cancelData = {}} = {},
    } = store.getState();
    let cancelDataCode = cancelData.code === 0;
    if (cancelDataCode) {
        if (!isEmpty(cancelData?.data?.cancelMessage?.title)) {
            return cancelData.data.cancelMessage.title;
        } else {
            return CURRENT_SUBSCRIPTION.CANCELLATION_REQUEST_TAKEN;
        }
    } else {
        if (!isEmpty(cancelData?.message)) {
            return cancelData.message;
        } else {
            return CURRENT_SUBSCRIPTION.CANCELLATION_ERROR_HEADER;
        }
    }
}

/*
Returns the instructions to be shown in popup after cancel api is hit
*/

export const getCancelConfirmationInstructions = () => {
    const {
        mySubscriptionReducer: {cancelData = {}} = {},
    } = store.getState();
    let cancelDataCode = cancelData.code === 0;
    if (cancelDataCode) {
        /*
           Commented code implemented for future
       */
        /* if (!isEmpty(cancelData?.data?.cancelMessage?.message)) {
             let msg = cancelData?.data?.cancelMessage?.message;
             if (!isEmpty(cancelData?.data?.cancelMessage?.primeMessage)) {
                 msg = msg + cancelData?.data?.cancelMessage?.primeMessage;
             }
             return msg;
         }
         return '';*/
        if (!isEmpty(cancelData?.data?.cancelMessage?.message)) {
            return cancelData.data.cancelMessage.message;
        }
    }
}

/*
    Returns the header to be shown in popup after revoke api is hit
 */

export const getRevokeConfirmationHeader = () => {
    const {
        mySubscriptionReducer: {resumeData = {}} = {},
    } = store.getState();
    let resumeDataCode = resumeData.code === 0;
    if (resumeDataCode) {
        if (!isEmpty(resumeData?.data?.revokeMessage?.title)) {
            return resumeData.data.revokeMessage.title;
        } else {
            return CURRENT_SUBSCRIPTION.RESUME_SUBSCRIPTION_POPUP_SUCCESS;
        }
    } else {
        if (!isEmpty(resumeData?.message)) {
            return resumeData.message;
        } else {
            return CURRENT_SUBSCRIPTION.RESUME_ERROR_HEADER;
        }
    }
}

/*
    Returns the instructions to be shown in popup after revoke api is hit
 */

export const getRevokeConfirmationInstructions = () => {
    const {
        mySubscriptionReducer: {resumeData = {}} = {},
    } = store.getState();
    let resumeDataCode = resumeData.code === 0;
    if (resumeDataCode) {
        if (!isEmpty(resumeData?.data?.revokeMessage?.message)) {
            return resumeData.data.revokeMessage.message;
        }
    }
}

export const primaryBtnAction = () => {
    store.dispatch(showMainLoader());
    store.dispatch(getCurrentSubscriptionInfo());
    store.dispatch(clearCancelRevokeData());
    setTimeout(() => store.dispatch(hideMainLoader()), 500);
};

/*
    Method which tells whether cancellation or resume of the subscription was successful or not (i.e. success pop-up or error pop-up is shown)
 */
export const cancelResumeNotifications = () => {
    const {
        packSelectionDetail: {currentSubscription} = {},
        mySubscriptionReducer: {cancelData = {}, resumeData = {}} = {},
    } = store.getState();
    if (currentSubscription) {
        let primaryButtonText, instruction, errorIcon, iconCheck, headingMessage, btnAction, className;

        if (!isEmpty(cancelData) && isEmpty(resumeData)) {
            let cancelDataCode = cancelData.code === 0;
            headingMessage = getCancellationConfirmationHeader();
            instruction = getCancelConfirmationInstructions();
            errorIcon = cancelDataCode;
            iconCheck = cancelDataCode ? '' : 'icon-alert-upd';
            primaryButtonText = 'Ok';
            trackPackCancellationEvent();
            className = 'cancel-alert cancel-success';
        } else if (!isEmpty(resumeData) && isEmpty(cancelData)) {
            let resumeDataCode = resumeData.code === 0;
            headingMessage = getRevokeConfirmationHeader();
            instruction = getRevokeConfirmationInstructions();
            errorIcon = resumeDataCode;
            iconCheck = resumeDataCode ? '' : 'icon-alert-upd';
            primaryButtonText = 'Proceed';
            trackPackResumeEvent(MIXPANEL.VALUE.MY_ACCOUNT);
            className = 'resume-alert cancel-success';
        }

        btnAction = () => {
            primaryBtnAction();
        };

        openPopupCases(headingMessage, primaryButtonText, btnAction, iconCheck,
            className, errorIcon, instruction, false, '', '');
    }
}

export const trackPackResumeEvent = (source) => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.CANCELLATION_REVOKED, {
        [`${MIXPANEL.PARAMETER.SOURCE}`]: source,
        [`${MIXPANEL.PARAMETER.REVOKED_ON}`]: new Date().toISOString(),
    });
    moengageConfig.trackEvent(MOENGAGE.EVENT.CANCELLATION_REVOKED, {
        [`${MOENGAGE.PARAMETER.SOURCE}`]: source,
        [`${MOENGAGE.PARAMETER.REVOKED_ON}`]: new Date(),
    });
};

export const trackPackCancellationEvent = () => {
    const {
        mySubscriptionReducer: {cancelData = {}} = {},
    } = store.getState();
    let mixPanelData, moengageData, data;

    let bingeCancelled = !isEmpty(cancelData?.data?.cancelMessage?.title);
    let primeCancelled = !isEmpty(cancelData?.data?.amazonPrimeVideoExpiryDate);

    data = {
        [`${MIXPANEL.PARAMETER.BINGE_CANCELLATION}`]: bingeCancelled ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
        [`${MIXPANEL.PARAMETER.PRIME_CANCELLATION}`]: MIXPANEL.VALUE.NO,
        //Future code
        // !isEmpty(cancelData?.data?.amazonPrimeVideoExpiryDate) ? MIXPANEL.VALUE.YES: MIXPANEL.VALUE.NO,
    }

    if (bingeCancelled) {
        data = {
            ...data,
            [`${MIXPANEL.PARAMETER.BINGE_CANCELLATION_DATE}`]: getDateFromString(cancelData?.data?.bingeSubscriptionExpiryDate).toISOString(),
        };

        mixPanelData = {
            [`${MIXPANEL.PARAMETER.BINGE_RAISED_ON}`]: new Date().toISOString(),
        };

        moengageData = {
            [`${MOENGAGE.PARAMETER.BINGE_RAISED_ON}`]: new Date(),
        };
    }

    if (primeCancelled) {
        data = {
            ...data,
            [`${MIXPANEL.PARAMETER.PRIME_RAISED_ON}`]: null,
            [`${MIXPANEL.PARAMETER.PRIME_CANCELLATION_DATE}`]: null,
            //Future code
            //cancelData?.data?.amazonPrimeVideoExpiryDate
        };

        mixPanelData = {
            ...mixPanelData,
            //Future code
            // [`${MIXPANEL.PARAMETER.PRIME_RAISED_ON}`]: new Date().toISOString(),
        };

        moengageData = {
            ...moengageData,
            //Future code
            // [`${MOENGAGE.PARAMETER.PRIME_RAISED_ON}`]: new Date(),
        };
    }

    mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_CANCELLATION, {...mixPanelData, ...data});
    moengageConfig.trackEvent(MOENGAGE.EVENT.PACK_CANCELLATION, {...moengageData, ...data});
};

/**
 * method returning text expires and expired on basis of status
 * @returns {string}
 */
export const showExpiryInfo = (data) => {
    if (data && get(data, 'migrated')) {
        const {status, expirationDate} = data;
        if (status?.toUpperCase() === ACCOUNT_STATUS.ACTIVE) {
            return data.packType.toLowerCase() === PACK_TYPE.FREE ? `${SUBSCRIPTION_SUMMARY.FREE_TRIAL} ${expirationDate}` :
                `${CURRENT_SUBSCRIPTION.RENEWAL} ${expirationDate}`;
        } else if (status?.toUpperCase() === ACCOUNT_STATUS.DEACTIVE || status?.toUpperCase() === ACCOUNT_STATUS.DEACTIVATED) {
            return `${CURRENT_SUBSCRIPTION.EXPIRED} ${expirationDate}`;
        }
    }
}

/*Checks for user dth status  and if it is inactive, temp suspended or partially dunned then show popup on modify btn click*/
export const checkDTHStatus = (currentSubscription, history) => {
    if (currentSubscription?.modifyLinkMessage) {
        let popupData = {};
        if (([ACCOUNT_STATUS.DEACTIVATED, ACCOUNT_STATUS.DEACTIVE].includes(currentSubscription?.dthStatus?.toUpperCase())) ||
            (currentSubscription?.dthStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE
                && currentSubscription?.accountSubStatus?.toUpperCase() === ACCOUNT_STATUS.SUB_STATUS_PARTIALLY_DUNNED)
        ) {
            popupData = {
                header: 'Alert',
                instructions: currentSubscription?.modifyLinkMessage ? currentSubscription?.modifyLinkMessage :
                    'Please recharge and activate your account to modify subscription.',
                primaryBtnText: 'Recharge',
                secondaryBtnText: 'Skip',
            };
            const {sId} = getParamsAPICall();
            dthBingePopup(history, popupData);
        } else if (currentSubscription?.dthStatus?.toUpperCase() === ACCOUNT_STATUS.TEMP_SUSPENSION) {
            popupData = {
                header: 'Alert',
                instructions: currentSubscription?.modifyLinkMessage ? currentSubscription?.modifyLinkMessage :
                    'Please call Customer Care on 1800 208 6633 and resume services to modify.',
                primaryBtnText: 'Ok',
            };
            tempSuspendedPopup(history, popupData);
        }
    } else {
        if (currentSubscription.packType.toLowerCase() === PACK_TYPE.FREE) {
            if (currentSubscription?.mobileUpgradable) {
                safeNavigation(history, {
                    pathname: `/${URL.UPGRADE_FREE_TRIAL}`,
                    state: {
                        from: history?.location?.pathname,
                    },
                    search: `?source=${MIXPANEL.VALUE.MY_ACCOUNT}`,
                });
            } else {
                safeNavigation(history, `/${URL.PACK_SELECTION}?source=${MIXPANEL.VALUE.MY_ACCOUNT}&modifyAboutSubscription=true`);
            }
        } else {
            safeNavigation(history, `/${URL.PACK_SELECTION}?source=${MIXPANEL.VALUE.MY_ACCOUNT}&modifyAboutSubscription=true`);
        }
    }
}
/**
 * Method to execute if subscription creation or modification APi fails
 */
export const subscriptionFailure = (createModifyData, history) => {

    let headerMessage, headingMessage, instruction, btnAction, errorIcon, primaryButtonText, modalClass = '', icon = false;
    const {message, code} = createModifyData;
    
    if (code === 3007 || code === 100014) {
        headerMessage = SUBSCRIPTION_SUMMARY.CANNOT_DOWNGRADE
    } else if (code === 40019) {
        headerMessage = SUBSCRIPTION_SUMMARY.CANNOT_DOWNGRADE_UPDATED
    } else if (code === 100019) {
        headerMessage = 'Please wait'
    } else {
        headerMessage = SUBSCRIPTION_SUMMARY.SOMETHING_WENT_WRONG
    }

    // const codeCreate = createModifyData.code;
    headingMessage = headerMessage;
    instruction = message ? message : SUBSCRIPTION_SUMMARY.OPERATION_NOT_COMPLETED;
    primaryButtonText = SUBSCRIPTION_SUMMARY.OK;
    btnAction = () => {
        safeNavigation(history, `/${URL.MY_SUBSCRIPTION}`);
    }
    errorIcon = 'icon-alert-upd';

    subscriptionSuccessFailurePopup({modalClass, headingMessage, instruction, icon, primaryButtonText, btnAction, errorIcon});

    trackSubscriptionFailureEvent(message);
}

export const subscriptionSuccessFailurePopup = (data) => {
    let {modalClass, headingMessage, instruction, icon, primaryButtonText, btnAction, errorIcon} = data;
    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal downgrade ' + modalClass,
        headingMessage: headingMessage,
        instructions: instruction,
        icon: icon,
        primaryButtonText: primaryButtonText,
        primaryButtonAction: btnAction,
        errorIcon: errorIcon,
        closeModal: true,
        hideCloseIcon: true,
    }));
}

export const trackSubscriptionFailureEvent = (message) => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_FAILED, {
        [`${MIXPANEL.PARAMETER.REASON}`]: message || '',
    });

    moengageConfig.trackEvent(MOENGAGE.EVENT.SUBSCRIBE_FAILED, {
        [`${MOENGAGE.PARAMETER.REASON}`]: message || '',
    });

    appsFlyerConfig.trackSubscriptionFailed(message);
    
};

export const getSubscriptionSummaryBottomText = (data) => {
    if (data.subscriptionType === SUBSCRIPTION_TYPE.ATV) {
        return CURRENT_SUBSCRIPTION.ATV_STICK
    } else if (data.subscriptionType === SUBSCRIPTION_TYPE.ANYWHERE && !isEmpty(data.subscriptionInformationDTO.complementaryPlan)) {
        return data.subscriptionInformationDTO.complementaryPlan
    } else if (data.subscriptionType === SUBSCRIPTION_TYPE.ANDROID_STICK) {
        return CURRENT_SUBSCRIPTION.FIRESTICK
    } else if (data.subscriptionType === SUBSCRIPTION_TYPE.ANYWHERE && data.largeScreenEligibility && data.ocsFlag === "Y" && !data.fsTaken) {
        return CURRENT_SUBSCRIPTION.FIRESTICK_ELIGIBLE
    }
}

export const showBillingPeriodText = (data, packStatus, bingeAccountStatus) => {
    let packType = get(data, 'packType');
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

    if (packType.toLowerCase() !== PACK_TYPE.FREE) {
        /**
         * Check if user is upgrading or downgrading the pack
         */
        if ((packStatus === PACK_STATUS.UPGRADE || packStatus === PACK_STATUS.DOWNGRADE) ||
            /**
             * Check if user is selecting the same pack but the pack is expired
             */
            (packStatus === "" && bingeAccountStatus && (bingeAccountStatus.toUpperCase() === ACCOUNT_STATUS.DEACTIVE
                || bingeAccountStatus.toUpperCase() === ACCOUNT_STATUS.DEACTIVATED))) {
            return CURRENT_SUBSCRIPTION.BILLING_PERIOD;
        }
    }

    if (userInfo.dummyUser) {
        return CURRENT_SUBSCRIPTION.BILLING_PERIOD;
    }
};

export const getHeaderLeft = (data, showExpiryText, currentSubscription, packStatus, bingeAccountStatus, subscriptionSummary, expiredCheck) => {
    return <div className="my-subscription-header-left">
        <h5>{data.title || data.packName}</h5>
        {
            showExpiryText &&
            <p className={currentSubscription && data.status !== ACCOUNT_STATUS.ACTIVE ? 'expired' : ''}>
                {showBillingPeriodText(data, packStatus, bingeAccountStatus)}
                <div>{subscriptionSummary ? expiredCheck(data) : data.subscriptionExpiryMessage}</div>
            </p>
        }
    </div>
};

export const getHeaderRight = (data) => {
    return <div className="my-subscription-header-right">
                            <span className={'pack-price'}>₹
                            <span className={'price'}>{data.price || parseInt(data.packPrice)}</span>
                            <span> per {data.renewalCycle?.toLowerCase()}</span>
                            </span>
    </div>
};