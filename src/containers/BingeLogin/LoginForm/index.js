import React, {Component} from 'react';
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";

import {LENGTH_CHECK, LOCALSTORAGE, LOGIN_TYPE, MESSAGE, REGEX} from "@constants";
import {removeClass, showRechargePopup} from "@utils/common";
import {MODALS} from "@common/Modal/constants";
import {closePopup, openPopup} from '@common/Modal/action';
import {COMMON_TEXT, ERROR_MESSAGES, FORM_NAME, WEB_SMALL_LOGIN_STEP} from "@containers/BingeLogin/APIs/constants";
import {
    changePasswordWithoutAuth,
    generateOtpWithRMN,
    generateOtpWithSid,
    getAccountDetailsFromRmn,
    getAccountDetailsFromSid,
    getForgetPasswordOtp,
    validateOtp,
    validateOtpForSid,
    validatePassword,
} from "@containers/BingeLogin/APIs/action";
import ProgressBar from '@common/ProgressBar'
import {fetchConfig} from '@components/Header/APIs/actions';

import OtpLogin from './OtpLogin';
import PasswordLogin from './PasswordLogin';
import ForgetPassword from './PasswordLogin/ForgetPassword/index';

import './style.scss';
import '../style.scss';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import {setKey} from "@utils/storage";
import {quickRecharge} from "@containers/PackSelection/APIs/action";
import {hideMainLoader, showMainLoader} from "@src/action";
import {
    mixPanelLoginEvents,
    nonBingeUserNoSubscriptionPopup,
    selectSubscriberScreen,
} from "@containers/BingeLogin/bingeLoginCommon";
import {toast} from "react-toastify";

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0,
            rmn: '',
            subId: '',
            otp: '',
            password: '',
            timeLeft: 0,
            forgetPasswordOtpTimeLeft: 0,
            disableResendOtp: true,
            disableForgotResendOtp: true,
            showResendOtpBlock: true,
            loginWithRMN: false,
            showOtpPasswordBlock: false,
            showForgetPasswordForm: false,
            forgetPasswordOtp: '',
            newPassword: '',
            confirmNewPassword: '',
            showBackButton: false,
            errors: {},
            showForgetPasswordOtpBlock: false,
            maskedRmn: '',
        };
        this.timerId = "";
        this.forgotTimerId = "";
        this.errors = {};
        this.time = 5;
    }

    componentDidMount() {
        this.loadHandler();
        setKey(LOCALSTORAGE.LOGIN_WITH, this.state.selectedIndex === 0 ? LOGIN_TYPE.OTP : LOGIN_TYPE.PASSWORD)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedIndex === 1) {
            //* whenever user switches the tab from password to otp then we need to send otp call with isPassword true *//
            this.handleTabSwitchOtpCall();
        }
    }

    loadHandler = async () => {
        let {configResponse, fetchConfig} = this.props;
        if (!configResponse) {
            await fetchConfig(true);
        }
    };

    resetLoginFormState = () => {
        this.setState({
            selectedIndex: 0,
            rmn: '',
            subId: '',
            otp: '',
            password: '',
            timeLeft: 0,
            forgetPasswordOtpTimeLeft: 0,
            disableResendOtp: true,
            disableForgotResendOtp: true,
            showResendOtpBlock: true,
            showForgotResendOtpBlock: true,
            loginWithRMN: false,
            showOtpPasswordBlock: false,
            showForgetPasswordForm: false,
            forgetPasswordOtp: '',
            newPassword: '',
            confirmNewPassword: '',
            showBackButton: false,
            errors: {},
            showForgetPasswordOtpBlock: false,
            maskedRmn: '',
        });
        this.timerId = "";
        this.forgotTimerId = "";
        this.errors = {};
    };

    handleTabSwitchOtpCall = async () => {
        let {loginWithRMN, selectedIndex, timeLeft, showOtpPasswordBlock, disableResendOtp} = this.state;
        if (!loginWithRMN && selectedIndex === 0 && showOtpPasswordBlock && timeLeft === 0
            && disableResendOtp) {
            //* user has logged in with SID and switched tab from password to OTP and timer time
            // left is zero and Resend Otp text is disabled and showOtpPasswordBlock is true we will send OTP call*//
            this.resendOtp('', '', false);
        }

    }

    switchTab = (selectedIndex) => {
        setKey(LOCALSTORAGE.LOGIN_WITH, selectedIndex === 0 ? LOGIN_TYPE.OTP : LOGIN_TYPE.PASSWORD);
        this.setState({
            selectedIndex,
            otp: '',
            password: '',
        }, () => {
            get(this, 'errors.otp') && delete this.errors.otp;
            get(this, 'errors.password') && delete this.errors.password;
        });

        if(!this.state.showOtpPasswordBlock) {
            this.setState({
                subId: '',
            }, () => {
                get(this, 'errors.subId') && delete this.errors.subId;
            });
        }
    };

    handleForgetPasswordClick = async () => {
        const {getForgetPasswordOtp, openPopup} = this.props;
        let {subId} = this.state;
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.FORGOT_PASSWORD, {
            [`${MIXPANEL.PARAMETER.SID}`]: subId,
        });
        moengageConfig.trackEvent(MOENGAGE.EVENT.FORGOT_PASSWORD, {
            [`${MOENGAGE.PARAMETER.SID}`]: subId,
        });
        await getForgetPasswordOtp(subId);
        let {forgetPasswordOtpResponse} = this.props;
        this.errors = {};
        if (forgetPasswordOtpResponse &&
            (forgetPasswordOtpResponse.code === 0)) {
            this.setState((previousState) => {
                return {
                    showForgetPasswordForm: !previousState.showForgetPasswordForm,
                    errors: this.errors,
                }
            });
        } else {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal',
                instructions: forgetPasswordOtpResponse && forgetPasswordOtpResponse.message ? forgetPasswordOtpResponse.message : MESSAGE.ERROR_OCCURRED,
                primaryButtonText: 'Ok',
                closeModal: true,
                hideCloseIcon: true,
            })
        }
    };

    validateChange = (name, value, callback) => {
        let element = document.getElementsByName(name) && document.getElementsByName(name)[0];
        if (value) {
            switch (name) {
                case 'rmn':
                    REGEX.MOBILE_NUMBER.test(value) ? delete this.errors[name] :
                        this.errors.rmn = MESSAGE.INVALID_RMN;
                    break;
                case 'subId':
                    value.length < LENGTH_CHECK.SID ?
                        this.errors.subId = MESSAGE.INVALID_SID :
                        delete this.errors[name];
                    break;
                case 'otp':
                    /*case 'forgetPasswordOtp':*/
                    REGEX.OTP.test(value) ? delete this.errors[name] :
                        this.errors[name] = MESSAGE.INCORRECT_OTP_6;
                    break;
                case 'forgetPasswordOtp':
                    /*case 'forgetPasswordOtp':*/
                    REGEX.OTP_4.test(value) ? delete this.errors[name] :
                        this.errors[name] = MESSAGE.INCORRECT_OTP_4;
                    break;
                /*case 'password':
                    REGEX.PASSWORD.test(value) ? delete this.errors[name] :
                        this.errors[name] = MESSAGE.INCORRECT_PASSWORD;
                    break;*/
                case 'newPassword':
                    //if (REGEX.PASSWORD.test(value)) {
                    if (value) {
                        delete this.errors[name];
                        if (get(this.state, 'confirmNewPassword') && this.state.confirmNewPassword.length !== 0) {
                            this.state.newPassword === this.state.confirmNewPassword ? delete this.errors.confirmNewPassword :
                                this.errors.confirmNewPassword = MESSAGE.PASSWORD_MISMATCH;
                        }

                    } else {
                        this.errors[name] = MESSAGE.INCORRECT_PASSWORD;
                    }
                    break;
                case 'confirmNewPassword':
                    //if (REGEX.PASSWORD.test(value)) {
                    if (value) {
                        this.state.newPassword === this.state.confirmNewPassword ? delete this.errors[name] :
                            this.errors.confirmNewPassword = MESSAGE.PASSWORD_MISMATCH;
                    } else {
                        this.errors.confirmNewPassword = MESSAGE.INCORRECT_PASSWORD;
                    }
                    break;
                default:
                    this.errors[name] ? delete this.errors[name] : false
            }
            this.errors[name] ? element.classList.add('error') : removeClass(element, 'error');
        } else {
            delete this.errors[name];
        }
        this.setState({
            errors: this.errors,
        }, () => {
            callback && callback(name);
        })
    };

    handleChange = (name, value) => {
        if (name === 'rmn') {
            this.errors['subId'] && delete this.errors['subId'];
            this.setState({
                subId: '',
                errors: this.errors,
            });
        } else if (name === 'subId') {
            setKey(LOCALSTORAGE.LOGIN_SID, value);
            this.errors['rmn'] && delete this.errors['rmn'];
            this.setState({
                rmn: '',
                errors: this.errors,
            });
        }
        this.setState({[name]: value}, () => {
            this.state.errors[name] && this.validateChange(name, value);
        })
    };

    setOtpResendTimer = () => {
        let {timeLeft, forgetPasswordOtpTimeLeft, showForgetPasswordOtpBlock} = this.state;
        if (showForgetPasswordOtpBlock) {
            if (forgetPasswordOtpTimeLeft <= 1 || forgetPasswordOtpTimeLeft == 30) {
                let {configResponse} = this.props;
                let forgetPasswordOtpTimeLeft = get(configResponse, 'data.config.otpDuration');
                let result = forgetPasswordOtpTimeLeft ? forgetPasswordOtpTimeLeft : this.state.timeLeftConstant;
                clearInterval(this.timerId);
                setTimeout(() => this.setState({
                    forgetPasswordOtpTimeLeft: result,
                }), 500);
                this.forgotTimerId = setInterval(() => {
                    this.countdown()
                }, 1000);
            }
        } else {
            if (timeLeft <= 1) {
                let {configResponse} = this.props;
                let timeLeft = get(configResponse, 'data.config.otpDuration');
                let result = timeLeft ? timeLeft : this.state.timeLeftConstant;
                clearInterval(this.forgotTimerId);
                setTimeout(() => this.setState({
                    timeLeft: result,
                }), 500);
                this.timerId = setInterval(() => {
                    this.countdown()
                }, 1000);
            }
        }
    };

    countdown = () => {
        let {showForgetPasswordOtpBlock} = this.state;
        if (showForgetPasswordOtpBlock) {
            if (this.state.forgetPasswordOtpTimeLeft === 1) {
                clearInterval(this.forgotTimerId)
                clearInterval(this.timerId);
                this.timeElapsed();
                this.setState({
                    forgetPasswordOtpTimeLeft: 0,
                })
            } else {
                let timeRemaining = this.state.forgetPasswordOtpTimeLeft - 1;
                this.setState({
                    forgetPasswordOtpTimeLeft: timeRemaining,
                })
            }
        } else {
            if (this.state.timeLeft === 1) {
                clearInterval(this.timerId);
                clearInterval(this.forgotTimerId)
                this.timeElapsed();
                this.setState({
                    timeLeft: 0,
                })
            } else {
                let timeRemaining = this.state.timeLeft - 1;
                this.setState({
                    timeLeft: timeRemaining,
                })
            }
        }

    }

    timeElapsed = () => {
        if (this.state.showForgetPasswordOtpBlock) {
            this.setState({
                disableForgotResendOtp: false,
            })
        } else {
            this.setState({
                disableResendOtp: false,
            })
        }
    };

    resetShowResendOtpBlock = () => {
        this.setState({
            showResendOtpBlock: false,
            showForgotResendOtpBlock: false,
        })
    };

    resendOtp = async (buttonName, formName, isFromResendOtp = true) => {
        const {generateOtpWithRMN, generateOtpWithSid, openPopup, showMainLoader, hideMainLoader} = this.props;
        let {rmn, subId, loginWithRMN, showForgetPasswordOtpBlock, selectedIndex} = this.state;
        if (showForgetPasswordOtpBlock) {
            this.setState({
                forgetPasswordOtp: '',
            });
            // this.errors.forgetPasswordOtp = '';
            this.errors = {};
            await this.handleButtonClick(buttonName, formName);
        } else {
            this.setState({
                otp: '',
            });
            // this.errors.otp = '';
            this.errors = {};
            showMainLoader();
            loginWithRMN ? await generateOtpWithRMN(rmn, false) : await generateOtpWithSid(subId, selectedIndex === 1);
            let {generatedCodeResponse} = this.props;
            generatedCodeResponse && generatedCodeResponse.code === 0 && toast(generatedCodeResponse.message);
            hideMainLoader();
            if(isFromResendOtp) {
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_OTP_RESEND);
                moengageConfig.trackEvent(MOENGAGE.EVENT.LOGIN_OTP_RESEND);
            }
        }
        if (showForgetPasswordOtpBlock) {
            this.setState({
                disableForgotResendOtp: true,
            })
        } else {
            this.setState({
                disableResendOtp: true,
            })
        }
        this.setState({
            errors: this.errors,
        }, () => {
            this.setOtpResendTimer();
        });
    };

    handleButtonClick = async (buttonName, formName) => {
        const {
            generateOtpWithRMN, generateOtpWithSid, validateOtp, validatePassword, openPopup,
            getLoginInfo, updateLoginWithRMN, showMainLoader, hideMainLoader, closePopup, validateOtpForSid,
        } = this.props;
        let {
            rmn,
            subId,
            otp,
            password,
            forgetPasswordOtp,
            newPassword,
            confirmNewPassword,
            loginWithRMN,
            showForgetPasswordOtpBlock,
            selectedIndex,
        } = this.state;
        if (buttonName === COMMON_TEXT.PROCEED) {
            showMainLoader();
            rmn ? await generateOtpWithRMN(rmn) : subId && await generateOtpWithSid(subId, selectedIndex === 1);
            hideMainLoader();
            if(rmn) {
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_OTP_INVOKE);
                moengageConfig.trackEvent(MOENGAGE.EVENT.LOGIN_OTP_INVOKE);
            }

            let {generatedCodeResponse} = this.props;
            if (generatedCodeResponse && (generatedCodeResponse.code === 0 || generatedCodeResponse.code === 6015)) {
                //* selectedIndex ===0  check added here with timer functions because we dont need to set the timer when
                // user has logged in with password tab *//
                selectedIndex === 0 && clearInterval(this.timerId);
                selectedIndex === 0 && clearInterval(this.forgotTimerId);
                selectedIndex === 0 && this.setOtpResendTimer();
                subId && this.setState({
                    rmn: get(generatedCodeResponse, 'data.rmn', ''),
                });
                this.setState({
                    maskedRmn: get(generatedCodeResponse, 'data.rmn', ''),
                })
                this.setState({
                    showOtpPasswordBlock: true,
                    showBackButton: true,
                    loginWithRMN: !!(rmn && rmn.length),
                }, () => {
                    updateLoginWithRMN(this.state.loginWithRMN)
                });
            } else {
                if (generatedCodeResponse.code === 80001) {
                    generatedCodeResponse.message = !generatedCodeResponse.message ? (rmn ? ERROR_MESSAGES.INCORRECT_RMN : ERROR_MESSAGES.INCORRECT_SID) : generatedCodeResponse.message;
                }
                if (generatedCodeResponse.code === 20013) {
                    moengageConfig.trackEvent(MOENGAGE.EVENT.NON_TS_RMN);
                }
                let errorMsg = generatedCodeResponse && generatedCodeResponse.message ?
                    generatedCodeResponse.message : MESSAGE.ERROR_OCCURRED;

                if (this.state.rmn) {
                    this.errors.rmn = errorMsg
                } else {
                    this.errors.subId = errorMsg;
                }
            }
        } else if ((buttonName === COMMON_TEXT.SEND_OTP || buttonName === COMMON_TEXT.RESEND_OTP) && formName === FORM_NAME.FORGET_PASSWORD) {
            const {getForgetPasswordOtp, showMainLoader, hideMainLoader, openPopup} = this.props;
            let {subId, newPassword, confirmNewPassword} = this.state;
            showMainLoader();
            let payload = {"confirmPwd": confirmNewPassword, "newPwd": newPassword};
            showForgetPasswordOtpBlock ? await getForgetPasswordOtp(subId) : await getForgetPasswordOtp(subId, payload);
            hideMainLoader();
            let {forgetPasswordOtpResponse, configResponse} = this.props;
            let forgetPasswordOtpTimeLeft = get(configResponse, 'data.config.otpDuration');
            if (forgetPasswordOtpResponse &&
                (forgetPasswordOtpResponse.code === 0 || forgetPasswordOtpResponse.code === 6015)) {
                buttonName === COMMON_TEXT.SEND_OTP && this.setState((previousState) => {
                    return {
                        showForgetPasswordOtpBlock: !previousState.showForgetPasswordOtpBlock,
                        // forgetPasswordOtpTimeLeft: forgetPasswordOtpTimeLeft ? forgetPasswordOtpTimeLeft : this.state.timeLeftConstant,
                        errors: {},
                    }
                }, () => {
                    this.errors = {};
                    clearInterval(this.forgotTimerId);
                    this.setOtpResendTimer();
                })
            } else {
                if (forgetPasswordOtpResponse && forgetPasswordOtpResponse.code === 6010) {
                    openPopup(MODALS.ALERT_MODAL, {
                        modalClass: 'alert-modal',
                        instructions: get(forgetPasswordOtpResponse, 'message') ? forgetPasswordOtpResponse.message : MESSAGE.ERROR_OCCURRED,
                        primaryButtonText: 'Ok',
                        closeModal: true,
                        hideCloseIcon: true,
                    });
                    this.errors.confirmNewPassword = "";
                } else {
                    this.setState({
                        forgetPasswordOtpTimeLeft: forgetPasswordOtpTimeLeft ? forgetPasswordOtpTimeLeft : this.state.timeLeftConstant,
                    });
                    this.errors.confirmNewPassword = get(forgetPasswordOtpResponse, "message", MESSAGE.ERROR_OCCURRED);
                }
            }
        } else if (buttonName === COMMON_TEXT.AUTHENTICATE && formName === FORM_NAME.FORGET_PASSWORD) {
            const {changePasswordWithoutAuth} = this.props;
            let payload = {
                "confirmPwd": confirmNewPassword,
                "newPwd": newPassword,
                "oldPwd": forgetPasswordOtp,
            };
            showMainLoader();
            await changePasswordWithoutAuth(subId, payload);
            hideMainLoader();
            let {changePasswordWithoutAuthResponse, passwordRedirectionTimeInSecs} = this.props;
            if (changePasswordWithoutAuthResponse &&
                (changePasswordWithoutAuthResponse.code === 0 || changePasswordWithoutAuthResponse.code === 6015)) {
                //incrementStepNumber();
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal password-update-modal',
                    headingMessage: MESSAGE.PASSWORD_UPDATED_POPUP,
                    primaryButtonText: 'Ok',
                    primaryButtonAction: () => this.resetLoginFormState(),
                    hideCloseIcon: true,
                    icon: true,
                    changePwd: true,
                    passwordRedirectionTimeInSecs: passwordRedirectionTimeInSecs,
                });

                setTimeout(() => {
                    closePopup(), this.resetLoginFormState()
                }, 5000);

                this.trackUpdatePwdSuccessEvents(subId);
            } else {
                this.errors.forgetPasswordOtp = get(changePasswordWithoutAuthResponse, 'message') ?
                    changePasswordWithoutAuthResponse.message : MESSAGE.ERROR_OCCURRED;
                this.trackUpdatePwdErrorEvents(changePasswordWithoutAuthResponse, subId);
            }
        } else if (buttonName === COMMON_TEXT.LOGIN) {
            let {generatedCodeResponse} = this.props;
            if (formName === FORM_NAME.OTP) {
                let payload = {
                    rmn: rmn.length ? rmn : get(generatedCodeResponse, 'data.rmn'),
                    otp,
                };

                let result = {
                    "maskedNumber": generatedCodeResponse?.data?.maskedNumber,
                    "otp": otp,
                    "sid": subId,
                }

                showMainLoader();

                if (loginWithRMN) {
                    setKey(LOCALSTORAGE.LOGIN_DETAILS, payload.rmn);
                    await validateOtp(payload).then(res => {
                        this.otpAuthentication(res, formName);
                    })
                } else {
                    setKey(LOCALSTORAGE.LOGIN_DETAILS, subId);
                    setKey(LOCALSTORAGE.LOGIN_SID, subId);
                    subId && await validateOtpForSid(result).then(res => {
                        this.otpAuthentication(res, formName);
                    });
                }
            } else {
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_PASSWORD);
                moengageConfig.trackEvent(MOENGAGE.EVENT.LOGIN_PASSWORD);

                let payload = {
                    "pwd": password,
                    "sid": subId,
                };
                showMainLoader();
                await validatePassword(payload).then(res => {
                    if (res.code === 0) {
                        getLoginInfo(rmn, subId);
                        this.selectUserView(rmn, subId, formName);
                    } else {
                        setKey(LOCALSTORAGE.LOGIN_DETAILS, subId);
                        setKey(LOCALSTORAGE.LOGIN_SID, subId);
                        mixPanelLoginEvents(res, {loginWithRMN, authType: formName});
                        hideMainLoader();

                        if (res.code === 6021) {
                            openPopup(MODALS.ALERT_MODAL, {
                                modalClass: 'alert-modal',
                                instructions: get(res, 'message') ? res.message : MESSAGE.ERROR_OCCURRED,
                                primaryButtonText: 'Ok',
                                closeModal: true,
                                hideCloseIcon: true,
                            });
                            this.errors.password = "";
                        } else {
                            this.errors.password = get(res, 'message') ? res.message : MESSAGE.ERROR_OCCURRED;

                            this.setState({
                                errors: this.errors,
                            });
                        }
                    }
                });
            }
        }

        this.setState({
            errors: this.errors,
        });
    };

    otpAuthentication = (res, formName) => {
        const {getLoginInfo, hideMainLoader} = this.props;
        let {
            rmn,
            subId,
            loginWithRMN,
        } = this.state;
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_OTP_ENTER);
        moengageConfig.trackEvent(MOENGAGE.EVENT.LOGIN_OTP_ENTER);
        if (res.code === 0) {
            getLoginInfo(rmn, subId);
            this.selectUserView(rmn, subId, formName);
        } else {
            setKey(LOCALSTORAGE.LOGIN_DETAILS, loginWithRMN ? rmn : subId);
            mixPanelLoginEvents(res, {loginWithRMN, authType: formName});
            hideMainLoader();
            if (get(res, 'message')) {
                this.errors.otp = res.message;
            }
            this.setState({
                errors: this.errors,
            });
        }
    }

    trackUpdatePwdSuccessEvents = (subId) => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PASSWORD_RESET_SUCCESS, {
            [`${MIXPANEL.PARAMETER.SID}`]: subId,
        });
        moengageConfig.trackEvent(MOENGAGE.EVENT.PASSWORD_RESET_SUCCESS, {
            [`${MIXPANEL.PARAMETER.SID}`]: subId,
        });

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PASSWORD_SUCCESS);
        moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PASSWORD_SUCCESS);
    };

    trackUpdatePwdErrorEvents = (changePasswordWithoutAuthResponse, subId) => {
        let reason = changePasswordWithoutAuthResponse ? changePasswordWithoutAuthResponse.message : '';
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PASSWORD_RESET_FAILED, {
            [`${MIXPANEL.PARAMETER.REASON}`]: reason,
            [`${MIXPANEL.PARAMETER.SID}`]: subId,
        });
        moengageConfig.trackEvent(MOENGAGE.EVENT.PASSWORD_RESET_FAILED, {
            [`${MOENGAGE.PARAMETER.REASON}`]: reason,
            [`${MIXPANEL.PARAMETER.SID}`]: subId,
        });

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PASSWORD_FAILED, {
            [`${MIXPANEL.PARAMETER.REASON}`]: reason,
        });
        moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PASSWORD_FAILED, {
            [`${MOENGAGE.PARAMETER.REASON}`]: reason,
        });
    };

    selectUserView = async (rmn, subId, formName) => {
        let {
            updateStepNumber,
            history,
            updateSubscriberDetails,
            getAccountDetailsFromSid,
            openPopup,
            updateAuthType,
            quickRecharge,
            hideMainLoader,
        } = this.props;
        let {loginWithRMN} = this.state;
        let stepNo = 2;
        let params = {loginWithRMN, authType: formName};
        if (!loginWithRMN) {
            await getAccountDetailsFromSid(subId);

            if (this.props.accountDetailsFromSid && this.props.accountDetailsFromSid.code === 0) {
                selectSubscriberScreen(this.props.accountDetailsFromSid.data, updateStepNumber, updateSubscriberDetails, openPopup, history, params);
            } else {
                hideMainLoader();
                this.showErrorPopup(this.props.accountDetailsFromSid, openPopup, quickRecharge, history, subId, params)
            }
        } else {
            //updateStepNumber(stepNo);
            let {getAccountDetailsFromRmn} = this.props;
            let params = {loginWithRMN, authType: formName};
            await getAccountDetailsFromRmn(rmn);

            if (this.props.accountDetailsFromRmn && this.props.accountDetailsFromRmn.code === 0) {
                if (this.props.accountDetailsFromRmn.data.length === 1) {
                    selectSubscriberScreen(this.props.accountDetailsFromRmn.data[0], updateStepNumber, updateSubscriberDetails, openPopup, history, params);
                } else {
                    hideMainLoader();
                    updateStepNumber(stepNo);
                }
            } else {
                hideMainLoader();
                this.showErrorPopup(this.props.accountDetailsFromRmn, openPopup, quickRecharge, history, subId, params, rmn)
            }
        }
        updateAuthType(formName);
    };

    showErrorPopup = (response, openPopup, quickRecharge, history, sId, params, rmn = '') => {
        setKey(LOCALSTORAGE.LOGIN_DETAILS, params.loginWithRMN ? rmn : sId);
        mixPanelLoginEvents(response, params);
        if (response && response.code === 80002) {
            let heading = 'Account Status',
                instructions = response.message,
                rechargeBtn = true,
                skipBtn = false;
            showRechargePopup(heading, instructions, rechargeBtn, skipBtn, openPopup, quickRecharge, history, sId, true);
        } else if (response && response.code === 20011) {
            nonBingeUserNoSubscriptionPopup(response);
        }
        else if(response && response.code === 40041){
            openPopup(MODALS.ALERT_MODAL, {
                headingMessage: 'Error Message',
                modalClass: 'alert-modal inactive-alert',
                instructions: response && response.message ? response.message : MESSAGE.ERROR_OCCURRED,
                primaryButtonText: 'Ok',
                closeModal: true,
                hideCloseIcon: true,
                errorIcon: 'icon-alert-upd',
            })
        }else {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal',
                instructions: response && response.message ? response.message : MESSAGE.ERROR_OCCURRED,
                primaryButtonText: 'Ok',
                closeModal: true,
                hideCloseIcon: true,
            })
        }
    };

    checkFormValidity = (formName) => {
        let {
            rmn,
            subId,
            errors,
            forgetPasswordOtp,
            newPassword,
            confirmNewPassword,
            showForgetPasswordOtpBlock,
            password,
        } = this.state;
        if (formName === FORM_NAME.OTP) {
            return (rmn ? rmn.length < 10 : subId.length < 10) || Object.keys(errors).length
        } else if (formName === FORM_NAME.FORGET_PASSWORD) {
            /* return (forgetPasswordOtp.length !== LENGTH_CHECK.OTP || newPassword.length === 0 || confirmNewPassword.length === 0) || Object.keys(errors).length*/
            if (showForgetPasswordOtpBlock) {
                return (forgetPasswordOtp.length === 0 || Object.keys(errors).length)
            } else {
                return (!(newPassword.length >= 1) || !(confirmNewPassword.length >= 1)) || Object.keys(errors).length
            }
        }
    };

    backButtonClickHandler = (fromForgetPass) => {
        let {showForgetPasswordOtpBlock} = this.state;
        if (fromForgetPass) {
            let forgetPasswordOtpTimeLeft = get(this.props.configResponse, 'data.config.otpDuration');
            showForgetPasswordOtpBlock ?
                this.setState({
                    forgetPasswordOtp: '',
                    showForgetPasswordOtpBlock: false,
                    disableForgotResendOtp: true,
                    forgetPasswordOtpTimeLeft: forgetPasswordOtpTimeLeft ? forgetPasswordOtpTimeLeft : this.state.timeLeftConstant,
                }) :
                this.setState({
                    newPassword: '',
                    confirmNewPassword: '',
                    showOtpPasswordBlock: true,
                    showBackButton: true,
                    showForgetPasswordForm: false,
                    forgetPasswordOtpTimeLeft: forgetPasswordOtpTimeLeft ? forgetPasswordOtpTimeLeft : this.state.timeLeftConstant,
                });
        } else {
            // showForgetPasswordOtpBlock ? clearInterval(this.forgotTimerId) : clearInterval(this.timerId);
            clearInterval(this.timerId);
            clearInterval(this.forgotTimerId);
            this.resetLoginFormState();
        }
    };

    trackNonTSUserAnalyticsEvent = () => {
        moengageConfig.trackEvent(MOENGAGE.EVENT.NOT_A_TS_USER_BUTTON_CLICK);
    }

    render() {
        let {
            selectedIndex,
            rmn,
            subId,
            errors,
            showOtpPasswordBlock,
            otp,
            password,
            loginWithRMN,
            showForgetPasswordForm,
            forgetPasswordOtp,
            newPassword,
            confirmNewPassword,
            timeLeft,
            forgetPasswordOtpTimeLeft,
            disableResendOtp,
            disableForgotResendOtp,
            showBackButton,
            showResendOtpBlock,
            showForgotResendOtpBlock,
            showForgetPasswordOtpBlock,
            maskedRmn,
        } = this.state;
        return (
            <div className='login-form'>
                <div className={'for-mobile'}><ProgressBar stepNumberArray={WEB_SMALL_LOGIN_STEP} activeStep={1}/></div>
                {showForgetPasswordForm ?
                    <ForgetPassword
                        rmn={rmn}
                        errors={errors}
                        forgetPasswordOtp={forgetPasswordOtp}
                        newPassword={newPassword}
                        confirmNewPassword={confirmNewPassword}
                        showForgetPasswordOtpBlock={showForgetPasswordOtpBlock}
                        handleChange={this.handleChange}
                        validateChange={this.validateChange}
                        handleButtonClick={this.handleButtonClick}
                        checkFormValidity={this.checkFormValidity}
                        backButtonClickHandler={this.backButtonClickHandler}
                        timeLeft={forgetPasswordOtpTimeLeft}
                        disableResendOtp={disableForgotResendOtp}
                        showResendOtpBlock={showForgotResendOtpBlock}
                        resendOtp={this.resendOtp}
                    /> :
                    <div>
                        <div>
                            <h3>
                                {showBackButton &&
                                <i className={'icon-back-2'} id='back-btn'
                                   onClick={() => this.backButtonClickHandler(false)}/>}
                                Login</h3>
                        </div>
                        <Tabs selectedIndex={selectedIndex} onSelect={index => this.switchTab(index)}>
                            <TabList className="tab-row">
                                <Tab className="tab" selectedClassName="active">OTP</Tab>
                                <Tab className="tab" selectedClassName="active" disabled={loginWithRMN}
                                     disabledClassName={'tab-disable'}>Password</Tab>
                            </TabList>
                            <TabPanel>
                                <OtpLogin rmn={rmn}
                                          subId={subId}
                                          otp={otp}
                                          errors={errors}
                                          timeLeft={timeLeft}
                                          disableResendOtp={disableResendOtp}
                                          showResendOtpBlock={showResendOtpBlock}
                                          showOtpPasswordBlock={showOtpPasswordBlock}
                                          resendOtp={this.resendOtp}
                                          handleChange={this.handleChange}
                                          validateChange={this.validateChange}
                                          handleButtonClick={this.handleButtonClick}
                                          checkFormValidity={this.checkFormValidity}
                                          configResponse={this.props.configResponse}
                                          maskedRmn={maskedRmn}
                                          trackNonTSUserAnalyticsEvent={this.trackNonTSUserAnalyticsEvent}
                                />
                            </TabPanel>
                            <TabPanel>
                                <PasswordLogin
                                    rmn={rmn}
                                    subId={subId}
                                    password={password}
                                    errors={errors}
                                    showOtpPasswordBlock={showOtpPasswordBlock}
                                    handleChange={this.handleChange}
                                    validateChange={this.validateChange}
                                    handleButtonClick={this.handleButtonClick}
                                    handleForgetPasswordClick={this.handleForgetPasswordClick}
                                    configResponse={this.props.configResponse}
                                    trackNonTSUserAnalyticsEvent={this.trackNonTSUserAnalyticsEvent}
                                />
                            </TabPanel>
                        </Tabs>
                    </div>}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        generatedCodeResponse: get(state.bingeLoginDetails, 'generatedCodeResponse'),
        forgetPasswordOtpResponse: get(state.bingeLoginDetails, 'forgetPasswordOtpResponse'),
        changePasswordWithoutAuthResponse: get(state.bingeLoginDetails, 'changePasswordWithoutAuthResponse'),
        accountDetailsFromSid: get(state.bingeLoginDetails, 'accountDetailsFromSid'),
        configResponse: get(state.headerDetails, 'configResponse'),
        accountDetailsFromRmn: get(state.bingeLoginDetails, 'accountDetailsFromRmn'),
        passwordRedirectionTimeInSecs: get(state.headerDetails, 'configResponse.data.config.passwordRedirectionTimeInSecs'),
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        generateOtpWithRMN,
        generateOtpWithSid,
        validateOtp,
        validatePassword,
        openPopup,
        getForgetPasswordOtp,
        changePasswordWithoutAuth,
        getAccountDetailsFromSid,
        getAccountDetailsFromRmn,
        fetchConfig,
        quickRecharge,
        showMainLoader,
        hideMainLoader,
        closePopup,
        validateOtpForSid,
    }, dispatch)
);

LoginForm.propTypes = {
    generateOtpWithRMN: PropTypes.func,
    generateOtpWithSid: PropTypes.func,
    validateOtp: PropTypes.func,
    validatePassword: PropTypes.func,
    incrementStepNumber: PropTypes.func,
    openPopup: PropTypes.func,
    handleForgetPasswordClick: PropTypes.func,
    getForgetPasswordOtp: PropTypes.func,
    changePasswordWithoutAuth: PropTypes.func,
    generatedCodeResponse: PropTypes.object,
    forgetPasswordOtpResponse: PropTypes.object,
    changePasswordWithoutAuthResponse: PropTypes.object,
    updateStepNumber: PropTypes.func,
    getLoginInfo: PropTypes.func,
    getAccountDetailsFromSid: PropTypes.func,
    getAccountDetailsFromRmn: PropTypes.func,
    accountDetailsFromSid: PropTypes.object,
    accountDetailsFromRmn: PropTypes.array,
    updateSubscriberDetails: PropTypes.func,
    configResponse: PropTypes.object,
    history: PropTypes.object,
    updateAuthType: PropTypes.func,
    updateLoginWithRMN: PropTypes.func,
    fetchConfig: PropTypes.func,
    quickRecharge: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    closePopup: PropTypes.func,
    passwordRedirectionTimeInSecs: PropTypes.number,
    validateOtpForSid: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
