import React, {Component} from "react";
import {bindActionCreators,compose} from "redux";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import arrowSeeAll from "@assets/images/arrow-see-all.png";
import {getAccountDetailsFromRmn, resetAccountDetailsFromRMN} from "@containers/BingeLogin/APIs/action";
import {
    ACCOUNT_STATUS,
    BINGE_ACCOUNT_STATUS,
    COMMON_TEXT,
    WEB_SMALL_LOGIN_STEP,
} from "@containers/BingeLogin/APIs/constants";
import {getMaxHeightForMobile, isMobile} from "@utils/common";
import {openPopup} from "@common/Modal/action";
import RadioButton from '@common/RadioButton';
import Button from "@common/Buttons";
import ProgressBar from "@common/ProgressBar";
import {selectSubscriberScreen} from "@containers/BingeLogin/bingeLoginCommon";

import './style.scss';

class SIDSelection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isRmn: false,
            selectedItemDetail: {},
        }
    }

    componentDidMount = async () => {
        let {loginWithRMN} = this.props;
        if (loginWithRMN) {
            setTimeout(() => this.setState({isRmn: true}), 10);
        }
    };

    componentWillUnmount() {
        this.props.resetAccountDetailsFromRMN();
    }

    /*
    * Returns the string to be shown on UI depicting user's account status
    * */
    bingeStatus = (item) => {
        if (!isEmpty(item.accountDetailList)) {
            //Case when only one binge account is there
            if(item.accountDetailList.length) {
               /* if(item.accountDetailList[0].accountStatus === ACCOUNT_STATUS.ACTIVE) {
                    return BINGE_ACCOUNT_STATUS.ACTIVE;
                }

                else if(item.accountDetailList[0].accountStatus === ACCOUNT_STATUS.DEACTIVATED ||
                    item.accountDetailList[0].accountStatus === ACCOUNT_STATUS.DEACTIVE) {
                    return BINGE_ACCOUNT_STATUS.INACTIVE;
                }
*/
                if(item?.statusType?.toUpperCase() === ACCOUNT_STATUS.ACTIVE){
                    return BINGE_ACCOUNT_STATUS.ACTIVE;
                }
                else if(item?.statusType?.toUpperCase() === ACCOUNT_STATUS.INACTIVE){
                    return BINGE_ACCOUNT_STATUS.INACTIVE;
                }
                else {
                    return '';
                }
            }else{
                return '';
            }
        }
    }

    /*
    * Returns the class to be applied based on user's account status
    * */
    bingeStatusClass = (item) => {
        let status = this.bingeStatus(item);
        if (status === BINGE_ACCOUNT_STATUS.ACTIVE) {
            return 'active';
        } else if (status === BINGE_ACCOUNT_STATUS.INACTIVE) {
            return 'inactive';
        }
    };

    radioButtonClickHandler = (itemDetails, onDivClick = false) => {
        this.setState({
            selectedItemDetail: itemDetails,
        }, () => {
            if (onDivClick) {
                (document.getElementsByClassName(`${itemDetails.subscriberId}`)[0].checked) = true;
            }
        });
    };

    onProceedClickHandler = () => {
        let {selectedItemDetail} = this.state;
        let {updateStepNumber, updateSubscriberDetails, openPopup, rmn, subId, authType, history} = this.props;
        let params = {rmn, subId, authType};
        selectSubscriberScreen(selectedItemDetail, updateStepNumber, updateSubscriberDetails, openPopup, history, params);
    };

    render = () => {
        let {accountDetailsFromRmn, updateStepNumber, history, updateSubscriberDetails, openPopup, loginWithRMN,
            authType} = this.props;
        let params = {loginWithRMN, authType};
        let {selectedItemDetail} = this.state;
        return (
            <div className='subscriber-screen'>
                <div className={'for-mobile'}><ProgressBar stepNumberArray={WEB_SMALL_LOGIN_STEP} activeStep={2}/></div>
                <div className='title'>Your Tata Play Subscriptions</div>
                <div className='description'>
                You have multiple Subscription IDs. Please select the one you want to use.
                </div>
                <div className={'subscriber-listing-container'}>
                <div className="subscriber-listing for-web">
                    {
                        this.state.isRmn && accountDetailsFromRmn && accountDetailsFromRmn.length > 0 && accountDetailsFromRmn.map((item, index) => {
                            return (
                                <div className={`subscriber ${this.bingeStatusClass(item)}`} key={index}
                                     onClick={() => selectSubscriberScreen(item, updateStepNumber, updateSubscriberDetails, openPopup, history, params)}>
                                    <div className='sub-block'>
                                        <span>{item.subscriberId}</span>
                                        <p className="binge-status"> {this.bingeStatus(item)}</p>
                                    </div>
                                    <div className='arrow-block'>
                                        <img src={arrowSeeAll} alt={'img'}/>
                                         </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="subscriber-listing for-mobile" style={{maxHeight : getMaxHeightForMobile()}}>
                    {
                        this.state.isRmn && accountDetailsFromRmn && accountDetailsFromRmn.length > 0 && accountDetailsFromRmn.map((item, index) => {
                            return (
                                <div className={`subscriber ${this.bingeStatusClass(item)}`} key={index}
                                onClick={() => this.radioButtonClickHandler(item, true)}>
                                    <div className='sub-block'>
                                        <span>{item.subscriberId}</span>
                                        <p className="binge-status"> {this.bingeStatus(item)}</p>
                                    </div>
                                    <div className='radio-block'>
                                        <RadioButton id={item.subscriberId} name={item.rmn} value={item.subscriberId}
                                                     className={item.subscriberId}
                                                     chandler={() => this.radioButtonClickHandler(item)} showLabel={false}/>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                </div>
                <div className={'button-block without-blue-text for-mobile'}>
                    <Button cName="btn primary-btn" bType="button"
                            disabled={isEmpty(selectedItemDetail)}
                            bValue={COMMON_TEXT.PROCEED}
                            clickHandler={() => this.onProceedClickHandler()}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        accountDetailsFromRmn: get(state.bingeLoginDetails, 'accountDetailsFromRmn.data'),
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        getAccountDetailsFromRmn,
        openPopup,
        resetAccountDetailsFromRMN,
    }, dispatch)
);

SIDSelection.propTypes = {
    rmn: PropTypes.string,
    getAccountDetailsFromRmn: PropTypes.func,
    accountDetailsFromRmn: PropTypes.array,
    updateStepNumber: PropTypes.func,
    updateSubscriberDetails: PropTypes.func,
    openPopup: PropTypes.func,
    authType: PropTypes.string,
    loginWithRMN: PropTypes.bool,
    history: PropTypes.object,
    subId: PropTypes.string,
    resetAccountDetailsFromRMN: PropTypes.func,
}

export default compose(withRouter,connect(mapStateToProps, mapDispatchToProps))(SIDSelection);

