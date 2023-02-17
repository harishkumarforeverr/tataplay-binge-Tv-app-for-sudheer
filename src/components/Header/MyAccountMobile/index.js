import React, {Component} from 'react';
import {connect} from "react-redux";
import {withRouter} from 'react-router';
import {bindActionCreators} from "redux";
import PropTypes from "prop-types";
import isEmpty from 'lodash/isEmpty';
import get from "lodash/get";

import {getProfileDetails} from '@containers/Profile/APIs/action';
import { getBalanceInfo } from "@containers/PackSelection/APIs/action";
import { getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";
import {closePopup, openPopup} from "@common/Modal/action";
import {
    callLogOut,
    getIconInfo,
    rechargeBtnHandler,
    redirectToApp,
    safeNavigation,
    showNoInternetPopup,
} from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import Button from "@common/Buttons";
import {MODALS} from "@common/Modal/constants";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import {hideFooter, hideHeader} from "@src/action";

import './style.scss';
import {URL} from "@constants/routeConstants";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import {logOut} from "@containers/BingeLogin/APIs/action";
import DeviceResizeDetector from "@components/HOC/deviceResizeDetector"
import BalanceAnimator from "../BalanceAnimator";
import {MESSAGES} from '../constants.js';

class MyAccountMobile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showAvatarImage: false,
            deviceName: '',
        }
    }

    componentDidMount() {
        this.loadHandler();
    }

    loadHandler = async () => {
        let {
            hideHeader,
            hideFooter,
            getProfileDetails,
            userProfileDetails,
            getBalanceInfo,
            getCurrentSubscriptionInfo,
        } = this.props;
        hideHeader(true);
        hideFooter(true);
        await getCurrentSubscriptionInfo();

        const {currentSubscription} = this.props;
        let packId = get(currentSubscription, 'packId');
        await getBalanceInfo(packId);
        let {isLoading} = this.props;
        isLoading && this.props.hideMainLoader();
        isEmpty(userProfileDetails) && await getProfileDetails(false);
        this.setAvatarFlag();
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.HOME_ACCOUNT);
        moengageConfig.trackEvent(MOENGAGE.EVENT.HOME_ACCOUNT);
    };


    setAvatarFlag = () => {
        let {userProfileDetails} = this.props;
        this.setState({
            showAvatarImage: !get(userProfileDetails, 'profileImage'),
        })
    };

    handleBrokenImage = () => {
        this.setState({
            showAvatarImage: true,
        })
    };

    confirmLogOut = (history) => {
        const {openPopup, closePopup} = this.props;
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal inactive-alert confirm-logout',
            headingMessage: MESSAGES.SIGN_OUT.HEADING,
            instructions: MESSAGES.SIGN_OUT.INSTRUCTIONS,
            primaryButtonText: MESSAGES.SIGN_OUT.PRIMARY_BTN_TEXT,
            primaryButtonAction: () => {
                closePopup();
                callLogOut(true, history);
            },
            secondaryButtonText: MESSAGES.SIGN_OUT.SECONDARY_BTN_TEXT,
            secondaryButtonAction: () => {
                closePopup()
            },
            hideCloseIcon: true,
            errorIcon: 'icon-alert-upd',
        })
    }

    onSubscriptionClick = () => {
        let {history} = this.props;
        safeNavigation(history, `/${URL.MY_SUBSCRIPTION}`);
    };

    onSwitchAccountClick = () => {
        if (!navigator.onLine) {
            showNoInternetPopup();
        } else {
            let {history} = this.props;
            safeNavigation(history, `/${URL.SWITCH_ACCOUNT}`);
        }
    }

    render() {
        let {userProfileDetails, configResponse, balanceInfo, currentSubscription} = this.props;
        let {showAvatarImage} = this.state;
        let {history} = this.props;
        let imgUrl = `${get(configResponse, 'data.config.subscriberImage.subscriberImageBaseUrl')}${get(userProfileDetails, 'profileImage')}`
        return (
            <div className={'my-account-mobile-container for-mobile'}>
                <div className={'top-section'}>
                    <div className={'img-section'}>
                        {configResponse && userProfileDetails &&
                        <React.Fragment>
                            {
                                get(userProfileDetails, 'profileImage') && !showAvatarImage &&
                                <div className={`profile-img-section`}>
                                <span className="profile-img add-border">
                                    <img alt=""
                                         src={imgUrl}
                                         onError={this.handleBrokenImage}/>
                                </span>
                                </div>
                            }
                            {
                                (!get(userProfileDetails, 'profileImage') || showAvatarImage) &&
                                <div className={'avatar-block'}>
                                    <p>{get(userProfileDetails, 'firstName', '*').charAt(0)}</p>
                                </div>
                            }
                        </React.Fragment>
                        }
                    </div>
                    <div className={'detail-section'}>
                        <p>{get(userProfileDetails, 'firstName')} {get(userProfileDetails, 'lastName')}</p>
                        <p>Mobile: +91 <span>{get(userProfileDetails, 'rmn')}</span></p>
                        <p>
                            {currentSubscription?.subscriptionType && <img className="binge-asset"
                                                         src={getIconInfo(currentSubscription)}
                                                         alt={'img'}/>}
                            <span>{get(userProfileDetails, 'aliasName')}</span></p>
                        {!isEmpty(currentSubscription) && <p className={'current-pack-details'}>
                            <table>
                                {get(currentSubscription, 'status') !== ACCOUNT_STATUS.WRITTEN_OFF &&
                                <tr account="true">
                                    <td className='pack-name'>{get(currentSubscription, 'packName')}</td>

                                    {get(currentSubscription, 'migrated') &&
                                    <td>
                                        <span
                                            className={`date ${get(currentSubscription, 'status') !== ACCOUNT_STATUS.ACTIVE && 'expired'}`}
                                            account="true">
                                             {currentSubscription?.accountScreenExpiryMessage}
                                        </span>
                                    </td>
                                    }
                                </tr>}
                                {/*       {currentSubscription?.primePackDetails?.packStatus && <tr account="true">
                                    <td>Amazon Prime</td>
                                    {
                                        get(currentSubscription, 'migrated') &&
                                        <td>
                                        <span
                                            className={'date'}>Expires on {get(currentSubscription, 'primePackDetails.expiryDate')}</span>
                                        </td>
                                    }
                                </tr>}*/}
                            </table>
                        </p>}
                    </div>
                </div>
                <div className={'balance-block'}>
                    <p>Tata Play Balance for Sub. ID: {get(balanceInfo, 'balanceQueryRespDTO.subscriberId')}</p>
                    <p><BalanceAnimator isFromMobile={true} balanceInfo={balanceInfo}
                                        currentSubscription={currentSubscription}/></p>
                    <p>Recharge due on {get(balanceInfo, 'balanceQueryRespDTO.endDate')} </p>
                    <Button cName="btn primary-btn" bType="button"
                            clickHandler={() => rechargeBtnHandler(history, currentSubscription)}
                            bValue={'Recharge'}/>

                </div>
                <div className={'subscription-block'} onClick={this.onSubscriptionClick}>
                    <i className={'icon-my-subscription-1'}/>
                    <span>My Subscription</span>
                    <i className={'icon-right right-icon'}/>
                </div>
                {
                    this.props.accountList && this.props.accountList?.accountDetailList?.length > 1 &&
                    <div className={'switch-account-block'} onClick={this.onSwitchAccountClick}>
                        <i className={'icon-switch-account'}/>
                        <span>Switch Account</span>
                        <i className={'icon-right right-icon'}/>
                    </div>
                }
                <div className={'button-block'}>
                    <Button cName="btn" bType="button"
                            clickHandler={() => redirectToApp()}
                            bValue={'Start Watching On App'}
                    />
                    <div className="blue-text" onClick={() => this.confirmLogOut(history)}>
                        <a target="blank">{'Sign Out'}</a>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        userProfileDetails: get(state.profileDetails, 'userProfileDetails'),
        configResponse: get(state.headerDetails, 'configResponse'),
        balanceInfo: get(state.packSelectionDetail, 'balanceInfo.data'),
        currentSubscription: get(state.packSelectionDetail, 'currentSubscription.data'),
        logOutResponse: get(state.bingeLoginDetails, 'logOutResponse'),
        subscriberDeviceList: get(state, 'deviceManagement.subscriberDeviceList.data.deviceList'),
        accountList: get(state.bingeLoginDetails, 'accountDetailsFromSid.data'),
        isLoading: get(state.commonContent, 'isLoading'),
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            hideHeader,
            hideFooter,
            getProfileDetails,
            getBalanceInfo,
            getCurrentSubscriptionInfo,
            logOut,
            openPopup,
            closePopup,
        }, dispatch),
    }
};

MyAccountMobile.propTypes = {
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    getProfileDetails: PropTypes.func,
    getBalanceInfo: PropTypes.func,
    getCurrentSubscriptionInfo: PropTypes.func,
    userProfileDetails: PropTypes.object,
    configResponse: PropTypes.object,
    balanceInfo: PropTypes.object,
    currentSubscription: PropTypes.object,
    logOutResponse: PropTypes.object,
    history: PropTypes.object,
    logOut: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    openTimeoutPopup: PropTypes.func,
    subscriberDeviceList: PropTypes.array,
    isLoading: PropTypes.bool,
    hideMainLoader: PropTypes.func,
    accountList: PropTypes.object,
};

export default DeviceResizeDetector(withRouter(connect(mapStateToProps, mapDispatchToProps)(MyAccountMobile)))
