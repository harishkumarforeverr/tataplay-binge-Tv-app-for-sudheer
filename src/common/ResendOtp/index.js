import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import get from 'lodash/get';
import Timer from '@common/Timer';
import {resendOtp} from './APIs/actions';
import PropTypes from "prop-types";

import './style.scss'
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";


class ResendOtp extends Component {

    constructor(props) {
        super(props)
        this.state = {
            attempts: 3,
            disableResendOtp: true,
        }
    }

    componentDidMount() {
        let {configResponse} = this.props;
        let otpResentCount = get(configResponse, 'data.config.otpResentCount');
        setTimeout(() => this.setState({
            attempts: otpResentCount,
        }), 500);
    }

    resendOtp = async () => {
        const {resendOtp, mobileNumber} = this.props;
        await resendOtp(mobileNumber)
        this.setState({
            disableResendOtp: true,
            attempts: this.state.attempts - 1,
        });
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_OTP_RESEND);
    }

    timerElapsed = () => {
        this.setState({
            disableResendOtp: false,
        })
    }


    render() {
        const {disableResendOtp, attempts} = this.state;
        const {selectedIndex} = this.props;
        return (
            <div
                className={`${disableResendOtp || attempts === 0 ? "resend-otp-container disabled" : 'resend-otp-container'} ${selectedIndex && selectedIndex === 1 ? 'password-case' : 'otp-case'}`}>
                <p className={disableResendOtp || attempts === 0 ? "disabled" : ''} id={'resend-button'}
                   onClick={this.resendOtp}>
                    <i className='icon-mail-forward'/> Resend OTP</p>
                {disableResendOtp && <Timer timerExpires={this.timerElapsed}/>}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        otpDetails: get(state, 'resendOtp.otpDetails'),
        configResponse: get(state.headerDetails, 'configResponse'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            resendOtp,
        }, dispatch),
    }
}

ResendOtp.propTypes = {
    selectedIndex: PropTypes.number,
    mobileNumber: PropTypes.string,
    resendOtp: PropTypes.func,
    configResponse: PropTypes.object,
};

export default (connect(mapStateToProps, mapDispatchToProps)(ResendOtp))
