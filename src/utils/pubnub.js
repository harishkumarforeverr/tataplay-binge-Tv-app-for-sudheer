import PubNub from 'pubnub';
import get from 'lodash/get';
import {getKey} from "@utils/storage";
import { LOCALSTORAGE} from "@constants";
import ENV_CONFIG from '@config/environment/index';
import {getPubnubChannelName, handlePubnubData, isUserloggedIn} from "@utils/common";

let pubnub = null;
let pubNubListener = null;

export default (channel, callback, login) => {
    init();
    if (pubnub) {
        subscribe(channel);
        setListener(callback);
        isUserloggedIn() && !login && fetchMessages();
    }
}

const init = () => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    pubnub = new PubNub({
        publishKey: ENV_CONFIG.PUBNUB.PUBLISH_KEY,
        subscribeKey: ENV_CONFIG.PUBNUB.SUBSCRIBE_KEY,
        uuid: get(userInfo,'sId'),
        origin: "tatasky.pubnubapi.com",
    });
};

const subscribe = (channel) => {
    //console.log("Subscribing..",channel);
    pubnub.unsubscribeAll();
    pubnub.subscribe({
        channels: [channel],
    });
};

const setListener = (callback) => {
    pubNubListener = pubnub.addListener({
        message: function (data,status) {
           // console.log("New Message!!", data.message,status);
            callback(data.message);
        },
    });
};

export const removePubNubListener = () => {
    let channelName = getPubnubChannelName();
    pubNubListener && pubnub.removeListener(pubNubListener);
    pubNubListener = null;
    pubnub.unsubscribeAll();
};

export const fetchMessages = () => {
    let channelName = getPubnubChannelName();
    pubnub.fetchMessages({
        channels: [channelName],
        includeUUID: true,
        count: 1,
    }).then(res=> {
        let data = res?.channels?.[channelName]?.[0]?.message;
        data && handlePubnubData(data, 'from history')
    });
}
