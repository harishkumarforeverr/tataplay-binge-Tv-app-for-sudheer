import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { withRouter } from 'react-router';
import get from "lodash/get";

import { hideHeader, hideFooter } from "@src/action";
import logoImage from '@assets/images/login-page-logo.png';
import webSmallLogoImage from '@assets/images/web-amall-login-logo.png';
import LoginForm from "@containers/BingeLogin/LoginForm";

import './style.scss';
import SIDSelection from "@containers/BingeLogin/SIDSelection";
import Eula from "@containers/BingeLogin/Eula";
import BingeAccountSelection from "@containers/BingeLogin/BingeAccountSelection";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import { isMobile, isUserloggedIn, safeNavigation } from "@utils/common";
import { URL } from '@routeConstants';



class BingeLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stepNumber: 1,
            rmn: '',
            subId: '',
            sidDetails: {},
            authType: '',
            loginWithRMN: false,
        }
    }

    componentDidMount() {
        if (isUserloggedIn()) {
            isMobile.any() ? safeNavigation(this.props.history, URL.MY_ACCOUNT) :
                safeNavigation(this.props.history, URL.DEFAULT);
        }
        else {
            const { hideHeader, hideFooter } = this.props;
            hideHeader(true);
            hideFooter(true);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_ENTER, {
                [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.APP_LAUNCH,
            });
            moengageConfig.trackEvent(MOENGAGE.EVENT.LOGIN_ENTER, {
                [`${MOENGAGE.PARAMETER.SOURCE}`]: MOENGAGE.VALUE.APP_LAUNCH,
            });
        }
    }

    componentDidUpdate(previousProps, previousState) {
        let { stepNumber } = this.state;
        if (stepNumber !== previousState.stepNumber) {
            stepNumber === 1 && this.resetBingeLoginState();
        }

    }

    componentWillUnmount() {
        const { hideHeader, hideFooter } = this.props;
        hideHeader(false);
        hideFooter(false);
    }

    resetBingeLoginState = () => {
        this.setState({
            stepNumber: 1,
            rmn: '',
            subId: '',
            sidDetails: {},
            authType: '',
            loginWithRMN: false,
        })
    }

    incrementStepNumber = () => {
        let { stepNumber } = this.state;
        this.setState({
            stepNumber: stepNumber + 1,
        })
    };


    /*
    * This method updates the next step in the login form
    * */
    updateStepNumber = (stepNumber) => {
        this.setState({ stepNumber });
    };
    /*
    * This method updates the component with rmn and sid to be passed in the next step
    * */
    getLoginInfo = (rmn, subId) => {
        this.setState({ rmn, subId });
    };

    /*
    * This method updates the subscriber id info selected in the sid selection screen, which will be passed to further screens
    * */
    updateSubscriberDetails = (details) => {
        this.setState({ sidDetails: details });
    };

    /*
    * This method updates the authentication type is OTP or password
    * */
    updateAuthType = (authType) => {
        this.setState({ authType: authType });
    }

    /*
    * This method updates if user has logged in with rmn or sid
    * */
    updateLoginWithRMN = (param) => {
        this.setState({ loginWithRMN: param });
    };

    handleBackButtonClick = () => {
        let { stepNumber, loginWithRMN } = this.state;
        let { accountDetailsFromRmn } = this.props;
        if (stepNumber === 3) {
            this.setState({
                stepNumber: loginWithRMN ? (accountDetailsFromRmn && accountDetailsFromRmn.length > 1 ? 2 : 1) : 1,
            })
        }
        // else if(stepNumber === 3){
        //     this.setState({
        //         stepNumber: accountDetailsFromRmn && accountDetailsFromRmn.length > 1 ? 2 : 1,
        //     })
        // }
        else {
            this.setState({
                stepNumber: stepNumber - 1,
            })
        }
    };

    render() {
        let { stepNumber, rmn, loginWithRMN, sidDetails, authType, subId } = this.state;
        let { history } = this.props;
        return (
            <div className={`${isMobile.any() ? 'binge-login-container' : 'binge-login-container web-login-container'}`}>
                <div className='left-section'>
                    <img src={logoImage} alt={'Logo-Image'} />
                </div>
                <div className='right-section'>
                    <div className='login-block'>
                        {<div className={'back-block'}>
                            {stepNumber !== 1 && <i className={'icon-back-2'} id='back-btn' onClick={this.handleBackButtonClick} />}
                        </div>}
                        <div className={'web-small-logo'}>
                            <img src={webSmallLogoImage} alt={'Logo-Image'} />
                        </div>
                        {stepNumber === 1 && <LoginForm
                            handleForgetPasswordClick={this.handleForgetPasswordClick}
                            updateStepNumber={this.updateStepNumber}
                            getLoginInfo={this.getLoginInfo}
                            updateSubscriberDetails={this.updateSubscriberDetails}
                            updateAuthType={this.updateAuthType}
                            updateLoginWithRMN={this.updateLoginWithRMN}
                            history={history}
                        />
                        }
                        {stepNumber === 2 &&
                            <SIDSelection
                                updateStepNumber={this.updateStepNumber}
                                rmn={rmn}
                                authType={this.state.authType}
                                updateSubscriberDetails={this.updateSubscriberDetails}
                                loginWithRMN={loginWithRMN}
                            />}
                        {/* {stepNumber === 3 &&
                        <Eula sidDetails={sidDetails}
                              authType={authType}
                              loginWithRMN={loginWithRMN}
                        />} */}
                        {stepNumber === 3 &&
                            <BingeAccountSelection
                                authType={authType}
                                sidDetails={sidDetails}
                                updateStepNumber={this.updateStepNumber}
                                loginWithRMN={loginWithRMN}
                            />}
                        {/*{stepNumber === 5 && <CurrentSubscription>}*/}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        accountDetailsFromRmn: get(state.bingeLoginDetails, 'accountDetailsFromRmn.data'),
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        hideHeader,
        hideFooter,
    }, dispatch)
);

BingeLogin.propTypes = {
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    history: PropTypes.object,
    accountDetailsFromRmn: PropTypes.array,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BingeLogin));
