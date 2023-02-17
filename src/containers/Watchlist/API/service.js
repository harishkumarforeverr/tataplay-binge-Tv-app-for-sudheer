import {doRequest} from "@src/services/api";
import {serviceConstants} from "@utils/apiService";

class WatchlistService {
    fetchWatchlistItems(currentPagingState, removePagination, showLoader) {
        return doRequest(serviceConstants.fetchWatchlistItems(currentPagingState, removePagination, showLoader));
    }

    removeWatchlistItems(payload) {
        return doRequest(serviceConstants.removeWatchlistItems(payload));
    }
}

const WatchlistServiceInstance = new WatchlistService();
export default WatchlistServiceInstance;
