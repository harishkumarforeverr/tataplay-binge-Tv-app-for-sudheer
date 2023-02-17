import { fromLoginLoader, hideMainLoader, showMainLoader } from "@src/action";
import SubscriptionServiceInstance from "./service";
import { ERROR_CODE, LOCALSTORAGE, PARAMS_TYPE, SILENT_LOGIN_PLATFORM, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { delay, handlePackValidationFailed, handleLogoutAllDevices, updateUserInfo } from '@utils/common';

import { ACTION, PACK_VALIDATE_DELAY_WAIT_TIME } from './constant';
import store from "@src/store";
import { managedAppPushChanges } from "@components/Header/APIs/actions";
import { getKey } from "@utils/storage";

export const getCurrentSubscriptionInfo = (showLoader = false, handleNetworkFailure = false, updatePeopleProperty = false, apiPrimary = false) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return SubscriptionServiceInstance.getCurrentSubscriptionInfo(apiPrimary, handleNetworkFailure).then(async (response) => {
            if (response?.code === ERROR_CODE.ERROR_100048) {
                const { message, title = "Cancelled Plan(s)" } = response;
                handleLogoutAllDevices(title, message)
                showLoader && dispatch(hideMainLoader());
            }
            else {
                const params = { type: PARAMS_TYPE.SUBSCRIPTION_DETAILS };
                updateUserInfo(response, params);
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.GET_CURRENT_SUBSCRIPTION_INFO,
                    apiResponse: response,
                });
            }
            return response;
        }).catch((error) => {

            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.GET_CURRENT_SUBSCRIPTION_INFO,
                apiResponse: error,
            });
            console.log("Error while getting current subscription info :- " + error)
        });
    }
};

export const getPackListing = (payload) => {
    return dispatch => {
        return SubscriptionServiceInstance.packListing(payload).then((response) => {
            dispatch({
                type: ACTION.PACK_LISTING,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.PACK_LISTING,
                apiResponse: error,
            });
            console.log("Error while fetching pack list :- " + error)
        });
    }
};

export const tenureAccountBal = (payload) => {
    return dispatch => {
        return SubscriptionServiceInstance.getTenureAccountBal(payload).then((response) => {
            dispatch({
                type: ACTION.GET_ACCOUNT_BALALNCE,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_ACCOUNT_BALALNCE,
                apiResponse: error,
            });
            console.log("Error while fetching tenure account balance :- " + error)
        });
    }
};

export const validateSelectedPack = (payload, requestCount = 1) => {
    return (dispatch, getState) => {
        return SubscriptionServiceInstance.validateSelectedPack(payload).then(async (response) => {
            if (response?.code === ERROR_CODE.ERROR_20022) {
                /** TSF-7470 retry once after waiting for x seconds  */
                if (requestCount > 1) {
                    handlePackValidationFailed(response?.message);
                } else {
                    const { configResponse } = getState().headerDetails;
                    setTimeout(() => dispatch(showMainLoaderImmediate()), 1000); // hack to prevent loader from hiding from apiService
                    await delay(configResponse?.newUserDelay || PACK_VALIDATE_DELAY_WAIT_TIME);
                    return dispatch(validateSelectedPack(payload, requestCount + 1));
                }
            }
            else {
                dispatch({
                    type: ACTION.VALIDATE_SELECTED_PACK,
                    apiResponse: response,
                });
                return response;
            }
        }).catch((error) => {
            dispatch({
                type: ACTION.VALIDATE_SELECTED_PACK,
                apiResponse: error,
            });
            console.log("Error while validating selected pack :- " + error)
        });
    }
};

export const addNewSubscription = (payload) => {
    return dispatch => {
        return SubscriptionServiceInstance.addNewSubscription(payload).then((response) => {
            dispatch({
                type: ACTION.ADD_NEW_PACK,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.ADD_NEW_PACK,
                apiResponse: error,
            });
            console.log("Error while adding new pack :- " + error)
        });
    }
};

export const modifyExistingSubscription = (payload) => {
    return dispatch => {
        return SubscriptionServiceInstance.modifyExistingSubscription(payload).then((response) => {
            dispatch({
                type: ACTION.MODIFY_EXISTING_PACK,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.MODIFY_EXISTING_PACK,
                apiResponse: error,
            });
            console.log("Error while modifying existing pack :- " + error)
        });
    }
};

export const cancelSubscription = (payload) => {
    return dispatch => {
        return SubscriptionServiceInstance.cancelSubscription(payload).then((response) => {
            dispatch({
                type: ACTION.CANCEL_SUBSCRIPTION,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.CANCEL_SUBSCRIPTION,
                apiResponse: error,
            });
            console.log("Error while cancel subscription :- " + error)
        });
    }
};

export const revokeSubscription = () => {
    return dispatch => {
        return SubscriptionServiceInstance.resumePack().then((response) => {
            dispatch({
                type: ACTION.REVOKE_SUBSCRIPTION,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.REVOKE_SUBSCRIPTION,
                apiResponse: error,
            });
            console.log("Error while revoking subscription request:- " + error)
        });
    }
};

export const setUpdatedTenure = (value = {}) => {
    return { type: ACTION.SET_UPDATED_TENURE, value }
};

export const checkCurrentSubscriptionApi = () => {
    return { type: ACTION.CHECK_CALLING_SUBSCRIPTION_API }
}
export const getNotLoggedInPack = () => {
    return dispatch => {
        return SubscriptionServiceInstance.getNotLoggedInPack().then((response) => {
            dispatch({
                type: ACTION.PACK_LISTING,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.PACK_LISTING,
                apiResponse: error,
            });
            console.log("Error while fetching pack list:- " + error)
        });
    }
};

export const getWebPortalLink = (requestHeaders,isCampaign) => {
    return dispatch => {
        return SubscriptionServiceInstance.getWebPortalLink(requestHeaders,isCampaign).then((response) => {
            dispatch({
                type: ACTION.PORTAL_PACK_LINK,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.PORTAL_PACK_LINK,
                apiResponse: error,
            });
            console.log("Error while fetching web portal pack list:- " + error);
            return error?.response;
        });
    }
};

export const getWebPortalBackLink = (cartId) => {
    return dispatch => {
        return SubscriptionServiceInstance.getWebPortalBackLink(cartId).then((response) => {
            dispatch({
                type: ACTION.PORTAL_PACK_LINK,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.PORTAL_PACK_LINK,
                apiResponse: error,
            });
            console.log("Error while fetching web portal pack list:- " + error)
        });
    }
};

export const openMiniSubscription = (value) => {
    return { type: ACTION.MINI_SUBSCRIPTION, value }
};

export const clearPackList = () => {
    return { type: ACTION.CLEAR_PACK_LIST }
};

export const getPlanSummaryUrl = (cartId) => {
    return dispatch => {
        dispatch(hideMainLoader())
        return SubscriptionServiceInstance.getPlanSummaryUrl(cartId).then(async (response) => {
            dispatch(hideMainLoader())
            dispatch({
                type: ACTION.PORTAL_PACK_LINK,
                apiResponse: response,
            });
            return response;

        }).catch(async (error) => {
            dispatch(fromLoginLoader(false))
            dispatch({
                type: ACTION.PORTAL_PACK_LINK,
                apiResponse: error,
            });
            console.log("Error while fetching web portal pack list:- " + error)
        });
    }
};


export const migrateUserInfo = (migrateUserHeader) => {
    return dispatch => {
        return SubscriptionServiceInstance.migrateUserInfo(migrateUserHeader).then((response) => {
            dispatch({
                type: ACTION.MIGRATE_USER_INFO,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.MIGRATE_USER_INFO,
                apiResponse: error,
            });
            console.log("Error while migrate user info :- " + error)
        });
    }
};


export const getCampaignPageData = () => {
    return dispatch => {
        return SubscriptionServiceInstance.getCampaignPageData().then((response) => {
            dispatch({
                type: ACTION.CAMPAIGN_PAGE_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.CAMPAIGN_PAGE_DATA,
                apiResponse: error,
            });
            console.log("Error while fetching campaign page data:- " + error)
        });
    }
};

export const getCampaignBannerData = (packName) => {
    return dispatch => {
        return SubscriptionServiceInstance.getCampaignBannerData(packName).then((response) => {
            dispatch({
                type: ACTION.CAMPAIGN_BANNER_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.CAMPAIGN_BANNER_DATA,
                apiResponse: error,
            });
            console.log("Error while fetching campaign page data:- " + error)
        });
    }
};

export const isUserEligibileForPack = (packId) => {
    return dispatch => {
        return SubscriptionServiceInstance.isUserEligibileForPack(packId).then((response) => {
            dispatch({
                type: ACTION.USER_ELIGIBILE_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.USER_ELIGIBILE_DATA,
                apiResponse: error,
            });
            console.log("Error while fetching isUserEligibileForPack data:- " + error)
        });
    }
};

export const setRegionalNudgeStatus= () => {
    return { type: ACTION.REGIONAL_NUDGE_STATUS }
};

export const checkFallbackFlow = () => {
  let isBingeOpenFs = getKey(LOCALSTORAGE.SILENT_LOGIN_PLATFORM) === SILENT_LOGIN_PLATFORM.BINGE_OPEN_FS;
  let isMsales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
  return (dispatch) => {
    return SubscriptionServiceInstance.checkFallbackFlow()
      .then((response) => {
        (!!isBingeOpenFs || !!isMsales) ? dispatch(managedAppPushChanges(false)) : dispatch(managedAppPushChanges(response?.data?.enableManageApp))
        return response;
      })
      .catch((error) => {
        (!!isBingeOpenFs || !!isMsales) && dispatch(managedAppPushChanges(false));
        console.log("Error while fetching checkFallbackFlow data:- " + error);
      });
  };
};