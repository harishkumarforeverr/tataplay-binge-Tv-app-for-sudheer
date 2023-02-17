import {doRequest} from "@src/services/api";
import {serviceConstants} from "@utils/apiService";

class PIDetailService {
    fetchPIData(id, contentTypeData) {
        return doRequest(serviceConstants.fetchPIData(id, contentTypeData))
    }
    fetchLiveContentData(id) {
        return doRequest(serviceConstants.fetchLiveContentData(id));
    }
    getShemarooContent(url) {
        return doRequest(serviceConstants.getShemarooContent(url));
    }

    fetchPIRecommendedData(data) {
        return doRequest(serviceConstants.fetchPIRecommendedData(data))
    }

    getTARecommendationRail(data, seeAll) {
        return doRequest((serviceConstants.getTARecommendationRail(data, seeAll)))
    }

    fetchContinueWatchingDetails(id, contentTypeData, partnerId) {
        return doRequest(serviceConstants.fetchContinueWatchingDetails(id, contentTypeData, partnerId))
    }

    getTVODExpiry(id) {
        return doRequest(serviceConstants.getTVODExpiry(id))
    }

    getPlaybackEligibility() {
        return doRequest(serviceConstants.checkPlaybackEligibility())
    }

    trackShemarooAnalytics(payload) {
        return doRequest(serviceConstants.trackShemarooAnalytics(payload));
    }

    trackPlanetMarathiAnalytics(payload) {
        return doRequest(serviceConstants.trackPlanetMarathiAnalytics(payload));
    }

    fetchRedemptionUrl() {
        return doRequest(serviceConstants.fetchRedemptionUrl())
    }
}

const PIServiceInstance = new PIDetailService();
export default PIServiceInstance;
