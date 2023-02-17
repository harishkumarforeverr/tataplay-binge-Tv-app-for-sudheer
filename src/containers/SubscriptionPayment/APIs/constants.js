export const ACTION = {
  PAYMENT_STATUS: "PAYMENT_STATUS",
  PAYMENT_DETAILS: "PAYMENT_DETAILS",
  GET_BALANCE_INFO: 'GET_BALANCE_INFO',
  GET_ACCOUNT_BALANCE_INFO: 'GET_ACCOUNT_BALANCE_INFO',
  PAYMENT_THROUGHT_TS_WALLET: 'PAYMENT_THROUGHT_TS_WALLET',
  QUICK_RECHARGE:'QUICK_RECHARGE',
  GET_OPEL_RESPONSE:'GET_OPEL_RESPONSE',
  SET_PAYMENT_STATUS_FROM_PUBNUB: 'SET_PAYMENT_STATUS_FROM_PUBNUB',
  SET_SUBSCRIPTION_PAYMENT_MODE: 'SET_SUBSCRIPTION_PAYMENT_MODE'
};

export const METHOD_TYPE={
  ADD_SUBSCRIPTION:'ADD_SUBSCRIPTION',
  MODIFY_SUBSCRIPTION:'MODIFY_SUBSCRIPTION'
}

export const fetchDetailsFromURL = (url, keyToFetch) => {
let urlToCheck = new URL(url);
let searchParams = new URLSearchParams(urlToCheck.search);
    return (searchParams.get(keyToFetch));
};

export const OPEL_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  INPROGRESS: 'INPROGRESS',
  CHARGED: 'CHARGED',
};

export const PENDING_PAYMNET_ERROR_CODES = ['PENDING_VBV', 'AUTHORIZING', 'VBV_SUCCESSFUL'];

export const FAILED_PAYMNET_ERROR_CODES = ['AUTHORIZATION_FAILED', 'AUTHENTICATION_FAILED', 'API_FAILURE', 'JUSPAY_DECLINED', 'NEW', 'DEFAULT',
    'STARTED', 'AUTO_REFUNDED', 'CAPTURE_INITIATED', 'CAPTURE_FAILED', 'VOID_INITIATED', 'VOIDED', 'VOID_FAILED', 'NOT_FOUND'];

export const ERROR_HANDLING_VERBIAGES = {
    PENDING_STATE_ERROR: 'Transaction pending for confirmation. Please try again after some time if your request is not executed',
    PAYMENT_FAILED_ERROR: 'Payment Failed. You may try again.',
    PAYMENT_CONFIRMATION_PENDING_ERROR: 'Transaction pending for confirmation. Please try again after some time if your request is not executed',
    DEFAULT_ERROR: 'Payment Failed. You may try again.',
    CLOSE_BTN: 'Close',
    TRY_AGAIN: 'Try Again',
    HEADING: 'Payment Unsuccessful',
    HEADING_PENDING: 'Payment Pending',
    PAYMENT_IN_PROGRESS: 'Your Subscription Is In Progress',
};
