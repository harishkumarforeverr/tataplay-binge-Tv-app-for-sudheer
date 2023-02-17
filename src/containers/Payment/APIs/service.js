import { doRequest } from "@src/services/api";
import { serviceConstants } from "@utils/apiService";

class PaymentService {
    setPaymentStatus(status, txn) {
        return doRequest(serviceConstants.setPaymentStatus(status, txn))
    }
}

const PaymentServiceInstance = new PaymentService();
export default PaymentServiceInstance;
