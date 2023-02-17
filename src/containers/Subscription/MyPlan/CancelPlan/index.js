import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { get } from "lodash";

import { cancelSubscription } from '../../APIs/action';
import { getAnalyticsData } from '../../APIs/subscriptionCommon';
import { openPopup, closePopup } from "@common/Modal/action";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import Button from "@common/Buttons";
import './style.scss'

class CancelPlan extends Component {

    handleClose = () => {
        let { closePopup } = this.props;
        closePopup()
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MY_PLAN_CANCEL_PLAN_LATER, getAnalyticsData(MIXPANEL));
    }

    render() {
        let {
            cancelExpiryVerbiage,
            headerMessage,
            cancelFooterMessage,
            closePopup,
            handleCancelPlan
        } = this.props;

        return (
            <div className="container">
                <p className="header-msg" dangerouslySetInnerHTML={{ __html: headerMessage }} />
                <p className="footer-msg">{cancelFooterMessage}</p>
                <Button
                    bValue={"Maybe Later"}
                    cName="btn primary-btn btn-wrapper-later"
                    clickHandler={this.handleClose}
                />
                <Button
                    bValue={"Proceed"}
                    cName="btn primary-btn btn-wrapper-proceed"
                    clickHandler={handleCancelPlan}
                />
                <p className="expire-msg">{cancelExpiryVerbiage}</p>
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        cancelSubscriptionRes: get(state.subscriptionDetails, 'cancelSubscriptionRes'),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                cancelSubscription,
                closePopup,
                openPopup,
            },
            dispatch,
        ),
    };
}

CancelPlan.propTypes = {
    cancelSubscription: PropTypes.func,
    closePopup: PropTypes.func,
    openPopup: PropTypes.func,
    handleCancelSuccess: PropTypes.func,
    currentSubscription: PropTypes.object,
    cancelExpiryVerbiage: PropTypes.string,
    headerMessage: PropTypes.string,
    cancelFooterMessage: PropTypes.string,
    cancelSubscriptionRes: PropTypes.object,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(CancelPlan);