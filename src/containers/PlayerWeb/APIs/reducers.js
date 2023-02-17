import { CONSTANT } from '@utils/constants';
import { ACTION } from './constants';

let initialState = {
    videoQuality: CONSTANT.VIDEOQUALITY.AUTO,
}
export default function playerReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.ADD_WATCHLIST_DATA:
            return { ...state, ...action.apiResponse.data };
        case ACTION.CHECK_WATCHLIST:
            return { ...state, check: action.apiResponse.data };
        case ACTION.CHECK_NEXT_PREV_EPISODE:
            return { ...state, checkEpisode: action.apiResponse.data };
        case ACTION.ADD_WATCHLIST_ERROR_DATA:
            return { ...state, config: action.apiResponse };
        case ACTION.CHECK_WATCHLIST_ERROR:
            return { ...state, error: action.apiResponse };
        case ACTION.CHECK_NEXT_PREV_ERROR:
            return { ...state, nextPrevError: action.apiResponse };
        case ACTION.SET_LA_DATA:
            return { ...state, setLaData: action.apiResponse };
        case ACTION.GET_VOOT:
            return { ...state, getVootUrl: action.apiResponse };
        case ACTION.GET_PLANET_MARATHI:
            return { ...state, planetMarathiUrl: action.apiResponse };
        case ACTION.GET_CHAUPAL:
            return { ...state, getChaupalUrl: action.apiResponse };
        case ACTION.GET_LIONS_GATE_DATA:
            return { ...state, getLionsGateData: action.apiResponse };
        case ACTION.GET_LIONS_GATE_ERROR:
            return { ...state, getLionsGateError: action.apiResponse };
        case ACTION.GET_CHAUPAL_ERROR:
            return { ...state, getChaupalerror: action.apiResponse };
        case ACTION.SET_PLAYER_API_ERROR:
            return { ...state, playerApiError: action.apiResponse };
        case ACTION.GET_ZEE5:
            return { ...state, getZee5Data: action.apiResponse };
        case ACTION.GENERATE_TOKEN:
            return { ...state, getToken: action.apiResponse };
        case ACTION.RESEND_LICENSE:
            return { ...state, resendLicense: action.apiResponse };
        case ACTION.SET_VIEW_COUNT_LA_DATA:
            return { ...state, setViewCountLaData: action.apiResponse };
        case ACTION.SET_EPCION_DOCUBAY_ANALYTICS_DATA:
            return { ...state, epiconAnalyticsData: action.apiResponse };
        case ACTION.SET_LIONSGATE_ANALYTICS_DATA:
            return { ...state, lionsgateAnalyticsData: action.apiResponse };
        case ACTION.GET_SONY_TOKEN:
            return { ...state, sonyToken: action.apiResponse };
        case ACTION.GET_HOI_CHOI_TOKEN:
            return { ...state, hoiChoiToken: action.apiResponse };
        case ACTION.GET_VIDEO_QUALITY:
            return { ...state, videoQuality: action.value };
        case ACTION.GET_GENERIC_DRM:
            return { ...state, getGenericDrmUrl: action.apiResponse };
        case ACTION.GET_GENERIC_DRM_ERROR:
            return { ...state, getGenericError: action.apiResponse };
        case ACTION.GET_DIGITAL_FEED:
            return {...state, digitalFeed: action.apiResponse};
        case ACTION.GET_DIGITAL_FEED_ERROR:
                return {...state, digitalFeedError: action.apiResponse};
        default:
            return state;
    }
}
