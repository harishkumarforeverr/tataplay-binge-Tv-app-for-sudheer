import {hideMainLoader, showMainLoader} from "@src/action";
import TransactionServiceInstance from "./services";
import {ACTION} from "./constants";

export const getInvoicePDF = (baId, accessToken, invoiceNumber, subscriberId) => {
    return (dispatch) => {
        dispatch(showMainLoader());
        return TransactionServiceInstance.getInvoicePDF(baId, accessToken, invoiceNumber, subscriberId)
            .then(function (response) {
                dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.FETCH_INVOICEPDF,
                    apiResponse: response,
                });
                return response;                
            })
            .catch((error) => {
                dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.FETCH_INVOICEPDF,
                    apiResponse: 'error',
                });
                console.log(
                    "Error while fetching Transaction history:- " + error,
                );
            });
    };
};

export const openMobilePopup = () => {
    return {
        type: ACTION.OPEN_MOBILEPOPUP,
    };
};

export const closeMobilePopup = () => {
    return {type: ACTION.CLOSE_MOBILEPOPUP};
};


