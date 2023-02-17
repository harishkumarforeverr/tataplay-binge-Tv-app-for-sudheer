import {ACTION} from './constants'

export default function linkAccount(state = {}, action) {
    switch (action.type) {
        case ACTION.FETCH_LINK_ACCOUNT_OTP:
            return {...state, linkAccountOtpDetails: {...action.apiResponse}};

        default:
            return state;
    }
}