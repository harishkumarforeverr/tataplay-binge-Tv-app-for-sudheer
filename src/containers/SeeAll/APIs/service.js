import {doRequest} from "@services";
import {serviceConstants} from "@utils/apiService";

class SeeAllService {

    editorialSeeAll(id, offset) {
        return doRequest(serviceConstants.getSeeAllDetails(id, offset))
    }
}

const SeeAllServiceInstance = new SeeAllService();
export default SeeAllServiceInstance;
