import React, { Component } from 'react';
import PropTypes, { string } from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import get from "lodash/get";

import DownwardArrow from '@assets/images/arrow-down.svg';
import UpwardArrow from '@assets/images/arrow-up.svg';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import { isUserloggedIn } from "@utils/common";
import YouTubePlayer from "../YouTubePlayer";
import HelpfulTracker from '../HelpfulTracker';
import { ACCORDION_DEFAULT_LIMIT, checkEmbedLink } from "../../APIs/constants";
import { helpCenterPopularityTrack } from "../../APIs/action";

import './style.scss';
import '../../style.scss';

class Accordion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeElement: "",
      activeFaq:null,
    };
  }

  panelClick = (item) => {
    let {isCampaign} = this.props
    let currentActiveState = this.state.activeElement;
    let state;
    if (currentActiveState !== item.id) {
      state = item.id;
      !isCampaign && this.trackAnalytics(item);
    } else {
      state = "";
    }
    this.setState({
      activeElement: state,
    });
  };

   isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) 
        // rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  faqClickData = (analytics, title) => {
    return {
      [`${analytics.PARAMETER.SOURCE}`]: this.props.screenName,
      [`${analytics.PARAMETER.TITLE}`]: title,
    };
  };

  handleFaqButton = (totalItemsCount, totalDataFetched) => {
   if(totalItemsCount == totalDataFetched){
       this.setState({...this.state,activeFaq:false})
       const scrollContainer = document.getElementById(`${this.props.id}`);
       !this.isInViewport(scrollContainer) &&
        window.scroll({
        top: scrollContainer.offsetTop,
        left: 0,
        behavior: 'smooth'
      });
   }
   else if(totalItemsCount !==totalDataFetched && this.state.activeFaq){
    this.setState({...this.state,activeFaq:true})
   }
   else{
      this.setState((prevState) => ({
       ...this.state, activeFaq: !prevState.activeFaq
      }));
   }
    this.props.handleClick();
  };

  trackAnalytics = async (item) => {
    isUserloggedIn() && (await this.props.helpCenterPopularityTrack(item));
    mixPanelConfig.trackEvent(
      MIXPANEL.EVENT.HC_FAQ_CLICK,
      this.faqClickData(MIXPANEL, item.title)
    );
    moengageConfig.trackEvent(
      MOENGAGE.EVENT.HC_FAQ_CLICK,
      this.faqClickData(MOENGAGE, item.title)
    );
  };

  render() {
    let {
      accordionList,
      title,
      wrapperClassName,
      hideCardBorder = false,
      showHelpfulTracker = true,
      showViewAllSection = false,
      ViewMoreBtnText = "View More",
      totalDataFetched,
      totalItemsCount,
      handleClick,
      subcategory,
      id
    } = this.props;
    let { activeElement ,activeFaq} = this.state;
    
      
    return (
      <section className={`altBg faq-wrapper ${wrapperClassName}`} id={`${id}`}>
        <div className="container">
          {title && (
            <div className="heading-md">
              <h2 className="heading1">{title}</h2>
            </div>
          )}
          <div className={`accordion ${hideCardBorder && "no-border"}  ${wrapperClassName === 'subCategory-faq-wrapper' ? activeFaq ? 'active-Faq-btn':!this.state.activeElement ? 'close-Faq-btn':'':''}`}>
            {accordionList.length > 0 ? (
              accordionList.map((item, index) => {
                const isActive = activeElement === item.id;
                return (
                  <div
                    key={index}
                    className={`card ${
                      index === accordionList.length - 1 &&
                      hideCardBorder &&
                      "acc-last-card"
                    }`}
                  >
                    <div className="card-header">
                      <div onClick={() => this.panelClick(item)}>
                        <span
                          className={`accordion-title ${
                            isActive && "active-accordion-title"
                          }`}
                        >
                          {item.title || item.question}
                        </span>
                        <span>
                          <img
                            src={isActive ? UpwardArrow : DownwardArrow}
                            className="arrow-icon"
                          />
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${
                        isActive ? "collapse-show" : "collapse-hide"
                      }`}
                    >
                      <div className="card-body">
                        <div
                          dangerouslySetInnerHTML={{ __html: item.response || item.answer }}
                        />
                        {checkEmbedLink(item) && (
                          <div className="sub-cat-section mT20">
                            <YouTubePlayer videoLink={item.diyVideoLink ? item.diyVideoLink : item.videoLink} contentId= {item?.id}/>
                          </div>
                        )}
                        {/* {item && JSON.stringify(item)} */}
                        {showHelpfulTracker && (
                          <HelpfulTracker
                            trackDetails={item}
                            isSubTypePlacement
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card-header">
                <div>No related FAQ </div>
              </div>
            )}
          </div>
          {totalItemsCount >= totalDataFetched &&
            totalItemsCount > ACCORDION_DEFAULT_LIMIT && (
              <div className={`view-more-btn `}>
                <a
                  className="btn btn-tertiary btn-sm waves-effect waves-light w-auto mT10"
                  onClick={()=>this.handleFaqButton(totalItemsCount,totalDataFetched)}
                >
                  {totalItemsCount > totalDataFetched
                    ? ViewMoreBtnText
                    : "View Less"}
                </a>
              </div>
            )}
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
    hCPopularityResp: get(state.helpCenterReducer, 'hCPopularityResp'),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            helpCenterPopularityTrack,
        }, dispatch),
    }
}

Accordion.propTypes = {
    accordionList: PropTypes.array,
    title: PropTypes.string,
    wrapperClassName: PropTypes.string,
    showHelpfulTracker: PropTypes.bool,
    handleClick: PropTypes.func,
    hideCardBorder: PropTypes.bool,
    showViewAllSection: PropTypes.bool,
    ViewMoreBtnText: PropTypes.string,
    totalDataFetched: PropTypes.number,
    totalItemsCount: PropTypes.number,
    screenName: PropTypes.string,
    helpCenterPopularityTrack: PropTypes.func,
    hCPopularityResp: PropTypes.object,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Accordion);