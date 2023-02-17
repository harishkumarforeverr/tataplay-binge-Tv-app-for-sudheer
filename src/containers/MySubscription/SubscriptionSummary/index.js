import React from 'react';
import PropTypes from "prop-types";
import SubscriptionWebSmallHeader from "@containers/MySubscription/SubscriptionWebSmallHeader";
import Heading from "@common/Heading";
import SubscriptionInfo from "@containers/MySubscription/SubscriptionInfo";
import '../AboutYourSubscription/style.scss'
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";

const SubscriptionSummary = (props) => {
    const {
        data,
        history,
        expiredCheck,
        currentState,
        subscriptionSummaryCases,
        packStatus,
        mobileBack,
        activeStep,
        showCancelledTag,
        showResumeCancelButton,
    } = props;

    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let fdrUserConditions = ((userInfo?.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE) && userInfo?.dummyUser);

    return (
        <div className='my-subscription form-container about-subscription-block'>
            <SubscriptionWebSmallHeader data={data} history={history} mobileBack={mobileBack}
                                         activeStep={activeStep} showProgressBar={!fdrUserConditions}/>
            <div className={'for-web back-block'} onClick={mobileBack}>
                <i className={'icon-back-2'}/>
            </div>
            <Heading heading='Subscription Summary'/>
            <div className='about-subscription'>
                <div className='about-subscription-left'>
                    <SubscriptionInfo history={history} data={data} expiredCheck={expiredCheck} showResumeCancelButton={showResumeCancelButton}
                                      currentState={currentState} subscriptionSummary={true}
                                      showCancelBlock={false} packStatus={packStatus} showModifyBlock={true} showCancelledTag={showCancelledTag}/>
                </div>
                <div className='about-subscription-right'>
                    {subscriptionSummaryCases()}
                </div>
            </div>
        </div>
    );
};

SubscriptionSummary.propTypes = {
    data: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    expiredCheck: PropTypes.func,
    currentState: PropTypes.object,
    subscriptionSummaryCases: PropTypes.func,
    packStatus: PropTypes.string,
    mobileBack: PropTypes.func,
    activeStep: PropTypes.number,
    showCancelledTag: PropTypes.func,
    showResumeCancelButton: PropTypes.func,
}

export default SubscriptionSummary;