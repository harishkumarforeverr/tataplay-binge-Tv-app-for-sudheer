import get from "lodash/get";
import {ACTION} from './constants';

const initialState = {
    watchlistItems: [],
    loading: true,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION.FETCH_WATCHLIST_ITEMS:
            return {
                ...state,
                watchListData: get(action, "apiResponse.data", {}),
                watchlistItems: [
                    ...state.watchlistItems,
                    ...get(action, "apiResponse.data.list", []),
                ],
                loading: false,
            };

        case ACTION.CLEAR_WATCHLIST_DATA:
            return {...initialState};

        case ACTION.UPDATE_WATCHLIST_DATA:
            return {
                ...state,
                watchlistItems: action.payload,
            };
        default:
            return state;
    }
};
