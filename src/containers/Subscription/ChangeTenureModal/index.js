import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { get, isEmpty } from "lodash";
import PropTypes from "prop-types";

import { getKey, setKey } from "@utils/storage";
import store from "@src/store";
import { closePopup, openPopup } from "@common/Modal/action";
import Button from "@common/Buttons";
import RadioButton from "@common/RadioButton";
import {
  cloudinaryCarousalUrl,
  getPackModificationType,
  safeNavigation,
  loginInFreemium,
  isUserloggedIn,
  getCurrentSubscriptionTenureType,
  isSubscriptionDiscount,
} from "@utils/common";
import { URL } from "@constants/routeConstants";
import { LOCALSTORAGE, MINI_SUBSCRIPTION, MOBILE_BREAKPOINT } from "@constants";
import MontlyCalenderIcon from "@assets/images/monthly-calender.svg";
import YearlyCalenderIcon from "@assets/images/yearly-calender.svg";
import { DTH_TYPE } from "@utils/constants";
import APPSFLYER from "@utils/constants/appsFlyer";
import appsFlyerConfig from "@utils/appsFlyer";

import {
  addNewSubscription,
  modifyExistingSubscription,
  setUpdatedTenure,
  tenureAccountBal,
  validateSelectedPack,
  openMiniSubscription
} from '../APIs/action';
import { ACTION, ACCOUNT_STATUS, DISCOUNT_SOURCE } from '../APIs/constant';
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import {
  checkCurrentSubscription,
  errorForAPIFailure,
  handleSubscriptionCall,
  isSubscriptionFreemium,
} from "../APIs/subscriptionCommon";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import "./style.scss";
import googleConversionConfig from "@utils/googleCoversion";
import googleConversion from "@utils/constants/googleConversion";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import FIREBASE from "@utils/constants/firebase";
import trackEvent from "@utils/trackEvent";

class ChangeTenureModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updatedTenure: "",
    };
  }

  componentDidMount = () => {
    let { selectedPlan, setUpdatedTenure } = this.props;
    let tenureList = get(selectedPlan, "tenure", []);
    setUpdatedTenure();

    if (!isEmpty(tenureList)) {
      let enabledTenureItem = tenureList.filter((i) => i?.enable);
      let defaultSelectedTenure =
        enabledTenureItem.length && enabledTenureItem[0];

      !isEmpty(defaultSelectedTenure) &&
        setTimeout(() => {
          this.handleTenureSelection(defaultSelectedTenure);
        }, 0);
    }

    mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_TENURE_VIEW);
  };

  componentWillUnmount = () => {
    const { tenureAccountBalance } = this.props;
    if (
      tenureAccountBalance?.currentBalance ||
      tenureAccountBalance?.payableAmount
    ) {
      store.dispatch({
        type: ACTION.GET_ACCOUNT_BALALNCE,
        apiResponse: {},
      });
    }
  };

  handleTenureSelection = async (updatedTenure) => {
    let { setUpdatedTenure, currentSubscription } = this.props;

    this.setState({ updatedTenure }, () => {
      setUpdatedTenure(updatedTenure);
    });
    let userHasPlan = !checkCurrentSubscription(currentSubscription);
    let isSubscriptionDeactive = get(currentSubscription, 'subscriptionStatus') === ACCOUNT_STATUS.DEACTIVE;
    let shouldFetchProrated = !isSubscriptionDeactive && !currentSubscription?.freeTrialStatus;

    if (userHasPlan && shouldFetchProrated) {
      let currentPack =
        get(currentSubscription, "tenure") &&
        get(currentSubscription, "tenure").find((item) => item.currentTenure),
        currentProductId = get(currentSubscription, "productId"),
        params = {
          updatedPackId: get(updatedTenure, "tenureId"),
          currentPackId:
            get(currentSubscription, "productId") === "DEFAULT"
              ? get(currentSubscription, "productId")
              : get(currentPack, "tenureId", currentProductId),
          source: isSubscriptionDiscount(this.props.history) ? DISCOUNT_SOURCE :'',
        };
      await this.props.tenureAccountBal(params); //prorated amount API
    }
  };

  onProceedClick = async () => {
    const {
      openLoginPopup,
      openPopup,
      closePopup,
      validateSelectedPack,
      history,
      source,
      tenureAccountBalance,
      currentSubscription,
      selectedPlan,
      isFromCampaign
    } = this.props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
    const {prevPath} = location?.state || {};
    if (isEmpty(userInfo)) {
      await loginInFreemium({
        openPopup,
        closePopup,
        openLoginPopup,
        ComponentName: MINI_SUBSCRIPTION.LOGIN,
        updatedTenure: this.state.updatedTenure,
        selectedPlan:this.props.miniSubscription?.selectedPlan || this.props.selectedPlan,
        source: MIXPANEL.VALUE.SUBSCRIBE,
        isfromMiniModal: this.props.miniSubscription?.isfromMiniModal,
        isFromCampaign: isFromCampaign
      });     
    } else {
      // let {validateSelectedPack, history, source, tenureAccountBalance, currentSubscription} = this.props,
      let { updatedTenure } = this.state,
        userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
        isNonFreemiumDthUser =
          !isSubscriptionFreemium() &&
          userInfo.dthStatus !== DTH_TYPE.NON_DTH_USER; // non freemium and non dth user

      if (isNonFreemiumDthUser) {
        // if user is non-freemium i.e subscriptionType !== FREEMIUM and non dth user,
        // then in this case add and modify will be called on Make payment button click on balane info page
        setKey(LOCALSTORAGE.IS_NON_FREEMIUM_NON_DTH_SUBSCRIPTION_FLOW, true);
        safeNavigation(history, `${URL.BALANCE_INFO}`);
      } else {
        // pack validate API will be called only for FREEMIUM users.
        let discountPayload = (isSubscriptionDiscount(this.props.history) && get(selectedPlan,'discountList') &&{ offerId: get(selectedPlan,'discountList')[0]?.offerId, source: DISCOUNT_SOURCE })
        isSubscriptionFreemium() &&
          (await validateSelectedPack({...{tenureId:updatedTenure?.tenureId}, ...discountPayload}));
        let commonState = store.getState();
        let validateSelectedPackResp = get(
          commonState.subscriptionDetails,
          "validateSelectedPackResp"
        );
        let showValidateApiError =
          validateSelectedPackResp?.code !== 0 &&
          validateSelectedPackResp?.response?.status !== 500 &&
          isEmpty(validateSelectedPackResp?.data) &&
          isSubscriptionFreemium();
        if (showValidateApiError) {
          return errorForAPIFailure(validateSelectedPackResp);
        }
        handleSubscriptionCall(history, true );
      }
      this.props.openMiniSubscription()
    }
    let mixpanel = {
      [`${MIXPANEL.PARAMETER.PAYABLE_AMOUNT}`]:
        get(tenureAccountBalance, "payableAmount")?.split(";")[1] ||
        this.state.updatedTenure?.offeredPriceValue,
      [`${MIXPANEL.PARAMETER.DURATION}`]: this.state.updatedTenure?.tenureType,
      [`${MIXPANEL.PARAMETER.CHANGE_PLAN}`]:
        source === "PLAN" && isEmpty(currentSubscription)
          ? MIXPANEL.VALUE.NO
          : source === "PLAN" && !isEmpty(currentSubscription)
            ? MIXPANEL.VALUE.YES
            : MIXPANEL.VALUE.NO,
      [`${MIXPANEL.PARAMETER.CHANGE_TENURE}`]:
        source === "TENURE" ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
      [`${MIXPANEL.PARAMETER.TYPE}`]: isEmpty(currentSubscription)
        ? MIXPANEL.VALUE.FRESH
        : getPackModificationType(selectedPlan, currentSubscription, MIXPANEL),
      [MIXPANEL.PARAMETER.PACK_NAME]: selectedPlan?.productName,
      [MIXPANEL.PARAMETER.TENURE]: getCurrentSubscriptionTenureType(currentSubscription)
    };
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_SELECTED, mixpanel);
    appsFlyerConfig.trackEvent(APPSFLYER.EVENT.PACK_SELECTED, {
      [APPSFLYER.PARAMETER.PACK_NAME]:selectedPlan?.productName,
      [APPSFLYER.PARAMETER.PACK_PRICE]: selectedPlan?.amountValue ,
      [APPSFLYER.PARAMETER.PACK_DURATION]:selectedPlan?.packDuration,
      [APPSFLYER.PARAMETER.USER_LOGIN_STATE]:isUserloggedIn()?APPSFLYER.VALUE.LOGGED_IN:APPSFLYER.VALUE.NON_LOGGED_IN,
      [APPSFLYER.PARAMETER.PACK_ID]:selectedPlan?.productId,
      [APPSFLYER.PARAMETER.AF_CURRENCY]:APPSFLYER.VALUE.INR,
  });
  googleConversionConfig.trackEvent(googleConversion.EVENT.PAYMENT_INITATION_PAGE,{
    [googleConversion.PARAMETER.VALUE]: selectedPlan?.amountValue,
    [googleConversion.PARAMETER.CURRENCY]:googleConversion.VALUE.CURRENCY
  })
  dataLayerConfig.trackEvent(DATALAYER.EVENT.PROCEED_SUB_JOURNEY,
    {
        [DATALAYER.PARAMETER.PACK_NAME]:selectedPlan?.productName,
        [DATALAYER.PARAMETER.PACK_PRICE]:selectedPlan?.amountValue,


    })
    let isFirstSubscription = checkCurrentSubscription(currentSubscription);
    
    if(!isFirstSubscription){
        appsFlyerConfig.trackModifyPackEvents(APPSFLYER.EVENT.MODIFY_PACK_INITIATE, selectedPlan, this.props.currentSubscription);
    }
  const fireBaseData={
    [FIREBASE.PARAMETER.PACK_NAME]:selectedPlan?.productName,
    [FIREBASE.PARAMETER.PACK_PRICE]: selectedPlan?.amountValue ,
    [FIREBASE.PARAMETER.PACK_DURATION]:selectedPlan?.packDuration,
    [FIREBASE.PARAMETER.USER_LOGIN_STATE]:isUserloggedIn()?FIREBASE.VALUE.LOGGED_IN:FIREBASE.VALUE.NON_LOGGED_IN,
    [FIREBASE.PARAMETER.PACK_ID]:selectedPlan?.productId,
   }
   trackEvent.packSelected(fireBaseData)
  };

  getAnalyticsData = (analytics = MIXPANEL) => {
    let { selectedPlan } = this.props;
    let currentPlan = selectedPlan?.productName;

    return {
      [`${analytics.PARAMETER.PACK_NAME}`]: currentPlan,
    };
  };
  handleBack = async () => {
    let { closePopup, isfromMiniModal, openLoginPopup, openPopup ,miniSubscription, isFromCampaign ,location: { state } } = this.props;
    if (isfromMiniModal && !state?.isExplorePlans) {
      await loginInFreemium({
        openPopup,
        closePopup,
        openLoginPopup,
        ComponentName: MINI_SUBSCRIPTION.PLAN_SELECT,
        selectedPlan:miniSubscription?.selectedPlan
      });
    }else if(isFromCampaign){
        this.props.history.goBack()
    } else {
      closePopup()
      this.props.openMiniSubscription()
    }
    this.props.setUpdatedTenure()
  }

  render() {
    let {
      closePopup,
      selectedPlan,
      tenureAccountBalance,
      currentSubscription,
      isfromMiniModal
    } = this.props;
    let { updatedTenure } = this.state;
    // {window.innerWidth<480 && <div className="back-arrow" onClick={this.handleBack}><img src="../../../assets/images/back-arrow.png"/></div>}
    return (
      <div className="tenure-modal-body">
        <div className="modal-title">
          <img src="../../../assets/images/crown-icon.svg" alt="" />
          <h1 className={`${!get(selectedPlan, "highlightedPack") && "disable-highlight" }`}>{selectedPlan?.productName}</h1>
          <p>{selectedPlan?.tenureFootageMessage }</p>
          {isSubscriptionDiscount(this.props.history) && get(selectedPlan,"tenure")[0]?.discountVerbaige && <p className="discount-verbiage">{get(selectedPlan,"tenure")[0]?.discountVerbaige }</p>}
        </div>
        <div className="tenure-list-detail">
          <ul>
            {get(selectedPlan, "tenure", []).map((item) => {
              return (
                <li
                  key={item.tenureId}
                  className={item?.currentTenure ? "current-plan" : ""}
                >
                  {item?.discountedPercentage && (
                    <div className="tenure-offer">
                      {item.discountedPercentage}
                    </div>
                  )}
                  <div
                    className={`tenure-item ${
                      item.tenureId == updatedTenure.tenureId ?
                      "selected-tenure":""
                    }`}
                    onClick={()=>!item?.currentTenure && this.handleTenureSelection(item)}
                  >
                    <div className="left-item">
                      <div className="tenure-icon">
                        <img
                          src={`${cloudinaryCarousalUrl("", "", 38, 38)}${item.tenureImage
                            }`}
                          alt="tenure-icon"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              item?.tenureType === "Yearly"
                                ? YearlyCalenderIcon
                                : MontlyCalenderIcon;
                          }}
                        />
                      </div>
                      <div className="tenure-duration">
                        <span>{item?.tenureType}</span>
                        <span>{item?.tenureDuration}</span>
                      </div>
                    </div>
                    <div className="right-item">
                      <div
                        className={`tenure-ammount ${updatedTenure?.tenureId === item?.tenureId ?
                          "active-tenure" : ""
                          }`}
                      >
                        {(item.mrp) && (
                          <div className="old-tenure-amount">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: item.mrp?.split(";")[0],
                              }}
                            />
                            <span>{item.mrp?.split(";")[1]}</span>
                          </div>
                        )}
                        {(item.discountOfferedPrice && isSubscriptionDiscount(this.props.history)) && (
                          <div className="old-tenure-amount">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: item?.offeredPrice?.split(";")[0],
                              }}
                            />
                            <span>{item?.offeredPrice?.split(";")[1]}</span>
                          </div>
                        )}
                        {item.offeredPrice && (
                          <div className="new-tenure-amount">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: (item.discountOfferedPrice && isSubscriptionDiscount(this.props.history)) ? item.discountOfferedPrice?.split(";")[0] :item?.offeredPrice?.split(";")[0],
                              }}
                            />
                            <span>{(item.discountOfferedPrice && isSubscriptionDiscount(this.props.history)) ? item.discountOfferedPrice?.split(";")[1] :item?.offeredPrice?.split(";")[1]}</span>
                          </div>
                        )}
                      </div>
                      <div
                        className={
                          (!item?.enable || item?.currentTenure) ?
                            "hide-radio-btn" : ""
                        }
                      >
                        <RadioButton
                          id={'tenure_'+item.tenureId}
                          name={'tenure_'+item.tenureId}
                          value={item.tenureId}
                          showLabel={false}
                          checked={updatedTenure?.tenureId === item?.tenureId}
                          chandler={() => this.handleTenureSelection(item)}
                        />
                      </div>
                    </div>
                  </div>
                  {item?.currentTenure && (
                    <div className="current-plan-text">
                      You are currently on this Plan
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {tenureAccountBalance && (
            <React.Fragment>
              <div className="payment-container">
                {(tenureAccountBalance?.currentBalanceVerbiage ||
                  tenureAccountBalance?.currentBalance) && (
                    <span className="current-bal">
                      <div>{tenureAccountBalance?.currentBalanceVerbiage}</div>
                      <div>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: get(tenureAccountBalance, "currentBalance"),
                          }}
                        />
                      </div>
                    </span>
                  )}
                {(tenureAccountBalance?.payableAmountVerbiage ||
                  tenureAccountBalance?.payableAmount) && (
                    <span className="pending-bal">
                      <div>{tenureAccountBalance?.payableAmountVerbiage}</div>
                      <div>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: get(tenureAccountBalance, "payableAmount"),
                          }}
                        />
                      </div>
                    </span>
                  )}
              </div>
              <p className="footer-message"
                dangerouslySetInnerHTML={{
                  __html: get(tenureAccountBalance, "proRateFooterMessage"),
                }}
              />
            </React.Fragment>
          )}
        </div>
        {!get(tenureAccountBalance, "proRateFooterMessage") && (
          <div className="modal-footer">
            {get(currentSubscription, "tenureMessage")}
          </div>
        )}
      {isSubscriptionDiscount(this.props.history) && get(selectedPlan,"tenure")[0]?.discountVerbaige && <p className="discount-verbiage-footer">{this.props.oneTimeOffer}</p>}
      <div className="modal-action">
          <Button
            cName={`btn primary-btn`}
            bType="button"
            bValue="Proceed to Pay"
            clickHandler={() => this.onProceedClick()}
            // disabled={!updatedTenure}
          />
          <div className="tenure-not-now" >
           <span onClick={this.handleBack}> Go Back</span>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    tenureAccountBalance: get(state.subscriptionDetails, "tenureAccountBal"),
    validateSelectedPackResp: get(
      state.subscriptionDetails,
      "validateSelectedPackResp"
    ),
    addNewPackRes: get(state.subscriptionDetails, "addNewPackRes"),
    modifyPackRes: get(state.subscriptionDetails, "modifyPackRes"),
    currentSubscription: get(
      state.subscriptionDetails,
      "currentSubscription.data"
    ),
    existingUser: get(state.loginReducer, "existingUser"),
    selectedTenureValue: get(state.subscriptionDetails, "selectedTenureValue"),
    miniSubscription: get(state.subscriptionDetails, "miniSubscription"),
    oneTimeOffer: get(state.headerDetails, "configResponse.data.config.discount.validationVerbiage"),
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        openPopup,
        closePopup,
        tenureAccountBal,
        validateSelectedPack,
        addNewSubscription,
        modifyExistingSubscription,
        setUpdatedTenure,
        openLoginPopup,
        openMiniSubscription
      },
      dispatch
    ),
  };
}

ChangeTenureModal.propTypes = {
  closePopup: PropTypes.func,
  selectedPlan: PropTypes.object,
  tenureAccountBal: PropTypes.func,
  validateSelectedPack: PropTypes.func,
  addNewSubscription: PropTypes.func,
  openPopup: PropTypes.func,
  tenureAccountBalance: PropTypes.object,
  modifyPackRes: PropTypes.object,
  validateSelectedPackResp: PropTypes.object,
  currentSubscription: PropTypes.object,
  history: PropTypes.object,
  modifyExistingSubscription: PropTypes.func,
  addNewPackRes: PropTypes.object,
  setUpdatedTenure: PropTypes.func,
  checkCurrentSubscription: PropTypes.func,
  source: PropTypes.string,
  openMiniSubscription: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ChangeTenureModal);
