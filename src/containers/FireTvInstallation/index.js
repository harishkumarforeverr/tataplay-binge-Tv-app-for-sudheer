import React, {Component} from 'react';
import PropTypes from 'prop-types'
import './style.scss';
import InstallationMethod from "@containers/FireTvInstallation/InstallationMethod";
import ConfirmAddress from "@containers/FireTvInstallation/ConfirmAddress";
import InstallationSchedule from "@containers/FireTvInstallation/InstallationSchedule";
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {URL} from "@constants/routeConstants";

class FireTvInstallation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stepNumber: 1,
            installationMethod: 'fs-diy',
        };
    }

    componentDidMount() {
        let { history, currentSubscription } = this.props;

        if(!(currentSubscription && currentSubscription?.fsEligibility && !currentSubscription?.fsTaken &&!currentSubscription?.fSRequestRaised && !currentSubscription?.downgradeRequested)) {
            history.push(`/${URL.HOME}`);
        }
    }

    updateInfo = (stepNo, installationMethod) => {
        this.setState({stepNumber: stepNo, installationMethod: installationMethod});
    }

    render() {
        const {stepNumber, installationMethod} = this.state;
        return (
            <div className='fsEdition-container'>
                {stepNumber === 1 && <InstallationMethod updateInfo={this.updateInfo}/>}
                {stepNumber === 2 && <ConfirmAddress installationMethod={installationMethod} updateInfo={this.updateInfo}/>}
                {stepNumber === 3 && <InstallationSchedule installationMethod ={installationMethod}/>}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
});

FireTvInstallation.propTypes = {
    history: PropTypes.object,
    currentSubscription: PropTypes.object,
};

export default withRouter(connect(mapStateToProps)(FireTvInstallation));
