import React from "react";

export const REGEX = {
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_])[A-Za-z\d!@#$%^&*()_]{8,}$/,
    PAN: /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/,
    OTP: /^\d{6}$/,
    OTP_4: /^\d{4}$/,
    MOBILE_NUMBER: /^[0-9]{10}$/,
    FIRST_NAME: /^\S*$/,
    EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    EMAIL_ID: (/^[a-z0-9]+([-._][a-z0-9]+)*@([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,4}$/),
    NAME: /^([a-zA-Z])|([a-zA-Z].[a-zA-Z])|([a-zA-Z].)/,
    USER_ID: /^([a-zA-Z0-9!_@$.]){6,26}$/,
    USER_NAME: /^([a-zA-Z])|([a-zA-Z].[a-zA-Z])|([a-zA-Z].)/,
    PASSWORD_REGISTRATION: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$_!@])[A-Za-z\d$@!_]{8,12}$/,
    DATE: /^((02?[1-9]|[12][0-9]|3[01])[- /.](02?[1-9]|1[012])[- /.](19|20)[0-9]{2})*$/,
    SPECIAL_CHARACTERS: /[^a-zA-Z0-9]/,
    PUNCTUATUIONS: /[&\/\\#,+()$~%.'":*?<>{}_]/g,
    SPACES: /\s+/g,
};
//export const RSA_PUBLIC_KEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0hbbMQT6Le04KVSp+B9r4xVlS7217dm/ltRr3D2eIGRVpXbrK0MZ4pjGe2UzDGsKBa29U9HtSH6w2QZU9Ni9tLOTuEFYTR/kcVJ6x4iuk8sMFz2/cQW1biiciIj3JhJHaAxgDxZpuFR58VRS2kKvFI85bpaq5eQIbFmA1jIZ1CQIDAQAB';

export const ACTION = {
    SHOW_MAIN_LOADER: 'SHOW_MAIN_LOADER',
    HIDE_MAIN_LOADER: 'HIDE_MAIN_LOADER',
    HEADER_HIDE: 'HEADER_HIDE',
    FOOTER_HIDE: 'FOOTER_HIDE',
    SET_SUBSCRIBER_LIST: 'SET_SUBSCRIBER_LIST',
    SHOW_SPLASH: 'SHOW_SPLASH',
    HIDE_SPLASH: 'HIDE_SPLASH',
    REQUEST_FIRED: 'REQUEST_FIRED',
    RESPONSE_RECEIVED: 'RESPONSE_RECEIVED',
    DO_NOTHING: 'DO_NOTHING',
    LOGGED_STATUS: 'LOGGED_STATUS',
    TOGGLE_PAGINATION_LOADER_VISIBILITY: 'TOGGLE_PAGINATION_LOADER_VISBLITY',
    SET_IS_SOURCE_APPSFLYER_DEEPLINK: "SET_IS_SOURCE_APPSFLYER_DEEPLINK",
    MINI_STATUS: 'MINI_STATUS',
    SUBSCRIPTION_PAGE_STATUS: 'SUBSCRIPTION_PAGE_STATUS',
    FROM_LOGIN_LOADER: 'FROM_LOGIN_LOADER',
    IS_LANDSCAPE: 'IS_LANDSCAPE',
};

export const COMMON_HEADINGS = {
    'FEATURE_UNDER_DEVELOPMENT': 'Feature Under Development',
};

export const CONTENTTYPE = {
    TYPE_MOVIES: "MOVIES",
    TYPE_MOVIE: 'MOVIE',
    TYPE_WEB_SHORTS: "WEB_SHORTS",
    TYPE_TV_SHOWS: "TV_SHOWS",
    TYPE_BRAND: "BRAND",
    TYPE_CATCH_UP: "CATCH_UP",
    TYPE_SERIES: "SERIES",
    TYPE_SERIES_CHILD: "SERIES_CHILD_LOCAL",
    TYPE_BRAND_CHILD: "BRAND_CHILD_LOCAL",
    TYPE_CUSTOM_WEB_VIEW: "CUSTOM_WEB_VIEW",
    TYPE_CUSTOM_PRIME: "CUSTOM_PRIME",
    TYPE_SUB_PAGE: "SUB_PAGE",
    TYPE_CUSTOM_MOVIES_DETAIL: "CUSTOM_MOVIES_DETAIL",
    TYPE_CUSTOM_WEB_SHORTS_DETAIL: "CUSTOM_WEB_SHORTS_DETAIL",
    TYPE_CUSTOM_TV_SHOWS_DETAIL: "CUSTOM_TV_SHOWS_DETAIL",
    TYPE_CUSTOM_BRAND_DETAIL: "CUSTOM_BRAND_DETAIL",
    TYPE_CUSTOM_SERIES_DETAIL: "CUSTOM_SERIES_DETAIL",
    TYPE_CUSTOM_CATCH_UP_DETAIL: "CUSTOM_CATCH_UP_DETAIL",
    TYPE_TVOD: 'TVOD',
    TYPE_CUSTOM_TVOD_DETAIL: 'CUSTOM_TVOD_DETAIL',
    TYPE_VOD: 'VOD',
    TYPE_LIVE:'LIVE',
};

export const FORMATTED_CONTENT_TYPE = {
    "movies": "MOVIES",
    "movie": 'MOVIE',
    "web-shorts": "WEB_SHORTS",
    "tv-shows": "TV_SHOWS",
    "brand": "BRAND",
    "catch-up": "CATCH_UP",
    "series": "SERIES",
    "series-child-local": "SERIES_CHILD_LOCAL",
    "brand-child-local": "BRAND_CHILD_LOCAL",
    "custom-web-view": "CUSTOM_WEB_VIEW",
    "custom-prime": "CUSTOM_PRIME",
    "sub-page": "SUB_PAGE",
    "custom-movies-detail": "CUSTOM_MOVIES_DETAIL",
    "custom-web-shorts-detail": "CUSTOM_WEB_SHORTS_DETAIL",
    "custom-tv-shows-detail": "CUSTOM_TV_SHOWS_DETAIL",
    "custom-brand-detail": "CUSTOM_BRAND_DETAIL",
    "custom-series-detail": "CUSTOM_SERIES_DETAIL",
    "custome-catcup-detail": "CUSTOM_CATCH_UP_DETAIL",
    "tvod": 'TVOD',
    "custom-tvod-detail": 'CUSTOM_TVOD_DETAIL',
    "vod": 'VOD',
    "live":'LIVE',
};
export const REVERSE_FORMATTED_CONTENT_TYPE = {
    "MOVIES": "movies",
    'MOVIE' : "movie",
    "WEB_SHORTS": "web-shorts",
    "TV_SHOWS" : "tv-shows",
    "BRAND" : "brand",
    "CATCH_UP" :  "catch-up",
    "SERIES" : "series",
    "SERIES_CHILD_LOCAL" : "series-child-local",
    "BRAND_CHILD_LOCAL" : "brand-child-local",
    "CUSTOM_WEB_VIEW" : "custom-web-view",
    "CUSTOM_PRIME" : "custom-prime",
    "SUB_PAGE" : "sub-page",
    "CUSTOM_MOVIES_DETAIL" : "custom-movies-detail",
    "CUSTOM_WEB_SHORTS_DETAIL" : "custom-web-shorts-detail",
    "CUSTOM_TV_SHOWS_DETAIL" : "custom-tv-shows-detail",
    "CUSTOM_BRAND_DETAIL" : "custom-brand-detail",
    "CUSTOM_SERIES_DETAIL" : "custom-series-detail",
    "CUSTOM_CATCH_UP_DETAIL" : "custom-catchup-detail",
    'TVOD' : "tvod",
    'CUSTOM_TVOD_DETAIL' : "custom-tvod-detail",
    'VOD' : "vod",
    'LIVE': "live"
};
export const SECTION_TYPE = {
    HERO_BANNER: 'HERO_BANNER',
    RAIL: 'RAIL',
};

export const LAYOUT_TYPE = {
    PORTRAIT: 'PORTRAIT',
    LANDSCAPE: 'LANDSCAPE',
    CIRCULAR: 'CIRCULAR',
    TOP_PORTRAIT: 'TOP_PORTRAIT',
};

export const REQUEST_METHOD = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

export const CONSTANT = {
    BITMOVIN_KEY: 'ee85ec87-3d5c-483a-bf95-204a0a1965ec',
    KEYS: {
        SUBTITLE_LANGUAGE: 'subtitle_lang',
    },
    VIDEOQUALITY: {
        HIGH: 'High(1080p)',
        LOW: 'Low(144p)',
        MEDIUM: 'Medium(480p)',
        AUTO: 'Auto',
    },
};
export const PLAY_ACTION = {
    "PLAY": 'Play',
    "PLAY_MOBILE": 'Play',
    "REPLAY": 'Replay',
    "RESUME": 'Resume',
    "SUBSCRIBE": 'Subscribe',
    "PLAY_NOW":'Play Now'
};

export const COMMON_ERROR = {
    SOME_ERROR: 'There seems to be some error',
};

export const APP_LAUNCH_COUNTER = {
    ONE: 1,
    TWO: 2,
}

export const LOCALSTORAGE = {
  CALL_TO_LEARN_API: "callToLearnApi",
  WATCHLIST: "watchList",
  PROFILE_UPDATED: "profileUpdated",
  MIX_PANEL_USERS: "mixPanelUsers",
  MIXPANEL_DISTINCT_ID: "mixpanelDistinctId",
  DEVICE_ID: "deviceId",
  PARTNER_INFO: "partnerInfo",
  SEARCH: "search",
  USER_INFO: "userInfo",
  TVOD_DATA: "tvodData",
  PACK_SELECTED: "packSelected",
  PLAYED: "played",
  SUBTITLE: "subtitle",
  LA_FIRED_DATE: "laFiredDate",
  CURRENT_PATH: "currentPath",
  LOGIN_WITH: "loginWith",
  SHOW_FS_POPUP: "showFsPopup",
  NEW_USER: "newUser",
  SESSION_EXPIRED: "sessionExpired",
  PLAYER_MUTE: "playerMute",
  HIDE_SPLASH: "hideSplash",
  GENRE_FIRED_DATE: "genreFiredDate",
  FS_PAYMENT_JOURNEY: "fsPaymentJourney",
  USER_TYPE: "userType",
  SUBSCRIPTION_TYPE: "subscriptionType",
  DEVICE_REMOVED: "deviceRemoved",
  JWT_TOKEN: "jwtToken",
  REDIRECT_TO_APP: "redirectToApp",
  DEEPLINK: "deeplink",
  LOGIN_DETAILS: "loginDetails",
  LOGIN_SID: "loginSid",
  ATV_UPGRADE: "atvUpgrade",
  FS_POPUP_SHOWN: "fsPopupShown",
  UPDATE_PEOPLE_PROPERTIES: "updatePeopleProperties",
  HANDLE_CANCELLATION_TRIGGER: "handleCancellationTrigger",
  DEVICE_CANCELLATION_FLAG: "deviceCancellationFlag",
  TRAILER_RESUME_TIME: "trailerResumeTime",
  INTERNET_AVAILABLE: "internetAvailable",
  SHEMAROO_UNIQUE_ID: "shemarooUniqueId",
  HUNGAMA_PLAYED: "hungamaPlayed",
  EROS_PLAYED: "erosPlayed",
  MUTE_STATE_EROS: "muteState",
  SONY_PLAYED: "sonyPlayed",
  ANONYMOUS_ID: "anonymousId",
  PREFERRED_LANGUAGES: "preferredLanguages",
  NO_LANGUAGE_SELECTED: "noLanguageSelected",
  HC_SELECTED_CATEGORY_DETAILS: "hcSelectedCategoryDetails",
  TRANSACTION_ID: "transactionID",
  PAYMENT_STATUS_VERBIAGE: "paymentStatusVerbiage",
  PAYMENT_ERROR_STATUS_VERBIAGE: "paymentErrorStatusVerbiage",
  SUBSCRIPTION_CHANGE_TYPE: "subscriptionChangeType",
  PREVIOUS_SUBSCRIPTION_DETAILS: "modifySubscriptionFlow",
  LOGOUT_FIRED: "logoutFired",
  IS_HIDE_DOWNLOAD_HEADER: "isHideDownloadHeader",
  BE_REGISTERED_DEVICE: "beRegisteredDevice",
  IS_PAYMENT_FROM_SUBSCRIPTION: "isPaymentFromSubscription",
  IS_TSWALLET_PAYMENT_MODE_SUCCESS: "isTSWalletPaymentModeSuccess",
  IS_HELP_CENTER_IN_MOBILE_APP: "isHelpCenterInMobileApp",
  PI_DETAIL_URL: "pi_detail_url",
  IS_SUBSCRIPTION_FROM_PI: "is_subscription_from_pi",
  IS_NON_FREEMIUM_NON_DTH_SUBSCRIPTION_FLOW: "isNonFreemiumDTHSubscriptionFlow",
  SUBSCRIPTION_JOURNEY_SOURCE: "subscriptionJourneySource",
  G_AUTH_TOKEN: "gAuthToken",
  GET_PAYMENT_DETAILS: "getpaymentDetails",
  HELP_CENTER_TOKEN: "helpCenterToken",
  USER_LANGUAGE_UPDATED: "userLanguageUpdated",
  MIXPANEL_SUPER_PROPERTIES: "mixpanelSuperProperties",
  JOURNEY_SOURCE: "journeySource",
  JOURNEY_SOURCE_REF_ID: "journeySourceRefId",
  CART_ID: "cartId",
  HOME_PAGE_LAUNCH_COUNTER: "homePageLaunchCounter",
  SHOW_SUBSCRIPTION_POPUP_COUNTER: "showSubscriptionPopupCounter",
  SHOW_LANGUAGE_POPUP_COUNTER: "showLanguagePopupCounter",
  FILTER_TOGGLE: "filterToggle",
  SUBSCRIPTION_SELECTED_PACK: "subscriptionSelectedPack",
  PAYMENT_SOURCE_KEY: "paymentSourceKey",
  PAYMENT_SOURCE_TOKEN: "paymentSourceTokenValue",
  IS_SILENT_LOGOUT: "isSilentLogout",
  PAYMENT_SOURCE_PARAM: "paymentSourceParam",
  SILENT_LOGIN_TIMESTAMP: "silentLoginTimestamp",
  LANG_GENRE_PAGE_SOURCE: "languageGenrePageSource",
  SELECTED_CATEGORY_PAGE: "selectedCategoryPage",
  HOTSTAR_LAUNCH_FREQUENCY: "hotstarLaunchFrequency",
  HOTSTAR_PERIODIC_FREQUENCY: "hotstarPeriodicFrequency",
  SILENT_LOGIN_INPROGRESS: "silentLoginInProgress",
  IS_PAYMENT_FROM_DISCOUNT: "isPaymentFromDiscount",
  SILENT_LOGIN_PLATFORM: "silentLoginPlatform",
  NUDGE_LAUNCH_COUNTER: "nudgeLaunchCounter",
  genericProviders: "genericProviders",
};

export const MOBILE_BREAKPOINT = 480;
export const TAB_BREAKPOINT = 768;
export const SMALL_WEB_BREAKPOINT = 1024;

export const KEYS_NOT_TO_DELETE = [
    LOCALSTORAGE.MIXPANEL_SUPER_PROPERTIES,
    LOCALSTORAGE.NO_LANGUAGE_SELECTED,
    LOCALSTORAGE.PREFERRED_LANGUAGES,
    LOCALSTORAGE.DEVICE_ID,
    LOCALSTORAGE.ANONYMOUS_ID,
    LOCALSTORAGE.G_AUTH_TOKEN,
    LOCALSTORAGE.MIXPANEL_DISTINCT_ID,
    // LOCALSTORAGE.HOME_PAGE_LAUNCH_COUNTER,
    // LOCALSTORAGE.SHOW_SUBSCRIPTION_POPUP_COUNTER,
    LOCALSTORAGE.SHOW_LANGUAGE_POPUP_COUNTER,
    LOCALSTORAGE.SELECTED_CATEGORY_PAGE
];

export const WEB_SMALL_PAYMENT_SOURCE = {
    DETAILS: 'details',
    TRANSACTION_ID: 'transactionId',
    INFO: 'info',
    NON_BINGE: 'nonBinge',
    ID: 'id'
}

export const SECTION_SOURCE = {
    RECOMMENDATION: 'RECOMMENDATION',
    CONTINUE_WATCHING: 'CONTINUE_WATCHING',
    EDITORIAL: 'EDITORIAL',
    PROVIDER: 'PROVIDER',
    LANGUAGE: 'LANGUAGE',
    GENRE: 'GENRE',
    TVOD: 'TVOD',
    SEARCH: 'SEARCH',
    WATCHLIST: 'WATCHLIST',
    FREE_TRIAL: 'FREE_TRIAL',
    PAID_TRIAL: 'PAID_TRIAL',
    FREE_TRIAL_UPGRADE: 'FREE_TRIAL_UPGRADE',
    BINGE_TOP_10_RAIL: 'BINGE_TOP_10_RAIL',
    LANGUAGE_NUDGE: 'LANGUAGE_NUDGE',
    SHUFFLE_RAIL: 'SHUFFLE_RAIL',
    TITLE_RAIL: 'TITLE_RAIL',
    BACKGROUND_BANNER_RAIL: 'BACKGROUND_BANNER_RAIL',
    PROVIDER_BROWSE_APPS: 'PROVIDER_BROWSE_APPS',
    SEASONS: "SEASONS",
    CATEGORY: 'CATEGORY',
    BINGE_CHANNEL: 'BINGE_CHANNEL',
    BINGE_DARSHAN_CHANNEL: "DARSHAN_CHANNEL",
};

export const DEVICE_TYPE = {
    ANDROID: 'android',
    WEB: 'web',
    IOS: 'ios',
    ATV: 'atv',
    FTV: 'ftv',
};

export const TYPE = {
    LOGIN: 'login',
    LOGOUT: 'logOut',
};
export const MESSAGE = {
    PROFILE_UPDATED: 'Profile information edited successfully.',
    NO_DATA: 'No Data Found!',
    INVALID_EMAIL: 'Please enter a valid Email ID',
    INVALID_NAME: 'Subscriber Name cannot be left Null or Empty.',
    EMAIL_MISMATCH: 'Your email address does not match. Please re-enter.',
    PASSWORD_MISMATCH: 'The retyped password does not match.',
    NEW_OLD_PWD_SAME: 'New password cannot be same as current password',
    ERROR_OCCURRED: 'Some Error Occurred',
    INCORRECT_PASSWORD: 'Incorrect password format',
    NETWORK_MESSAGE_MOBILE: 'Make sure that Wi-Fi or mobile data is turned on, then try again.',
    NETWORK_MESSAGE_WEB: 'Make sure that Wi-Fi or mobile data is turned on, then try again.',
    INVALID_RMN: 'Please enter a valid mobile number.',
    INVALID_SID: 'Please enter a valid Subscriber ID.',
    EMAIl_CANNOT_SAME: 'New email cannot be same as current email',
    INCORRECT_OTP_6: 'Please enter a 6-digit OTP.',
    INCORRECT_OTP_4: 'Please enter a 4-digit OTP.',
    PASSWORD_UPDATED_POPUP: 'Password has been updated.',
    DOWNLOAD_APP: 'To watch this content, please download Tata Sky Binge App',
    DEVICE_LOGOUT_HEADING: 'Sure you want to log out?',
    LOGOUT_INSTRUCTION: 'You will miss out on the latest content from your favourite apps.',
    LOGOUT_ICON_URL: '../../../../assets/images/logout-icon.svg',
    LOGOUT_PRIMARY_BTN: 'Log Out',
    LOGOUT_SECONDARY_BTN: 'Not Now',
    LOGOUT_SUCCESS: 'You have successfully logged out',
    OPERATION_NOT_COMPLETED: "The operation couldn't be completed",
    ACCOUNT_REFRESH_SUCCESSFUL: 'Account Refresh Successful',
    SUBSCRIPTION_PAYMENT_ERROR: 'Payment failed',
    SHARE_URL_MESSAGE: 'URL Copied Successfully',
    ADD_TO_BINGE_LIST: 'My Binge List',
    ADDED_TO_BINGE_LIST: 'Added to Binge List',
    REMOVE_FROM_BINGE_LIST: 'Removed from Binge List',
};

export const LENGTH_CHECK = {
    SID: 10,
    RMN: 10,
    OTP: 6,
    OTP_4: 4,
    PASSWORD: 8,
};

export const RENTAL_STATUS = {
    ACTIVE: 'ACTIVE',
};

export const CONTRACT = {
    RENTAL: 'RENTAL',
    CLEAR: 'CLEAR',
    FREE: 'FREE',
    SUBSCRIPTION: 'SUBSCRIPTION'
};

export const PLAYER_SOURCE = {
    WIDEVINE: "widevine",
    PLAYREADY: "playready",
    SS_PLAYREADY: "smooth_streaming",
    FAIR_PLAY: "fairplay",
};

export const PLAYER_URL_TYPE = {
    DASH: 'dash',
    HLS: 'hls',
};

export const PACK_TYPE = {
    FREE: 'free',
    PAID: 'paid',
};

export const RESPONSE_STATUS_CODE = {
    RES_200: 200,
    RES_500: 500,
};

export const POSITION = {
    APPEND: 'APPEND',
    PREPEND: 'PREPEND',
};

export const TA_MAX_CONTENT = {
    TA_MAX_RECOMMEND: 30,
    TA_MAX: 10,
};

export const TA_HERO_BANNER_MAX = 5;

export const CONFIG_TYPE = {
    EDITORIAL: 'Editorial',
    RECOMMENDATION: 'Recommendation',
};

export const RAIL_TITLE = {
    MOVIES: 'Related Movies',
    SHOWS: 'Related Shows',
    SHORTS: 'Related Shorts',
    BRAND: 'Related Brand',
    SERIES: 'Related Series',
};
export const LEARN_ACTION_TYPE = {
    FAVOURITE: 'FAVOURITE',
    CLICK: 'CLICK',
    SEARCH: "SEARCH"
};

export const LOGIN_TYPE = {
    PASSWORD: 'PASSWORD',
    OTP: 'OTP',
};

export const HEADER_CONSTANTS = {
    BINGE_WEB_SMALL: 'BINGE_WEB_SMALL',
    BINGE_ANYWHERE: 'BINGE_ANYWHERE',
    BINGE_ANYWHERE_WEB: 'binge_anywhere_web',
    WEB: 'WEB',
};

export const DEVICE_TYPE_HEADER = {
    WEB: 'WEB',
}

export const SCREEN_ORIENTATION = {
    PORTRAIT: 'portrait',
    LANDSCAPE: 'landscape',
};

export const SUBSCRIPTION_TYPE = {
    BINGE: 'BINGE',
    ANYWHERE: 'ANYWHERE',
    ANDROID_STICK: 'ANDROID_STICK',
    ATV: 'atv',
    FREEMIUM: 'FREEMIUM',
};

export const PAGE_LOAD_DELAY = 300000;
export const DEFAULT_LOADER_DELAY_TIME = 1000;
export const DEFAULT_CONNECTION_TIMEOUT = 30000;

export const NO_OP = () => {
};

export const PARTNER_SUBSCRIPTION_TYPE = {
    FREE: "FREE",
    PREMIUM: "PREMIUM",
    TVOD: "TVoD",
    FREE_ADVERTISEMENT: "FREE_ADVERTISEMENT",
};

export const PACK_SUBSCRIPTION_STATUS = {
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
};

export const DTH_BINGE_POPUP = {
    DTH_INACTIVE_BINGE_MBR_PAID_ACTIVE: {
        HEADER: 'Alert',
        INSTRUCTIONS: 'Your Tata Play account is inactive. Please recharge to ensure you can access Tata Play Binge after',
        PRIMARY_BTN_TEXT: 'Recharge',
        SECONDARY_BTN_TEXT: 'Skip',
    },
    DTH_INACTIVE_BINGE_WRITTEN_OFF_INACTIVE: {
        HEADER: 'Account Inactive',
        INSTRUCTIONS: 'Please recharge to access Tata Play Binge.',
        PRIMARY_BTN_TEXT: 'Recharge',
        SECONDARY_BTN_TEXT: 'Skip',
    },
    DTH_DUNNED_BINGE_MBR_PAID_ACTIVE: {
        HEADER: 'Alert',
        INSTRUCTIONS: 'Please recharge to ensure you can access Tata Play Binge after',
        PRIMARY_BTN_TEXT: 'Recharge',
        SECONDARY_BTN_TEXT: 'Skip',
    },
    DTH_DUNNED_BINGE_WRITTEN_OFF_INACTIVE: {
        HEADER: 'Alert',
        INSTRUCTIONS: 'Please recharge to access Tata Play Binge.',
        PRIMARY_BTN_TEXT: 'Recharge',
        SECONDARY_BTN_TEXT: 'Skip',
    },
    DTH_ACTIVE_BINGE_INACTIVE: {
        HEADER: 'Subscription Inactive',
        INSTRUCTIONS: 'Your Tata Play Binge Subscription is inactive due to insufficient balance.',
        PRIMARY_BTN_TEXT: 'Recharge',
        SECONDARY_BTN_TEXT: 'Skip',
    },
    DTH_ACTIVE_BINGE_ACTIVE: {
        HEADER: 'Alert',
        INSTRUCTIONS: 'Your Binge subscription is going to expire soon. Would you like to recharge now?',
        PRIMARY_BTN_TEXT: 'Recharge',
        SECONDARY_BTN_TEXT: 'Skip',
    },
    DTH_TEMP_SUSPENDED_BINGE_WRITTEN_OFF_INACTIVE: {
        HEADER: 'Account Suspended',
        INSTRUCTIONS: 'Please call Customer Care on 1800 208 6633 and resume services to access Tata Play Binge.',
        PRIMARY_BTN_TEXT: 'Ok',
    },
    DTH_TEMP_SUSPENDED_BINGE_MBR_PAID_ACTIVE: {
        HEADER: 'Alert',
        INSTRUCTIONS: 'Your Tata Play account is temporarily suspended. Please call Customer Care on 1800 208 6633 and resume services to access Tata Play Binge after',
        PRIMARY_BTN_TEXT: 'Ok',
    },
};

export const PLAY_STORE_URL = {
    ANDROID: 'https://play.google.com/store/apps/details?id=com.tatasky.binge',
    IOS: 'https://apps.apple.com/us/app/tata-play-binge/id1555688122',
};

export const SOCIAL_MEDIA_URL = {
    FACEBOOK: 'https://www.facebook.com/TataPlayBinge',
    WHATSAPP: 'https://www.whatsapp.com/',
    INSTAGRAM: 'https://www.instagram.com/tataplaybingeofficial/',
    YOUTUBE: 'https://www.youtube.com/@TataPlayBinge',
    TWITTER: 'https://twitter.com/TataPlayBinge',
}

export const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    RIGHT: 'right',
    LEFT: 'left',
};

export const BOTTOM_SHEET = {
    LANGUAGE: 'LANGUAGE',
    MOVIE: 'MOVIE',
    CATEGORIES: 'CATEGORIES',
    LOGIN: 'LOGIN',
    PI_DETAIL: 'PI_DETAIL',
    PI_DETAIL_DESCRIPTION: 'PI_DESCRIPTION',
    MINI_SUBSCRIPTION: "MINI_SUBSCRIPTION"
};

export const DTH_TYPE = {
    DTH_W_BINGE_OLD_USER: 'DTH With Binge Old Stack',
    DTH_W_BINGE_NEW_USER: 'DTH With Binge New Stack',
    DTH_W_BINGE_USER: 'DTH With Binge',
    DTH_WO_BINGE_USER: 'DTH Without Binge',
    NON_DTH_USER: 'Non DTH User',
    GUEST: 'Guest',
};

export const ERROR_CODE = {
    ERROR_401: 401,
    ERROR_429: 429,
    ERROR_500: 500,
    ERROR_20109: 20109,
    ERROR_700006: 700006,
    ERROR_100048: 100048,
    ERROR_20022: 20022,
    ERROR_130007: 130007,
};

export const CODE = {
    CODE_200: 200,
}

export const PARAMS_TYPE = {
    USER_DETAILS: 'userDetails',
    LOGIN: 'login',
    SUBSCRIPTION_DETAILS: 'subscriptionDetails'
};

export const MENU_LIST = {
    BINGE_LIST: 'Binge List',
    EDIT_PROFILE: 'Edit Profile',
    CONTENT_LANGUAGE: 'Content Language',
    MANGE_DEVICES: 'Manage devices',
    PARENTAL_CONTROL: 'Parental Control',
    SWITCH_ACCOUNT: 'Switch Account',
    NOTIFICATION_SETTINGS: 'Notification Settings',
    TRANSACTION_HISTORY: 'Transaction History',
    SETTING: 'Settings',
};

export const PACK_NAME = {
    ALL: 'All',
    FREEMIUM: 'Freemium',
    GUEST: 'Guest',
}

export const DEFAULT_FILTER = {
    id: -1,
    title: "All",
}

export const MINI_SUBSCRIPTION = {
    CHANGE_TENURE: "CHANGE-TENURE",
    PLAN_SELECT: "PLAN-SELECT",
    LOGIN: "LOGIN",
    SELECTION_DRAWER: "SELECTION_DRAWER"

}
export const SEARCH_PARAM = {
  MIXPANEL_ID: "mixpanelId",
  ACTION: "action",
  PACK_NAME: "packName",
  PROVIDER_NAME: "providerName",
  JOURNEYSOURCE_REF_ID: "journeySourceRefId",
};

export const TOAST_ID = {
    LOGIN_NOT_NOW_TOAST: "login-not-now-toast"
}

export const COOKIE = {
    APPSFLYER_ID: "afUserId"
}

export const LOCATION_STATE = {
    SHOW_LOGIN: "showLogin"
}

export const SEARCH_PARAM_ACTION_VALUE = {
    LOGIN: "login",
    RENEW: "renew",
    MY_PLAN: "my-plan",
    RECHARGE: "recharge",
    DEEPLINK: "deeplink",
    PACK_SELECTION: "PACKSELECTION#CYOP",
    REGIONAL_APP_SELECTION: "REGAPPSELECTION#CONTENT"
}

export const SOURCE = {
    DEEPLINK: "DEEPLINK"
}

export const PRIVATE_DEEPLINKS = [
    SEARCH_PARAM_ACTION_VALUE.LOGIN,
    SEARCH_PARAM_ACTION_VALUE.RENEW,
    SEARCH_PARAM_ACTION_VALUE.MY_PLAN,
    SEARCH_PARAM_ACTION_VALUE.RECHARGE,
    SEARCH_PARAM_ACTION_VALUE.REGIONAL_APP_SELECTION,
]

export const MAX_CHAR = 150;

export const SUBSCRIPTION_TYPE_HEADER = {
    EXPIRED: 'expired',
    FREEMIUM: 'freemium',
    SUBSCRIBED: 'subscribed',
};

export const USELESS_WORDS = [
    "the", "a", "at", "be", "can", "cant", "could", "couldnt",
    "do", "does", "how", "i", "in", "is", "many", "much", "of",
    "on", "or", "should", "shouldnt", "so", "such",
    "them", "they", "to", "us", "we", "what", "who", "why",
    "with", "wont", "would", "wouldnt", "you"
];

export const SILENT_LOGIN_PLATFORM = {
  BINGE_OPEN_FS: "BINGE_OPEN_FS",
};
export const CATEGORY_NAME = {
    LANGUAGE_SETTING: 'language-setting',
    LANGUAGE_DRAWER: 'language-drawer'
};
