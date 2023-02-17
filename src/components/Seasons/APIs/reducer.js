import {ACTION} from './constants'
import get from "lodash/get";

let initialState = {};
export default function seasonReducer(state = {}, action) {
    switch (action.type) {
        case ACTION.SEARCH_EPISODE_PI:
            return {...state, items: action.apiResponse?.data?.contentList, total: action.apiResponse?.data?.maxCount};
        case ACTION.SEARCH_EPISODE_PI_PAGINATION:
            return {...state, ...action.apiResponse.data, items: [...state.items, ...action.apiResponse?.data?.contentList], total: action.apiResponse?.data?.maxCount};
        case ACTION.FETCH_SEASON_DATA:
           return {...state, ...action.apiResponse.data};
        case ACTION.FETCH_SEASON_DATA_PAGINATION: 
            return {...state, ...action.apiResponse.data, items: [...state.items, ...action.apiResponse?.data?.items]};
        case ACTION.FETCH_EPISODE_DETAILS:
            return {...state, episodeDetails: get(action, 'apiResponse')};
        case ACTION.RESET_SEASON_DATA:
            return {initialState};
        default:
            return state;
    }
}
