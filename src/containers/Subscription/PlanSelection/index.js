import PropTypes from "prop-types";
import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
// import PropTypes from 'prop-types';
import get from "lodash/get";
import PlanCard from "./PlanCard";
import Button from "@common/Buttons";
import { setUpdatedTenure, openMiniSubscription } from "../APIs/action";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import { isMobile, isUserloggedIn, loginInFreemium, safeNavigation, setSubscriptionJourneySource, trackPackSelectionInitiate } from "@utils/common";
import { closePopup, openPopup } from "@common/Modal/action";
import RightArrow from "@assets/images/mini-arrow.svg";
import { MINI_SUBSCRIPTION,LOCALSTORAGE } from "@constants";
import { isfromMini } from "@src/action";
import "./style.scss";
import { isEmpty } from "lodash";
import { URL } from "@utils/constants/routeConstants";
import { getKey, setKey } from "@utils/storage";
import APPSFLYER from "@utils/constants/appsFlyer";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

export class PlanSelection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPack: null,
      isScroll: false,
      isBottom: false
    };
    this.myRef = React.createRef();
  }

  async componentDidMount () {
    const {  miniSubscription, source, isSourceAppsFlyerDeeplink,selectedPlan } = this.props;
    if(!isMobile.any()){
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_INITIATE,{
      [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.APP_LAUNCH,
    });
   }
    if(!isEmpty(selectedPlan)){
      this.setState({ selectedPack:selectedPlan},()=>{
        let scrollElement = document.getElementById(this.state.selectedPack?.productId);
        setTimeout(() => {
        scrollElement.scrollIntoView(true)},0)
      })
    }
    if(!isEmpty(miniSubscription) ){
      this.setState({ selectedPack: miniSubscription.selectedPlan})
    }
    setSubscriptionJourneySource(this.props.source || location?.state?.prevPath || (isSourceAppsFlyerDeeplink ? APPSFLYER.VALUE.DEEPLINK : ""))
    trackPackSelectionInitiate(source);

     if( document.body.contains(document.querySelector('.plan-details-container')) && isMobile.any() ){
       let isHideDownloadHeader = JSON.parse(getKey(LOCALSTORAGE.IS_HIDE_DOWNLOAD_HEADER))
      document.querySelector('.plan-details-container').style.height = isHideDownloadHeader ? `${document.body.clientHeight-250}px` : `${document.body.clientHeight-290}px`      }
    }  
  

  bottomButtons=()=>{
    const {packListingData} = this.props
    const {selectedPack} =this.state
    return (
    <div className={`btn-container ${isMobile.any() && 'mb-down'} `}>
          {packListingData && !this.state.isScroll && <div className='box-shadow' />}
          <div className="proceed-btn">
            <Button
              bValue={"Proceed"}
              cName="btn primary-btn btn-wrapper"
              clickHandler={this.handleTenure}
              disabled={isEmpty(selectedPack)}
            />
          </div>
          <div className="do-later">
            <Button
              bValue={"Do it Later"}
              cName="btn primary-btn btn-wrapper"
              clickHandler={this.handleClose}
            />
          </div>
        </div>
  )}

  handlePackSelection = (e, data) => {
    this.setState({
      selectedPack: data,
    });
    this.props.onPlanSelected?.(data?.productName);
  };
  handleClose = async () => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_DO_IT_LATER,{
      [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.APP_LAUNCH,
    })
    if(!isMobile.any()){
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_CLOSE,this.getMixpanalData())
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_POPUP_CANCEL)

    }
    this.props.closePopup();
    this.props.setUpdatedTenure()
    this.props.openMiniSubscription()
  };
  navigateToLogin = async () => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_EXISTING_USER_LOGIN,{
      [`${MIXPANEL.PARAMETER.SOURCE}`]:  MIXPANEL.VALUE.APP_LAUNCH,
    })
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_CLOSE,this.getMixpanalData())
    await loginInFreemium({
      openPopup,
      closePopup,
      openLoginPopup,
      ComponentName: MINI_SUBSCRIPTION.LOGIN,
      oldFlow:true,
      source:this.props.source,
      isFromCampaign:this.props?.isFromCampaign
    });
    this.props.setUpdatedTenure()
  };
  handleTenure = async () => {
    const {selectedPack}=this.state;
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_PROCEED,{
      [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.APP_LAUNCH,
      [`${MIXPANEL.PARAMETER.PACK_NAME}`]:selectedPack?.productName,
    })
    await loginInFreemium({
      openPopup,
      closePopup,
      openLoginPopup,
      ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE,
      selectedPlan: this.state.selectedPack,
      isfromMiniModal:true,
      isFromCampaign:this.props?.isFromCampaign
    });
  };
  navigateToComparePlans = () => {
    let { closePopup, history, isfromMini, openMiniSubscription } = this.props;
    safeNavigation(this.props.history, {
      pathname: `/${URL.SUBSCRIPTION}`,
      state: { isFromMini: true },
    });
    isfromMini(true);
    openMiniSubscription()
    closePopup();
  };

  scrollPosition = () => {
    const {openMiniSubscription, miniSubscription} = this.props
    if (this.myRef && this.myRef.current) {
      const { scrollTop } = this.myRef.current;
      let miniProps = miniSubscription
      if (scrollTop === 0) {
        this.setState({
          isScroll: false,
        },()=>{
         isMobile.any() && openMiniSubscription({...miniProps,isScroll:false})
        })
      }
      else {
        this.setState({
          isScroll: true,
        },()=>{
          isMobile.any() && openMiniSubscription({...miniProps,isScroll:true})
        })
      }
    }
  }
  getMixpanalData=()=>{
    return {
        [`${MIXPANEL.PARAMETER.PACK_NAME}`]: this.state.selectedPack?.productName || "" ,
        [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.APP_LAUNCH,
        [MIXPANEL.PARAMETER.SUBSCRIPTION_DRAWER_CLOSE] :MIXPANEL.VALUE.YES,
    }
    
   }

   isCurrentPlan = (item) => {
    let {currentSubscription} = this.props;
    return (
        item?.productId === currentSubscription?.productId &&
        get(currentSubscription, "subscriptionStatus")?.toUpperCase() !==
        SUBSCRIPTION_STATUS.DEACTIVE
    );
};

  render() {
    const { packListingData, isLandscape } = this.props;
    const { selectedPack } = this.state;
    return (
      <div className={`plan-wrapper ${isLandscape ? 'disable-events' :''}`}>
        {!isUserloggedIn() &&
          <div className="login-msg">
            <span onClick={this.navigateToLogin}> Existing User Login</span>
            <img src={RightArrow} />
          </div>
        }
        <div className="heading">Choose A Plan & Start Watching</div>
          {packListingData && this.state.isScroll && <div className={`box-shadow-wrapper ${isUserloggedIn() && 'rm-top'}`}/>}
        <div className="plan-details-container" ref={this.myRef} onScroll={this.scrollPosition}>
          {packListingData &&
            packListingData.map((data, key) => (
              <React.Fragment key={data.productId}>
                <PlanCard
                  data={data}
                  handlePackSelection={this.handlePackSelection}
                  selectedPack={this.state.selectedPack}
                />
              </React.Fragment>
            ))}
            {isMobile.any() && this.bottomButtons()}
        </div>
        { !isMobile.any() && this.bottomButtons()}  
      </div>
    );
  }
}
// <div className="compare-plan" >
        //   <span onClick={this.navigateToComparePlans}>Compare Plans</span>
        // </div>

PlanSelection.propTypes = {
  packListingData: PropTypes.array,
  openPopup: PropTypes.func,
  closePopup: PropTypes.func,
  openLoginPopup: PropTypes.func,
  isfromMini: PropTypes.func,
  openMiniSubscription: PropTypes.func,
  currentSubscription: PropTypes.object,
  isLandscape: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  packListingData: get(state.subscriptionDetails, "packListingData"),
  miniSubscription: get(state.subscriptionDetails, "miniSubscription"),
  isLandscape: get(state.commonContent, "isLandscape"),
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        openPopup,
        closePopup,
        openLoginPopup,
        isfromMini,
        setUpdatedTenure,
        openMiniSubscription
      },
      dispatch
    ),
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(PlanSelection);
