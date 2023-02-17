import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import './style.scss';
import { cloudinaryCarousalUrl } from '@utils/common';

class PrimePack extends Component {

    render() {
        let { primePackDetails, handleBingeCancelPlan, showAddOnCancel, cancellationOption } = this.props;

        return (
            <div className="amazon-container">
                <div className="add-on">
                    <div className="hr"></div>
                    <p>My Add-on</p>
                    <div className="hr"></div>
                </div>
                <div className="amazon-subscription">
                    <div className="amazon-subscription-wrapper">
                        <div className="amazon-validity">
                            <div>
                                <img
                                    src={`${cloudinaryCarousalUrl('', '', 160, 160)}${get(primePackDetails, 'imageUrl')}`}
                                    //src={get(primePackDetails, 'imageUrl')}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                            <div>
                                <p>{get(primePackDetails, 'title')}</p>
                                <p>{get(primePackDetails, 'subscriptionExpiryMessage')}</p>
                            </div>
                        </div>
                        <div className="amazon-price">&#8377;{`${get(primePackDetails, 'packAmount')}/month`}</div>
                    </div>
                    <p className="amazon-prime-footer">Amazon Prime through Tata Play</p>
                    {get(cancellationOption, "primeCancelExpiryVerbiage") && (
                        <div>
                            <hr className="border-line" />
                            <p className='error-msg'>
                                {get(cancellationOption, "primeCancelExpiryVerbiage")}
                            </p>
                        </div>
                    )}

                    {showAddOnCancel() &&
                        <p className="other-option" onClick={() => handleBingeCancelPlan(true, false)}>
                            Cancel Add-on
                        </p>
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription'),
        planOption: get(state.subscriptionDetails, "currentSubscription.data.planOption"),
        primePackDetails: get(state.subscriptionDetails, "currentSubscription.data.primePackDetails"),
        revokeSubscriptionRes: get(state.subscriptionDetails, 'revokeSubscriptionRes'),
        cancellationOption: get(state.subscriptionDetails, "currentSubscription.data.planOption.cancellationOption"),
    }
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({}, dispatch),
    }
}

PrimePack.propTypes = {
    packListingData: PropTypes.array,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(PrimePack);