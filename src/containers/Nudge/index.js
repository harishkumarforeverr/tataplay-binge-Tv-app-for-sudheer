import React, {Component} from "react";
import {withRouter} from 'react-router';
import PropTypes from "prop-types";
import {bindActionCreators, compose} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import isEmpty from 'lodash/isEmpty';
import {LOCALSTORAGE, SECTION_SOURCE} from "@constants";
import Button from "@common/Buttons";
import {checkUserDTHStatus} from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import {getKey} from "@utils/storage";

import './style.scss';
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import {PACK_TYPE} from "@constants";

class Nudge extends Component{
    constructor(props) {
        super(props);
        this.state = {}
    }

    handleButtonClick = (nudgeType) => {
        let {currentSubscription, history, nudgeDataFromCurrentSubscription} = this.props;
        let data = currentSubscription?.data;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.NUDGE_CLICK,{
            [`${MIXPANEL.PARAMETER.DTH_STATUS}`]: JSON.parse(getKey(LOCALSTORAGE.USER_INFO)).dthStatus,
            [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.HOMESCREEN,
            [`${MIXPANEL.PARAMETER.COUNTER_VALUE}`]: nudgeDataFromCurrentSubscription?.availableDays,
            [`${MIXPANEL.PARAMETER.DISPLAYED_ON_DAY}`]: (7 - (nudgeDataFromCurrentSubscription?.availableDays)),
            [`${MIXPANEL.PARAMETER.FREE_TRIAL_AVAILED}`]: userInfo && userInfo.freeTrialAvailed ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
        })
        moengageConfig.trackEvent(MOENGAGE.EVENT.NUDGE_CLICK,{
            [`${MOENGAGE.PARAMETER.DTH_STATUS}`]: JSON.parse(getKey(LOCALSTORAGE.USER_INFO)).dthStatus,
            [`${MOENGAGE.PARAMETER.SOURCE}`]: MOENGAGE.VALUE.HOMESCREEN,
            [`${MOENGAGE.PARAMETER.COUNTER_VALUE}`]: nudgeDataFromCurrentSubscription?.availableDays,
            [`${MOENGAGE.PARAMETER.DISPLAYED_ON_DAY}`]: (7 - (nudgeDataFromCurrentSubscription?.availableDays)),
            [`${MOENGAGE.PARAMETER.FREE_TRIAL_AVAILED}`]: userInfo && userInfo.freeTrialAvailed ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
        })

        checkUserDTHStatus(data, history, false, false, nudgeType, false );

    };

    checkNudgeVisibility = () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let {currentSubscription, nudgeDataFromCurrentSubscription} = this.props;

        return (((!currentSubscription?.fdoOrderRaised && userInfo?.dummyUser) ||
               (currentSubscription?.mobileUpgradable && currentSubscription?.packType?.toLowerCase() === PACK_TYPE.FREE)) &&
               userInfo?.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE) &&
               (((nudgeDataFromCurrentSubscription?.totalFreeTrialDuration - nudgeDataFromCurrentSubscription?.availableDays) + 1) >= nudgeDataFromCurrentSubscription?.startDay);
    };

    render(){
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let { itemDetail, currentSubscription, nudgeDataFromCurrentSubscription, nudgeDataFromConfigResponse } = this.props;
        let daysLeft = nudgeDataFromCurrentSubscription?.availableDays;
        let daysConsumed = nudgeDataFromCurrentSubscription?.totalFreeTrialDuration - daysLeft;
        // let checkNudgeVisibility = this.checkNudgeVisibility();
        let checkNudgeVisibility = false;
        return (
            <div className={"nudge-container"}>
                {isEmpty(currentSubscription) && !userInfo?.freeTrialAvailed && itemDetail &&
                itemDetail.sectionSource === SECTION_SOURCE.FREE_TRIAL ?
                (
                    <div className={"free-trial-nudge"}>
                        <p>{nudgeDataFromConfigResponse?.desc}</p>
                        <Button cName="btn primary-btn" bType="button"
                            bValue={nudgeDataFromConfigResponse?.button}
                            clickHandler={() => this.handleButtonClick(itemDetail.sectionSource)}
                        />
                    </div>
                ) : (
                    <React.Fragment>
                        {checkNudgeVisibility ? (
                            <div className={"paid-trial-nudge"}>
                                {/* daysComsumed = 1 ; transform : rotate(51.4deg = 360/7) */}
                                {/* daysConsumed = 2 ; transform : rotate(102.8deg = (360/7) * 2) */}
                                {/* over50 class is used when we want progress bar in more than 50% circle */}
                                <div
                                    // className= {`p${daysConsumed} ${daysConsumed < 4 ? 'progress-circle' : 'progress-circle over50'}`
                                    className={`${daysConsumed < 4 ? "progress-circle" : "progress-circle over50"}`}>
                                    <span className="days-left">{daysLeft}</span>
                                    <span className="days">days</span>
                                    <div className="left-half-clipper">
                                        <div className="first50-bar"/>
                                        <div className="value-bar"
                                            style={{ transform: `rotate(calc((360deg / 7) * ${daysConsumed}))` }}/>
                                    </div>
                                </div>
                                <div className="nudge-desc">
                                    <p>{nudgeDataFromCurrentSubscription?.title}</p>
                                    <p>{nudgeDataFromCurrentSubscription?.desc}</p>
                                </div>
                                    <p  className="select-btn"
                                        dangerouslySetInnerHTML={{
                                            __html: nudgeDataFromCurrentSubscription?.button}}
                                        onClick={() => this.handleButtonClick(itemDetail.sectionSource)}
                                        />
                            </div>
                        ) : null}
                    </React.Fragment>
                )}
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    nudgeDataFromCurrentSubscription: get(state.packSelectionDetail, 'currentSubscription.data.nudges.paidPackSelection'),
    nudgeDataFromConfigResponse: get(state.headerDetails, 'configResponse.data.app.nudges.android.freeTrial'),
})

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({}, dispatch),
    }
}

Nudge.propTypes = {
    currentSubscription : PropTypes.object,
    itemDetail : PropTypes.object,
    nudgeDataFromConfigResponse : PropTypes.object,
    nudgeDataFromCurrentSubscription : PropTypes.object,
    history : PropTypes.object,
}

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Nudge);