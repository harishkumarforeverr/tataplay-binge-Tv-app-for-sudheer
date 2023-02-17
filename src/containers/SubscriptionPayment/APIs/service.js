import { doRequest } from "@src/services/api";
import { serviceConstants } from "@utils/apiService";

class PaymentService {
  setPaymentStatus(status, txn) {
    return doRequest(serviceConstants.setPaymentStatus(status, txn));
  }
  getPaymentDetails() {
    return doRequest(serviceConstants.getPaymentDetails());
  }
  getBalanceInfo(packId, amount) {
    return doRequest(serviceConstants.getBalanceInfo(packId, amount))
  }
  paymentThroughTSWallet(data) {
    return doRequest(serviceConstants.paymentThroughTSWallet(data))
  }
  quickRecharge(mbr, sIdExist) {
    return doRequest(serviceConstants.quickRecharge(mbr, sIdExist))
  }
  getOpelResponse(data) {
    return doRequest(serviceConstants.getOpelResponse(data))
  }
}

const PaymentServiceInstance = new PaymentService();
export default PaymentServiceInstance;
