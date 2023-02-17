import {hideMainLoader, showMainLoader} from "@src/action";
import MySubscriptionServiceInstance from "../APIs/service";

import {ACTION} from '../constant';

export const resumePack = () => {
    return dispatch => {
        return MySubscriptionServiceInstance.resumePack().then(function (response) {
            dispatch({
                type: ACTION.RESUME_PACK,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.RESUME_PACK,
                apiResponse: error,
            });
            console.log("Error while resuming pack :- " + error)
        });
    }
};

export const cancelPack = (bingeCancel, primeCancel, isCancelSilently = false) => {
    return dispatch => {
        return MySubscriptionServiceInstance.cancelPack(bingeCancel, primeCancel).then(function (response) {
            dispatch({
                type: ACTION.CANCEL_PACK,
                apiResponse: response,
                isCancelSilently,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.CANCEL_PACK,
                apiResponse: error,
                isCancelSilently,
            });
            console.log("Error while cancelling pack :- " + error)
        });
    }
};
// action for clearing data so it should work in case of pubnub message
export const clearCancelRevokeData = () => {
    return {type: ACTION.CLEAR_DATA, data: null}
}

export const getUpgradeTransitionDetails = (packId) => {
    return dispatch => {
        return MySubscriptionServiceInstance.getUpgradeTransitionDetails(packId).then(function (response) {
            dispatch({
                type: ACTION.GET_UPGRADE_TRANSITION_DETAILS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_UPGRADE_TRANSITION_DETAILS,
                apiResponse: error,
            });
            console.log("Error while fetching upgrade transition details :- " + error)
        });
    }
};


