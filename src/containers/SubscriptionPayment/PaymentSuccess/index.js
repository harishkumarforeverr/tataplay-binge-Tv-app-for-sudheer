import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { get, isEmpty } from "lodash";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { MODALS } from "@common/Modal/constants";
import Button from "@common/Buttons";
import { showConfetti } from "@utils/common";
import { METHOD_TYPE } from '@containers/SubscriptionPayment/APIs/constants.js';
import { openPopup, closePopup } from "@common/Modal/action";

import './style.scss';

class PaymentSuccess extends Component {

    componentDidMount = () => {
        let { openPopup, closePopup, paymentStatusVerbiage, onStartClick, showConfettiEffect } = this.props;
        let subscriptionChangeType = getKey(LOCALSTORAGE.SUBSCRIPTION_CHANGE_TYPE),
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        if (subscriptionChangeType === METHOD_TYPE.ADD_SUBSCRIPTION && showConfettiEffect) {
            showConfetti(3 * 1000);
        } else {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal error-state-modal plan-success-modal',
                headingMessage: get(paymentStatusVerbiage, 'header'),
                extraInstructions: get(paymentStatusVerbiage, 'footer'),// change for allignment of text according to figma
                instructions: get(paymentStatusVerbiage, 'message'),
                primaryButtonText: sourceIsMSales ? "" : 'Start Watching',
                primaryButtonAction: () => {
                    closePopup();
                    onStartClick();
                },
                hideCloseIcon: true,
                icon: true,
            })
        }
    }

    render() {
        let { paymentStatusVerbiage, onStartClick, showConfettiEffect } = this.props;
        let subscriptionChangeType = getKey(LOCALSTORAGE.SUBSCRIPTION_CHANGE_TYPE),
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        return subscriptionChangeType === METHOD_TYPE.ADD_SUBSCRIPTION && showConfettiEffect ?
            <div className='payment-successful-container'>
                <div className='payment-successful'>
                    <img alt='payment-successful' src={`../../assets/images/Success-tick.png`} />
                    <span className='payment-pri-text'>{get(paymentStatusVerbiage, 'header')}</span>
                    <span className='payment-sec-text'>{get(paymentStatusVerbiage, 'footer')}</span>
                    <span className='payment-ter-text'>{get(paymentStatusVerbiage, 'message')}</span>
                    {/* <span className='payment-sec-text'>{get(paymentStatusVerbiage, 'message')}</span>
                    <span className='payment-ter-text'>{get(paymentStatusVerbiage, 'footer')}</span> */}
                    {!sourceIsMSales && <Button
                        cName={`btn primary-btn`}
                        bType="button"
                        bValue='Start Watching'
                        clickHandler={() => onStartClick()}
                    />}
                </div>
            </div>
            : null
    }
}


const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(
            {
                closePopup,
                openPopup,
            },
            dispatch,
        ),
    };
};


PaymentSuccess.propTypes = {
    onStartClick: PropTypes.func,
    paymentStatusVerbiage: PropTypes.object,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func
};


export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(PaymentSuccess),
);
