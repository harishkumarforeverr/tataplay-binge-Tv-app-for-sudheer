import { hideMainLoader, showMainLoader } from "@src/action";
import HomeService from "./services";
import { ACTION, DRP_STATE } from "./constants";
import { fetchHomeDataHeirarchy } from "./actions";
import store from "@src/store";
import { getCacheData,clearCacheData } from "@src/services/api";
import URL from "@environment/index";
import { isEmpty } from "lodash";
import { SECTION_SOURCE } from "@constants";

export const fetchHomeDataHeirarachy = (homeData) => {
    return (dispatch) => {
        return HomeService.fetchHomeDataHeirarachy(homeData)
            .then(async function (response) {
                response = JSON.parse(JSON.stringify(response)); // heirarchy api response
                let isFallback = await getCacheData(response?.config?.id);
                 if ((isFallback?.state === "stale"  || (isFallback?.state !== "stale" && isEmpty(response.data))) && (homeData.drpState === DRP_STATE.TA || homeData.drpState === DRP_STATE.TA_GUEST)) {
                    //starts an if statement to evaluate if there's a empty TA response or TA api's fail
                    let updatedHomeData = {
                        ...homeData,
                        drpState: DRP_STATE.VR,
                        apiUrl: `${URL.HOME_MENU_URL_VR}${homeData.pageType}`,
                    };    
                    await HomeService.fetchHomeDataHeirarachy(updatedHomeData).then( // calling VR fallback
                        async function (res) {
                            res = JSON.parse(JSON.stringify(res)); 
                            let data;
                            /** 
                              * @res VR api response 
                              * @extractCommonData will get common data of TA cache data and VR response 
                              * 
                             */
                            isEmpty(response.data) ? data = res : data = extractCommonData(res, isFallback?.data?.data?.data);
                            isEmpty(response.data) && await clearCacheData(response?.config?.id)
                            await getRailContent(data, updatedHomeData);
                            dispatch({
                                type: ACTION.FETCH_HOME_DATA_HEIRARCHY,
                                apiResponse: data,
                            });
                        }
                    );
                } else {
                    await getRailContent(response, homeData);
                    dispatch({
                        type: ACTION.FETCH_HOME_DATA_HEIRARCHY,
                        apiResponse: response,
                    });
                }

            })
            .catch(async (error) => {
                // calling VR fallback
                (homeData?.drpState == DRP_STATE.TA || homeData?.drpState == DRP_STATE.TA_GUEST) &&
                    await dispatch(
                        fetchHomeDataHeirarachy({
                            ...homeData,
                            drpState: DRP_STATE.VR,
                            apiUrl: `${URL.HOME_MENU_URL_VR}${homeData.pageType}`,
                        })
                    );
                console.log("Error getting response");
            });
    };
};
export const fetchRailContent = (id) => {
    return (dispatch) => {
        return HomeService.fetchRailContent(id)
            .then((response) => {
                response = JSON.parse(JSON.stringify(response)); //response of rail content
                dispatch({
                    type: ACTION.FETCH_RAIL_CONTENT,
                    apiResponse: response,
                });
            })
            .catch((error) => {
                dispatch({
                    type: ACTION.FETCH_RAIL_CONTENT,
                    apiResponse: error,
                });
                console.log("Error getting response");
            });
    };
};

export const getRailContent = async (response, homeData, more = false) => {
    let promise = [];
    let offset = homeData.offset;
    let limit = more ? homeData.limit + homeData.offset : homeData.limit;
    let filterTenResponse = more
        ? response.slice(offset, limit)
        : response.data.slice(offset, limit); // pagination logic implementation

    filterTenResponse.forEach((item) => {
        let isActiveItemProviderRail = (item.sectionSource === SECTION_SOURCE.GENRE) || (item.sectionSource === SECTION_SOURCE.PROVIDER) || (item.sectionSource === SECTION_SOURCE.LANGUAGE) || (item.sectionSource === SECTION_SOURCE.BINGE_CHANNEL) || (item.sectionSource === SECTION_SOURCE.BINGE_DARSHAN_CHANNEL);
        promise.push(HomeService.fetchRailContent(item.railId, isActiveItemProviderRail));
    });

    let railResponse = await Promise.all(promise).then((values) => {
        return getFormattedData(values); 
    });
    value({ ...homeData, railResponse });
};

const value = (homeData) => {
    store.dispatch(fetchHomeDataHeirarchy(homeData));
};

const getFormattedData = (data) => {
    let formattedData = { data: { items: [] } };
    data &&
        data?.forEach((res) => {
            formattedData.data.items.push(res.data);
        });
    return formattedData;
};

const extractCommonData = (vrArray, cacheData) => {
    let data = vrArray.data.filter((e) => {
        return cacheData.some((item) => item.railId === e.railId);
    });
    return { data: data };
};
