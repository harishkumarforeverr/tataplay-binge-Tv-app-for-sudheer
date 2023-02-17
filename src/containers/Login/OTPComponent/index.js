import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {LENGTH_CHECK} from "@utils/constants";
import OtpInpuBox from "./OtpInpuBox";
import {rmnValidateOtp} from "../APIs/actions";
import "./style.scss";
import {get} from "lodash";
import {isMobile} from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import trackEvent from "../../../utils/trackEvent";
import isEmpty from "lodash/isEmpty";
import {maskingFunction, rmnMaskingFunction} from "@containers/BingeLogin/bingeLoginCommon";
import {trackMixpanelError} from "../LoginCommon";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";

class OTPComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timerForOTPVerification: props.otpDuration,
            activeInputBox: 0,
            otpValueArray: new Array(LENGTH_CHECK.OTP).fill(""),
            errorMessage: null,
            autoFocus: false,
            otpResentCount: 1,
            otp:''
        };
        this.intervalId = "";
    }

    componentDidMount = () => {
        this.startTimer();
        this.toggleOtpBlockClass(true);
        // Reading OTP 
        if ("OTPCredential" in window) {
            const ac = new AbortController();
            navigator.credentials
                .get({
                    otp: { transport: ["sms"] },
                    signal: ac.signal,
                    password: true
                })
                .then((otp) => {
                    let otpValues = otp.code
                    if (otpValues.length === 6) {
                        const otpArray = otpValues.split("")
                        this.setState({
                            otp: otp.code,
                            otpValueArray: otpArray
                        });
                    } else {
                        console.log("Invalid OTP Received", otpValues)
                    }
                    ac.abort();
                })
                .catch((err) => {
                    ac.abort();
                    console.log(err);
                });
        }
    };


    componentWillUnmount = () => {
        clearInterval(this.intervalId);
        this.toggleOtpBlockClass(false);
    };


    toggleOtpBlockClass = (addClass = true) => {
        let element = document.querySelector('.login-with-otp-modal .popupSec');
        let hasClass = document.querySelector('.login-with-otp-modal .otp-container-block');

        if (!isEmpty(element)) {
            addClass && isEmpty(hasClass) && element.classList.add('otp-container-block');
            !addClass && !isEmpty(hasClass) && element.classList.remove('otp-container-block');
        }
    }

    startTimer = () => {
        this.intervalId = setInterval(() => {
            if (this.state.timerForOTPVerification === 0) {
                clearInterval(this.intervalId);
            } else {
                this.tick();
            }
        }, 1000);
    };

    tick = () => {
        this.setState((prevState) => ({
            timerForOTPVerification: prevState.timerForOTPVerification - 1,
        }));
    };

    handleOtpChange = async (otp) => {
        const {rmn, onOtpVerification} = this.props;

        if (get(this.state, "errorMessage")) {
            this.setState({
                errorMessage: null,
            });
        }

        if (otp.length === LENGTH_CHECK.OTP) {
            await this.props.rmnValidateOtp(rmn, otp);
            trackEvent.loginOtpEnter()
            const {otpResponse} = this.props;
            if (otpResponse && otpResponse.code === 0) {
                onOtpVerification(otp);
            } else {
                clearInterval(this.intervalId);
                appsFlyerConfig.trackEvent(APPSFLYER.EVENT.LOGIN_FAILURE,{
                    [APPSFLYER.PARAMETER.TYPE] : rmn,
                    [APPSFLYER.PARAMETER.AUTH]:APPSFLYER.VALUE.OTP,
                    [APPSFLYER.PARAMETER.VALUE]:rmnMaskingFunction(rmn),
                    [APPSFLYER.PARAMETER.REASON]:otpResponse?.message
                    ? otpResponse.message
                    : "Incorrect OTP",
                })
                const data = { loginErrorMessage: otpResponse.message, rmn: rmn }
                trackEvent.loginFail(data)
                trackMixpanelError(otpResponse.message, otpResponse.code)
                this.setState({
                    errorMessage: otpResponse?.message
                        ? otpResponse.message
                        : "Incorrect OTP",
                    timerForOTPVerification: 0,
                    otpValueArray: new Array(LENGTH_CHECK.OTP).fill(""),
                });
            }
        }
    };

    handleKeyEvent = (event) => {
        const pressedKey = event.key;
        const {activeInputBox, otpValueArray} = this.state;

        switch (pressedKey) {
            case "Backspace":
            case "Delete": {
                event.preventDefault();
                if (otpValueArray[activeInputBox]) {
                    this.changeCodeAtFocus("");
                } else {
                    this.focusPrevInput();
                }
                break;
            }
            case "ArrowLeft": {
                event.preventDefault();
                this.focusPrevInput();
                break;
            }
            case "ArrowRight": {
                event.preventDefault();
                this.focusNextInput();
                break;
            }
            default: {
                if (pressedKey.match(/^[^0-9]$/)) {
                    event.preventDefault();
                }
                break;
            }
        }
    };

    focusPrevInput = () => {
        this.focusInput(this.state.activeInputBox - 1);
    };

    focusNextInput = () => {
        this.focusInput(this.state.activeInputBox + 1);
    };

    focusInput = (inputIndex) => {
        const selectedIndex = Math.max(
            Math.min(LENGTH_CHECK.OTP - 1, inputIndex),
            0,
        );
        this.setState({
            activeInputBox: selectedIndex,
        }, () => {
            if (this.state.activeInputBox === 1) {
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_OTP_ENTER, {
                    [MIXPANEL.PARAMETER.DEVICE_METHOD]: MIXPANEL.VALUE.WEB,
                });
            }
        });
    };

    changeCodeAtFocus = (value) => {
        const {activeInputBox, otpValueArray} = this.state;
        const updatedotpValueArray = [...otpValueArray];
        updatedotpValueArray[activeInputBox] = value || "";
        this.setState({
            otpValueArray: updatedotpValueArray,
        });
        const otpValue = updatedotpValueArray.join("");
        this.handleOtpChange(otpValue);
    };

    getRightValue = (value) => {
        let changedValue = value;
        if (!changedValue) {
            return changedValue;
        }
        return Number(changedValue) >= 0 ? changedValue : "";
    };

    handleOnChange = (event, value) => {
        let inputValue = value || event?.target?.value || "";
        inputValue = this.getRightValue(inputValue);
        if (!inputValue) {
            event.preventDefault();
            return;
        }
        this.changeCodeAtFocus(inputValue);
        this.focusNextInput();
    };

    handleOnFocus = (inputIndex) => {
        const selectedIndex = Math.max(
            Math.min(LENGTH_CHECK.OTP - 1, inputIndex),
            0,
        );
        this.setState({
            activeInputBox: selectedIndex,
            autoFocus: true,
        });
    };

    resendOtp = async () => {
        const {timerForOTPVerification, errorMessage, otpResentCount} = this.state;
        if ((timerForOTPVerification !== 0 && !errorMessage) || (otpResentCount >= this.props.otpResentCount)) {
            return;
        }
        this.setState(prevState => ({
            timerForOTPVerification: this.props.otpDuration,
            activeInputBox: 0,
            otpValueArray: new Array(LENGTH_CHECK.OTP).fill(""),
            errorMessage: null,
            otpResentCount: prevState.otpResentCount + 1
        }));
        await this.props.handleResendOtp();
        if (this.props.selectedPlan) {
            dataLayerConfig.trackEvent(DATALAYER.EVENT.RESEND_OTP_SUB_JOURNEY,
                {
                    [DATALAYER.PARAMETER.PACK_NAME]: this.props.selectedPlan?.productName,
                    [DATALAYER.PARAMETER.PACK_PRICE]: this.props.selectedPlan?.amountValue,
                }
            )
        } else {
            dataLayerConfig.trackEvent(DATALAYER.EVENT.RESEND_OTP_LOGIN_JOURNEY)
        }
        dataLayerConfig.trackEvent(DATALAYER.EVENT.RESEND_OTP_LOGIN_JOURNEY)
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_OTP_RESEND);
        clearInterval(this.intervalId);
        this.startTimer();
        trackEvent.loginOtpResent()
    };

    handleOnBlur = (e, index) => {
        if (index < 6) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.setState({
            activeInputBox: -1,
        });

    };
    handlePasteValue = (value) => {
        const copiedOtpArr = Array.from(String(value), num => Number(num));
        this.setState({
            otpValueArray: copiedOtpArr,
            activeInputBox: copiedOtpArr.length - 1,
        });
        const otpValue = copiedOtpArr.join("");
        this.handleOtpChange(otpValue);

    }

    handleOtpPaste = async (e) => {
        let copiedValue = await navigator.clipboard.readText();
        this.handlePasteValue(copiedValue);

    }

    render() {
        const {rmn} = this.props;
        const {
            activeInputBox,
            otpValueArray,
            errorMessage,
            timerForOTPVerification,
            otpResentCount
        } = this.state;
        const shouldTimerHide = timerForOTPVerification === 0 && !errorMessage;
        const shouldResendDisable = (timerForOTPVerification !== 0 && !errorMessage) || (otpResentCount >= this.props.otpResentCount);

        return (
            <form>
                <div className="otp-container">
                    <p className="otp-placeholder">Please enter the OTP sent to +91 {(rmn)}</p>
                    <ul className={`otp-input-wrapper ${errorMessage && "incorrect-otp"}`}>
                        {Array(LENGTH_CHECK.OTP)
                            .fill("")
                            .map((_, index) => (
                                <OtpInpuBox
                                    key={`OtpInpuBox-${index}`}
                                    type="tel"
                                    focus={activeInputBox === index}
                                    value={otpValueArray && otpValueArray[index]}
                                    autoFocus={isMobile.any() ? this.state.autoFocus : true}
                                    onFocus={() => {
                                        this.handleOnFocus(index);
                                    }}
                                    handlePasteValue={this.handlePasteValue}
                                    maxLength={1}
                                    onChange={this.handleOnChange}
                                    onKeyDown={this.handleKeyEvent}
                                    onBlur={(e) => this.handleOnBlur(e, index)}
                                    onPaste={(e) => this.handleOtpPaste(e)}
                                    otpValue={this.state.otpValueArray.join("")}
                                />
                            ))}
                    </ul>
                    <div
                        className={`otp-resend-container ${shouldTimerHide && "hide-timer"}`}
                    >
                        {errorMessage ? (
                            <span className="error-message">{errorMessage}</span>
                        ) : timerForOTPVerification !== 0 ? (
                            <div className="timer-container">
                                Resend OTP in {timerForOTPVerification} sec
                            </div>
                        ) : null}
                        <div
                            className={`resend-btn ${shouldResendDisable && "disabled-resend-button"}`}
                        >
                            <a onClick={this.resendOtp}>Resend OTP</a>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        otpResponse: get(state.loginReducer, "otpResponse"),
        configResponse: get(state.headerDetails, "configResponse"),
        otpDuration: get(state.headerDetails, 'configResponse.data.config.otpDuration'),
        otpResentCount: get(state.headerDetails, 'configResponse.data.config.otpResentCount')
    };
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                rmnValidateOtp,
            },
            dispatch,
        ),
    };
}

OTPComponent.propTypes = {
    rmnValidateOtp: PropTypes.func,
    onOtpVerification: PropTypes.func,
    handleResendOtp: PropTypes.func,
    rmn: PropTypes.string,
    otpDuration: PropTypes.number,
    otpResentCount: PropTypes.number,
    otpResponse: PropTypes.object,
    selectedPlan: PropTypes.object
};

export default connect(mapStateToProps, mapDispatchToProps)(OTPComponent);
