const initialState = {};
import {ACTION} from './constants'

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION.CREATE_WO:
            return {...state, workOrder: action.apiResponse};
        case ACTION.GET_SUBSCRIBER_ADDRESS:
            return {...state, subscriberAddressDetails: action.apiResponse};
        case ACTION.GET_SLOT:
            return {...state, dynamicSlotDetails: action.apiResponse};
        case ACTION.CONFIRM_SLOT:
            return {...state, confirmSlotResponse: action.apiResponse};
        case ACTION.CAMPAIGN:
            return {...state, campaign: action.apiResponse}
        default:
            return state;
    }
};
