import React from 'react';
import PropTypes from "prop-types";
import SubscriptionWebSmallHeader from "@containers/MySubscription/SubscriptionWebSmallHeader";
import Heading from "@common/Heading";
import SubscriptionInfo from "@containers/MySubscription/SubscriptionInfo";
import './style.scss';
import {LOCALSTORAGE} from "@constants";
import {CURRENT_SUBSCRIPTION} from "@containers/MySubscription/constant";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import {getKey} from "@utils/storage";

const AboutYourSubscription = (props) => {
    const {
        data,
        history,
        expiredCheck,
        currentState,
        subscriptionSummaryCases,
        mobileBack,
        activeStep,
        showCancelledTag,
        showResumeCancelButton,
    } = props;
    let showCancelBlock = data?.cancelLink && !data?.cancelled, showModifyBlock = data?.modifyLink;
    let bingeStatus = data?.subscriptionInformationDTO?.bingeAccountStatus?.toUpperCase();
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let fdrUserConditions = ((bingeStatus === ACCOUNT_STATUS.ACTIVE) && userInfo?.dummyUser);
    let comboPack = data?.isCombo;

    /*
    Make following changes for new paid pack designs in future:
    showProgressBar as false
    Remove Combo check from sub-header
    Apply combo-subscription class as generic i.e. without comboPack check
     */

    return (
        <div className={`my-subscription form-container about-subscription-block ${comboPack && `combo-subscription`}`}>
            <SubscriptionWebSmallHeader data={data} history={history} mobileBack={mobileBack} activeStep={activeStep}
            showProgressBar={comboPack ? false : !fdrUserConditions}/>
            <div className={'for-web back-block'} onClick={mobileBack}>
                <i className={'icon-back-2'}/>
            </div>
            <Heading heading={comboPack ? 'About Your Subscription' : 'My Subscription'}/>
            <div className='about-subscription'>
                <div className='about-subscription-left'>
                    <div className='de-active-subscription'>
                        {(bingeStatus === ACCOUNT_STATUS.DEACTIVATED || bingeStatus === ACCOUNT_STATUS.DEACTIVE)
                        && CURRENT_SUBSCRIPTION.NO_SUBSCRIPTION_DEACTIVE_USER}</div>
                    {
                        comboPack && bingeStatus === ACCOUNT_STATUS.ACTIVE &&
                        <div className='sub-header'>
                            {data?.verbiage?.subsTitle}
                        </div>
                    }
                    <SubscriptionInfo history={history} data={data} expiredCheck={expiredCheck} showResumeCancelButton={showResumeCancelButton}
                                      showModifyBlock={showModifyBlock} showCancelledTag={showCancelledTag} comboPack={comboPack}
                                      currentState={currentState} aboutYourSubscription={true} showCancelBlock={showCancelBlock}
                                      currentSubscription={true}/>
                    {/*Add on pack case*/}
                    {/*<PrimePack data={data}/>*/}
                </div>
                <div className='about-subscription-right'>
                    {subscriptionSummaryCases()}
                </div>
            </div>
        </div>
    );
};

AboutYourSubscription.propTypes = {
    data: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    expiredCheck: PropTypes.func,
    currentState: PropTypes.object,
    subscriptionSummaryCases: PropTypes.func,
    mobileBack: PropTypes.func,
    activeStep: PropTypes.number,
    showCancelledTag: PropTypes.func,
    showResumeCancelButton: PropTypes.func,
}

export default AboutYourSubscription;