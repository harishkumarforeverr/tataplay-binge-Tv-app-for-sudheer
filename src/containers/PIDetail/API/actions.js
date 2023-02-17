import PIServiceInstance from "./services";
import { ACTION } from "./constant";

import { showMainLoader, hideMainLoader } from '@src/action';
import get from "lodash/get";
import { CONFIG_TYPE, LAYOUT_TYPE, SECTION_SOURCE } from "@constants";
import { filterPartnerContents, getRailTitle, taDataFiltering } from "@utils/common";

export const openPIDetailMobilePopup = () => dispatch => {
    dispatch({
        type: ACTION.TOGGLE_PI_DETAIL_MOBILE_POPUP,
        value: true,
    })
}

export const hidePIDetailMobilePopup = () => dispatch => {
    dispatch({
        type: ACTION.TOGGLE_PI_DETAIL_MOBILE_POPUP,
        value: false,
    })
}

export const fetchPIData = (id, contentType, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return PIServiceInstance.fetchPIData(id, contentType).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_PI_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_PI_ERROR_DATA,
                apiResponse: error,
            });
            console.log("Error while fetching PI data :- " + error)
        });
    }
};

export const fetchPIRecommendedData = (data, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return PIServiceInstance.fetchPIRecommendedData(data).then(function (res) {
            showLoader && dispatch(hideMainLoader());

            res.data.exactCount = res.data.contentList.length;
            res.data.contentList = filterPartnerContents(res.data.contentList, res.data.sectionSource);
            res.data.updatedCount = res.data.contentList.length;

            dispatch({
                type: ACTION.FETCH_PI_RECOMMENDED_DATA,
                apiResponse: res,
            });
        }).catch(function (res) {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_PI_RECOMMENDED_DATA_ERROR,
                apiResponse: res,
            });
        })
    }
}
export const fetchLiveContentData = (id, refetchLiveContent) => {
    return dispatch => {
        dispatch(showMainLoader());
        return PIServiceInstance.fetchLiveContentData(id).then(function (response) {
            dispatch(hideMainLoader());
            dispatch({
                type: refetchLiveContent ? ACTION.REFETCH_LIVE_CONTENT_DATA : ACTION.FETCH_LIVE_CONTENT_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: refetchLiveContent ? ACTION.REFETCH_LIVE_ERROR_DATA : ACTION.FETCH_LIVE_CONTENT_DATA,
                apiResponse: error,
            });
        });
    }
};
export const setLiveContentData = (data) => {
    return dispatch => {
        dispatch({
                type: ACTION.FETCH_LIVE_CONTENT_DATA,
                apiResponse: data,
            });
        }
};
export const setLiveRailId = (data) => (dispatch) => {
    dispatch({
      type: ACTION.LIVE_RAILID,
      value: data,
    });
  };

export const getShemarooContent = (id, contentType) => {
    return dispatch => {
        dispatch(showMainLoader());
        return PIServiceInstance.getShemarooContent(id, contentType).then(function (response) {
            // dispatch(hideMainLoader('SHEAMROO'));
            dispatch({
                type: ACTION.GET_SHEMAROO,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            // dispatch(hideMainLoader('SHEAMROOERROR'));
            dispatch({
                type: ACTION.GET_SHEMAROO_ERROR,
                apiResponse: error,
            });
            console.log("Error in fetching shemaroo content :- " + error)
        });
    }
};

export const clearContent = () => {
    return dispatch => dispatch({ type: ACTION.CLEAR_CONTENT });
};

export const getTARecommendationRail = (data, seeAll = false, loader = false) => {
    return dispatch => {
        loader && dispatch(showMainLoader());
        return PIServiceInstance.getTARecommendationRail(data, seeAll).then(function (response) {
            loader && dispatch(hideMainLoader());
            let contentList = get(response, 'data.contentList', []);
            if (contentList) {
                response.data = {
                    ...response.data,
                    id: 1,
                    sectionSource: SECTION_SOURCE.RECOMMENDATION,
                    configType: CONFIG_TYPE.RECOMMENDATION,
                    layoutType: LAYOUT_TYPE.LANDSCAPE,
                    title: getRailTitle(data.contentType),
                }
            }
            response.data.contentList = filterPartnerContents(response.data.contentList, response.data.sectionSource);

            response.data.contentList = taDataFiltering(response.data.contentList);
            
            dispatch({
                type: ACTION.TA_RECOMMENDATION_RAIL,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.TA_RECOMMENDATION_RAIL,
                apiResponse: error,
            });
            console.log("Error while fetching ta hero banner data :- " + error)
        });
    }
};

export const fetchContinueWatchingDetails = (id, contentType, partnerId, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return PIServiceInstance.fetchContinueWatchingDetails(id, contentType, partnerId).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_CONTINUE_WATCHING_DETAILS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_CONTINUE_WATCHING_DETAILS,
                apiResponse: error,
            });
            console.log("Error while fetching continue watching details from last-watch :- " + error)
        });
    }
};

export const getTVODExpiry = (id, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return PIServiceInstance.getTVODExpiry(id).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_TVOD_EXPIRY_DETAILS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_TVOD_EXPIRY_DETAILS,
                apiResponse: error,
            });
            console.log("Error while fetching tvod expiry details :- " + error)
        });
    }
};

export const checkPlaybackEligibility = (showLoader = false) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return PIServiceInstance.getPlaybackEligibility().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_PLAYBACK_ELIGIBILITY,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_PLAYBACK_ELIGIBILITY,
                apiResponse: error,
            });
            console.log("Error while fetching free playback eligibility :- " + error)
        });
    }
};

export const trackShemarooAnalytics = (payload) => {
    return dispatch => {
        dispatch(showMainLoader());
        return PIServiceInstance.trackShemarooAnalytics(payload).then(response => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.TRACK_SHEMAROO_ANALYTICS,
                apiResponse: response,
            });
            return response;
        }).catch(error => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.TRACK_SHEMAROO_ANALYTICS,
                apiResponse: error,
            });
        })
    }
};

export const trackPlanetMarathiAnalytics = (payload) => {
    return dispatch => {
        dispatch(showMainLoader());
        return PIServiceInstance.trackPlanetMarathiAnalytics(payload).then(response => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.TRACK_PLANET_MARATHI_ANALYTICS,
                apiResponse: response,
            });
            return response;
        }).catch(error => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.TRACK_PLANET_MARATHI_ANALYTICS,
                apiResponse: error,
            });
        })
    }
};

export const fetchRedemptionUrl = () => {
        return dispatch => {
            dispatch(showMainLoader());
            return PIServiceInstance.fetchRedemptionUrl().then(response => {
                dispatch(hideMainLoader());
                if (response.code === 1) {
                    dispatch({
                        type: ACTION.FETCH_REDEMPTION_URL,
                        payload: ''
                    })
                } else {
                    dispatch({
                        type: ACTION.FETCH_REDEMPTION_URL,
                        payload: response?.data?.redemption_url
                    });
                    window.open(response?.data?.redemption_url, '_blank');
                }
                
            })
        }
    }