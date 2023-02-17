import { rmnMaskingFunction } from "@containers/BingeLogin/bingeLoginCommon";
import store from "@src/store";
import { isEmpty } from "lodash";
import { getAppsFlyerComvivaId, getCookie, getDeviceId, getMixpanelId, getPackModificationType } from "./common";
import { COOKIE, LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "./constants";
import APPSFLYER from "./constants/appsFlyer";
import { getKey } from "./storage";

const appsFlyerConfig = {
    setUser(sid) {
        window?.AF?.("pba", "setCustomerUserId", sid);
    },

    getAppsFlyerId: () => getCookie(COOKIE.APPSFLYER_ID),

    trackEvent(event, eventData = {}, eventType = "EVENT") {
        const { commonContent: { isSourceAppsFlyerDeeplink } } = store.getState();
        let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        if (eventData?.[APPSFLYER.PARAMETER.SOURCE] === "") {
            eventData = {
                ...eventData,
                [APPSFLYER.PARAMETER.SOURCE]: sourceIsMSales ?
                    APPSFLYER.VALUE.M_SALES
                    : isSourceAppsFlyerDeeplink
                        ? APPSFLYER.VALUE.DEEPLINK
                        : APPSFLYER.VALUE.HOME,
            };
        }
        const userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        const mixpanelId = getMixpanelId();
        eventData[APPSFLYER.PARAMETER.CUID] = mixpanelId;
        if (!isEmpty(userInfo)) {
            eventData = {
                ...eventData,
                [APPSFLYER.PARAMETER.CUID]: userInfo?.mixpanelId,
                // [APPSFLYER.PARAMETER.MOBILE_NUMBER]: rmnMaskingFunction(userInfo?.rmn) || '',
                [APPSFLYER.PARAMETER.SID]: userInfo?.sId,
                [APPSFLYER.PARAMETER.COMVIVAID]: getAppsFlyerComvivaId(event),
                [APPSFLYER.PARAMETER.DEVICE_ID]: getDeviceId(),
            }
        }
        window?.AF?.("pba", "event", {
            eventType,
            eventName: event,
            eventValue: eventData,
        });
    },
    trackSubscriptionSuccess(source, packName, price, packId) {
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SUBSCRIPTION_SUCCESS, {
            [APPSFLYER.PARAMETER.SOURCE]: source,
            [APPSFLYER.PARAMETER.PACK_NAME]: packName,
            [APPSFLYER.PARAMETER.PACK_PRICE]: price,
            [APPSFLYER.PARAMETER.PACK_ID]: packId,
            [APPSFLYER.PARAMETER.PACK_DURATION]: "",
            [APPSFLYER.PARAMETER.AF_REVENUE]: price,
            [APPSFLYER.PARAMETER.AF_CURRENCY]: APPSFLYER.VALUE.INR,
            [APPSFLYER.PARAMETER.PROMO_CODE]: "",
            [APPSFLYER.PARAMETER.PAYMENT_MODE]: "",

        })
    },
    trackSubscriptionFailed(reason, packName, type) {
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SUBSCRIBE_FAILED, {
            [APPSFLYER.PARAMETER.PACK_NAME]: packName || '',
            [APPSFLYER.PARAMETER.TYPE]: type || '',
            [APPSFLYER.PARAMETER.REASON]: reason || APPSFLYER.VALUE.REASON,
        })
    },
    trackModifyPackEvents(eventName = APPSFLYER.EVENT.MODIFY_PACK_SUCCESS, item, currentSubscription) {
        const { productName, amountValue } = item;
        const modType = getPackModificationType(item, currentSubscription, APPSFLYER);
        appsFlyerConfig.trackEvent(eventName, {
            [APPSFLYER.PARAMETER.PACK_NAME]: productName || '',
            [APPSFLYER.PARAMETER.PACK_PRICE]: amountValue || '',
            [APPSFLYER.PARAMETER.MOD_TYPE]: modType || '',
            [APPSFLYER.PARAMETER.SOURCE]: APPSFLYER.VALUE.HOME
        })
    }
};

export default appsFlyerConfig;
