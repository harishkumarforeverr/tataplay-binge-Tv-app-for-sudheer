import {hideMainLoader, showMainLoader} from "@src/action";
import PackListingServiceInstance from "../APIs/service";

import {ACTION} from './constants';
import HomeServiceInstance from "@containers/Home/APIs/services";
import isEmpty from "lodash/isEmpty";
import {updatePackDetailStorage} from "@utils/common";

export const packListing = () => {
    return dispatch => {
        return PackListingServiceInstance.packListing().then(function (response) {
            dispatch({
                type: ACTION.PACK_LISTING,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            // showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.PACK_LISTING,
                apiResponse: error,
            });
            console.log("Error while fetching pack list :- " + error)
        });
    }
};

/*
Added check that if the balance API is hit from the account dropdown then data should be saved in different reducer as
the balance data gets updated on the subscription summary screen when API gets hit from account dropdown
 */
export const getBalanceInfo = (packId, isForAccountDropDown) => {
    return dispatch => {
        return PackListingServiceInstance.getBalanceInfo(packId).then(function (response) {
            dispatch({
                type: isForAccountDropDown ? ACTION.GET_ACCOUNT_BALANCE_INFO : ACTION.GET_BALANCE_INFO,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: isForAccountDropDown ? ACTION.GET_ACCOUNT_BALANCE_INFO : ACTION.GET_BALANCE_INFO,
                apiResponse: error,
            });
            console.log("Error while getting balance info :- " + error)
        });
    }
};

export const createSubscription = (packId) => {
    return dispatch => {
        dispatch(showMainLoader());
        return PackListingServiceInstance.createSubscription(packId).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CREATE_SUBSCRIPTION,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CREATE_SUBSCRIPTION,
                apiResponse: error,
            });
            console.log("Error while creating subscription :- " + error)
        });
    }
};

export const modifySubscription = (packId, dropPackId, revoked) => {
    return dispatch => {
        dispatch(showMainLoader());
        return PackListingServiceInstance.modifySubscription(packId, dropPackId, revoked).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.MODIFY_SUBSCRIPTION,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.MODIFY_SUBSCRIPTION,
                apiResponse: error,
            });
            console.log("Error while modify subscription :- " + error)
        });
    }
};

/*
    The third parameter in getCurrentSubscriptionInfo tells if we need to update the subscription related people properties or not
*/

export const getCurrentSubscriptionInfo = (showLoader = false, handleNetworkFailure = false, updatePeopleProperty = false) => {
    return async dispatch => {
        showLoader && dispatch(showMainLoader());
        return PackListingServiceInstance.getCurrentSubscriptionInfo(handleNetworkFailure).then(async(response) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_CURRENT_SUBSCRIPTION_INFO,
                apiResponse: response,
            });
            if (!isEmpty(response.data)) {
               await updatePackDetailStorage(response.data, updatePeopleProperty, true);
            }
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_CURRENT_SUBSCRIPTION_INFO,
                apiResponse: error,
            });
            console.log("Error while getting current subscription info :- " + error)
        });
    }
};

export const quickRecharge = (mbr, sIdExist) => {
    return dispatch => {
        return PackListingServiceInstance.quickRecharge(mbr, sIdExist).then(function (response) {
            dispatch({
                type: ACTION.QUICK_RECHARGE,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.QUICK_RECHARGE,
                apiResponse: error,
            });
            console.log("Error while fetching selfcare url :- " + error)
        });
    }
}

export const dunningRecharge = (sId, baId) => {
    return dispatch => {
        return HomeServiceInstance.dunningRecharge(sId, baId).then(function (response) {
            dispatch({
                type: ACTION.DUNNING_RECHARGE,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.DUNNING_RECHARGE,
                apiResponse: error,
            });
            console.log("Error while fetching dunning recharge content :- " + error)
        });
    }
};

export const quickRechargeBeforeLogin = (sId) => {
    return dispatch => {
        return HomeServiceInstance.quickRechargeBeforeLogin(sId).then(function (response) {
            dispatch({
                type: ACTION.QUICK_RECHARGE_BEFORE_LOGIN,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.QUICK_RECHARGE_BEFORE_LOGIN,
                apiResponse: error,
            });
            console.log("Error while fetching quick recharge before login selfcare url :- " + error)
        });
    }
};

export const reactivateSubscription = (packId) => {
    return dispatch => {
        dispatch(showMainLoader());
        return PackListingServiceInstance.reactivateSubscription(packId).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.REACTIVATE_SUBSCRIPTION,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.REACTIVATE_SUBSCRIPTION,
                apiResponse: error,
            });
            console.log("Error while reactivating subscription :- " + error)
        });
    }
};


