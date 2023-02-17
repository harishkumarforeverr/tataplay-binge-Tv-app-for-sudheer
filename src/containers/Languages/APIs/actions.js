import { hideMainLoader, showMainLoader } from "@src/action";
import LanguageServiceInstance from "./services";
import { ACTION } from "./constants";
import { BROWSE_TYPE } from "@containers/BrowseByDetail/APIs/constants";
import { LOCALSTORAGE } from "@constants";
import { setKey } from "@utils/storage";
import { clearAPIRequestCache } from '@services';

export const savePreferredLanguages = (data, id, showLoader = false) => {
    return (dispatch) => {
        showLoader && dispatch(showMainLoader());
        return LanguageServiceInstance.savePreferredLanguages(data, id)
            .then(function (response) {
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.SAVE_PREFERRED_LANGUAGES,
                    apiResponse: response,
                });
                setKey(LOCALSTORAGE.USER_LANGUAGE_UPDATED, JSON.stringify(true));
                clearAPIRequestCache();
                return response;
            })
            .catch((error) => {
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.SAVE_PREFERRED_LANGUAGES,
                    apiResponse: error,
                });
                console.log(
                    "Error while saving preferred language for guest and user :- " + error,
                );
            });
    };
};
export const getLanguageListing = (id, showLoader = false) => {
    return (dispatch) => {
        showLoader && dispatch(showMainLoader());
        return LanguageServiceInstance.getLanguageListing(
            BROWSE_TYPE.LANGUAGE.toLowerCase(),
            id,
            true,
        )
            .then(function (response) {
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.FETCH_LANGUAGE_LISTING,
                    apiResponse: response,
                });
                return response;
            })
            .catch((error) => {
                showLoader && dispatch(hideMainLoader());
                dispatch({
                    type: ACTION.FETCH_LANGUAGE_LISTING,
                    apiResponse: error,
                });
                console.log(
                    "Error while fetching language listing for user:- " + error,
                );
            });
    };
};

export const fetchUserSelectedData = (header, body) => {
    return dispatch => {
        return LanguageServiceInstance.getLanguageSelected(header, body).then(function (response) {
            dispatch({
                type: ACTION.FETCH_SELECTED_LANGUAGE,
                apiResponse: response,
            });
            return response;
        }).catch((error) => {
            console.log("Error while fetching :- " + error)
        });
    }
};

export const openMobilePopup = () => {
    return {
        type: ACTION.OPEN_MOBILEPOPUP,
    };
};

export const closeMobilePopup = () => {
    return { type: ACTION.CLOSE_MOBILEPOPUP };
};
