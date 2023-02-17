import {hideMainLoader, showMainLoader} from "@src/action";
import ProfileServiceInstance from "@containers/Profile/APIs/service";

import {ACTION} from './constants';
import {setKey} from "@utils/storage";
import {ERROR_CODE, LOCALSTORAGE, PARAMS_TYPE} from "@constants";
import {showToast, updateUserInfo} from "@utils/common";

export const getProfileDetails = (showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return ProfileServiceInstance.getProfileDetails().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            const params = {type: PARAMS_TYPE.USER_DETAILS}
            response?.data?.rmn != null && updateUserInfo(response, params);
            dispatch({
                type: ACTION.GET_PROFILE_DETAILS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_PROFILE_DETAILS,
                apiResponse: error,
            });
            console.log("Error while fetching profile details :- " + error)
        });
    }
};

export const updateProfileDetailsNonDthUser = (payload, callback) => {
    return (dispatch) => {
        dispatch(showMainLoader());
        return ProfileServiceInstance.updateProfileDetailsNonDthUser(payload).then((response) => {
            ([ERROR_CODE.ERROR_20109, ERROR_CODE.ERROR_700006].includes(response?.code)) ? callback(response) : showToast(response.message);
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_PROFILE_DETAILS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_PROFILE_DETAILS,
                apiResponse: error,
            });
            console.log("Error while updating profile details :- " + error);
        });
    };
};

export const updateEmail = (payload) => {
    return dispatch => {
        dispatch(showMainLoader());
        return ProfileServiceInstance.updateEmail(payload).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_EMAIL,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_EMAIL,
                apiResponse: error,
            });
            console.log("Error while updating email :- " + error)
        });
    }
};

export const updateProfileImage = (payload) => {
    return dispatch => {
        dispatch(showMainLoader());
        return ProfileServiceInstance.updateProfileImage(payload).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_PROFILE_IMAGE,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_PROFILE_IMAGE,
                apiResponse: error,
            });
            console.log("Error while updating user profile image :- " + error)
        });
    }
};

export const switchToAtvAccount = () => {
    return dispatch => {
        dispatch(showMainLoader());
        return ProfileServiceInstance.switchToAtvAccount().then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.SWITCH_TO_ATV_ACC,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.SWITCH_TO_ATV_ACC,
                apiResponse: error,
            });
            console.log("Error while switching to ATV Profile :- " + error)
        });
    }
};

export const handleAtvUpgrade = () => {
    return dispatch => {
        dispatch(showMainLoader());
        return ProfileServiceInstance.handleAtvUpgrade().then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.HANDLE_ATV_UPGRADE,
                apiResponse: response,
            });
            setKey(LOCALSTORAGE.ATV_UPGRADE, false);
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.HANDLE_ATV_UPGRADE,
                apiResponse: error,
            });
            console.log("Error while handling ATV upgrade popup API call  :- " + error)
        });
    }
};
export const setProfileImage = (imageSrc) => {
    return dispatch => {
        dispatch({
            type: ACTION.SET_PROFILE_IMAGE,
            response: imageSrc,
        });
    }
}
