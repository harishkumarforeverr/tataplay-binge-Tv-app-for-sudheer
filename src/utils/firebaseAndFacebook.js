import { getAnalytics, logEvent } from "firebase/analytics";
import FIREBASE from '@utils/constants/firebase.js';
import { LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { getKey } from "@utils/storage";

const trackEventsConfig = {
    trackFirebaseEvent: function (event, properties = {}) {
        let analytics = getAnalytics(),
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        if (properties && sourceIsMSales && properties.hasOwnProperty(FIREBASE.PARAMETER.SOURCE)) {
            properties[FIREBASE.PARAMETER.SOURCE] = FIREBASE.VALUE.MSALES;
        }

        logEvent(analytics, event, properties);
    },

    trackFacebookEvent: function (track, event, properties = {}) {
        let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        if (properties && sourceIsMSales && properties.hasOwnProperty(FIREBASE.PARAMETER.SOURCE)) {
            properties[FIREBASE.PARAMETER.SOURCE] = FIREBASE.VALUE.MSALES;
        }

        window.fbq(track, event, properties)
    }
}

export default trackEventsConfig;