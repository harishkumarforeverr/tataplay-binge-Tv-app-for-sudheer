import {doRequest} from "@src/services/api";
import {ACTION} from './constants';
import {serviceConstants} from "@utils/apiService";
import BrowseByServiceInstance from "../../../containers/BrowseByDetail/APIs/service";

export const fetchSearchPIData = (data, loadMorePagination) => {
    return dispatch => {
        return BrowseByServiceInstance.fetchSearchPIData(data).then(function (response) {
            dispatch({
                type: loadMorePagination ? ACTION.SEARCH_EPISODE_PI_PAGINATION: ACTION.SEARCH_EPISODE_PI,
                apiResponse: response,
                count: response.data.itemCount,
            });
            return response;
        }).catch((error) => {
            console.log("Error while fetching browse by data:- " + error)
        });
    }
};

export const fetchSeasonData = (id, limit = 10, offset, loadMorePagination = false) => {
    return dispatch => {
        return doRequest(serviceConstants.fetchSeasonData(id, limit, offset)).then(function (res) {
            dispatch({
                type: loadMorePagination ? ACTION.FETCH_SEASON_DATA_PAGINATION: ACTION.FETCH_SEASON_DATA,
                apiResponse: {...res, payload: id},
            });
        })
    }
}

export const fetchEpisodeDetails = (id, limit = 5, offset) => {
    return dispatch => {
        return doRequest(serviceConstants.fetchEpisodeDetails(id, limit, offset)).then(function (res) {
            dispatch({
                type: ACTION.FETCH_EPISODE_DETAILS,
                apiResponse: {...res, payload: id},
            });
        })
    }
}

export const resetSeasonData = () => ({
    type: ACTION.RESET_SEASON_DATA,
});
