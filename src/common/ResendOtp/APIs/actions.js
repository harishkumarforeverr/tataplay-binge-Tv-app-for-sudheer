import ResendOtpService from './services';
import {ACTION} from "./constants";


export const resendOtp = (rmn) => {
    return dispatch => {
        return ResendOtpService.resendOtp(rmn).then(function (_response) {
            dispatch({
                type: ACTION.RESEND_OTP,
                apiResponse: _response,
            });
            return _response;
        });
    }
};

