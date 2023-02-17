import get from 'lodash/get';
import { ACTION, BROWSE_TYPE } from './constants';
import { filterPartnerContents } from "@utils/common";
import isEmpty from "lodash/isEmpty";

let initialState = {
    browsingFilters: [],
    browseByData: [],
    browseByDataItems: [],
    trendingDataItems: [],
    itemsReceivedTillNow: 0,
    searchLandingInfo: {},
    trendingData: {},
    totalSearchCount: 0,
    searchAutoSuggestedData: [],
};

export default function browseByReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.FETCH_BROWSING_FILTERS:
            return { ...state, browsingFilters: get(action, 'apiResponse.data.items[0].contentList', []) };
        case ACTION.FETCH_BROWSE_BY_DATA:
            return {
                ...state,
                browseByData: get(action, 'apiResponse.data', {}),
                browseByDataItems: [...get(state, 'browseByDataItems', []), ...get(action, 'apiResponse.data.contentList', [])],
                itemsReceivedTillNow: state.itemsReceivedTillNow + action.count,
                totalSearchCount: get(action, 'apiResponse.data.totalSearchCount', state.totalSearchCount),
            }
        case ACTION.FETCH_TRENDING_DATA:
            return {
                ...state,
                trendingData: get(action, 'apiResponse.data', {}),
                trendingDataItems: [...get(state, 'trendingDataItems', []), ...get(action, 'apiResponse.data.contentList', [])],
            }
        case ACTION.FETCH_SEARCH_LANDING_DATA:
            const response = action.apiResponse.data;
            return { ...state, searchLandingInfo: response };
        case ACTION.RESET_STATE:
            return initialState;
        case ACTION.RESET_BROWSE_DATA:
            return { ...state, browseByData: {}, browseByDataItems: [], itemsReceivedTillNow: 0 }
        case ACTION.FETCH_TA_RECOMMENDED_GENRE_ORDER:
            return { ...state, taRecommendedGenreOrder: get(action, 'apiResponse.data', {}) }
        case ACTION.FETCH_TA_RECOMMENDED_LANG_ORDER:
            return { ...state, taRecommendedLangOrder: get(action, 'apiResponse.data', {}) }
        case ACTION.FETCH_TA_RECOMMENDED_SEARCH_DATA:
            return { ...state, taRecommendedSearchData: get(action, 'apiResponse.data', {}) }
        case ACTION.FETCH_TA_RECOMMENDED_SEARCH_GENRE:
            return { ...state, taRecommendedSearchGenre: get(action, 'apiResponse.data', {}) }
        case ACTION.FETCH_TA_RECOMMENDED_SEARCH_LANG:
            return { ...state, taRecommendedSearchLang: get(action, 'apiResponse.data', {}) }
        case ACTION.IS_FETCHING_BROWSE_BY_DATA:
            return { ...state, isFetchingBrowseByData: get(action, 'value') };
        case ACTION.IS_FETCHING_SEARCH_AUTOSUGGESTED_DATA:
            return { ...state, isFetchingSearchAutosuggestData: get(action, 'value') }
        case ACTION.FETCH_SEARCH_AUTOSUGGESTED_DATA:
            return {
                ...state,
                searchAutoSuggestedData: action.payload,
            }
        default:
            return state;
    }
}
