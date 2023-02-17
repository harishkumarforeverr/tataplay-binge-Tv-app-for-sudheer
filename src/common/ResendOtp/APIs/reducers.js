import get from 'lodash/get';
import {ACTION} from "./constants";

export default (state = {}, action) => {
    if (action.type === ACTION.RESEND_OTP) {
        return {...state, otpDetails: get(action, 'apiResponse')};
    } else {
        return state;
    }
};
