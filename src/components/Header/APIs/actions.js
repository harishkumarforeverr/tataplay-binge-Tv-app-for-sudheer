import {hideMainLoader, showMainLoader} from "@src/action";
import {URL} from '@constants/routeConstants';
import {ACTION, HEADER_MENU_LIST} from "./constants";
import HeaderServiceInstance from "./services"
import {getAllGenricProvider} from "@src/utils/common";


export const fetchHeaderData = () => {
    const currentRoute = location.href;
    const routeCheck = [URL.PRIVACY_POLICY, URL.CONTACT_US, URL.CHANGE_PASSWORD];
    let showLoader = routeCheck.some(el => currentRoute.includes(el))
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return HeaderServiceInstance.fetchHeaderData().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            response.data.items = HEADER_MENU_LIST.map((item, index) => {
                return {
                    ...item,
                    pageType: response.data.items[index]?.pageType,
                    searchPageName: response.data.items[index]?.searchPageName,
                }
            })
            dispatch({
                type: ACTION.HEADER_CONTENT, apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.HEADER_CONTENT, apiResponse: error,
            });
            console.log("Error while fetching header details :- " + error)
        });
    }
};

export const addAlias = (data) => {
    return dispatch => {
        return HeaderServiceInstance.addAlias(data).then(function (response) {
            dispatch({
                type: ACTION.ADD_ALIAS, apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.ADD_ALIAS_ERROR, apiResponse: error,
            });
            console.log("Error while adding aliases :- " + error)
        });
    }
};

export const loginPopupState = (val) => {
    return dispatch => {
        dispatch({type: ACTION.LOGIN_POPUP_STATE, val})
    }
};

export const setSearch = (val) => {
    return ({type: ACTION.SEARCH_STATUS, val})
}

export const setSearchText = (val) => {
    return ({type: ACTION.SEARCH_TEXT, val})
}

export const recentSearch = (val) => {
    return ({type: ACTION.RECENT_SEARCH, val})
}

export const searchSource = (val) => {
    return ({type: ACTION.SEARCH_SOURCE, val})
}

export const accountDropDown = (val) => {
    return ({type: ACTION.ACCOUNT_DROPDOWN, val})
}

export const switchAccountDropDown = (val) => {
    return ({type: ACTION.SWITCH_ACCOUNT_DROPDOWN, val})
}

export const notificationDropDown = (val) => {
    return ({type: ACTION.NOTIFICATION_DROPDOWN, val})
}
export const categoryDropDown = (val) => {
    return ({type: ACTION.CATEGORIES_DROPDOWN, val})
}

export const fetchConfig = (showLoader = false) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return HeaderServiceInstance.fetchConfig().then(function (_response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CALL_CONFIG, apiResponse: _response,

            });
            getAllGenricProvider();
            return _response.data;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CALL_CONFIG, apiResponse: error,
            });
            console.log("Error while fetching config :- " + error)
        });
    }
};

export const clearStore = () => ({
    type: ACTION.CLEAR_STORE,
});

export const getFAQ = () => {
    return dispatch => {
        dispatch(showMainLoader());
        return HeaderServiceInstance.getFAQ().then(function (_response) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_FAQ, apiResponse: _response,

            });
            return _response.data;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_FAQ, apiResponse: error,
            });
            console.log("Error while fetching faq info :- " + error)
        });
    }
}

export const getGenreInfo = () => {
    return dispatch => {
        dispatch(showMainLoader());
        return HeaderServiceInstance.getGenreInfo().then(response => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_GENRE, apiResponse: response,
            });
            return response.data;
        }).catch(error => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_GENRE, apiResponse: error,
            });
            console.log("Error while fetching genre info :- " + error)
        })
    }
}

export const fetchAnonymousId = (showLoader = false) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return HeaderServiceInstance.generateAnonymousId().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_ANONYMOUS_ID, apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_ANONYMOUS_ID, apiResponse: error,
            });
            console.log("Error while fetching anonymousId :- " + error)
        });
    }
}

export const getCategoriesList = (showLoader = false) => {
    return (dispatch) => {
        showLoader && dispatch(showMainLoader());
        return HeaderServiceInstance.categoriesList().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_CATEGORIES_LIST, apiResponse: response,
            });
            return response;
        })
            .catch((error) => {
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.GET_CATEGORIES_LIST, apiResponse: error,
                });
                console.log("Error while fetching categories list :- " + error);
            });
    };
};

export const isHideDownloadHeaderAction = (data) => {
    return ({type: ACTION.HEADER_DOWNLOAD, data})
}

export const isHomePage = (data) => {
    return ({type: ACTION.IS_HOME_PAGE, data})
}

export const refreshAccount = (showLoader = false) => {
    return (dispatch) => {
        showLoader && dispatch(showMainLoader());
        return HeaderServiceInstance.refreshAccount().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.ACCOUNT_REFRESH, apiResponse: response,
            });
            return response;
        })
            .catch((error) => {
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.ACCOUNT_REFRESH, apiResponse: error,
                });
                console.log("Error while refresh account :- " + error);
            });
    };
}

export const refreshAccountOldStack = (showLoader = false) => {
    return (dispatch) => {
        showLoader && dispatch(showMainLoader());
        return HeaderServiceInstance.refreshAccountOldStack().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.ACCOUNT_REFRESH_OLD_STACK, apiResponse: response,
            });
            return response;
        })
            .catch((error) => {
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.ACCOUNT_REFRESH_OLD_STACK, apiResponse: error,
                });
                console.log("Error while refresh account :- " + error);
            });
    };
}


/** 
    * @param {*} val - boolean 
    * @managedAppEnabled boolean
    * @managedAppPushChanges this function will invoke only when we will get the managedAppEnabled key in pubnub push response
* 
*/
export const managedAppPushChanges = (val) => {
    return ({type: ACTION.MANAGED_APP_PUSH, val})
}