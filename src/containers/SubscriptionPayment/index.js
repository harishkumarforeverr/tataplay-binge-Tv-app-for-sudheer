import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import { hideFooter, hideMainLoader, showMainLoader, showMainLoaderImmediate } from "@src/action";
import { DTH_TYPE, LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import Checkbox from "@common/Checkbox";
import Button from '@common/Buttons';
import { deleteKey, getKey, setKey } from "@utils/storage";
import {
    errorForAPIFailure,
    handleSubscriptionCall,
    isSubscriptionFreemium,
    callAddorModifySubscription,
} from '@containers/Subscription/APIs/subscriptionCommon';
import { getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";
import { URL } from "@constants/routeConstants";
import {
    deletePaymentKeysFromLocal,
    handleOverflowOnHtml,
    handlePaymentSDKPrefetch,
    isMobile,
    safeNavigation,
    trackRechargeEvent,
    getSubscriptionJourneySource,
    trackMixpanelOnPaymentInitiate
} from "@utils/common";

import {
    getBalanceInfo,
    getPaymentDetails,
    paymentThroughTSWallet,
    quickRecharge,
    setPaymentStatus,
    setSubscriptionPaymentMode
} from "./APIs/action";
import { METHOD_TYPE } from './APIs/constants';

import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";
import './style.scss';
import { PAYMENT_METHOD } from "./constant";
import { DISCOUNT_SOURCE } from "../Subscription/APIs/constant";

class Payment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            heading: "",
            message: "",
            isSuccess: false,
            isChecboxSelected: false,
            isPaymentSuccessful: false,
            isTsTransactionCompleted: false
        };
    }

    componentDidMount = () => {
        this.loadData();
        window.addEventListener('beforeunload', this.onUnload) // to delete key on refresh
        // isMobile.any() && handleOverflowOnHtml();
    }

    componentWillUnmount() {
        this.props.hideFooter(false);
        window.removeEventListener('beforeunload', this.onUnload);
        isMobile.any() && handleOverflowOnHtml(true);
        this.props.history.replace({
            state: { ...this.props.history?.location?.state, isPaymentScreenPressed: true }
        });
    }

    onUnload = e => { // the method that will be used for both add and remove event
        e.preventDefault();
        deleteKey(LOCALSTORAGE.IS_NON_FREEMIUM_NON_DTH_SUBSCRIPTION_FLOW)
    }

    loadData = async () => {
        let {
            currentSubscription,
            addNewPackRes,
            modifyPackRes,
            history,
            getCurrentSubscriptionInfo,
            existingUser
        } = this.props,
            fsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true,
            isNonFreemiumDTHSubscriptionFlow = getKey(LOCALSTORAGE.IS_NON_FREEMIUM_NON_DTH_SUBSCRIPTION_FLOW);
        isEmpty(currentSubscription) && await getCurrentSubscriptionInfo();
        if (fsJourney) {
            handlePaymentSDKPrefetch();
        }

        currentSubscription = get(this.props, 'currentSubscription');
        let subscriptionResponse = (callAddorModifySubscription(currentSubscription)) ? get(addNewPackRes, 'data') : get(modifyPackRes, 'data');
        let response = fsJourney ? get(existingUser, 'data') : subscriptionResponse;
        (!isEmpty(response) || isNonFreemiumDTHSubscriptionFlow) ? this.fetchPaymentData() : this.redirectToSubscription();
        trackMixpanelOnPaymentInitiate(currentSubscription);
    }

    fetchPaymentData = async () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
            isNonFreemiumDthUser = !isSubscriptionFreemium() && userInfo.dthStatus !== DTH_TYPE.NON_DTH_USER;

        let {
            getPaymentDetails,
            existingUser,
            getBalanceInfo,
            addNewPackRes,
            modifyPackRes,
            currentSubscription,
            location: { pathname },
            hideFooter,
            selectedTenureValue,
            tenureAccountBalance
        } = this.props,
            urlArr = pathname.split("/"),
            subscriptionChangeType = (callAddorModifySubscription(currentSubscription)) ? METHOD_TYPE.ADD_SUBSCRIPTION : METHOD_TYPE.MODIFY_SUBSCRIPTION,
            fsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true,
            subscriptionResp = subscriptionChangeType === METHOD_TYPE.ADD_SUBSCRIPTION ? get(addNewPackRes, 'data') : get(modifyPackRes, 'data'),
            response;
        response = fsJourney ? get(existingUser, 'data') : subscriptionResp;
        let packdetails = {
            packName: response?.productName,
        }
        // let amount = get(response, 'amount', selectedTenureValue?.offeredPriceValue);
        let amount = get(tenureAccountBalance, 'amount') ?
            get(tenureAccountBalance, 'amount')
            : get(response, 'amount', selectedTenureValue?.offeredPriceValue);
        await getBalanceInfo(get(response, 'productId', selectedTenureValue?.tenureId), amount);

        hideFooter(true);
        setKey(LOCALSTORAGE.GET_PAYMENT_DETAILS, packdetails);

        let showDTHPaymentModeOnly = get(response, "dth") || urlArr?.includes(URL.BALANCE_INFO);
        if (showDTHPaymentModeOnly && isEmpty(get(this.props.dthBalanceApiResponse, 'data'))) {
            return errorForAPIFailure(this.props.dthBalanceApiResponse, this.redirectToSubscription);
        }

        if (!isNonFreemiumDthUser) {
            let transactionId = get(response, "paymentPayload.payload.orderId") ? get(response, "paymentPayload.payload.orderId") : get(response, 'paymentTransactionId');

            if (getKey(LOCALSTORAGE.TRANSACTION_ID) || getKey(LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE)) {
                deletePaymentKeysFromLocal();
            }

            setKey(LOCALSTORAGE.TRANSACTION_ID, transactionId);
            setKey(
                LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE,
                JSON.stringify(get(response, "paymentStatusVerbiage"))
            );
            setKey(
                LOCALSTORAGE.PAYMENT_ERROR_STATUS_VERBIAGE,
                JSON.stringify(get(response, "paymentErrorVerbiages"))
            );
            setKey(LOCALSTORAGE.SUBSCRIPTION_CHANGE_TYPE, subscriptionChangeType);
            if (subscriptionChangeType === METHOD_TYPE.MODIFY_SUBSCRIPTION) {
                setKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS, JSON.stringify(currentSubscription))
            }

            if (!showDTHPaymentModeOnly) {
                let paymentPayload = get(response, "paymentPayload");
                await getPaymentDetails();
                const { getDetails } = this.props;
                const hyperServiceObject = new window.HyperServices();

                const initiatePayload = {
                    action: getDetails?.payload?.action,
                    clientId: getDetails?.payload?.clientId,
                    merchantId: getDetails?.payload?.merchantId,
                    merchantKeyId: getDetails?.payload?.merchantKeyId,
                    signaturePayload: getDetails?.payload?.signaturePayload,
                    signature: getDetails?.payload?.signature,
                    environment: getDetails?.payload?.environment,
                    integrationType: "iframe",
                    hyperSDKDiv: "merchantViewId",
                };
                const sdkPayload = {
                    requestId: getDetails?.requestId,
                    service: getDetails?.service,
                    payload: initiatePayload,
                };
                const processPayload = {
                    requestId: paymentPayload?.requestId,
                    service: paymentPayload?.service,
                    payload: paymentPayload?.payload,
                };

                // have moved this func to main.js
                //window?.HyperServices.preFetch(payload);
                console.log("sdkPayload", sdkPayload);
                console.log("processPayload", processPayload);
                hyperServiceObject.initiate(sdkPayload, this.hyperCallbackHandler);
                if (hyperServiceObject.isInitialised()) {
                    hyperServiceObject.process(processPayload);
                }
            }
        }
    };

    redirectToSubscription = () => {
        let isDiscountJourney = getSubscriptionJourneySource() === MIXPANEL.VALUE.DISCOUNTING_PAGE;
        safeNavigation(this.props.history, isDiscountJourney ? `${URL.SUBSCRIPTION_DISCOUNT}` : `${URL.SUBSCRIPTION}`)
    }

    hyperCallbackHandler = (eventData) => {
        let { history } = this.props;
        try {
            if (eventData) {
                if (eventData?.payload?.status === "backpressed") {
                    history.goBack();
                }
            } else {
                console.log("No data received in event", eventData);
            }
        } catch (error) {
            console.log("Error in hyperSDK response", error);
        }
    }

    handleMakePayment = () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
            isNonFreemiumDthUser = !isSubscriptionFreemium() && userInfo.dthStatus !== DTH_TYPE.NON_DTH_USER,
            { lowBalanceKey, history } = this.props;

        if (lowBalanceKey) {
            this.rechargeCheck();
        } else {
            isNonFreemiumDthUser ? handleSubscriptionCall(history) : this.makePaymentThroughTSWAllet();
        }
    };

    rechargeCheck = async () => {
        let recommendedAmount = this.props?.recommendedAmount;
        recommendedAmount = recommendedAmount === undefined ? 0 : recommendedAmount;
        const { quickRecharge, showMainLoader, hideMainLoader } = this.props;
        showMainLoader();
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.TS_RECHARGE_INITIATE, { [MIXPANEL.PARAMETER.SOURCE]: this.getSource(), [MIXPANEL.PARAMETER.AMOUNT]: recommendedAmount });
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_INITIATE, { [APPSFLYER.PARAMETER.SOURCE]: this.getSource() });

        await quickRecharge(parseInt(recommendedAmount));
        const { quickRechargeSelfCareUrl } = this.props;
        if (
            quickRechargeSelfCareUrl?.code === 0 &&
            !isEmpty(quickRechargeSelfCareUrl.data)
        ) {
            trackRechargeEvent();
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.TS_RECHARGE_SUCCESS);
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_SUCCESS);
            window.location.assign(`${quickRechargeSelfCareUrl.data.rechargeUrl}`);

        } else {
            errorForAPIFailure(quickRechargeSelfCareUrl);
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_FAILED, { [`${APPSFLYER.PARAMETER.REASON}`]: quickRechargeSelfCareUrl.message });
            hideMainLoader();
        }
    };

    makePaymentThroughTSWAllet = async () => {
        let {
            paymentThroughTSWallet,
            currentSubscription,
            addNewPackRes,
            modifyPackRes,
            existingUser,
            getCurrentSubscriptionInfo,
            validateSelectedPackResp,
        } = this.props;
        let response = callAddorModifySubscription(currentSubscription)
            ? get(addNewPackRes, "data")
            : get(modifyPackRes, "data");
        let fsJourney =
            JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        if (fsJourney) {
            response = get(existingUser, "data");
        }
        let productName = get(response, 'productName');
        const payload = {
            billingAmount: get(response, 'amount'),
            productId: get(response, 'productId'),
            productName,
            subscriberId: get(userInfo, 'sId'),
            baId: get(userInfo, 'baId'),
            paymentTransactionId: fsJourney ? get(response, 'paymentPayload.payload.orderId') : get(response, 'paymentTransactionId'),
            offerId: get(validateSelectedPackResp, 'data.discountList') && get(validateSelectedPackResp, 'data.discountList')[0]?.offerId,
            source: !isEmpty(get(validateSelectedPackResp, 'data.discountList')) && DISCOUNT_SOURCE,
        }
        await paymentThroughTSWallet(payload);
        const pi_detail_url = await getKey(LOCALSTORAGE.PI_DETAIL_URL);
        !!pi_detail_url ? safeNavigation(this.props.history, `${pi_detail_url}`) : safeNavigation(this.props.history, `${URL.DEFAULT}`);

        this.props.setSubscriptionPaymentMode(PAYMENT_METHOD.TS_WALLET);
    };

    getSource = () => {
        let MyPlan = getKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION) || "";
        let Pipage = getKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI) || "";
        let source = "";
        if (MyPlan !== undefined) {
            source = MIXPANEL.VALUE.CHANGE_PLAN

        } else if (Pipage !== undefined) {
            source = MIXPANEL.VALUE.PI_PAGE

        } else {
            source = MIXPANEL.VALUE.GO_VIP;
        }
        return source;
    };

    getAnalyticsData = (analytics = MIXPANEL, paymentMethod) => {
        let subscriptionDetails = JSON.parse(getKey(LOCALSTORAGE.GET_PAYMENT_DETAILS))
        let path = getKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION) || "";
        // let source = !isEmpty(path) && "CHANGE-PLAN";
        let { currentSubscription } = this.props;
        return {
            [`${analytics.PARAMETER.PACK_NAME}`]: subscriptionDetails?.packName || "",
            [`${analytics.PARAMETER.PAYMENT_TYPE}`]: currentSubscription?.data?.paymentMode,
            [`${analytics.PARAMETER.PAYMENT_METHOD}`]: paymentMethod,

        };

    };

    trackRechargeEvents = () => {
        moengageConfig.trackEvent(MOENGAGE.EVENT.RECHARGE_FAILED, {
            [`${MOENGAGE.PARAMETER.REASON}`]: MOENGAGE.VALUE.FAILED,
        });
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_FAILED, {
            [APPSFLYER.PARAMETER.REASON]: APPSFLYER.VALUE.REASON,
        });
    };

    getPayableAmount = () => {
        let {
            currentSubscription,
            existingUser,
            selectedTenureValue,
            addNewPackRes,
            modifyPackRes,
            validateSelectedPackResp,
            tenureAccountBalance,
            dthBalanceApiResponse,
        } = this.props;
        let addModifyResp = callAddorModifySubscription(currentSubscription) ? get(addNewPackRes, 'data') : get(modifyPackRes, 'data');
        let fsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;
        let payableAmt;
        if (fsJourney) {
            payableAmt = get(existingUser, 'data.amount');
        } else {
            if (!isEmpty(validateSelectedPackResp)) {
                payableAmt = get(validateSelectedPackResp, 'data.totalAmount')
            } else if (!isEmpty(addModifyResp)) {
                payableAmt = get(addModifyResp, 'amount')
            } else if (!isEmpty(tenureAccountBalance)) {
                payableAmt = get(tenureAccountBalance, 'amount')
            } else if (!isEmpty(dthBalanceApiResponse)) {
                payableAmt = get(dthBalanceApiResponse, 'data.proRataAmount')
            } else if (!isEmpty(selectedTenureValue)) {
                payableAmt = get(selectedTenureValue, 'offeredPriceValue')
            } else if (!isEmpty(currentSubscription)) {
                let currentPackDetails = get(currentSubscription, 'tenure').find(item => item.currentTenure);
                payableAmt = get(currentPackDetails, 'offeredPriceValue')
            }
        }
        return payableAmt;
    };

    render() {
        let { addNewPackRes, modifyPackRes, lowBalanceMsg, balanceAmount, currentSubscription, existingUser,
            location: { pathname }, lowBalanceKey } = this.props;
        let { isChecboxSelected } = this.state;
        let { sId } = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let fsJourney =
            JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;
        let urlArr = pathname.split("/");
        let response = callAddorModifySubscription(currentSubscription)
            ? get(addNewPackRes, "data")
            : get(modifyPackRes, "data");
        if (fsJourney) {
            response = get(existingUser, "data");
        }
        let hidePaymentDetails = get(response, "dth") || urlArr?.includes(URL.BALANCE_INFO);
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)),
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;

        if (isMobile.any()) {
            if (!hidePaymentDetails) {
                handleOverflowOnHtml();
            } else {
                handleOverflowOnHtml(true);
            }
        }
        return (
            <React.Fragment>
                <div className="payment-container">
                    {!hidePaymentDetails && <h3>Select A Payment Option</h3>}
                    <div className="payment-gateway-wrapper">
                        <div className="payable-amount">
                            <p className="text">Payable Amount</p>
                            <p className="amount">&#8377; {this.getPayableAmount()}</p>
                        </div>
                        {userInfo?.dthStatus !== DTH_TYPE.NON_DTH_USER && !sourceIsMSales && (
                            <div>
                                <div className="balance-wrapper">
                                    <p>PAY USING TATA PLAY BALANCE</p>
                                </div>
                                <div className="balance-show">
                                    <div className="wallet-container">
                                        <div className="wallet-wrapper">
                                            <div>
                                                <img src="../../assets/images/wallet.png" alt="" />
                                            </div>
                                            <div>
                                                <p>Tata Play Balance</p>
                                                <p>{`Subscriber ID: ${sId}`}</p>
                                            </div>
                                        </div>
                                        {get(balanceAmount, "balance") && (
                                            <div className="amount-show">
                                                <p> &#8377;</p>
                                                <Checkbox
                                                    name="isChecboxSelected"
                                                    value={get(balanceAmount, "balance")}
                                                    leftLabelText={get(balanceAmount, "balance")}
                                                    checked={isChecboxSelected}
                                                    chandler={(e) => {
                                                        this.setState({
                                                            isChecboxSelected: e.target.checked,
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {isChecboxSelected && <div className='make-payment-btn'>
                                        {lowBalanceMsg &&
                                            <p className={`${lowBalanceKey ? 'err-msg' : ''}`}>{lowBalanceMsg}</p>}
                                        <Button
                                            cName="btn primary-btn"
                                            bType="button"
                                            bValue={lowBalanceKey ? 'Recharge' : 'Make Payment'}
                                            account="true"
                                            clickHandler={this.handleMakePayment}
                                        /></div>}
                                </div>
                            </div>
                        )}
                        {!hidePaymentDetails && (
                            <React.Fragment>
                                <div className="more-methods">
                                    <div className="hr" />
                                    <div>More Payment Methods</div>
                                    <div className="hr" />
                                </div>
                                <div className="payment-frame-block" id="merchantViewId" />
                            </React.Fragment>
                        )}
                    </div>
                </div>
                {/* {isPaymentSuccessful && (
          <PaymentSuccess
            onStartClick={this.handleStartWatching}
            paymentStatusVerbiage={JSON.parse(
              getKey(LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE)
            )}
          />
        )} */}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        getDetails: get(state?.subscriptionPaymentReducer, "paymentDetails"),
        balanceAmount: get(state?.subscriptionPaymentReducer, "balanceInfo.data.balanceQueryRespDTO"),
        lowBalanceMsg: get(state?.subscriptionPaymentReducer, "balanceInfo.data.lowBalanceMessage"),
        recommendedAmount: get(state?.subscriptionPaymentReducer, 'balanceInfo.data.recommendedAmount'),
        addNewPackRes: get(state.subscriptionDetails, 'addNewPackRes'),
        modifyPackRes: get(state.subscriptionDetails, 'modifyPackRes'),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
        paymentThroughTSRes: get(state.subscriptionPaymentReducer, 'paymentThroughTSWallet'),
        quickRechargeSelfCareUrl: get(state.subscriptionPaymentReducer, 'quickRecharge'),
        validateSelectedPackResp: get(state.subscriptionDetails, 'validateSelectedPackResp'),
        existingUser: get(state.loginReducer, 'existingUser'),
        tenureAccountBalance: get(state.subscriptionDetails, 'tenureAccountBal'),
        selectedTenureValue: get(state.subscriptionDetails, 'selectedTenureValue'),
        lowBalanceKey: get(state?.subscriptionPaymentReducer, "balanceInfo.data.lowBalance"),
        dthBalanceApiResponse: get(state?.subscriptionPaymentReducer, "balanceInfo"),
    };
};

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators(
        {
            hideFooter,
            setPaymentStatus,
            getPaymentDetails,
            getBalanceInfo,
            paymentThroughTSWallet,
            quickRecharge,
            showMainLoader,
            hideMainLoader,
            getCurrentSubscriptionInfo,
            showMainLoaderImmediate,
            setSubscriptionPaymentMode
        },
        dispatch,
    ),
});

Payment.propTypes = {
    hideFooter: PropTypes.func,
    getDetails: PropTypes.object,
    getPaymentDetails: PropTypes.func,
    balanceAmount: PropTypes.object,
    getBalanceInfo: PropTypes.func,
    lowBalanceMsg: PropTypes.string,
    paymentThroughTSWallet: PropTypes.func,
    paymentThroughTSRes: PropTypes.object,
    quickRecharge: PropTypes.func,
    quickRechargeSelfCareUrl: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    pathname: PropTypes.object,
    addNewPackRes: PropTypes.object,
    modifyPackRes: PropTypes.object,
    validateSelectedPackResp: PropTypes.object,
    currentSubscription: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    recommendedAmount: PropTypes.string,
    getCurrentSubscriptionInfo: PropTypes.func,
    existingUser: PropTypes.object,
    tenureAccountBal: PropTypes.object,
    selectedTenureValue: PropTypes.object,
    lowBalanceKey: PropTypes.bool,
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Payment),
);