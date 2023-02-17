import {hideMainLoader, showMainLoader} from "@src/action";
import FireTVInstallationService from "./service";
import {ACTION} from './constants';

export const createWo = (showLoader, param) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return FireTVInstallationService.createWo(param).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CREATE_WO,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CREATE_WO,
                apiResponse: error,
            });
            console.log("Error while creating work order :- " + error)
        });
    }
};

export const getSubscriberAddress = (showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return FireTVInstallationService.getSubscriberAddress().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_SUBSCRIBER_ADDRESS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_SUBSCRIBER_ADDRESS,
                apiResponse: error,
            });
            console.log("Error while fetch subscriber address details :- " + error)
        });
    }
};

export const getSlot = (showLoader, param) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return FireTVInstallationService.getSlot(param).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_SLOT,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_SLOT,
                apiResponse: error,
            });
            console.log("Error while fetching slot :- " + error)
        });
    }
};

export const confirmSlot = (param) => {
    return dispatch => {
        return FireTVInstallationService.confirmSlot(param).then(function (response) {
            dispatch({
                type: ACTION.CONFIRM_SLOT,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.CONFIRM_SLOT,
                apiResponse: error,
            });
            console.log("Error while confirming slot :- " + error)
        });
    }
};
export const campaign = () => {
    return dispatch => {
        return FireTVInstallationService.campaign().then(function (response) {
        
            dispatch({
                type: ACTION.CAMPAIGN,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.CAMPAIGN,
                apiResponse: error,
            });
            console.log("Error while fetching campaign :- " + error)
        });
    }
};
