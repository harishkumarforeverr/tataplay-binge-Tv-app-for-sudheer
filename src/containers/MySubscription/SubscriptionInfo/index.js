import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {CURRENT_SUBSCRIPTION, LOGO_DIMENSIONS} from "@containers/MySubscription/constant";
import Button from "@common/Buttons";
import {cloudinaryCarousalUrl} from "@utils/common";
import {ACCOUNT_STATUS, CANCEL_RESUME_ACTION} from "@containers/BingeLogin/APIs/constants";
import {
    cancelResumeSubscription,
    checkDTHStatus, getHeaderLeft, getHeaderRight,
    getSubscriptionSummaryBottomText,
} from "@containers/MySubscription/APIs/subscriptionCommon";
import {SUBSCRIPTION_SUMMARY} from "@containers/PackSelection/constant";
import {LOCALSTORAGE, PACK_TYPE} from "@constants";
import get from "lodash/get";
import {getKey} from "@utils/storage";
import SubscriptionInfoFDR from "@containers/MySubscription/SusbcriptionInfoFDR";

const getLogoDimensions = (comboPack, data) => {
    //Remove comboPack check for new paid pack designs in future:
    let dimensions = {
        width: LOGO_DIMENSIONS.width,
        height: LOGO_DIMENSIONS.height,
    };

    if (comboPack) {
        dimensions = {
            width: 70,
            height: 44,
        };
        if (data.providers.length <= 9) {
            dimensions = {
                width: 96,
                height: 60,
            };
        }
    }

    return dimensions;
}

const SubscriptionInfo = (props) => {
    const {
        history,
        data,
        expiredCheck,
        currentState,
        aboutYourSubscription = false,
        subscriptionSummary = false,
        packStatus,
        currentSubscription,
        showModifyBlock,
        showCancelledTag,
        comboPack = false,
    } = props;

    let subscriptionSummaryBottomText = getSubscriptionSummaryBottomText(props.data),
        bingeAccountStatus = get(currentState, 'props.currentSubscription.data.subscriptionInformationDTO.bingeAccountStatus'),
        userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
        fdrUserConditions = ((bingeAccountStatus === ACCOUNT_STATUS.ACTIVE && userInfo?.dummyUser) || data?.packType?.toLowerCase() === PACK_TYPE.FREE),
        showExpiryText = true, showResumeBtn, showModifyBtn, logoDimensions = getLogoDimensions(comboPack, data),
        footerVerbiage = get(data, 'verbiage.footerVerbiage.message', '');

    if (data.hasOwnProperty('migrated')) {
        showExpiryText = data.migrated;
    }

    if (data?.status?.toUpperCase() === ACCOUNT_STATUS.ACTIVE && data?.cancelled && data?.cancelLink) {
        showResumeBtn = true;
    } else if (showModifyBlock) {
        showModifyBtn = true;
    }

    /*
    Make following changes for new paid pack designs in future:
    Remove comboPack check from combo-pack-header block and from its class name as well
    Remove comboPack check from my-subscription top block class and app-count as well
    Remove header block beneath the cancelled tag block
    Remove the subscription-availed block beneath partner-desc
     */

    return (
        <Fragment>
            {fdrUserConditions ?
                <SubscriptionInfoFDR {...props}/>
                :
                <>
                    {
                        comboPack && <div className={`my-subscription-header ${comboPack && `combo-pack-header`}`}>
                            {getHeaderLeft(data, showExpiryText, currentSubscription, packStatus, bingeAccountStatus, subscriptionSummary, expiredCheck)}
                            {getHeaderRight(data)}
                        </div>
                    }
                    <div
                        className={`my-subscription-top ${comboPack && `paid-pack ${data.providers.length <= 9 && 'lower-pack'}`}`}>
                        {
                            comboPack && <div className="app-count">{data?.verbiage?.appCount}</div>
                        }
                        {!subscriptionSummary && !comboPack && showCancelledTag() &&
                        <div className="cancelled"><span>Cancelled </span></div>}
                        {
                            !comboPack && <div className="my-subscription-header">
                                {getHeaderLeft(data, showExpiryText, currentSubscription, packStatus, bingeAccountStatus, subscriptionSummary, expiredCheck)}
                                {getHeaderRight(data)}
                            </div>
                        }
                        <ul className="subscription-app-list">
                            {data.providers && data.providers.map((items, index) =>
                                <img key={index}
                                     src={`${cloudinaryCarousalUrl('', '', logoDimensions.width, logoDimensions.height)}${items.iconUrl}`}
                                     alt="provider"/>,
                            )}
                        </ul>
                        <p className="partner-desc">{data.partnerDesc}</p>
                        {
                            !comboPack &&
                            <>
                                {!subscriptionSummary &&
                                <p className="subscription-availed">{subscriptionSummaryBottomText}</p>}
                                {!fdrUserConditions && data?.fsEligibility && subscriptionSummary &&
                                <p className="subscription-availed">{SUBSCRIPTION_SUMMARY.AMAZON_ELIGIBLE}</p>}
                            </>
                        }
                        {
                            !subscriptionSummary && (showModifyBtn || showResumeBtn) &&
                            <Button cName={`btn primary-btn ${aboutYourSubscription ? 'modify-resume-link' : ''}`}
                                    bValue={`${showResumeBtn ? CURRENT_SUBSCRIPTION.RESUME_SUBSCRIPTION :
                                        (showModifyBtn && CURRENT_SUBSCRIPTION.MODIFY_SUBSCRIPTION)}`}
                                    clickHandler={() => {
                                        if (showResumeBtn) {
                                            cancelResumeSubscription(currentState, CANCEL_RESUME_ACTION.RESUME);
                                        } else if (showModifyBtn) {
                                            checkDTHStatus(data, history)
                                        }
                                    }}/>
                        }
                    </div>
                    {
                        comboPack &&
                        <>
                            <div className='combo-desc-block'>
                                {!subscriptionSummary &&
                                <p className="subscription-availed">{subscriptionSummaryBottomText}</p>}
                                {!fdrUserConditions && data?.fsEligibility && subscriptionSummary &&
                                <p className="subscription-availed">{SUBSCRIPTION_SUMMARY.AMAZON_ELIGIBLE}</p>}
                            </div>
                            <div className="combo-separator">+</div>
                            <div className="combo-block">
                                <div className="combo-channel-block">
                                    <div className="combo-ott-channels">{data?.comboInfo?.ottChannels}</div>
                                    <div className="combo-channels">
                                        {
                                            data?.comboInfo?.channels.map((items, index) => {
                                                return <span className='channel-info' key={index}>
                                                    <span className={`type ${items.name === 'HD' ? 'hd-channel' : 'sd-channel'}`}>{items.name}</span>
                                                    <span className='count'>{items.count}</span>
                                                </span>
                                            })
                                        }
                                    </div>
                                </div>
                                <div className='combo-text'>
                                    {data?.comboInfo?.verbiage}
                                </div>
                            </div>
                            {comboPack && !aboutYourSubscription && <p className="subscription-info">{footerVerbiage}</p>}
                        </>
                    }
                    {/*{ //Uncomment for new paid pack ui
                        !comboPack &&
                        <>
                            {!subscriptionSummary &&
                            <p className="subscription-availed">{subscriptionSummaryBottomText}</p>}
                            {!fdrUserConditions && data?.fsEligibility && subscriptionSummary &&
                            <p className="subscription-availed">{SUBSCRIPTION_SUMMARY.AMAZON_ELIGIBLE}</p>}
                        </>
                    }*/}
                </>
            }

        </Fragment>
    )
};

SubscriptionInfo.propTypes = {
    history: PropTypes.object,
    data: PropTypes.object,
    expiredCheck: PropTypes.func,
    logo: PropTypes.object,
    currentState: PropTypes.object,
    aboutYourSubscription: PropTypes.bool,
    subscriptionSummary: PropTypes.bool,
    packStatus: PropTypes.string,
    currentSubscription: PropTypes.bool,
    showModifyBlock: PropTypes.bool,
    showCancelledTag: PropTypes.func,
    showCancelBlock: PropTypes.bool,
    comboPack: PropTypes.bool,
}

export default SubscriptionInfo;