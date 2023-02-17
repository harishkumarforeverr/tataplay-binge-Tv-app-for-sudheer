import React, {Component} from 'react';
import {withRouter} from 'react-router';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";

import {openPopup} from "@common/Modal/action";
import {logOut} from "@containers/BingeLogin/APIs/action";
import {getIconInfo, isMobile} from '@utils/common';
import {getProfileDetails} from '@containers/Profile/APIs/action';
import {LOCALSTORAGE} from "@constants";

import {postSwitchAccountReq, resetSwitchAccountData} from './../../SwitchAccount/API/action';

import './style.scss';
import {getKey} from "@utils/storage";
import {getCurrentSubscriptionInfo} from "../../PackSelection/APIs/action";
import {switchAccount} from "@utils/common";
import Heading from '@common/Heading';
import RadioButton from '@common/RadioButton';
import Button from '@common/Buttons';
import {redirectToHomeScreen} from "@containers/BingeLogin/bingeLoginCommon";
import isEmpty from "lodash/isEmpty";
import {subscriberListing} from "@containers/Login/APIs/actions";

class SwitchAccountSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSubscriber: '',
            showAvatarImage: false,
            isChange: false,
            isSelected: {},
            sId: '',
            accountData: {},
        }
    }

    componentDidMount = async () => {
        await this.loadHandler();
    }

    componentWillUnmount() {
        this.props.resetSwitchAccountData();
    }

    loadHandler = async () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let selectedSubscriberBaId = userInfo.baId;
        const {accountList, subscriberListing, history} = this.props;

        isEmpty(accountList) && await subscriberListing(userInfo.rmn);
        let accountData = this.props?.accountList?.find((i) => i.subscriberId === userInfo.sId);
        this.setState({
            accountData: accountData,
        });
        accountData?.accountDetailsDTOList?.length === 1 && redirectToHomeScreen(history);

        this.setState({
            sId: userInfo.sId,
            selectedSubscriber: selectedSubscriberBaId,
            isSelected: {
                baId: selectedSubscriberBaId,
            },
        });
    };

    setUpdatedBaId = (baId) => {
        this.setState({
            selectedSubscriber: baId,
        });
    }

    handleSwitchAccount = (item) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let currentSubscriberBaId = userInfo.baId;

        if (item.baId === parseInt(currentSubscriberBaId)) {
            this.resetState();
        } else {
            this.setState({isSelected: item, isChange: true})
        }
    }

    resetState = () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        this.setState({
            isChange: false,
            isSelected: {
                baId: userInfo.baId,
            },
        })
    }

    render() {
        let {
            isSwitchAccDropdownOpen = false,
            history,
            userProfileImage,
        } = this.props;
        let {selectedSubscriber, isChange, isSelected, accountData} = this.state;
        return (
            <div>
                <ul className={`switch-account-setting ${isSwitchAccDropdownOpen ? '' : 'hide'} ${userProfileImage ? 'profile-img' : 'avatar-img'}`}>
                    <Heading heading="Switch Account" headingClassName="switch-account"/>
                    <Heading heading="You have multiple Binge Subscriptions under: "
                             subHeading={isMobile.any() ? `Sub ID: ${this.state.sId}` : `Current Sub ID: ${this.state.sId}`}
                             headingClassName="switch-account-subTitles"/>
                    <Heading subHeading="Select the one you want to use"
                             headingClassName="switch-account-subTitles2"/>
                    <div className="switch-account-container">
                        {
                            accountData && accountData?.accountDetailsDTOList?.map((item, index) => {
                                return (
                                    <li key={index}
                                        onClick={() => {
                                            this.handleSwitchAccount(item)
                                        }} className="available-account">
                                        <div className="selected-account acc">
                                            <div className="binge-asset">
                                                {
                                                    item?.subscriptionType &&
                                                    <div className="set-device-img">
                                                        <img src={getIconInfo(item)} alt={'img'}/>
                                                    </div>
                                                }
                                                <div className="available-account-detail acc-detail">
                                                    <p>
                                                        <span className="white-text">{item.aliasName}</span> <br/>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="unactive-tick">
                                                <p><RadioButton
                                                    checked={item.baId === parseInt(this.state.isSelected?.baId)}/>
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </div>
                    {isChange &&
                        <Button bValue={`${isMobile.any() ? 'Change' : 'Save Changes'}`} cName="btn primary-btn"
                                clickHandler={(e) => switchAccount(isSelected, selectedSubscriber, history, this.setUpdatedBaId, true, e, this.resetState)
                                }/>}
                </ul>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        logOutResponse: get(state.bingeLoginDetails, 'logOutResponse'),
        accountList: get(state.loginReducer, 'subscriptionDetails.data'),
        postSwitchAccountResponse: get(state.switchAccountDetails, 'postSwitchAccountResponse'),
        configResponse: get(state.headerDetails, 'configResponse'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            openPopup,
            logOut,
            subscriberListing,
            postSwitchAccountReq,
            resetSwitchAccountData,
            getProfileDetails,
            getCurrentSubscriptionInfo,
        }, dispatch),
    }
}

SwitchAccountSetting.propTypes = {
    toggleHeaderDropdown: PropTypes.func,
    logOut: PropTypes.func,
    openPopup: PropTypes.func,
    isSwitchAccDropdownOpen: PropTypes.bool,
    logOutResponse: PropTypes.object,
    history: PropTypes.object,
    subscriberListing: PropTypes.func,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SwitchAccountSetting))
