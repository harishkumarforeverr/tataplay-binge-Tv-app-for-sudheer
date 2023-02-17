import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class PackListingService {

    packListing(baId, authorization) {
        return doRequest(serviceConstants.packListingData())
    }

    getBalanceInfo(packId) {
        return doRequest(serviceConstants.getBalanceInfo(packId))
    }

    createSubscription(packId) {
        return doRequest(serviceConstants.createSubscription(packId))
    }

    modifySubscription(packId, dropPackId, revoked) {
        return doRequest(serviceConstants.modifySubscription(packId, dropPackId, revoked))
    }

    getCurrentSubscriptionInfo(handleNetworkFailure) {
        return doRequest(serviceConstants.getCurrentSubscriptionInfo(), handleNetworkFailure)
    }

    quickRecharge(mbr, sIdExist) {
        return doRequest(serviceConstants.quickRecharge(mbr, sIdExist))
    }

    reactivateSubscription(packId) {
        return doRequest(serviceConstants.reactivateSubscription(packId))
    }

}

const PackListingServiceInstance = new PackListingService();
export default PackListingServiceInstance;
