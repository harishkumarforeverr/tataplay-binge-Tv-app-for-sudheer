import { doRequest } from "@src/services/api";
import { serviceConstants } from "@utils/apiService";
class LoginByService {

    generateOtpWithRMN(rmn) {
        return doRequest(serviceConstants.rmnGetOtp(rmn))
    }

    validateOtp(mobile, otp) {
        return doRequest(serviceConstants.verifyRmnOpt(mobile, otp))
    }

    getSubscriberListing(mobile) {
        return doRequest(serviceConstants.subscriberListing(mobile))
    }

    createNewBingeUser(payload, params, registerWebSmall) {
        return doRequest(serviceConstants.createNewBingeUser(payload, params, registerWebSmall))
    }

    updateBingeUser(payload, params, registerWebSmall) {
        return doRequest(serviceConstants.updateBingeUser(payload, params, registerWebSmall))
    }

    validateFSWebSmallUrl(token) {
        return doRequest(serviceConstants.validateFSWebSmallUrl(token));
    }

    getClientIP() {
        return doRequest(serviceConstants.getClientIP());
    }

    forceLogout() {
        return doRequest(serviceConstants.forceLogout());
    }
}

const LoginByServiceInstance = new LoginByService();
export default LoginByServiceInstance;
