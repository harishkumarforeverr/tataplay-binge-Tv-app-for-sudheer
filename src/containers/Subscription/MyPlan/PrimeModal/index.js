import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import get from "lodash/get";
import PropTypes from "prop-types";

import Button from '@common/Buttons';
import Checkbox from "@common/Checkbox";
import { openPopup, closePopup } from "@common/Modal/action";

import CrownImage from "@assets/images/crown-top-10.png";

import { cancelSubscription } from '../../APIs/action';
import './style.scss'
export class PrimeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isCurrentSubscription: false,
            isPrimeSubscription: false,
        };
    }

    handleNotNow = () => {
        const { closePopup } = this.props;
        closePopup()
    }

    handleCheckBox = (e, containerName) => {
        let { currentSubscription } = this.props;
        let primeAutoSelect = get(currentSubscription, 'primeAutoSelect');
        if (primeAutoSelect && !containerName) {
            this.setState({
                [e.target.name]: e.target.checked, isPrimeSubscription: e.target.checked
            });
        }
        else {
            this.setState({
                [e.target.name]: e.target.checked,
            });
        }
    }

    primeButtons = (checkboxValue, containerName, img, packName, Amount) => {
        let { isPrimeSubscription, isCurrentSubscription } = this.state;
        let { currentSubscription } = this.props;
        let primeAutoSelect = get(currentSubscription, 'primeAutoSelect');
        return (
            <React.Fragment>
                <div className={`button-container ${containerName && 'prime-bottom'} ${primeAutoSelect && containerName && isCurrentSubscription ? "disabled" : ""}`}>
                    <div className='info-wrapper'>
                        <div className='img-wrapper'>
                            <img src={img} />
                        </div>
                        <p className={!containerName && get(currentSubscription, "highlightedPack") && "vip-text"}>{packName}</p>
                    </div>
                    <div className='price-wrapper'>
                        <p> &#8377;</p>
                        <Checkbox
                            name={checkboxValue}
                            value={Amount}
                            leftLabelText={containerName ? `${Amount}/month` : Amount}
                            checked={this.state[checkboxValue]}
                            chandler={(e) => this.handleCheckBox(e, containerName)}
                        />

                    </div>
                </div>

            </React.Fragment>
        );
    }

    render() {
        let { isCurrentSubscription, isPrimeSubscription } = this.state;
        let { primePackDetails, currentSubscription, handleCancelPlan } = this.props;
        let bingeCancelExpiryVerbiage = currentSubscription?.planOption?.cancellationOption?.bingeCancelExpiryVerbiage
        return (
            <div className='amazon-modal-container'>
                <h2>{get(currentSubscription, 'planOption.cancellationOption.bingeCancelHeaderMessage')}</h2>
                {this.primeButtons('isCurrentSubscription', false, CrownImage, get(currentSubscription, "productName"), get(currentSubscription, "amount")?.split(";")[1])}
                {this.primeButtons('isPrimeSubscription', true, get(primePackDetails, 'imageUrl'), get(primePackDetails, 'title'), get(primePackDetails, "packAmount"))}
                {isCurrentSubscription && bingeCancelExpiryVerbiage && <p className='cancel-text'>{bingeCancelExpiryVerbiage}</p>}
                <div className='not-now'>
                    <Button
                        cName="btn primary-btn"
                        bType="button"
                        bValue={'Not now'}
                        clickHandler={this.handleNotNow}
                    />
                </div>
                <div className='proceed'>
                    <Button
                        cName="btn primary-btn"
                        bType="button"
                        bValue={'Proceed'}
                        clickHandler={() => handleCancelPlan(isPrimeSubscription, isCurrentSubscription)}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        cancelSubscriptionRes: get(state.subscriptionDetails, 'cancelSubscriptionRes'),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
        primePackDetails: get(state.subscriptionDetails, "currentSubscription.data.primePackDetails"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                cancelSubscription,
                closePopup,
            },
            dispatch,
        ),
    };
}

PrimeModal.propTypes = {
    cancelSubscription: PropTypes.func,
    closePopup: PropTypes.func,
    primePackDetails: PropTypes.object,
    currentSubscription: PropTypes.object,
    cancelSubscriptionRes: PropTypes.object
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(PrimeModal);