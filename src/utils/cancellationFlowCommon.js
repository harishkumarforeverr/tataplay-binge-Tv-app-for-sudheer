import {getKey, setKey} from "@utils/storage";
import {COMMON_ERROR, LOCALSTORAGE} from "@constants";
import {MODALS} from "@common/Modal/constants";
import {createCancelSubscriberAccount, getAccountDetailsFromSid} from "@containers/BingeLogin/APIs/action";
import store from "@src/store";
import {closePopup, openPopup} from "@common/Modal/action";
import {
    safeNavigation,
    switchAccount,
} from "@utils/common";
import {URL} from "@routeConstants";
import get from "lodash/get";
import {getProfileDetails} from "@containers/Profile/APIs/action";
import {getCurrentSubscriptionInfo} from "@containers/PackSelection/APIs/action";
import {toast} from "react-toastify";


/**
 * @function setDeviceStatus - will set the value of deviceCancellationFlag in local storage
 */
export const setDeviceStatus = (value) => {
    setKey(LOCALSTORAGE.DEVICE_CANCELLATION_FLAG, JSON.stringify(value));
}

/**
 * @function setDeviceStatus - will return the value of deviceCancellationFlag from local storage
 */
export const getDeviceStatus = () => {
    return JSON.parse(getKey(LOCALSTORAGE.DEVICE_CANCELLATION_FLAG));
}

/**
 * @function handleCancelledUserSwitch will call switch API or will redirect basis conditions added
 * @param accountDetailsFromSid
 * @param history
 */
export const handleCancelledUserSwitch = (accountDetailsFromSid, history) => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let targetItemDetail = accountDetailsFromSid?.data?.accountDetailList[0];
    let listLength = get(accountDetailsFromSid, 'data.accountDetailList').length;
    listLength === 1 ? switchAccount(targetItemDetail, userInfo.baId, history) :  history.push(`/${URL.SWITCH_ACCOUNT}`)
}

/**
 * @function handleDeviceCancelledUser - will handle the scenarios when device status cancelled is true
 * @param history
 * @param silentSubscribe
 * @param packSelectionSource
 * @returns {Promise<void>}
 */
export const handleDeviceCancelledUser = async (history, silentSubscribe = false, packSelectionSource) => {
    await store.dispatch(getAccountDetailsFromSid());
    const {bingeLoginDetails} = store.getState();
    let accountDetailsFromSid = get(bingeLoginDetails, 'accountDetailsFromSid');

    if (accountDetailsFromSid && accountDetailsFromSid?.code === 0) {
        if (accountDetailsFromSid?.data?.accountDetailList?.length > 0) {
            store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal common-modal-css',
                headingMessage: accountDetailsFromSid?.data?.bingeSubscriptionHeader,
                instructions: accountDetailsFromSid?.data?.bingeSubscriptionMessage,
                primaryButtonText: 'Switch',
                primaryButtonAction: () => handleCancelledUserSwitch(accountDetailsFromSid, history),
                closeModal: true,
                hideCloseIcon: true,
                errorIcon: 'icon-alert-upd',
            }))
        }
        else {
            if (silentSubscribe) {
               await handleNoSubscriptionCancelledUser(history, packSelectionSource)
            } else {
                store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal common-modal-css',
                    headingMessage: accountDetailsFromSid?.data?.bingeSubscriptionHeader,
                    instructions: accountDetailsFromSid?.data?.bingeSubscriptionMessage,
                    primaryButtonText: 'Subscribe Now',
                    secondaryButtonText: 'Cancel',
                    primaryButtonAction: () => handleNoSubscriptionCancelledUser(history, packSelectionSource),
                    secondaryButtonAction: () => store.dispatch(closePopup()),
                    closeModal: true,
                    hideCloseIcon: true,
                    errorIcon: 'icon-alert-upd',
                }))
            }
        }
    }

}

/**
 * @function handleCreateUserSuccess , for calling APIs and redirection once local is setup to avoid wrong data passing in APIs like baId
 * @param history
 * @param packSelectionSource
 * @returns {Promise<void>}
 */
export const handleCreateUserSuccess = async (history, packSelectionSource) => {
    await store.dispatch(getProfileDetails(true));
    await store.dispatch(getAccountDetailsFromSid());
    await store.dispatch(getCurrentSubscriptionInfo(true));
    setDeviceStatus(false);
    safeNavigation(history, `/${URL.PACK_SELECTION}?source=${packSelectionSource}`);
}

/**
 * @function handleNoSubscriptionCancelledUser - when no other subscription is present we will send new user create API
 * @param history
 * @param packSelectionSource
 * @returns {Promise<void>}
 */
export const handleNoSubscriptionCancelledUser = async (history, packSelectionSource) => {
    await store.dispatch(createCancelSubscriberAccount());
    const {bingeLoginDetails} = store.getState();
    let response = bingeLoginDetails.createCancelSubscriberAccountResponse;
    if (response && response.code === 0) {
        await handleCreateUserSuccess(history, packSelectionSource);

    } else {
       /* store.dispatch(openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal',
            instructions: get(response, 'message', COMMON_ERROR.SOME_ERROR),
            primaryButtonText: 'Ok',
            closeModal: true,
            hideCloseIcon: true,
        }))*/
        toast(get(response, 'message', COMMON_ERROR.SOME_ERROR))
    }
}
