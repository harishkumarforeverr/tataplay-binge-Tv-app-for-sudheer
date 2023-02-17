import {hideMainLoader, showMainLoader} from "@src/action";
import SwitchAccountServiceInstance from './service';
import {ACTION} from './constants';
import {getParamsAPICall} from "@utils/common";

export const postSwitchAccountReq = (payload) => {
    return dispatch => {
        dispatch(showMainLoader());
        return SwitchAccountServiceInstance.postSwitchAccountReq(payload).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.POST_SWITCH_ACCOUNT_REQ,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.POST_SWITCH_ACCOUNT_REQ,
                apiResponse: error,
            });
            console.log("Error while posting switch account req :- " + error)
        });
    }
};

export const resetSwitchAccountData = () => ({
    type: ACTION.RESET_SWITCH_ACCOUNT_DATA,
});

