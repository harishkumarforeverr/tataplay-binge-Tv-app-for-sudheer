import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";
import Slider from "react-slick";
import { isEmpty } from "lodash";

import { hideMainLoader, showMainLoader, fromLoginLoader } from "@src/action";
import { isUserloggedIn, isMobile, safeNavigation, getAnonymousId, callLogOut, isHelpCenterWebView, 
         getSearchParam, hasSearchParamKey, getSearchParams } from "@utils/common";
import { URL } from "@constants/routeConstants";
import { openPopup } from "@common/Modal/action";
import { getProfileDetails } from "@containers/Profile/APIs/action";
import { updateUser } from "@containers/Login/LoginCommon";
import { getKey, setKey } from "@utils/storage";
import { LOCALSTORAGE } from "@constants";
import { getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

import HelpCard from "../Common/HelpCard";
import HelpVideoCard from "../Common/HelpVideoCard";
import Search from "../Common/Search";
import { TRENDING_TYPE } from "../APIs/constants";
import { getTrendingList, getCategoryList, getOutageBannerData, validateHelpCenterUrl, getTicket, renderHcView, setDeeplinkFlag } from "../APIs/action";
import { FAQ_DEFAULT_LIMIT, ACCORDION_DEFAULT_LIMIT, CATEGORY_DEFAULT_LIMIT, USER_TYPE, OFFSET_DEFAULT_VALUE } from "../APIs/constants";
import TicketCard from "../Common/TicketCard";
import PastRequest from "../Common/PastRequest";
import { HC_SCREEN_NAME } from "../APIs/constants";
import HelpfulTracker from "../Common/HelpfulTracker";
import { setLoginManual } from "../../Login/APIs/actions";
import Faq from "../Common/Faq";

import "./style.scss";
import "../style.scss";

class LandingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStatusOpen: null,
      isStatusClose: null,
      showChatbot: false,
      renderView: false,
    }
  };

  componentDidMount = async () => {
    if (!isHelpCenterWebView()) {
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_URL_VISIT);
    }
   this.loginOnHelpCenter();
  };

  statusCheck = (ticketRes) => {
    let isStatusOpen =
      ticketRes !== undefined &&
      ticketRes.length > 0 &&
      ticketRes?.find((data) => data?.status?.toLowerCase() == "open");

    this.setState({
      ...this.state,
      isStatusOpen: isStatusOpen,
    });
  };

  /**
   * @function checkToken, will check if the passed token value is a valid token or not
   * @param {*} tokenValue 
   * @returns boolean
   */
  checkToken = (tokenValue) => {
   return tokenValue !== "" && tokenValue !== undefined && tokenValue !== null && !tokenValue.includes('?isUserLoggedIn=false');
  };

  /**
   * @function setLocalHCValues, to set the local storage value needed for further flows
   * @param {*} hcToken 
   */
  setLocalHCValues = (hcToken) => {
    setKey(LOCALSTORAGE.BE_REGISTERED_DEVICE, true);
    setKey(LOCALSTORAGE.IS_HELP_CENTER_IN_MOBILE_APP, true);
    setKey(LOCALSTORAGE.HELP_CENTER_TOKEN, hcToken);
  };

 /**
  * @function loginOnHelpCenter, will handle the silent login scenario in web small/ in app browser flow
  */
  loginOnHelpCenter = async () => {
   let { fromLoginLoader } = this.props;
   fromLoginLoader(true);

    if (isMobile.any() && isHelpCenterWebView()) {
    // silent login block - only when user hc is opened in in-app browser
    let hcToken = getSearchParam('token'), // token from URL
    helpCenterToken = getKey(LOCALSTORAGE.HELP_CENTER_TOKEN), // token saved in local store from last visit
    hcDeeplinkUrl = getSearchParam('hcDeeplinkUrl'),
    checkDeeplinkUrl = !isEmpty(hcDeeplinkUrl) && hcDeeplinkUrl !== '',
    { validateHelpCenterUrl, history, getProfileDetails, getCurrentSubscriptionInfo } = this.props,
    isHcTokenValid = hcToken !== "" && hcToken !== undefined && !hcToken.includes('?isUserLoggedIn=false'),
    isLocalHcTokenValid = helpCenterToken !== "" || helpCenterToken !== undefined && !helpCenterToken.includes('?isUserLoggedIn=false');


      isHelpCenterWebView() && setKey(LOCALSTORAGE.IS_HELP_CENTER_IN_MOBILE_APP, true);
      /**  Cases in which we will logout user first 
      *  1) when local hc token is not same as url hcToken 
      *  2) hcToken inclues isUserLoggedIn
      *  3) user already logged in
      */
      if (isUserloggedIn() && 
      (hasSearchParamKey('isUserLoggedIn') || 
      (!this.checkToken(helpCenterToken) || (this.checkToken(helpCenterToken) && this.checkToken(hcToken) && helpCenterToken !== hcToken)))) {
        await callLogOut(false, history, false);
        setKey(LOCALSTORAGE.HELP_CENTER_TOKEN, "");
      }

      // if (isUserloggedIn() &&
      //   (hcToken && hcToken.includes('?isUserLoggedIn=false') ||
      //     (!isLocalHcTokenValid || (isLocalHcTokenValid && isHcTokenValid && helpCenterToken !== hcToken)))) {
      //       await callLogOut(history, false);
      //       setKey(LOCALSTORAGE.HELP_CENTER_TOKEN, "");
      // }

      /** Silent login flow handling */
      if (this.checkToken(hcToken) && helpCenterToken !== hcToken) {
        this.setLocalHCValues(hcToken);
        await validateHelpCenterUrl(hcToken);
        await getAnonymousId(false);
        await this.updateExistingUser(this.props.helpCenterTokenDetails);

        isEmpty(this.props.existingUserLogindata) && fromLoginLoader(false);
        !isEmpty(this.props.existingUserLogindata) && await getProfileDetails();
        isEmpty(this.props.currentSubscription) && await getCurrentSubscriptionInfo();
        
        this.props.setLoginManual(true);
        checkDeeplinkUrl && !this.props.isDeeplinkHandled && this.handleDeeplinkURLs();
      }
      else {
        checkDeeplinkUrl && !this.props.isDeeplinkHandled && this.handleDeeplinkURLs();
      }
      this.loadHandler();
    }
    else {
      setKey(LOCALSTORAGE.IS_HELP_CENTER_IN_MOBILE_APP, false);
      this.loadHandler();
    }
    fromLoginLoader(false);
  };

  updateExistingUser = async (helpCenterTokenDetails) => {
    const data = get(helpCenterTokenDetails, "data"),
   { baId, bingeSubscriberId, dthStatus,userAuthenticateToken, deviceAuthenticateToken } = data,
     payload = {
      baId, bingeSubscriberId, dthStatus,
      subscriberId: data?.sId,
      rmn: data?.mobileNumber,
      otp: data?.login,
      userAuthenticateToken, deviceAuthenticateToken,
      helpCenterSilentLogin: true,
      showLoader: false,
    };
    await updateUser(payload);
  };

  /**
   * @function loadHandler, API calls of landing page and ticket block visibility handling
   */
  loadHandler = async () => {
    const { getTrendingList, getCategoryList, showMainLoader, hideMainLoader, getOutageBannerData, getTicket, renderHcView, fromLogin } = this.props,
    userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
    data = { limit: 50, offset: 0 },
    userType = isUserloggedIn() ? USER_TYPE.LOGGED_IN : USER_TYPE.GUEST;

    !fromLogin && showMainLoader();

    userInfo?.accessToken && userInfo?.bingeSubscriberId && await getTicket(data);
    const {ticketRes} = this.props;
    userInfo?.accessToken && this.statusCheck(ticketRes);

    await getOutageBannerData();
    await getTrendingList(TRENDING_TYPE.FAQ, FAQ_DEFAULT_LIMIT, OFFSET_DEFAULT_VALUE, userType);
    await getCategoryList(TRENDING_TYPE.FAQ, CATEGORY_DEFAULT_LIMIT, OFFSET_DEFAULT_VALUE, userType);
    await getTrendingList(TRENDING_TYPE.HELP_VIDEO, ACCORDION_DEFAULT_LIMIT, OFFSET_DEFAULT_VALUE, userType);

    let isStatusClose = ticketRes !== undefined && ticketRes?.length > 0 && ticketRes?.find((data) => data?.status?.toLowerCase() == "close");
    this.setState({ ...this.state, isStatusClose: isStatusClose, showChatbot: true, renderView: true });

    renderHcView(true);
    !fromLogin && hideMainLoader();
  };

  /**
   * @function handleDeeplinkURLs, will handle the deeplloink scenario when user is coming in APP to open help center internal pages directly
   */
  handleDeeplinkURLs = () => {
    let hcDeeplinkUrl = getSearchParam('hcDeeplinkUrl');
    const { history, setDeeplinkFlag, isDeeplinkHandled } = this.props;
    setDeeplinkFlag(true);
    if(hcDeeplinkUrl?.toLowerCase().includes(`/${URL.HC_CATEGORY}`)){
      const urlString = history?.location?.search,
      categoryName = (urlString.split('?')?.[2])?.split('=')?.[1],
      pathname = `${hcDeeplinkUrl}?${URL.HC_CATEGORY_NAME}=${categoryName}`;
      !isDeeplinkHandled && safeNavigation(history, pathname);
    } 
    else if(hcDeeplinkUrl?.toLowerCase().includes(`/${URL.HC_TICKET}`)){
      // if deeplink for  ticket screen comes in URL and user is not logged in redirect to landing screen
      !isUserloggedIn() ? safeNavigation(history, `/${URL.HELP_CENTER}`) : safeNavigation(history, `/${hcDeeplinkUrl}`);
    }
    else if(hcDeeplinkUrl?.toLowerCase().includes(`/${URL.HC_SEARCH_RESULT}`)){
      safeNavigation(history, `/${hcDeeplinkUrl}`);
    }
  };

  handleOutageBannerClick = (item) => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_OUTAGE_BANNER_CLICK, {
      [`${MIXPANEL.PARAMETER.SOURCE}`]: HC_SCREEN_NAME.LANDING_SCREEN,
      [`${MIXPANEL.PARAMETER.DETAILS}`]: item?.faqLinkId ? item?.faqLinkId : "",
      [`${MIXPANEL.PARAMETER.TITLE}`]: item?.title ? item?.title : "",
    })
    item?.faqLinkId &&
      safeNavigation(this.props.history, {
        pathname: `/${URL.HELP_CENTER}/${URL.HC_SEARCH_RESULT}/${item.faqLinkId}/${item.type}`,
        state: {
          id: item?.faqLinkId,
          category: item?.category,
          type: item?.type,
          searchValue: item?.title,
        },
      });
  };

  handleNavigate = (isViewPastRequest) => {
    if (isViewPastRequest) {
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_TICKET_VIEW_PAST_REQUEST, {
        [`${MIXPANEL.PARAMETER.SOURCE}`]: HC_SCREEN_NAME.LANDING_SCREEN,
      })
    }
    else {
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_TICKET_VIEW_DETAIL, {
        [`${MIXPANEL.PARAMETER.SOURCE}`]: HC_SCREEN_NAME.LANDING_SCREEN,
      })

    }
    safeNavigation(this.props.history, {
      pathname: `/${URL.HELP_CENTER}/${URL.HC_TICKET}`,
      state: {
        id: isViewPastRequest,
      },
    });
  };

  render() {
    const {
      faqDataList,
      categoryList = [],
      helpVideoList,
      outageBannerData,
      ticketRes,
    } = this.props;
    const { isStatusOpen, isStatusClose, showChatbot } = this.state;
    let settings = {
      dots: !!isMobile.any(),
      autoplay: true,
      infinite: true,
      adaptiveHeight: true,
      arrows: !isMobile.any(),
    };
    return (
      <React.Fragment>
        {this.state.renderView && <div className="help-center-container">
          {/* <!-- search start --> */}
          <Search title="What can we help you with today?" />
          {/* <!-- search end --> */}

          {/* <!-- outage banner start --> */}
          {outageBannerData && (
            <div className={"outage-banner-section"}>
              <Slider {...settings}>
                {outageBannerData &&
                  outageBannerData.map((item, index) => {
                    return (
                      <div key={index}>
                        <p
                          style={{ backgroundColor: item.backgroundColor }}
                          onClick={() => this.handleOutageBannerClick(item)}
                        >
                          <span>{item.title}</span>
                        </p>
                      </div>
                    );
                  })}
              </Slider>
            </div>
          )}
          {/* <!-- outage banner end --> */}
          {isStatusOpen &&
            isStatusOpen !== false &&
            typeof isStatusOpen !== undefined && (
              <div className="ticket-card-container">
                <div className=" container">
                  <TicketCard
                    externalID={isStatusOpen.externalId}
                    description={isStatusOpen.description}
                    status={isStatusOpen.status}
                    raisedDate={isStatusOpen.creationDate}
                    closeDate={isStatusOpen.expectedResolutionDate}
                    isLandingPage={true}
                    handleNavigate={() => this.handleNavigate(false)}
                    id={isStatusOpen.id}
                    subCategory={isStatusOpen.subCategory}
                    leafCategory={isStatusOpen.leafCategory}
                    imageStatusWidth={"15"}
                  />
                </div>
              </div>
            )}
          {/* <!-- most frequently asked section start --> */}
          {get(faqDataList, "rails[0].rail") &&
            faqDataList?.rails[0]?.rail?.length > 0 && (
              <Faq
                showHelpfulTracker={true}
                accordionList={faqDataList.rails[0].rail}
                title={faqDataList.rails[0].title}
                screenName={HC_SCREEN_NAME.LANDING_SCREEN}
              />
            )}
          {/* <!-- most frequently asked section end --> */}

          {/* <!-- categories start -->	 */}
          {categoryList?.data?.length > 0 && (
            <HelpCard helpCardList={categoryList} />
          )}
          {/* <!-- categories end -->	 */}

          {/* <!-- self video start --> */}
          {helpVideoList?.rails &&
            helpVideoList?.rails[0]?.rail?.length > 0 && (
              <HelpVideoCard
                helpVideoList={helpVideoList?.rails[0].rail}
                seeAllUrl={helpVideoList?.rails[0].seeAllUrl}
                title={helpVideoList?.rails[0].title}
                showViewAllSection={
                  helpVideoList?.rails[0].totalCount >
                  helpVideoList?.rails[0].rail.length
                }
                screenName={HC_SCREEN_NAME.LANDING_SCREEN}
              />
            )}
          {/* <!-- self video end --> */}
          {isStatusClose &&
            isStatusClose !== false &&
            typeof isStatusClose !== undefined && (
              <PastRequest handleNavigate={() => this.handleNavigate(true)} />
            )}
          {showChatbot && <HelpfulTracker isSubTypePlacement={false} />}
        </div>}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  faqDataList: get(state.helpCenterReducer, "faqDataList.data"),
  categoryList: get(state.helpCenterReducer, "categoryList.data"),
  helpVideoList: get(state.helpCenterReducer, "helpVideoList.data"),
  outageBannerData: get(state.helpCenterReducer, "outageBannerData.data.rails"),
  helpCenterTokenDetails: get(state.helpCenterReducer, "helpCenterTokenDetails"),
  ticketRes: get(state.helpCenterReducer, "hCTicketResp.data"),
  existingUserLogindata: get(state.loginReducer, "existingUser.data"),
  configResponse: get(state.headerDetails, 'configResponse.data.config'),
  currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
  fromLogin: get(state.commonContent, "fromLogin"),
  isDeeplinkHandled: get(state.helpCenterReducer, "isDeeplinkHandled"),
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        showMainLoader,
        hideMainLoader,
        getTrendingList,
        getCategoryList,
        getOutageBannerData,
        validateHelpCenterUrl,
        getProfileDetails,
        getTicket,
        openPopup,
        setLoginManual,
        fromLoginLoader,
        renderHcView,
        getCurrentSubscriptionInfo,
        setDeeplinkFlag
      },
      dispatch
    ),
  };
}

LandingScreen.propTypes = {
  showMainLoader: PropTypes.func,
  hideMainLoader: PropTypes.func,
  faqDataList: PropTypes.object,
  categoryList: PropTypes.object,
  getTrendingList: PropTypes.func,
  getCategoryList: PropTypes.func,
  getOutageBannerData: PropTypes.func,
  validateHelpCenterUrl: PropTypes.func,
  hcToken: PropTypes.string,
  openPopup: PropTypes.func,
  helpVideoList: PropTypes.object,
  history: PropTypes.object,
  outageBannerData: PropTypes.array,
  helpCenterTokenDetails: PropTypes.object,
  getProfileDetails: PropTypes.func,
  ticketRes: PropTypes.array,
  getTicket: PropTypes.func,
  existingUserLogindata: PropTypes.object,
  location: PropTypes.object,
  configResponse: PropTypes.object,
  fromLoginLoader: PropTypes.func,
  renderHcView: PropTypes.func,
  getCurrentSubscriptionInfo: PropTypes.func,
  currentSubscription: PropTypes.object,
  fromLogin: PropTypes.bool,
  isDeeplinkHandled: PropTypes.bool,
  setDeeplinkFlag: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(LandingScreen);
