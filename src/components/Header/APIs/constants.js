import {URL} from "@constants/routeConstants";
import {MENU_LIST} from "@constants";

export const ACCOUNT_DROPDOWN_LIST = [{
    'name': 'switchAccount',
    'displayName': 'Switch Account',
    'leftIcon': 'icon-switch-account',
    'rightIcon': 'icon-down',
    'rightIconOnHover': 'icon-right',
    'isRedirectionReq': false,
}, {
    'name': 'editProfile',
    'displayName': 'Edit Profile',
    'reDirectTo': `/${URL.PROFILE}`,
    'leftIcon': 'icon-profile',
    'rightIcon': 'icon',
}, {
    'displayName': 'My Subscription',
    'reDirectTo': `/${URL.MY_SUBSCRIPTION}`,
    'leftIcon': 'icon-my-subscription-1',
    'rightIcon': 'icon',
}, /*{
        'displayName': 'Transaction History',
        'reDirectTo': `/${URL.TRANSACTION_HISTORY}`,
        'leftIcon': 'icon-trans-history',
        'rightIcon': 'icon',
    },
    {
        'displayName': 'My Offers',
        'reDirectTo': `/${URL.MY_OFFERS}`,
        'leftIcon': 'icon-my-offers',
        'rightIcon': 'icon',
    },
    {
        'displayName': 'Link My Tata Sky Accounts',
        'reDirectTo': `/${URL.LINK_ACCOUNT}`,
        'leftIcon': 'icon-link-accounts',
        'rightIcon': 'icon',
    },*/
    {
        'displayName': 'Device Management',
        'reDirectTo': `/${URL.DEVICE_MANAGEMENT}`,
        'leftIcon': 'icon-device-management',
        'rightIcon': 'icon',
    }, /*{
        'displayName': 'Notification Settings',
        'reDirectTo': `/${URL.NOTIFICATION_SETTINGS}`,
        'leftIcon': 'icon-notification_settings',
        'rightIcon': 'icon',
        'isLayeredIcon': true,
    },*/];

export const ACTION = {
    GET_ANONYMOUS_ID: 'GET_ANONYMOUS_ID',
    HEADER_CONTENT: 'HEADER_CONTENT',
    FETCH_PROFILE: 'FETCH_PROFILE',
    ADD_ALIAS: 'ADD_ALIAS',
    LOGIN_POPUP_STATE: 'LOGIN_POPUP_STATE',
    SEARCH_STATUS: 'SEARCH_STATUS',
    SEARCH_TEXT: 'SEARCH_TEXT',
    RECENT_SEARCH: 'RECENT_SEARCH',
    SEARCH_SOURCE: 'SEARCH_SOURCE',
    ACCOUNT_DROPDOWN: 'ACCOUNT_DROPDOWN',
    SWITCH_ACCOUNT_DROPDOWN: 'SWITCH_ACCOUNT_DROPDOWN',
    NOTIFICATION_DROPDOWN: 'NOTIFICATION_DROPDOWN',
    CALL_CONFIG: 'CALL_CONFIG',
    FETCH_PROFILE_ERROR: 'FETCH_PROFILE_ERROR',
    ADD_ALIAS_ERROR: 'ADD_ALIAS_ERROR',
    GET_RRM_SESSION_INFO: 'GET_RRM_SESSION_INFO',
    CLEAR_STORE: 'CLEAR_STORE',
    GET_FAQ: 'GET_FAQ',
    GET_GENRE: 'GET_GENRE',
    GET_CATEGORIES_LIST: 'GET_CATEGORIES_LIST',
    CATEGORIES_DROPDOWN: 'CATEGORIES_DROPDOWN',
    HEADER_DOWNLOAD: 'HEADER_DOWNLOAD',
    IS_HOME_PAGE: 'IS_HOME_PAGE',
    ACCOUNT_REFRESH: 'ACCOUNT_REFRESH',
    ACCOUNT_REFRESH_OLD_STACK: 'ACCOUNT_REFRESH_OLD_STACK', 
    MANAGED_APP_PUSH: 'MANAGED_APP_PUSH',
};

export const HEADER_MENU_LIST = [{
    pageName: "Home",
    pageType: "DONGLE_HOMEPAGE",
    position: 1,
    searchPageName: "HOME",
    subPage: false,
    subPageImage: "",
    subPageType: "",
    iconName: 'icon-home',
    linkToRedirect: URL.HOME,
    accessBeforeLogin: true,
}, {
    pageName: "Movies",
    pageType: "DONGLE_MOVIES_1",
    position: 2,
    searchPageName: "MOVIES",
    subPage: false,
    subPageImage: "",
    subPageType: "",
    iconName: 'icon-movies_in_active',
    linkToRedirect: URL.MOVIES,
    accessBeforeLogin: true,
}, {
    pageName: "Shows",
    pageType: "DONGLE_TVSHOWS",
    position: 3,
    searchPageName: "Shows",
    subPage: false,
    subPageImage: "",
    subPageType: "",
    iconName: 'icon-tv_in_active',
    linkToRedirect: URL.TV_Shows,
    accessBeforeLogin: true,
}, {
    pageName: "Sports",
    pageType: "BINGE_ANYWHERE_SPORTS",
    position: 4,
    searchPageName: "SPORTS",
    subPage: false,
    subPageImage: "",
    subPageType: "",
    iconName: 'icon-sports',
    linkToRedirect: URL.SPORTS,
    accessBeforeLogin: true,
}, {
    pageName: "Categories",
    pageType: "DONGLE_TVSHOWS",
    position: 4,
    searchPageName: "Categories",
    subPage: false,
    subPageImage: "",
    subPageType: "",
    iconName: 'icon-Category-upd',
    linkToRedirect: URL.CATEGORIES,
    accessBeforeLogin: true,
}];

export const HEADER_MENU_LIST_GO_VIP = {
    pageName: "Subscribe",
    pageType: "DONGLE_TVSHOWS",
    position: 4,
    searchPageName: "Subscribe",
    subPage: false,
    subPageImage: "",
    subPageType: "",
    linkToRedirect: URL.SUBSCRIPTION,
    loginOnClick: true,
    accessBeforeLogin: true,
    showCrown:true,
};
export const MENU_LIST_FIRST_LABEL = {
    HELP_AND_SUPPORT: 'Help & Support',
};

export const SIDE_BAR_MENU_LIST = [{
    firstLabel: MENU_LIST.BINGE_LIST,
    iconName: 'icon-Binge-list',
    linkToRedirect: URL.WATCHLIST,
    endIconPath: '../../../assets/images/end-icon.svg',
    accessBeforeLogin: false,
    webView: true,
    mobileView: true,
   }
    /*{
        firstLabel: 'Notifications',
        // iconName: 'icon-Notification-Bell',
        endIconPath: '../../../assets/images/end-icon.svg',
        leftIconPath: '../../../assets/images/Notifications-upd.svg',
        firstIconClassName: 'crown-icon',
        linkToRedirect: false,
        accessBeforeLogin: true,
        webView: false,
        mobileView: true,
    }*/
    , {
    firstLabel: 'Settings',
    iconName: 'icon-settings1',
    endIconPath: '../../../assets/images/end-icon.svg',
    linkToRedirect: true,
    accessBeforeLogin: false,
    webView: true,
    mobileView: true,
}, {
    firstLabel: MENU_LIST_FIRST_LABEL.HELP_AND_SUPPORT,
    iconName: 'icon-Help-Grey',
    linkToRedirect: URL.HELP_CENTER,
    endIconPath: '../../../assets/images/end-icon.svg',
    accessBeforeLogin: true,
    webView: true,
    mobileView: true,
}];

export const SIDE_MENU_HEADERS = {
    SUBSCRIBE: 'Subscribe',
    MY_PLAN: 'My Plan',
    TATA_SKY_BALANCE: 'Tata Play Balance',
};

export const GO_VIP_DATA = {
    firstLabel: SIDE_MENU_HEADERS.SUBSCRIBE,
    linkToRedirect: `${URL.SUBSCRIPTION}`,
    endIconPath: '../../../assets/images/arrow-see-all-yellow.svg', // iconName: 'icon-Crown',
    leftIconPath: '../../../assets/images/crown-icon.svg',
    firstIconClassName: 'crown-icon',
    firstLabelClassName: 'go-vip',
    funcClick: false,
    webView: true,
    mobileView: true,
};

