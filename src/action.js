import {ACTION, DEFAULT_LOADER_DELAY_TIME, LOCALSTORAGE} from '@constants';
import store from "@src/store";
import { setMixpanelId } from '@utils/common';
import RequestConfig from '@utils/requestConfig';
import { getKey, setKey } from '@utils/storage';
import CommonService from './service';

export function showMainLoader() {
    return delayedLoader;
}

export const setIsSourceAppsFlyerDeeplink = () => (dispatch) => {
    dispatch({
        type: ACTION.SET_IS_SOURCE_APPSFLYER_DEEPLINK,
    });
};

export const togglePaginationLoaderVisbility = (flag) => (dispatch) => {
    dispatch({
        type:ACTION.TOGGLE_PAGINATION_LOADER_VISIBILITY,
        value:flag,
    })

}

export function delayedLoader(dispatch) {
    setTimeout(()=>{
        if(RequestConfig.requestsCount > 0){
            dispatch({type: ACTION.SHOW_MAIN_LOADER});
        }else{
            dispatch({type: ACTION.HIDE_MAIN_LOADER});
        }
    },(RequestConfig.loaderDelayTime))
    // const state = store.getState();
    // setTimeout(() => {
    //     const state = store.getState().commonContent;
    //     const requests = state && state.requests;
    //     if(requests > 0){
    //         dispatch({type: ACTION.SHOW_MAIN_LOADER});
    //     } else {
    //         dispatch({type: ACTION.HIDE_MAIN_LOADER});
    //     }
    // }, (state.commonContent && state.commonContent.loaderDelayTime) || DEFAULT_LOADER_DELAY_TIME);
}

export function showMainLoaderImmediate() {
    return {type: ACTION.SHOW_MAIN_LOADER}
}

export function hideMainLoader() {
    return {type: ACTION.HIDE_MAIN_LOADER}
}

export const hideHeader = (val) => {
    return {type: ACTION.HEADER_HIDE, val}
}
export const hideFooter = (val) => {
    return {type: ACTION.FOOTER_HIDE, val}
}

export const showSplash = () => {
    return {type: ACTION.SHOW_SPLASH};
}

export const hideSplash = () => {
    return {type: ACTION.HIDE_SPLASH};
}

export const requestFired = (url) => {
    return {type: ACTION.REQUEST_FIRED, data: url};
}

export const responseReceived = (url) => {
    return {type: ACTION.RESPONSE_RECEIVED, data: url};
};

export const loggedIn = (val) => {
    return {type: ACTION.LOGGED_STATUS, val}
}

export const isfromMini=(val)=>{
    return {type: ACTION.MINI_STATUS, val}

}
export const fetchMixpanelId = (referenceId) => {
    return (dispatch) => {
        return CommonService.fetchMixpanelId(referenceId).then((response) => {
            let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
            const mixpanelId = response.data.id;
            userInfo = {
                ...userInfo,
                mixpanelId
            }
            setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(userInfo));
            setMixpanelId(mixpanelId)
        }).catch((error) => {
            console.log("Error while fetching mixpanel id address:- " + error);
        });
    }
};

export const fromLoginLoader = (val) => {
    return{  type:ACTION.FROM_LOGIN_LOADER,
       val,
    }
};

export const isLandscapeMode = (val) => {
    return{  type:ACTION.IS_LANDSCAPE,
       val,
    }
}
