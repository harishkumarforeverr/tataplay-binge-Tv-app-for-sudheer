import {doRequest} from "@src/services/api";
import {serviceConstants} from "@utils/apiService";

class LoginByService {
    generateOtpWithRMN(rmn) {
        return doRequest(serviceConstants.getOtp(rmn))
    }
    validateOtp(params){
        return doRequest(serviceConstants.verifyOtp(params))
    }
    validatePassword(params){
        return doRequest(serviceConstants.validatePassword(params))
    }
    generateOtpWithSid(sid, isPassword){
        return doRequest(serviceConstants.generateOtpWithSid(sid, isPassword))
    }
    getForgetPasswordOtp(sid, param){
        return doRequest(serviceConstants.getForgetPasswordOtp(sid, param))
    }
    changePasswordWithoutAuth(sid, params){
        return doRequest(serviceConstants.changePasswordWithoutAuth(sid, params))
    }
    getAccountDetailsFromRmn(rmn){
        return doRequest(serviceConstants.getAccountDetailsFromRmn(rmn))
    }
    getAccountDetailsFromSid(subId){
      return doRequest(serviceConstants.getAccountDetailsFromSid(subId))
    }
    createBingeUser(payload){
        return doRequest(serviceConstants.createBingeUser(payload))
    }
    loginExistingUser(payload) {
        return doRequest(serviceConstants.loginExistingUser(payload))
    }
    logOut(allUsers = false) {
        return doRequest(serviceConstants.logout(allUsers))
    }
    validateWebSmallUrl(wsUrl) {
        return doRequest(serviceConstants.validateWebSmallUrl(wsUrl))
    }
    validateOtpForSid(params) {
        return doRequest(serviceConstants.validateOtpForSid(params))
    }
    createCancelSubscriberAccount(params) {
        return doRequest(serviceConstants.createCancelSubscriberAccount(params))
    }
    fetchDeviceMobileNumbers(id) {
        return doRequest(serviceConstants.getDevicePhoneNumbers(id))
    }
}

const LoginByServiceInstance = new LoginByService();
export default LoginByServiceInstance;
