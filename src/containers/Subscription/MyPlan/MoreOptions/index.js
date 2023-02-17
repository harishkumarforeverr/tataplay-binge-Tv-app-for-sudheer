import React, { Component } from 'react'
import "../style.scss";

import MyPlanButton from '../MyPlanButton'
import PropTypes from "prop-types";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";

export default class MoreOptions extends Component {
    handlePlan = () => {
        this.props.handleChangePlanNavigate()
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MY_PLAN_RENEW_CHANGE_PLAN, this.props.getAnalyticsData(MIXPANEL));
    }

    handleTenureButton = () => {
        this.props.handleTenure()
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MY_PLAN_RENEW_CHANGE_TENURE, this.props.getAnalyticsData(MIXPANEL));

    }
    render() {
        const {
            tenureMessage,
            planMessage,
            closePopup,
            planIcon,
            tenureIcon,
            handleChangePlanNavigate,
            handleTenure,
            showPlanMessage,
            showTenureMessage
        } = this.props;
        return (
            <React.Fragment>
                {showPlanMessage && <MyPlanButton
                    message={planMessage}
                    icon={planIcon}
                    onClick={this.handlePlan}
                />}
                {showTenureMessage && <MyPlanButton
                    message={tenureMessage}
                    icon={tenureIcon}
                    onClick={this.handleTenureButton} />}

                <p className="not-now" onClick={closePopup}>
                    Not now
                </p>
            </React.Fragment>
        );
    }
};

MoreOptions.propTypes = {
    tenureMessage: PropTypes.string,
    planMessage: PropTypes.string,
    closePopup: PropTypes.func,
    planIcon: PropTypes.string,
    tenureIcon: PropTypes.string,
    handleChangePlanNavigate: PropTypes.func,
    handleTenure: PropTypes.func,
};
