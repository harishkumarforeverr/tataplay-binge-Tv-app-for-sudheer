import { doRequest } from "@src/services/api";
import { serviceConstants } from "@utils/apiService";
import url from "@environment/dev";
import store from "@src/store";
import get from 'lodash/get';

class HomeService {

    fetchHomeData(apiUrl, limit, offset, isPartnerPage, providerId, anonymousId) {
        return doRequest(serviceConstants.getHomePageDetails(apiUrl, limit, offset, isPartnerPage, providerId, anonymousId))
    }
    fetchHomeDataHeirarachy(homeData) {
        return doRequest(serviceConstants.getHomeDataHeirarachy(homeData))
    }
    fetchRailContent(id, isLimitReq) {
        return doRequest(serviceConstants.getRailContent(id, isLimitReq))
    }
    fetchContinueWatchingContent(offset, seeAll, pagingState) {
        return doRequest(serviceConstants.getContinueWatchingContent(offset, seeAll, pagingState))
    }

    fetchBrowseByRailData(browseBy) {
        return doRequest(serviceConstants.fetchBrowseByRailData(browseBy))
    }

    fetchTVODContent(offset, max, seeAll) {
        return doRequest(serviceConstants.fetchTVODContent(offset, max, seeAll))
    }

    dunningRecharge(sId, baId) {
        return doRequest(serviceConstants.dunningRecharge(sId, baId))
    }

    fetchTAHeroBanner(max, layout, data) {
        return doRequest(serviceConstants.fetchTAHeroBanner(max, layout, data))
    }

    fetchTARailData(max, layout, placeHolder, seeAll, isPartnerPage, provider) {
        return doRequest(serviceConstants.fetchTARailData(max, layout, placeHolder, seeAll, isPartnerPage, provider))
    }

    quickRechargeBeforeLogin(sId) {
        return doRequest(serviceConstants.quickRechargeBeforeLogin(sId))
    }

    fetchPubnubHistory() {
        return doRequest(serviceConstants.fetchPubnubHistory())
    }

    saveParentalLockPin(data) {
        return doRequest(serviceConstants.saveParentalLockPin(data))
    }
}

const HomeServiceInstance = new HomeService();
export default HomeServiceInstance;
