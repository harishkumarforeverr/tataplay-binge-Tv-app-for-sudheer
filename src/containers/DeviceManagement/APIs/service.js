import { doRequest } from "@services";
import { serviceConstants } from "@utils/apiService";

class DeviceManagementService {

    getSubscriberDeviceList(isBeforeLogin, payload) {
        return doRequest(serviceConstants.getSubscriberDeviceList(isBeforeLogin, payload));
    }

    deleteSubscriberDeviceList(deviceDetail, isBeforeLogin,data) {
        return doRequest(serviceConstants.deleteSubscriberDeviceList(deviceDetail, isBeforeLogin,data))
    }

}

const DeviceManagementInstance = new DeviceManagementService();
export default DeviceManagementInstance;
