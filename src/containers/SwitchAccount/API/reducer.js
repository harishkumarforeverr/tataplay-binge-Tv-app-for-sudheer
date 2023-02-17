import get from "lodash/get";
import {ACTION} from './constants'

let initialState = {};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION.GET_ACCOUNT_LIST:
            return {...state, accountList: get(action, 'apiResponse.data')};
        case ACTION.POST_SWITCH_ACCOUNT_REQ:
            return {...state, postSwitchAccountResponse: get(action, 'apiResponse')};
        case ACTION.RESET_SWITCH_ACCOUNT_DATA:
            return initialState;
        default:
            return state;
    }
};
