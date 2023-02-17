import { doRequest } from "@services";
import { serviceConstants } from "@utils/apiService";

class SubscriptionService {
  getCurrentSubscriptionInfo(apiPrimary, handleNetworkFailure) {
    return doRequest(
      serviceConstants.getCurrentSubscriptionInfo(apiPrimary),
      handleNetworkFailure
    );
  }

  packListing(payload) {
    return doRequest(serviceConstants.packListingData(payload));
  }

  getTenureAccountBal(payload) {
    return doRequest(serviceConstants.tenureAccountBal(payload));
  }

  validateSelectedPack(payload) {
    return doRequest(serviceConstants.validateSelectedPack(payload));
  }

  addNewSubscription(payload) {
    return doRequest(serviceConstants.addSubscription(payload));
  }

  modifyExistingSubscription(payload) {
    return doRequest(serviceConstants.modifySubscription(payload));
  }

  cancelSubscription(payload) {
    return doRequest(serviceConstants.cancelSubscription(payload));
  }

  resumePack() {
    return doRequest(serviceConstants.resumeSubscription());
  }

  getNotLoggedInPack() {
    return doRequest(serviceConstants.getNotLoggedInPack());
  }

  getCampaignPageData() {
    return doRequest(serviceConstants.getCampaignPageData());
  }
  getCampaignBannerData(packName) {
    return doRequest(serviceConstants.getCampaignBannerData(packName));
  }
  isUserEligibileForPack(packId) {
    return doRequest(serviceConstants.isUserEligibileForPack(packId));
  }

  getWebPortalLink(requestHeaders, isCampaign) {
    return doRequest(
      serviceConstants.getWebPortalLink(requestHeaders, isCampaign)
    );
  }

  getWebPortalBackLink(cartId) {
    return doRequest(serviceConstants.getWebPortalBackLink(cartId));
  }

  getPlanSummaryUrl(cartId) {
    return doRequest(serviceConstants.getPlanSummaryUrl(cartId));
  }

  migrateUserInfo(migrateUserHeader) {
    return doRequest(serviceConstants.migrateUserInfo(migrateUserHeader));
  }

  checkFallbackFlow() {
    return doRequest(serviceConstants.checkFallbackFlow());
  }
}

const SubscriptionServiceInstance = new SubscriptionService();
export default SubscriptionServiceInstance;