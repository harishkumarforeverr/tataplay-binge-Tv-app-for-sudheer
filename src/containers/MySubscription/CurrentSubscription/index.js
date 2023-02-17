import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import SubscriptionWebSmallHeader from "@containers/MySubscription/SubscriptionWebSmallHeader";
import Heading from "@common/Heading";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import NoSubscription from "@containers/MySubscription/NoSubscription";
import SubscriptionInfo from "@containers/MySubscription/SubscriptionInfo";
import SubscriptionCancel from "@containers/MySubscription/SusbcriptionCancel";
import {queryStringToObject} from "@utils/common";
import {LOCALSTORAGE, PACK_TYPE} from "@constants";
import FreeTrialPaidPackSelection from '../FreeTrialPaidPackSelection'
import {getKey} from "@utils/storage";

const CurrentSubscription = (props) => {
    const {data, history, currentState, mobileBack} = props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let dummyUserCondition = ((data?.packType?.toLowerCase() === PACK_TYPE.FREE) && userInfo?.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE);
    return (
        dummyUserCondition ?
            <FreeTrialPaidPackSelection history={history} mobileBack={mobileBack} currentState={currentState}/> :
            <PaidPack {...props}/>

    );
};

const PaidPack = (props) => {
    const {data, history, location, expiredCheck, currentState, mobileBack, showCancelledTag, choosePlan} = props;
    let search = queryStringToObject(location.search);
    let showCancelBlock = data?.cancelLink && !data?.cancelled, showModifyBlock = data?.modifyLink;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let comboPack = data?.isCombo;

    /*
    Make following changes for new paid pack designs in future
    showProgressBar as false
    <Heading heading={search?.source === 'Login' ? 'Welcome' : 'My Subscription'}/>
    Remove Combo check from sub-header
    Apply combo-subscription class as generic i.e. without comboPack check
     */
    return <div className={`my-subscription form-container ${comboPack && `combo-subscription`}`}>
        <SubscriptionWebSmallHeader data={data} history={history} mobileBack={mobileBack} activeStep={3}
                                    showProgressBar={comboPack ? false : !userInfo?.dummyUser}/>
        <Heading heading={search?.source === 'Login' ? (comboPack ? 'Welcome' : 'My Subscription') : 'My Subscription'}/>
        {!data || data.status === ACCOUNT_STATUS.WRITTEN_OFF ? <NoSubscription choosePlan={choosePlan}/>
            :
            <Fragment>
                {
                    comboPack &&
                    <div className='sub-header'>
                        {data?.verbiage?.subsTitle}
                    </div>
                }
                <SubscriptionInfo history={history} data={data} expiredCheck={expiredCheck}
                                  showCancelBlock={showCancelBlock} showModifyBlock={showModifyBlock} comboPack={comboPack}
                                  showCancelledTag={showCancelledTag} currentState={currentState} currentSubscription={true}/>
                {/*Add on pack case*/}
                {/*<PrimePack data={data}/>*/}
                <SubscriptionCancel data={data} currentState={currentState}
                                    showCancelBlock={showCancelBlock} comboPack={comboPack}/>
            </Fragment>}
    </div>
};

CurrentSubscription.propTypes = {
    data: PropTypes.object,
    history: PropTypes.object,
    currentState: PropTypes.object,
    mobileBack: PropTypes.func,
};

PaidPack.propTypes = {
    data: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    expiredCheck: PropTypes.func,
    currentState: PropTypes.object,
    mobileBack: PropTypes.func,
    showCancelledTag: PropTypes.func,
    choosePlan: PropTypes.func,
};

export default CurrentSubscription;