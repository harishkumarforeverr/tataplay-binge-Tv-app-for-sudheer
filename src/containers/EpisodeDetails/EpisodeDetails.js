import { LOCALSTORAGE, } from "@constants";
import { isUserloggedIn } from "@utils/common";
import { getKey } from "@utils/storage";
import { fetchEpisodeDetails } from "@components/Seasons/APIs/actions";
import get from "lodash/get";
import store from "@src/store";

export const fetchEpisodeDetailsHistory = async (seriesId) => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let payload = {
        subscriberId: userInfo.sId,
        profileId: userInfo.profileId,
        contentIdAndType: getEpisodeDetailsPayload(),
        id: seriesId,
    };

    if (!isUserloggedIn()) {
        payload['uniqueId'] = getKey(LOCALSTORAGE.ANONYMOUS_ID);
    }

    store.dispatch(fetchEpisodeDetails(payload));
};

const getEpisodeDetailsPayload = () => {
    const state = store.getState();
    let detail = get(state.seasonReducer, "items"),
    list = [],
        contentObj =
        detail &&
        detail.map((i) => {
            let obj = { contentId: i.id, contentType: i.contentType };
            list.push(obj);
        });
    return list;
};
