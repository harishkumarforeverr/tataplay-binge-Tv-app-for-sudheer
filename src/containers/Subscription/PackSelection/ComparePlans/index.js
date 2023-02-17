import React, { Component , useRef} from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { get } from "lodash";
import PropTypes from "prop-types";

import {
  cloudinaryCarousalUrl,
  scrollToTop,
  loginInFreemium,
} from "@utils/common";
import Button from "@common/Buttons";
import PackDetail from "./PackDetail";
import { getComponentList, getHigherPack } from "../../APIs/subscriptionCommon";
import placeHolderImage from "@assets/images/app-icon-place.svg";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import { closePopup, openPopup } from "@common/Modal/action";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import { isfromMini } from "@src/action";
import { getNotLoggedInPack, setUpdatedTenure} from "@containers/Subscription/APIs/action";
import { isEmpty } from "lodash";
import "./style.scss";
class ComparePlans extends Component {
  constructor(props) {
    super(props);
    this.higherPlan = "";
    this.state = {
      selectedPlan: "",
    };
    this.myRef=React.createRef();

  }

  componentDidMount = async () => {
    scrollToTop();
    let { packListingData = [], isfromMini, miniStatus, checkSubscriptionPage, loggedStatus } = this.props;
     packListingData&&packListingData.length==0&& await this.props.getNotLoggedInPack()

    setTimeout(
      () =>
        this.setState({
          selectedPlan: !!this.props.packListingData.length ? this.props.packListingData[0] : "",
        }),
      0
    );
    this.higherPlan = getHigherPack();
    window.addEventListener("popstate", async () => {
      if (miniStatus) {
        isfromMini(false);
      }
    });
    loggedStatus && checkSubscriptionPage(true)
  };

  componentWillUnmount(){
    this.props.setUpdatedTenure()
    window.removeEventListener("popstate",  () => {
        
      });
  }
  handlePackSelection = (e, packItem) => {
    this.setState({
      selectedPlan: packItem,
    });
  };

  getproviderImage = (iconUrl, lastIcon = false) => {
      return (<div className={`provider-item ${lastIcon && 'last-icon'}`}>
          <img
          alt={"place-holder-image"}
          className={"place-holder-image"}
          src={placeHolderImage} />
          <img
              alt={"provider-image"}
              src={`${cloudinaryCarousalUrl('', '', 100, 100)}${iconUrl}`}
              className='listing-item-image'
              onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = placeHolderImage;
              }}
          /></div>)
  }
  handleOnPlanSelection = () => {
    let { selectedPlan } = this.state;
    let { onPlanSelection } = this.props;
    onPlanSelection(selectedPlan);
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_COMPARE_PLANS_SELECTION);
  };

  handleScroll=(scrollOffset)=>{
    this.myRef.current.scrollLeft += scrollOffset;
}

  render() {
    let { packListingData = [], onPlanSelection } = this.props;
    let { selectedPlan } = this.state;
    const premiumPack = packListingData && packListingData[0];
    const componentList = getComponentList(premiumPack);
    const premiumVIPList = componentList&&componentList?.partnerList;

    return (
      <div className={"compare-plan-container"}>
        <div className="compare-plan-title">Compare Plans</div>
        <div className="compare-plan-listing" >
          {premiumVIPList && !!premiumVIPList.length && (
            <ul className="provider-list">
              {premiumVIPList &&
                premiumVIPList.map((item, index) => {
                  return (
                    <>
                      <li key={item.partnerId} className="provider-name">
                        <div>
                          {this.getproviderImage(item.iconUrl)}
                        </div>
                        <div className="hr" />
                        {index === premiumVIPList.length - 1 && (
                          <div className="list">
                            <div>Devices</div>
                            <div>No. of Devices</div>
                          </div>
                        )}
                      </li>
                    </>
                  );
                })}
            </ul>
          )}
          <div className="plan-container" ref={this.myRef}>
            {!!packListingData.length &&
              packListingData.map((packItem, index) => {
                return (
                  <PackDetail
                    key={index}
                    packItem={packItem}
                    selectedPlan={selectedPlan}
                    handlePackSelection={this.handlePackSelection}
                  />
                );
              })}
          </div>
          <div className="arrow-nav" onClick={()=>this.handleScroll(200)}>
            <i className="icon-Path" />
          </div>
        </div>
        {!!packListingData.length &&
          packListingData.map(
            (item, index) =>
              item?.productName === this.higherPlan?.productName && (
                <div className="pack-footer-message">
                  <div>{item.sunnextFooterMessage}</div>
                  <div>{item.packFooterMessage}</div>
                </div>
              )
          )}
        {isEmpty(this.props.miniSubscription)&&<div className="pack-action">
          <Button
            bValue="Proceed"
            cName="btn primary-btn"
            disabled={!selectedPlan}
            clickHandler={this.handleOnPlanSelection}
          />
        </div>}
      </div>
    );
  };
}
	
const mapStateToProps = (state) => {	
  return {	
    packListingData: get(state.subscriptionDetails, "packListingData"),	
    miniStatus: get(state.commonContent, "miniStatus"),	
    loggedStatus: get(state.commonContent, "loggedStatus"),	
    miniSubscription:  get(state.subscriptionDetails, "miniSubscription")
  };	
};
function mapDispatchToProps(dispatch) {	
  return {	
    ...bindActionCreators(	
      {	
        openPopup,	
        closePopup,	
        openLoginPopup,	
        isfromMini,	
        getNotLoggedInPack,	
        checkSubscriptionPage,
        setUpdatedTenure
      },	
      dispatch	
    ),	
  };	
}

ComparePlans.propTypes = {
  packListingData: PropTypes.array,
  onPlanSelection: PropTypes.func,
  isfromMini: PropTypes.func,
  miniStatus: PropTypes.bool,
  getNotLoggedInPack:PropTypes.func,
  loggedStatus: PropTypes.bool,
  setUpdatedTenure: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ComparePlans);
