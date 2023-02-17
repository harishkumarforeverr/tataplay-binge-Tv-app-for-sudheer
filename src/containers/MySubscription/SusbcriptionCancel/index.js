import React from 'react';
import PropTypes from 'prop-types';
import {CURRENT_SUBSCRIPTION} from "@containers/MySubscription/constant";
import Button from "@common/Buttons";
import {redirectToApp, isMobile} from "@utils/common";
import {cancelResumeSubscription} from "@containers/MySubscription/APIs/subscriptionCommon";
import {CANCEL_RESUME_ACTION} from "@containers/BingeLogin/APIs/constants";
import get from "lodash/get";

const SubscriptionCancel = (props) => {
    const {data, currentState, showCancelBlock, comboPack} = props;
    let footerVerbiage = get(data, 'verbiage.footerVerbiage.message', '');
    return (
        <div className={`cancel-block ${comboPack && 'combo-cancel-block'}`}>
            {
                showCancelBlock && <div onClick={(event) => event.preventDefault()}>
                <span className={`cancel-subscription-link ${isMobile.any() ? `for-mobile` : `for-web`}`}
                      onClick={() => cancelResumeSubscription(currentState, CANCEL_RESUME_ACTION.CANCEL)}>
                    {CURRENT_SUBSCRIPTION.CANCEL_SUBSCRIPTION}</span>
                </div>
            }
            <Button cName="btn primary-btn for-mobile" bValue="Start Watching"
                    clickHandler={() => redirectToApp()}/>
            {!comboPack && <p className="subscription-info">{footerVerbiage}</p>}
    {/*        {showCancelBlock && data.cancelled && data.fsTaken &&
            <p className="subscription-info for-web">{CURRENT_SUBSCRIPTION.CANCEL_FTV_COLLECTION}</p>}*/}
        </div>
    )
};

SubscriptionCancel.propTypes = {
    data: PropTypes.object,
    currentState: PropTypes.object,
    showCancelBlock: PropTypes.bool,
    comboPack: PropTypes.bool,
}

export default SubscriptionCancel;