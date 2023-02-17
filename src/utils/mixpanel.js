import MIXPANEL from "@constants/mixpanel";
import mixpanel from "mixpanel-browser";
import { LOCALSTORAGE, PACK_TYPE, SEARCH_PARAM, SECTION_SOURCE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { deleteKey, getKey, setKey } from "@utils/storage";
import { getDeviceId, getMixpanelId, getMixpanelPeopleProperties, getSearchParam, isHelpCenterWebView, isUserloggedIn, mixpanelGetSuperProperties, setMixpanelId } from "@utils/common";
import { ACCOUNT_STATUS } from "@containers/BingeLogin/APIs/constants";
import isEmpty from "lodash/isEmpty";
import store from "@src/store";
import get from "lodash/get";
import { getDateFromString } from "./common";

const noop = () => { };
// const mixPanelTemp = mixpanel?.people ? mixpanel : {
//     get_distinct_id: noop,
//     track: noop,
//     unregister: noop,
//     register: noop,
//     identify: noop,
//     get_group: noop,
//     set_group: noop,
//     people: {
//         unset: noop,
//         set: noop
//     }
// };
const mixPanelTemp = mixpanel;

let mixPanelConfig = {

    initialData: {},

    identifyUser(identifyUser = false) {
        const isManualLogin = store.getState().loginReducer?.isManualLogin;

        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let mixpanelId = '';
        const mixpanelIdSearchParam = getSearchParam(SEARCH_PARAM.MIXPANEL_ID);
        if (mixpanelIdSearchParam) {
            mixpanelId = mixpanelIdSearchParam;
        }
        else if (!isEmpty(userInfo)) {
            mixpanelId = userInfo?.mixpanelId;
        } else {
            mixpanelId = getMixpanelId();
            if (!mixpanelId) {
                mixpanelId = mixPanelTemp.get_distinct_id();
            }
        }
        setMixpanelId(mixpanelId);
        // call identify only if not accessed from helpCenterWebview and userLoggedIn manually or identifyUser flag is true.
        //  if(!isHelpCenterWebView() &&  (isManualLogin || identifyUser)){
        if (isManualLogin || identifyUser) {
            mixPanelTemp.identify(mixpanelId);
        }
        else {
            mixPanelTemp.register({ "distinct_id": mixpanelId })
        }
        return mixpanelId;
    },


    reset() {
        mixPanelTemp?.reset();
        const distinctId = mixPanelTemp.get_distinct_id();
        setKey(LOCALSTORAGE.MIXPANEL_DISTINCT_ID, distinctId);
        return distinctId;
    },

    resetUserType() {
        const superProperties = mixpanelGetSuperProperties();
        superProperties[MIXPANEL.PARAMETER.USER_TYPE] = MIXPANEL.VALUE.GUEST;
        setKey(LOCALSTORAGE.MIXPANEL_SUPER_PROPERTIES, superProperties);
        mixPanelTemp?.register(superProperties);
    },

    setPeopleProperties() {
        let properties = getMixpanelPeopleProperties();
        mixPanelTemp.people && mixPanelTemp.people.set(properties);
    },

    setSuperProperties() {
        const superProperties = mixpanelGetSuperProperties();
        setKey(LOCALSTORAGE.MIXPANEL_SUPER_PROPERTIES, superProperties);
        mixPanelTemp?.register(superProperties);
    },

    unsetSuperProperties() {
        mixPanelTemp.people.unset(MIXPANEL.PARAMETER.TS_SID);
        mixPanelTemp.people.unset(MIXPANEL.PARAMETER.C_ID);
        mixPanelTemp.unregister(MIXPANEL.PARAMETER.TS_SID);
        mixPanelTemp.unregister(MIXPANEL.PARAMETER.C_ID);
        deleteKey(LOCALSTORAGE.MIXPANEL_SUPER_PROPERTIES);
    },

    setGroup() {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        !isEmpty(userInfo) && mixPanelTemp?.set_group('SID', userInfo?.sId);
    },

    setGroupProperties() {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        if (!isEmpty(userInfo)) {
            let properties = getMixpanelPeopleProperties();
            mixPanelTemp?.get_group('SID', userInfo?.sId)?.unset(MIXPANEL.PARAMETER.TS_SID);
            mixPanelTemp?.get_group('SID', userInfo?.sId)?.unset(MIXPANEL.PARAMETER.C_ID);
            mixPanelTemp?.get_group('SID', userInfo?.sId)?.set(properties);
        }
    },

    profileChanges() {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        if (mixPanelTemp) {
            mixPanelTemp?.people && mixPanelTemp.people.set({
                "FIRST-NAME": `${userInfo?.firstName}`,
                "LAST-NAME": userInfo?.lastName,
                "EMAIL": userInfo?.email,
                "RMN": userInfo?.rmn,
                "SID": userInfo?.sId,
                "DEVICE-ID": getDeviceId(),
            });
        }
    },

    subscriptionDetailChanges() {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let planType = userInfo?.planType;
        let subscriptionType = userInfo?.subscriptionType;
        const state = store.getState();
        let currentSubscription = get(state.packSelectionDetail, 'currentSubscription.data');
        if (mixPanelTemp) {
            mixPanelTemp?.people && mixPanelTemp.people?.set({
                "SUBSCRIBED": userInfo.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
                "FREE-TRIAL": !isEmpty(planType) ? (planType?.toLowerCase() === PACK_TYPE.FREE ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO) : '',
                "DATE-OF-SUBSCRIPTION": userInfo?.packCreationDate,
                "PACK-NAME": !isEmpty(planType) ? userInfo.packName : "",
                "PACK-PRICE": !isEmpty(planType) ? userInfo.packPrice : "",
                "SUBSCRIPTION-TYPE": !isEmpty(planType) ? subscriptionType : MIXPANEL.VALUE.UNSUBSCRIBED,
                "PACK-RENEWAL-DATE": getDateFromString(userInfo?.rechargeDue),
                "PACK-START-DATE": new Date(userInfo?.packCreationDate),
                "PACK-END-DATE": getDateFromString(userInfo?.expirationDate),
            });

            /*
            * current subscription api -  null - property update not required
            * current subscription api - user has some pack or written off - FREE-TRIAL-ELIGIBLE - NO
            * */
            if (!isEmpty(currentSubscription)) {
                mixPanelTemp?.people && mixPanelTemp.people?.set({
                    "FREE-TRIAL-ELIGIBLE": MIXPANEL.VALUE.NO,
                });
            }
        }
    },

    trackEvent(event, data) {
        let updatedData = {}, keys, sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        updatedData = data;
        updatedData && (keys = Object.keys(updatedData));
        if (updatedData && keys.length > 0) {
            keys.forEach(keyName => {
                if (updatedData[keyName] === null || updatedData[keyName] === "null" || updatedData === undefined) {
                    updatedData[keyName] = "";
                } else {
                    updatedData[keyName] = updatedData[keyName] || (updatedData[keyName] === 0 ? 0 : "")
                }
            });

            keys.indexOf(MIXPANEL.PARAMETER.SOURCE) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.SOURCE] = sourceIsMSales ? MIXPANEL.VALUE.M_SALES : updatedData[MIXPANEL.PARAMETER.SOURCE] || "OTHERS");
            keys.indexOf(MIXPANEL.PARAMETER.TITLE_SECTION) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.TITLE_SECTION] = updatedData[MIXPANEL.PARAMETER.TITLE_SECTION] || "OTHERS");
            keys.indexOf(MIXPANEL.PARAMETER.PACK_NAME) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.PACK_NAME] = updatedData[MIXPANEL.PARAMETER.PACK_NAME] || MIXPANEL.VALUE.FREEMIUM);
            keys.indexOf(MIXPANEL.PARAMETER.PACK_TYPE) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.PACK_TYPE] = updatedData[MIXPANEL.PARAMETER.PACK_TYPE] || MIXPANEL.VALUE.FREEMIUM);
            keys.indexOf(MIXPANEL.PARAMETER.PACK_PRICE) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.PACK_PRICE] = updatedData[MIXPANEL.PARAMETER.PACK_PRICE] || MIXPANEL.VALUE.FREEMIUM);
            keys.indexOf(MIXPANEL.PARAMETER.PAGE_NAME) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.PAGE_NAME] = updatedData[MIXPANEL.PARAMETER.PAGE_NAME] || MIXPANEL.VALUE.OTHERS);
            keys.indexOf(MIXPANEL.PARAMETER.CONTENT_TYPE) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.CONTENT_TYPE] = updatedData[MIXPANEL.PARAMETER.CONTENT_TYPE]?.toUpperCase() === SECTION_SOURCE.RECOMMENDATION ? MIXPANEL.VALUE.RECOMMENDATION : MIXPANEL.VALUE.EDITORIAL);
            keys.indexOf(MIXPANEL.PARAMETER.RAIL_TYPE) >= 0 &&
                (updatedData[MIXPANEL.PARAMETER.RAIL_TYPE] = updatedData[MIXPANEL.PARAMETER.RAIL_TYPE]?.toUpperCase() || MIXPANEL.VALUE.EDITORIAL);
        }
        updatedData ? mixPanelTemp.track(event, updatedData) : mixPanelTemp.track(event)
    },
};

export default mixPanelConfig;
