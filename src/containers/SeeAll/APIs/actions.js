import {ACTION} from "./constant";
import {showMainLoader, hideMainLoader} from "@src/action";
import {filterPartnerContents} from "@utils/common";
import SeeAllServiceInstance from "@containers/SeeAll/APIs/service";

export const editorialSeeAll = (id, offset, showLoader) => {
    return dispatch => {
        showLoader && dispatch(showMainLoader());

        return new Promise((resolve, reject) => {
            SeeAllServiceInstance.editorialSeeAll(id, offset).then((response) => {
    
                response.data.exactCount = response.data.contentList.length;
                response.data.contentList = filterPartnerContents(response.data.contentList, response.data.sectionSource);
                response.data.updatedCount = response.data.contentList.length;
    
                dispatch({
                    type: ACTION.SEE_ALL_CONTENT,
                    apiResponse: response,
                });
                showLoader && dispatch(hideMainLoader());
                resolve(response);
            }).catch((error) => {
                showLoader && dispatch(hideMainLoader());
                console.log(`Error while getting editorial see all content info :- ${  error}`)
                reject(error)
            });
        })

    }
};

export const clearContent = () => {
    return dispatch => dispatch({type: ACTION.CLEAR_CONTENT});
};
