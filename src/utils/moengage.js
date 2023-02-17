import MOENGAGE from "@constants/moengage";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE, PACK_TYPE} from "@constants";
import {getMixpanelPeopleProperties} from "@utils/common";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import isEmpty from "lodash/isEmpty";
import store from "@src/store";
import get from "lodash/get";
import {getDateFromString} from "./common";
const moengageConfig = {

    setUserAttributes(UNIQUE_ID) {
        if (window.Moengage) {
            if (UNIQUE_ID) {
                Moengage.add_unique_user_id(UNIQUE_ID.toString());
            }

            let properties = getMixpanelPeopleProperties();

            window.Moengage.add_user_attribute("FIRST-NAME", properties["FIRST-NAME"]);
            window.Moengage.add_user_attribute("LAST-NAME", properties["LAST-NAME"]);
            window.Moengage.add_user_attribute("SID", properties["SID"].toString());
            window.Moengage.add_user_attribute("RMN", properties["RMN"]);
            window.Moengage.add_user_attribute("EMAIL", properties["EMAIL"]);
            window.Moengage.add_user_attribute("FIRST-TIME-LOGIN", properties["FIRST-TIME-LOGIN"]);
            window.Moengage.add_user_attribute("FIRE-TV", properties["FIRE-TV"]);
            window.Moengage.add_user_attribute("ATV", properties["ATV"]);
            window.Moengage.add_user_attribute("BINGE-ACCOUNTS-COUNT", properties["BINGE-ACCOUNTS-COUNT"]);
            window.Moengage.add_user_attribute("SUBSCRIBED", properties["SUBSCRIBED"]);
            window.Moengage.add_user_attribute("DATE-OF-SUBSCRIPTION", properties["DATE-OF-SUBSCRIPTION"]);
            window.Moengage.add_user_attribute("LOGGED-IN-DEVICE-COUNT", properties["LOGGED-IN-DEVICE-COUNT"]);
            window.Moengage.add_user_attribute("FREE-TRIAL", properties["FREE-TRIAL"]);
            window.Moengage.add_user_attribute("PACK-NAME", properties["PACK-NAME"]);
            window.Moengage.add_user_attribute("PACK-PRICE", properties["PACK-PRICE"]);
            window.Moengage.add_user_attribute("SUBSCRIPTION-TYPE", properties["SUBSCRIPTION-TYPE"]);
            window.Moengage.add_user_attribute("BURN-RATE-TYPE", properties["BURN-RATE-TYPE"]);
            window.Moengage.add_user_attribute("FREE-TRIAL-ELIGIBLE", properties["FREE-TRIAL-ELIGIBLE"]);
            window.Moengage.add_user_attribute("PACK-RENEWAL-DATE", properties["PACK-RENEWAL-DATE"]);
            window.Moengage.add_user_attribute("LAST-USED-AT", properties["LAST-USED-AT"]);
            window.Moengage.add_user_attribute("PACK-START-DATE", properties["PACK-START-DATE"]);
            window.Moengage.add_user_attribute("PACK-END-DATE", properties["PACK-END-DATE"]);
            window.Moengage.add_user_attribute("PROFILE-ID", properties["PROFILE-ID"]);
        }
    },

    profileChanges() {
        if (window.Moengage) {
            let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

            window.Moengage.add_user_attribute("FIRST-NAME", `${userInfo?.firstName}`);
            window.Moengage.add_user_attribute("LAST-NAME", userInfo?.lastName);
            window.Moengage.add_user_attribute("EMAIL", userInfo?.emailId);
        }
    },

    subscriptionDetailChanges() {
        if (window.Moengage) {
            let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
            let planType = userInfo?.planType;
            let subscriptionType = userInfo?.subscriptionType;
            const state = store.getState();
            let currentSubscription = get(state.packSelectionDetail, 'currentSubscription.data');

            window.Moengage.add_user_attribute("SUBSCRIBED", userInfo.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE ? MOENGAGE.VALUE.YES : MOENGAGE.VALUE.NO);
            window.Moengage.add_user_attribute("FREE-TRIAL", !isEmpty(planType) ? (planType?.toLowerCase() === PACK_TYPE.FREE ? MOENGAGE.VALUE.YES : MOENGAGE.VALUE.NO) : '');
            window.Moengage.add_user_attribute("DATE-OF-SUBSCRIPTION", userInfo.packCreationDate);
            window.Moengage.add_user_attribute("PACK-NAME", !isEmpty(planType) ? userInfo.packName : "");
            window.Moengage.add_user_attribute("PACK-PRICE", !isEmpty(planType) ? userInfo.packPrice : "");
            window.Moengage.add_user_attribute("SUBSCRIPTION-TYPE", !isEmpty(planType) ? subscriptionType : MOENGAGE.VALUE.UNSUBSCRIBED);
            window.Moengage.add_user_attribute("PACK-RENEWAL-DATE", getDateFromString(userInfo?.rechargeDue));
            window.Moengage.add_user_attribute("PACK-START-DATE", new Date(userInfo?.packCreationDate));
            window.Moengage.add_user_attribute("PACK-END-DATE", getDateFromString(userInfo?.expirationDate));

            /*
           * current subscription api -  null - property update not required
           * current subscription api - user has some pack or written off - FREE-TRIAL-ELIGIBLE - NO
           * */
            if(!isEmpty(currentSubscription)) {
                window.Moengage.add_user_attribute("FREE-TRIAL-ELIGIBLE", MOENGAGE.VALUE.NO);
            }
        }
    },

    trackEvent(event, data) {
        let updatedData = {}, keys;
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

            keys.indexOf(MOENGAGE.PARAMETER.SOURCE) >= 0 &&
            (updatedData[MOENGAGE.PARAMETER.SOURCE] = updatedData[MOENGAGE.PARAMETER.SOURCE] || "OTHERS");
            keys.indexOf(MOENGAGE.PARAMETER.TITLE_SECTION) >= 0 &&
            (updatedData[MOENGAGE.PARAMETER.TITLE_SECTION] = updatedData[MOENGAGE.PARAMETER.TITLE_SECTION] || "OTHERS");
        }
        if (window.Moengage) {
            updatedData ?
                window.Moengage.track_event(event, updatedData) :
                window.Moengage.track_event(event);
        }
    },

};

export default moengageConfig;