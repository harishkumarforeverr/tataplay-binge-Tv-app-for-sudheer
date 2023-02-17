const initialState = {
    checkCallingCurrentSubscriptionApi: false,
    regionalNudgeStatus: true,
};
import { get } from 'lodash';
import { ACTION } from './constant';

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION.GET_CURRENT_SUBSCRIPTION_INFO:
            return { ...state, currentSubscription: get(action, 'apiResponse'), checkCallingCurrentSubscriptionApi: false };
        case ACTION.CHECK_CALLING_SUBSCRIPTION_API:
            return { ...state, checkCallingCurrentSubscriptionApi: true }
        case ACTION.PACK_LISTING:
            return { ...state, packListingData: get(action.apiResponse, 'data') };
        case ACTION.GET_ACCOUNT_BALALNCE:
            return { ...state, tenureAccountBal: get(action.apiResponse, 'data') };
        case ACTION.VALIDATE_SELECTED_PACK:
            return { ...state, validateSelectedPackResp: get(action, 'apiResponse') };
        case ACTION.ADD_NEW_PACK:
            return { ...state, addNewPackRes: get(action, 'apiResponse') };
        case ACTION.MODIFY_EXISTING_PACK:
            return { ...state, modifyPackRes: get(action, 'apiResponse') };
        case ACTION.CANCEL_SUBSCRIPTION:
            return { ...state, cancelSubscriptionRes: get(action, 'apiResponse') };
        case ACTION.REVOKE_SUBSCRIPTION:
            return { ...state, revokeSubscriptionRes: get(action, 'apiResponse') };
        case ACTION.SET_UPDATED_TENURE:
            return { ...state, selectedTenureValue: action.value };
        case ACTION.NOTLOGGEDIN_SUBSCRIPTION:
            return { ...state, notloggedInUserPackData: get(action, 'apiResponse') };
        case ACTION.MINI_SUBSCRIPTION:
            return { ...state, miniSubscription: action.value };
        case ACTION.CLEAR_PACK_LIST:
            return { ...state, packListingData: [] };
        case ACTION.PORTAL_PACK_LINK:
            return { ...state, getPortalLink: get(action, 'apiResponse') };
        case ACTION.MIGRATE_USER_INFO:
            return { ...state, migrateUserInfo: get(action, 'apiResponse') };
        case ACTION.CAMPAIGN_PAGE_DATA:
            return { ...state, campaignPage: get(action, 'apiResponse') };
        case ACTION.CAMPAIGN_BANNER_DATA:
            return { ...state, campaignBannerData: get(action, 'apiResponse') };
        case ACTION.USER_ELIGIBILE_DATA:
            return { ...state, userEligible: get(action.apiResponse, 'data') };
        case ACTION.REGIONAL_NUDGE_STATUS:
                return { ...state, regionalNudgeStatus: false};
        default:
            return state;
    }
};