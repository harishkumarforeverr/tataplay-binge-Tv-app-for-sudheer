import HelpCenterServiceInstance from "../APIs/service";
import { ACTION, TRENDING_TYPE } from "../APIs/constants";
import { hideMainLoader, showMainLoader } from "@src/action";

export const getTrendingList = (type, limit, offset, visibleTo) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getTrendingList(
      type,
      limit,
      offset,
      visibleTo
    )
      .then(function (response) {
        dispatch({
          type:
            type === TRENDING_TYPE.FAQ
              ? ACTION.GET_FAQ_LIST
              : ACTION.GET_HELP_VIDEO,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while fetching FAQ:- " + error);
      });
  };
};

export const getCategoryList = (type, limit, offset, visibleTo) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getCategoryList(
      type,
      limit,
      offset,
      visibleTo
    )
      .then(function (response) {
        dispatch({
          type: ACTION.GET_CATEGORY_LIST,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while fetching FAQ:- " + error);
      });
  };
};

export const getSearchResult = (params) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getSearchResult(params)
      .then(function (response) {
        dispatch({
          type: ACTION.GET_SEARCH_RESULT,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while fetching FAQ search result:- " + error);
      });
  };
};

export const getSearchAutoComplete = (params) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getSearchAutoComplete(params)
      .then(function (response) {
        dispatch({
          type: ACTION.GET_SEARCH_AUTO_COMPLETE,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while fetching Category Details:- " + error);
      });
  };
};

export const getCategoryDetail = (params) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getCategoryDetail(params)
      .then(function (response) {
        dispatch({
          type: ACTION.GET_CATEGORY_DEATILS,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log(
          "Error while fetching search auto complete response:- " + error
        );
      });
  };
};

export const clearDetails = (actionName) => {
  return (dispatch) => dispatch({ type: actionName });
};

export const getHCViewMoredata = (params, actionName) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getHCViewMoredata(params)
      .then(function (response) {
        dispatch({
          type: actionName,
          sectionType: params.type,
          title: params.title,
          apiResponse: response,
          isViewMore: params.isViewMore,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while fetching view more data:- " + error);
      });
  };
};

export const clearSeeAllVideoData = () => {
  return (dispatch) => dispatch({ type: ACTION.CLEAR_HC_SEE_ALL_DATA });
}
export const resetSeeAllVideoData = () => {
  return (dispatch) => dispatch({ type: ACTION.RESET_HC_SEE_ALL_DATA });
};


export const getOutageBannerData = () => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getOutageBannerData()
      .then(function (response) {
        dispatch({
          type: ACTION.GET_OUTAGE_BANNER_DATA,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while fetching outage banner data:- " + error);
      });
  };
};

export const validateHelpCenterUrl = (params) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.validateHelpCenterUrl(params)
      .then(function (response) {
        dispatch({
          type: ACTION.VALIDATE_HELP_CENTER_TOKEN,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while validating help center token:- " + error);
      });
  };
};

export const helpCenterPopularityTrack = (item) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.helpCenterPopularityTrack(item)
      .then(function (response) {
        dispatch({
          type: ACTION.HC_POPULARITY_TRACK,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while tracking help center popularity:- " + error);
      });
  };
};

export const fetchChatNowUrlApiResp = (chatbotType, queryParams) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.fetchChatNowUrlApiResp(chatbotType, queryParams)
      .then(function (response) {
        dispatch({
          type: ACTION.HC_GET_CHAT_NOW_URL,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while tracking help center chat encrypted data:- " + error);
      });
  };
};

export const getTicket = (Data,showLoader=true) => {
  return (dispatch) => {
    showLoader && dispatch(showMainLoader());
    return HelpCenterServiceInstance.getTicket(Data,showLoader)
      .then(function (response) {
        dispatch({
          type: ACTION.HC_TICKET,
          apiResponse: response,
        });
        showLoader && dispatch(hideMainLoader());
        return response;

      })
      .catch((error) => {
        showLoader && dispatch(hideMainLoader());

        console.log("Error while fetching ticket list:- " + error);
      });
  };
};
export const getTicketDetails = (id) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.getTicketDetails(id)
      .then(function (response) {
        dispatch({
          type: ACTION.HC_TICKETDETAILS,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while fetching ticket details:- " + error);
      });
  };
};
export const postReopenTicket = (payload) => {
  return (dispatch) => {
    return HelpCenterServiceInstance.postReopenTicket(payload)
      .then(function (response) {
        dispatch({
          type: ACTION.HC_REOPEN_TICKET,
          apiResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.log("Error while reopening ticket - " + error);
      });
  };
};

export const renderHcView = (val) => {
  return{ type: ACTION.RENDER_HC_VIEW, val}
};

export const setDeeplinkFlag = (val) => {
  return{ type: ACTION.SET_DEEPLINK_FLAG, val}
};

export const clearTicketData = () => {
  return{ type: ACTION.CLEAR_HC_TICKET}
}
