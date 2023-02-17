import { ACTION } from "./constants";
import LoginByServiceInstance from "./service";

import { hideMainLoader, showMainLoader, showMainLoaderImmediate } from '@src/action';
import { userLoginHandle, updateLocalStorage } from '../LoginCommon';

export const generateOtpWithRMN = (rmn) => {
    return dispatch => {
        dispatch(showMainLoader());
        return LoginByServiceInstance.generateOtpWithRMN(rmn).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_OTP_WITH_RNM,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_OTP_WITH_RNM,
                apiResponse: error,
            });
            console.log("Error while fetching generating otp:- " + error);
            return error;
        });
    }
};

export const rmnValidateOtp = (mobile, otp) => {
    return dispatch => {
        dispatch(showMainLoaderImmediate());
        return LoginByServiceInstance.validateOtp(mobile, otp).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.VALIDATE_OTP,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.VALIDATE_OTP,
                apiResponse: error,
            });
            console.log("Error while validating otp:- " + error);
            return error;
        });
    }
};

export const subscriberListing = (mobile) => {
    return dispatch => {
        dispatch(showMainLoader());
        return LoginByServiceInstance.getSubscriberListing(mobile).then((response) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.SUBSCRIBER_LIST,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.SUBSCRIBER_LIST,
                apiResponse: error,
            })
            console.log("Error while getting user account details:- " + error);
            return error;
        })
    }
};

export const createNewBingeUser = (payload, params, registerWebSmall) => {
    return dispatch => {
        dispatch(showMainLoader());
        return LoginByServiceInstance.createNewBingeUser(payload, params, registerWebSmall).then((response) => {
            response?.data?.userAuthenticateToken != null && userLoginHandle(response, params);
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CREATE_BINGE_USER,
                apiResponse: response,
            });
            return response;
        })
            .catch((error) => {
                dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.CREATE_BINGE_USER,
                    apiResponse: error,
                });
                console.log("Error while creating new user:- " + error);
                return error;
            })
    }
};

export const updateBingeUser = (payload, params, registerWebSmall, showLoader = true) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return LoginByServiceInstance.updateBingeUser(payload, params, registerWebSmall).then(async (response) => {
            response?.data?.userAuthenticateToken != null && await userLoginHandle(response, params);
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_BINGE_USER,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.UPDATE_BINGE_USER,
                apiResponse: error,
            });
            console.log("Error while updating existing user:- " + error);
            return error;
        })
    }
};

export const openLoginPopup = () => {
    return {
        type: ACTION.OPEN_LOGIN_POPUP,
    };
};

export const setIsLoginPopupVisible = (value) => {
    return {
        type: ACTION.SET_IS_LOGIN_POPUP_VISIBLE,
        value
    }
}

export const closeLoginPopup = () => {
    return {
        type: ACTION.CLOSE_LOGIN_POPUP,
    };
};

export const updateLoginStep = (stepNumber) => {
    return {
        type: ACTION.LOGIN_STEP_NUMBER,
        stepNumber,
    }
}

export const resetLoginState = () => ({
    type: ACTION.RESET_LOGIN_STATE,
});

export const validateFSWebSmallUrl = (token, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return LoginByServiceInstance.validateFSWebSmallUrl(token).then((response) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.VALIDATE_FS_WEB_SMALL_URL,
                apiResponse: response,
            });
            return response.data;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            console.log("Error while validating FS payment url:- " + error);
        });
    }
};

export const getClientIP = (showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return LoginByServiceInstance.getClientIP().then((response) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_CLIENT_IP,
                apiResponse: response,
            });
            return response.data;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            console.log("Error while fetching client ip address:- " + error);
        });
    }
};

export const setLoginManual = (value) => {
    return dispatch => {
        dispatch({
            type: ACTION.MANUAL_LOGIN_CHECK,
            response: value,
        });
    }
}

export const onManualLogin = (source) => {
    return dispatch => {
        dispatch({ type: ACTION.ON_MANUAL_LOGIN, source })
    }
};

export const forceLogout = (showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return LoginByServiceInstance.forceLogout().then((response) => {
            showLoader && dispatch(hideMainLoader());
            //update anonymousId and g-auth-token
            updateLocalStorage(response);
            dispatch({
                type: ACTION.FORCE_LOGOUT,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            console.log("Error while force logout:- " + error);
        });
    }
};

export const updateSilentLoginFailed = (silentLoginFailed) => {
    return {
        type: ACTION.SILENT_LOGIN_FAILED,
        silentLoginFailed,
    }
}