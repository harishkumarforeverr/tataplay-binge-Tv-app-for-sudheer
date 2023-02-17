import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class AppInstallPageService {

    getAppInstallDetails() {
        return doRequest(serviceConstants.getAppInstallDetails())
    }

}

const AppInstallPageServiceInstance = new AppInstallPageService();
export default AppInstallPageServiceInstance;
