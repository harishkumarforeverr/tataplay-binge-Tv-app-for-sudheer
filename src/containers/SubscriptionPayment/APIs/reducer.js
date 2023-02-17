import get from "lodash/get";

import { ACTION, OPEL_STATUS } from "./constants";

let opelMockResponse = {"code":0,"message":"Response fetched successfully.","data":{"paymentStatus":"INPROGRESS"}};
let initialState = {
  paymentStatusFromPubnub: '',
  paymentMode: false
};

export default function subscriptionPaymentReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION.PAYMENT_STATUS:
      return { ...state, payment: action.apiResponse.data };
    case ACTION.PAYMENT_DETAILS:
      return { ...state, paymentDetails: get(action, "apiResponse.data", {}) };
    case ACTION.GET_BALANCE_INFO:
      return { ...state, balanceInfo: get(action, 'apiResponse') };
    case ACTION.GET_ACCOUNT_BALANCE_INFO:
      return { ...state, accountBalanceInfo: get(action, 'apiResponse') };
    case ACTION.PAYMENT_THROUGHT_TS_WALLET:
      return { ...state, paymentThroughTSWallet: get(action, 'apiResponse') };
    case ACTION.QUICK_RECHARGE:
      return { ...state, quickRecharge: get(action, 'apiResponse') };
    case ACTION.GET_OPEL_RESPONSE:
      return { ...state, opelResponse: get(action, 'apiResponse') };
    case ACTION.SET_PAYMENT_STATUS_FROM_PUBNUB:
      return {...state, paymentStatusFromPubnub: OPEL_STATUS.SUCCESS};
    case ACTION.SET_SUBSCRIPTION_PAYMENT_MODE:
       return {...state, paymentMode: action.value }
    default:
    return state;
  }
}
