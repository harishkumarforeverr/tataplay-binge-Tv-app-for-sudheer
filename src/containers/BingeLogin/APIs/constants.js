export const COMMON_TEXT = {
    PROCEED: 'Proceed',
    LOGIN: 'Login',
    UPDATE: 'Update',
    NOT_USER: 'Not on Tata Play? Get Now',
    T_AND_C: 'Terms and Conditions',
    SEND_OTP: 'Reset Password',
    RESEND_OTP: 'Resend OTP Code',
    AUTHENTICATE: 'Authenticate',
    CONFIRM: 'Confirm',
    LICENCE_AGREEMENT: 'License Agreement ',
    GET_OTP:"Get OTP",
};

export const ACTION = {
    GENERATE_OTP_WITH_RMN: 'GENERATE_OTP_WITH_RMN',
    GENERATE_OTP_WITH_SID: 'GENERATE_OTP_WITH_SID',
    VALIDATE_OTP: 'VALIDATE_OTP',
    PASSWORD_LOGIN: 'PASSWORD_LOGIN',
    GET_FORGET_PASSWORD_OTP: 'GET_FORGET_PASSWORD_OTP',
    CHANGE_PASSWORD_WITHOUT_AUTH: 'CHANGE_PASSWORD_WITHOUT_AUTH',
    GET_ACCOUNT_DETAILS_RMN: 'GET_ACCOUNT_DETAILS_RMN',
    GET_ACCOUNT_DETAILS_SID: 'GET_ACCOUNT_DETAILS_SID',
    CREATE_NEW_USER: 'CREATE_NEW_USER',
    EXISTING_USER_LOGIN: 'EXISTING_USER_LOGIN',
    INACTIVE_POPUP: 'INACTIVE_POPUP',
    LOGOUT: 'LOGOUT',
    VALIDATE_WEB_SMALL_URL: 'VALIDATE_WEB_SMALL_URL',
    RESET_VALIDATE_WEB_SMALL_RESPONSE: 'RESET_VALIDATE_WEB_SMALL_RESPONSE',
    RESET_ACCOUNT_DETAILS_RMN: 'RESET_ACCOUNT_DETAILS_RMN',
    CREATE_CANCEL_SUBSCRIBER_ACCOUNT: 'CREATE_CANCEL_SUBSCRIBER_ACCOUNT',
    FETCH_DEVICE_MOBILE_NUMBERS:'FETCH_DEVICE_MOBILE_NUMBERS',
};

export const FORM_NAME = {
    OTP: 'OTP',
    PASSWORD: 'PASSWORD',
    FORGET_PASSWORD: 'FORGET_PASSWORD',
};

export const ACCOUNT_STATUS = {
    ACTIVE: 'ACTIVE',
    DEACTIVATED: 'DEACTIVATED',
    DEACTIVE: 'DEACTIVE',
    CANCELLED: 'CANCELLED',
    WRITTEN_OFF: 'WRITTEN_OFF',
    TEMP_SUSPENSION: 'TEMP_SUSPENSION',
    SUB_STATUS_PARTIALLY_DUNNED: 'PARTIALLY DUNNED',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
};

export const PURCHASE_TYPE = {
    UPGRADE: 'upgrade',
    DOWNGRADE: 'downgrade',
};

export const BINGE_ACCOUNT_STATUS = {
    ACTIVE: 'Tata Play Binge Active',
    INACTIVE: 'Tata Play Binge Inactive',
};

export const WEB_SMALL_LOGIN_STEP = ["1", "2", "3", "4"];

export const ERROR_MESSAGES = {
    DEVICE_LIMIT: "You have exceeded your device limit. Please logout from one of the logged in devices and try again.",
    OTP_LIMIT: "You have exceeded the number of attempts for generating OTP.",
    INCORRECT_SID_RMN: "The RMN/ Subscriber ID you have entered does not exist. Please login with RMN/ Subscriber ID as registered on www.watch.tatasky.com",
    INCORRECT_SID: "Enter Your Tata Play Subscriber ID",
    INCORRECT_RMN: "Enter Your Registered Mobile Number",
};

export const CANCELLATION_DEVICE_STATUS = {
    INACTIVE: 'Inactive',
    DEFECTIVE: 'Defective',
    CANCELLED: 'Cancelled',
    ACTIVATION: 'Activation',
};

export const CANCELLED_DEVICE_STATUS = ['Inactive', 'Defective', 'Cancelled'];

export const CANCEL_RESUME_ACTION = {
    RESUME: 'RESUME',
    CANCEL: 'CANCEL',
};

export const FREE_TRIAL_CANCEL_BTN = {
    ACTIVE: 'Cancel Free Trial',
    EXPIRED: 'Cancel Subscription',
}