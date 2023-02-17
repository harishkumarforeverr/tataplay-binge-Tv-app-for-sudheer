import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import {bindActionCreators} from "redux";

import arrowSeeAll from "@assets/images/arrow-see-all.png";
import bingeAsset from "@assets/images/binge-asset.png";

import {checkBingeDTHStatus, getIconInfo, getMaxHeightForMobile, isMobile} from "@utils/common";
import {openPopup} from "@common/Modal/action";
import RadioButton from "@common/RadioButton";
import Button from "@common/Buttons";
import {COMMON_TEXT} from "@containers/BingeLogin/APIs/constants";
import {withRouter} from 'react-router';

import './style.scss';
import {dunningRecharge} from "@containers/PackSelection/APIs/action";
import {inactivePopupOpened} from "@containers/BingeLogin/APIs/action";
import {hideMainLoader, showMainLoader} from "@src/action";
import {createUser, loginUser} from "@containers/BingeLogin/bingeLoginCommon";
import {SUBSCRIPTION_TYPE} from "@constants";
import bingeMobileAsset from "@assets/images/binge-mobile-asset.png";

class BingeAccountSelection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bingeAccountDetails: {},
            selectedItemDetail: {},
        }
    }

    componentDidMount() {
        let {accountDetailsFromSid, sidDetails, loginWithRMN} = this.props;
        if (loginWithRMN) {
            sidDetails && setTimeout(() => this.setState({bingeAccountDetails: sidDetails.accountDetailList}), 10);
        } else {
            accountDetailsFromSid && setTimeout(() => this.setState({bingeAccountDetails: accountDetailsFromSid.accountDetailList}), 500);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(Object.keys(prevProps.sidDetails).length !== Object.keys(this.props.sidDetails).length) {
            let {accountDetailsFromSid, sidDetails, loginWithRMN} = this.props;
            if (loginWithRMN) {
                sidDetails && setTimeout(() => this.setState({bingeAccountDetails: sidDetails.accountDetailList}), 10);
            } else {
                accountDetailsFromSid && setTimeout(() => this.setState({bingeAccountDetails: accountDetailsFromSid.accountDetailList}), 500);
            }
        }
    }

    radioButtonClickHandler = (itemDetails, onDivClick = false) => {
        this.setState({
            selectedItemDetail: itemDetails,
        }, () => {
            if (onDivClick) {
                let id = itemDetails.baId ? itemDetails.baId : itemDetails.deviceSerialNumber;
                (document.getElementsByClassName(`${id}`)[0].checked) = true;
            }
        });
    };

    onProceedClickHandler = (item) => {
        let {selectedItemDetail} = this.state;
        let {
            openPopup,
            loginWithRMN,
            authType,
            history,
            sidDetails,
        } = this.props;
        let params = {loginWithRMN, authType};

        let selectedItem = item ? item : selectedItemDetail;

        if (selectedItem.baId === null) {
            createUser(sidDetails, loginWithRMN, authType, history, selectedItem.deviceSerialNumber, openPopup);
        } else {
            loginUser(true, selectedItem, openPopup, history, params);
          /*  let subscriptionInformationDTO = selectedItem?.subscriptionInformationDTO;
            let partnerSubscriptionsDetails = selectedItem?.partnerSubscriptionsDetails;
            let data = {
                accountDetailList: selectedItem,
                history: history,
                params: params,
                expiryDate: partnerSubscriptionsDetails?.expirationDate,
                detailPage: false,
            }
            checkBingeDTHStatus(sidDetails?.accountStatus, subscriptionInformationDTO?.bingeAccountStatus, subscriptionInformationDTO?.migrated,
                subscriptionInformationDTO?.planType, sidDetails?.accountSubStatus, data);*/
        }
    };

    render() {
        let {selectedItemDetail} = this.state;
        return (
            <div className='binge-subscriber-screen'>
                <div className='title'>Your Tata Play Binge subscriptions</div>
                <div className='description'>Please select one and proceed. </div>
                <div className="binge-account-listing-container">
                    <div className="binge-account-listing for-web">
                        {
                            this.state.bingeAccountDetails && this.state.bingeAccountDetails.length > 0 && this.state.bingeAccountDetails.map((item, index) => {
                                return (
                                    <div className="binge-user" key={index}
                                         onClick={() => this.onProceedClickHandler(item)}>
                                        <div className='sub-block'>
                                            {item.subscriptionType && <img className="binge-asset"
                                                 src={getIconInfo(item)}
                                                 alt={'img'}/>}
                                            <span>{item.aliasName}</span>

                                        </div>
                                        <div className='radio-block'>
                                            <img className="arrow" src={arrowSeeAll} alt={'img'}/>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="binge-account-listing for-mobile" style={{maxHeight: getMaxHeightForMobile()}} >
                        {
                            this.state.bingeAccountDetails && this.state.bingeAccountDetails.length > 0 && this.state.bingeAccountDetails.map((item, index) => {
                                return (
                                    <div className="binge-user" key={index}
                                         onClick={() => this.radioButtonClickHandler(item, true)}>
                                        <div className='sub-block'>
                                            <img className="binge-asset"
                                                 src={item.subscriptionType.toUpperCase() === SUBSCRIPTION_TYPE.ANYWHERE ? bingeMobileAsset : bingeAsset}
                                                 alt={'img'}/>
                                            <span>{item.aliasName}</span>
                                        </div>
                                        <div className='radio-block'>
                                            <RadioButton id={item.subscriberId} name={item.subscriberId}
                                                         value={item.subscriberId}
                                                         className={item.baId ? item.baId : item.deviceSerialNumber}
                                                         chandler={() => this.radioButtonClickHandler(item)}
                                                         showLabel={false}/>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className={'button-block without-blue-text for-mobile'}>
                        <Button cName="btn primary-btn" bType="button"
                                disabled={isEmpty(selectedItemDetail)}
                                bValue={COMMON_TEXT.PROCEED}
                                clickHandler={() => this.onProceedClickHandler()}/>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        accountDetailsFromSid: get(state.bingeLoginDetails, 'accountDetailsFromSid.data'),
        existingUserDetails: get(state.bingeLoginDetails, 'existingUser.data'),
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        openPopup,
        showMainLoader,
        hideMainLoader,
        dunningRecharge,
        inactivePopupOpened,
    }, dispatch)
);

BingeAccountSelection.propTypes = {
    accountDetailsFromSid: PropTypes.object,
    sidDetails: PropTypes.object,
    updateStepNumber: PropTypes.func,
    openPopup: PropTypes.func,
    authType: PropTypes.string,
    loginWithRMN: PropTypes.bool,
    history: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    dunningRecharge: PropTypes.func,
    inactivePopupOpened: PropTypes.func,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BingeAccountSelection));

