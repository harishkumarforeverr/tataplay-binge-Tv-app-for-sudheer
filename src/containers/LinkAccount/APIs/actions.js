import LinkAccountInstance from './services';
import {ACTION} from './constants'

export const fetchLinkAccountOtp = () => {
    return dispatch => {
        return LinkAccountInstance.fetchLinkAccountOtp().then(function (_response) {
            dispatch({
                type: ACTION.FETCH_LINK_ACCOUNT_OTP,
                apiResponse: _response.data,
            });
            return _response.data;
        });
    }
}