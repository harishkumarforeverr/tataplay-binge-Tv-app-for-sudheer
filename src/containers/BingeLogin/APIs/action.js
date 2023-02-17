import {hideMainLoader, showMainLoader} from "@src/action";
import LoginByService from "./service";
import {ACTION} from "./constants";
import {errorForAPIFailure, userLoginHandle} from "@containers/BingeLogin/bingeLoginCommon";
import {deleteKey, getKey, setKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";
import {updateUserInfo} from "@utils/common";

/**
 *
 * @param rmn
 * @returns {function(*): Promise<unknown>}
 */
export const generateOtpWithRMN = (rmn) => {
    return dispatch => {
        return LoginByService.generateOtpWithRMN(rmn).then(function (response) {
            //if response code is 0 otp generated successfully for other code it will be error
            dispatch({
                type: ACTION.GENERATE_OTP_WITH_RMN,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while fetching generating otp:- " + error)
        });
    }
};

export const generateOtpWithSid = (sid, isPassword) => {
    //if response code is 0 otp generated successfully for other code it will be error

    return dispatch => {
        return LoginByService.generateOtpWithSid(sid, isPassword).then(function (response) {
            dispatch({
                type: ACTION.GENERATE_OTP_WITH_SID,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while generating otp with sid:- " + error)
        });
    }
};

export const validateOtp = (params = {}) => {
    // params = {
    //     "otp": "string",
    //     "rmn": "string"
    // }
    return dispatch => {
        return LoginByService.validateOtp(params).then(function (response) {
            //if response code is 0 otp validated successfully for other code it will be error
            dispatch({
                type: ACTION.VALIDATE_OTP,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while validating otp:- " + error)
        });
    }
};

export const validatePassword = (params = {}) => {
    // params={
    //     "pwd": "string",
    //     "sid": "string"
    // }
    return dispatch => {
        return LoginByService.validatePassword(params).then(function (response) {
            //if response code is 0 otp validated successfully for other code it will be error
            dispatch({
                type: ACTION.PASSWORD_LOGIN,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while logging via password:- " + error)
        });
    }
};

export const getForgetPasswordOtp = (sid, param) => {
    return dispatch => {
        return LoginByService.getForgetPasswordOtp(sid, param).then(function (response) {
            dispatch({
                type: ACTION.GET_FORGET_PASSWORD_OTP,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while fetching otp for forget password:- " + error)
        });
    }
};

export const changePasswordWithoutAuth = (sid, params = {}) => {
    return dispatch => {
        return LoginByService.changePasswordWithoutAuth(sid, params).then(function (response) {
            dispatch({
                type: ACTION.CHANGE_PASSWORD_WITHOUT_AUTH,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while change password without auth:- " + error)
        });
    }
};

export const getAccountDetailsFromRmn = (rmn, subId) => {
    return dispatch => {
        return LoginByService.getAccountDetailsFromRmn(rmn, subId).then((response) => {
            dispatch({
                type: ACTION.GET_ACCOUNT_DETAILS_RMN,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while getting user account details:- " + error);
        })
    }
};

export const getAccountDetailsFromSid = (subId) => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    let sID = subId ? subId : userInfo.sId;
    return dispatch => {
        return LoginByService.getAccountDetailsFromSid(sID).then((response) => {
            dispatch({
                type: ACTION.GET_ACCOUNT_DETAILS_SID,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while getting user account details:- " + error);
        })
    }
};

export const createBingeUser = (payload, params) => {
    return dispatch => {
        return LoginByService.createBingeUser(payload).then((response) => {
            dispatch({
                type: ACTION.CREATE_NEW_USER,
                apiResponse: response,
            });
            response?.data?.userAuthenticateToken != null && userLoginHandle(response, params);
            return response;
        }).catch((error) => {
            console.log("Error while creating new user:- " + error);
        })
    }
};

export const loginExistingUser = (payload, params) => {
    return dispatch => {
        return LoginByService.loginExistingUser(payload).then((response) => {
            dispatch({
                type: ACTION.EXISTING_USER_LOGIN,
                apiResponse: response,
            });
            response?.data?.userAuthenticateToken != null && userLoginHandle(response, params);
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            console.log("Error while logging to existing user:- " + error);
            errorForAPIFailure(error);
        })
    }
};

/*
action for setting inactive pop up opened once
 */
export const inactivePopupOpened = (val) =>{
    return {type:ACTION.INACTIVE_POPUP,val}
};

export const logOut = (allUsers = false) => {
    return dispatch => {
        dispatch(showMainLoader());
        setKey(LOCALSTORAGE.LOGOUT_FIRED, true);
        return LoginByService.logOut(allUsers).then((response) => {
            dispatch(hideMainLoader());
            deleteKey(LOCALSTORAGE.LOGOUT_FIRED);
            dispatch({
                type: ACTION.LOGOUT,
                apiResponse: response,
            });
            return response.data;
        }).catch(() => {
            dispatch(hideMainLoader());
        });
    }
}

export const validateWebSmallUrl = (wsUrl, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return LoginByService.validateWebSmallUrl(wsUrl).then((response) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.VALIDATE_WEB_SMALL_URL,
                apiResponse: response,
            });
            return response.data;
        }).catch(() => {
            showLoader && dispatch(hideMainLoader());
        });
    }
};

export const resetValidateWebSmallResponse = () => ({
    type: ACTION.RESET_VALIDATE_WEB_SMALL_RESPONSE,
});

export const resetAccountDetailsFromRMN = () => ({
    type: ACTION.RESET_ACCOUNT_DETAILS_RMN,
});

export const validateOtpForSid = (params = {}) => {
    return dispatch => {
        return LoginByService.validateOtpForSid(params).then(function (response) {
            //if response code is 0 otp validated successfully for other code it will be error
            dispatch({
                type: ACTION.VALIDATE_OTP,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while validating otp:- " + error)
        });
    }
};


export const createCancelSubscriberAccount = () => {
    return dispatch => {
        dispatch(showMainLoader());
        return LoginByService.createCancelSubscriberAccount().then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CREATE_CANCEL_SUBSCRIBER_ACCOUNT,
                apiResponse: response,
            });
            if (response && response.code === 0) {
                updateUserInfo(response, false, function () {
                    return response;
                });
            } else {
                return response;
            }

        }).catch((error) => {
            dispatch(hideMainLoader());
            console.log("Error while creating cancel subscriber account:- " + error)
        });
    }
};

export const getDeviceMobileNumbers = (id, showLoader = false) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return LoginByService.fetchDeviceMobileNumbers(id).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_DEVICE_MOBILE_NUMBERS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_DEVICE_MOBILE_NUMBERS,
                apiResponse: error,
            });
            console.log("Error while fetching free playback eligibility :- " + error)
        });
    }
};