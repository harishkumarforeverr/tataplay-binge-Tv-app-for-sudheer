import { doRequest } from "@src/services/api";
import { serviceConstants } from "@utils/apiService";

class CommonServices {
    fetchMixpanelId(referenceId) {
        return doRequest(serviceConstants.fetchMixpanelId(referenceId));
    }

}

const CommonService = new CommonServices();
export default CommonService;
