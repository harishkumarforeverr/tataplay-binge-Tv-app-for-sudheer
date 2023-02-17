import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class SearchService {

    getSearchFilterList(browseBy) {
        return doRequest(serviceConstants.fetchBrowsingFilters(browseBy))
    }
    getVootokenapi(data) {
        return doRequest(serviceConstants.getVootokenapi(data))
    }
}

const SearchServiceInstance = new SearchService();
export default SearchServiceInstance;
