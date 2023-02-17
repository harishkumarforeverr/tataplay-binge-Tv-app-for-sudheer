import get from "lodash/get";
import { ACTION ,ReopenResponse} from "./constants";


let initialState = {
  hcSeeAllData: {},
  hcSeeAllDataItems: [],
  helpCenterChatNowResp: {},
};

export default function helpCenterReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION.GET_FAQ_LIST:
      return { ...state, faqDataList: get(action, "apiResponse") };
    case ACTION.GET_HELP_VIDEO:
      return { ...state, helpVideoList: get(action, "apiResponse") };
    case ACTION.GET_CATEGORY_LIST:
      return { ...state, categoryList: get(action, "apiResponse") };
    case ACTION.GET_SEARCH_RESULT:
      return { ...state, searchResultData: get(action, "apiResponse") };
    case ACTION.HC_SEARCH_DETAIL_VIEW_MORE:
      const searchResultDataClone = { ...state.searchResultData };
      searchResultDataClone.data.faqs = {
        ...get(state, "searchResultData.data.faqs"),
        rail: action.isViewMore
          ? [
            ...get(state, "searchResultData.data.faqs.rail", []),
            ...get(action, "apiResponse.data.rail", []),
          ]
          : get(action, "apiResponse.data.rail", []),
      };
      return { ...state, searchResultData: searchResultDataClone };
    case ACTION.GET_SEARCH_AUTO_COMPLETE:
      return { ...state, searchAutoCompleteData: get(action, "apiResponse") };
    case ACTION.CLEAR_SEARCH_AUTO_COMPLETE:
      return { ...state, searchAutoCompleteData: {} };
    case ACTION.GET_CATEGORY_DEATILS:
      return { ...state, categoryDetails: get(action, "apiResponse") };
    case ACTION.CLEAR_CATEGORY_DEATILS:
      return { ...state, categoryDetails: {} };
    case ACTION.HC_VIEW_MORE_DATA:
      const categoryDetailsClone = { ...state.categoryDetails };
      if (get(action, "sectionType") === "subCategories") {
        categoryDetailsClone.data[get(action, "sectionType")] = (
          get(state, "categoryDetails.data.subCategories") || []
        ).map((item) => {
          if (item.title === get(action, "title")) {
            return {
              ...item,
              rail: action.isViewMore
                ? [...item.rail, ...get(action, "apiResponse.data.rail", [])]
                : get(action, "apiResponse.data.rail", []),
            };
          } else {
            return item;
          }
        });
      } else if (get(action, "sectionType") === "helpVideos") {
        categoryDetailsClone.data[get(action, "sectionType")] = {
          ...get(state, "categoryDetails.data.helpVideos"),
          rail: action.isViewMore
            ? [
              ...get(state, "categoryDetails.data.helpVideos.rail", []),
              ...get(action, "apiResponse.data.rail", []),
            ]
            : get(action, "apiResponse.data.rail", []),
        };
      }
      return {
        ...state,
        categoryDetails: categoryDetailsClone,
      };
    case ACTION.HC_SEE_ALL_DATA:
      return {
        ...state,
        hcSeeAllData: get(action, "apiResponse.data", {}),
        hcSeeAllDataItems: [
          ...get(state, "hcSeeAllDataItems", []),
          ...get(action, "apiResponse.data.rail", []),
        ],
      };
    case ACTION.CLEAR_HC_SEE_ALL_DATA:
      return { ...state, hcSeeAllData: {}, hcSeeAllDataItems: [] }; 
    case ACTION.RESET_HC_SEE_ALL_DATA:
      let rail = state.hcSeeAllDataItems.slice(0, 6);
      let resetState={...state.hcSeeAllData,rail}
      return { ...state,hcSeeAllData:resetState, hcSeeAllDataItems:rail, };
    case ACTION.GET_OUTAGE_BANNER_DATA:
      return { ...state, outageBannerData: get(action, "apiResponse") };
    case ACTION.VALIDATE_HELP_CENTER_TOKEN:
      return { ...state, helpCenterTokenDetails: get(action, "apiResponse") };
    case ACTION.HC_POPULARITY_TRACK:
      return { ...state, hCPopularityResp: get(action, "apiResponse") };
    case ACTION.HC_GET_CHAT_NOW_URL:
      return { ...state, helpCenterChatNowResp: get(action, "apiResponse") };
    case ACTION.HC_TICKET:
      return { ...state, hCTicketResp: get(action, "apiResponse") };
    case ACTION.HC_TICKETDETAILS:
      return { ...state, ticketDetail: get(action, "apiResponse") };
    case ACTION.HC_REOPEN_TICKET:
      return { ...state, postReqResponse:get(action, "apiResponse")};
    case ACTION.RENDER_HC_VIEW:
      return { ...state, renderHcView: action?.val};
    case ACTION.CLEAR_HC_TICKET:
        return { ...state, hCTicketResp: []};
    case ACTION.SET_DEEPLINK_FLAG:
        return { ...state, isDeeplinkHandled: action?.val};  

    default:
      return state;
  }
}
