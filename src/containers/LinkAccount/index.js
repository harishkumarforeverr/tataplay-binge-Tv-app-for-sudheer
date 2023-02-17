import React, {Component} from 'react';
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import Heading from "@common/Heading";
import InputBox from "@common/InputBox";
import Button from "@common/Buttons";
import {REGEX} from "@constants/index";
import {removeClass} from "@utils/common";
import ResendOtp from "@common/ResendOtp";
import {MODALS} from "@common/Modal/constants";
import {openPopup, closePopup} from '@common/Modal/action';
import {goToHome} from '@utils/common.js';

import {fetchLinkAccountOtp} from './APIs/actions';

import './style.scss';

class LinkAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobileNumber: '',
            errors: {},
        };
        this.errors = {};
    }

    validateChange = (name, value) => {
        let element = document.getElementsByName(name) && document.getElementsByName(name)[0];
        if (value) {
            switch (name) {
                case 'mobileNumber':
                    REGEX.MOBILE_NUMBER.test(value) ? delete this.errors[name] :
                        this.errors.mobileNumber = 'Please enter a valid mobile number or subscriber ID';
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
        })
    };

    handleOnChange = (name, value) => {
        this.setState({[name]: value}, () => {
            this.validateChange(name, value)
        });
    };

    sendOtpClick = (e) => {
        e.preventDefault();
        this.setState({
            otpDetails: {'status': true},
        })
    };

    SubmitForm = (e) => {
        e.preventDefault();
        const {openPopup, history} = this.props;
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal link-account-modal',
            headingMessage: 'Linked Successfully',
            instructions: 'Your Tata Sky DTH with Subscriber ID 65446 has been successfully linked to your Tata Sky Binge Account.',
            primaryButtonText: 'OK',
            primaryButtonAction: () => goToHome(history),
            onCloseAction: () => goToHome(history),
            icon: true,
        })
    };


    render() {
        let {mobileNumber, otp, errors, otpDetails} = this.state;
        let btnDisabled = !((isEmpty(otpDetails) ? mobileNumber.length : otp && otp.length) && Object.keys(errors).length === 0);
        return (
            <div className='link-accounts-container form-container'>
                <Heading
                    heading={!isEmpty(otpDetails) ? 'Enter OTP sent to +91 XXXX XX4365' : 'Enter Mobile Number or Subscriber ID'}
                    subHeading='Enter details of Tata Sky DTH account to which you want to link to your Tata Sky Binge Subscription.'/>
                <form className='link-accounts-form' autoComplete='off'>
                    <ul>
                        <li className="form-group">
                            <div className="form-data">
                                <InputBox inputType={'text'}
                                          name={!isEmpty(otpDetails) ? "otp" : "mobileNumber"}
                                          isNumeric={isEmpty(otpDetails)}
                                          isNumericWithZero={!isEmpty(otpDetails)}
                                          onChange={this.handleOnChange}
                                          placeholder={!isEmpty(otpDetails) ? '6 Digits' : ''}
                                          maxLength={!isEmpty(otpDetails) ? 6 : 10}
                                          errorMessage={!isEmpty(otpDetails) ? errors.otp : errors.mobileNumber}
                                          value={!isEmpty(otpDetails) ? otp : mobileNumber}
                                          labelName={!isEmpty(otpDetails) ? "Enter OTP" : "Enter Mobile number or Subscriber ID"}/>
                                {!isEmpty(otpDetails) && <ResendOtp mobileNumber={mobileNumber}/>}
                            </div>
                        </li>
                        <li className="form-group">
                            <div className="form-data ">
                                <Button bType="submit" cName="btn primary-btn btn-block"
                                        disabled={btnDisabled}
                                        clickHandler={!isEmpty(otpDetails) ? this.SubmitForm : this.sendOtpClick}
                                        bValue={!isEmpty(otpDetails) ? "Link Accounts" : "Send OTP"}/>
                            </div>
                        </li>
                        {
                            !isEmpty(otpDetails) && <p className='link-acc-instruction'>
                                Linking your Tata Sky Binge Account to your Tata Sky DTH account would allow you <br/>
                                to recharge for both subscription in a single transaction
                            </p>
                        }
                        <li/>
                    </ul>
                </form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        otpDetails: get(state.linkAccount, 'linkAccountOtpDetails'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            fetchLinkAccountOtp,
            openPopup,
            closePopup,
        }, dispatch),
    }
}

LinkAccount.propTypes = {
    otpDetails: PropTypes.object,
    fetchLinkAccountOtp: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    goToHome: PropTypes.func,
    history: PropTypes.object,
};

export default (connect(mapStateToProps, mapDispatchToProps)(LinkAccount));