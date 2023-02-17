import React, { Component } from "react";
import { connect } from "react-redux";
import queryString from 'querystring';
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { hideFooter, hideHeader } from "@src/action";

import './style.scss';
import { getKey } from "@utils/storage";
import { LOCALSTORAGE } from "@constants";
import { PAYMENT } from "@containers/Payment/constant";
import { setPaymentStatus } from "@containers/Payment/APIs/action";
import Button from "@common/Buttons";
import { getIconSuccessTickUpd, getLayeredIcon, isMobile} from "@utils/common";
import { URL } from "@routeConstants";
import { withRouter } from "react-router";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";

class Payment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            heading: '',
            message: '',
            isSuccess: false,
        };
    }


    async componentDidMount() {
        const { hideHeader, hideFooter, setPaymentStatus } = this.props;
        hideHeader(true);
        hideFooter(true);

        const values = queryString.parse(this.props.location.search);
        const status = values && values['?status'];
        const txn = values && values['txn'];

        let fsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;
        if (fsJourney) {
            if (status === PAYMENT.SUCCESS) {
                setTimeout(() => this.setState({
                    heading: `Payment Successful`,
                    message: 'Your transaction is successful',
                }), 0);
            } else {
                setTimeout(() => this.setState({
                    heading: '',
                    message: 'Your transaction has failed',
                }), 0);
            }
            setPaymentStatus(status, txn);
        } else {
            if (status === PAYMENT.SUCCESS) {
                this.trackRechargeSuccessEvents();
                setTimeout(() => this.setState({
                    heading: `Payment Successful`,
                    message: isMobile.any() ? 'Thank you for subscribing. Please download the app to start watching.' :
                        'Proceed to enjoy your favourite Movies and TV Shows on Tata Play Binge',
                    isSuccess: true,
                }), 0);
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.TS_RECHARGE_SUCCESS);
            } else {
                this.trackRechargeFailedEvents();
                setTimeout(() => this.setState({
                    heading: 'Payment Failed',
                    message: ' ',
                    isSuccess: false,
                }), 0);
            }
        }
    }

    componentWillUnmount() {
        const { hideHeader, hideFooter } = this.props;
        hideHeader(false);
        hideFooter(false);
    }

    trackRechargeFailedEvents = () => {
        moengageConfig.trackEvent(MOENGAGE.EVENT.RECHARGE_FAILED, {
            [`${MOENGAGE.PARAMETER.REASON}`]: MOENGAGE.VALUE.FAILED,
        });
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_FAILED, {
            [APPSFLYER.PARAMETER.REASON]: APPSFLYER.VALUE.REASON,
        });
    };

    trackRechargeSuccessEvents = () =>{
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_SUCCESS, {
            [APPSFLYER.PARAMETER.SOURCE]: APPSFLYER.VALUE.HOME,
        });
    }

    render() {
        let { heading, message, isSuccess } = this.state;
        return (
            <div className='payment-block'>
               <div className='payment-description-block'>
                <div
                        className={`icon-block ${!isSuccess && 'fail'}`}>{isSuccess ? getIconSuccessTickUpd() : getLayeredIcon('icon-alert-upd')}</div>
                    {heading && <h1>{heading}</h1>}
                    {message && <p>{this.state.message}</p>}
                    {<Button cName='btn primary-btn' bValue={isSuccess ? 'Proceed' : 'Ok'}
                        clickHandler={() => {
                            this.props.history.push(`${URL.HOME}`);
                        }} />}
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators({
        hideHeader,
        hideFooter,
        setPaymentStatus,
    }, dispatch),
})

Payment.propTypes = {
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    location: PropTypes.object,
    setPaymentStatus: Payment.func,
    history: PropTypes.object,
};

export default withRouter(connect(null, mapDispatchToProps)(Payment));
