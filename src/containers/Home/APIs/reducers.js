import { ACTION } from './constants';
import get from 'lodash/get';
import isEmpty from "lodash/isEmpty";

let initialState = {
    homeScreenData: {},
    homeScreenDataItems: [],
    homeScreenFilteredDataItems: [],
    tvodData: {},
    taHeroBanner: {},
    continueWatchingData: {},
    contentList: [],
    homeScreenHeirarchyData:{},
};

export default function homeReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.FETCH_HOME_DATA_HEIRARCHY:
            return{
                ...state,
                homeScreenHeirarchyData:get(action, 'apiResponse.data', {})

            }
        case ACTION.FETCH_HOME_SCREEN__DATA:
            return {
                ...state,
                homeScreenData: get(action, 'apiResponse', {}),
                homeScreenDataItems: [...get(state, 'homeScreenDataItems', []), ...get(action, 'apiResponse.data.items', [])],
                homeScreenFilteredDataItems: [...get(state, 'homeScreenFilteredDataItems', []), ...get(action, 'apiResponse.data.updatedItems', [])],
            };
       
        case ACTION.RESET_HOME_DATA:
            return initialState;

        case ACTION.CONTINUE_WATCHING:
            return {
                ...state,
                continueWatchingData: get(action, 'apiResponse.data', {}),
                contentList: !isEmpty(state.continueWatchingData) ? [...state.continueWatchingData.contentList,
                ...action.apiResponse.data.contentList] : action.apiResponse.data.contentList,
            }
        case ACTION.TVOD_DATA:
            return {
                ...state,
                tvodData: get(action, 'apiResponse.data', {}),
            }
        case ACTION.DUNNING_RECHARGE:
            return {
                ...state,
                dunningRecharge: get(action, 'apiResponse', {}),
            }

        case ACTION.TA_HERO_BANNER:
            return {
                ...state,
                taHeroBanner: get(action, 'apiResponse.data', {}),
            }

        case ACTION.TA_RAIL_DATA:
            return {
                ...state,
                taRailData: get(action, 'apiResponse.data', {}),
            }

        case ACTION.SAVE_PARENTAL_LOCK:
            return {
                ...state,
                savedParentalLock: get(action, 'apiResponse', {}),
            }
        case ACTION.FETCH_RAIL_CONTENT:
            return {
                ...state,
                railContent: get(action, 'apiResponse', {}),
            }
        default:
            return state;
    }
}
