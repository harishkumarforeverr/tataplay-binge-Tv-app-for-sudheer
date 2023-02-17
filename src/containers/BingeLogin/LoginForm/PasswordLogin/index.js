import React, {Component} from 'react';
import get from "lodash/get";
import PropTypes from "prop-types";

import InputBox from "@common/InputBox";
import Button from "@common/Buttons";

import {COMMON_TEXT, FORM_NAME} from '../../APIs/constants'

import '../style.scss';
import {LENGTH_CHECK} from "@constants/index";
import {isMobile} from "@utils/common";

class PasswordLogin extends Component {

    onEnterClick = (event) => {
        const {charCode} = event;
        if (charCode === 13) {
            this.props.validateChange(event.target.name, event.target.value, this.onEnterCallBack);
        }
    };

    onEnterCallBack = (name) => {
        let {errors, handleButtonClick, subId, password} = this.props;
        if (name === 'subId') {
            subId.length && !Object.keys(errors).length && handleButtonClick(COMMON_TEXT.PROCEED);
        }
        else if (name === 'password') {
            password.length && !Object.keys(errors).length && handleButtonClick(COMMON_TEXT.LOGIN, FORM_NAME.PASSWORD);
        } else {
            !Object.keys(errors).length && handleButtonClick(COMMON_TEXT.LOGIN, FORM_NAME.PASSWORD);
        }
    };

    getHeight = (forPasswordBlock = false) => {
        let appWidth = document.getElementById('app').clientWidth;
        let appHeight = screen.height,
            height;
        if (isMobile.any() && (appWidth <= 320 || appWidth <= 812)) {
            forPasswordBlock ? height = appHeight - (349) : height = appHeight - 462;
            /*forPasswordBlock in bracket are estimates from zeplin for height of above content*/
            return height > 150 ? 264 : 250
        }
    };

    render() {
        let {errors, subId, password, handleChange,
            validateChange, handleButtonClick,
            showOtpPasswordBlock, handleForgetPasswordClick,
            configResponse, trackNonTSUserAnalyticsEvent} = this.props;
        let isProceedDisabled = (subId.length < 10 || Object.keys(errors).length);
        let isLoginDisabled = !(password.length >= LENGTH_CHECK.PASSWORD) || Object.keys(errors).length;
        return (
            <div className="login-details-container password-login">
                {!showOtpPasswordBlock ? <div>
                        <InputBox inputType={'text'}
                                  name={'subId'}
                                  isNumeric
                                  onChange={handleChange}
                                  onBlur={validateChange}
                                  errorMessage={get(errors, 'subId')}
                                  value={subId}
                                  maxLength={LENGTH_CHECK.SID}
                                  labelName={"Enter Your Tata Play Subscriber ID"}
                                  onKeyPress={(e) => this.onEnterClick(e, COMMON_TEXT.PROCEED)}
                        />
                        <div className={'terms-condition'}>
                            <p> {get(configResponse, 'data.config.licenseAgreement.title')} <span className={'blue-text font-14'}>
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
                                        clickHandler={() => handleButtonClick(COMMON_TEXT.PROCEED)}/>
                                <div className='blue-text'>
                                    <a target="_blank" rel="noopener noreferrer"
                                       onClick={trackNonTSUserAnalyticsEvent}
                                       href={'https://www.tatasky.com/tata-sky-new-dth-connection-online?utm_source=ts-binge-app&utm_medium=referral&utm_campaign=get-connection&utm_term=&utm_content='}>{COMMON_TEXT.NOT_USER}</a>
                                </div>
                            </div>
                        </div>
                    </div> :
                    <div className={'password-verification-block'}>
                        <InputBox inputType={'password'}
                                  parentClass={'text-password'}
                                  name={'password'}
                                  onChange={handleChange}
                                  onBlur={validateChange}
                                  errorMessage={get(errors, 'password')}
                                  value={password}
                                  minLength={LENGTH_CHECK.PASSWORD}
                                  labelName={"Enter your Tata Play Password"}
                                  placeholder={'Password'}
                                  autoFocus={true}
                                  onKeyPress={(e) => this.onEnterClick(e, COMMON_TEXT.LOGIN)}
                                  removeSpaces = {true}
                        />
                        <p className={'blue-text'} onClick={handleForgetPasswordClick}>Forgot Password?</p>
                        <div className={'button-block without-blue-text'} style={{minHeight: this.getHeight(true)}}>
                            <div className={'button-container'}>
                                <Button cName="btn primary-btn" bType="button"
                                        bValue={COMMON_TEXT.LOGIN}
                                        disabled={isLoginDisabled}
                                        clickHandler={() => handleButtonClick(COMMON_TEXT.LOGIN, FORM_NAME.PASSWORD)}/>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

PasswordLogin.propTypes = {
    subId: PropTypes.string,
    password: PropTypes.string,
    errors: PropTypes.object,
    handleChange: PropTypes.func,
    validateChange: PropTypes.func,
    handleButtonClick: PropTypes.func,
    handleForgetPasswordClick: PropTypes.func,
    showOtpPasswordBlock: PropTypes.bool,
    configResponse: PropTypes.object,
    trackNonTSUserAnalyticsEvent: PropTypes.func,
};

export default PasswordLogin;
