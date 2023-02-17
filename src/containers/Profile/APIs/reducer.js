const initialState = {};
import {ACTION} from './constants'

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION.GET_PROFILE_DETAILS:
            return {...state, userProfileDetails: action.apiResponse.data};
        case ACTION.UPDATE_PROFILE_DETAILS:
            return {...state, updateProfileDetailsResponse: action.apiResponse};
        case ACTION.UPDATE_USER_PASSWORD:
            return {...state, updatePasswordResponse: action.apiResponse};
        case ACTION.UPDATE_PROFILE_IMAGE:
            return {...state, updateProfileImageResponse: action.apiResponse};
        case ACTION.UPDATE_EMAIL:
            return {...state, updateEmailResponse: action.apiResponse};
        case ACTION.SWITCH_TO_ATV_ACC:
            return {...state, switchAtcAccResponse: action.apiResponse};
        case ACTION.HANDLE_ATV_UPGRADE:
            return {...state, atvUpgradeResponse: action.apiResponse};
        case ACTION.SET_PROFILE_IMAGE:
            return {
                ...state,
                userProfileDetails: {
                    ...state.userProfileDetails,
                    profileImage: action.response,
                }
            }

        default:
            return state;
    }
};
