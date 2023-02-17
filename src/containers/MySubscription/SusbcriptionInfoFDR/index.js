import React from "react";
import {cloudinaryCarousalUrl} from "@utils/common";
import {LOGO_DIMENSIONS} from "@containers/MySubscription/constant";
import {
    checkDTHStatus,
    getHeaderLeft,
    getHeaderRight,
} from "@containers/MySubscription/APIs/subscriptionCommon";
import {LOCALSTORAGE, PACK_TYPE} from "@constants";
import queryString from "querystring";
import PropTypes from "prop-types";
import get from "lodash/get";
import {getKey} from "@utils/storage";

const SubscriptionInfoFDR = (props) => {
    const {
        history,
        data,
        expiredCheck,
        currentState,
        subscriptionSummary = false,
        packStatus,
        currentSubscription,
        showModifyBlock,
    } = props;

    let search = queryString.parse(history.location.search),
        contentRecharge = search['contentRecharge'],
        userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
        bingeAccountStatus = get(currentState, 'props.currentSubscription.data.subscriptionInformationDTO.bingeAccountStatus'),
        showExpiryText = true;

    if (data.hasOwnProperty('migrated')) {
        showExpiryText = data.migrated;
    }

    return <>
        <div className="my-subscription-top">
            <div className="my-subscription-header">
                {contentRecharge === 'true' ?
                    <div className="my-subscription-header-left">
                        {data?.providers && `${data.providers.length} Apps`}
                    </div> :
                    <React.Fragment>
                        {getHeaderLeft(data, showExpiryText, currentSubscription, packStatus, bingeAccountStatus, subscriptionSummary, expiredCheck)}
                    </React.Fragment>
                }
                {contentRecharge === 'true' ?
                    <div className="my-subscription-header-right">{data?.verbiage?.subsTitle}</div> :
                    getHeaderRight(data)
                }

            </div>
            <ul className="subscription-app-list">
                {data.providers && data.providers.map((items, index) =>
                    <img key={index}
                         src={`${cloudinaryCarousalUrl('', '', LOGO_DIMENSIONS.width, LOGO_DIMENSIONS.height)}${items.iconUrl}`}
                         alt="provider"/>,
                )}
            </ul>
            <p className="partner-desc">{data.partnerDesc}</p>

            {!userInfo?.dummyUser && showModifyBlock &&
            <div className="blue-text" onClick={() => checkDTHStatus(data, history)}>
                            <span>
                                {data?.mobileUpgradable ? 'Upgrade' : 'Modify'}
                            </span>
            </div>}
        </div>
        {
            data?.packType.toLowerCase() === PACK_TYPE.FREE && !userInfo?.dummyUser &&
            <div className={'free-trial-info'}>
                <p className="subscription-info">{data?.verbiage?.expiryMessage}</p>
            </div>
        }
    </>
};

SubscriptionInfoFDR.propTypes = {
    history: PropTypes.object,
    data: PropTypes.object,
    expiredCheck: PropTypes.func,
    currentState: PropTypes.object,
    subscriptionSummary: PropTypes.bool,
    packStatus: PropTypes.string,
    currentSubscription: PropTypes.bool,
    showModifyBlock: PropTypes.bool,
};

export default SubscriptionInfoFDR;