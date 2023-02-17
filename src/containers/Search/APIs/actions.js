import {BROWSE_TYPE} from "@containers/BrowseByDetail/APIs/constants";
import {ACTION} from './constants';
import SearchServiceInstance from "@containers/Search/APIs/service";

export const searchFilterList = (browseBy) => {
    return dispatch => {
        return SearchServiceInstance.getSearchFilterList(browseBy).then((res) => {
            browseBy === (BROWSE_TYPE.LANGUAGE).toLowerCase() ?
                dispatch({type: ACTION.SEARCH_FILTER_LANGUAGE, data: res}) :
                dispatch({type: ACTION.SEARCH_FILTER_GENRE, data: res})
        }).catch((error) => {
            console.log("error ::", error)
        })
    }
}

export const vootTokenapi = (data) => {
        return dispatch => {
            return SearchServiceInstance.getVootokenapi(data).then(function (response) {
                dispatch({type: ACTION.VOOT_CONTENT_PARAMS, data: response})
                return response;
            }).catch((error) => {
                console.log("error ::", error);
            });
        }
}

export const resetSearchState = () => {
    return ({type: ACTION.SEARCH_RESET})
}

export const updateSearchData = () => {
    return ({type: ACTION.SEARCH_DATA_RESET})
}

