import { hideMainLoader, showMainLoader } from "@src/action";
import BrowseByService from "./service";
import { ACTION, BROWSE_TYPE } from "./constants";
import { filterPartnerContents, getBrowseByData, getBrowseByTAOrderedData, appendTASearchContent, taDataFiltering } from "@utils/common";
import store from "@src/store";
import isEmpty from 'lodash/isEmpty';
import { get } from "lodash";
import { openPopup } from "@common/Modal/action";
import { MODALS } from "@common/Modal/constants";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE } from "@utils/constants";

export const fetchBrowsingFilters = (browseByType) => {
    return dispatch => {
        dispatch(showMainLoader());
        return BrowseByService.fetchBrowsingFilters(browseByType).then(async (response) => {
            dispatch(hideMainLoader());
            // getBrowseByTAOrderedData : called to handle sequencing of filter recommended by TA on genre and lang screens
            await getBrowseByTAOrderedData(0, response, browseByType);
            response.data?.items[0].contentList.unshift({
                appImageBM: "",
                blackOut: false,
                image: "https://res.cloudinary.com/uat-main/image/upload/v1637655116/tatasky-uat/cms-ui/images/custom-content/1637655114387.png",
                title: 'All',
                id: 0,
            })
            dispatch({
                type: ACTION.FETCH_BROWSING_FILTERS,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            console.log("Error while fetching browse by data filters:- " + error)
        });
    }
};
export const fetchSearchData = (data, isFromSearchPage = false) => {
    return (dispatch, getState) => {
        dispatch(showMainLoader());
        dispatch(isFetchingBrowseByData(true));
        const { taRecommendedLangOrder, taRecommendedGenreOrder } = getState()?.browseBy || {};
        const requestData = {
            ...data,
            preferLang: taRecommendedLangOrder?.contentList || [],
            preferGenre: taRecommendedGenreOrder?.contentList || []
        }
        return BrowseByService.fetchSearchData(requestData).then(async (response) => {
            dispatch(hideMainLoader());
            if (response?.statusCode !== 200) {
                store.dispatch(openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal error-state-modal',
                    headingMessage: `Something Went Wrong`,
                    instructions: response?.message ? response?.message : 'The operation couldn’t be completed.',
                    primaryButtonText: 'Ok',
                    errorIcon: 'icon-alert-upd',
                    closeModal: true,
                    hideCloseIcon: true,
                    errorCodeInstruction: `Error code : ${get(response, 'statusCode')}`,
                }));
            }
            if ((!isEmpty(get(data, 'filterGenre')) || !isEmpty(get(data, 'filterLanguage'))) && !isFromSearchPage) {
                response.data.contentList = await appendTASearchContent(response?.data?.contentList, data);
            }
            response.data.contentList = filterPartnerContents(response.data.contentList, response.data.sectionSource);
            dispatch({
                type: ACTION.FETCH_BROWSE_BY_DATA,
                apiResponse: response,
                count: response.data.itemCount,
            });
            dispatch(isFetchingBrowseByData(false));
            return response;
        }).catch((error) => {
            console.log("Error while fetching search data:- " + error)
            dispatch(hideMainLoader());
            dispatch(isFetchingBrowseByData(false));
        });
    }
};

export const fetchSearchAutosuggestedData = (data, isFromSearchPage = false) => {
    return (dispatch, getState) => {
        dispatch(showMainLoader());
        dispatch(isFetchingBrowseByData(true));
        const { taRecommendedLangOrder, taRecommendedGenreOrder } = getState()?.browseBy || {};
        const requestData = {
            val: data,
            preferLang: taRecommendedLangOrder?.contentList || [],
            preferGenre: taRecommendedGenreOrder?.contentList || []
        }
        return BrowseByService.fetchSearchAutosuggestedData(requestData).then(async (response) => {
            dispatch(hideMainLoader());
            if (response?.statusCode !== 200) {
                dispatch({
                    type: ACTION.FETCH_SEARCH_AUTOSUGGESTED_DATA,
                    payload: [],
                })
            } else {
                dispatch({
                    type: ACTION.FETCH_SEARCH_AUTOSUGGESTED_DATA,
                    payload: response?.data?.contentList,
                })
            }
        }).catch((error) => {
            console.log("Error while fetching search auto suggested data: " + error);
            dispatch(hideMainLoader());
        });
    }
}

export const fetchTrendingData = (data) => {
    return dispatch => {
        dispatch(showMainLoader())
        const preferLang = JSON.parse(getKey(LOCALSTORAGE.PREFERRED_LANGUAGES))?.map(preferLang => preferLang.name);
        const requestData = {
            ...data,
            preferLang: preferLang || [],
        }
        return BrowseByService.fetchTrendingData(requestData).then(function (response) {
            dispatch(hideMainLoader());
            response.data.contentList = filterPartnerContents(response.data.contentList, response.data.sectionSource);
            dispatch({
                type: ACTION.FETCH_TRENDING_DATA,
                apiResponse: response,
                count: response.data.itemCount,
            });
            return response;
        }).catch((error) => {
            console.log("Error while fetching search data:- " + error)
            dispatch(hideMainLoader());
        });
    }
}

export const fetchSearchLandingData = (data = "All") => {
    return dispatch => {
        dispatch(showMainLoader());
        return BrowseByService.fetchSearchLandingData(data).then(async (response) => {
            // getBrowseByData : called to handle sequencing of filter recommended by TA on search screens
            await getBrowseByData(response)
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_SEARCH_LANDING_DATA,
                apiResponse: response,
                count: response.data.itemCount,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            console.log("Error while fetching browse by data:- " + error)
        });
    }
};

export const resetBrowseByState = () => {
    return dispatch => dispatch({ type: ACTION.RESET_STATE });
};

export const resetBrowseDataState = () => {
    return dispatch => dispatch({ type: ACTION.RESET_BROWSE_DATA });
};

/**
 *
 * @param payload
 * @returns {Promise<unknown>}
 */

export const fetchTARecommendedFilterOrder = (payload) => {
    store.dispatch(showMainLoader())
    return BrowseByService.fetchTARecommendedFilterOrder(payload).then((response) => {
        store.dispatch(hideMainLoader());
        store.dispatch({
            type: payload?.browseByType === BROWSE_TYPE.GENRE ? ACTION.FETCH_TA_RECOMMENDED_GENRE_ORDER : ACTION.FETCH_TA_RECOMMENDED_LANG_ORDER,
            apiResponse: response,
        });
        return response;
    }).catch((error) => {
        console.log("Error while fetching ta recommended lang order:- " + error)
        store.dispatch(hideMainLoader());
    });
}

/**
 * @function fetchTARecommendedSearchData - to get TA Recommended data for genre ,lang and search screens.
 */
export const fetchTARecommendedSearchData = (payload) => {
    store.dispatch(showMainLoader())
    return BrowseByService.fetchTARecommendedSearchData(payload).then((response) => {
        store.dispatch(hideMainLoader());
        let onlyBrowseByGenreData = !isEmpty(payload?.genreFilter) && isEmpty(payload?.langFilters);
        let onlyBrowseByLangData = isEmpty(payload?.genreFilter) && !isEmpty(payload?.langFilters);
        response.data.contentList = taDataFiltering(response.data.contentList);
        store.dispatch({
            type: onlyBrowseByGenreData
                ? ACTION.FETCH_TA_RECOMMENDED_SEARCH_GENRE
                : onlyBrowseByLangData
                    ? ACTION.FETCH_TA_RECOMMENDED_SEARCH_LANG
                    : ACTION.FETCH_TA_RECOMMENDED_SEARCH_DATA,
            apiResponse: response,
        });
        return response;
    }).catch((error) => {
        console.log("Error while fetching ta recommended list:- " + error)
        store.dispatch(hideMainLoader());
    });
}

export const isFetchingBrowseByData = (value) => {
    return dispatch => dispatch({ type: ACTION.IS_FETCHING_BROWSE_BY_DATA, value });
};

export const isFetchingSearchAutosuggestionData = (value) => {
    return dispatch => dispatch({ type: ACTION.IS_FETCHING_SEARCH_AUTOSUGGESTED_DATA, value });
}
