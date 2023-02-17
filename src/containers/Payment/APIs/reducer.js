import { ACTION } from './constants';

export default function paymentReducer(state = {}, action) {
    switch (action.type) {
        case ACTION.PAYMENT_STATUS:
            return { ...state, payment: action.apiResponse.data };
        default:
            return state;
    }
}
