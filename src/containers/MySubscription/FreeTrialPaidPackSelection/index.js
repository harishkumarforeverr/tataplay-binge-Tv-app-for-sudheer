import React, {Component} from 'react';
import {connect} from "react-redux";
import get from "lodash/get";
import PropTypes from "prop-types";

import {cloudinaryCarousalUrl, safeNavigation} from "@utils/common";
import SubscriptionWebSmallHeader from "@containers/MySubscription/SubscriptionWebSmallHeader";
import Heading from "@common/Heading";
import Button from "@common/Buttons";
import {URL} from "@routeConstants";
import MIXPANEL from "@constants/mixpanel";
import {
    cancelResumeSubscription,
    checkDTHStatus,
    getSubscriptionSummaryBottomText,
} from "@containers/MySubscription/APIs/subscriptionCommon";
import {ACCOUNT_STATUS, CANCEL_RESUME_ACTION, FREE_TRIAL_CANCEL_BTN} from "@containers/BingeLogin/APIs/constants";

import {LOGO_DIMENSIONS} from '../constant';
import '../style.scss';
import './style.scss'
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@utils/constants";


class FreeTrialPaidPackSelection extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onSelectClick = () => {
        let {history} = this.props;

        safeNavigation(history, {
            pathname: `/${URL.PACK_SELECTION}`,
            search: `?source=${MIXPANEL.VALUE.MY_ACCOUNT}`,
        })
    }

    getCancelBtnText = () => {
        const {currentSubscription: {data}} = this.props;
        if(data.subscriptionInformationDTO.bingeAccountStatus.toUpperCase() === ACCOUNT_STATUS.ACTIVE) {
            return FREE_TRIAL_CANCEL_BTN.ACTIVE;
        } else {
            return FREE_TRIAL_CANCEL_BTN.EXPIRED;
        }
    }

    render() {
        const {currentSubscription: {data}, mobileBack, history, currentState} = this.props;
        let logo = {
            width: 71,
            height: 44,
        };
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let showCancelBlock = data?.cancelLink && !data?.cancelled, showModifyBlock = data?.modifyLink;
        return <div className="my-subscription form-container free-trial-paid-pack-container">
            <SubscriptionWebSmallHeader data={data} history={history} mobileBack={mobileBack} showProgressBar={false}/>
            <div>
                <Heading heading={data?.verbiage?.headerMessage}/>
                <div className="my-subscription-top">
                    <div className="my-subscription-header">
                        <div className="my-subscription-header-left">{data?.providers?.length} Apps</div>
                        <div className="my-subscription-header-right">{data?.verbiage?.subsTitle}</div>
                    </div>
                    <ul className="subscription-app-list">
                        {data?.providers && data.providers.map((items, index) =>
                            <img key={index}
                                 src={`${cloudinaryCarousalUrl('', '', logo.width, logo.height)}${items.iconUrl}`}
                                 alt="provider"/>,
                        )}
                    </ul>

                    {data.partnerDesc && <p className="partner-desc">{data.partnerDesc}</p>}

                    {/*<p className="subscription-availed">{getSubscriptionSummaryBottomText(data)}</p>*/}

                    {!userInfo?.dummyUser && showModifyBlock &&
                    <div className="blue-text" onClick={() => checkDTHStatus(data, history)}>
                        <span>
                            {data?.mobileUpgradable ? 'Upgrade' : 'Modify'}
                        </span>
                    </div>}
                </div>
                <p className="subscription-info">{data?.verbiage?.expiryMessage}</p>
            </div>

            {<div className={'select-plan'}>
                <p className="subscription-info">{data?.verbiage?.footerMessage}</p>
                {userInfo?.dummyUser && !data?.fdoOrderRaised &&
                <Button cName="btn primary-btn" bValue={data?.verbiage?.button} clickHandler={this.onSelectClick}/>}
                {!userInfo?.dummyUser && showCancelBlock &&
                <div className="blue-text cancel-link"
                     onClick={() => cancelResumeSubscription(currentState, CANCEL_RESUME_ACTION.CANCEL)}>
                    <a>{this.getCancelBtnText()}</a></div>}
            </div>}
        </div>
    }


}

FreeTrialPaidPackSelection.propTypes = {
    currentSubscription: PropTypes.object,
    data: PropTypes.object,
    history: PropTypes.object,
    mobileBack: PropTypes.func,
    currentState: PropTypes.object,
}

const mapStateToProps = (state) => {
    return {
        currentSubscription: get(state.packSelectionDetail, 'currentSubscription'),
    }
};

export default (connect(mapStateToProps)(FreeTrialPaidPackSelection));