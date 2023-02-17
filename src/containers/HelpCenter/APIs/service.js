import { doRequest } from "@services";
import { serviceConstants } from "@utils/apiService";

class HelpCenterService {
  getTrendingList(type, limit, offset, visibleTo) {
    return doRequest(
      serviceConstants.getHelpCenterTrendingList(type, limit, offset, visibleTo)
    );
  }
  getCategoryList(type, limit, offset, visibleTo) {
    return doRequest(
      serviceConstants.getHelpCenterCategoryList(type, limit, offset, visibleTo)
    );
  }
  getSearchResult(params) {
    return doRequest(serviceConstants.getSearchResult(params));
  }
  getSearchAutoComplete(params) {
    return doRequest(serviceConstants.getSearchAutoComplete(params));
  }
  getCategoryDetail(params) {
    return doRequest(serviceConstants.getHelpCenterCategoryDetail(params));
  }
  getHCViewMoredata(params) {
    return doRequest(serviceConstants.getHCViewMoredata(params));
  }
  getOutageBannerData() {
    return doRequest(serviceConstants.getOutageBannerData());
  }
  validateHelpCenterUrl(param) {
    return doRequest(serviceConstants.validateHelpCenterUrl(param));
  }
  helpCenterPopularityTrack(item) {
    return doRequest(serviceConstants.helpCenterPopularityTrack(item));
  }
  fetchChatNowUrlApiResp(chatbotType, queryParams) {
    return doRequest(serviceConstants.getHCChatNowApiResponse(chatbotType, queryParams));
  }
  getTicket(Data) {
    return doRequest(serviceConstants.getTicket(Data));
  }
  getTicketDetails(id) {
    return doRequest(serviceConstants.getTicketDetails(id));
  }
  postReopenTicket(payload) {
    return doRequest(serviceConstants.postReopenTicket(payload));
  }
}

const HelpCenterServiceInstance = new HelpCenterService();
export default HelpCenterServiceInstance;
