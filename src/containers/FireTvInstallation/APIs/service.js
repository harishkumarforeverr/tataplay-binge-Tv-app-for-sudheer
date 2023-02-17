import {serviceConstants} from "@utils/apiService";
import {doRequest} from "@src/services/api";

class FireTVInstallationService {

    createWo(param) {
        return doRequest(serviceConstants.createWo(param));
    }
    getSubscriberAddress() {
        return doRequest(serviceConstants.getSubscriberAddress());
    }
    getSlot(param) {
        return doRequest(serviceConstants.getSlot(param));
    }
    confirmSlot(param) {
        return doRequest(serviceConstants.confirmSlot(param));
    } 
    campaign(){
        return doRequest(serviceConstants.campaign())
    }

}

const FireTVInstallationServiceInstance = new FireTVInstallationService();
export default FireTVInstallationServiceInstance;
