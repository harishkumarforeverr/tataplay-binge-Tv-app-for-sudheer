import WatchlistServiceInstance from "./service";
import { ACTION } from "./constants";
import { hideMainLoader, showMainLoader } from "@src/action";
import { filterPartnerContents, filterTVODContent, showWatchlistToast } from "@utils/common";
import { fetchTVODData } from "@containers/Home/APIs/actions";
import store from "@src/store";
import get from "lodash/get";
import {LOCALSTORAGE, SECTION_SOURCE} from "@constants";
import '../style.scss'
import React from 'react'
import { isEmpty } from "lodash";
import {setKey} from "@utils/storage";

export const fetchWatchlistItems = (showLoader = true, pagingState = false, removePagination = false) => {
    return (dispatch) => {
        showLoader && dispatch(showMainLoader());
        return WatchlistServiceInstance.fetchWatchlistItems(pagingState, removePagination, showLoader)
            .then(async (response) => {
                dispatch(hideMainLoader());

                await dispatch(fetchTVODData(0, 20));
                const { homeDetails } = store.getState();
                let tvodDetail = get(homeDetails, "tvodData");
                let list = get(response, "data.list", []);
                response.data.list = filterTVODContent(list, tvodDetail);
                response.data.sectionSource = SECTION_SOURCE.WATCHLIST;

                response.data.list = filterPartnerContents(
                    response.data.list,
                    response.data.sectionSource,
                );

                if(removePagination && !isEmpty(response.data.list)) {
                    const contentId = response?.data?.list.map((item) => item.contentId);
                    setKey(LOCALSTORAGE.WATCHLIST, JSON.stringify(contentId));
                }

                dispatch({
                    type: ACTION.FETCH_WATCHLIST_ITEMS,
                    apiResponse: response,
                });

                return response;
            })
            .catch((error) => {
                dispatch(hideMainLoader());

                dispatch({
                    type: ACTION.FETCH_WATCHLIST_ITEMS,
                    apiResponse: error,
                });
                console.log("Error while fetching watchlist items list:- " + error);
            });
    };
};

export const removeWatchlistItems = (showLoader = true, payload) => {
    return (dispatch) => {
        showLoader && dispatch(showMainLoader());
        return WatchlistServiceInstance.removeWatchlistItems(payload)

            .then(async (response) => {
                dispatch(hideMainLoader());
                //filter watchList Data
                let userData = payload.contentIdAndType;
                const { watchlist } = store.getState();
                const result = watchlist.watchlistItems.filter((ad) =>
                    userData.every((fd) => fd.contentId !== ad.contentId),
                );
                dispatch({
                    type: ACTION.UPDATE_WATCHLIST_DATA,
                    payload: result,
                });
                !isEmpty(response) && showWatchlistToast(response);
                return response;
            })
            .catch((error) => {
                dispatch(hideMainLoader());

                console.log("Error while fetching watchlist items list:- " + error);
            });
    };
};

export const clearWatchlistData = () => {
    return (dispatch) => dispatch({ type: ACTION.CLEAR_WATCHLIST_DATA });
};


