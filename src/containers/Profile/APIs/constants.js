import {URL} from "@constants/routeConstants";
import {MESSAGE} from "@utils/constants/index"
import {MODALS} from "@common/Modal/constants";
import {LOCALSTORAGE} from "@constants/index";
import {setKey} from "@utils/storage";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import {safeNavigation} from "@utils/common";

export const ACTION = {
    GET_PROFILE_DETAILS: 'GET_PROFILE_DETAILS',
    UPDATE_PROFILE_DETAILS: 'UPDATE_PROFILE_DETAILS',
    UPDATE_USER_PASSWORD: 'UPDATE_USER_PASSWORD',
    UPDATE_PROFILE_IMAGE: 'UPDATE_PROFILE_IMAGE',
    UPDATE_EMAIL: 'UPDATE_EMAIL',
    SWITCH_TO_ATV_ACC: 'SWITCH_TO_ATV_ACC',
    HANDLE_ATV_UPGRADE: 'HANDLE_ATV_UPGRADE',
    SET_PROFILE_IMAGE:'SET_PROFILE_IMAGE'
};

export const redirectToProfile = (history) => {
    safeNavigation(history, `${URL.PROFILE}`);
}
export const updateUserProfileDetails = (currentProps, type, updateResponse, inlinePwdError) => {
    let {openPopup, history} = currentProps;
    if (updateResponse && updateResponse.code === 0) {
        setKey(LOCALSTORAGE.PROFILE_UPDATED, true);
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal profile-update-modal',
            headingMessage: `${type} Updated`,
            instructions: `Your Tata Sky ${type} has been successfully  changed.`,
            primaryButtonText: 'OK',
            primaryButtonAction: () => redirectToProfile(history),
            hideCloseIcon: true,
            icon: true,
        });
        if (type === 'Password') {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PASSWORD_SUCCESS);
            moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PASSWORD_SUCCESS);
        }

    } else {
        if (type === 'Password') {
            let reason = updateResponse ? updateResponse.message : '';
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PASSWORD_FAILED, {
                [`${MIXPANEL.PARAMETER.REASON}`]: reason,
            });
            moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PASSWORD_FAILED, {
                [`${MOENGAGE.PARAMETER.REASON}`]: reason,
            });
        }
        if (type === 'Password' && updateResponse && updateResponse.code === 6031) {
            inlinePwdError && inlinePwdError(updateResponse.message);
        } else {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal',
                instructions: updateResponse && updateResponse.message ?
                    updateResponse.message : MESSAGE.ERROR_OCCURRED,
                primaryButtonText: 'Ok',
                closeModal: true,
                hideCloseIcon: true,
            });
        }
    }
}
