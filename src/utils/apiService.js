import CONSTANT from "@environment/index";
import {
    HEADER_CONSTANTS,
    LOCALSTORAGE,
    REQUEST_METHOD,
    SILENT_LOGIN_PLATFORM,
} from "@utils/constants";
import {
    contentType,
    getBaseUrl,
    getDeviceId,
    getEnvironmentConstants,
    getHomepageUrl,
    getParamsAPICall,
    getPlayerHeaderParams,
    isMobile,
    isUserloggedIn,
    getTARecommendationHeader,
    getTARecommendationBaseURL,
    getContinueWatchingHeader,
    getCommonHeaders,
    returnUrlTickTick,
    getLanguageGenreAPISource,
    isSettingPage,
    getHomeUrlHeader,
    checkIsUserSubscribed,
    getPackName,
    getWebSmallRouteValues,
} from "@utils/common";
import { getKey } from "@utils/storage";
import url from "@environment/dev";
import store from "@src/store";
import get from "lodash/get";
import { PROVIDER_NAME } from "@constants/playerConstant";
import { SEE_ALL_LIMIT } from "@containers/SeeAll/APIs/constant";
import { DEVICE_TYPE_HEADER } from "@constants";
import { BROWSE_TYPE } from '@containers/BrowseByDetail/APIs/constants';
import { isEmpty } from "lodash";
import { getSystemDetails } from "@utils/browserEnvironment";
import { BROWSER_TYPE } from "@constants/browser";
import MIXPANEL from "@constants/mixpanel";
import { CHATBOT_TYPE } from "@containers/HelpCenter/APIs/constants";
import { DRP_STATE } from "@containers/Home/APIs/constants";
import appsFlyerConfig from "./appsFlyer";
import { checkPartnerSubscriptionType } from "@containers/Subscription/APIs/subscriptionCommon";

export const serviceConstants = {
    getSeeAllDetails: (id, offset = 0) => {
        return {
            url: `${CONSTANT.API_BASE_URL}${CONSTANT.SEE_ALL_URL}${id}&limit=${SEE_ALL_LIMIT}&Offset=${offset}`,
            method: REQUEST_METHOD.GET,
            isAPIPrimary: true,
            headers: {
                ...getCommonHeaders(),
            }
        };
    },
    fetchLiveContentData: (id) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.LIVE_DETAIL}/${id}`,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...getCommonHeaders()
            },
            isAPIPrimary: false,
        };
    },
    getDigitalFeed: (payload) => {
        return {
            //url: `${getBaseUrl()}${CONSTANT.DIGITAL_FEED}/${payload.partnerName}/${payload.channelId}`,
            url: `${CONSTANT.DIGITAL_FEED_BASE_URL}${CONSTANT.DIGITAL_FEED}/${payload.partnerName}/${payload.channelId}`,
            method: REQUEST_METHOD.GET,
            isAPIPrimary: false,
        }
    },
    getHomePageDetails: (
        apiUrl,
        limit,
        offset,
        isPartnerPage,
        providerId,
        anonymousId,
    ) => {
        let url = `${getBaseUrl()}${apiUrl}?pageLimit=${limit}&pageOffset=${offset}`;
        let updatedUrl = getHomepageUrl(url, isPartnerPage, providerId);
        return {
            url: updatedUrl,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "IND",
                deviceId: getDeviceId(),
                //platform: 'binge_anywhere_web', -- to check
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                deviceType: DEVICE_TYPE_HEADER.WEB,
                rule: "BA",
                ...getCommonHeaders(`bearer ${anonymousId}`)
            },
            isAPIPrimary: true,
            cache: true,
        };
    },
    getHomeDataHeirarachy: ( //integration of heirarchy DRP API
        homeData,
    ) => {
        let url = `${getBaseUrl()}${homeData.apiUrl}`;
        let subscribed = checkIsUserSubscribed(homeData.isPartnerPage, homeData.providerId);
        let packName = getPackName();
        let updatedUrl = homeData.drpState === DRP_STATE.VR ? `${url}?packName=${packName}` : url
        return {
            url: updatedUrl,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "ENG",
                rule: "DRPLIVEVRTABA",
                deviceType: DEVICE_TYPE_HEADER.WEB,
                subscribed: subscribed,
                unsubscribed: !subscribed,
                ...getHomeUrlHeader(homeData)
            },
            isAPIPrimary: homeData.drpState === DRP_STATE.VR ? true : false, // hide error popup for ta and ta_guest heirarchy
            cache: true,
        };
    },

    getRailContent: (id, isLimitReq) => { // fetch Content of rail with respect to railId
        let url = `${getBaseUrl()}${CONSTANT.RAIL_CONTENT_URL}${id}${isLimitReq ? '&limit=25' : ''}`;
        return {
            url: url,
            method: REQUEST_METHOD.GET,
            headers: {
                rule: "DRPALLVRTABA",
                platform: "BINGE_ANYWHERE_WEB"
            },
            // isAPIPrimary: true, // hide error popup
            cache: true,
        };

    },

    getHoiChoiToken: () => {
        let url = `${getBaseUrl()}${CONSTANT.GET_HOI_CHOI_TOKEN}`;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: url,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    getContinueWatchingContent: (offset, seeAll, pagingState) => {
        let pagination = pagingState ? `&pagingState=${pagingState}` : "";
        let BROWSE_PATH = isUserloggedIn() ? CONSTANT.CONTINUE_WATCHING_HOME_URL : CONSTANT.GUEST_CONTINUE_WATCHING_HOME_URL;
        let queryParams;
        if (isUserloggedIn()) {
            let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
            queryParams = `?subscriberId=${userInfo.sId}&profileId=${userInfo.profileId}`;
        } else {
            let anonymousId = getKey(LOCALSTORAGE.ANONYMOUS_ID);
            queryParams = `?uniqueId=${anonymousId}&cw=true`;
        }
        return {
            url: `${CONSTANT.API_BASE_URL}${BROWSE_PATH}${queryParams}&seeAll=${seeAll}&offSet=${offset}${pagination}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getContinueWatchingHeader(),
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
            },
            isAPIPrimary: seeAll,
            cache: true,
        };
    },

    getOtp: (rmn) => {
        let { accessToken } =
            JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.OTP_URL}${rmn}/otp`,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "en",
                ...getCommonHeaders(accessToken)
            },
            isAPIPrimary: true,
        };
    },
    // **************** who have started from here***********
    rmnGetOtp: (rmn) => {
        return {
            url: `${CONSTANT.API_BASE_URL}${CONSTANT.GENERATE_OTP_RMN}`,
            method: REQUEST_METHOD.POST,
            headers: {
                mobileNumber: rmn,
                deviceId: getDeviceId(),
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            },
            isAPIPrimary: true,
        };
    },

    verifyRmnOpt: (mobileNumber, otp) => {
        const data = { mobileNumber, otp };
        return {
            url: `${CONSTANT.API_BASE_URL}${CONSTANT.VERIFY_OPT_RMN}`,
            method: REQUEST_METHOD.POST,
            headers: {
                deviceId: getDeviceId(),
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            },
            data: JSON.stringify(data),
            isAPIPrimary: true,
        };
    },

    subscriberListing: (mobileNumber) => {
        const state = store.getState();
        let token = get(state.loginReducer.otpResponse, "data");
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}${CONSTANT.SUBSCRIBER_LIST}`,
            method: REQUEST_METHOD.GET,
            headers: {
                subscriberId: userInfo.sId,
                baId: userInfo.baId,
                mobileNumber,
                deviceType: DEVICE_TYPE_HEADER.WEB,
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                authorization: `bearer ${isUserloggedIn() ? userInfo?.accessToken : token?.userAuthenticateToken}`,
            },
            isAPIPrimary: !isSettingPage(),
        };
    },

    verifyOtp: (params) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.VALIDATE_OTP_URL}`,
            method: REQUEST_METHOD.POST,
            data: params,
            headers: {
                deviceId: getDeviceId(),
                locale: "en",
            },
            isAPIPrimary: true,
        };
    },

    validateOtpForSid: (params) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.VALIDATE_OTP_SID_URL}`,
            method: REQUEST_METHOD.POST,
            data: params,
            headers: {
                deviceId: getDeviceId(),
                locale: "en",
            },
            isAPIPrimary: true,
        };
    },

    createCancelSubscriberAccount: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/create/cancel/subscriber/${userInfo.sId
                }/account`,
            method: REQUEST_METHOD.POST,
            headers: {
                deviceId: getDeviceId(),
                locale: "en",
                // authorization: userInfo.accessToken,
                deviceName: "Web",
                deviceToken: userInfo.deviceToken,
                platform: HEADER_CONSTANTS.WEB,
                ...getCommonHeaders()
            },
            isAPIPrimary: true,
        };
    },

    validatePassword: (params) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.VALIDATE_PASSWORD_URL}`,
            method: REQUEST_METHOD.POST,
            data: params,
            headers: {
                deviceId: getDeviceId(),
                locale: "en",
            },
            isAPIPrimary: true,
        };
    },

    generateOtpWithSid: (sid, isPassword) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.SID_OTP_URL
                }${sid}/otp?isPassword=${isPassword}`,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "en",
            },
            isAPIPrimary: true,
        };
    },

    getForgetPasswordOtp: (sid, param) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.FORGET_PASSWORD_URL}${sid}/password`,
            method: REQUEST_METHOD.POST,
            headers: {
                locale: "en",
            },
            data: param,
            isAPIPrimary: true,
        };
    },

    changePasswordWithoutAuth: (sid, params) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.CHANGE_PASSWORD_WITHOUT_AUTH_URL
                }${sid}/change-password`,
            method: REQUEST_METHOD.PUT,
            data: params,
            headers: {
                locale: "en",
            },
            isAPIPrimary: true,
        };
    },

    logout: (allUsers = false) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${allUsers ? url.LOGOUT_ALL_USERS_API : url.LOGOUT_API}${userInfo.baId}`,
            method: REQUEST_METHOD.POST,
            headers: {
                deviceId: getDeviceId(),
                // subscriberId: userInfo.sId,
                "x-authenticated-userid": "",
                // authorization: userInfo.accessToken,
                deviceToken: userInfo.deviceToken,
                platform: HEADER_CONSTANTS.WEB,
                locale: "en",
                ...getCommonHeaders()
            },
            isAPIPrimary: true,
        };
    },
    fetchLiveContentData: (id) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.LIVE_DETAIL}/${id}`,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...getCommonHeaders()
            },
            isAPIPrimary: false,
        };
    },
    fetchPIData: (id, contentTypeData) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${url.PI_DETAIL_URL}${contentType(
                contentTypeData,
            )}/${id}?subscriberId=${userInfo.sId}&profileId=${userInfo.profileId}`,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...getCommonHeaders()
            },
            isAPIPrimary: false,
        };
    },

    getShemarooContent: (url) => {
        return {
            url: `${getEnvironmentConstants().ENV_URL
                }/by-pass` /* 'https://tatasky-qa-anywhere-web-app.videoready.tv/by-pass' */,
            method: REQUEST_METHOD.POST,
            data: { url },
            isAPIPrimary: true,
        };
    },

    getVootUrl: (id, contentType, provider, partnerUniqueId) => {
        let { baId, sId, profileId } = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const systemDetail = getSystemDetails();
        let body = {
            contentId: id, // partnerContentId
            contentType: contentType,
            partner: provider,
            baId: baId,
            "type": systemDetail.browser === BROWSER_TYPE.SAFARI ? "HLS" : "DASH",
        };
        let headers = {
            subscriberId: sId,
            profileId: profileId,
            deviceId: JSON.parse(getKey(LOCALSTORAGE.DEVICE_ID)), // Internal Discussion required on value of deviceId
            "x-authenticated-userid": sId,
            partnerUniqueId: partnerUniqueId,
            ...getCommonHeaders()
        };

        let updatedUrl = `${getBaseUrl()}${url.VOOT_SELECT_URL}`;
        if (provider.toLowerCase() === PROVIDER_NAME.VOOTSELECT) {
            updatedUrl = `${getBaseUrl()}${url.VOOT_SELECT_URL}`;
        } else if (provider.toLowerCase() === PROVIDER_NAME.VOOTKIDS) {
            updatedUrl = `${getBaseUrl()}${url.VOOT_KIDS_URL}`;
        }
        return {
            url: updatedUrl,
            method: REQUEST_METHOD.POST,
            data: body,
            headers,
            isAPIPrimary: true,
        };
    },

    getZee5Tag: (partnerUniqueId) => {
        let { baId } = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let headers = {
            baId: baId,
            deviceId: getDeviceId(),
            partnerUniqueId: partnerUniqueId,
            ...getCommonHeaders()
        };

        return {
            url: `${getBaseUrl()}${url.ZEE5_URL}`,
            method: REQUEST_METHOD.POST,
            headers: headers,
            isAPIPrimary: true,
        };
    },

    fetchPIRecommendedData: (data) => {
        let {
            seeAll = false,
            id,
            contentType,
            from = 0,
            max = 10,
            preferredLanguages,
        } = data;
        return {
            url: `${CONSTANT.API_BASE_URL}${CONSTANT.PI_RECOMMENDED_URL}${id}/${contentType}?max=${max}&from=${from}&preferredLanguages=${preferredLanguages}`,
            method: REQUEST_METHOD.GET,
            headers: {
                // ...getTARecommendationHeader(),
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                locale: "en",
                ...getCommonHeaders(),
            },
            isAPIPrimary: seeAll,
        };
    },

    resendOtp: (rmn) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.OTP_URL}/${rmn}/login`,
            method: REQUEST_METHOD.GET,
        };
    },

    fetchHeaderData: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.HEADER_MENU_URL}`,
            method: REQUEST_METHOD.GET,
            data: { baId: userInfo.baId, rmn: userInfo.rmn },
            isAPIPrimary: true,
            headers: {
                ...getCommonHeaders()
            }
        };
    },

    addAlias: (aliasName) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/subscriber/${userInfo.baId
                }/update/alias?aliasName=${aliasName}`,
            method: REQUEST_METHOD.POST,
            headers: {
                deviceName: "Web",
                platform: HEADER_CONSTANTS.WEB,
                deviceId: getDeviceId(),
                ...getCommonHeaders()
            },
        };
    },

    fetchConfig: () => {
        return {
            url: `${getBaseUrl()}${url.CONFIG_URL}`,
            method: REQUEST_METHOD.GET,
            headers: {
                apiVersion: 'v3',
                appVersion: '1.0.0',
                platform: HEADER_CONSTANTS.WEB,
                sourceApp: CONSTANT.SOURCE_APP,
                ...getCommonHeaders(),
            },
            isAPIPrimary: true,
        };
    },

    fetchSeasonData: (id, limit, offset) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${url.SEASON_URL}${id}?subscriberId=${userInfo.sId
                }&profileId=${userInfo.profileId}&limit=${limit}&offset=${offset ? offset : 0
                }`,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
            },
        };
    },

    fetchEpisodeDetails: (payload) => {
        let BROWSE_PATH = isUserloggedIn() ? CONSTANT.CONTINUE_WATCHING_HISTORY : CONSTANT.GUEST_CONTINUE_WATCHING_HISTORY;
        return {
            url: `${CONSTANT.API_BASE_URL}${BROWSE_PATH}`,
            method: REQUEST_METHOD.POST,
            headers: getContinueWatchingHeader(),
            data: payload,
        };
    },

    getSubscriberDeviceList: (isBeforeLogin, payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO))
        let headers;
        if (isBeforeLogin) {
            const state = store.getState();
            headers = {
                authorization: `bearer ${get(state.loginReducer, 'otpResponse.data.userAuthenticateToken')}`,
                subscriberId: payload?.subscriberId,
                deviceId: getDeviceId(),
                baId: payload?.baId,
                dthStatus: payload?.dthStatus,
                beforeLogin: isBeforeLogin,
                deviceToken: get(state.loginReducer, 'otpResponse.data.deviceAuthenticateToken'),
            }
        }
        else {
            headers = {
                authorization: `${userInfo?.accessToken}`,
                subscriberId: userInfo?.sId,
                deviceId: getDeviceId(),
                baId: userInfo?.baId,
                dthStatus: payload?.dthStatus,
            }
        }
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/subscriber/devices/${headers.baId}`,
            method: REQUEST_METHOD.GET,
            headers: headers,
            isAPIPrimary: true,
        };
    },

    deleteSubscriberDeviceList: (deviceDetail, isBeforeLogin, data) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO))
        let state = store.getState(), headers;
        if (isBeforeLogin) {
            headers = {
                dthStatus: data?.dthStatus,
                baId: data?.baId,
                subscriberId: data?.subscriberId,
                authorization: `bearer ${get(state?.loginReducer, 'otpResponse.data.userAuthenticateToken')}`,
                beforeLogin: isBeforeLogin,
            }
        }
        else {
            headers = {
                authorization: `${userInfo?.accessToken}`,
                subscriberId: userInfo?.sId,
                baId: userInfo.baId,
                deviceId: getDeviceId(),
            }
        }
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/remove/devices/${headers?.baId}/${deviceDetail?.deviceNumber}`,
            method: REQUEST_METHOD.DELETE,
            headers: headers,
            isAPIPrimary: true,
        };
    },
    fetchLinkAccountOtp: (rmn) => {
        return {
            url: `${getBaseUrl()}user-service/pub/api/v1/user/forgetPassword/${rmn}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(),
            }
        };
    },

    getProfileDetails: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.FETCH_PROFILE_DETAILS}/${userInfo.baId}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
                deviceId: getDeviceId(),
                // "X-authenticated-userid": userInfo.bingeSubscriberId,
            },
            isAPIPrimary: false,
        };
    },

    updateProfileDetailsNonDthUser: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}/${CONSTANT.UPDATE_PROFILE_NON_DTH_USER_AND_BINGE_NEW_STACK}`, //binge-mobile-services/api/v1/subscriber/update/email/name`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                locale: "en",
                platform: HEADER_CONSTANTS.WEB,
                deviceId: getDeviceId(),
                profileId: userInfo?.profileId,
                deviceToken: userInfo.deviceToken,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: true,
        };
    },

    updateEmail: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/subscriber/update/email`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                locale: "en",
                ...getCommonHeaders(),
            },
            isAPIPrimary: true,
        };
    },

    updateProfileImage: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.UPDATE_PROFILE_IMG}/${userInfo.sId}/upload/image`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                locale: "en",
                baId: userInfo.baId,
                "x-authenticated-userid": userInfo.sId,
                ...getCommonHeaders()
            },
        };
    },

    switchToAtvAccount: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/switch/account/atv/${userInfo.baId
                }`,
            method: REQUEST_METHOD.POST,
            headers: {
                locale: "en",
                platform: HEADER_CONSTANTS.WEB,
                deviceId: getDeviceId(),
                ...getCommonHeaders()
            },
        };
    },

    handleAtvUpgrade: () => {
        const { baId } = getParamsAPICall();
        return {
            url: `${getBaseUrl()}binge-mobile-services/pub/api/v2/device/atv/update`,
            method: REQUEST_METHOD.POST,
            data: {
                baId: baId,
                deviceId: getDeviceId(),
            },
            headers: {
                ...getCommonHeaders(),
            },
            isAPIPrimary: true,
        };
    },

    postSwitchAccountReq: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let headers = {
            deviceId: payload.deviceId,
            platform: isMobile.any()
                ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                : HEADER_CONSTANTS.WEB,
            // subscriberId: userInfo.sId,
            "x-authenticated-userid": userInfo.sId,
            // authorization: `${userInfo.accessToken}`,
            deviceType: DEVICE_TYPE_HEADER.WEB,
            ...getCommonHeaders()
        };
        if (payload.targetBaId === null) {
            headers.dsn = payload.dsn;
        } else {
            headers.targetBaId = payload.targetBaId;
        }
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/switch/account/${payload.sourceBaId
                }`,
            method: REQUEST_METHOD.POST,
            headers: headers,
        };
    },

    fetchWatchlistItems: (currentPagingState, removePagination, showErrorPopup = true) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let targetUrl =
            currentPagingState && currentPagingState.length
                ? `&pagingState=${currentPagingState}`
                : "";
        return {
            url: `${CONSTANT.API_BASE_URL}${getEnvironmentConstants().WATCHLIST_URL
                }/listing?subscriberId=${userInfo.sId}&profileId=${userInfo.profileId
                }${targetUrl}`,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                // authorization: `${userInfo.accessToken}`,
                removePagination: removePagination,
                ...getCommonHeaders()
            },
            isAPIPrimary: showErrorPopup,
        };
    },

    removeWatchlistItems: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}action-data-provider/subscriber/favourite/bulk/remove`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                profileId: userInfo.profileId,
                ...getCommonHeaders()
            },
            isAPIPrimary: true,
        };
    },

    addWatchlist: (id, contentTypeData, isHover) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}${getEnvironmentConstants().WATCHLIST_URL
                }?profileId=${userInfo.profileId}&subscriberId=${userInfo.sId
                }&contentId=${id}&contentType=${contentTypeData}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getPlayerHeaderParams(),
                isHover: isHover,
            },
        };
    },

    checkWatchlistContent: (id, contentTypeData) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}${getEnvironmentConstants().CHECK_WATCHLIST_URL}${userInfo.profileId
                }&subscriberId=${userInfo.sId
                }&contentId=${id}&contentType=${contentTypeData}`,
            method: REQUEST_METHOD.GET,
            headers: getPlayerHeaderParams(),
        };
    },

    fetchContinueWatchingDetails: (contentId, contentType, partnerId) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let BROWSE_PATH = isUserloggedIn() ? CONSTANT.CONTINUE_WATCHING_LAST_WATCH : CONSTANT.GUEST_CONTINUE_WATCHING_LAST_WATCH;
        let payload,
            subscriptionType = checkPartnerSubscriptionType(partnerId),
            headers = {
                ...getContinueWatchingHeader(),
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
            };
        if (isUserloggedIn()) {
            payload = {
                subscriberId: userInfo.sId,
                profileId: userInfo.profileId,
                contentId,
                contentType,
            }
            headers = { ...headers, subscriptionType: subscriptionType };
        } else {
            payload = {
                uniqueId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                contentId,
                contentType,
            }
        }

        return {
            url: `${CONSTANT.API_BASE_URL}${BROWSE_PATH}`,
            method: REQUEST_METHOD.POST,
            headers: headers,
            data: payload,
        };
    },

    checkNextPrevEpisode: (id) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${getEnvironmentConstants().PREV_NEXT_EPISODE_URL}${userInfo.sId
                }&profileId=${userInfo.profileId}&id=${id}`,
            method: REQUEST_METHOD.GET,
            headers: getPlayerHeaderParams(),
        };
    },

    setContinueWatching: (id, watchDuration, totalDuration, contentType) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const BROWSE_PATH = isUserloggedIn() ? CONSTANT.CONTINUE_WATCHING : CONSTANT.GUEST_CONTINUE_WATCHING;
        let payload = {};
        if (isUserloggedIn()) {
            payload = {
                subscriberId: get(userInfo, 'sId'),
                profileId: get(userInfo, 'profileId'),
                id,
                contentType,
                watchDuration,
                totalDuration,
            };
        } else {
            payload = {
                uniqueId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                id,
                contentType,
                watchDuration,
                totalDuration
            };
        }
        return {
            url: `${CONSTANT.API_BASE_URL}${BROWSE_PATH}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: getContinueWatchingHeader(),
        };
    },

    fetchBrowseByRailData: (browseBy) => {
        return {
            url: `https://tatasky-uat-kong-proxy.videoready.tv/cms-api/api/get/details?intent=${browseBy}`,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...getCommonHeaders(),
            },
        };
    },
    getVootokenapi: (param) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.VOOT_TOKEN_URL}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
            },
            data: param,
        };
    },

    fetchBrowsingFilters: (browseBy, id, languageList = false) => {
        let headers = {
            rule: "BA",
            locale: "IND",
            deviceId: getDeviceId(),
            anonymousId: id,
            ...getCommonHeaders()
        };

        let updatedUrl = languageList ? `${getBaseUrl()}homescreen-client/pub/api/v3/search/${browseBy}?platform=BINGE` :
            `${getBaseUrl()}${url.GET_GENRE_LANGUAGE}?type=${browseBy}`;
        return {
            url: updatedUrl,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...(languageList && headers),
            },
            isAPIPrimary: true,
        };
    },

    fetchSearchData: (data) => {
        console.log("in fetchSearchData", data)
        let { accessToken } =
            JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}${url.SEARCH_CONTENT}`,
            method: REQUEST_METHOD.POST,
            data: data,
            isAPIPrimary: false,
            headers: {
                ...getCommonHeaders(accessToken)
            }
        };
    },

    fetchSearchAutosuggestedData: (data) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let { accessToken, subscriptionType, dthStatus } = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const header = {
            anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            profileId: userInfo.profileId,
            deviceToken: userInfo.deviceToken,
            subscriberId: userInfo.sId,
            authorization: `bearer ${accessToken}`,
            subscriptionType: subscriptionType,
            dthStatus: dthStatus,
        }
        const headerVal = isUserloggedIn() ? header : {anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),}
        return {
            url: `${CONSTANT.API_BASE_URL}${url.SEARCH_AUTOSUGGESTED}?queryString=${data?.val}`,
            method: REQUEST_METHOD.GET,
            data: data,
            isAPIPrimary: false,
            headers: headerVal
        };
    },

    fetchTrendingData: (data) => {
        let { accessToken } =
            JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}${url.TRENDING_TITLES}`,
            method: REQUEST_METHOD.POST,
            data: data,
            isAPIPrimary: false,
            headers: {
                ...getCommonHeaders(accessToken)
            }
        }
    },

    fetchSearchLandingData: (data) => {
        let { accessToken } =
            JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}homescreen-client/pub/api/v3/search/landing?platform=BINGE`,
            method: REQUEST_METHOD.GET,
            isAPIPrimary: false,
            headers: {
                ...getCommonHeaders(accessToken)
            }
        }
    },

    fetchPISearchData: (data) => {
        let { accessToken } =
            JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/episode/data`,
            method: REQUEST_METHOD.POST,
            data: data,
            isAPIPrimary: false,
            headers: {
                ...getCommonHeaders(accessToken)
            }
        }
    },

    packListingData: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let silentLoginPlatform = getKey(LOCALSTORAGE.SILENT_LOGIN_PLATFORM) || '';
        const { baId, sId } = getParamsAPICall();
        return {
          url: `${getBaseUrl()}${url.PACK_LISTING_URL}${baId}`,
          method: REQUEST_METHOD.GET,
          headers: {
            subscriptionType: get(userInfo, "subscriptionType"),
            platform: isMobile.any() ? ( silentLoginPlatform === SILENT_LOGIN_PLATFORM.BINGE_OPEN_FS ? silentLoginPlatform : HEADER_CONSTANTS.BINGE_WEB_SMALL): HEADER_CONSTANTS.WEB,
            "x-authenticated-userid": sId,
            locale: "en",
            ...getCommonHeaders(),
          },
          isAPIPrimary: true,
        };
    },


    tenureAccountBal: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        delete payload['source']
        const { updatedPackId, currentPackId } = payload;
        return {
            url: `${getBaseUrl()}${url.GET_TENURE_BAL}`,
            method: REQUEST_METHOD.POST,
            headers: {
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.WEB,
                ...getCommonHeaders()
            },
            data: {
                accountId: get(userInfo, 'sId'),
                baId: get(userInfo, 'baId'),
                updatedPackId,
                currentPackId,
                subscriptionType: get(userInfo, 'subscriptionType'),
            },
            isAPIPrimary: true,
        };
    },

    validateSelectedPack: (payload) => {
        const { baId } = getParamsAPICall();
        let tenureId = payload?.tenureId ? payload?.tenureId : payload;

        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v1/pack/validation/${baId}/${tenureId}`,
            method: REQUEST_METHOD.GET,
            headers: {
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.WEB,
                'content-type': 'application/json',
                offerId: payload?.offerId,
                ...getCommonHeaders()
            },
            isAPIPrimary: true,
        };
    },

    getBalanceInfo: (packId, amount) => {
        const { authorization, baId, sId } = getParamsAPICall();
        return {
            url: `${getBaseUrl()}${url.GET_BALANCE}`,
            method: REQUEST_METHOD.POST,
            data: {
                baId: baId,
                upgradePackId: packId,
                proratedAmount: amount,
            },
            headers: {
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                "x-authenticated-userid": sId,
                locale: "en",
                ...getCommonHeaders()
            },
            isAPIPrimary: false,
        };
    },

    createSubscription: (packId) => {
        const { baId, sId } = getParamsAPICall();
        return {
            url: `${getBaseUrl()}${url.CREATE_SUBSCRIPTION}`,
            method: REQUEST_METHOD.POST,
            data: {
                baId: baId,
                packId: packId,
                sid: sId,
            },
            headers: {
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.BINGE_ANYWHERE,
                "x-authenticated-userid": sId,
                locale: "en",
                ...getCommonHeaders()
            },
            isAPIPrimary: true,
        };
    },

    modifySubscription: (payload) => {
        let source = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY);
        let silentLoginPlatform = getKey(LOCALSTORAGE.SILENT_LOGIN_PLATFORM) || '';
        return {
            url: `${getBaseUrl()}${url.MODIFY_SUBSCRIPTION}`,
            method: REQUEST_METHOD.POST,
            data: { ...payload, appflyerId: appsFlyerConfig.getAppsFlyerId() },
            headers: {
                platform: isMobile.any()
                    ? (silentLoginPlatform === SILENT_LOGIN_PLATFORM.BINGE_OPEN_FS ? silentLoginPlatform : HEADER_CONSTANTS.BINGE_WEB_SMALL)
                    : HEADER_CONSTANTS.WEB,
                deviceId: getDeviceId(),
                source,
                ...getCommonHeaders(),
            },
            isAPIPrimary: true,
        };
    },

    addSubscription: (payload) => {
        let source = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY);
        let silentLoginPlatform = getKey(LOCALSTORAGE.SILENT_LOGIN_PLATFORM) || '';
        return {
            url: `${getBaseUrl()}${url.ADD_SUBSCRIPTION}`,
            method: REQUEST_METHOD.POST,
            data: { ...payload, appflyerId: appsFlyerConfig.getAppsFlyerId() },
            headers: {
                platform: isMobile.any()
                    ? (silentLoginPlatform === SILENT_LOGIN_PLATFORM.BINGE_OPEN_FS ? silentLoginPlatform : HEADER_CONSTANTS.BINGE_WEB_SMALL)
                    : HEADER_CONSTANTS.WEB,
                deviceId: getDeviceId(),
                source,
                ...getCommonHeaders()
            },
            isAPIPrimary: true,
        };
    },

    getCurrentSubscriptionInfo: (apiPrimary) => {
        const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let state = store.getState(),
            userAuthenticateToken = get(state.loginReducer, 'existingUser.data.userAuthenticateToken');

        return {
            url: `${getBaseUrl()}${CONSTANT.CURRENT_SUBSCRIPTION}`,
            method: REQUEST_METHOD.POST,
            data: {
                baId: user_info?.baId,
                dthStatus: user_info?.dthStatus,
                accountId: user_info?.sId,
                isTickTick: true
            },
            headers: {
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                deviceId: getDeviceId(),
                deviceName: "Web",
                deviceType: DEVICE_TYPE_HEADER.WEB,
                deviceToken: user_info?.deviceToken,
                locale: "en",
                platform: HEADER_CONSTANTS.WEB,
                profileId: user_info?.profileId,
                "x-authenticated-userid": user_info?.sId,
                freemiumUser: user_info?.freemiumUser,
                ...getCommonHeaders(`bearer ${userAuthenticateToken ? userAuthenticateToken : user_info?.accessToken}`)
            },
        };
    },

    paymentThroughTSWallet: (payload) => {
        const { authorization, sId } = getParamsAPICall();
        const userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));

        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v1/post/charge/request`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.WEB,
                authorization,
                locale: "en",
                deviceType: DEVICE_TYPE_HEADER.WEB,
                deviceId: getDeviceId(),
                deviceName: "Web",
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                subscriberId: sId,
                profileId: userInfo.profileId,
                dthStatus: userInfo?.dthStatus,
                deviceToken: userInfo.deviceToken,
                offerId: payload?.offerId,
            },
            isAPIPrimary: true,
        };
    },

    getOpelResponse: (param) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v1/payment/status`,
            method: REQUEST_METHOD.POST,
            headers: {
                sourceApp: CONSTANT.SOURCE_APP,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
            },
            data: param,
            isAPIPrimary: true,
        };

    },

    reactivateSubscription: (packId) => {
        const { authorization, baId, sId } = getParamsAPICall();
        return {
            url: `${getBaseUrl()}${CONSTANT.REACTIVATE_SUBSCRIPTION}`,
            method: REQUEST_METHOD.POST,
            data: {
                baId: baId,
                sid: sId,
                packId: packId,
            },
            headers: {
                authorization: authorization,
                locale: "en",
                subscriberId: sId,
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.WEB,
            },
            isAPIPrimary: true,
        };
    },

    quickRecharge: (mbr, sIdExist) => {
        let { authorization, sId, dthStatus } = getParamsAPICall();
        if (!authorization) {
            const state = store.getState();
            authorization = get(
                state.bingeLoginDetails.codeValidated,
                "data.userAuthenticateToken",
            );
        }
        return {
            url: `${getBaseUrl()}${CONSTANT.QUICK_RECHARGE}${sIdExist ? sIdExist : sId}/recharge/${mbr}/amount`,
            method: REQUEST_METHOD.GET,
            data: {
                sid: sIdExist ? sIdExist : sId,
            },
            headers: {
                authorization: authorization,
                locale: "en",
                subscriberId: sIdExist ? sIdExist : sId,
                "x-authenticated-userid": authorization,
                dthStatus
            },
            isAPIPrimary: true,
        };
    },

    dunningRecharge: (sIdExist, baIdExist) => {
        let { authorization, sId, baId } = getParamsAPICall();
        if (!authorization) {
            const state = store.getState();
            authorization = get(
                state.bingeLoginDetails.codeValidated,
                "data.userAuthenticateToken",
            );
        }
        return {
            url: `${getBaseUrl()}${CONSTANT.QUICK_RECHARGE}${sIdExist ? sIdExist : sId
                }/recharge/notification?baId=${baIdExist ? baIdExist : baId}`,
            method: REQUEST_METHOD.POST,
            headers: {
                authorization: authorization,
                locale: "en",
                subscriberId: sIdExist ? sIdExist : sId,
            },
        };
    },

    quickRechargeBeforeLogin: (sIdExist) => {
        let { authorization, sId } = getParamsAPICall();
        if (!authorization) {
            const state = store.getState();
            authorization = get(
                state.bingeLoginDetails.codeValidated,
                "data.userAuthenticateToken",
            );
        }
        return {
            url: `${getBaseUrl()}${CONSTANT.QUICK_RECHARGE}${sIdExist ? sIdExist : sId
                }/recharge/`,
            method: REQUEST_METHOD.GET,
            headers: {
                authorization: authorization,
                locale: "en",
            },
        };
    },

    cancelSubscription: (payload) => {
        const userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${url.CANCEL_SUBSCRIPTION}`,
            method: REQUEST_METHOD.POST,
            headers: {
                profileId: userInfo.profileId,
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                deviceType: DEVICE_TYPE_HEADER.WEB,
                deviceName: "Web",
                deviceId: getDeviceId(),
                deviceToken: userInfo.deviceToken,
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.WEB,
                ...getCommonHeaders()
            },
            data: payload,
            isAPIPrimary: true,
        };
    },

    getUpgradeTransitionDetails: (basePackId) => {
        let { baId, accessToken, sId } =
            JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.UPGRADE_TRANSITION_DETAILS}`,
            method: REQUEST_METHOD.POST,
            headers: {
                authorization: accessToken,
                locale: "en",
                "x-authenticated-userid": sId,
            },
            data: {
                basePackId: basePackId,
                subscriberId: sId,
                baId: baId,
            },
            isAPIPrimary: true,
        };
    },

    resumeSubscription: () => {
        const { authorization, baId, sId } = getParamsAPICall();

        return {
            url: `${getBaseUrl()}${CONSTANT.RESUME_SUBSCRIPTION}${baId}`,
            method: REQUEST_METHOD.POST,
            headers: {
                authorization,
                locale: "en",
                "x-authenticated-userid": baId,
                subscriberId: sId,
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.BINGE_ANYWHERE,
            },
            isAPIPrimary: true,
        };
    },

    getAccountDetailsFromRmn: (rmn) => {
        const state = store.getState();
        let authorizationToken = get(
            state.bingeLoginDetails.codeValidated,
            "data.userAuthenticateToken",
        );
        return {
            /*isMobile.any() ? `${getBaseUrl()}${CONSTANT.ACCOUNT_DETAILS_URL}/rmn/${rmn}` :*/
            url: `${getBaseUrl()}${CONSTANT.ACCOUNT_DETAILS_WEB_LARGE_URL}/rmn/${rmn}`,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "en",
                authorization: authorizationToken,
                platform: HEADER_CONSTANTS.WEB,
                deviceType: DEVICE_TYPE_HEADER.WEB,
            },
            isAPIPrimary: true,
        };
    },

    getAccountDetailsFromSid: (subId) => {
        const state = store.getState();
        let authorizationToken = get(
            state.bingeLoginDetails.codeValidated,
            "data.userAuthenticateToken",
        );
        const { authorization } = getParamsAPICall();
        return {
            /*isMobile.any() ? `${getBaseUrl()}${CONSTANT.ACCOUNT_DETAILS_URL}/sid/${subId}` :*/
            url: `${getBaseUrl()}${CONSTANT.ACCOUNT_DETAILS_WEB_LARGE_URL}/sid/${subId}`,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "en",
                authorization: isUserloggedIn() ? authorization : authorizationToken,
                platform: HEADER_CONSTANTS.WEB,
                deviceType: DEVICE_TYPE_HEADER.WEB,
            },
            isAPIPrimary: true,
        };
    },

    createBingeUser: (payload) => {
        const state = store.getState();
        let token = get(state.bingeLoginDetails.codeValidated, "data");
        return {
            url: `${getBaseUrl()}${CONSTANT.CREATE_USER}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                locale: "en",
                deviceId: getDeviceId(),
                deviceName: "Web",
                platform: HEADER_CONSTANTS.WEB,
                authorization: token.userAuthenticateToken,
                deviceToken: token.deviceAuthenticateToken,
            },
            isAPIPrimary: true,
        };
    },

    loginExistingUser: (payload) => {
        const state = store.getState();
        let token = get(state.bingeLoginDetails.codeValidated, "data");
        let wsToken = get(
            state.bingeLoginDetails.validateWebSmallUrlResponse,
            "data",
        );
        return {
            url: `${getBaseUrl()}${CONSTANT.LOGIN_ACCOUNT}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                locale: "en",
                deviceId: getDeviceId(),
                deviceName: "Web",
                platform: isMobile.any()
                    ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                    : HEADER_CONSTANTS.WEB,
                authorization: wsToken
                    ? wsToken.userAuthenticateToken
                    : token.userAuthenticateToken,
                deviceToken: wsToken
                    ? wsToken.deviceAuthenticateToken
                    : token.deviceAuthenticateToken,
            },
            isAPIPrimary: true,
        };
    },

    fetchTVODContent: (offset, max, seeAll) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.TVOD_URL}${userInfo.sId
                }?offset=${offset}&max=${max}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: seeAll,
            cache: true,
        };
    },

    setLA: (data) => {
        const base = `${data.learnActionType}/${data.contentType}/${data.id}/VOD`;
        const urlVar = isUserloggedIn() ? `${CONSTANT.TA_LA_RECOMMENDATION}` : `${CONSTANT.TA_LA_RECOMMENDATION_GUEST}`;
        const refUseCase = `?refUsecase=${get(data, 'refUseCase', '')}`;
        return {
            url: `${CONSTANT.API_BASE_URL}${urlVar}${base}${refUseCase}`,
            method: REQUEST_METHOD.POST,
            data: {},
            headers: {
                provider: data.provider,
                ...getTARecommendationHeader(),
            },
        };
    },

    createWo: (param) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.CREATE_WO}?baId=${userInfo.baId}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
                locale: "en",
            },
            data: param,
        };
    },

    getSubscriberAddress: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/subscriber/profile/address`,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "en",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    getSlot: (param) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/get/slot`,
            method: REQUEST_METHOD.POST,
            headers: {
                locale: "en",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            data: param,
        };
    },
    campaign: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v1/fetch/subscriber/${userInfo.baId}/campaign`,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "en",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)

            },
        };
    },

    confirmSlot: (param) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v2/confirm/slot`,
            method: REQUEST_METHOD.POST,
            headers: {
                locale: "en",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            data: param,
        };
    },

    validateFSWebSmallUrl: (token) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let source = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY);
        return {
            url: `${getBaseUrl()}binge-mobile-services/pub/api/v3/validate/token`,
            method: REQUEST_METHOD.GET,
            headers: {
                locale: "en",
                source: getKey(LOCALSTORAGE.PAYMENT_SOURCE_PARAM),
                deviceId: getDeviceId(),
                subscriberToken: token,
                platform: HEADER_CONSTANTS.BINGE_WEB_SMALL,
                source,
                deviceId: getDeviceId(),
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    validateWebSmallUrl: (wsUrl) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}tnap/pub/api/v1/validate/ws/url`,
            method: REQUEST_METHOD.POST,
            headers: {
                locale: "en",
                wsUrl: `${getEnvironmentConstants().ENV_CALLBACK_URL}${encodeURI(wsUrl)}`,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    getFAQ: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/pub/api/v2/help/tsmore`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        };
    },

    fetchTAHeroBanner: (max, layout, data) => {
        return {
            url: `${getTARecommendationBaseURL()}${data.placeHolder}?max=${max}&layout=${layout}`,
            method: REQUEST_METHOD.POST,
            data: {},
            headers: {
                ...getTARecommendationHeader(),
                pageType: data.pageType,
            },
            cache: true,
        };
    },

    getTARecommendationRail: (data, seeAll) => {
        return {
            url: `${getTARecommendationBaseURL()}${data.placeholder
                }?contentType=${data.contentType}&showType=VOD&id=${data.id}&layout=${data.layout
                }&provider=${data.provider}&max=${data.max}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getTARecommendationHeader(),
            },
            isAPIPrimary: seeAll,
        };
    },

    fetchTARailData: (
        max,
        layout,
        placeHolder,
        seeAll,
        isPartnerPage = false,
        provider = "",
    ) => {
        let headers = getTARecommendationHeader();
        if (isPartnerPage) {
            headers.subPage = provider;
        }
        return {
            url: `${getTARecommendationBaseURL()}${placeHolder}?max=${max}&layout=${layout}`,
            method: REQUEST_METHOD.POST,
            data: {},
            headers: headers,
            isAPIPrimary: seeAll,
            cache: true,
        };
    },


    getGenreInfo: () => {
        return {
            url: `${getTARecommendationBaseURL()}genre/UC_GET_GENRE_PROFILE_1?layout=LANDSCAPE`,
            method: REQUEST_METHOD.POST,
            data: {},
            headers: getTARecommendationHeader(),
        };
    },

    /**
     * @function getTARecommendedFilterOrder - Get Sequence of filter on genre and lang from TA recommendation
     */
    getTARecommendedFilterOrder: (payload) => {
        let BROWSE_PATH = payload?.browseByType?.toLowerCase() === BROWSE_TYPE.LANGUAGE.toLowerCase()
            ? `language/UC_PL?layout=${payload?.layout}`
            : `genre/UC_GET_GENRE_PROFILE_1?layout=${payload?.layout}`
        return {
            url: `${getTARecommendationBaseURL()}${BROWSE_PATH}`,
            method: REQUEST_METHOD.POST,
            data: {},
            headers: getTARecommendationHeader(),
            cache: false,
        };
    },

    /**
     *
     * @param payload
     * @returns {{headers: (*|{authorization: *, dthStatus: *, baId: null, profileId: *, bingeProduct: *, subscriberId: *, platform: string}), method: string, data: {}, url: string}}
     */
    getTARecommendedSearchData: (payload) => {
        let { langFilters: filterLanguage, genreFilter: subGenre, layout, max, freeToggle } = payload, BROWSE_PATH, placeHolder;
        let headers = getTARecommendationHeader();
        filterLanguage ? headers['filterLanguage'] = filterLanguage : null;
        subGenre ? headers['subGenre'] = subGenre : null;
        headers['freeToggle'] = !!freeToggle;
        if (!isEmpty(subGenre) && isEmpty(filterLanguage)) {
            placeHolder = getLanguageGenreAPISource("UC_BBG");
            BROWSE_PATH = `${placeHolder}?layout=${layout}&max=${max}`;
        } else {
            placeHolder = getLanguageGenreAPISource("UC_BBL");
            BROWSE_PATH = `${placeHolder}?layout=${layout}&max=${max}`;
        }

        return {
            url: `${getTARecommendationBaseURL()}${BROWSE_PATH}`,
            method: REQUEST_METHOD.POST,
            data: {},
            headers,
            cache: true,
        };
    },

    setPaymentStatus: (status, txn) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.PAYMENT_URL}?status=${status}&txn=${txn}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        };
    },


    generateToken: (body) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.TOKEN_URL}`,
            method: REQUEST_METHOD.POST,
            data: body,
            headers: {
                "x-app-id": "123456",
                "x-app-key": "123456",
                "x-subscriber-id": userInfo.sId,
                "x-subscriber-name": "Riaz",
                "x-device-id": getDeviceId(),
                "x-device-type": "WEB",
                "x-device-platform": "PC",
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE_WEB,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: true,
        };
    },

    resendLicenseChallenge: (url, body, header) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: url,
            method: REQUEST_METHOD.POST,
            data: body,
            responseType: "text",
            headers: {
                header,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        };
    },

    viewCountLearnAction: (contentType, id) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.VIEW_COUNT}`,
            method: REQUEST_METHOD.POST,
            data: {
                contentType: contentType,
                id: id,
                subscriberId: userInfo.sId,
                profileId: userInfo.profileId,
            },
            headers: {
                platform: "dongle",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },
    getAppInstallDetails: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/pub/api/v1/app/install/link`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        };
    },

    getTVODExpiry: (id) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}content-detail/api/v1/tvod/digital/playback/expiry/${id}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },
    getPlanetMarathiUrl: (contentId) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_PALNET_MARATHI_URL}`,
            method: REQUEST_METHOD.POST,
            headers: {
                contentType: 'application/json',
                providerContentId: `${contentId}`,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    getChaupalUrl: (id, contentType, contentId) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_CHAUPAL_ENDPOINT}${contentId}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
                contentType: contentType,
            },
        };
    },

    getLionsGatePlaybackData: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_LIONSGATE_URL}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
            },

        };
    },

    fetchPubnubHistory: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let pubnubSubKey = getEnvironmentConstants().PUBNUB.SUBSCRIBE_KEY;
        return {
            url: `https://ps.pndsn.com/v2/history/sub-key/${pubnubSubKey}/channel/rmn_${userInfo.rmn}?count=1`,
        };
    },

    //Generate Anonymous Id at the time of Application Launch
    getAnonymousId: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GENERATE_ANONYMOUS_ID}`,
            method: REQUEST_METHOD.POST,
            headers: {
                deviceId: getDeviceId(),
                locale: "en",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: true,
        };
    },

    //Check Free Content Playback Eligibility on free content play for Guest User
    checkPlaybackEligibility: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.CHECK_PLAYBACK_ELIGIBILITY}`,
            method: REQUEST_METHOD.POST,
            headers: {
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                deviceId: getDeviceId(),
                locale: "en",
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: false,
        };
    },

    //To display List of Mobile Numbers login previously by user on same device at the time of login
    getDevicePhoneNumbers: (id) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_PHONE_NUMBERS_FOR_DEVICE}`,
            method: REQUEST_METHOD.GET,
            headers: {
                anonymousId: id,
                deviceId: getDeviceId(),
                locale: "en",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: false,
        };
    },

    //Logged In And Guest User- Save Parental Lock Pin
    saveParentalLockPin: (params) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.SAVE_PARENTAL_LOCK_URL}`,
            method: REQUEST_METHOD.POST,
            data: params,
            headers: {
                locale: "en",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: false,
        };
    },

    // Login View: Create Binge Mobile User
    createNewBingeUser: (payload, params, registerWebSmall = false) => {
        const state = store.getState();
        let token = get(state.loginReducer.otpResponse, 'data');
        let ip = get(state.loginReducer, 'clientIP.ip', '');
        delete payload?.source;

        const { webSmallPaymentRouteKey, webSmallRouteToken } = getWebSmallRouteValues();

        let headers = {
            locale: 'en',
            anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            deviceId: getDeviceId(),
            platform: registerWebSmall
                ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                : HEADER_CONSTANTS.WEB,
            authorization: `bearer ${params?.userAuthenticateToken ? params?.userAuthenticateToken : token.userAuthenticateToken}`,
            deviceToken: params?.deviceAuthenticateToken ? params?.deviceAuthenticateToken : token.deviceAuthenticateToken,
            deviceName: 'Web',
            ip: ip,
            source: getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY),
            ...(webSmallPaymentRouteKey && {temporaryId: webSmallRouteToken}),
        };

        return {
            url: `${getBaseUrl()}${CONSTANT.CREATE_NEW_USER}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers,
            isAPIPrimary: true,
        };
    },

    //Login View: Update Binge Mobile User
    updateBingeUser: (payload, params, registerWebSmall = false) => {
        const state = store.getState();
        let token = get(state.loginReducer.otpResponse, 'data');
        const { webSmallPaymentRouteKey, webSmallRouteToken } = getWebSmallRouteValues();

        let headers = {
            locale: 'en',
            anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            authorization: `bearer ${params?.userAuthenticateToken ? params?.userAuthenticateToken : token?.userAuthenticateToken}`,
            deviceToken: params?.deviceAuthenticateToken ? params?.deviceAuthenticateToken : token?.deviceAuthenticateToken,
            deviceId: getDeviceId(),
            platform: registerWebSmall
                ? HEADER_CONSTANTS.BINGE_WEB_SMALL
                : HEADER_CONSTANTS.WEB,
            deviceName: 'Web',
            source: getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY),
            ...(webSmallPaymentRouteKey && {temporaryId: webSmallRouteToken}),
        }

        return {
            url: `${getBaseUrl()}${CONSTANT.UPDATE_BINGE_USER}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers ,
            isAPIPrimary: true,
        };
    },

    //Guest and Login User : Save preferred Languages
    savePreferredLanguages: (payload, id) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.SAVE_PREFERRED_LANGUAGES}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                locale: "en",
                anonymousId: id,
                deviceId: getDeviceId(),
                rule: "BA",
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: false,
        };
    },

    getLanguageSelectedListing: (header, body) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_USER_PREFERRED_LANGUAGES}`,
            method: REQUEST_METHOD.POST,
            data: body,
            headers: {
                locale: 'en',
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: false,
        }
    },

    trackShemarooAnalytics: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}tnap/thirdparty/watch/shemaroo/analytics`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    setEpiconDocubayAnalyticsData: (providerName, deviceId, data) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}partner-content-analytics/${providerName.toLowerCase()}/analytics`,
            method: REQUEST_METHOD.POST,
            headers: {
                "Device-ID": deviceId,
                platform: "BINGE_ANYWHERE",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            data: data,
        };
    },
    setLionsgateAnalyticsData: (data) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_LIONSGATE_ANALYTICS}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            data: data,
        };
    },

    getCategoriesListData: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}homescreen-client/pub/api/v3/categoriesPage/BINGE_ANYWHERE`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    getHelpCenterTrendingList: (type, limit, offset, visibleTo) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const queryString = `?type=${type}&limit=${limit}&offset=${offset}&visibleTo=${visibleTo}`;
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/help/center/trending${queryString}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        }
    },

    getHelpCenterCategoryList: (type, limit, offset, visibleTo) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const queryString = `?type=${type}&limit=${limit}&offset=${offset}&visibleTo=${visibleTo}`
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/help/center/group-category${queryString}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        }
    },

    getSearchResult: (params) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const queryString = `?id=${params.id}&type=${params.type}&limit=${params.limit}&offset=${params.offset}&visibleTo=${params.visibleTo}`
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/help/center/pi-page${queryString}`,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        }
    },

    getSearchAutoComplete: (params) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const queryString = `?queryString=${params.searchValue}&visibleTo=${params.userType}`
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/help/center/auto-complete${queryString}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        }
    },

    getHelpCenterCategoryDetail: (params) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        //const queryString = `?category=${params.category}&subCategories=${params.subCategories}&limit=${params.limit}&offset=${params.offset}&visibleTo=${params.visibleTo}`
        const queryString = `?category=${params.category}&limit=${params.limit}&offset=${params.offset}&visibleTo=${params.visibleTo}`
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/help/center/v2/category-pi-page${queryString}`,
            method: REQUEST_METHOD.GET,
            headers: {
                'accept': 'application/json, text/plain',
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        }
    },
    getHCChatNowApiResponse: (chatbotType, queryParams) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: (chatbotType === CHATBOT_TYPE.S360) ?
                `${getBaseUrl()}binge-mobile-services/pub/api/v3/help-center/dth/chatbot?subId=${userInfo.sId}` :
                `${getBaseUrl()}binge-mobile-services/pub${CONSTANT.HC_VERSION_URL}/chatbot?${queryParams}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        };
    },

    getHCViewMoredata: (params) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const query = `&limit=${params.limit}&offset=${params.offset}`
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/help/center/see-all?${params.apiBaseUrl}${query}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        }
    },

    getOutageBannerData: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.API_BASE_URL}search-connector/freemium/help/center/outage-banner`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        }
    },

    validateHelpCenterUrl: (token) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/pub/api/v3/helpCenter/validate/token`,
            method: REQUEST_METHOD.GET,
            headers: {
                subscriberToken: `${token}`,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        }
    },
    helpCenterPopularityTrack: (item) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let params = {
            "subscriberId": userInfo?.sId,
            "type": item?.type,
            "id": item?.id,
        }
        return {
            url: `${getBaseUrl()}event-consumer/api/v1/faq/popularity/events`,
            method: REQUEST_METHOD.POST,
            headers: {
                'content-type': 'application/json',
                ...getCommonHeaders()
            },
            data: params,
        }
    },
    getPaymentDetails: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/pg/customer/initiate/payload`,
            method: REQUEST_METHOD.GET,
            data: {},
            headers: {
                rmn: userInfo.rmn,
                locale: "GBR",
                rule: "BA",
                customerEmail: "Vikram@gmail.com",
                customerId: userInfo.sId,
                deviceId: getDeviceId(),
                deviceType: DEVICE_TYPE_HEADER.WEB,
                deviceName: DEVICE_TYPE_HEADER.WEB,
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                profileId: userInfo.profileId,
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                deviceToken: userInfo.deviceToken,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: true,
        };
    },
    getTicket: (data) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        return {
            url: `${getBaseUrl()}binge-mobile-services${CONSTANT.HC_VERSION_URL}/tickets?limit=${data?.limit || 6
                }&offset=${data?.offset || 0}&subscriberId=${userInfo.bingeSubscriberId}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(),
                "content-type": "application/json",
            },
        };
    },

    getTicketDetails: (id) => {
        return {
            url: `${getBaseUrl()}binge-mobile-services${CONSTANT.HC_VERSION_URL}/tickets?limit=10&offset=0&ticketId=${id}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(),
                "content-type": "application/json",
            },
        };
    },
    postReopenTicket: (payload) => {
        return {
            url: `${getBaseUrl()}/binge-mobile-services/admin/v3/help-center/reOpen/ticket`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                "securityKey": '2a409c4e-34f0-11ed-a261-0242ac120002',
                "x-admin-key": "RDYAaiWyV0yxJMeDQ7XROudRz6vWmRIt",
                "Content-Type": 'application/json',
                ...getCommonHeaders(),
            },
        };
    },

    refreshAccount: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.ACCOUNT_REFRESH}`,
            method: REQUEST_METHOD.POST,
            headers: {
                baId: userInfo.baId,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
                rmn: userInfo.rmn,
                rule: "BA",
                customerEmail: userInfo.email,
                customerId: userInfo.sId,
                deviceId: getDeviceId(),
                deviceType: DEVICE_TYPE_HEADER.WEB,
                deviceName: DEVICE_TYPE_HEADER.WEB,
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                profileId: userInfo.profileId,
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                deviceToken: userInfo.deviceToken,
            },
            isAPIPrimary: true
        };
    },

    refreshAccountOldStack: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.ACCOUNT_REFRESH_OLD_STACK}/subscriber/${userInfo.sId}/account`,
            method: REQUEST_METHOD.PUT,
            headers: {
                locale: "en",
                authorization: userInfo.accessToken,
            },
            isAPIPrimary: true
        };
    },

    getClientIP: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${CONSTANT.GET_CLIENT_IP}`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            }
        };
    },

    getInvoicePDF: (baId, accessToken, invoiceNumber, subscriberId) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.TRANSACTION_INVOICE_DOWNLOAD}`,
            method: REQUEST_METHOD.POST,
            headers: {
                locale: "en",
                baId: baId,
                ...getCommonHeaders(accessToken, subscriberId),
            },
            data: {
                invoiceNo: invoiceNumber,
            },
            isAPIPrimary: false,
        };
    },

    getSonyToken: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        return {
            url: `${getBaseUrl()}${CONSTANT.GET_SONY_TOKEN}`,
            method: REQUEST_METHOD.GET,
            headers: {
                rule: 'BA',
                deviceId: getDeviceId(),
                deviceType: DEVICE_TYPE_HEADER.WEB,
                deviceName: DEVICE_TYPE_HEADER.WEB,
                profileId: userInfo.profileId,
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                deviceToken: userInfo.deviceToken,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
        }
    },
    getNotLoggedInPack: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        return {
            url: `${getBaseUrl()}binge-mobile-services/pub/api/v3/subscription/packs`,
            method: REQUEST_METHOD.GET,
            headers: {
                rule: "BA",
                deviceId: getDeviceId(),
                deviceType: DEVICE_TYPE_HEADER.WEB,
                deviceName: DEVICE_TYPE_HEADER.WEB,
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                deviceToken: userInfo.deviceToken,
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`)
            },
            isAPIPrimary: true,
        };
    },

    fetchMixpanelId: (referenceId) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        return {
            url: `${getBaseUrl()}${CONSTANT.GET_MIXPANEL_ID}`,
            method: REQUEST_METHOD.POST,
            headers: {
                "Content-Type": "application/json",
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
                referenceId: referenceId || userInfo.referenceId
            },
            data: {
                subscriberId: userInfo.sId,
                referenceId: userInfo.referenceId
            }
        }
    },

    forceLogout: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v3/migrate/user`,
            method: REQUEST_METHOD.GET,
            headers: {
                ...getCommonHeaders(),
                baId: userInfo?.baId,
                deviceId: getDeviceId(),
            },
            isAPIPrimary: true,
        };
    },

    getWebPortalLink: (requestHeaders = {}, isCampaign) => {
        const state = store.getState();
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let subscriptionType = get(state?.packSelectionDetail, 'currentSubscription.data.subscriptionType');
        return {
          url: `${getBaseUrl()}binge-mobile-services/pub/api/v1/account/access/info`,
          method: REQUEST_METHOD.GET,
          headers: {
            anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            baId: userInfo?.baId || "",
            deviceId: getDeviceId(),
            mixpanelId:
              userInfo.mixpanelId || getKey(LOCALSTORAGE.MIXPANEL_DISTINCT_ID),
            //platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
            platform: MIXPANEL.VALUE.WEB,
            rmn: userInfo?.rmn || "",
            subscriptionType: subscriptionType || "",
            returnUrl: returnUrlTickTick(isCampaign),
            appsflyerId: appsFlyerConfig.getAppsFlyerId(),
            deviceType: DEVICE_TYPE_HEADER.WEB,
            sourceApp: CONSTANT.SOURCE_APP,
            ...requestHeaders,
          },
          isAPIPrimary: true,
        };
    },

    // on pressing back button
    getWebPortalBackLink: (cartId) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        return {
          url: `${getBaseUrl()}/binge-mobile-services/pub/api/v1/subscription/refresh/token`,
          method: REQUEST_METHOD.GET,
          headers: {
            anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            baId: userInfo?.baId || "",
            deviceId: getDeviceId(),
            mixpanelId:
              userInfo.mixpanelId || getKey(LOCALSTORAGE.MIXPANEL_DISTINCT_ID),
            // platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
            platform: MIXPANEL.VALUE.WEB,
            returnUrl: returnUrlTickTick(),
            journeySource: getKey(LOCALSTORAGE.JOURNEY_SOURCE),
            journeySourceRefId: getKey(LOCALSTORAGE.JOURNEY_SOURCE_REF_ID),
            cartId,
            analyticSource: MIXPANEL.VALUE.TICK_TICK_APP_LAUNCH,
            appsflyerId: appsFlyerConfig.getAppsFlyerId(),
            deviceType: DEVICE_TYPE_HEADER.WEB,
            sourceApp: CONSTANT.SOURCE_APP,
          },
          isAPIPrimary: true,
        };
    },

    getPlanSummaryUrl: (cartId) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
          url: `${getBaseUrl()}binge-mobile-services/api/v1/subscription/plan/summary?pgScreen=1`,
          method: REQUEST_METHOD.GET,
          headers: {
            anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
            baId: userInfo?.baId,
            deviceId: getDeviceId(),
            mixpanelId:
              userInfo.mixpanelId || getKey(LOCALSTORAGE.MIXPANEL_DISTINCT_ID),
            //  platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
            platform: MIXPANEL.VALUE.WEB,
            journeySource: getKey(LOCALSTORAGE.JOURNEY_SOURCE),
            journeySourceRefId:
              getKey(LOCALSTORAGE.JOURNEY_SOURCE_REF_ID) || "",
            authorization: userInfo?.accessToken,
            cartId: cartId,
            returnUrl: returnUrlTickTick(),
            appsflyerId: appsFlyerConfig.getAppsFlyerId(),
            deviceType: DEVICE_TYPE_HEADER.WEB,
            sourceApp: CONSTANT.SOURCE_APP,
          },
          isAPIPrimary: true,
        };
    },

    trackPlanetMarathiAnalytics: (payload) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.PLANET_MARATHI_ANALYTICS}`,
            method: REQUEST_METHOD.POST,
            data: payload,
            headers: {
                ...getCommonHeaders(),
            },
            isAPIPrimary: false,
        }
    },

    migrateUserInfo: (requestHeaders = {}) => {
        return {
            url: `${getBaseUrl()}${CONSTANT.MIGRATE_USER_INFO}`,
            method: REQUEST_METHOD.GET,
            headers: {
                anonymousId: getKey(LOCALSTORAGE.ANONYMOUS_ID),
                deviceId: getDeviceId(),
                platform: HEADER_CONSTANTS.BINGE_ANYWHERE,
                ...requestHeaders,
            },
            isAPIPrimary: true,
        };
    },

    getCampaignPageData: () => {
        return {
            url: `${getBaseUrl()}binge-mobile-services/pub/api/v1/campaign/details`,
            method: REQUEST_METHOD.GET,
            isAPIPrimary: true,
        }
    },

    getCampaignBannerData: (packName) => {
        return {
            url: `${getBaseUrl()}homescreen-client/pub/api/v1/promotionalBanner/DONGLE_HOMEPAGE?UnSubscribed=true&pageLimit=10&Subscribed=true&packName=${packName}`,
            method: REQUEST_METHOD.GET,
            isAPIPrimary: true,
        }
    },

    isUserEligibileForPack: (packId) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}binge-mobile-services/api/v1/campaign/pack/eligible/details`,
            method: REQUEST_METHOD.POST,
            data: {
                baId: userInfo.baId,
                dthStatus: userInfo.dthStatus,
                packId: packId
            },
            headers: {
                ...getCommonHeaders(),
            },
            isAPIPrimary: true,
        }
    },

    checkFallbackFlow : () => {
        return {
          url: `${getBaseUrl()}binge-mobile-services/pub/api/v1/manage/app/fallback`,
          method: REQUEST_METHOD.GET,
          isAPIPrimary: true,
        };
    },

    getGenericDrmUrl: (payload) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_GENERIC_DRM_ENDPOINT}`,
            method: REQUEST_METHOD.POST,
            headers: {
                ...getCommonHeaders(`bearer ${userInfo.accessToken}`),
                deviceId: getDeviceId(),
            },
            data:payload,
        };
    },

    fetchRedemptionUrl: () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            url: `${getBaseUrl()}${CONSTANT.GET_REDEMPTION_URL}`,
            method: REQUEST_METHOD.POST,
            headers: {
                authorization: `bearer ${userInfo.accessToken}`,
                sid: userInfo?.sId,
                "Content-Type": "application/json",
            },
            data: {
                dsn: userInfo?.deviceSerialNumber,
                baId: userInfo?.baId,
                platform: DEVICE_TYPE_HEADER.WEB,
            }
        }
    },
};