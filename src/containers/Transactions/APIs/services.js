import {doRequest} from "@src/services/api";
import {serviceConstants} from "@utils/apiService";

class TransactionService {
    getInvoicePDF(baId, accessToken, invoiceNumber, subscriberId) {
        return doRequest(serviceConstants.getInvoicePDF(baId, accessToken, invoiceNumber, subscriberId))
    }
}

const TransactionServiceInstance = new TransactionService();
export default TransactionServiceInstance;
