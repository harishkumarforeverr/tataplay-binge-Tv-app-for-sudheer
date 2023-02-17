import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { get, isEmpty } from "lodash";
import { URL } from "@constants/routeConstants";
import Button from "@common/Buttons";
import {
  cloudinaryCarousalUrl,
  isUserloggedIn,
  safeNavigation,
  getCurrentSubscriptionTenureType,
  getSearchParam
} from "@utils/common";
import { closePopup, openPopup } from "@common/Modal/action";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import { MODALS } from "@common/Modal/constants";
import CrownImage from "@assets/images/crown-top-10.png";
import tenureImg from "@assets/images/tenure.svg";
import { hideFooter } from "@src/action";
import {MINI_SUBSCRIPTION, SEARCH_PARAM, SEARCH_PARAM_ACTION_VALUE } from "@utils/constants";
import MoreOptions from "./MoreOptions/index";
import MyPlanButton from "./MyPlanButton";
import PrimeModal from "./PrimeModal";
import { SUBSCRIPTION_STATUS, JOURNEY_SOURCE, PACK_NAME } from "../APIs/constant";
import {
  errorForAPIFailure,
  getComponentList,
  renewSusbcription,
  handleCancelActivePlan,
  getAnalyticsData,
  isPrimeVisible,
} from "../APIs/subscriptionCommon";
import {
  getCurrentSubscriptionInfo,
  getWebPortalLink,
  revokeSubscription,
  setUpdatedTenure,
} from "../APIs/action";
import PrimePack from "../PrimePack";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import { loginInFreemium } from "@utils/common";

import "./style.scss";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";

class MyPlans extends Component {
  componentDidMount = async () => {
    const {
      hideFooter,
      currentSubscription,
      getCurrentSubscriptionInfo,
      setUpdatedTenure,
      history,
    } = this.props;
    hideFooter(true);
    isUserloggedIn() &&
      isEmpty(currentSubscription) &&
      (await getCurrentSubscriptionInfo(false, false, false, true));
    // setUpdatedTenure(); // called here to reset the selected tenure value to empty
    if (!isEmpty(this.props.currentSubscription?.data)) {
      const mixpanel = {};
      let isSubscriptionExpired =
        this.props.currentSubscription?.data?.subscriptionStatus?.toUpperCase() ===
        SUBSCRIPTION_STATUS.DEACTIVE;
      mixpanel[`${MIXPANEL.PARAMETER.PRIME_PACK_ACTIVE}`] = MIXPANEL.VALUE.NO;
      mixpanel[`${MIXPANEL.PARAMETER.PACK_NAME}`] =
        currentSubscription?.data?.productName;
      mixpanel[`${MIXPANEL.PARAMETER.PACK_ACTIVE}`] = isSubscriptionExpired
        ? MIXPANEL.VALUE.NO
        : MIXPANEL.VALUE.YES;
      mixpanel[MIXPANEL.PARAMETER.TENURE] = getCurrentSubscriptionTenureType(this.props?.currentSubscription?.data)
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.MY_PLAN_VIEW, mixpanel);
      appsFlyerConfig.trackEvent(APPSFLYER.EVENT.MY_PLAN);
    }

    if (history.location.state?.tenureOpen) {
     await this.handleChangePlanNavigate();
    }

    // handle pack renew deeplink
    const actionSearchparam = getSearchParam(SEARCH_PARAM.ACTION);
    if ([SEARCH_PARAM_ACTION_VALUE.RENEW].includes(actionSearchparam) && this.props.planOption?.renewButtonOption) {
      this.handleRenewClick();
    }

  };

  componentWillUnmount = () => {
    // this.props.closePopup();
    this.props.hideFooter(false);
  };

  renderPartnerImage = (imgData) => {
    let placeholderImg =
      "../../../assets/images/image-placeholder-app-rail.png";
    return (
      <div className="content-wrapper">
        <img
          src={`${cloudinaryCarousalUrl("", "", 80, 80)}${imgData.iconUrl}`}
          alt=""
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImg;
            e.target.className = "broken-image";
          }}
        />
      </div>
    );
  };

  handleOptions = async () => {
    let {
      openPopup,
      closePopup,
      planOption,
      currentSubscription,
      switchToPackSelection,
      isManagedApp
    } = this.props;
    currentSubscription = get(currentSubscription, "data");
    if (
      currentSubscription?.subscriptionStatus?.toUpperCase() ===
      SUBSCRIPTION_STATUS.DEACTIVE
    ) {
      const headers = {
        initiateSubscription: JOURNEY_SOURCE.MY_PLAN_EDIT,
        journeySource: JOURNEY_SOURCE.MYPLAN_CHANGE,
        journeySourceRefId: "",
        analyticSource: MIXPANEL.VALUE.CHANGE_PLAN,
      };
      !isManagedApp ? switchToPackSelection() : (await this.props.getWebPortalLink(headers))
    } else {
      openPopup(MODALS.CUSTOM_MODAL, {
        modalClass: "alert-modal more-options-container ",
        heading: "More options",
        childComponent: (
          <MoreOptions
            showPlanMessage={get(planOption, "changePlanOption")}
            showTenureMessage={get(planOption, "changeTenureOption")}
            planMessage={get(planOption, "changePlanMessage")}
            tenureMessage={get(planOption, "changeTenureMessage")}
            closePopup={closePopup}
            planIcon={CrownImage}
            tenureIcon={tenureImg}
            handleChangePlanNavigate={this.handleChangePlanNavigate}
            handleTenure={this.handleTenureModal}
            getAnalyticsData={getAnalyticsData}
          />
        ),
        closeModal: true,
        hideCloseIcon: true,
      });
    }

    mixPanelConfig.trackEvent(
      MIXPANEL.EVENT.MY_PLAN_RENEW_OTHER_OPTIONS,
      getAnalyticsData(MIXPANEL)
    );
  };

  handlePrimeCancelAddon = () => {
    let { openPopup } = this.props;

    openPopup(MODALS.CUSTOM_MODAL, {
      modalClass: "alert-modal prime-addon-container ",
      childComponent: (
        <PrimeModal
          handleCancelPlan={(cancelPrime, cancelCurrentSub) =>
            handleCancelActivePlan(cancelPrime, cancelCurrentSub)
          }
        />
      ),
      closeModal: true,
      hideCloseIcon: true,
    });
  };

  handleCancelSuccess = async () => {
    await this.props.getCurrentSubscriptionInfo();
  };

  handleChangePlanNavigate = async () => {
    const { closePopup, switchToPackSelection, history, source, miniSubscription, isManagedApp } = this.props;
    const headers = {
      initiateSubscription: JOURNEY_SOURCE.MY_PLAN_EDIT,
      journeySource: JOURNEY_SOURCE.MYPLAN_CHANGE,
      journeySourceRefId: "",
      analyticSource: MIXPANEL.VALUE.CHANGE_PLAN,
    };

    !isManagedApp ? switchToPackSelection() : (await this.props.getWebPortalLink(headers))
    closePopup();
  };

  handlePlan = () => {
    this.handleChangePlanNavigate();
    mixPanelConfig.trackEvent(
      MIXPANEL.EVENT.MY_PLAN_CHANGE_PLAN,
      getAnalyticsData(MIXPANEL)
    );
  };

  handleTenure = async () => {
    const headers = {
      initiateSubscription: JOURNEY_SOURCE.MY_PLAN_EDIT,
      journeySource: JOURNEY_SOURCE.MYPLAN_TENURE,
      journeySourceRefId: "",
      analyticSource: MIXPANEL.VALUE.CHANGE_TENURE,
    };
    !this.props.isManagedApp ? this.handleTenureModal(): (await this.props.getWebPortalLink(headers))
    mixPanelConfig.trackEvent(
      MIXPANEL.EVENT.MY_PLAN_CHANGE_TENURE,
      getAnalyticsData(MIXPANEL)
    );
  };

  handleTenureModal = async () => {
    let { openPopup, currentSubscription, openLoginPopup, closePopup } =
      this.props;
    currentSubscription = get(currentSubscription, "data");
    // openPopup(MODALS.SUBSCRIPTION_CHANGE_TENURE, {
    //     modalClass: "tenure-selection-modal",
    //     hideCloseIcon: true,
    //     selectedPlan: currentSubscription,
    //     source: "TENURE",
    //     onTenureSelection: this.handleTenureSelection,
    // });
    await loginInFreemium({
      openPopup,
      closePopup,
      openLoginPopup,
      ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE,
      selectedPlan: currentSubscription,
      source: "TENURE",
    });
  };

  handleTenureSelection = () => {
    let { closePopup } = this.props;
    closePopup();
  };

  handleRenewClick = async () => {
    let { history, currentSubscription } = this.props;

    await renewSusbcription(history, true);

    let mixpanel = getAnalyticsData(MIXPANEL);
    let isSubscriptionExpired =
      currentSubscription?.data?.subscriptionStatus?.toUpperCase() ===
      SUBSCRIPTION_STATUS.DEACTIVE;
    mixpanel[`${MIXPANEL.PARAMETER.PACK_ACTIVE}`] = isSubscriptionExpired
      ? MIXPANEL.VALUE.NO
      : MIXPANEL.VALUE.YES;

    mixPanelConfig.trackEvent(MIXPANEL.EVENT.MY_PLAN_RENEW_PLAN, mixpanel);
  };

  handleRevokeClick = async () => {
    let {
      revokeSubscription,
      getCurrentSubscriptionInfo,
      openPopup,
      closePopup,
    } = this.props;
    await revokeSubscription();
    let { revokeSubscriptionRes } = this.props;
    if (
      revokeSubscriptionRes?.code === 0 &&
      !isEmpty(revokeSubscriptionRes?.data)
    ) {
      openPopup(MODALS.ALERT_MODAL, {
        modalClass: "alert-modal error-state-modal",
        headingMessage: get(revokeSubscriptionRes, "data.revokeMessage.title"),
        instructions: get(revokeSubscriptionRes, "data.revokeMessage.message"),
        primaryButtonText: "Ok",
        primaryButtonAction: async () => {
          closePopup();
          await getCurrentSubscriptionInfo();
        },
        hideCloseIcon: true,
        icon: true,
      });
    } else {
      revokeSubscriptionRes?.response?.status !== 500 &&
        errorForAPIFailure(revokeSubscriptionRes);
    }
  };

  handleRegionalAppBtnClick = async () => {
    const headers = {
      initiateSubscription: JOURNEY_SOURCE.MY_PLAN_EDIT,
      journeySource: JOURNEY_SOURCE.MY_PLAN_REGIONAL,
      journeySourceRefId: "",
      analyticSource: MIXPANEL.VALUE.CHANGE_PLAN,
    };
    this.props.isManagedApp ?
    (await this.props.getWebPortalLink(headers)) : this.props.switchToPackSelection()
  }

  render() {
    let {
      currentSubscription,
      planOption,
      switchToPackSelection,
      primePackDetails,
      handleBingeCancelPlan,
      showAddOnCancel,
    } = this.props;
    currentSubscription = get(currentSubscription, "data");
    let partnerList, numberOfApps, isSubscriptionExpired, componentList;
    if (!isEmpty(currentSubscription)) {
      componentList = getComponentList(currentSubscription);
      partnerList = componentList?.partnerList;
      numberOfApps = componentList?.numberOfApps;
      isSubscriptionExpired =
        currentSubscription?.subscriptionStatus?.toUpperCase() ===
        SUBSCRIPTION_STATUS.DEACTIVE;
    }
    return (
      <React.Fragment>
        {!isEmpty(currentSubscription) ? (
          <div className="myplan-bgimage-container my-plan">
            <div className="my-plans-wrapper">
              <h3>My Plan</h3>
              <div
                className={`my-plans-container ${isSubscriptionExpired ? "expired" : ""
                  }`}
              >
                <div className="my-plans-heading">
                  <div className="left-heading">
                    <p className="img-wrapper">
                      <img src={CrownImage} alt="" />
                    </p>
                    <p
                      className={
                        get(currentSubscription, "highlightedPack") && "active"
                      }
                    >
                      {get(currentSubscription, "productName")}
                    </p>
                  </div>
                  <div
                    className={`right-heading ${get(currentSubscription, "highlightedPack") && "active"
                      }`}
                  >
                    <React.Fragment>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: get(currentSubscription, "amount")?.split(
                            ";"
                          )[0],
                        }}
                      />
                      <span>
                        {get(currentSubscription, "amount")?.split(";")[1]}
                      </span>
                    </React.Fragment>
                  </div>
                </div>
                <hr className="border-line" />
                <div className="sub-heading-wrapper">
                  <p className="apps-count">{numberOfApps}</p>
                  {get(currentSubscription, "packValidity") && (
                    <p className="expire-msg">
                      {get(currentSubscription, "packValidity")}
                    </p>
                  )}
                </div>
                <div className="device-details flex-sb">
                  <div className="mobile-wrapper flex-sb">
                    <div>
                      <img
                        src={get(currentSubscription, "deviceDetails.url")}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ErrorImage;
                        }}
                      />
                    </div>
                    <p className="pack-description">
                      {get(currentSubscription, "deviceDetails.platformName")}
                    </p>
                  </div>
                  {get(
                    currentSubscription,
                    "deviceDetails.deviceCount"
                  ) && <p className="app-count">{`${get(
                    currentSubscription,
                    "deviceDetails.deviceCount"
                  )}`}</p>}
                </div>
                <div className="partner-container">
                  {partnerList &&
                    partnerList.map((imgData) => (
                      <React.Fragment key={imgData.partnerId}>
                        {this.renderPartnerImage(imgData)}
                      </React.Fragment>
                    ))}
                </div>
                {get(planOption, "getPlanOption") && (
                  <Button
                    bValue={get(planOption, "getPlanMessage")}
                    cName="btn primary-btn btn-wrapper"
                    clickHandler={switchToPackSelection}
                  />
                )}
                {get(planOption, "revokeButtonOption") && (
                  <React.Fragment>
                    <p className="error-msg">
                      {get(planOption, "revokePlanVerbiage")}
                    </p>
                    <Button
                      clickHandler={this.handleRevokeClick}
                      bValue={get(planOption, "revokeButtonMessage")}
                      cName="btn primary-btn btn-wrapper"
                    />
                  </React.Fragment>
                )}
                {get(currentSubscription, "planOption.getPlanVerbiage") && (
                  <p
                    className={`${get(planOption, "renewButtonOption")
                      ? "error-msg"
                      : "footer-msg"
                      }`}
                  >
                    {get(currentSubscription, "planOption.getPlanVerbiage")}
                  </p>
                )}

                {get(currentSubscription, 'regionalAppInfo.enableRegionalAppCTA') && (
                  <Button
                    clickHandler={this.handleRegionalAppBtnClick}
                    bValue={get(currentSubscription, "regionalAppInfo.enableRegionalAppCTAVerbiage")}
                    cName="btn secondary-btn btn-wrapper regional-app-btn"
                  />
                )}

                <p
                  className={`${get(planOption, "renewButtonOption") || get(planOption, "revokeTextHighlighted")
                    ? "error-msg"
                    : "footer-msg"
                    }`}
                >
                  {get(currentSubscription, "expiryFooterMessage")}
                </p>
                {get(currentSubscription, "sunnxtFooterMessage") && (
                  <p className={"footer-msg"}>{`${get(
                    currentSubscription,
                    "sunnxtFooterMessage"
                  )}`}</p>
                )}

                <p className="footer-msg">
                  {get(currentSubscription, "deviceDetails.mxPlatformName")}
                </p>

                {get(planOption, "renewButtonOption") && (
                  <React.Fragment>
                    <Button
                      clickHandler={this.handleRenewClick}
                      bValue={get(planOption, "renewButtonMessage")}
                      cName="btn primary-btn btn-wrapper"
                    />
                  </React.Fragment>
                )}

                {get(planOption, "otherPlanOptionVerbiage") !== null &&
                  get(planOption, "renewButtonOption") && (
                    <p className="other-option" onClick={this.handleOptions}>
                      {get(planOption, "otherPlanOptionVerbiage")}
                    </p>
                  )}
              </div>

              {!get(planOption, "renewButtonOption") && (
                <React.Fragment>
                  {get(planOption, "changePlanOption") && (
                    <MyPlanButton
                      message={get(planOption, "changePlanMessage")}
                      icon={CrownImage}
                      onClick={this.handlePlan}
                    />
                  )}
                  {get(planOption, "changeTenureOption") && (
                    <MyPlanButton
                      message={get(planOption, "changeTenureMessage")}
                      icon={tenureImg}
                      onClick={this.handleTenure}
                    />
                  )}
                </React.Fragment>
              )}
              {isPrimeVisible() && (
                <PrimePack
                  showAddOnCancel={showAddOnCancel}
                  handleBingeCancelPlan={handleBingeCancelPlan}
                />
              )}
              {planOption?.cancellationOption &&
                planOption?.cancellationOption?.cancelButtonOption && (
                  <p
                    className="cancel-button"
                    onClick={() =>
                      showAddOnCancel()
                        ? this.handlePrimeCancelAddon()
                        : handleBingeCancelPlan(false, true)
                    }
                  >
                    {planOption?.cancellationOption?.cancelButtonMessage}
                  </p>
                )}
            </div>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentSubscription: get(state.subscriptionDetails, "currentSubscription"),
    planOption: get(state.subscriptionDetails,"currentSubscription.data.planOption"),
    primePackDetails: get(state.subscriptionDetails,"currentSubscription.data.primePackDetails"),
    revokeSubscriptionRes: get(state.subscriptionDetails,"revokeSubscriptionRes"),
    isManagedApp: get(state.headerDetails, "isManagedApp"),
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        openPopup,
        closePopup,
        hideFooter,
        getCurrentSubscriptionInfo,
        revokeSubscription,
        setUpdatedTenure,
        openLoginPopup,
        getWebPortalLink
      },
      dispatch
    ),
  };
}

MyPlans.propTypes = {
  hideFooter: PropTypes.func,
  openPopup: PropTypes.func,
  closePopup: PropTypes.func,
  getCurrentSubscriptionInfo: PropTypes.func,
  currentSubscription: PropTypes.object,
  planOption: PropTypes.object,
  revokeSubscription: PropTypes.func,
  history: PropTypes.object,
  switchToPackSelection: PropTypes.func,
  revokeSubscriptionRes: PropTypes.object,
  setUpdatedTenure: PropTypes.func,
  openLoginPopup: PropTypes.func,
  isManagedApp: PropTypes.bool,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(MyPlans);
