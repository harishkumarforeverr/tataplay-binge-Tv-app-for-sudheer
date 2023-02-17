import {ACTION} from "./constant";
import isEmpty from "lodash/isEmpty";

export default function seeAll(state = {}, action) {
    switch (action.type) {
        case ACTION.SEE_ALL_CONTENT:
            return {
                ...state,
                seeAllResult: action.apiResponse.data,
                contentList: !isEmpty(state.seeAllResult) ? [...state.contentList, ...action.apiResponse.data.contentList] : action.apiResponse.data.contentList,
                exactCount: !isEmpty(state.seeAllResult) ?
                    state.exactCount + action.apiResponse.data.exactCount : action.apiResponse.data.exactCount,
                updatedCount: !isEmpty(state.seeAllResult) ?
                    state.updatedCount + action.apiResponse.data.updatedCount : action.apiResponse.data.updatedCount,
            };
        case ACTION.CLEAR_CONTENT:
            return {};
        default:
            return state;
    }
}

