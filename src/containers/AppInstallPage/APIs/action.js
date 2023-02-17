import AppInstallPageServiceInstance from "../APIs/service";
import {ACTION} from "../APIs/constants";

export const getAppInstallDetails = () => {
    return dispatch => {
        return AppInstallPageServiceInstance.getAppInstallDetails().then(function (response) {
            dispatch({
                type: ACTION.GET_APP_INSTALL_DETAILS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_APP_INSTALL_DETAILS,
                apiResponse: error,
            });
            console.log("Error while fetching app install details :- " + error)
        });
    }
};