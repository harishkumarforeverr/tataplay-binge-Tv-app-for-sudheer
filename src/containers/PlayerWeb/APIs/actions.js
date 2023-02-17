import PlayerServiceInstance from "./services"
import {ACTION} from './constants'
import {hideMainLoader, showMainLoader} from "@src/action";

export const addWatchlist = (id, contentType, isHover = false) => {
    return dispatch => {
        // dispatch(showMainLoader());
        return PlayerServiceInstance.addWatchlist(id, contentType, isHover).then(function (response) {
            // dispatch(hideMainLoader());
            dispatch({
                type: ACTION.ADD_WATCHLIST_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            // dispatch(hideMainLoader());
            dispatch({
                type: ACTION.ADD_WATCHLIST_ERROR_DATA,
                apiResponse: error,
            });
            console.log("Error while adding watchlist :- " + error)
        });
    }
};

export const checkWatchlistContent = (id, contentType, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return PlayerServiceInstance.checkWatchlistContent(id, contentType).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CHECK_WATCHLIST,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CHECK_WATCHLIST_ERROR,
                apiResponse: error,
            });
            console.log("Error while checking watchlist :- " + error)
        });
    }
};

export const getVootUrl = (id, contentType, provider, partnerUniqueId) => {
    return dispatch => {
        return PlayerServiceInstance.getVootUrl(id, contentType, provider, partnerUniqueId).then(function (response) {
            dispatch({
                type: ACTION.GET_VOOT,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_VOOT,
                apiResponse: error,
            });
            console.log("Error in fetching voot content :- " + error)
        });
    }
};
export const getPlanetMarathiUrl = (contentId) => {
    return dispatch => {
        return PlayerServiceInstance.getPlanetMarathiUrl(contentId).then(function (response) {
            dispatch({
                type: ACTION.GET_PLANET_MARATHI,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_PLANET_MARATHI,
                apiResponse: error,
            });
            console.log("Error in fetching chaupal content :- " + error)
        });
    }
};

export const getChaupalUrl = (id, contentType,contentId) => {
    return dispatch => {
        return PlayerServiceInstance.getChaupalUrl(id, contentType,contentId).then(function (response) {
            dispatch({
                type: ACTION.GET_CHAUPAL,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_CHAUPAL_ERROR,
                apiResponse: error,
            });
            console.log("Error in fetching chaupal content :- " + error)
        });
    }
};

export const getLionsGatePlaybackData = (payload) => {
    return dispatch => {
        return PlayerServiceInstance.getLionsGatePlaybackData(payload).then(function (response) {
            dispatch({
                type: ACTION.GET_LIONS_GATE_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_LIONS_GATE_ERROR,
                apiResponse: error,
            });
            console.log("Error in fetching lions gate content data:- " + error)
        });
    }
};

export const checkPrevNextEpisode = (id) => {
    return dispatch => {
        return PlayerServiceInstance.checkNextPrevEpisode(id).then(function (response) {
            dispatch({
                type: ACTION.CHECK_NEXT_PREV_EPISODE,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.CHECK_NEXT_PREV_ERROR,
                apiResponse: error,
            });
            console.log("Error while checking watchlist :- " + error)
        });
    }
}

export const setContinueWatching = (id, watchDuration, totalDuration, contentType) => {
    return dispatch => {
        return PlayerServiceInstance.setContinueWatching(id, watchDuration, totalDuration, contentType).then(function (response) {
            dispatch({
                type: ACTION.SET_CONTINUE_WATCHING,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.SET_CONTINUE_WATCHING,
                apiResponse: error,
            });
            console.log("Error while setting cont. watching :- " + error)
        });
    }
}

export const setLA = (data) => {
    return dispatch => {
        return PlayerServiceInstance.setLA(data).then(function (response) {
            dispatch({
                type: ACTION.SET_LA_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.SET_LA_DATA,
                apiResponse: error,
            });
            console.log("Error while triggering learn action :- " + error)
        });
    }
}

export const setPlayerAPIError = (value) => {
    return dispatch => dispatch({
        type: ACTION.SET_PLAYER_API_ERROR,
        apiResponse: value,
    });
}

export const getZee5Tag = (partnerUniqueId) => {
    return dispatch => {
        return PlayerServiceInstance.getZee5Tag(partnerUniqueId).then(function (response) {
            dispatch({
                type: ACTION.GET_ZEE5,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_ZEE5,
                apiResponse: error,
            });
            console.log("Error in fetching zee5 content :- " + error)
        });
    }
};

export const viewCountLearnAction = (contentType, id) => {
    return dispatch => {
        return PlayerServiceInstance.viewCountLearnAction(contentType, id).then(function (response) {
            dispatch({
                type: ACTION.SET_VIEW_COUNT_LA_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.SET_VIEW_COUNT_LA_DATA,
                apiResponse: error,
            });
            console.log("Error while triggering view count learn action :- " + error)
        });
    }
}

export const generateToken = (body) => {
    return dispatch => {
        return PlayerServiceInstance.generateToken(body).then(response => {
            dispatch({
                type: ACTION.GENERATE_TOKEN,
                apiResponse: response,
            });
            return response;
        }).catch(error => {
            dispatch({
                type: ACTION.GENERATE_TOKEN,
                apiResponse: error,
            });
            console.log('Error in fetching token for TVOD content');
        })
    }
}

export const resendLicenseChallenge = (url, body, header) => {
    return dispatch => {
        return PlayerServiceInstance.resendLicenseChallenge(url, body, header).then(response => {
            dispatch({
                type: ACTION.RESEND_LICENSE,
                apiResponse: response,
            });
            return response;
        }).catch(error => {
            dispatch({
                type: ACTION.RESEND_LICENSE,
                apiResponse: error,
            });
            console.log('Error in sending license challenge');
        })
    }
}

export const setEpiconDocubayAnalyticsData = (providerName, deviceId, data) => {
    return dispatch => {
        return PlayerServiceInstance.setEpiconDocubayAnalyticsData(providerName, deviceId, data).then(response =>{
            dispatch({
                type: ACTION.SET_EPCION_DOCUBAY_ANALYTICS_DATA,
                apiResponse: response,
            })
        }).catch(error => {
            dispatch({
                type: ACTION.SET_EPCION_DOCUBAY_ANALYTICS_DATA,
                apiResponse: error,
            });
            console.log('Error sending analytics data');
        })
    }
}

export const setLionsgateAnalyticsData = (data) => {
    return dispatch => {
        return PlayerServiceInstance.setLionsgateAnalyticsData(data).then(response =>{
            dispatch({
                type: ACTION.SET_LIONSGATE_ANALYTICS_DATA,
                apiResponse: response,
            })
        }).catch(error => {
            dispatch({
                type: ACTION.SET_LIONSGATE_ANALYTICS_DATA,
                apiResponse: error,
            });
            console.log('Error sending analytics data');
        })
    }
}

export const getSonyToken = () => {
    return dispatch => {
        return PlayerServiceInstance.getSonyToken().then(response =>{
            dispatch({
                type: ACTION.GET_SONY_TOKEN,
                apiResponse: response,
            })
        }).catch(error => {
            dispatch({
                type: ACTION.GET_SONY_TOKEN,
                apiResponse: error,
            });
            console.log('Error getting token');
        })
    }
}

export const getHoiChoiToken = () => {
    return dispatch => {
        return PlayerServiceInstance.getHoiChoiToken().then(response =>{
            dispatch({
                type: ACTION.GET_HOI_CHOI_TOKEN,
                apiResponse: response,
            })
        }).catch(error => {
            dispatch({
                type: ACTION.GET_HOI_CHOI_TOKEN,
                apiResponse: error,
            });
            console.log('Error getting token');
        })
    }
}

export const getVideoQualityOfPlayer = (quality) => {
    return dispatch => {
        dispatch({
            type: ACTION.GET_VIDEO_QUALITY,
            value: quality,
        })
    }
}
export const getGenericDrm = (payload) => {
    return dispatch => {
        return PlayerServiceInstance.getGenericDrm(payload).then(function (response) {
            dispatch({
                type: ACTION.GET_GENERIC_DRM,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_GENERIC_DRM_ERROR,
                apiResponse: error,
            });
            console.log("Error in fetching generic drm content :- " + error)
        });
    }
};
export const getDigitalFeedStream = (payload) => {
    return dispatch => {
        return PlayerServiceInstance.getDigitalFeed(payload).then(function (response) {
            dispatch({
                type: ACTION.GET_DIGITAL_FEED,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.GET_DIGITAL_FEED_ERROR,
                apiResponse: error,
            });
            console.log("Error in fetching detail feed :- " + error)
        });
    }
};