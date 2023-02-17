import DeviceManagementService from "./service";
import { ACTION } from './constants';
import { hideMainLoader, showMainLoader } from "@src/action";

export const getSubscriberDeviceList = (isBeforeLogin, payload) => {
    return dispatch => {
        dispatch(showMainLoader());
        return DeviceManagementService.getSubscriberDeviceList(isBeforeLogin, payload).then(function (_response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_SUBSCRIBER_DEVICE_LIST,
                apiResponse: _response,
            });
            return _response.data;
        });
    }
};

export const deleteSubscriberDeviceList = (deviceDetail, isBeforeLogin, data) => {
    return dispatch => {
        return DeviceManagementService.deleteSubscriberDeviceList(deviceDetail, isBeforeLogin, data).then(function (response) {
            dispatch({
                type: ACTION.DELETE_SUBSCRIBER_DEVICE,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.DELETE_SUBSCRIBER_DEVICE,
                apiResponse: error,
            });
            console.log("Error while deleting device :- " + error)
        });
    }
};
