import React, {Component} from "react";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import {getBalanceInfo, packListing} from "@containers/PackSelection/APIs/action";
import { getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";
import {hideMainLoader, showMainLoader} from "@src/action";

import {openPopup, closePopup} from "@common/Modal/action";
import Button from "@common/Buttons";
import {URL} from "@routeConstants";
import {LOCALSTORAGE} from "@constants";
import {checkBingeDTHStatus, safeNavigation} from "@utils/common";
import webSmallLogoImage from "@assets/images/web-amall-login-logo.png";
import {redirectToHomeScreen} from "@containers/BingeLogin/bingeLoginCommon";
import {getKey, setKey} from "@utils/storage";
import {MODALS} from "@common/Modal/constants";

import {createSubscription, quickRecharge} from "../APIs/action";
import {openLowBalancePopUp} from '../APIs/common';

import './../style.scss';
import './style.scss';
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import {checkUserDTHStatus} from "@utils/common";
import {trackSubscriptionFailureEvent} from "@containers/MySubscription/APIs/subscriptionCommon";
import appsFlyerConfig from "@utils/appsFlyer";

class FreeTrialPack extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount = async () => {
        await this.onMountHandler();
    }

    onMountHandler = async () => {
        let {
            getCurrentSubscriptionInfo,
            packListing,
            showMainLoader,
            hideMainLoader,
            getBalanceInfo,
            history,
            analyticsSource,
        } = this.props;
        showMainLoader();
        isEmpty(this.props.currentSubscription) && await getCurrentSubscriptionInfo();
        let {currentSubscription} = this.props;
        let data = currentSubscription?.data;
        /** For dummy user when user has dth inactive, temp suspended or partially dunned then skip btn will take user to home page
         */
        checkUserDTHStatus(data, history, false, true, '', true);
        isEmpty(this.props.packList) && await packListing();
        let {packList} = this.props;
        packList && await getBalanceInfo(packList.packId);
        hideMainLoader();

        /** Below value to be updated after nudge work is done **/
        
        moengageConfig.trackEvent(MOENGAGE.EVENT.PACK_SELECTION_INITIATE, {
            [`${MOENGAGE.PARAMETER.IS_FROM_NUDGE}`]: MOENGAGE.VALUE.NO,
            [`${MIXPANEL.PARAMETER.SOURCE}`]: analyticsSource || '',
        });
    }

    handleStartFreeTrial = async (item) => {
        const {
            openPopup, closePopup, history, createSubscription,
            getCurrentSubscriptionInfo, packListResponse,
        } = this.props;

        //Check if user has no pack or cancelled free pack
        if (!packListResponse.sufficientBalance) {
            openLowBalancePopUp(this.props, packListResponse);
        } else {
            await createSubscription(item.packId);
            let {subscriptionCreateSuccess} = this.props;
            /// need abhinav's confirmation on error
            if (!isEmpty(subscriptionCreateSuccess) && subscriptionCreateSuccess?.code !== 0) {
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal downgrade ',
                    headingMessage: 'Something Went Wrong',
                    instructions: subscriptionCreateSuccess?.message,
                    icon: false,
                    primaryButtonText: 'OK',
                    primaryButtonAction: () => {
                        closePopup()
                    },
                    errorIcon: 'icon-alert-upd',
                    closeModal: true,
                    hideCloseIcon: true,
                });

                trackSubscriptionFailureEvent(subscriptionCreateSuccess?.data?.message);
            } else {
                setKey(LOCALSTORAGE.PACK_SELECTED, true);
                await getCurrentSubscriptionInfo(false, false, true).then(res => this.trackAnalytics(res?.data));
                const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
                user_info['freeTrialAvailed'] = true;
                setKey(LOCALSTORAGE.USER_INFO, JSON.stringify(user_info));
                redirectToHomeScreen(history);
            }
        }
    }

    laterClick = () => {
        safeNavigation(this.props.history, URL.DEFAULT);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.FREE_TRIAL_LATER);
        moengageConfig.trackEvent(MOENGAGE.EVENT.FREE_TRIAL_LATER);
    }

    trackAnalytics = (data) => {
        const {analyticsSource} = this.props;
        let mixpanelData = {
            [`${MIXPANEL.PARAMETER.IS_FROM_NUDGE}`]: MIXPANEL.VALUE.NO,
            [`${MIXPANEL.PARAMETER.TYPE}`]: data?.packType || '',
            [`${MIXPANEL.PARAMETER.PACK_NAME}`]: data?.packName || '',
            [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: data?.packPrice || '',
            [`${MIXPANEL.PARAMETER.SOURCE}`]: analyticsSource || '',
            [`${MIXPANEL.PARAMETER.MOD_TYPE}`]: '',
            /**
             * Needs to be changed when nudge will be integrated
             */
        };

        let moengageData = {
            [`${MIXPANEL.PARAMETER.IS_FROM_NUDGE}`]: MIXPANEL.VALUE.NO,
            [`${MIXPANEL.PARAMETER.TYPE}`]: data?.packType || '',
            [`${MIXPANEL.PARAMETER.PACK_NAME}`]: data?.packName || '',
            [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: data?.packPrice || '',
            [`${MIXPANEL.PARAMETER.SOURCE}`]: analyticsSource || '',
            [`${MIXPANEL.PARAMETER.MOD_TYPE}`]: '',
            /**
             * Needs to be changed when nudge will be integrated
             */
        };

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIBE_SUCCESS, mixpanelData);
        moengageConfig.trackEvent(MOENGAGE.EVENT.SUBSCRIBE_SUCCESS, moengageData);
        appsFlyerConfig.trackSubscriptionSuccess(analyticsSource, data?.packName || '');

    }

    render() {
        let {packList, packListResponse} = this.props;
        return (
            <div className={'free-trial-container'}>
                <div className="free-trial pack-parent">
                    <div className={'web-small-logo for-mobile'}>
                        <img src={webSmallLogoImage} alt={'Logo-Image'}/>
                    </div>
                    <div className="pack-header">
                        <h3>{packListResponse?.verbiage?.title}</h3>
                        <p className="free-trial-text white">{packListResponse?.verbiage?.desc}</p>
                        <div className="pack-outer">
                            <ul className="pack-body">
                                <li id={packList?.packId}>
                                    <div className="app-block">
                                        <ul className="app-listing">
                                            {packList?.providers && packList.providers.map((items, index) =>
                                                <img key={index} src={items.iconUrl} alt="provider"/>,
                                            )}
                                        </ul>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <p className="free-trial-text">{packListResponse?.expiryMessage}</p>
                        <p className="free-trial-text">{packListResponse?.verbiage?.footerMessage}</p>
                    </div>
                </div>
                <div className={'free-trial-start'}>
                    <Button cName="btn primary-btn" bValue="Start Free Trial Today"
                            clickHandler={() => this.handleStartFreeTrial(packList)}/>
                    <div className="skip" onClick={() => this.laterClick()}>Later</div>
                </div>
            </div>
        )
    }
}

FreeTrialPack.propTypes = {
    skip: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    createSubscription: PropTypes.func,
    getCurrentSubscriptionInfo: PropTypes.func,
    packListing: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    getBalanceInfo: PropTypes.func,
    quickRecharge: PropTypes.func,
    packList: PropTypes.object,
    packListResponse: PropTypes.object,
    history: PropTypes.object,
    currentSubscription: PropTypes.object,
    subscriptionCreateSuccess: PropTypes.object,
    analyticsSource: PropTypes.string,
}

const mapStateToProps = (state) => {
    return {
        packListResponse: get(state.packSelectionDetail, 'packList.data'),
        packList: get(state.packSelectionDetail, 'packList.data.packList[0]'),
        balanceInfo: get(state.packSelectionDetail, 'balanceInfo'),
        currentSubscription: get(state.packSelectionDetail, 'currentSubscription'),
        subscriptionCreateSuccess: get(state.packSelectionDetail, 'createSubscription'),
        quickRechargeUrl: get(state.packSelectionDetail, 'quickRecharge'),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            packListing,
            showMainLoader,
            hideMainLoader,
            getBalanceInfo,
            getCurrentSubscriptionInfo,
            quickRecharge,
            createSubscription,
            openPopup,
            closePopup,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(FreeTrialPack))