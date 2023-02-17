import {doRequest} from "@src/services/api";
import {serviceConstants} from "@utils/apiService";

class LinkAccount {
    fetchLinkAccountOtp(rmn) {
        return doRequest(serviceConstants.fetchLinkAccountOtp(rmn))
    }
}

const LinkAccountInstanceInstance = new LinkAccount();
export default LinkAccountInstanceInstance;
