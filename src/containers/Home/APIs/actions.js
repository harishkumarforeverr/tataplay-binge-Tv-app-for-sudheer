import {
    filterPartnerContents,
    filterRailContent,
    filterTVODContent,
    getHeroBannerInfo,
    getTALanguageGenreTitle,
    handlePubnubData,
    setTVODData,
    taDataFiltering,
    isUserloggedIn,
    showRail,
    getBrowseByData,
} from '@utils/common';
import { hideMainLoader, showMainLoader } from '@src/action';
import HomeService from './services';
import { ACTION, TVOD_MAX } from './constants'
import {
    CONFIG_TYPE,
    LAYOUT_TYPE,
    POSITION,
    RENTAL_STATUS,
    SECTION_SOURCE,
    SECTION_TYPE,
    TA_HERO_BANNER_MAX,
    TA_MAX_CONTENT,
} from "@constants";
import store from "@src/store";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import { fetchWatchlistItems, clearWatchlistData } from "@containers/Watchlist/API/action";

export const fetchHomeDataHeirarchy =  (homeData, showLoader = true) =>  {
    const {offset, pageType, isPartnerPage,provider,railResponse } = homeData;
      return async (dispatch) => {
        showLoader && dispatch(showMainLoader());
            offset === 0 && dispatch(resetHomeData());
            let response = railResponse
            let index = response.data.items.findIndex(element => element.sectionSource === SECTION_SOURCE.CONTINUE_WATCHING);
            response = await getContinueWatchingContent(index, response, dispatch);
            let watchListRailIndex = response.data.items.findIndex(element => element.sectionSource === SECTION_SOURCE.WATCHLIST);
            response = await getWatchListedContent(watchListRailIndex, response, dispatch);
            if (isUserloggedIn() && !isPartnerPage) {
                response = await getTVODRailData(response, index, dispatch);
            }
            await getTAHeroBannerData(response, pageType, dispatch);
            await getTARailData(response, isPartnerPage, provider);
            await getBrowseByData(response);
            filterRailContent(response);
            let resultResponse = [];
            let { homeDetails } = store.getState();
            response.data.items.map(railItem => {
                let itemAlreadyExist = get(homeDetails, 'homeScreenFilteredDataItems').some(rail => parseInt(rail?.id) === parseInt(railItem?.id));
                if (showRail(railItem) && !itemAlreadyExist) {
                    resultResponse.push(railItem);
                }
            });
            response.data.updatedItems = resultResponse;

            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_HOME_SCREEN__DATA,
                apiResponse: response,
            });
            return response;
    }
};
export const fetchHomeData = ({
    apiUrl,
    limit,
    offset,
    pageType,
    isPartnerPage,
    providerId,
    provider,
    anonymousId,
}, showLoader = true) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return HomeService.fetchHomeData(apiUrl, limit, offset, isPartnerPage, providerId, anonymousId).then(async function (response) {
            response = JSON.parse(JSON.stringify(response));
            offset === 0 && dispatch(resetHomeData());
            let index = response.data.items.findIndex(element => element.sectionSource === SECTION_SOURCE.CONTINUE_WATCHING);
            response = await getContinueWatchingContent(index, response, dispatch);
            let watchListRailIndex = response.data.items.findIndex(element => element.sectionSource === SECTION_SOURCE.WATCHLIST);
            response = await getWatchListedContent(watchListRailIndex, response, dispatch);
            if (isUserloggedIn() && !isPartnerPage) {
                response = await getTVODRailData(response, index, dispatch);
            }
            await getTAHeroBannerData(response, pageType, dispatch);
            await getTARailData(response, isPartnerPage, provider);
            await getBrowseByData(response);
            filterRailContent(response);
            let resultResponse = [];
            let { homeDetails } = store.getState();
            response.data.items.map(railItem => {
                let itemAlreadyExist = get(homeDetails, 'homeScreenFilteredDataItems').some(rail => parseInt(rail?.id) === parseInt(railItem?.id));
                if (showRail(railItem) && !itemAlreadyExist) {
                    resultResponse.push(railItem);
                }
            });
            response.data.updatedItems = resultResponse;

            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_HOME_SCREEN__DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_HOME_SCREEN__DATA,
                apiResponse: error,
            });
            console.log("Error while fetching home screen details :- " + error);
        });
    }
};


export const getWatchListedContent = (index, response) => {
    if (index < 0 || !isUserloggedIn()) {
        return response;
    }
    store.dispatch(clearWatchlistData());
    return store.dispatch(fetchWatchlistItems()).then((res) => {
        response.data.items[index].contentList = res.data ? res.data.list : [];
        return response
    }).catch(e => {
        console.log("Error while fetching watchlisted items :- " + e);
        response.data.items[index].contentList = [];
        return response;
    })
};

export const getContinueWatchingContent = (index, response) => {
    if (index < 0) {
        return response;
    }
    return HomeService.fetchContinueWatchingContent(0, false).then((res) => {
        response.data.items[index].contentList = res.data ? res.data.contentList : [];
        return response
    }).catch(e => {
        console.log("Error while fetching continue watching details :- " + e);
        response.data.items[index].contentList = [];
        return response;
    })
};

export const getTVODContent = (index, response) => {
    if (index < 0) {
        return response;
    }
    let offset = 0;
    return HomeService.fetchTVODContent(offset, TVOD_MAX).then((res) => {
        let result = [];
        if (res.data && res.data.items) {
            result = res.data.items.filter(item => item.rentalStatus === RENTAL_STATUS.ACTIVE);
            res.data.items.map(item => setTVODData(item));
        }
        res.data.items = result;
        store.dispatch({
            type: ACTION.TVOD_DATA,
            apiResponse: res,
        });

        response.data.items[index].contentList = result;
        return response;
    }).catch(e => {
        console.log("Error while fetching tvod details :- " + e);
        response.data.items[index].contentList = [];
        return response;
    })
}


export const fetchContinueWatchingData = (offset = 0, seeAll, pagingState, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return HomeService.fetchContinueWatchingContent(offset, seeAll, pagingState).then(async function (response) {
            showLoader && dispatch(hideMainLoader());

            const { homeDetails } = store.getState();
            let tvodDetail = get(homeDetails, 'tvodData', {});
            if (Object.keys(tvodDetail).length === 0) {
                await dispatch(fetchTVODData(0, 20));
            }
            let list = get(response, 'data.contentList', []);
            response.data.contentList = filterTVODContent(list, tvodDetail);
            response.data.contentList = filterPartnerContents(response.data.contentList, response.data.sectionSource);
            response.data.updatedCount = response.data.contentList.length;
            // Note:- from BE in this APi we get max 20 values in 1 call,
            dispatch({
                type: ACTION.CONTINUE_WATCHING,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.CONTINUE_WATCHING,
                apiResponse: error,
            });
            console.log("Error while fetching continue watching details :- " + error);
        });
    }
};

export const resetHomeData = () => {
    return dispatch => dispatch({ type: ACTION.RESET_HOME_DATA });
};

export const fetchTVODData = (offset, max, seeAll = false) => {
    return dispatch => {
        dispatch(showMainLoader());
        return HomeService.fetchTVODContent(offset, max, seeAll).then(async function (response) {
            dispatch(hideMainLoader());
            response.data.items = response.data ? response.data.items && response.data.items.filter(item => {
                setTVODData(item);
                return item.rentalStatus === RENTAL_STATUS.ACTIVE
            }) : []
            dispatch({
                type: ACTION.TVOD_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch(hideMainLoader());
            dispatch({
                type: ACTION.TVOD_DATA,
                apiResponse: error,
            });
            console.log("Error while fetching tvod details :- " + error)
        });
    }
};

export const getTAHeroBanner = (max, layout, data) => {
    return dispatch => {
        return HomeService.fetchTAHeroBanner(max, layout, data).then(async function (response) {

            let contentList = get(response, 'data.contentList');
            response.data.contentList = contentList.slice(0, data.count);
            response.data.taHeroBannerData = data;

            response.data.contentList = filterPartnerContents(response.data.contentList, response.data.sectionSource);

            response.data.contentList = taDataFiltering(response.data.contentList);

            dispatch({
                type: ACTION.TA_HERO_BANNER,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.TA_HERO_BANNER,
                apiResponse: error,
            });
            console.log("Error while fetching ta hero banner data :- " + error)
        });
    }
}

export const getTVODRailData = async (response, index, dispatch) => {
    let tvodIndex = response.data.items.findIndex(element => element.sectionSource === SECTION_SOURCE.TVOD);

    if (tvodIndex >= 0) {
        response = await getTVODContent(tvodIndex, response, dispatch);
    }

    if (index >= 0) {
        const { homeDetails } = store.getState();
        let tvodDetail = get(homeDetails, 'tvodData', {});
        if (Object.keys(tvodDetail).length === 0) {
            await dispatch(fetchTVODData(0, 20));
            const { homeDetails } = store.getState();
            tvodDetail = get(homeDetails, 'tvodData', {});
        }

        let cwList = response?.data?.items[index]?.contentList;
        response.data.items[index].contentList = filterTVODContent(cwList, tvodDetail);
    }

    return response;
};

export const getTARailData = (response, isPartnerPage, provider) => {
    let promise = [], taPlaceholderList = [];
    response.data.items.forEach((item, index) => {
        if (item.sectionSource === SECTION_SOURCE.RECOMMENDATION) {
            item.configType = CONFIG_TYPE.RECOMMENDATION;
            item.mixedRail = [POSITION.PREPEND, POSITION.APPEND].includes(item.recommendationPosition.toUpperCase());
            taPlaceholderList.push({
                placeHolder: item.placeHolder,
                layoutType: item.layoutType,
                index: index,
                mixedRail: item.mixedRail,
            });
            promise.push(HomeService.fetchTARailData(TA_MAX_CONTENT.TA_MAX_RECOMMEND, item.layoutType, item.placeHolder, false, isPartnerPage, provider));
        }
    });

    return Promise.all(promise).then((value) => {
        if (taPlaceholderList.length > 0) {
            taPlaceholderList.forEach((item, index) => {
                if (value[index] && value[index].data && value[index].data.contentList && value[index].data.contentList.length > 0) {
                    //Filter partner contents from TA Rail
                    value[index].data.contentList = filterPartnerContents(value[index].data.contentList, value[index].data.sectionSource);
                    //Ta specific data filtering
                    value[index].data.contentList = taDataFiltering(value[index].data.contentList);

                    //Mixed Rail
                    if (response.data.items[item.index].contentList.length !== 0) {
                        response.data.items[item.index].mixedRail = true;
                        response.data.items[item.index].paintMixedRail = true;
                        if (response.data.items[item.index].recommendationPosition === POSITION.APPEND) {
                            response.data.items[item.index].contentList = [...value[index].data.contentList, ...response.data.items[item.index].contentList] || [];
                        } else if (response.data.items[item.index].recommendationPosition === POSITION.PREPEND) {
                            response.data.items[item.index].contentList = [...response.data.items[item.index].contentList, ...value[index].data.contentList] || [];
                        }
                    } else {
                        response.data.items[item.index].mixedRail = false;
                        response.data.items[item.index].contentList = [...value[index].data.contentList] || [];
                    }

                    //Append genre and language title in rail name
                    if (value[index].data.hasOwnProperty('genreType') || value[index].data.hasOwnProperty('languageType')) {
                        let title = response.data.items[item.index].title;
                        let result = value[index].data;
                        response.data.items[item.index].title = getTALanguageGenreTitle(title, result.genreType, result.languageType);
                    }
                } else {
                    if (item.mixedRail) {
                        response.data.items[item.index].paintMixedRail = false;
                    }
                }
            });
        }
    }).catch(() => {
        if (taPlaceholderList.length > 0) {
            taPlaceholderList.forEach((item) => {
                response.data.items[item.index].contentList = [];
            });
        }
    });
    // }
};

export const fetchTARailData = (data) => {
    return dispatch => {
        return HomeService.fetchTARailData(data.max, data.layout, data.placeHolder, data.seeAll = false, data.isPartnerPage, data.provider).then(async function (response) {
            let contentList = get(response, 'data.contentList', []);
            if (contentList) {
                response.data = {
                    ...response.data,
                    id: data.id,
                    sectionSource: SECTION_SOURCE.RECOMMENDATION,
                    configType: CONFIG_TYPE.RECOMMENDATION,
                    layoutType: data.layout ? data.layout : LAYOUT_TYPE.LANDSCAPE,
                    title: data.railTitle,
                }
            }
            response.data.contentList = filterPartnerContents(response.data.contentList, response.data.sectionSource);

            response.data.contentList = taDataFiltering(response.data.contentList);

            if (data.mixedRail) {
                const { seeAll } = store.getState();
                let seeAllContentList = seeAll?.contentList;

                if (data.recommendationPosition === POSITION.APPEND) {
                    response.data.contentList = [...response.data.contentList, ...seeAllContentList];
                } else if (data.recommendationPosition === POSITION.PREPEND) {
                    response.data.contentList = [...seeAllContentList, ...response.data.contentList];
                }

            }

            dispatch({
                type: ACTION.TA_RAIL_DATA,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            dispatch({
                type: ACTION.TA_RAIL_DATA,
                apiResponse: error,
            });
            console.log("Error while fetching ta rail data :- " + error)
        });
    }
};

export const getTAHeroBannerData = async (response, pageType, dispatch) => {
    let heroBannerItems = response.data.items.filter(item => item.sectionType === SECTION_TYPE.HERO_BANNER);
    if (!isEmpty(heroBannerItems)) {
        let data = getHeroBannerInfo(pageType);
        let layout = LAYOUT_TYPE.LANDSCAPE;
        data && await dispatch(getTAHeroBanner(TA_HERO_BANNER_MAX, layout, data));

        const { homeDetails } = store.getState();
        let taHeroBanner = homeDetails && homeDetails.taHeroBanner;
        let taHeroBannerData = get(taHeroBanner, 'taHeroBannerData', {});
        let taHeroBannerContentList = get(taHeroBanner, 'contentList', []);
        let updatedList = data && taHeroBannerContentList.splice(0, data.count ? data.count : 0);

        let result = heroBannerItems && heroBannerItems[0] && heroBannerItems[0].contentList;
        let updatedData = result && result.map(i => ({ ...i, sectionSource: heroBannerItems[0].sectionSource }));
        let updatedTAData = updatedList && updatedList.map(i => ({ ...i, sectionSource: SECTION_SOURCE.RECOMMENDATION }));

        if (taHeroBannerData && taHeroBannerData.position === POSITION.APPEND) {
            updatedData = [...updatedData, ...updatedTAData];
        } else if (taHeroBannerData && taHeroBannerData.position === POSITION.PREPEND) {
            updatedData = [...updatedTAData, ...updatedData]
        }
        heroBannerItems[0].contentList = updatedData;
    }
};

export const fetchPubnubHistory = (showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return HomeService.fetchPubnubHistory().then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_PUBNUB_HISTORY,
                apiResponse: response,
            });
            let res = response && response[0];
            res && res[0] && handlePubnubData(res[0], 'from history');
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.FETCH_PUBNUB_HISTORY,
                apiResponse: error,
            });
            console.log("Error while fetching pubnub history :- " + error)
        });
    }
};

export const saveParentalLockPin = (data, showLoader = false) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());
        return HomeService.saveParentalLockPin(data).then(function (response) {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.SAVE_PARENTAL_LOCK,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            showLoader && dispatch(hideMainLoader());
            dispatch({
                type: ACTION.SAVE_PARENTAL_LOCK,
                apiResponse: error,
            });
            console.log("Error while saving parental lock :- " + error)
        });
    }
};