import {combineReducers} from 'redux';
import homeDetails from './containers/Home/APIs/reducers';
import languageReducer from "./containers/Languages/APIs/reducers";
import PIDetails from './containers/PIDetail/API/reducers';
import headerDetails from './components/Header/APIs/reducers';
import seasonReducer from '@components/Seasons/APIs/reducer';
import seeAll from './containers/SeeAll/APIs/reducer';
import modal from '@common/Modal/reducer'
import resendOtp from '@common/ResendOtp/APIs/reducers';
import linkAccount from '@containers/LinkAccount/APIs/reducers';
import deviceManagement from '@containers/DeviceManagement/APIs/reducer';
import searchReducer from '@containers/Search/APIs/reducers';
import mySubscriptionReducer from '@containers/MySubscription/APIs/reducer';
import profileDetails from '@containers/Profile/APIs/reducer';
import playerWatchlist from '@containers/PlayerWeb/APIs/reducers';
import switchAccountDetails from '@containers/SwitchAccount/API/reducer';
import watchlist from '@containers/Watchlist/API/reducer';
import browseBy from '@containers/BrowseByDetail/APIs/reducer';
import bingeLoginDetails from '@containers/BingeLogin/APIs/reducer';
import packSelectionDetail from '@containers/PackSelection/APIs/reducer';
import fireTvInstallation from '@containers/FireTvInstallation/APIs/reducer';
import paymentReducer from "@containers/Payment/APIs/reducer";
import subscriptionPaymentReducer from "@containers/SubscriptionPayment/APIs/reducer";
import AppInstallPageDetails from "@containers/AppInstallPage/APIs/reducer";
import helpCenterReducer from '@containers/HelpCenter/APIs/reducer';
import {ACTION} from '@constants';
import {ACTION as HEADER_ACTION} from '@components/Header/APIs/constants';
import subscriptionDetails from '@containers/Subscription/APIs/reducer';
import languages from '@containers/Languages/APIs/reducers';
import loginReducer from './containers/Login/APIs/reducer';
import transactionReducer from './containers/Transactions/APIs/reducers';
import requestConfig from '@utils/requestConfig';

let initialState = {
    isLoading: false,
    loaderDelayTime: 0,
    requests: 0,
    requestUrl: [],
    loggedStatus: false,
    isPaginationLoaderVisible: false,
    isSourceAppsFlyerDeeplink: false,
    miniStatus:false,
    fromLogin:false,
    isLandscape:false,
};

const commonContent = (state = initialState, action) => {
    switch (action.type) {
        case ACTION.SHOW_MAIN_LOADER :
            return {...state, isLoading: true};
        case ACTION.TOGGLE_PAGINATION_LOADER_VISIBILITY:
            return {...state,isPaginationLoaderVisible:action.value};
        case ACTION.HIDE_MAIN_LOADER :
            return {...state, isLoading: false};
        case ACTION.HEADER_HIDE :
            return {...state, header: action.val};
        case ACTION.FOOTER_HIDE :
            return {...state, footer: action.val};
        case ACTION.SHOW_SPLASH:
            return {...state, splash: true};
        case ACTION.HIDE_SPLASH:
            return {...state, splash: false};
        case HEADER_ACTION.CALL_CONFIG: {
            const config = action.apiResponse && action.apiResponse.data && action.apiResponse.data.config;
            const loaderDelayTime = config && config.loaderDelayTime;
            requestConfig.setLoaderDelayTime(loaderDelayTime)
            return {...state, loaderDelayTime};
        }
        case ACTION.REQUEST_FIRED:
            return {...state, requests: state.requests + 1, requestUrl: [...state.requestUrl, action.data]};
        case ACTION.RESPONSE_RECEIVED:
            return {...state, requests: state.requests - 1, requestUrl: [...state.requestUrl, action.data]};
        case ACTION.LOGGED_STATUS:
            return {...state, loggedStatus: action.val};
        case ACTION.SET_IS_SOURCE_APPSFLYER_DEEPLINK:
            return {...state, isSourceAppsFlyerDeeplink: true};
        case ACTION.MINI_STATUS:
            return {...state, miniStatus: action.val};
        case ACTION.SUBSCRIPTION_PAGE_STATUS:
                return {...state, subscriptionPageStatus: action.val};    
         case ACTION.FROM_LOGIN_LOADER:
                return {...state, fromLogin: action.val}; 
        case ACTION.IS_LANDSCAPE:
                return {...state, isLandscape: action.val}; 
        default:
            return state;
    }
};

const appReducer = combineReducers({
    homeDetails,
    languageReducer,
    headerDetails,
    PIDetails,
    modal,
    resendOtp,
    seeAll,
    commonContent,
    seasonReducer,
    linkAccount,
    deviceManagement,
    searchReducer,
    profileDetails,
    playerWatchlist,
    switchAccountDetails,
    watchlist,
    browseBy,
    bingeLoginDetails,
    packSelectionDetail,
    mySubscriptionReducer,
    fireTvInstallation,
    paymentReducer,
    AppInstallPageDetails,
    languages,
    loginReducer,
    subscriptionDetails,
    helpCenterReducer,
    subscriptionPaymentReducer,
    transactionReducer,
});

const rootReducer = (state, action) => {
    // Clear all data in redux store to initial.
    if (action.type === HEADER_ACTION.CLEAR_STORE) {
        state = {
            bingeLoginDetails: state.bingeLoginDetails,
            commonContent: state.commonContent,
            headerDetails: state.headerDetails,
            modal: state.modal,
        };
    }
    return appReducer(state, action);
};

export default rootReducer;

