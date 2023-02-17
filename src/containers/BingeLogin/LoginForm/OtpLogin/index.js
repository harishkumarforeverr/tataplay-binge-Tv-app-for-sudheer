import React, {Component} from 'react';
import get from "lodash/get";
import PropTypes from "prop-types";

import InputBox from "@common/InputBox";
import Button from "@common/Buttons";
import { LENGTH_CHECK } from "@constants";

import {COMMON_TEXT, FORM_NAME} from '../../APIs/constants';

import '../style.scss';
import {isMobile} from "@utils/common";


class OtpLogin extends Component {

    onEnterClick = (event) => {
        const {charCode} = event;
        if (charCode === 13) {
            this.props.validateChange(event.target.name, event.target.value, this.onEnterCallBack);
        }
    };

    onEnterCallBack = (name) => {
        let {errors, handleButtonClick, subId, rmn, otp} = this.props;
        if(name === 'subId'){
            subId.length && !Object.keys(errors).length && handleButtonClick(COMMON_TEXT.PROCEED, FORM_NAME.OTP);
        }
        else if( name === 'rmn'){
            rmn.length && !Object.keys(errors).length && handleButtonClick(COMMON_TEXT.PROCEED, FORM_NAME.OTP);
        }
        else if( name === 'otp'){
            otp.length && !Object.keys(errors).length && handleButtonClick(COMMON_TEXT.LOGIN, FORM_NAME.OTP);
        }
        else{
            !Object.keys(errors).length && handleButtonClick(COMMON_TEXT.LOGIN, FORM_NAME.OTP)
        }
    };

    onFocus = () => {
        let elmnt = document.getElementById("subId");
        elmnt.scrollIntoView();
    };

    getHeight = (forOtpBlock = false) => {
        let appWidth = document.getElementById('app').clientWidth;
        let appHeight = screen.height,
            height;
        if (isMobile.any() && (appWidth <= 320 || appWidth <= 812)) {
            forOtpBlock ? height = appHeight - (543) : height = appHeight - (592);
            /*values in bracket are estimates from zeplin for height of above content*/
            return height > 150 ? height : 250
        }
    };

    render() {
        let {
            rmn, errors, subId, otp, handleChange, validateChange, handleButtonClick, showOtpPasswordBlock,
            checkFormValidity, timeLeft, disableResendOtp, resendOtp,
            configResponse, showResendOtpBlock, maskedRmn, trackNonTSUserAnalyticsEvent,
        } = this.props;
        let isProceedDisabled = checkFormValidity(FORM_NAME.OTP);
        let isLoginDisabled = (otp.length < LENGTH_CHECK.OTP || Object.keys(errors).length);
        return (
            <div className="login-details-container otp-login">
                {!showOtpPasswordBlock ? <div>
                    <InputBox inputType={'tel'} initialVal={"+91"}
                              name={'rmn'}
                              value={rmn}
                              isNumericWithZero
                              maxLength={LENGTH_CHECK.RMN}
                              onChange={handleChange}
                              onBlur={validateChange}
                              /*placeholder={'1234 56789'}*/
                              errorMessage={get(errors, 'rmn')}
                              onKeyPress={(e) => this.onEnterClick(e, COMMON_TEXT.PROCEED)}
                              labelName={"Enter Your Registered Mobile Number"}
                    />
                    <div className='or-separator'><p>OR</p></div>
                    <InputBox inputType={'tel'}
                              parentClass={'sub-id'}
                              name={'subId'}
                              id={'subId'}
                              value={subId}
                              isNumericWithZero
                              maxLength={LENGTH_CHECK.SID}
                              onChange={handleChange}
                              onBlur={validateChange}
                              errorMessage={get(errors, 'subId')}
                              onKeyPress={(e) => this.onEnterClick(e, COMMON_TEXT.PROCEED)}
                              labelName={"Enter Your Tata Play Subscriber ID"}
                              onFocusHandler={this.onFocus}
                    />
                    <div className={'terms-condition'}>
                        <p> {get(configResponse, 'data.config.licenseAgreement.title')}<span className={'blue-text font-14'}>
                            <a target="_blank" rel="noopener noreferrer"
                               href={get(configResponse, 'data.config.url.eulaUrlHybrid')}>
                                {COMMON_TEXT.LICENCE_AGREEMENT}
                            </a>
                        </span>
                        </p>
                    </div>
                    <div className={'button-block'} style={{minHeight: this.getHeight()}}>
                        <div className={'button-container'}>
                            <Button cName="btn primary-btn" bType="button"
                                    bValue={COMMON_TEXT.PROCEED}
                                    disabled={isProceedDisabled}
                                    clickHandler={() => handleButtonClick(COMMON_TEXT.PROCEED, FORM_NAME.OTP)}/>
                            <div className='blue-text'>
                                <a target="_blank" rel="noopener noreferrer" onClick={trackNonTSUserAnalyticsEvent}
                                   href={'https://www.tatasky.com/tata-sky-new-dth-connection-online?utm_source=ts-binge-app&utm_medium=referral&utm_campaign=get-connection&utm_term=&utm_content='}>{COMMON_TEXT.NOT_USER}</a>
                            </div>
                        </div>
                    </div>
               </div> : <div className={'otp-verification-block'}>
                   <InputBox inputType={'tel'}
                             parentClass={'otp'}
                             name={'otp'}
                             isNumericWithZero
                             onChange={handleChange}
                             onBlur={validateChange}
                             errorMessage={get(errors, 'otp')}
                             value={otp}
                             maxLength={LENGTH_CHECK.OTP}
                             labelName={"Enter the 6-digit OTP"}
                             placeholder={'Enter OTP'}
                             autoFocus={true}
                             onKeyPress={(e) => this.onEnterClick(e, COMMON_TEXT.LOGIN)}
                   />
                   <p>The OTP is sent to +91 {maskedRmn}</p>
                   {
                   <div className={disableResendOtp ? "disabled resend-otp-container" : "resend-otp-container"}>
                       {showResendOtpBlock && <div>
                           <span className={disableResendOtp ? "disabled blue-text" : "blue-text"}
                                 onClick={resendOtp}>Resend OTP</span>
                       </div>}
                       {disableResendOtp && <React.Fragment>
                           <span className="timer" id={'timer'}><span id='time'>{timeLeft}</span>
                           {timeLeft > 0 ? `Resend OTP in ${timeLeft} seconds` : ""}</span>
                       </React.Fragment>}
                   </div>
                   }
                    <div className={'button-block without-blue-text'} style={{minHeight: this.getHeight(true)}}>
                        <div className={'button-container'}>
                            <Button cName="btn primary-btn" bType="button"
                                    bValue={COMMON_TEXT.LOGIN}
                                    disabled={isLoginDisabled}
                                    clickHandler={() => handleButtonClick(COMMON_TEXT.LOGIN, FORM_NAME.OTP)}/>
                        </div>
                    </div>
                    </div>
               }
            </div>
        )
    }
}

OtpLogin.propTypes = {
    rmn: PropTypes.string,
    otp: PropTypes.string,
    subId: PropTypes.string,
    secondsLeft: PropTypes.number,
    errors: PropTypes.object,
    handleChange: PropTypes.func,
    validateChange: PropTypes.func,
    handleButtonClick: PropTypes.func,
    checkFormValidity: PropTypes.func,
    showOtpPasswordBlock: PropTypes.bool,
    disableResendOtp: PropTypes.bool,
    resendOtp: PropTypes.func,
    timeLeft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    configResponse: PropTypes.object,
    showResendOtpBlock: PropTypes.bool,
    maskedRmn: PropTypes.string,
    trackNonTSUserAnalyticsEvent: PropTypes.func,
};

export default OtpLogin;