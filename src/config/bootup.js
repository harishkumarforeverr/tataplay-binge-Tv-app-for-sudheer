import ENV_CONFIG from '@config/environment/index';
import mixpanel from "mixpanel-browser";
import { getPubnubChannelName, handlePubnubData } from "@utils/common";
import Pubnub from "@utils/pubnub";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const mixPanelLib = () => {
    if (mixpanel) {
        mixpanel.init(ENV_CONFIG.MIXPANEL.KEY, {
            debug: ENV_CONFIG.MIXPANEL.DEBUG,
            opt_out_tracking_by_default: false,
            ignore_dnt: true
        });
        mixpanel.reset();
    }
};

const moengage = () => {
    if (window && window.moe) {
        window.Moengage = moe({
            app_id: ENV_CONFIG.MOENGAGE.KEY,
            debug_logs: ENV_CONFIG.MOENGAGE.DEBUG,
        });
        window.Moengage.call_web_push();
    }
}

export const pubnub = (login = false) => {
    let channelName = getPubnubChannelName();
    if (channelName) {
        Pubnub(channelName, (data) => {
            handlePubnubData(data, 'from push');
        }, login);
    }
}

export const firebaseAnalyticsInfo = () => {
    // Initialize Firebase
    const app = initializeApp(ENV_CONFIG.FIREBASE_CONFIG);
    getAnalytics(app);
}

export default () => {
    mixPanelLib();
    //moengage();
    pubnub();
    firebaseAnalyticsInfo();
};
