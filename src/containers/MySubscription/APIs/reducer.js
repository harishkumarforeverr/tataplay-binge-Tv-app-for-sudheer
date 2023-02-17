const initialState = {};
import {ACTION} from '../constant'

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION.CANCEL_PACK:
            return {...state, cancelData: action.apiResponse, cancelDataSilently: action.isCancelSilently};
        case ACTION.RESUME_PACK:
            return {...state, resumeData: action.apiResponse};
        case ACTION.CLEAR_DATA:
            return {...state, resumeData: null,cancelData:null};
        case ACTION.GET_UPGRADE_TRANSITION_DETAILS:
            return {...state, upgradeTransitionDetails: action.apiResponse?.data};
        default:
            return state;
    }
};
