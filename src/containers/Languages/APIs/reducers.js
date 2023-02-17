import {ACTION} from "./constants";
import get from "lodash/get";

let initialState = {
    showMobilePopup: false,
    selectedLanguage: [],
};

export default function languageReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.SAVE_PREFERRED_LANGUAGES:
            return {
                ...state,
                savedPreferredLanguages: get(action, "apiResponse", {}),
            };
        case ACTION.FETCH_LANGUAGE_LISTING:
            return {
                ...state,
                languageList: get(action, "apiResponse", {}),
            };
        case ACTION.FETCH_SELECTED_LANGUAGE:
            return {
                ...state,
                selectedLanguage: get(action, "apiResponse", {}),
            }
        case ACTION.OPEN_MOBILEPOPUP:
            return {
                ...state,
                showMobilePopup: true,
            };
        case ACTION.CLOSE_MOBILEPOPUP:
            return {
                ...state,
                showMobilePopup: false,
            };

        default:
            return state;
    }
}
