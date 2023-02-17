const initialState = {};
import {ACTION} from './constants'

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION.PACK_LISTING:
            return {...state, packList: action.apiResponse};
        case ACTION.CREATE_SUBSCRIPTION:
            return {...state, createSubscription: action.apiResponse};
        case ACTION.MODIFY_SUBSCRIPTION:
            return {...state, modifySubscription: action.apiResponse};
        case ACTION.GET_CURRENT_SUBSCRIPTION_INFO:
            return {...state, currentSubscription: action.apiResponse};
        case ACTION.GET_BALANCE_INFO:
            return {...state, balanceInfo: action.apiResponse};
        case ACTION.GET_ACCOUNT_BALANCE_INFO:
            return {...state, accountBalanceInfo: action.apiResponse};
        case ACTION.QUICK_RECHARGE:
            return {...state, quickRecharge: action.apiResponse};
        case ACTION.QUICK_RECHARGE_BEFORE_LOGIN:
            return {...state, quickRechargeUrl: action.apiResponse};
        case ACTION.REACTIVATE_SUBSCRIPTION:
            return {...state, reactivateSubscription: action.apiResponse};
        default:
            return state;
    }
};
