import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class HeaderService {

    fetchHeaderData() {
        return doRequest(serviceConstants.fetchHeaderData())
    }

    addAlias(aliasName) {
        return doRequest(serviceConstants.addAlias(aliasName))
    }

    fetchConfig() {
        return doRequest(serviceConstants.fetchConfig())
    }

    getFAQ() {
        return doRequest(serviceConstants.getFAQ())
    }

    getGenreInfo() {
        return doRequest(serviceConstants.getGenreInfo())
    }

    generateAnonymousId() {
        return doRequest(serviceConstants.getAnonymousId())
    }

    categoriesList() {
        return doRequest(serviceConstants.getCategoriesListData());
    }

    refreshAccount() {
        return doRequest(serviceConstants.refreshAccount());
    }
    refreshAccountOldStack(){
        return doRequest(serviceConstants.refreshAccountOldStack());
    }


}

const HeaderServiceInstance = new HeaderService();
export default HeaderServiceInstance;
