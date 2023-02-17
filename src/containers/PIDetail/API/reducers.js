import {ACTION} from "./constant";
import isEmpty from "lodash/isEmpty";

const initialState = {};
export default function homeReducer(state = {}, action) {
    switch (action.type) {
        case ACTION.FETCH_PI_DATA:
            return {...state, ...action.apiResponse, config: null};
        case ACTION.FETCH_LIVE_CONTENT_DATA:
            return { ...state, liveDetail: action.apiResponse };
        case ACTION.FETCH_LIVE_ERROR_DATA:
            return { ...state, liveDetailError: action.apiResponse };
        case ACTION.REFETCH_LIVE_CONTENT_DATA:
            return { ...state, updatedLiveDetail: action.apiResponse };
        case ACTION.REFETCH_LIVE_ERROR_DATA:
            return { ...state, updatedLiveDetailError: action.apiResponse };
        case ACTION.FETCH_PI_RECOMMENDED_DATA:
            return {
                ...state,
                recommended: action.apiResponse.data,
                contentList: !isEmpty(state.recommended) ?
                    [...state.contentList, ...action.apiResponse.data.contentList] : action.apiResponse.data.contentList,
                exactCount: !isEmpty(state.recommended) ?
                    state.exactCount + action.apiResponse.data.exactCount : action.apiResponse.data.exactCount,
            };
        case ACTION.FETCH_PI_ERROR_DATA:
            return {...state, config: action.apiResponse};
        case ACTION.GET_SHEMAROO:
            return {...state, shemarooContent: action.apiResponse};
        case ACTION.CLEAR_CONTENT:
            return {...initialState};
        case ACTION.TA_RECOMMENDATION_RAIL:
            return {...state, taRecommendation: action.apiResponse};
        case ACTION.FETCH_CONTINUE_WATCHING_DETAILS:
            return {...state, continueWatchingDetails: action.apiResponse};
        case ACTION.FETCH_TVOD_EXPIRY_DETAILS:
            return {...state, tvodExpiryDetails: action.apiResponse};
        case ACTION.FETCH_PLAYBACK_ELIGIBILITY:
            return {...state, eligibleForFreePlayback: action.apiResponse};
        case ACTION.TOGGLE_PI_DETAIL_MOBILE_POPUP:
            return {
                ...state, showPIDetailMobilePopup: action.value,
            }
        case ACTION.FETCH_REDEMPTION_URL: return {
            ...state,
            redmptionUrl: action.payload
            }
        case ACTION.LIVE_RAILID:
            return { ...state, liveRailId: action.value };
        default:
            return state;
    }
}
