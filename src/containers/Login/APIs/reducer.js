import get from 'lodash/get';
import { ACTION } from './constants';

const initialState = {
    showLoginPopup: false,
    isLoginPopupVisible: false,
    rmnResponse: null,
    otpResponse: null,
    loginStepNumber: 1,
    subscriptionDetails: {},
    newUser: {},
    existingUser: {},
    isManualLogin: false,
    loginSource: "",
    silentLoginFailed: false,
};

export default function loginReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.GET_OTP_WITH_RNM:
            return { ...state, rmnResponse: get(action, 'apiResponse', {}) };
        case ACTION.VALIDATE_OTP:
            return { ...state, otpResponse: get(action, 'apiResponse', {}) };
        case ACTION.SUBSCRIBER_LIST:
            return { ...state, subscriptionDetails: get(action, 'apiResponse', {}) };
        case ACTION.CREATE_BINGE_USER:
            return { ...state, newUser: get(action, 'apiResponse') };
        case ACTION.UPDATE_BINGE_USER:
            return { ...state, existingUser: get(action, 'apiResponse') };
        case ACTION.OPEN_LOGIN_POPUP:
            return { ...state, showLoginPopup: true };
        case ACTION.CLOSE_LOGIN_POPUP:
            return { ...state, showLoginPopup: false };
        case ACTION.LOGIN_STEP_NUMBER:
            return { ...state, loginStepNumber: action.stepNumber }
        case ACTION.RESET_LOGIN_STATE:
            return { ...initialState, showLoginPopup: state.showLoginPopup, isLoginPopupVisible: state.isLoginPopupVisible };
        case ACTION.VALIDATE_FS_WEB_SMALL_URL:
            return { ...state, validateFSUrlResponse: get(action, 'apiResponse') };
        case ACTION.GET_CLIENT_IP:
            return { ...state, clientIP: get(action, 'apiResponse') };
        case ACTION.MANUAL_LOGIN_CHECK:
            return { ...state, isManualLogin: get(action, 'response') };
        case ACTION.ON_MANUAL_LOGIN:
            return { ...state, loginSource: action.source, isManualLogin: true };
        case ACTION.SET_IS_LOGIN_POPUP_VISIBLE:
            return { ...state, isLoginPopupVisible: action.value }
        case ACTION.FORCE_LOGOUT:
            return { ...state, forceLogoutRes: get(action, 'apiResponse') }
        case ACTION.SILENT_LOGIN_FAILED:
            return { ...state, silentLoginFailed: get(action, 'silentLoginFailed') };
        default:
            return state;
    }
}