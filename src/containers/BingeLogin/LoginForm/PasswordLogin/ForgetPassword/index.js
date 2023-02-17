import React, {Component} from 'react';
import get from "lodash/get";

import InputBox from "@common/InputBox";
import Button from "@common/Buttons";
import {LENGTH_CHECK} from "@constants/index";

import {COMMON_TEXT, FORM_NAME} from '../../../APIs/constants';


import '../../style.scss';
import PropTypes from "prop-types";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import {isMobile} from "@utils/common";
import {maskingFunction} from "@containers/BingeLogin/bingeLoginCommon";

class ForgetPassword extends Component {

    componentDidMount() {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PASSWORD_INVOKED);
        moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PASSWORD_INVOKED);
    }

    onEnterClick = (event) => {
        const {charCode} = event;
        if (charCode === 13) {
            this.props.validateChange(event.target.name, event.target.value, this.onEnterCallBack);
        }
    };

    onEnterCallBack = () => {
        let {errors, handleButtonClick} = this.props;
        let btnText = this.props.showForgetPasswordOtpBlock ? COMMON_TEXT.AUTHENTICATE : COMMON_TEXT.SEND_OTP;
        !Object.keys(errors).length && handleButtonClick(btnText, FORM_NAME.FORGET_PASSWORD)
    };

    getHeight = (forOtpBlock) => {
        let appHWidth = document.getElementById('app').clientWidth,
            appHeight = screen.height,
            height;
        if (isMobile.any()) {
            if (((appHWidth <= 320 || appHWidth <= 760)
                || (appHWidth <= 812 || appHWidth <= 375))) {
                height = forOtpBlock ?  appHeight - (392) : appHeight - (467);
                return height > 150 ? height : 150;
            }
        }

    };

    render() {
        let {
            handleChange, validateChange, errors, forgetPasswordOtp, newPassword, confirmNewPassword,
            handleButtonClick, checkFormValidity, backButtonClickHandler, showForgetPasswordOtpBlock, disableResendOtp,
            resendOtp, timeLeft, rmn,
        } = this.props;
        let isLoginDisabled = checkFormValidity(FORM_NAME.FORGET_PASSWORD);
        return (
            <div className="login-details-container">
                <h3 className={'forget-block-heading'}>
                    <i className={'icon-back-2'} onClick={() => {
                        backButtonClickHandler(true)
                    }}/>
                    {showForgetPasswordOtpBlock ? 'Enter Verification Code' : 'Create New Password'}
                </h3>
                {showForgetPasswordOtpBlock && <h5>Please enter 4-digit OTP sent to your Registered Mobile Number and create a new password.</h5>}
                <div className={'forget-password-container'}>
                    {
                        showForgetPasswordOtpBlock ?
                            <div>
                                <InputBox inputType={'tel'}
                                          classname={'forget-otp-input'}
                                          name={'forgetPasswordOtp'}
                                          isNumericWithZero
                                          onChange={handleChange}
                                          onBlur={validateChange}
                                          errorMessage={get(errors, 'forgetPasswordOtp')}
                                          value={forgetPasswordOtp}
                                          maxLength={LENGTH_CHECK.OTP_4}
                                          labelName={"Enter the 4-digit OTP"}
                                          placeholder={'Enter OTP'}
                                />
                                {
                                    <div className={disableResendOtp ? "disabled resend-otp-container" : "resend-otp-container"}>
                                        <div>
                                            <span className={disableResendOtp ? "disabled blue-text" : "blue-text"}
                                                onClick={() => resendOtp(COMMON_TEXT.RESEND_OTP, FORM_NAME.FORGET_PASSWORD)}> Resend OTP </span>
                                            {disableResendOtp &&
                                            <React.Fragment>
                                            <span className="timer" id={'timer'}>
                                            <span id='time'>{timeLeft}</span>
                                                {timeLeft !== 0 ? `Resend OTP in ${timeLeft} seconds` : ""}
                                            </span>
                                            </React.Fragment>
                                            }
                                        </div>
                                    </div>
                                }
                            </div> :
                            <React.Fragment>
                                <InputBox inputType={'password'}
                                          parentClass={'password'}
                                          name={'newPassword'}
                                          onChange={handleChange}
                                          onBlur={validateChange}
                                          errorMessage={get(errors, 'newPassword')}
                                          value={newPassword}
                                          minLength={LENGTH_CHECK.PASSWORD}
                                          labelName={"New Password"}
                                          placeholder={'New Password*'}
                                          removeSpaces = {true}
                                />
                                <InputBox inputType={'password'}
                                          parentClass={'password'}
                                          name={'confirmNewPassword'}
                                          onChange={handleChange}
                                          onBlur={validateChange}
                                          errorMessage={get(errors, 'confirmNewPassword')}
                                          value={confirmNewPassword}
                                          minLength={LENGTH_CHECK.PASSWORD}
                                          labelName={"Confirm Password"}
                                          placeholder={'Confirm Password*'}
                                          removeSpaces = {true}
                                          onKeyPress={(e) => {
                                              this.onEnterClick(e)
                                          }}
                                />
                            </React.Fragment>
                    }
                    <div className={'button-block without-blue-text'} style={{minHeight: this.getHeight(showForgetPasswordOtpBlock)}}>
                        <div className={'button-container'}>
                            <Button cName={`btn primary-btn next ${showForgetPasswordOtpBlock && 'authenticate'}`} bType="button"
                                    bValue={showForgetPasswordOtpBlock ? COMMON_TEXT.AUTHENTICATE : COMMON_TEXT.SEND_OTP}
                                    disabled={isLoginDisabled}
                                    clickHandler={() => showForgetPasswordOtpBlock
                                        ? handleButtonClick(COMMON_TEXT.AUTHENTICATE, FORM_NAME.FORGET_PASSWORD)
                                        : handleButtonClick(COMMON_TEXT.SEND_OTP, FORM_NAME.FORGET_PASSWORD)}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ForgetPassword.propTypes = {
    handleChange: PropTypes.func,
    validateChange: PropTypes.func,
    errors: PropTypes.object,
    forgetPasswordOtp: PropTypes.string,
    newPassword: PropTypes.string,
    confirmNewPassword: PropTypes.string,
    handleButtonClick: PropTypes.func,
    checkFormValidity: PropTypes.func,
    backButtonClickHandler: PropTypes.func,
    showForgetPasswordOtpBlock: PropTypes.bool,
    rmn: PropTypes.string,
    disableResendOtp: PropTypes.bool,
    resendOtp: PropTypes.func,
    timeLeft: PropTypes.number,
};

export default ForgetPassword;