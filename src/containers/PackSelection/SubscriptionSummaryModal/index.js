import React, {Component} from 'react';
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import {
    createSubscription,
    getBalanceInfo,
    getCurrentSubscriptionInfo,
    modifySubscription,
    reactivateSubscription,
} from "@containers/PackSelection/APIs/action";
import FreeTrial from "@containers/PackSelection/SubscriptionSummaryModal/FreeTrial";
import DTHBalance from "@containers/PackSelection/SubscriptionSummaryModal/DTHBalance";
import LowBalance from "@containers/PackSelection/SubscriptionSummaryModal/LowBalance";
import {deepEqual, getDate, isMobile, queryStringToObject, safeNavigation} from "@utils/common";
import {LOCALSTORAGE, PACK_TYPE} from "@constants";
import {getKey, setKey} from "@utils/storage";
import {closePopup, openPopup} from "@common/Modal/action";
import {MODALS} from "@common/Modal/constants";

import './style.scss';
import {URL} from "@constants/routeConstants";
import {PACK_STATUS, SUBSCRIPTION_SUMMARY} from "@containers/PackSelection/constant";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import {CURRENT_SUBSCRIPTION} from "@containers/MySubscription/constant";
import AboutYourSubscription from "@containers/MySubscription/AboutYourSubscription";
import {
    cancelResumeNotifications,
    showExpiryInfo,
    subscriptionFailure, subscriptionSuccessFailurePopup,
} from "@containers/MySubscription/APIs/subscriptionCommon";
import SubscriptionSummary from "@containers/MySubscription/SubscriptionSummary";
import {cancelPack} from "@containers/MySubscription/APIs/action";
import {redirectToHomeScreen} from "@containers/BingeLogin/bingeLoginCommon";
import {trackPackResumeEvent} from "../../MySubscription/APIs/subscriptionCommon";
import appsFlyerConfig from '@utils/appsFlyer';
import APPSFLYER from '@utils/constants/appsFlyer';
import googleConversionConfig from "@utils/googleCoversion";
import googleConversion from "@utils/constants/googleConversion";
import trackEvent from '@utils/trackEvent';
import FIREBASE from "@utils/constants/firebase";


class SubscriptionSummaryModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recommendedValue: props?.balanceInfo?.data?.recommendedAmount,
            packStatus: '',
            cancelData: '',
            updatedPackData: props?.packDetail,
            revoked: false,
        }
    }

    static getDerivedStateFromProps = (nextProps, prevState) => {

        if (nextProps?.packDetail && !deepEqual(nextProps.packDetail, prevState.updatedPackData)) {
            return {updatedPackData: nextProps.packDetail}
        }

        if ((nextProps.cancelData === prevState.cancelData || nextProps.resumeData === prevState.cancelData) && prevState.cancelData &&
            !nextProps.cancelDataSilently) {
            return {cancelData: 'updated'}
        }
        return {cancelData: ''}
    }

    componentDidMount = async () => {
        // window.scrollTo(0, 0);
        const {callSubscription, getCurrentSubscriptionInfo} = this.props;

        if (callSubscription) {
            await getCurrentSubscriptionInfo();
        }

        this.updatePackStatus();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        try {
            if (prevState.cancelData === 'updated') {
                cancelResumeNotifications();
            }
        } catch (e) {
            console.log(e);
        }
    }

    updatePackStatus = () => {
        const {currentSubscription} = this.props;
        const {updatedPackData} = this.state;
        const currentPackPrice = get(currentSubscription, 'data.packPrice');

        if (isEmpty(currentSubscription) || currentSubscription?.data?.status === ACCOUNT_STATUS.WRITTEN_OFF) {
            setTimeout(() => this.setState({packStatus: ''}), 0);
        } else if (parseFloat(currentPackPrice) > parseFloat(updatedPackData.price)) {
            setTimeout(() => this.setState({packStatus: PACK_STATUS.DOWNGRADE}), 0);
        } else if (parseFloat(currentPackPrice) < parseFloat(updatedPackData.price)) {
            setTimeout(() => this.setState({packStatus: PACK_STATUS.UPGRADE}), 0);
        }

        if(currentSubscription?.data?.cancelled) {
            setTimeout(() => this.setState({revoked: true}), 0);
        }
    }

    changeSubscription = async (packId) => {
        const {
            currentSubscription: {data: {status, expiredWithinSixtyDays, cancelled, fdoOrderRaised}},
            reactivateSubscription,
        } = this.props;
        if (((status === ACCOUNT_STATUS.DEACTIVATED || status === ACCOUNT_STATUS.DEACTIVE
                || status === ACCOUNT_STATUS.WRITTEN_OFF) && cancelled && expiredWithinSixtyDays) ||
            (status === ACCOUNT_STATUS.WRITTEN_OFF && fdoOrderRaised && cancelled)) {
            await reactivateSubscription(packId);
        } else {
            const {modifySubscription, currentSubscription} = this.props;
            const dropPackId = currentSubscription.data.packId;

            await modifySubscription(packId, dropPackId, this.state.revoked);
        }
    }

    trackAnalytics = (subscriptionData, fdoOrderRaised = false) => {
        const {packSelectionSource, modificationType, currentSubscription} = this.props;
        const {updatedPackData} = this.state;
        let subscriptionSource = queryStringToObject(packSelectionSource);
        let nudgesData = subscriptionData?.nudges?.paidPackSelection;
        let fdrRaisedDay = (nudgesData && ((parseInt(nudgesData.totalFreeTrialDuration) - parseInt(nudgesData.availableDays)) + 1));

        if(!isEmpty(modificationType)) {

            let data = {
                [`${MIXPANEL.PARAMETER.PACK_NAME}`]: updatedPackData.title || '',
                [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: updatedPackData.price || '',
                [`${MIXPANEL.PARAMETER.MOD_TYPE}`]: modificationType || '',
                [`${MIXPANEL.PARAMETER.SOURCE}`]: subscriptionSource?.source || '',
            }

            mixPanelConfig.trackEvent(MIXPANEL.EVENT.MODIFY_PACK_SUCCESS, data);
            moengageConfig.trackEvent(MOENGAGE.EVENT.MODIFY_PACK_SUCCESS, data);
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.MODIFY_PACK_SUCCESS,{
                [APPSFLYER.PARAMETER.PACK_NAME]:updatedPackData.title || '',
                [APPSFLYER.PARAMETER.PACK_PRICE]:updatedPackData.price || '',
                [APPSFLYER.PARAMETER.MOD_TYPE]:modificationType || '',
                [APPSFLYER.PARAMETER.SOURCE]:subscriptionSource?.source || ''
            });
        }   
            let fireBaseData={
                [FIREBASE.PARAMETER.SOURCE] :subscriptionSource?.source || '',
                [FIREBASE.PARAMETER.PACK_PRICE]:updatedPackData?.price ,
                [FIREBASE.PARAMETER.PACK_ID]:updatedPackData?.productId,
                [FIREBASE.PARAMETER.PACK_NAME]:  updatedPackData?.title  || "",
                [FIREBASE.PARAMETER.PACK_DURATION]: updatedPackData?.packDuration || "",
                [FIREBASE.PARAMETER.PROMO_CODE]:updatedPackData?.promocode || "" ,
                [FIREBASE.PARAMETER.PAYMENT_MODE]: updatedPackData?.paymentMode || "",
                [FIREBASE.PARAMETER.TYPE]:modificationType || '', 
            }
           
        

        let mixpanelData = {
            [`${MIXPANEL.PARAMETER.TYPE}`]: updatedPackData.packType || '',
            [`${MIXPANEL.PARAMETER.SOURCE}`]: subscriptionSource?.source || '',
            [`${MIXPANEL.PARAMETER.PACK_NAME}`]: updatedPackData.title || '',
            [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: updatedPackData.price || '',
            /**
             * Needs to be changed when nudge will be integrated
             */
            [`${MIXPANEL.PARAMETER.IS_FROM_NUDGE}`]: MIXPANEL.VALUE.NO,
            [`${MIXPANEL.PARAMETER.FDO_REGISTERED}`]: fdoOrderRaised ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
            [`${MIXPANEL.PARAMETER.FDR_RAISED_ON_DAY}`]: fdoOrderRaised ? fdrRaisedDay : '',
            [`${MIXPANEL.PARAMETER.MOD_TYPE}`]: modificationType || '',
        };

        let moengageData = {
            [`${MOENGAGE.PARAMETER.TYPE}`]: updatedPackData.packType || '',
            [`${MOENGAGE.PARAMETER.SOURCE}`]: subscriptionSource?.source || '',
            [`${MOENGAGE.PARAMETER.PACK_NAME}`]: updatedPackData.title || '',
            [`${MOENGAGE.PARAMETER.PACK_PRICE}`]: updatedPackData.price || '',
            /**
             * Needs to be changed when nudge will be integrated
             */
            [`${MOENGAGE.PARAMETER.IS_FROM_NUDGE}`]: MOENGAGE.VALUE.NO,
            [`${MOENGAGE.PARAMETER.FDO_REGISTERED}`]: fdoOrderRaised ? MOENGAGE.VALUE.YES : MOENGAGE.VALUE.NO,
            [`${MOENGAGE.PARAMETER.FDR_RAISED_ON_DAY}`]: fdrRaisedDay,
            [`${MIXPANEL.PARAMETER.MOD_TYPE}`]: modificationType || '',
        };

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_SUCCESS, mixpanelData);
        moengageConfig.trackEvent(MOENGAGE.EVENT.SUBSCRIBE_SUCCESS, moengageData);
        trackEvent.subscriptionSuccess(fireBaseData)
        appsFlyerConfig.trackSubscriptionSuccess(subscriptionSource?.source || '', updatedPackData.title || '',updatedPackData.price,)
        googleConversionConfig.trackEvent(googleConversion.EVENT.SUBSCRIPTION_SUCCESS,{
            [googleConversion.PARAMETER.VALUE]:updatedPackData?.price || '',
            [googleConversion.PARAMETER.CURRENCY]:googleConversion.VALUE.CURRENCY
        })
    };

    recharge = async (packId) => {
        const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        const {bingeAccountStatus} = user_info;
        const {currentSubscription: {data}, createSubscription, packSelectionSource} = this.props;

        isEmpty(data) ? await createSubscription(packId) : await this.changeSubscription(packId);

        const {
            subscriptionCreateSuccess,
            modifySubscriptionDetail,
            history,
            reactivateSubscriptionDetail,
        } = this.props;
        let headingMessage, instruction, btnAction, errorIcon, icon = false, primaryButtonText, modalClass,
            createModifyData;
        if (!isEmpty(modifySubscriptionDetail)) {
            createModifyData = Object.assign({}, modifySubscriptionDetail);
            if(createModifyData.code === 0 && this.state.revoked) {
                let subscriptionSource = queryStringToObject(packSelectionSource);
                trackPackResumeEvent(subscriptionSource.source);
            }
        } else if (!isEmpty(reactivateSubscriptionDetail)) {
            createModifyData = Object.assign({}, reactivateSubscriptionDetail);
        } else {
            createModifyData = Object.assign({}, subscriptionCreateSuccess);
        }

        if (createModifyData.code === 0) {

            if (createModifyData?.data?.fdoOrderRaised) {
                safeNavigation(history, `${URL.DEFAULT}`);
            } else {
                const {history} = this.props;
                const {data: {message, downgrade}} = createModifyData;

                modalClass = isMobile.any() ? 'payment-success-modal' : 'payment-success-modal payment-success-modal-device';
                instruction = isMobile.any() ? (this.state.packStatus === PACK_STATUS.DOWNGRADE ? message : SUBSCRIPTION_SUMMARY.WEB_SMALL_PAYMENT_SUCCESS)
                    : message;
                headingMessage = downgrade && bingeAccountStatus === ACCOUNT_STATUS.ACTIVE ?
                    SUBSCRIPTION_SUMMARY.REQUEST_SUCCESSFULL : SUBSCRIPTION_SUMMARY.PAYMENT_SUCCESSFULL;
                icon = true;
                primaryButtonText = SUBSCRIPTION_SUMMARY.OK;
                btnAction = () => {
                    safeNavigation(history, `/${URL.MY_SUBSCRIPTION}`);
                }
                subscriptionSuccessFailurePopup({modalClass, headingMessage, instruction, icon, primaryButtonText, btnAction, errorIcon});
            }
            /*
           The third parameter in getCurrentSubscriptionInfo tells if we need to update the subscription related people properties or not and it is passed
           as true here as it needs to be updated whenever the pack is purchased
            */
            await getCurrentSubscriptionInfo(false, false, true);
            const {currentSubscription} = this.props;
            let fdoOrderRaised = createModifyData?.data?.fdoOrderRaised;
            this.trackAnalytics(currentSubscription?.data, fdoOrderRaised);

            setKey(LOCALSTORAGE.SHOW_FS_POPUP, JSON.stringify(true));

        } else {
            subscriptionFailure(createModifyData, history);
        }
    }

    checkForBalance = () => {
        const {
            aboutSubscription, historyState, dunning, currentSubscription,
        } = this.props;
        let totalAmount = this.props?.balanceInfo?.data?.totalAmount;
        let balance = this.props?.balanceInfo?.data?.balanceQueryRespDTO?.balance;
        //my subscription page
        if (dunning) {
            return false;
        }
        if (aboutSubscription) {
            // account dropdown clicked
            if (historyState) {
                const bingeAccountStatus = currentSubscription?.data?.subscriptionInformationDTO?.bingeAccountStatus?.toUpperCase();
                const packPrice = parseInt(currentSubscription?.data?.packPrice);
                if (bingeAccountStatus === ACCOUNT_STATUS.DEACTIVATED || bingeAccountStatus === ACCOUNT_STATUS.DEACTIVE) {
                    //Check if  user's is inactive and the balance is less than the wallet amount i.e. low balance -> recharge
                    //Check if  user's is inactive and the balance is greater than the wallet amount i.e. balance exists -> so DTH balance block
                    return packPrice <= balance;
                }

            } else {
                this.inactiveProceed = true;
                return (parseInt(balance) >= parseInt(totalAmount));
            }
        } else if (parseInt(balance) >= parseInt(totalAmount)) {
            //balance exist
            return true;
        }
        return false
    }

    subscriptionSummaryCases = () => {
        const {
            aboutSubscription,
            modifySubscription,
            currentSubscription,
            history,
            createSubscription,
            bingeAccountStatus,
            rechargeSource,
            openPopup,
        } = this.props;
        let recommendedAmount = this.props?.balanceInfo?.data?.recommendedAmount;
        recommendedAmount = recommendedAmount === undefined ? 0 : recommendedAmount;
        let paidPackUpgradeCheck = this.infoIconShowCases();

        const {recommendedValue, subscriptionProceed, updatedPackData} = this.state;

        if (get(updatedPackData, 'packType') && updatedPackData?.packType.toLowerCase() === PACK_TYPE.FREE && !aboutSubscription) {
            return (<FreeTrial packDetail={updatedPackData} createSubscription={createSubscription}
                               freeOpenPopup={this.freeOpenPopup} isCreate={isEmpty(currentSubscription.data)}
                               modifySubscription={modifySubscription} aboutSubscription={aboutSubscription}
            />)
        } else if (this.checkForBalance()) {
            // paidPackUpgradeCheck putting it here instead of directly passing in props due to performance issues
            return (<DTHBalance packDetail={updatedPackData} dthProceed={this.dthProceed}
                                bingeAccountStatus={bingeAccountStatus} history={history}
                                inactiveProceed={subscriptionProceed ? false : this.inactiveProceed}
                                filteredList={this.filteredList} balanceInfo={this.props.balanceInfo}
                                openPopup={openPopup} aboutSubscription={aboutSubscription}
                                paidPackUpgrade={paidPackUpgradeCheck}
            />)
        } else {
            // paidPackUpgradeCheck putting it here instead of directly passing in props due to performance issues
            return (<LowBalance packDetail={updatedPackData}
                                recommendedValue={aboutSubscription ? parseInt(recommendedAmount) : parseInt(recommendedValue, 10)}
                                balanceInfo={this.props.balanceInfo} rechargePopup={this.rechargePopup}
                                rechargeSource={rechargeSource} openPopup={openPopup}
                                paidPackUpgrade={paidPackUpgradeCheck}
            />)
        }
    }

    dthProceed = async (packId) => {
        const {currentSubscription, cancelPack, getCurrentSubscriptionInfo} = this.props;
        if (currentSubscription?.status === ACCOUNT_STATUS.DEACTIVE && currentSubscription?.expiredWithinSixtyDays && !currentSubscription?.cancelled) {
            await cancelPack(true, false, true);

            const {cancelData} = this.props;

            if (!isEmpty(cancelData)) {
                await getCurrentSubscriptionInfo();
                const {currentSubscription, packList} = this.props;

                let updatedPack = currentSubscription?.data;
                if (currentSubscription?.packType.toLowerCase() === PACK_TYPE.FREE) {
                    if (currentSubscription?.data) {
                        let packListData = packList && packList.data.packList;
                        let updatedData = packListData.filter(i => parseInt(i.alternatePackId) === parseInt(currentSubscription?.data?.packId))

                        if (updatedData) {
                            updatedPack = updatedData[0];
                        }
                    }
                }
                this.setState({
                    subscriptionProceed: true,
                    updatedPackData: updatedPack,
                });

            }
        } else {
            await this.recharge(packId);
        }
    }

    handleSubscriptionErrorPopup = (message) => {
        const {openPopup, history, closePopup} = this.props;
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal downgrade ',
            headingMessage: 'Something Went Wrong',
            instructions: message && message,
            icon: false,
            primaryButtonText: 'OK',
            primaryButtonAction: () => {
                safeNavigation(history, `/${URL.MY_SUBSCRIPTION}`)
            },
            errorIcon: 'icon-alert-upd',
            closeModal: true,
            hideCloseIcon: true,
            secondaryButtonText: 'Cancel',
            secondaryButtonAction: () => {
                closePopup()
            },
        })
    }

    freeOpenPopup = async () => {
        const {
            modifySubscriptionDetail,
            subscriptionCreateSuccess,
            getCurrentSubscriptionInfo,
            history,
        } = this.props;

        if (!isEmpty(subscriptionCreateSuccess) && subscriptionCreateSuccess?.code !== 0) {
            this.handleSubscriptionErrorPopup(subscriptionCreateSuccess?.message);
        } else if (!isEmpty(modifySubscriptionDetail) && modifySubscriptionDetail?.code !== 0) {
            this.handleSubscriptionErrorPopup(modifySubscriptionDetail?.message);
        } else {
            setKey(LOCALSTORAGE.PACK_SELECTED, true);

            /*
            The third parameter in getCurrentSubscriptionInfo tells if we need to update the subscription related people properties or not and it is passed
            as true here as it needs to be updated whenever the pack is purchased
             */
            await getCurrentSubscriptionInfo(false, false, true);
            const {currentSubscription} = this.props;
            this.trackAnalytics(currentSubscription?.data);

            redirectToHomeScreen(history);
        }
    }

    rechargePopup = (bingeSubscriptionAmountList, recommendedValue) => {
        const {openPopup} = this.props;
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal recharge-popup ',
            //Below code for phase 3
            //instructions: 'Recommended recharge amount for your Tata Play account',
            //Below instruction code for phase 2
            instructions: 'The amount displayed is the recommended monthly subscription to keep your Tata Play Account active',
            errorIcon: 'icon-circle-copy',
            closeModal: true,
            //Below code for phase 3
            //rechargeValues: {bingeSubscriptionAmountList, recommendedValue},
            primaryButtonText: 'OK',
            hideCloseIcon: true,
        })
    }

    billingPopup = (proRataAmount) => {
        const {openPopup} = this.props;
        const {updatedPackData} = this.state;
        const date = getDate(updatedPackData.packExpiry);
        const dayMonth = date.split(' ');
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal billing-popup ',
            headingMessage: 'Billing Period',
            instructions: `You are being charged ₹${proRataAmount} on prorata basis. After ${dayMonth[0]} ${dayMonth[1]} you will be charged ₹${updatedPackData.price}. This amount will be deducted from your Tata Play balance account every 30 days.`,
            errorIcon: isMobile.any() ? 'icon-info' : 'icon-circle-copy',
            closeModal: true,
            hideCloseIcon: isMobile.any(),
            primaryButtonText: isMobile.any() ? 'Ok' : '',
        })
    }

    packDetails = (data) => {
        const {updatedPackData, packStatus} = this.state;
        const {currentSubscription} = this.props;
        let bingeAccountStatus = get(currentSubscription, 'data.subscriptionInformationDTO.bingeAccountStatus');
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        if(userInfo.dummyUser) {
            return `${getDate(updatedPackData.packCreated)} - ${getDate(updatedPackData.packExpiry)}`;
        }

        /**
         * Check if user has selected a paid pack
         * */
        if (updatedPackData?.packType?.toLowerCase() !== PACK_TYPE.FREE) {
            /**
             * Check if user is upgrading or downgrading the pack
             */
            if ((packStatus === PACK_STATUS.UPGRADE || packStatus === PACK_STATUS.DOWNGRADE) ||
                /**
                 * Check if user is selecting the same pack but the pack is expired
                 */
                (packStatus === "" && bingeAccountStatus && (bingeAccountStatus.toUpperCase() === ACCOUNT_STATUS.DEACTIVE ||
                    bingeAccountStatus.toUpperCase() === ACCOUNT_STATUS.DEACTIVATED))) {
                return `${getDate(updatedPackData.packCreated)} - ${getDate(updatedPackData.packExpiry)}`
            }
        } else {
            const {packExpiry} = data;
            return updatedPackData.packType.toLowerCase() === PACK_TYPE.FREE ?
                `${SUBSCRIPTION_SUMMARY.FREE_TRIAL} ${packExpiry}` : `${CURRENT_SUBSCRIPTION.EXPIRES} ${packExpiry}`;
        }
    }

    /**
     * method when to show info-icon for billing detail-should be shown when user upgrades paid pack---- hide.
     * in about subscription popup
     * @returns {boolean}
     */
    infoIconShowCases = () => {
        const {
            currentSubscription: {data},
            aboutSubscription,
        } = this.props;
        const {updatedPackData} = this.state;

        if(!aboutSubscription && updatedPackData.packType.toLowerCase() !== PACK_TYPE.FREE && !isEmpty(data) && data.status === ACCOUNT_STATUS.ACTIVE) {
            if(data.packType.toLowerCase() === PACK_TYPE.FREE || this.state.packStatus !== PACK_STATUS.DOWNGRADE) {
                return true;
            }
        }
    }

    /**
     * return filtered detail for currentpack for proceeding from inactive subscription proceed button
     * */
    filteredList = () => {
        this.inactiveProceed = false;
        this.setState({
            subscriptionProceed: true,
        })
    }

    setStateApiSuccess = (data) => {
        this.setState({
            cancelData: data,
        })
    }

    mobileBack = () => {
        const {subscriptionProceed} = this.state;
        if (subscriptionProceed) {
            this.setState({
                subscriptionProceed: false,
            })
        } else {
            this.props.closeSubscriptionSummary()
        }
    };

    showCancelledTag = () => {
        const {updatedPackData} = this.state;
        let bingeAccountStatus = updatedPackData?.subscriptionInformationDTO?.bingeAccountStatus?.toUpperCase();
        if (updatedPackData?.packType?.toLowerCase() === PACK_TYPE.PAID && updatedPackData?.cancelled &&
            (bingeAccountStatus === ACCOUNT_STATUS.DEACTIVATED || bingeAccountStatus === ACCOUNT_STATUS.DEACTIVE)) {
            return true;
        }
    }

    showResumeCancelButton = () => {
        const {updatedPackData} = this.state;
        if (updatedPackData?.cancelLink && updatedPackData?.cancelled && updatedPackData?.status === ACCOUNT_STATUS.ACTIVE) {
            return true;
        } else if (updatedPackData?.modifyLink && !updatedPackData.cancelled && updatedPackData.status === ACCOUNT_STATUS.ACTIVE) {
            return true;
        }
        return false;
    }

    render() {
        const {
            aboutSubscription,
            history,
        } = this.props;
        const {subscriptionProceed, updatedPackData} = this.state;
        let activeStepNum = this.props.aboutSubscription && !this.state.subscriptionProceed ? 2 : 4;

        return (
            aboutSubscription && !subscriptionProceed ?
                <AboutYourSubscription data={updatedPackData} history={history} currentState={this}
                                       subscriptionSummaryCases={this.subscriptionSummaryCases}
                                       expiredCheck={showExpiryInfo} mobileBack={this.mobileBack}
                                       showResumeCancelButton={this.showResumeCancelButton}
                                       activeStep={activeStepNum} showCancelledTag={this.showCancelledTag}/> :
                <SubscriptionSummary data={updatedPackData} history={history}
                                     currentState={this}
                                     subscriptionSummaryCases={this.subscriptionSummaryCases}
                                     packStatus={this.state.packStatus}
                                     expiredCheck={this.packDetails}
                                     showResumeCancelButton={this.showResumeCancelButton}
                                     mobileBack={this.mobileBack} activeStep={activeStepNum}
                                     showCancelledTag={this.showCancelledTag}/>
        )
    }
}

SubscriptionSummaryModal.propTypes = {
    packDetail: PropTypes.object,
    subscriptionCreateSuccess: PropTypes.object,
    createSubscription: PropTypes.func,
    history: PropTypes.object,
    balanceInfo: PropTypes.object,
    aboutSubscription: PropTypes.object,
    modifySubscription: PropTypes.func,
    modifySubscriptionDetail: PropTypes.object,
    openPopup: PropTypes.func,
    currentSubscription: PropTypes.object,
    bingeAccountStatus: PropTypes.string,
    getCurrentSubscriptionInfo: PropTypes.func,
    closeSubscriptionSummary: PropTypes.func,
    closePopup: PropTypes.func,
    historyState: PropTypes.bool,
    modifyCallback: PropTypes.func,
    dunning: PropTypes.bool,
    packList: PropTypes.object,
    cancelData: PropTypes.object,
    resumeData: PropTypes.object,
    reactivateSubscription: PropTypes.func,
    callSubscription: PropTypes.bool,
    cancelPack: PropTypes.func,
    cancelDataSilently: PropTypes.bool,
    rechargeSource: PropTypes.string,
    reactivateSubscriptionDetail: PropTypes.object,
    packSelectionSource: PropTypes.string,
    modificationType: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        subscriptionCreateSuccess: get(state.packSelectionDetail, 'createSubscription'),
        balanceInfo: get(state.packSelectionDetail, 'balanceInfo'),
        modifySubscriptionDetail: get(state.packSelectionDetail, 'modifySubscription'),
        currentSubscription: get(state.packSelectionDetail, 'currentSubscription'),
        packList: get(state.packSelectionDetail, 'packList'),
        cancelData: get(state.mySubscriptionReducer, 'cancelData'),
        cancelDataSilently: get(state.mySubscriptionReducer, 'cancelDataSilently'),
        resumeData: get(state.mySubscriptionReducer, 'resumeData'),
        reactivateSubscriptionDetail: get(state.packSelectionDetail, 'reactivateSubscription'),
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            createSubscription,
            modifySubscription,
            getBalanceInfo,
            openPopup,
            getCurrentSubscriptionInfo,
            closePopup,
            reactivateSubscription,
            cancelPack,
        }, dispatch),
    }
}
export default (connect(mapStateToProps, mapDispatchToProps)(SubscriptionSummaryModal))
