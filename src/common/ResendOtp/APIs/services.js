import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class ResendOtpService {
    resendOtp(rmn) {
        return doRequest(serviceConstants.resendOtp(rmn))
    }
}

const ResendOtpServiceInstance = new ResendOtpService();
export default ResendOtpServiceInstance;