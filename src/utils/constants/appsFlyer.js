import { PARTNER_SUBSCRIPTION_TYPE } from ".";
import { URL } from "./routeConstants";

const APPSFLYER = {
    EVENT: {
        APP_LAUNCH: "APP-LAUNCH",
        HOME: "HOME",
        SHOWS: "SHOWS",
        MOVIES: "MOVIES",
        SPORTS: "SPORTS",
        CATEGORY: "CATEGORY",
        CONTENT_DETAIL: "VIEW-CONTENT-DETAIL",
        SEARCH: "SEARCH",
        WATCHLIST: "BINGELIST",
        CONTENT_LANGUAGE: "CONTENT-LANGUAGE",
        MY_PLAN: "MY-PLAN",
        PAYMENT: "PAYMENT",
        SEE_ALL: "SEE-ALL",
        VIEW_LANGUAGE: "VIEW-LANGUAGE",
        VIEW_GENRE: "VIEW-GENRE",
        PLAY_CONTENT_FREEMIUM: "PLAY-CONTENT-FREEMIUM",
        PLAY_CONTENT_PREMIUM: "PLAY-CONTENT-PREMIUM",
        PLAY_CONTENT_TVOD: "PLAY-CONTENT-TVOD",
        LOGIN_SUCCESS: "LOGIN-SUCCESS",
        PACK_SELECTION_INITIATE: "PACK-SELECTION-INITIATE",
        PACK_SELECTED: "PACK-SELECTED",
        VIEW_LOGIN: "VIEW-LOGIN",
        MODIFY_PACK_INITIATE: "MODIFY-PACK-INITIATE",
        MODIFY_PACK_SUCCESS: "MODIFY-PACK-SUCCESS",
        FREE_TRIAL_SUCCESS: "FREE-TRIAL-SUCCESS",
        SUBSCRIPTION_SUCCESS: "SUBSCRIPTION-SUCCESS",
        SUBSCRIBE_FAILED: "SUBSCRIBE-FAILED",
        RECHARGE_INITIATE: "RECHARGE-INITIATE",
        RECHARGE_FAILED: "RECHARGE-FAILED",
        RECHARGE_SUCCESS: "RECHARGE-SUCCESS",
        SUBSCRIBE_SUCCESS_REPEAT:"SUBSCRIBE-SUCESS-REPEAT",
        SUBSCRIBE_SUCCESS_MODIFY_PACK:"SUBSCIBE-SUCCESS-MODIFY-PACK",
        SUBSCRIBE_SUCCESS_NEW:" SUBSCRIBE-SUCCESS-NEW",
        SIGN_UP:"SIGN-UP",
        LOGIN_OTP_REQUESTED:"LOGIN-OTP-REQUESTED",
        LOGIN_FAILURE:"LOGIN-FAILURE",
        PLAY_CONTENT_PREMIUM_VTR50:"PLAY-CONTENT-PREMIUM-VTR50",
        PLAY_CONTENT_PREMIUM_VTR75:"PLAY-CONTENT-PREMIUM-VTR75",
    },
    VALUE: {
        TYPE: "TYPE",
        AUTH: "AUTH",
        VALUE: "VALUE",
        SOURCE: "SOURCE",
        DEEPLINK: "DEEPLINK",
        REASON: "FAILED",
        HOME: "HOME",
        PAID: "PAID",
        PG: "PG",
        TSWALLET: "TSWALLET",
        HAMBURGER: "HAMBURGER",
        YES: "YES",
        NO: "NO",
        MOVIES: "Movies",
        TV_SHOWS: "Tv Shows",
        SPORTS: "sports",
        TVOD: "TVOD",
        WEB_SHORTS: "Web Shorts",
        SEARCH: "SEARCH",
        BRAND: "Brand",
        SERIES: "Series",
        DOWNGRADE: "DOWNGRADE",
        PLAYER: "PLAYER",
        RENEW: "RENEW",
        DEVICE_MANAGEMENT: "DEVICE-MANAGEMENT",
        EPISODE: "EPISODE",
        UPGRADE: "UPGRADE",
        INR:"INR",
        WATCHLIST: "WATCHLIST",
        LANDING_PAGE:"Landing Page",
        CONTENT_DETAIL: "CONTENT-DETAIL",
        POP_UP:"POP-UP",
        DRAWER:"Drawer",
        LOGGED_IN:"Logged-In",
        NON_LOGGED_IN:"Non-Logged-In",
        OTP:"OTP",
        M_SALES: "mSales"
    },
    PARAMETER: {
        TYPE: "TYPE",
        AUTH: "AUTH",
        VALUE: "VALUE",
        PACK_NAME: "PACK-NAME",
        PACK_PRICE: "PACK-PRICE",
        MOD_TYPE: "MOD-TYPE",
        SOURCE: "SOURCE",
        RAIL_TITLE: "RAIL-TITLE",
        CONTENT_TITLE: "CONTENT-TITLE",
        CONTENT_TYPE: "CONTENT-TYPE",
        FREE_CONTENT: "FREE-CONTENT",
        PARTNER_NAME: "PARTNER-NAME",
        CONTENT_LANGUAGE: "CONTENT-LANGUAGE",
        LANGUAGE: "LANGUAGE",
        GENRE: "GENRE",
        DURATION_SECONDS: "DURATION-SECONDS",
        DURATION_MINUTES: "DURATION-MINUTES",
        REASON: "REASON",
        RECHARGE: "RECHARGE",
        PACK_ID:"PACK-ID",
        PACK_DURATION:"PACK-DURATION",
        AF_REVENUE:"af_revenue",
        AF_CURRENCY:"af_currency",
        PROMO_CODE:"PROMO-CODE",
        PAYMENT_MODE:"PAYMENT-MODE",
        OLD_PACK_ID:"OLD-PACK-ID",
        CUID: "CUID",
        MOBILE_NUMBER: "MOBILE-NUMBER",
        SID: "SID",
        COMVIVAID: "COMVIVAID",
        USER_LOGIN_STATE:"USER-LOGIN-STATE",
        LISTING_TYPE:"LISTING-TYPE",
        PAYMENT_TYPE:"TYPE",
        PAYMENT_METHOD: "PAYMENT-METHOD",
        DEVICE_ID:"DEVICE-ID",
        CONTENT_CATEGORY: "CONTENT-CATEGORY",
        CONTENT_PARENT_TITLE: "CONTENT-PARENT-TITLE",
        
    },
    DEEPLINK: {
        LANGUAGE_GENRE: "language-genre",
        MY_SUBSCRIPTION: "my-subscription",
        RECHARGE: "recharge",
        RENEW: "renew"
    },
};

export default APPSFLYER;

export const APPSFLYER_SCREEN_EVENTS = {
    [URL.HOME]: APPSFLYER.EVENT.HOME,
    [URL.MOVIES]: APPSFLYER.EVENT.MOVIES,
    [URL.TV_Shows]: APPSFLYER.EVENT.SHOWS,
    [URL.SPORTS]: APPSFLYER.EVENT.SPORTS,
    [URL.CATEGORIES]: APPSFLYER.EVENT.CATEGORY,
    [URL.SEARCH]: APPSFLYER.EVENT.SEARCH,
    [URL.WATCHLIST]: APPSFLYER.EVENT.WATCHLIST,
    [URL.LANGUAGE]: APPSFLYER.EVENT.CONTENT_LANGUAGE,
    [URL.MY_PLAN]: APPSFLYER.EVENT.MY_PLAN
};


export const APPSFLYER_CONTENT_PLAY_EVENTS = {
    [PARTNER_SUBSCRIPTION_TYPE.FREE_ADVERTISEMENT.toLowerCase()]:
        APPSFLYER.EVENT.PLAY_CONTENT_FREEMIUM,
    [PARTNER_SUBSCRIPTION_TYPE.PREMIUM?.toLowerCase()]:
        APPSFLYER.EVENT.PLAY_CONTENT_PREMIUM,
    [PARTNER_SUBSCRIPTION_TYPE.TVOD]: APPSFLYER.EVENT.PLAY_CONTENT_TVOD,
};