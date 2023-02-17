import get from "lodash/get";

let search;
import {ACTION} from './constants';
import { DEFAULT_FILTER } from "@constants";
const initialState = {};
const resetStateData = {
    searchFilterLanguage: [DEFAULT_FILTER],
    searchFilterGenre: [DEFAULT_FILTER],
    isFilterExpanded: false,
    searchText: '',
};

export default search = (state = initialState, action) => {
    switch (action.type) {
        case ACTION.SEARCH_FILTER_LANGUAGE:
            return {...state, searchFilterLanguage: action.data};
        case ACTION.SEARCH_FILTER_GENRE:
            return {...state, searchFilterGenre: action.data};
        case ACTION.SEARCH_RESET:
            return {...initialState};
        case ACTION.SEARCH_DATA_RESET:
            return {...resetStateData};
        case ACTION.VOOT_CONTENT_PARAMS:
            return {...state, vootContentparams: action.data};
        default:
            return state;
    }
}
