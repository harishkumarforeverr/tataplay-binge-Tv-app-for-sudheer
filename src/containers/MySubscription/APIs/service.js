import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class MySubscriptionService {

    resumePack() {
        return doRequest(serviceConstants.resumeSubscription())
    }

    cancelPack(bingeCancel,primeCancel){
        return doRequest(serviceConstants.cancelSubscription(bingeCancel,primeCancel))
    }

    getUpgradeTransitionDetails(packId){
        return doRequest(serviceConstants.getUpgradeTransitionDetails(packId))
    }
}

const MySubscriptionServiceInstance = new MySubscriptionService();
export default MySubscriptionServiceInstance;
