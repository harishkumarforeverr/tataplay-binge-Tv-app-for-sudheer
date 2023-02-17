import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import { isUserloggedIn, isMobile, handleOverflowOnHtml } from "@utils/common";
import femaleUser from "@assets/images/chatbot.png";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE } from "@constants";
import { hideMainLoader, showMainLoader ,showMainLoaderImmediate} from "@src/action";

import { fetchChatNowUrlApiResp } from "../../APIs/action";
import { DTH_TYPE } from '@utils/constants';

import "./style.scss";
import { CHATBOT_TYPE } from "@containers/HelpCenter/APIs/constants";

class HelpfulTracker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      thumbsUp: false,
      thumbsDown: false,
    };
  }

  componentDidUpdate(prevProps){
    let {location} = this.props
     if(prevProps.location !== this.props.location){
        if(location?.state?.prevPath !== location?.pathname){
         this.setState({thumbsUp:false,thumbsDown:false})
       }       
     }
  }

  handleThumbsClick = (thumbsUp = false) => {
    this.setState(
      {
        thumbsDown: !thumbsUp,
        thumbsUp: thumbsUp,
      },
      () => {
        this.trackEvents(
          thumbsUp ? MIXPANEL.EVENT.HC_LIKE : MIXPANEL.EVENT.HC_DISLIKE
        );
      }
    );
  };

  chatNowClick = async (event) => {
    event.preventDefault();
    let trackEventsParam = "";

    let { location, isSubTypePlacement, fetchChatNowUrlApiResp, showMainLoaderImmediate } = this.props,
        queryObj = {},
        userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
        chatbotType = userInfo?.dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER ? CHATBOT_TYPE.S360 : CHATBOT_TYPE.ORISERVE;
        queryObj = { subId: userInfo?.bingeSubscriberId,
                     name: userInfo?.firstName, 
                     deviceType: isMobile.any() ? MIXPANEL.VALUE.MOBILE : MIXPANEL.VALUE.WEB };
       
    if (isSubTypePlacement) {
      let { category, subCategory } = this.props.trackDetails;
      queryObj = { ...queryObj, category, subCat: subCategory };

      if (location.pathname.includes("video-detail")) {
        trackEventsParam = MIXPANEL.EVENT.HC_CHAT_VIDEO;
      } else {
        trackEventsParam = MIXPANEL.EVENT.HC_CHAT_FAQ;
      }
    } else {
      trackEventsParam = MIXPANEL.EVENT.HC_CHAT_DEFAULT;
    };
    
    this.trackEvents(trackEventsParam);

    showMainLoaderImmediate();
    if(chatbotType === CHATBOT_TYPE.S360){
      await fetchChatNowUrlApiResp(chatbotType);
      let encryptedSid = this.props.helpCenterChatNowResp?.data;
      let chatConfig = {
        subScriberId: encryptedSid,
        Authenticated:true,
        Action:5,
        hideLoading:true,
        launchOnButton : true
        }
        Simplify360Chat.init(chatConfig);
        let isS360ChatabotOpen = Simplify360Chat.isChatIFrameOpen();
        isS360ChatabotOpen && isMobile.any() && handleOverflowOnHtml();
    }
    else{
      setTimeout(async () => {
        queryObj = {...queryObj, dthStatus: userInfo?.dthStatus};
        let queryParamString = new URLSearchParams(queryObj).toString();
        await fetchChatNowUrlApiResp(chatbotType, queryParamString);
        window.location.href = `${this.props.helpCenterChatNowResp?.data}`;
    }, 4000);
    }   
  };


  analyticsEvent = (eventName, params) => {
    mixPanelConfig.trackEvent(eventName, params);
   // moengageConfig.trackEvent(eventName, params);
  };

  trackEvents = (eventName) => {
    if (this.props.trackDetails) {
      let { id, category, subCategory ,title } = this.props.trackDetails;
      let { location } = this.props;
      let commonParam = {  "CATEGORY": category, "SUB-CATEGORY": subCategory };
      let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
      

      if ((eventName === MIXPANEL.EVENT.HC_LIKE || eventName === MIXPANEL.EVENT.HC_DISLIKE) && location.pathname.includes("video-detail")) {
        this.analyticsEvent(eventName, { "VIDEO-ID": id,  ...commonParam});
      } else if (eventName === MIXPANEL.EVENT.HC_LIKE || eventName === MIXPANEL.EVENT.HC_DISLIKE) {
        this.analyticsEvent(eventName, { "FAQ-ID": id,"SID":userInfo?.sId||"" ,"RMN":userInfo?.rmn ,...commonParam ,"TITLE":title });
      } else if (eventName === MIXPANEL.EVENT.HC_CHAT_FAQ) {
        this.analyticsEvent(eventName, { "FAQ-ID": id , "TITLE":title });
      } else if (eventName === MIXPANEL.EVENT.HC_CHAT_VIDEO) {
        this.analyticsEvent(eventName, { "VIDEO-ID": id });
      }
    } else if (eventName === MIXPANEL.EVENT.HC_CHAT_DEFAULT) {
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_CHAT_DEFAULT);
      moengageConfig.trackEvent(MOENGAGE.EVENT.HC_CHAT_DEFAULT);
    }
  };

  render() {
    let { thumbsUp, thumbsDown } = this.state;
    let { isSubTypePlacement } = this.props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let isChatBotAllowed = (!(userInfo?.dthStatus !== DTH_TYPE.NON_DTH_USER) || 
                            (userInfo?.dthStatus === DTH_TYPE.DTH_W_BINGE_NEW_USER) ||
                            (userInfo?.dthStatus === DTH_TYPE.DTH_W_BINGE_OLD_USER));
    const login = isUserloggedIn();
    return (
      <React.Fragment>
        {(isSubTypePlacement || login) && (
          <div className={`helpful-tracker-container ${(!isSubTypePlacement) ? "container" : ""}`}>
            <div className={`resolve-contr ${(!isSubTypePlacement) ? "more-help-contr" : "" }`}>
              {/* result resolve start */}
              {isSubTypePlacement && (
                <div className="issue-resolve-wrapper">
                  <span className="label-text">Was this helpful?</span>
                  <ul className="helpful">
                    <li
                      className={thumbsUp ? `active` : ""}
                      onClick={() => this.handleThumbsClick(true)}
                    >
                      <div className="thumb-up">&nbsp;</div>
                    </li>
                    <li
                      className={thumbsDown ? "active" : ""}
                      onClick={() => this.handleThumbsClick(false)}
                    >
                      <div className="thumb-down">&nbsp;</div>
                    </li>
                  </ul>
                </div>
              )}
              {/* result resolve end */}
              {thumbsUp && (
                <div className="solve">
                  Great! We&apos;re happy we could help you.
                </div>
              )}
              {(thumbsDown || !isSubTypePlacement) && login && (
                <div className="solve">
                  <div className="solve-down">
                    <div className="topic">
                      <div className="icon-contr">
                        <img src={femaleUser} />
                        <span className="active" />
                      </div>
                      <div className="text-contr">
                        <div
                          // className={`text ${
                          //   isSubTypePlacement ? "text-ellipsis" : ""
                          // }`}
                          className={`text`}
                        >
                          {isSubTypePlacement
                            ? "Lets chat and resolve this issue"
                            : "Do you need more help to resolve your query?"}
                        </div>
                        {login && (
                          <div className="cta-contr">
                            <a
                              href="#!"
                              className="btn btn-tertiary btn-sm waves-effect waves-light w-auto"
                              onClick={this.chatNowClick}
                            >
                              Chat Now
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    helpCenterChatNowResp: get(
      state.helpCenterReducer,
      "helpCenterChatNowResp"
    ),
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchChatNowUrlApiResp,
        hideMainLoader,
        showMainLoader,
        showMainLoaderImmediate,
      },
      dispatch
    ),
  };
}

HelpfulTracker.propTypes = {
  isSubTypePlacement: PropTypes.bool,
  trackDetails: PropTypes.object,
  location: PropTypes.object,
  fetchChatNowUrlApiResp: PropTypes.func,
  helpCenterChatNowResp: PropTypes.object,
  hideMainLoader: PropTypes.func,
  showMainLoader: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(HelpfulTracker);
