import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import {withRouter} from "react-router";
import {REGEX, DTH_TYPE, ERROR_CODE, MINI_SUBSCRIPTION, LOCALSTORAGE} from "@utils/constants";
import {closePopup, openPopup} from "@common/Modal/action";
import {updateUser, createUser, getFireBaseData ,onLoginSuccess} from "./LoginCommon";
import {isMobile, loginInFreemium} from "@utils/common";
import {MESSAGE} from "@constants";
import {MODALS} from "@common/Modal/constants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import {
    addNewSubscription,
    modifyExistingSubscription,
    validateSelectedPack,
    openMiniSubscription,
    getCurrentSubscriptionInfo,
} from '@containers/Subscription/APIs/action';
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";
import {hideMainLoader, togglePaginationLoaderVisbility, fromLoginLoader} from "@src/action";

import {setKey} from "@utils/storage";
import trackEvent from "../../utils/trackEvent";
import {
    generateOtpWithRMN,
    subscriberListing,
    updateLoginStep,
    closeLoginPopup,
    resetLoginState,
    openLoginPopup,
    setLoginManual,
    onManualLogin,
    setIsLoginPopupVisible
} from './APIs/actions';
import OTPComponent from './OTPComponent';
import LoginSliderRail from './LoginSliderRail';
import RMNComponent from './RMNComponent';
import MultipleSubscriptions from './MultipleSubscriptions';
import MultipleAccounts from './MultipleAccount';
import loginLogo from "../../assets/images/bingeLogo.svg";
import backArrow from "@assets/images/back-arrow.png"
import "./style.scss";
import { rmnMaskingFunction } from "@containers/BingeLogin/bingeLoginCommon";
import googleConversionConfig from "@utils/googleCoversion";
import googleConversion from "@utils/constants/googleConversion";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rmn: "",
            otp: "",
            selectedAccount: "",
            selectedSubscriber: "",
            subscriptionsList: [],
            getOtpIsDisabled: true,
            stepNumber: 1,
            rmnError: "",
            loaderVisible: false
        };
    }

    componentDidMount() {
        this.props.setIsLoginPopupVisible(true)
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.VIEW_LOGIN, {
            [APPSFLYER.PARAMETER.SOURCE]: this.props.source || "",
        });
        this.props.resetLoginState();
        this.props.togglePaginationLoaderVisbility(false);
    }

    componentWillUnmount(){
       this.props.setIsLoginPopupVisible(false)
    }

    handleChange = (name, value) => {
        if (!isEmpty(this.state.rmnError)) {
            this.setState({
                rmnError: "",
            });
        }
        this.setState({
            [name]: value,
        }, () => {
            if (this.state.rmn.length === 1) {
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_RMN_ENTER);
            }
        });
        this.validateChange(name, value);
    };

    validateChange = (name, value) => {
        this.setState({
            getOtpIsDisabled: !REGEX.MOBILE_NUMBER.test(value),
        });
    };

    handleLoginClose = () => {
        const {closePopup, showLoginPopup, closeLoginPopup, openMiniSubscription, location} = this.props;
        closePopup();
        openMiniSubscription()
        if (showLoginPopup) {
            closeLoginPopup();
            this.updateStepNumber(1);
        }
        else if(location?.state?.isFromPi){
         setKey(LOCALSTORAGE.PI_DETAIL_URL,location.state.url);
         setKey(LOCALSTORAGE.IS_SUBSCRIPTION_FROM_PI, `true`)
        }
    };

    radioButtonClickHandler = (name, itemDetails) => {
        this.setState({
            [name]: itemDetails,
        }, () => {

            // if (name == "selectedSubscriber") {
            //     mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_SUBSCRIPTIONID_SELECT, {"SUBSCRIPTION-ID":this.state.selectedSubscriber});
            // }
        });
    };

    handleGetOtpClick = async () => {
        const {generateOtpWithRMN, selectedPlan, source} = this.props;
        const {rmn, otp} = this.state;
        this.setState({
            getOtpIsDisabled: true,
        });
        await generateOtpWithRMN(rmn);

        if (selectedPlan) {
            dataLayerConfig.trackEvent(DATALAYER.EVENT.GET_OTP_SUB_JOURNEY,
                {
                    [DATALAYER.PARAMETER.PACK_NAME]: selectedPlan?.productName,
                    [DATALAYER.PARAMETER.PACK_PRICE]: selectedPlan?.amountValue,
                }
            )
        } else {
            dataLayerConfig.trackEvent(DATALAYER.EVENT.GET_OTP_LOGIN_JOURNEY, {})
        }

        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.LOGIN_OTP_REQUESTED,{
            [APPSFLYER.PARAMETER.TYPE] : rmn,
            [APPSFLYER.PARAMETER.AUTH]:APPSFLYER.VALUE.OTP,
            [APPSFLYER.PARAMETER.VALUE]:rmnMaskingFunction(rmn),
            [APPSFLYER.PARAMETER.SOURCE]:this.props.source || "",
        });

        const {rmnResponse} = this.props;
        if (rmnResponse && rmnResponse.code === 0) {
            this.updateStepNumber(2);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_GET_OTP);
            googleConversionConfig.trackEvent(googleConversion.EVENT.LOGIN_GET_OTP)
  
            trackEvent.loginOTPInvoke(getFireBaseData({rmn,otp,source}))
            this.setState({
                getOtpIsDisabled: false,
            });
        } else {
            if (rmnResponse && rmnResponse.code === 20090) {
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_RMN_ENTER_INVALID, {
                    [MIXPANEL.PARAMETER.DEVICE]: MIXPANEL.VALUE.WEB,
                });
            }
            this.setState({
                rmnError: rmnResponse?.message
                    ? rmnResponse.message
                    : "Invalid Mobile Number",
                getOtpIsDisabled: false,
            });
        }
    };

    updateStepNumber = (stepNumber) => {
        this.setState({stepNumber});
        this.props.updateLoginStep(stepNumber);
    };

    onOtpVerification = (otp) => {
        this.setState(
            {
                otp,
            },
            () => this.getSubscriptionDetails()
        );
    };

    getSubscriptionDetails = () => {
        this.props
            .subscriberListing(get(this.state, "rmn"))
            .then((subscriptionDetails) => {
                if (subscriptionDetails && subscriptionDetails.code === 0) {
                    this.setState(
                        {
                            subscriptionsList: get(subscriptionDetails, "data"),
                        },
                        () => this.checkSubscriptionStatus()
                    );
                } else {
                    subscriptionDetails?.response?.status !== ERROR_CODE.ERROR_500 &&
                    this.errorMessage(subscriptionDetails?.message);
                }
            });
    };

    checkSubscriptionStatus = async () => {
        const {subscriptionsList, rmn} = this.state;
        if (isEmpty(subscriptionsList)) {
            await this.createNewUser(rmn, DTH_TYPE.NON_DTH_USER); // this case will come for Non- DTH users only
        } else if (subscriptionsList.length === 1) {
            this.setState(
                {
                    selectedSubscriber: subscriptionsList[0],
                },
                () => this.checkAccountStatus()
            );
        } else if (subscriptionsList.length > 1) {
            this.updateStepNumber(3);
        }
    };

    checkAccountStatus = async () => {
        const {selectedSubscriber} = this.state;
        const accountList = get(selectedSubscriber, "accountDetailsDTOList");
        const subscriberId = get(selectedSubscriber, "subscriberId");
        if (isEmpty(accountList)) {
            await this.createNewUser(
                subscriberId,
                get(selectedSubscriber, "dthStatus")
            );
        } else if (accountList.length === 1) {
            const selectedAccount = accountList[0];
            this.setState(
                {
                    selectedAccount,
                },
                () => this.checkDTHStatus()
            );
           // mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_SUBSCRIPTIONID_SELECT, { [MIXPANEL.PARAMETER.SUBSCRIPTION_ID]: selectedAccount?.bingeSubscriberId});
        } else {
            this.updateStepNumber(4);
        }
    };

    checkDTHStatus = async () => {
        const {selectedSubscriber, selectedAccount} = this.state;
        const dthStatus = get(selectedSubscriber, "dthStatus");
        if (dthStatus === DTH_TYPE.DTH_WO_BINGE_USER) {
            await this.createNewUser(
                get(selectedSubscriber, "subscriberId"),
                dthStatus,
                get(selectedAccount, "baId")
            );
        } else {
            this.updateExistingUser();
        }
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_SUBSCRIPTIONID_SELECT, { [MIXPANEL.PARAMETER.SUBSCRIPTION_ID]: this.state.selectedAccount?.bingeSubscriberId || this.state.selectedAccount?.subscriptionId });
    };

    updateExistingUser = async () => {
        const { selectedAccount, selectedSubscriber, rmn, otp } = this.state;
        const { updatedTenure, history, source, selectedPlan, cartId} = this.props
        const data = {
            baId: get(selectedAccount, "baId"),
            bingeSubscriberId: get(selectedAccount, "bingeSubscriberId"),
            dthStatus: get(selectedSubscriber, "dthStatus"),
            subscriberId: get(selectedSubscriber, "subscriberId"),
            loginErrorMessage: get(selectedSubscriber, "loginErrorMessage"),
            isPastBingeUser: get(selectedSubscriber, "isPastBingeUser"),
            packageId: updatedTenure?.tenureId || "",
            rmn,
            otp,
            cartId: cartId
        };
        await updateUser(data, onLoginSuccess, history, source, this.handleLoginClose, selectedPlan, cartId);
    };  

    createNewUser = async (subscriberId, dthStatus, baId) => {
        const { selectedSubscriber, selectedAccount, rmn, otp } = this.state;
        const { updatedTenure, history, source, selectedPlan, cartId } = this.props;
        const referenceId = get(selectedAccount, "referenceId") ? get(selectedAccount, "referenceId") : get(selectedSubscriber, "referenceId");
        const isDthWithoutBinge = (dthStatus === DTH_TYPE.DTH_WO_BINGE_USER);
        const data = {
            subscriberId,
            dthStatus,
            otp,
            rmn,
            baId,
            loginErrorMessage: get(selectedSubscriber, "loginErrorMessage"),
            isPastBingeUser: get(selectedSubscriber, "isPastBingeUser", false),
            eulaChecked: true,
            packageId: updatedTenure?.tenureId || "",
            cartId: cartId
        };
        if (isDthWithoutBinge) {
            data['referenceId'] = referenceId
        }
        await createUser(data, onLoginSuccess, history, source, this.handleLoginClose, selectedPlan, cartId);
    };

    errorMessage = (message) => {
        this.props.openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal",
            instructions: message || MESSAGE.ERROR_OCCURRED,
            primaryButtonText: "Ok",
            closeModal: true,
            hideCloseIcon: true,
        });
    };

    handleBack = async () => {
        let {closePopup, openLoginPopup, openPopup, miniSubscription} = this.props;
        if(this.state.stepNumber === 2){
            this.updateStepNumber(1);
        }
        // else if(this.state.stepNumber === 1 && !isEmpty(this.props.updatedTenure)){
        //  await loginInFreemium({
        //     openPopup,
        //     closePopup,
        //     openLoginPopup,
        //     ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE,
        //     selectedPlan: miniSubscription?.selectedPlan,
        //     isfromMiniModal: miniSubscription?.isfromMiniModal
        // });
    // }
    }

    render() {
        const {
            rmn,
            getOtpIsDisabled,
            stepNumber,
            rmnError,
            subscriptionsList,
            selectedSubscriber,
            selectedAccount,
        } = this.state;
        const {
            touchStatus,
            barStatus,
            configResponse,
            openPopup,
            closePopup,
            openLoginPopup,
            showNotNowPopup
        } = this.props;
        const showContent = [1, 2].includes(stepNumber);
        const clientWidth = document.getElementById("app").clientWidth;
        const showHeaderLogo = clientWidth < 480 || showContent;
        return (
            <React.Fragment>
                <div className="login-details-container">
                {(stepNumber === 2) && <div className="back-arrow" onClick={this.handleBack}><img src={backArrow}/></div>}
                    <React.Fragment>
                        {showHeaderLogo && (
                            <div className="header-logo">
                                <img src={loginLogo} alt="tata-sky-logo"/>
                            </div>
                        )}
                        {showContent && (
                            <>
                                <div className="login-title-web">
                                    <p>
                                        {get(configResponse, "data.config.ios_freetrial_title")}
                                    </p>
                                </div>
                                <LoginSliderRail
                                    railItems={get(configResponse, "data.config.providers")}
                                />
                                <div className="login-title-small">
                                    <p>
                                        {get(configResponse, "data.config.ios_freetrial_title")}
                                    </p>
                                </div>
                            </>
                        )}
                    </React.Fragment>
                    {stepNumber === 1 && (
                        <RMNComponent
                            rmn={rmn}
                            getOtpIsDisabled={getOtpIsDisabled}
                            handleChange={this.handleChange}
                            handleGetOtpClick={this.handleGetOtpClick}
                            closeLoginModel={this.handleLoginClose}
                            rmnError={rmnError}
                            configResponse={this.props.configResponse}
                            openPopup={openPopup}
                            closePopup={closePopup}
                            openLoginPopup={openLoginPopup}
                            showNotNowPopup={showNotNowPopup}
                            isFromCampaign={this.props.isFromCampaign}
                            history={this.props.history}
                        />
                    )}
                    {stepNumber === 2 && (
                        <OTPComponent
                            rmn={rmn}
                            onOtpVerification={this.onOtpVerification}
                            handleResendOtp={this.handleGetOtpClick}
                            selectedPlan={this.props.selectedPlan}
                        />
                    )}

                    {stepNumber === 3 && <MultipleSubscriptions
                        radioButtonClickHandler={this.radioButtonClickHandler}
                        subscriptionsList={subscriptionsList}
                        selectedSubscriber={selectedSubscriber}
                        handleProceedBtn={this.checkAccountStatus}
                        closeLoginModel={this.handleLoginClose}
                        touchStatus={touchStatus}
                        barStatus={barStatus}
                        openPopup={openPopup}
                        closePopup={closePopup}
                        configResponse={this.props.configResponse}
                        openLoginPopup={openLoginPopup}
                    />
                    }
                    {stepNumber === 4 && <MultipleAccounts
                        accountList={get(selectedSubscriber, 'accountDetailsDTOList', [])}
                        selectedAccount={selectedAccount}
                        handleProceedBtn={this.checkDTHStatus}
                        radioButtonClickHandler={this.radioButtonClickHandler}
                        closeLoginModel={this.handleLoginClose}
                        touchStatus={touchStatus}
                        barStatus={barStatus}
                        openPopup={openPopup}
                        closePopup={closePopup}
                        configResponse={this.props.configResponse}
                        openLoginPopup={openLoginPopup}
                    />}
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        subscriptionDetails: get(state.loginReducer, "subscriptionDetails"),
        configResponse: get(state.headerDetails, "configResponse"),
        showLoginPopup: get(state.loginReducer, "showLoginPopup"),
        rmnResponse: get(state.loginReducer, "rmnResponse"),
        existingUser: get(state.loginReducer, "existingUser"),
        newUser: get(state.loginReducer, "newUser"),
        fromLogin: get(state.commonContent, "fromLogin"),
        tenureAccountBalance: get(state.subscriptionDetails, 'tenureAccountBal'),
        validateSelectedPackResp: get(state.subscriptionDetails, 'validateSelectedPackResp'),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
        updatedTenure: get(state.subscriptionDetails, 'selectedTenureValue'),
        miniSubscription: get(state.subscriptionDetails, 'miniSubscription'),
    };
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            generateOtpWithRMN,
            subscriberListing,
            updateLoginStep,
            closePopup,
            closeLoginPopup,
            openPopup,
            resetLoginState,
            openLoginPopup,
            setLoginManual,
            togglePaginationLoaderVisbility,
            getCurrentSubscriptionInfo,
            validateSelectedPack,
            addNewSubscription,
            modifyExistingSubscription,
            hideMainLoader,
            onManualLogin,
            fromLoginLoader,
            openMiniSubscription,
            setIsLoginPopupVisible
        }, dispatch),
    }
}

Login.propTypes = {
    generateOtpWithRMN: PropTypes.func,
    subscriberListing: PropTypes.func,
    closePopup: PropTypes.func,
    bottomSheetClose: PropTypes.func,
    updateLoginStep: PropTypes.func,
    closeLoginPopup: PropTypes.func,
    subscriptionDetails: PropTypes.object,
    barStatus: PropTypes.bool,
    touchStatus: PropTypes.bool,
    showLoginPopup: PropTypes.bool,
    configResponse: PropTypes.object,
    openPopup: PropTypes.func,
    rmnResponse: PropTypes.object,
    existingUser: PropTypes.object,
    newUser: PropTypes.object,
    resetLoginState: PropTypes.func,
    openLoginPopup: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    isLoading: PropTypes.bool,
    setLoginManual: PropTypes.func,
    togglePaginationLoaderVisbility: PropTypes.func,
    updatedTenure: PropTypes.object,
    getCurrentSubscriptionInfo: PropTypes.func,
    selectedTenureValue: PropTypes.object,
    currentSubscription: PropTypes.object,
    validateSelectedPackResp: PropTypes.object,
    tenureAccountBalance: PropTypes.object,
    validateSelectedPack: PropTypes.func,
    addNewSubscription: PropTypes.func,
    modifyExistingSubscription: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    fromLoginLoader: PropTypes.func,
    openMiniSubscription: PropTypes.func,
    selectedPlan: PropTypes.object,
    miniSubscription: PropTypes.object,
    showNotNowPopup: PropTypes.bool,

};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
