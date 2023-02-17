import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import get from "lodash/get";

import { hideFooter, hideHeader, hideMainLoader, showMainLoader, showMainLoaderImmediate } from "@src/action";
import { closePopup, openPopup } from '@common/Modal/action';
import BackgroundImage from "@assets/images/Subscription-Page-Background.png";
import PlaceholderForSubscriptionBackground from "@assets/images/imagesubscription.png";
import { fetchConfig } from "@components/Header/APIs/actions";

import { getOpelResponse, setSubscriptionPaymentMode } from "../APIs/action";
import { LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { getKey, setKey } from "@utils/storage";

import './style.scss';
import { getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action";
import { PAYMENT_METHOD } from "../constant";
import { callLogOut, isUserloggedIn } from "@utils/common";


class SubscriptionPaymentRedirect extends Component {

    componentDidMount = async () => {
        let { hideFooter, hideHeader, history } = this.props;
        hideFooter(true);
        hideHeader(true);
        this.props.setSubscriptionPaymentMode(PAYMENT_METHOD.PG);
        let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        let isSilentLogout = JSON.parse(getKey(LOCALSTORAGE.IS_SILENT_LOGOUT));
        if (sourceIsMSales || isSilentLogout) {
            window.history.pushState(null, "", window.location.href);
            window.onpopstate = () => {
                window.history.pushState(null, "", window.location.href);
            }
        }
    };

    componentWillUnmount = () => {
        let { hideFooter, hideHeader } = this.props;
        hideFooter(false);
        hideHeader(false);
    }

    render() {
        return (
            <React.Fragment>
                <div className="subscription-payment-background">
                    <img src={PlaceholderForSubscriptionBackground} alt="" />
                    <img src={BackgroundImage} alt=""
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PlaceholderForSubscriptionBackground;
                        }}
                    />
                </div>
                {/* <SubscriptionPaymentHandler paymentMethod={PAYMENT_METHOD.PG} /> */}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        opelResponse: get(state.subscriptionPaymentReducer, 'opelResponse'),
        paymentStatusFromPubnub: get(state.subscriptionPaymentReducer, 'paymentStatusFromPubnub'),
        configResponse: get(state.headerDetails, "configResponse.data.config"),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription'),
    };
};

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators(
        {
            hideFooter,
            hideHeader,
            showMainLoader,
            showMainLoaderImmediate,
            hideMainLoader,
            getOpelResponse,
            openPopup,
            closePopup,
            fetchConfig,
            getCurrentSubscriptionInfo,
            setSubscriptionPaymentMode,
        },
        dispatch,
    ),
});

SubscriptionPaymentRedirect.propTypes = {
    hideFooter: PropTypes.func,
    hideHeader: PropTypes.func,
    showMainLoaderImmediate: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    getOpelResponse: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    configResponse: PropTypes.object,
    opelResponse: PropTypes.object,
    history: PropTypes.object,
    fetchConfig: PropTypes.func,
    currentSubscription: PropTypes.object,
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SubscriptionPaymentRedirect),
);

