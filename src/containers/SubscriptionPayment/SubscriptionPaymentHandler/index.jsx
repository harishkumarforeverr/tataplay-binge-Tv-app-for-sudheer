import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import get from "lodash/get";
import { isEmpty } from "lodash";

import { hideFooter, hideHeader, hideMainLoader, showMainLoader, showMainLoaderImmediate } from "@src/action";
import { deleteKey, getKey, setKey } from "@utils/storage";
import { errorForAPIFailure } from '@containers/Subscription/APIs/subscriptionCommon';
import { URL } from "@constants/routeConstants";
import { closePopup, openPopup } from '@common/Modal/action';
import {
    safeNavigation,
    trackModifyPackSuccess,
    getPaymentType,
    getAnalyticsSource,
    getSubscriptionJourneySource,
    trackMixpanelSubscriptionSuccess,
    trackMixpanelSubscriptionFailed,
    callLogOut,
    isUserloggedIn,
    getPackModificationType,
} from "@utils/common";
import { MODALS } from "@common/Modal/constants";
import { LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { fetchConfig } from "@components/Header/APIs/actions";

import { getOpelResponse } from "../APIs/action";
import PaymentSuccess from '../PaymentSuccess';
import {
    ERROR_HANDLING_VERBIAGES,
    fetchDetailsFromURL,
    METHOD_TYPE,
    OPEL_STATUS,
    PENDING_PAYMNET_ERROR_CODES,
    FAILED_PAYMNET_ERROR_CODES
} from '../APIs/constants';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

import './style.scss';
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";
import { getCurrentSubscriptionInfo } from "@containers/PackSelection/APIs/action";
import { PAYMENT_METHOD } from "../constant";
import Loader from "@common/Loader";
import googleConversionConfig from "@utils/googleCoversion";
import googleConversion from "@utils/constants/googleConversion";
import trackEvent from "@utils/trackEvent";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import firebase from "@utils/constants/firebase";


class SubscriptionPaymentHandler extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPaymentSuccessful: false,
            isPaymentInProgress: true,
        };
        this.paymentTimeout = '';
        this.paymentStatusSuccessReceived = false;
    }

    componentDidMount = async () => {
        let { history, configResponse, fetchConfig } = this.props;
        isEmpty(configResponse) && await fetchConfig(true);
        const transactionId = getKey(LOCALSTORAGE.TRANSACTION_ID);
        let fsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;
        fsJourney && deleteKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY);
        !isEmpty(transactionId) ? this.handleCallbackStatus() : safeNavigation(history, `${URL.DEFAULT}`);
    };

    componentDidUpdate = async (prevProps) => {
        if (this.props.paymentStatusFromPubnub !== prevProps.paymentStatusFromPubnub) {
            this.props.paymentStatusFromPubnub === OPEL_STATUS.SUCCESS && this.subscribeOpelStatus(false, true);
        }
    };

    componentWillUnmount = () => {
        clearTimeout(this.paymentTimeout);
    }

    handleOpelPayment = async () => {
        let status = fetchDetailsFromURL(window.location.href, 'status'),
            isStatusCategoryPending = PENDING_PAYMNET_ERROR_CODES.includes(status.toUpperCase());
        if (status.toUpperCase() === OPEL_STATUS.CHARGED) {
            this.handleStatusCall()
        } else {
            this.showErrorModal(isStatusCategoryPending);
            await this.handleMSalesLogoutJourney();
        }
    }

    getTransactionStatus = (paymentStatus) => {
        if (paymentStatus === MIXPANEL.VALUE.FAILURE) {
            return MIXPANEL.VALUE.FAILED;
        } else if (paymentStatus === MIXPANEL.VALUE.SUCCESS) {
            return MIXPANEL.VALUE.COMPLETED;
        } else {
            return MIXPANEL.VALUE.PENDING;
        }
    }

    trackPaymentEvent = (instructions = "", paymentStatus = "") => {
        const { currentSubscription, paymentMethod, balanceAmount, opelResponse } = this.props;
        const walletName = opelResponse ? opelResponse.data?.paymentMethod : currentSubscription?.data?.paymentMethod;
        const isTSWallet = paymentMethod === PAYMENT_METHOD.TS_WALLET;
        const subscriptionDetails = JSON.parse(getKey(LOCALSTORAGE.SUBSCRIPTION_SELECTED_PACK));
        const transactionId = getKey(LOCALSTORAGE.TRANSACTION_ID);
        const pgResponseCode = fetchDetailsFromURL(window.location.href, 'status');

        let data = {
            [MIXPANEL.PARAMETER.SUBSCRIBER_BALANCE]: isTSWallet ? get(balanceAmount, "balance") : "",
            [MIXPANEL.PARAMETER.TRANSACTION_STATUS]: this.getTransactionStatus(paymentStatus),
            [MIXPANEL.PARAMETER.CARD_TYPE]: "",
            [MIXPANEL.PARAMETER.BANK_NAME]: "",
            [MIXPANEL.PARAMETER.WALLET_NAME]: walletName,
            [MIXPANEL.PARAMETER.TRANSACTION_ID]: transactionId,
            [MIXPANEL.PARAMETER.CARD_NAME]: "",
            [MIXPANEL.PARAMETER.AMOUNT]: subscriptionDetails?.amountValue,
            [MIXPANEL.PARAMETER.FAILURE_REASON]: instructions,
            [MIXPANEL.PARAMETER.RENEWAL_MODE]: isTSWallet ? MIXPANEL.VALUE.TSWALLET : MIXPANEL.VALUE.PG,
            [MIXPANEL.PARAMETER.PAYMENT_STATUS]: paymentStatus,
            [MIXPANEL.PARAMETER.PG_RESPONSE_CODE]: pgResponseCode?.toUpperCase(),
        };
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PAYMENT, data);
        this.trackMixpanelOnPaymentExitFlow();
    }

    handleTSWalletPayment = async () => {
        const { paymentThroughTSRes } = this.props;
        if (paymentThroughTSRes?.code === 0) {
            setKey(LOCALSTORAGE.IS_TSWALLET_PAYMENT_MODE_SUCCESS, true);
            this.handleStatusCall();
        } else {
            this.showErrorModal();
        }
    }

    handleCallbackStatus = async () => {
        if (this.props.paymentMethod === PAYMENT_METHOD.PG) {
            this.handleOpelPayment();
        } else {
            await this.handleTSWalletPayment();
        }
    };

    getExitStatus = () => {
        let status = fetchDetailsFromURL(window.location.href, 'status'),
            isStatusCategoryPending = PENDING_PAYMNET_ERROR_CODES.includes(status?.toUpperCase()),
            isStatusCategoryFailed = FAILED_PAYMNET_ERROR_CODES.includes(status?.toUpperCase());

        if (status?.toUpperCase() === OPEL_STATUS.CHARGED) {
            return MIXPANEL.VALUE.SUCCESS;
        } else if (isStatusCategoryPending) {
            return MIXPANEL.VALUE.PENDING;
        } else if (isStatusCategoryFailed) {
            return MIXPANEL.VALUE.FAILURE;
        }
    }

    trackMixpanelOnPaymentExitFlow = () => {
        let exitStatus = this.getExitStatus(),
            isTSWallet = this.props.paymentMethod === PAYMENT_METHOD.TS_WALLET,
            pgResponseCode = fetchDetailsFromURL(window.location.href, 'status');

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PAYMENT_FLOW_EXIT,
            {
                [MIXPANEL.PARAMETER.EXIT_STATUS]: isTSWallet ? "" : exitStatus,
                [MIXPANEL.PARAMETER.PAYMENT_METHOD]: isTSWallet ? MIXPANEL.VALUE.TP_WALLET : MIXPANEL.VALUE.PAYMENT_GATEWAY,
                [MIXPANEL.PARAMETER.PAYMENT_STATUS]: isTSWallet ? "" : exitStatus,
                [MIXPANEL.PARAMETER.PG_RESPONSE_CODE]: isTSWallet ? "" : pgResponseCode?.toUpperCase(),
            });
    }

    showErrorModal = (isStatusCategoryPending) => {
        let errorMsgFromBacked = JSON.parse(getKey(LOCALSTORAGE.PAYMENT_ERROR_STATUS_VERBIAGE)),
            pendingStateError = get(errorMsgFromBacked, 'transactionPendingVerbiage', ERROR_HANDLING_VERBIAGES.PENDING_STATE_ERROR),
            failedStateError = get(errorMsgFromBacked, 'paymentFailureVerbiage', ERROR_HANDLING_VERBIAGES.PAYMENT_FAILED_ERROR),
            instructions = isStatusCategoryPending ? pendingStateError : failedStateError,
            primaryButtonText = isStatusCategoryPending ? ERROR_HANDLING_VERBIAGES.CLOSE_BTN : ERROR_HANDLING_VERBIAGES.TRY_AGAIN,
            secondaryButtonLinkText = !isStatusCategoryPending && ERROR_HANDLING_VERBIAGES.CLOSE_BTN,
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;

        this.setState({ isPaymentInProgress: false });
        this.props.openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal error-state-modal',
            errorIcon: 'icon-alert-upd',
            hideCloseIcon: true,
            headingMessage: ERROR_HANDLING_VERBIAGES.HEADING,
            instructions,
            primaryButtonText: sourceIsMSales ? "" : primaryButtonText,
            secondaryButtonLinkText: sourceIsMSales ? "" : secondaryButtonLinkText,
            primaryButtonAction: () => {
                this.handleApiFailure(!isStatusCategoryPending)
            },
            secondaryButtonAction: this.handleApiFailure,
        });
        !isStatusCategoryPending && this.trackSubscriptionFailed(instructions);
    };

    trackSubscriptionFailed = (instructions) => {
        this.trackPaymentEvent(instructions, MIXPANEL.VALUE.FAILURE);
        trackMixpanelSubscriptionFailed(instructions);
        let appsFlyer = this.getAnalyticsData(APPSFLYER, APPSFLYER.VALUE.PG,)
        appsFlyer[`${APPSFLYER.PARAMETER.TYPE}`] = APPSFLYER.VALUE.PAID;
        appsFlyer[`${APPSFLYER.PARAMETER.REASON}`] = instructions;
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SUBSCRIBE_FAILED, appsFlyer)
        const firebaseData = this.getFirebaseAnalyticsData(firebase.EVENT.SUBSCRIBE_FAILED);
        trackEvent.subscriptionFailed({ ...firebaseData, [firebase.PARAMETER.REASON]: instructions })
    }

    getFirebaseSubscriptionType = () => {
        const previousSubscription = JSON.parse(getKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS));
        if (!previousSubscription) {
            return firebase.VALUE.NEW;
        }
        if (previousSubscription?.subscriptionStatus === "ACTIVE") {
            return firebase.VALUE.MODIFY;
        }
        return firebase.VALUE.REPEAT

    }

    handleApiFailure = (isTryAgain = false) => {
        let { closePopup, history } = this.props,
            isPaymentFromSubscription = getKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION),
            isPaymentFromDiscount = getKey(LOCALSTORAGE.IS_PAYMENT_FROM_DISCOUNT),
            paymentInitiatePath = isPaymentFromDiscount ? `/${URL.SUBSCRIPTION_DISCOUNT}` : `/${URL.SUBSCRIPTION}`,
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        closePopup();
        deleteKey(LOCALSTORAGE.TRANSACTION_ID);
        deleteKey(LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE);
        deleteKey(LOCALSTORAGE.PAYMENT_ERROR_STATUS_VERBIAGE);
        deleteKey(LOCALSTORAGE.SUBSCRIPTION_CHANGE_TYPE);
        deleteKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION);
        deleteKey(LOCALSTORAGE.IS_PAYMENT_FROM_DISCOUNT);
        deleteKey(LOCALSTORAGE.GET_PAYMENT_DETAILS);
        deleteKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS);
        deleteKey(LOCALSTORAGE.SUBSCRIPTION_SELECTED_PACK);
        deleteKey(LOCALSTORAGE.SUBSCRIPTION_JOURNEY_SOURCE);
        deleteKey(LOCALSTORAGE.CART_ID);

        if (isTryAgain) {
            isPaymentFromSubscription ? safeNavigation(history, paymentInitiatePath) : safeNavigation(history, `${URL.DEFAULT}`);
        } else {
            safeNavigation(history, `${URL.DEFAULT}`)
        }
    }

    handleStartWatching = async () => {
        let { history } = this.props;
        this.setState({
            isPaymentsuccessful: false,
        })
        deleteKey(LOCALSTORAGE.TRANSACTION_ID);
        deleteKey(LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE);
        deleteKey(LOCALSTORAGE.SUBSCRIPTION_CHANGE_TYPE);
        deleteKey(LOCALSTORAGE.PREVIOUS_SUBSCRIPTION_DETAILS);
        deleteKey(LOCALSTORAGE.SUBSCRIPTION_SELECTED_PACK);
        deleteKey(LOCALSTORAGE.SUBSCRIPTION_JOURNEY_SOURCE);
        deleteKey(LOCALSTORAGE.CART_ID);

        const pi_detail_url = await getKey(LOCALSTORAGE.PI_DETAIL_URL);
        if (!!pi_detail_url) {
            safeNavigation(history, `${pi_detail_url}`)
        } else {
            safeNavigation(history, `${URL.DEFAULT}`)
        }
        deleteKey(LOCALSTORAGE.PI_DETAIL_URL);
        dataLayerConfig.trackEvent(DATALAYER.EVENT.START_WATCHING_SUB_JOURNEY, {
        })
    }

    handleStatusCall = () => {
        let { configResponse } = this.props,
            paymnetCallBackArray = get(configResponse, 'paymentCallbackArrayInfo.paymentStatusApiArray', [10000, 20000]),
            userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)),
            transactionId = getKey(LOCALSTORAGE.TRANSACTION_ID),
            payload = {
                baId: get(userInfo, 'baId'),
                paymentTransaction: transactionId,
                cartId: getKey(LOCALSTORAGE.CART_ID)
            };

        for (let i = 0; i < paymnetCallBackArray.length; i++) {
            let isLastIteration = (i + 1) === paymnetCallBackArray.length,
                { opelResponse } = this.props,
                opelPaymentStatus = get(opelResponse, 'data.paymentStatus')?.toUpperCase();

            if ((opelPaymentStatus !== OPEL_STATUS.SUCCESS || opelPaymentStatus !== OPEL_STATUS.FAILED) && !this.paymentStatusSuccessReceived) {
                this.paymentTimeout = setTimeout(async () => {
                    if (this.paymentStatusSuccessReceived) {
                        clearTimeout(this.paymentTimeout);
                        return;
                    }
                    await this.props.getOpelResponse(payload);
                    this.subscribeOpelStatus(isLastIteration);
                }, paymnetCallBackArray[i]);
            }
        }
    }

    subscribeOpelStatus = async (isLastIteration = false, isSuccessFromPubnub = false) => {
        let { opelResponse } = this.props,
            paymentStatus = get(opelResponse, 'data.paymentStatus')?.toUpperCase();
        if ((get(opelResponse, 'code') === 0 && !isEmpty(get(opelResponse, 'data')) || isSuccessFromPubnub)) {
            if (paymentStatus === OPEL_STATUS.SUCCESS || isSuccessFromPubnub) {
                if (this.paymentStatusSuccessReceived) {
                    return;
                }
                this.paymentStatusSuccessReceived = true;
                this.setState({
                    isPaymentSuccessful: true,
                    isPaymentInProgress: false,
                }, async () => {
                    await this.trackAnalyticsSubscriptionEvent();
                    this.trackPaymentEvent("", MIXPANEL.VALUE.SUCCESS);
                    clearTimeout(this.paymentTimeout);
                    await this.handleMSalesLogoutJourney();
                });
            } else if (paymentStatus === OPEL_STATUS.INPROGRESS) {
                this.setState({ isPaymentInProgress: true });
                if (isLastIteration) {
                    this.setState({ isPaymentInProgress: false });
                    clearTimeout(this.paymentTimeout);
                    this.getPaymentPendingError();
                    await this.handleMSalesLogoutJourney();
                }
            } else if (paymentStatus === OPEL_STATUS.FAILED) {
                this.setState({ isPaymentInProgress: false });
                clearTimeout(this.paymentTimeout);
                this.showErrorModal();
                await this.handleMSalesLogoutJourney();
            }
        } else {
            clearTimeout(this.paymentTimeout);
            (this.props.paymentStatusFromPubnub !== OPEL_STATUS.SUCCESS) && errorForAPIFailure(opelResponse, this.handleApiFailure);
            (this.props.paymentStatusFromPubnub !== OPEL_STATUS.SUCCESS) && await this.handleMSalesLogoutJourney();
        }
    };

    handleMSalesLogoutJourney = async () => {
        let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        let isSilentLogout = JSON.parse(getKey(LOCALSTORAGE.IS_SILENT_LOGOUT));
        if (sourceIsMSales && !isSilentLogout && isUserloggedIn()) {
            await callLogOut(false, this.props.history, false, false, false);
            setKey(LOCALSTORAGE.IS_SILENT_LOGOUT, true);
        }
    }

    trackAnalyticsSubscriptionEvent = async () => {
        const currentSubscription = await this.props.getCurrentSubscriptionInfo()
        let appsFlyerData = this.getAppsFlyerData();
        let isFirstSubscription = currentSubscription?.data?.firstPaidPack && !currentSubscription?.data?.fdoRequested;
        trackMixpanelSubscriptionSuccess(currentSubscription?.data, this.props.paymentMethod);
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.PAYMENT, appsFlyerData);
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SUBSCRIPTION_SUCCESS, appsFlyerData);
        googleConversionConfig.trackEvent(googleConversion.EVENT.SUBSCRIPTION_SUCCESS, {
            [googleConversion.PARAMETER.VALUE]: currentSubscription?.data?.amountValue || '',
            [googleConversion.PARAMETER.CURRENCY]: googleConversion.VALUE.CURRENCY
        })
        const firebaseData = this.getFirebaseAnalyticsData();
        trackEvent.subscriptionSuccess(firebaseData);
        if (isFirstSubscription) {
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.SUBSCRIBE_SUCCESS_NEW, appsFlyerData)
            trackEvent.subscriptionSuccessNew(firebaseData)
        } else {
            trackModifyPackSuccess(this.props.currentSubscription.data)
        }
    }

    getPaymentPendingError = () => {
        let instructions = ERROR_HANDLING_VERBIAGES.PAYMENT_CONFIRMATION_PENDING_ERROR,
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        this.props.openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal error-state-modal',
            errorIcon: 'icon-alert-upd',
            hideCloseIcon: true,
            headingMessage: ERROR_HANDLING_VERBIAGES.HEADING_PENDING,
            instructions: instructions,
            primaryButtonText: sourceIsMSales ? "" : ERROR_HANDLING_VERBIAGES.CLOSE_BTN,
            primaryButtonAction: this.handleApiFailure
        });
        this.trackPaymentEvent(instructions, MIXPANEL.VALUE.PENDING);
    };

    getSource = () => {
        let subscriptionChangeType = getKey(LOCALSTORAGE.SUBSCRIPTION_CHANGE_TYPE);
        let piPage = getKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI) || "";
        if (piPage) {
            return MIXPANEL.VALUE.PI_PAGE
        }
        if (subscriptionChangeType === METHOD_TYPE.ADD_SUBSCRIPTION) {
            return MIXPANEL.VALUE.SUBSCRIBE
        } else {
            return MIXPANEL.VALUE.CHANGE_PLAN
        }
    }

    getAnalyticsData = (analytics = MIXPANEL, paymentMethod,) => {
        let subscriptionDetails = JSON.parse(getKey(LOCALSTORAGE.GET_PAYMENT_DETAILS))
        let path = getKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION) || "";
        return {
            [`${analytics.PARAMETER.PACK_NAME}`]: subscriptionDetails?.packName || "",
            [`${analytics.PARAMETER.PAYMENT_TYPE}`]: getPaymentType(this.props.currentSubscription?.data?.paymentMode),
            [`${analytics.PARAMETER.PAYMENT_METHOD}`]: paymentMethod,

        };
    };

    getAppsFlyerData = () => {
        let subscriptionDetails = JSON.parse(getKey(LOCALSTORAGE.GET_PAYMENT_DETAILS))
        return {
            [`${APPSFLYER.PARAMETER.SOURCE}`]: getAnalyticsSource(getSubscriptionJourneySource(), APPSFLYER),
            [APPSFLYER.PARAMETER.PACK_PRICE]: this.props.currentSubscription?.data?.amountValue,
            [APPSFLYER.PARAMETER.AF_REVENUE]: this.props.currentSubscription?.data?.amountValue,
            [APPSFLYER.PARAMETER.AF_CURRENCY]: APPSFLYER.VALUE.INR,
            [APPSFLYER.PARAMETER.PACK_ID]: this.props.currentSubscription?.data?.productId,
            [APPSFLYER.PARAMETER.PACK_NAME]: subscriptionDetails?.packName || "",
            [APPSFLYER.PARAMETER.PACK_DURATION]: this.props?.currentSubscription?.data?.packDuration,
            [APPSFLYER.PARAMETER.PROMO_CODE]: this.props?.currentSubscription?.data?.promoCode,
            [APPSFLYER.PARAMETER.PAYMENT_MODE]: this.props?.currentSubscription?.data?.paymentMethod,
        };
    }

    getFirebaseAnalyticsData = (event) => {
        const selectedPack = JSON.parse(getKey(LOCALSTORAGE.SUBSCRIPTION_SELECTED_PACK));
        const { currentSubscription } = this.props;
        const paymentData = this.props.opelResponse?.data;
        const paymentMethod = event === firebase.EVENT.SUBSCRIBE_FAILED ? this.props.paymentMethod : currentSubscription?.data?.paymentMethod;
        let data = {
            [firebase.PARAMETER.SOURCE]: getAnalyticsSource(getSubscriptionJourneySource(), APPSFLYER),
            [firebase.PARAMETER.PACK_NAME]: selectedPack?.productName || "",
            [firebase.PARAMETER.PACK_PRICE]: selectedPack?.amountValue,
            [firebase.PARAMETER.PACK_ID]: selectedPack?.productId,
            [firebase.PARAMETER.PACK_DURATION]: selectedPack?.packDuration,
            [firebase.PARAMETER.PROMO_CODE]: paymentData?.promoCode || "",
            [firebase.PARAMETER.PACK_TYPE]: firebase.VALUE.PAID,
            [firebase.PARAMETER.PAYMENT_MODE]: paymentMethod,
        };

        if (event === firebase.EVENT.SUBSCRIBE_FAILED) {
            data = {
                ...data,
                [firebase.PARAMETER.SUBSCRIBE_TYPE]: this.getFirebaseSubscriptionType(),
                [firebase.PARAMETER.PACK_MOD_TYPE]: currentSubscription?.data ? getPackModificationType(selectedPack, this.currentSubscription?.data) : firebase.VALUE.FRESH,
            }
        }

        return data;
    }

    render() {
        let { isPaymentSuccessful, isPaymentInProgress } = this.state;
        const { paymentMethod } = this.props;
        const isTSWallet = paymentMethod === PAYMENT_METHOD.TS_WALLET;
        return (
            <React.Fragment>
                {isPaymentSuccessful && <PaymentSuccess
                    onStartClick={this.handleStartWatching}
                    paymentStatusVerbiage={JSON.parse(getKey(LOCALSTORAGE.PAYMENT_STATUS_VERBIAGE))}
                    showConfettiEffect={paymentMethod === PAYMENT_METHOD.PG}
                />}
                {isPaymentInProgress &&
                    (<div>
                        {paymentMethod === PAYMENT_METHOD.PG ?
                            <p className="in-progress">{ERROR_HANDLING_VERBIAGES.PAYMENT_IN_PROGRESS}</p> :
                            <Loader alwaysVisible={true} />}
                    </div>)
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        opelResponse: get(state.subscriptionPaymentReducer, 'opelResponse'),
        paymentStatusFromPubnub: get(state.subscriptionPaymentReducer, 'paymentStatusFromPubnub'),
        configResponse: get(state.headerDetails, "configResponse.data.config"),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription'),
        paymentThroughTSRes: get(state.subscriptionPaymentReducer, 'paymentThroughTSWallet'),
        balanceAmount: get(state?.subscriptionPaymentReducer, "balanceInfo.data.balanceQueryRespDTO"),
    };
};

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators(
        {
            hideFooter,
            hideHeader,
            showMainLoader,
            showMainLoaderImmediate,
            hideMainLoader,
            getOpelResponse,
            openPopup,
            closePopup,
            fetchConfig,
            getCurrentSubscriptionInfo
        },
        dispatch,
    ),
});

SubscriptionPaymentHandler.propTypes = {
    hideFooter: PropTypes.func,
    hideHeader: PropTypes.func,
    showMainLoaderImmediate: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    getOpelResponse: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    configResponse: PropTypes.object,
    opelResponse: PropTypes.object,
    history: PropTypes.object,
    fetchConfig: PropTypes.func,
    currentSubscription: PropTypes.object,
    paymentMethod: PropTypes.string.isRequired
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SubscriptionPaymentHandler),
);

