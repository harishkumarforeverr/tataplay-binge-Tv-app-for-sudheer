import React, {Component} from 'react';
import {withRouter} from 'react-router';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";

import {openPopup} from "@common/Modal/action";
import {logOut, getAccountDetailsFromSid} from "@containers/BingeLogin/APIs/action";
import {getIconInfo, getIconSuccessTick} from '@utils/common';
import {getProfileDetails} from '@containers/Profile/APIs/action';
import {LOCALSTORAGE} from "@constants";

import {postSwitchAccountReq, resetSwitchAccountData} from './API/action';

import './style.scss';
import {getKey} from "@utils/storage";
import {getCurrentSubscriptionInfo} from "../PackSelection/APIs/action";
import {switchAccount} from "@utils/common";

class SwitchAccountDropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSubscriber: '',
            showAvatarImage: false,
        }
    }

    componentDidMount() {
        this.loadHandler();
    }

    componentWillUnmount() {
        this.props.resetSwitchAccountData();
    }

    loadHandler = async() => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let selectedSubscriberBaId = userInfo.baId;

        this.setState({
            selectedSubscriber: selectedSubscriberBaId,
        });
        await this.props.getAccountDetailsFromSid();
    };

    getAccountItem = (selectedAccountItem) => {
        let {accountList} = this.props,
            {selectedSubscriber} = this.state;
        if (selectedAccountItem) {
            return accountList && accountList.accountDetailList && accountList.accountDetailList.find((item) => {
                return item.baId === selectedSubscriber
            });
        } else {
            return accountList && accountList.accountDetailList.filter((item) => {
                return item.baId !== selectedSubscriber
            });
        }
    };

    setUpdatedBaId = (baId) => {
        this.setState({
            selectedSubscriber: baId,
        });
    }

    render() {
        let {
            toggleHeaderDropdown,
            isSwitchAccDropdownOpen = false,
            accountList,
            onSignOut,
            history,
            userProfileImage,
        } = this.props;
        let {selectedSubscriber} = this.state;
        let selectedAccountItem = accountList && this.getAccountItem(true);
        let availableAccountList = accountList && this.getAccountItem(false);

        return (
            <ul className={`switch-account-dropdown-list ${isSwitchAccDropdownOpen ? '' : 'hide'} ${userProfileImage ? 'profile-img' : 'avatar-img'}`}
            >
                <div className="switch-head" account="true">
                    <p account="true">
                        <i className="icon-left-arrow"
                           onClick={(e) => toggleHeaderDropdown(e, 'SwitchAccountDropdownOpen')} account="true"/>
                        Switch Account
                    </p>
                </div>
                {
                    selectedAccountItem &&
                    <div className="selected-account acc" onClick={(e) => toggleHeaderDropdown(e, 'AccountDropdown')}>
                        <div className="binge-asset">
                            <img src={getIconInfo(selectedAccountItem)} alt={'img'}/>
                        </div>
                        <div className="selected-account-detail acc-detail" account="true">
                            <p account="true">
                                <span className="white-text" account="true">{selectedAccountItem.aliasName}</span> <br/>
                            </p>
                        </div>
                        <div className="active-tick">
                            <p>{getIconSuccessTick()}</p>
                        </div>
                    </div>
                }
                {
                    availableAccountList && availableAccountList.map((item, index) => {
                        return (
                            <li key={index}
                                onClick={(e) =>
                                    switchAccount(item, selectedSubscriber, history, this.setUpdatedBaId, true, e, toggleHeaderDropdown)}>
                                <div className="available-account acc">
                                    <div className="binge-asset">
                                        <img src={getIconInfo(item)} alt={'img'}/>
                                    </div>
                                    <div className="available-account-detail acc-detail">
                                        <p>
                                            <span className="white-text">{item.aliasName}</span> <br/>
                                        </p>
                                    </div>
                                </div>
                            </li>
                        )
                    })
                }
                <div className="logged-in-user-details sign-out-text">
                    <h4 className="white-text" onClick={(e) => onSignOut(e)}>Sign Out</h4>
                </div>
            </ul>
        )
    }
}

function mapStateToProps(state) {
    return {
        logOutResponse: get(state.bingeLoginDetails, 'logOutResponse'),
        accountList: get(state.bingeLoginDetails, 'accountDetailsFromSid.data'),
        postSwitchAccountResponse: get(state.switchAccountDetails, 'postSwitchAccountResponse'),
        configResponse: get(state.headerDetails, 'configResponse'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            openPopup,
            logOut,
            loggedIn,
            getAccountDetailsFromSid,
            postSwitchAccountReq,
            resetSwitchAccountData,
            getProfileDetails,
            getCurrentSubscriptionInfo,
        }, dispatch),
    }
}

SwitchAccountDropdown.propTypes = {
    toggleHeaderDropdown: PropTypes.func,
    logOut: PropTypes.func,
    loggedIn: PropTypes.func,
    openPopup: PropTypes.func,
    isSwitchAccDropdownOpen: PropTypes.bool,
    logOutResponse: PropTypes.object,
    history: PropTypes.object,
    getAccountDetailsFromSid: PropTypes.func,
    postSwitchAccountReq: PropTypes.func,
    resetSwitchAccountData: PropTypes.func,
    accountList: PropTypes.object,
    postSwitchAccountResponse: PropTypes.object,
    getProfileDetails: PropTypes.func,
    onSignOut: PropTypes.func,
    configResponse: PropTypes.object,
    userProfileImage: PropTypes.bool,
    getCurrentSubscriptionInfo: PropTypes.func,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SwitchAccountDropdown))
