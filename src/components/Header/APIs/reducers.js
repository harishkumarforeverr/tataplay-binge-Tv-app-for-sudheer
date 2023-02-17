import { ACTION } from "./constants";
import get from "lodash/get";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE } from "@constants";

const isHideDownloadHeader = JSON.parse(getKey(LOCALSTORAGE.IS_HIDE_DOWNLOAD_HEADER));

export default function headerReducer(state = { val: false, isManagedApp: true, isHideDownloadHeader: isHideDownloadHeader }, action) {
    switch (action.type) {
        case ACTION.HEADER_CONTENT:
            return { ...state, headerItems: action.apiResponse.data };
        case ACTION.LOGIN_POPUP_STATE:
            return { ...state, val: (action.val) }
        case ACTION.SEARCH_STATUS:
            return { ...state, search: (action.val) };
        case ACTION.SEARCH_TEXT:
            return { ...state, searchText: (action.val) };
        case ACTION.RECENT_SEARCH:
            return { ...state, recentSearch: (action.val) };
        case ACTION.SEARCH_SOURCE:
            return { ...state, searchSource: (action.val) };
        case ACTION.ACCOUNT_DROPDOWN:
            return { ...state, accountDropDown: (action.val) }
        case ACTION.CATEGORIES_DROPDOWN:
            return { ...state, categoriesDropdown: (action.val) }
        case ACTION.SWITCH_ACCOUNT_DROPDOWN:
            return { ...state, switchAccountDropDown: (action.val) }
        case ACTION.NOTIFICATION_DROPDOWN:
            return { ...state, notificationDropDown: (action.val) }
        case ACTION.CALL_CONFIG:
            return { ...state, configResponse: get(action, 'apiResponse'), isManagedApp: get(action, 'apiResponse.data.config.managedAppEnabled')};   
            // return { ...state, configResponse: get(action, 'apiResponse'), isManagedApp: get(action, 'apiResponse.data.config.managedAppEnabled')};
        case ACTION.ADD_ALIAS:
            return { ...state, addAliasResponse: get(action, 'apiResponse') };
        case ACTION.GET_FAQ:
            return { ...state, faq: get(action, 'apiResponse') };
        case ACTION.GET_GENRE:
            return { ...state, genreInfo: get(action, 'apiResponse') };
        case ACTION.GET_ANONYMOUS_ID:
            return { ...state, anonymousUserData: action.apiResponse.data };
        case ACTION.GET_CATEGORIES_LIST:
            return { ...state, categoriesList: action.apiResponse.data };
        case ACTION.HEADER_DOWNLOAD:
            return { ...state, isHideDownloadHeader: action.data };
        case ACTION.IS_HOME_PAGE:
            return { ...state, isHomePage: action.data };
        case ACTION.ACCOUNT_REFRESH:
            return {...state, accountRefresh: action.apiResponse}
        case ACTION.ACCOUNT_REFRESH_OLD_STACK:
            return {...state, accountRefreshOldStack: action.apiResponse};
       case ACTION.MANAGED_APP_PUSH:
                // return {...state, isManagedApp: true}
                return {...state, isManagedApp: action.val}
        default:
            return state;
    }
}
