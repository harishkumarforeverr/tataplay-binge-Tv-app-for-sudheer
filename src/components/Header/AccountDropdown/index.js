import React, { Component, Fragment } from 'react';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import get from "lodash/get";

import { openPopup, closePopup } from "@common/Modal/action";
import { MODALS } from "@common/Modal/constants";
import {
    callLogOut,
} from '@utils/common';
import SwitchAccountDropdown from '@containers/SwitchAccount';
import { logOut, getAccountDetailsFromSid } from "@containers/BingeLogin/APIs/action";
import { resetSwitchAccountData } from "@containers/SwitchAccount/API/action";
import { getBalanceInfo, getCurrentSubscriptionInfo } from "@containers/PackSelection/APIs/action";
import { getSubscriberDeviceList } from "@containers/DeviceManagement/APIs/action";
import TopMenuBar from '../AccountSideMenuBar/TopMenuBar';
import BottomMenuBar from '../AccountSideMenuBar/BottomMenuBar';

import { addAlias, clearStore } from "../APIs/actions";

import './style.scss';
import { hideMainLoader, showMainLoader } from "@src/action";
import { MESSAGES } from '../constants';

class AccountDropdown extends Component {

    confirmLogOut = (history) => {
        const { openPopup, closePopup } = this.props;
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
            secondaryButtonAction: () => { closePopup() },
            hideCloseIcon: true,
            errorIcon: 'icon-alert-upd',
        })
    }

    getDropDownHeight = () => {
        let appHeight = document.body.clientHeight;
        if (appHeight && appHeight < 642) {
            return appHeight - 80
        }
    };

    render() {
        let {
            toggleHeaderDropdown,
            isOpen = false,
            isSwitchAccDropdownOpen = false,
            userProfileImage,
            menuListOptions = [],
            profileDetails,
            currentSubscription,
            isExpired,
            onLoginClick,
            dimensions,
            configResponse,
            history,
        } = this.props;
        return (
            <Fragment>
                <div>
                    {isSwitchAccDropdownOpen ?
                        <SwitchAccountDropdown toggleHeaderDropdown={toggleHeaderDropdown}
                            isSwitchAccDropdownOpen={isSwitchAccDropdownOpen}
                            onSignOut={this.confirmLogOut}
                            userProfileImage={userProfileImage} /> :
                        <ul
                            className={`account-dropdown-list ${isOpen ? '' : 'hide'} ${userProfileImage ? 'profile-img' : 'avatar-img'}`}
                            style={{ maxHeight: this.getDropDownHeight() }}
                        >
                            <TopMenuBar
                                history={history}
                                currentSubscription={currentSubscription}
                                profileDetails={profileDetails}
                                onLoginClick={onLoginClick}
                                configResponse={configResponse}
                            />
                            <BottomMenuBar
                                dimensions={dimensions}
                                isExpired={isExpired}
                                menuListOptions={menuListOptions}
                                showContactDetails={false}
                                onLoginClick={onLoginClick}
                            />
                        </ul>}
                </div>
            </Fragment>
        )
    }

}

function mapStateToProps(state) {
    return {
        logOutResponse: get(state.bingeLoginDetails, 'logOutResponse'),
        accountDropDownVal: state.headerDetails.searchText,
        profileDetails: get(state.profileDetails, 'userProfileDetails'),
        userProfileDetails: get(state.profileDetails, 'userProfileDetails'),
        configResponse: get(state.headerDetails, 'configResponse'),
        balanceInfo: get(state.packSelectionDetail, 'accountBalanceInfo.data'),
        currentSubscription: get(state.packSelectionDetail, 'currentSubscription.data'),
        subscriberDeviceList: get(state, 'deviceManagement.subscriberDeviceList.data.deviceList'),
        addAliasResponse: get(state, 'headerDetails.addAliasResponse'),
        accountList: get(state.bingeLoginDetails, 'accountDetailsFromSid.data'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            openPopup,
            closePopup,
            addAlias,
            resetSwitchAccountData,
            clearStore,
            getBalanceInfo,
            getCurrentSubscriptionInfo,
            getSubscriberDeviceList,
            showMainLoader,
            hideMainLoader,
            logOut,
            getAccountDetailsFromSid,
        }, dispatch),
    }
}

AccountDropdown.propTypes = {
    toggleHeaderDropdown: PropTypes.func,
    isOpen: PropTypes.bool,
    clearStore: PropTypes.func,
    addAlias: PropTypes.func,
    logOut: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    profileDetails: PropTypes.object,
    history: PropTypes.object,
    logOutResponse: PropTypes.object,
    loggedIn: PropTypes.func,
    isSwitchAccDropdownOpen: PropTypes.bool,
    resetSwitchAccountData: PropTypes.func,
    resetLoginPage: PropTypes.func,
    userProfileImage: PropTypes.string,
    getBalanceInfo: PropTypes.func,
    getCurrentSubscriptionInfo: PropTypes.func,
    userProfileDetails: PropTypes.object,
    configResponse: PropTypes.object,
    balanceInfo: PropTypes.object,
    currentSubscription: PropTypes.object,
    addAliasResponse: PropTypes.object,
    handleAliasError: PropTypes.func,
    undoAliasName: PropTypes.bool,
    errors: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    getAccountDetailsFromSid: PropTypes.func,
    accountList: PropTypes.object,
    menuListOptions: PropTypes.array,
    isExpired: PropTypes.bool,
    onLoginClick:PropTypes.func,
    dimensions: PropTypes.object,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountDropdown))
