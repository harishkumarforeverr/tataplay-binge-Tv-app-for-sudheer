import { doRequest } from "@src/services/api";
import { serviceConstants } from "@utils/apiService";

class BrowseByService {
    fetchBrowsingFilters(browseByType) {
        return doRequest(serviceConstants.fetchBrowsingFilters(browseByType))
    }

    fetchSearchData(data) {
        return doRequest(serviceConstants.fetchSearchData(data))
    }
    fetchSearchAutosuggestedData(data) {
        return doRequest(serviceConstants.fetchSearchAutosuggestedData(data))
    }

    fetchTrendingData(data) {
        return doRequest(serviceConstants.fetchTrendingData(data))
    }

    fetchSearchLandingData(data) {
        return doRequest(serviceConstants.fetchSearchLandingData(data))
    }
    fetchSearchPIData(data) {
        return doRequest(serviceConstants.fetchPISearchData(data))
    }
    
    fetchTARecommendedFilterOrder(payload) {
        return doRequest(serviceConstants.getTARecommendedFilterOrder(payload))
    }

    fetchTARecommendedSearchData(payload) {
        return doRequest(serviceConstants.getTARecommendedSearchData(payload))
    }
}

const BrowseByServiceInstance = new BrowseByService();
export default BrowseByServiceInstance;
