import PaymentServiceInstance from "./service";
import { ACTION } from "./constants";

export const setPaymentStatus = (status, txn) => {
    return dispatch => {
        return PaymentServiceInstance.setPaymentStatus(status, txn).then(function (response) {
            dispatch({
                type: ACTION.PAYMENT_STATUS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.PAYMENT_STATUS,
                apiResponse: error,
            });
            console.log("Error while setting payment status :- " + error)
        });
    }
};