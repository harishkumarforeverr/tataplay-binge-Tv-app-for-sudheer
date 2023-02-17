import axios from 'axios';
import get from 'lodash/get';

import store from "@src/store";
import {MODALS} from "@common/Modal/constants";
import {openPopup} from '@common/Modal/action';
import {hideMainLoader, requestFired, responseReceived, showMainLoader} from "@src/action";
import {getKey, setKey} from "@utils/storage";
import {URL} from "@constants/routeConstants";
import {isUserloggedIn, openTimeoutPopup, showNoInternetPopup, showToast} from "@utils/common";
import {setPlayerAPIError} from "@containers/PlayerWeb/APIs/actions";
import {DEFAULT_CONNECTION_TIMEOUT, ERROR_CODE, LOCALSTORAGE} from "@constants";
import {toast} from "react-toastify";
import {history} from '../utils/history';
import { setupCache} from 'axios-cache-interceptor';
import RequestConfig from '@utils/requestConfig';
import { axiosGenerateCacheKey } from './utils';

const axiosInstance = axios.create();

setupCache(axiosInstance,{
    ttl:  5 * 60 * 1000,
    methods: ['get','post'],
    generateKey: axiosGenerateCacheKey,
    staleIfError: true
});



export function doRequest(apiConfig, handleNetworkFailure = false, headerParams = {}) {
    const checkNetworkConnection = navigator.onLine ? 'online' : 'offline';
    const configResponse = get(store.getState(), 'headerDetails.configResponse');
    const config = configResponse?.data?.config;
    const connectTimeout = config?.connectTimeout * 1000;

    function checkStatus(successResponse, errorResponse, isAPIPrimary) {
        if (errorResponse && errorResponse.message === "Network Error" && checkNetworkConnection === 'offline' && !location.href.includes(URL.PLAYER) && !location.href.includes(URL.TRAILER)) {
            showNoInternetPopup();
        }
        if (errorResponse) {
            if (errorResponse.response && errorResponse.response.status === ERROR_CODE.ERROR_401 && isUserloggedIn()) {
                if (getKey(LOCALSTORAGE.SESSION_EXPIRED) === null) {
                    if (!window.location.pathname.includes(`/${URL.DEFAULT}`)) {
                        setKey(LOCALSTORAGE.SESSION_EXPIRED, true);
                        if (window.location.pathname.includes(`/${URL.PLAYER}`)) {
                            store.dispatch(setPlayerAPIError(true));
                        } else {
                            openTimeoutPopup(history);
                            console.log(`Device removed: API THROWN 401`);
                            setKey(LOCALSTORAGE.DEVICE_REMOVED, JSON.stringify(true));
                        }
                        store.dispatch(hideMainLoader());
                    }
                }
            } else if (errorResponse.response && get(errorResponse, 'response.status') === ERROR_CODE.ERROR_429) {
                showToast(config?.rateLimit ? config?.rateLimit : get(errorResponse, 'response.data.message'));
            } else if (errorResponse.response && isAPIPrimary) {
                if (!window.location.pathname.includes(`/${URL.PLAYER}`)) {
                    //let vootUrl = errorResponse?.config?.url.includes('voot');
                    store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                        modalClass: 'alert-modal error-state-modal',
                        headingMessage: errorResponse?.response?.data?.title ? errorResponse?.response?.data?.title: `Something Went Wrong`,
                        instructions: errorResponse?.response?.data?.message? errorResponse?.response?.data?.message : 'The operation couldn’t be completed. ',
                        primaryButtonText: 'Ok',
                        errorIcon: 'icon-alert-upd',
                        closeModal: true,
                        hideCloseIcon: true,
                        errorCodeInstruction: `Error code number : ${get(errorResponse, 'response.status')}`,
                    }));
                }
                store.dispatch(hideMainLoader());
            } else if (errorResponse.code === 'ECONNABORTED' && isAPIPrimary) {
                // Show popup if connectTimeout exceeds
                store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal connect-timeout-modal',
                    headingMessage: `Your request timed out. Please try again in some time.`,
                    primaryButtonText: 'Ok',
                    closeModal: true,
                    hideCloseIcon: true,
                    errorIcon: 'icon-alert-upd',
                }));
                store.dispatch(hideMainLoader());
            }
        }
    }

    let headers = {'content-type': 'application/json', ...apiConfig.headers};
    headers = headerParams ? {...headers, ...headerParams} : headers;
    const isAPIPrimary = apiConfig.isAPIPrimary;

    if(isUserloggedIn()) {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        headers = {...headers, dthStatus: userInfo.dthStatus, subscriptionType:get(userInfo, 'subscriptionType'),}
    }
    return new Promise((resolve, reject) => {
        const state = store.getState();
        if (RequestConfig.requestsCount === 0) {
            // no more requests. This is the last request
          store.dispatch(showMainLoader());
        }
       // store.dispatch(requestFired(apiConfig));
        
        RequestConfig.requestFired();
        let bingeDrpCacheDuration = get(state.headerDetails, "configResponse.data.config.bingeDrpCacheDuration") 
        //let isDrpEnabled =  get(state, "headerDetails.configResponse.data.config.bingeWebDrpEnabled")   
         axiosInstance({...apiConfig, cache: (!!apiConfig.cache)  ? {ttl : bingeDrpCacheDuration * 60 * 1000} : !!apiConfig.cache, ...{headers: headers, timeout: connectTimeout || DEFAULT_CONNECTION_TIMEOUT}})
            .then(res => {
                checkStatus(res.data, {}, isAPIPrimary);
                resolve(JSON.parse(JSON.stringify({...res.data,...{config : res?.config}} || {})))
            }).catch((error) => {
                checkStatus({}, error, isAPIPrimary);
                reject(error)
            }).finally(() => {
                // store.dispatch(responseReceived(apiConfig));
                RequestConfig.responseReceived();
                const state = store.getState();
                if (RequestConfig.requestsCount === 0) {
                    // no more requests. This is the last request
                    store.dispatch(hideMainLoader());
                }
            });
        if (checkNetworkConnection === 'offline') {
            store.dispatch(hideMainLoader());
        }
    });
}


export const clearAPIRequestCache = () =>{
    axiosInstance.storage.data = {}
}

export const getCacheData = async (id) =>{
    return await axiosInstance.storage.get(id);
}

export const clearCacheData = async (id) =>{
    await axiosInstance.storage.remove(id)
}
