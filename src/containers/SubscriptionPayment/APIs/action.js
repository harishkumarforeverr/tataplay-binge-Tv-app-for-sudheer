import PaymentServiceInstance from "./service";
import { ACTION } from "./constants";
import { hideMainLoader, showMainLoader } from "@src/action";

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

export const getPaymentDetails = () => {
  return (dispatch) => {
    return PaymentServiceInstance.getPaymentDetails()
      .then(function (response) {
        dispatch({
          type: ACTION.PAYMENT_DETAILS,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        dispatch({
          type: ACTION.PAYMENT_DETAILS,
          apiResponse: error,
        });

        console.log("Error while setting payment status :- " + error);
      });
  };
};

export const getBalanceInfo = (packId, amount, isForAccountDropDown) => {
  return dispatch => {
    return PaymentServiceInstance.getBalanceInfo(packId, amount).then(function (response) {
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

export const paymentThroughTSWallet = (payload) => {
  return dispatch => {
    return PaymentServiceInstance.paymentThroughTSWallet(payload).then(function (response) {
      dispatch({
        type: ACTION.PAYMENT_THROUGHT_TS_WALLET,
        apiResponse: response,
      });
      return response;
    }).catch((error) => {
      dispatch({
        type: ACTION.PAYMENT_THROUGHT_TS_WALLET,
        apiResponse: error,
      });
      console.log("Error while getting balance info :- " + error)
    });
  }
};

export const quickRecharge = (mbr, sIdExist) => {
  return dispatch => {
    return PaymentServiceInstance.quickRecharge(mbr, sIdExist).then((response) => {
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

export const getOpelResponse = (payload) => {
  return dispatch => {
    return PaymentServiceInstance.getOpelResponse(payload).then((response) => {
      dispatch({
        type: ACTION.GET_OPEL_RESPONSE,
        apiResponse: response,
      });
      return response;
    }).catch((error) => {
      dispatch({
        type: ACTION.GET_OPEL_RESPONSE,
        apiResponse: error,
      });
      console.log("Error while fetching opel response :- " + error)
    });
  }
};

export function setPaymentStatusFromPubnub() {
  return {type: ACTION.SET_PAYMENT_STATUS_FROM_PUBNUB}
}

export const setSubscriptionPaymentMode = (paymentMode = false) => dispatch => {
  dispatch({ type: ACTION.SET_SUBSCRIPTION_PAYMENT_MODE, value: paymentMode })
}