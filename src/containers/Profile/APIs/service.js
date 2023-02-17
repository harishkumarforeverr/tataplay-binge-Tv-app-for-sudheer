import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class ProfileService {
    getProfileDetails() {
        return doRequest(serviceConstants.getProfileDetails());
    }

    updateProfileDetailsNonDthUser(payload) {
        return doRequest(serviceConstants.updateProfileDetailsNonDthUser(payload));
    }

    updateEmail(payload) {
        return doRequest(serviceConstants.updateEmail(payload));
    }

    updateProfileImage(payload) {
        return doRequest(serviceConstants.updateProfileImage(payload));
    }

    switchToAtvAccount() {
        return doRequest(serviceConstants.switchToAtvAccount());
    }

    handleAtvUpgrade() {
        return doRequest(serviceConstants.handleAtvUpgrade());
    }
}

const ProfileServiceInstance = new ProfileService();
export default ProfileServiceInstance;
