import {doRequest} from "@src/services/api";
import {serviceConstants} from "@utils/apiService";

class LanguageService {

    savePreferredLanguages(data, id) {
        return doRequest(serviceConstants.savePreferredLanguages(data, id))
    }

    getLanguageListing(data, id, languageList) {
        return doRequest(serviceConstants.fetchBrowsingFilters(data, id, languageList))
    }

    getLanguageSelected(header, body) {
        return doRequest(serviceConstants.getLanguageSelectedListing(header, body))
    }
}

const LanguageServiceInstance = new LanguageService();
export default LanguageServiceInstance;
