import {getBaseUrl} from '@utils/common'
import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class SwitchAccountService {

    postSwitchAccountReq(payload) {
        return doRequest(serviceConstants.postSwitchAccountReq(payload))
    }
}

const SwitchAccountServiceInstance = new SwitchAccountService();
export default SwitchAccountServiceInstance;
