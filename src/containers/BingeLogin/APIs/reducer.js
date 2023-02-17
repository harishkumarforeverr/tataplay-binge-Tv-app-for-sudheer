import get from 'lodash/get';
import {ACTION} from './constants';

let initialState = {
    codeGenerated: null,
    codeValidated: null,
};

export default function bingeLoginReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.GENERATE_OTP_WITH_RMN :
            return {...state, generatedCodeResponse: get(action, 'apiResponse', {})};
        case ACTION.VALIDATE_OTP :
            return {...state, codeValidated: get(action, 'apiResponse', null)};
        case ACTION.GENERATE_OTP_WITH_SID :
            return {...state, generatedCodeResponse: get(action, 'apiResponse', {})};
        case ACTION.PASSWORD_LOGIN :
            return {...state, codeValidated: get(action, 'apiResponse', null)};
        case ACTION.GET_FORGET_PASSWORD_OTP :
            return {...state, forgetPasswordOtpResponse: get(action, 'apiResponse', null)};
        case ACTION.CHANGE_PASSWORD_WITHOUT_AUTH :
            return {...state, changePasswordWithoutAuthResponse: get(action, 'apiResponse', null)};
        case ACTION.GET_ACCOUNT_DETAILS_RMN :
            return {...state, accountDetailsFromRmn: get(action, 'apiResponse', {})};
        case ACTION.GET_ACCOUNT_DETAILS_SID :
            return {...state, accountDetailsFromSid: get(action, 'apiResponse', {})};
        case ACTION.CREATE_NEW_USER :
            return {...state, newUser: get(action, 'apiResponse', {})};
        case ACTION.EXISTING_USER_LOGIN :
            return {...state, existingUser: get(action, 'apiResponse', {})};
        case ACTION.INACTIVE_POPUP:
            return {...state, inactivePopup:get(action,'val')}
        case ACTION.LOGOUT:
            return {...state, logOutResponse: get(action, 'apiResponse')};
        case ACTION.VALIDATE_WEB_SMALL_URL:
            return {...state, validateWebSmallUrlResponse: get(action, 'apiResponse')};
        case ACTION.RESET_VALIDATE_WEB_SMALL_RESPONSE:
            return {...state, validateWebSmallUrlResponse: {}};
        case ACTION.RESET_ACCOUNT_DETAILS_RMN :
            return {...state, accountDetailsFromRmn: {}};
        case ACTION.CREATE_CANCEL_SUBSCRIBER_ACCOUNT :
            return {...state, createCancelSubscriberAccountResponse: get(action, 'apiResponse')};
        case ACTION.FETCH_DEVICE_MOBILE_NUMBERS:
            return { ...state, deviceMobileNumbers: get(action, 'apiResponse') };
        default:
            return state;
    }
}
