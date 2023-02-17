import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import logoImage from "@assets/images/login-page-logo.png";
import webSmallLogoImage from "@assets/images/web-amall-login-logo.png";
import {getMaxHeightForMobile, isMobile, safeNavigation, switchAccount} from "@utils/common";
import {URL} from "@routeConstants";
import {LOCALSTORAGE, SUBSCRIPTION_TYPE} from "@constants";
import bingeMobileAsset from "@assets/images/binge-mobile-asset.png";
import bingeAsset from "@assets/images/binge-asset.png";
import RadioButton from "@common/RadioButton";
import PropTypes from "prop-types";
import {postSwitchAccountReq} from "@containers/SwitchAccount/API/action";
import get from "lodash/get";
import {getKey} from "@utils/storage";
import {isEmpty} from "lodash";
import {COMMON_TEXT} from "../BingeLogin/APIs/constants";
import {getAccountDetailsFromSid} from "../BingeLogin/APIs/action";
import Button from "@common/Buttons";
import {openPopup} from "@common/Modal/action";
import './style.scss';
import {getDeviceStatus} from "@utils/cancellationFlowCommon";

class SwitchAccountMobile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentBingeAccount: '',
            accountListing: [],
            selectedItemDetail: {},
            selectedBingeAccount: '',
        };
    }

    componentDidMount = async () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let selectedSubscriberBaId = userInfo.baId;

        setTimeout(() => this.setState({
            currentBingeAccount: selectedSubscriberBaId,
        }, async () => {
            await this.props.getAccountDetailsFromSid();
            this.getAccountDetails();
            this.selectDefaultSelectedAccount();
        }), 0);
    }

    selectDefaultSelectedAccount = () => {
        let {accountList} = this.props;
        const handleCancelledUser = getDeviceStatus();
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        if (handleCancelledUser) {
            this.setState({
                selectedBingeAccount: accountList?.accountDetailList[0].baId,
                selectedItemDetail: accountList?.accountDetailList[0],
            })
        } else {
            this.setState({
                selectedBingeAccount: userInfo.baId,
            })
        }
    }


    getAccountDetails = () => {
        let {accountList} = this.props;
        let {currentBingeAccount} = this.state;

        if (accountList && accountList.accountDetailList.length > 0) {
            let index = accountList.accountDetailList.findIndex(i => i.baId === currentBingeAccount);
            let element = accountList.accountDetailList[index];
            if(index > 0){
                accountList.accountDetailList.splice(index, 1);
                accountList.accountDetailList.splice(0, 0, element);
                this.setState({
                    accountListing: accountList,
                });
            }
            else{
                this.setState({
                    accountListing: accountList,
                });
            }
        }
    }

    radioButtonClickHandler = (itemDetails, onDivClick = false) => {
        this.setState({
            selectedItemDetail: itemDetails,
            selectedBingeAccount: itemDetails.baId,
        }, () => {
            if (onDivClick) {
                let id = itemDetails.baId ? itemDetails.baId : itemDetails.deviceSerialNumber;
                (document.getElementsByClassName(`${id}`)[0].checked) = true;
            }
        });
    };

    setUpdatedBaId = (baId) => {
        this.setState({
            currentBingeAccount: baId,
        });
    }

    render() {
        let {history, openPopup} = this.props;
        let {accountListing, selectedItemDetail, selectedBingeAccount, currentBingeAccount} = this.state;
        return (
           isMobile.any() ?
               <div className="binge-login-container">
                <div className="left-section">
                    <img src={logoImage} alt={'Logo-Image'}/>
                </div>
                <div className="right-section">
                    <div className="login-block">
                        <div className={'back-block'}>
                            <i className={'icon-back-2'} id="back-btn"
                               onClick={() => safeNavigation(history, `/${URL.MY_ACCOUNT}`)}/>
                        </div>
                        <div className={'web-small-logo'}>
                            <img src={webSmallLogoImage} alt={'Logo-Image'}/>
                        </div>
                        <div className="binge-subscriber-screen">
                            <div className="title">Your Tata Play Binge subscriptions</div>
                            <div className="description">Please select one and proceed.</div>
                            <div className="binge-account-listing-container">
                                <div className="binge-account-listing for-mobile"
                                     style={{maxHeight: getMaxHeightForMobile()}}>
                                    {
                                        accountListing && accountListing?.accountDetailList?.length > 0
                                        && accountListing.accountDetailList.map((item, index) => {
                                            return (
                                                <div className="binge-user" key={index}
                                                     onClick={() => this.radioButtonClickHandler(item, true)}>
                                                    <div className="sub-block">
                                                        <img className="binge-asset"
                                                             src={item.subscriptionType.toUpperCase() === SUBSCRIPTION_TYPE.ANYWHERE ? bingeMobileAsset : bingeAsset}
                                                             alt={'img'}/>
                                                        <span>{item.aliasName}</span>
                                                    </div>
                                                    <div className="radio-block">
                                                        <RadioButton id={item.subscriberId} name={item.subscriberId}
                                                                     value={item.subscriberId}
                                                                     checked={selectedBingeAccount === (item.baId ? item.baId : item.deviceSerialNumber)}
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
                                            disabled={isEmpty(selectedItemDetail) || selectedItemDetail.baId === currentBingeAccount}
                                            bValue={COMMON_TEXT.PROCEED}
                                            clickHandler={() => switchAccount(selectedItemDetail, currentBingeAccount, history, this.setUpdatedBaId, false)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> :
               <div>
                   <div className="binge-subscriber-screen for-web">
                       <div className="title">Your Tata Play Binge subscriptions</div>
                       <div className="description">Please select one and proceed.</div>
                       <div className="binge-account-listing-container">
                           <div className="binge-account-listing"
                                style={{maxHeight: getMaxHeightForMobile()}}>
                               {
                                   accountListing && accountListing?.accountDetailList?.length > 0
                                   && accountListing.accountDetailList.map((item, index) => {
                                       return (
                                           <div className="binge-user" key={index}
                                                onClick={() => this.radioButtonClickHandler(item, true)}>
                                               <div className="sub-block">
                                                   <img className="binge-asset"
                                                        src={item.subscriptionType.toUpperCase() === SUBSCRIPTION_TYPE.ANYWHERE ? bingeMobileAsset : bingeAsset}
                                                        alt={'img'}/>
                                                   <span>{item.aliasName}</span>
                                               </div>
                                               <div className="radio-block">
                                                   <RadioButton id={item.subscriberId} name={item.subscriberId}
                                                                value={item.subscriberId}
                                                                checked={selectedBingeAccount === (item.baId ? item.baId : item.deviceSerialNumber)}
                                                                className={item.baId ? item.baId : item.deviceSerialNumber}
                                                                chandler={() => this.radioButtonClickHandler(item)}
                                                                showLabel={false}/>
                                               </div>
                                           </div>
                                       )
                                   })
                               }
                           </div>
                           <div className={'without-blue-text'}>
                               <Button cName="btn primary-btn" bType="button"
                                       disabled={isEmpty(selectedItemDetail) || selectedItemDetail.baId === currentBingeAccount}
                                       bValue={COMMON_TEXT.PROCEED}
                                       clickHandler={() => switchAccount(selectedItemDetail, currentBingeAccount, history, this.setUpdatedBaId,false)}/>
                           </div>
                       </div>
                   </div>
               </div>
        );
    }
};

const mapStateToProps = (state) => {
    return {
        accountList: get(state.bingeLoginDetails, 'accountDetailsFromSid.data'),
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        getAccountDetailsFromSid,
        postSwitchAccountReq,
        openPopup,
    }, dispatch)
);

SwitchAccountMobile.propTypes = {
    history: PropTypes.object,
    getAccountDetailsFromSid: PropTypes.func,
    accountList: PropTypes.object,
    postSwitchAccountReq: PropTypes.func,
    openPopup: PropTypes.func,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SwitchAccountMobile));

