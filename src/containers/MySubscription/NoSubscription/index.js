import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {CURRENT_SUBSCRIPTION} from "@containers/MySubscription/constant";
import Button from "@common/Buttons";
import {redirectToApp} from "@utils/common";

const NoSubscription = (props) => {
    const {choosePlan} = props;
    return (
        <Fragment>
            <div className='no-subscription'>
                <p className='no-subscription-para'>{CURRENT_SUBSCRIPTION.NO_SUBSCRIPTION}</p>
                <div className='proceed-block'>
                    <Button cName='btn primary-btn' bValue={'Select Subscription'}
                            clickHandler={() => choosePlan()}/>
                    <div className='blue-text for-mobile'>
                        <a onClick={() => redirectToApp()}>Start Watching</a>
                    </div>
                </div>
            </div>
        </Fragment>
    )
};

NoSubscription.propTypes = {
    choosePlan: PropTypes.func,
}

export default NoSubscription;