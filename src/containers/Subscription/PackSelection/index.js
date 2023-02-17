import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import PropTypes, { arrayOf } from 'prop-types';

import { hideFooter } from "@src/action";
import { getPackListing, getNotLoggedInPack } from '../APIs/action';
import SelectPlan from './SelectPlan';
import ComparePlan from './ComparePlans';
import { loginInFreemium, isUserloggedIn } from "@utils/common";
import { MESSAGE, MINI_SUBSCRIPTION } from '@utils/constants';
import { MODALS } from "@common/Modal/constants";
import { openPopup, closePopup } from "@common/Modal/action";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import './style.scss';
import { checkCurrentSubscription } from '../APIs/subscriptionCommon';
import mixpanel from '@utils/constants/mixpanel';
import mixPanelConfig from '@utils/mixpanel';
import appsFlyerConfig from '@utils/appsFlyer';
import APPSFLYER from '@utils/constants/appsFlyer';
import { URL } from '@utils/constants/routeConstants';
import googleConversionConfig from "@utils/googleCoversion";
import googleConversion from "@utils/constants/googleConversion";

import FIREBASE from "@utils/constants/firebase";
import trackEvent from "@utils/trackEvent";

class PackSelection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stepNumber: 1,
            isFromClick: false
        }
    }

    componentDidMount = async () => {
        const { getNotLoggedInPack, getPackListing, hideFooter, fromLogin, isManagedApp } = this.props;
        hideFooter(true);
        isUserloggedIn() && !fromLogin && !isManagedApp && await getPackListing();
        !isUserloggedIn() && !isManagedApp && await getNotLoggedInPack();
        let { packListingData, openPopup, closePopup, history, location, openLoginPopup, } = this.props;
        if (isEmpty(packListingData)) {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal error-state-modal invalid-pack-data',
                headingMessage: MESSAGE.OPERATION_NOT_COMPLETED,
                primaryButtonText: 'Ok',
                primaryButtonAction: () => {
                    closePopup()
                    history && history.goBack();
                },
                hideCloseIcon: true,
            });
        }

        let isFromMini = this.props.history.location?.state?.isFromMini;
        if (isFromMini) {
            this.updateStepNumber(2)
        }
    }

    componentWillUnmount = async () => {
        this.props.closePopup();
        this.props.hideFooter(false);
    }

    updateStepNumber = (stepNumber) => {
        this.setState({
            stepNumber
        })
    }

    handlePlanSelection = async (selectedPlan) => {
        const { openPopup, currentSubscription, location, closePopup, openLoginPopup } = this.props;
        const { prevPath } = location?.state || {};
        if (!checkCurrentSubscription(currentSubscription)) {
            appsFlyerConfig.trackModifyPackEvents(APPSFLYER.EVENT.MODIFY_PACK_INITIATE, selectedPlan, this.props.currentSubscription);
        }
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.PACK_SELECTED, {
            [APPSFLYER.PARAMETER.PACK_NAME]: selectedPlan.productName,
            [APPSFLYER.PARAMETER.TYPE]: APPSFLYER.VALUE.PAID,
        });
        googleConversionConfig.trackEvent(googleConversion.EVENT.PAYMENT_INITATION_PAGE,{
            [googleConversion.PARAMETER.VALUE]: selectedPlan?.amountValue,
            [googleConversion.PARAMETER.CURRENCY]:googleConversion.VALUE.CURRENCY
          })
        const fireBaseData={
            [FIREBASE.PARAMETER.PACK_NAME]:selectedPlan?.productName,
            [FIREBASE.PARAMETER.PACK_PRICE]: selectedPlan?.amountValue ,
            [FIREBASE.PARAMETER.PACK_DURATION]:selectedPlan?.packDuration,
            [FIREBASE.PARAMETER.USER_LOGIN_STATE]:isUserloggedIn()?FIREBASE.VALUE.LOGGED_IN:FIREBASE.VALUE.NON_LOGGED_IN,
            [FIREBASE.PARAMETER.PACK_ID]:selectedPlan?.productId,
           }
           trackEvent.packSelected(fireBaseData)
        // openPopup(MODALS.SUBSCRIPTION_CHANGE_TENURE, {
        //     modalClass: 'tenure-selection-modal',
        //     hideCloseIcon: true,
        //     selectedPlan,
        //     source: "PLAN",
        //     onTenureSelection: this.handleTenureSelection,
        //     ComponentName:MINI_SUBSCRIPTION.CHANGE_TENURE
        // })
        await loginInFreemium({
            openPopup,
            closePopup,
            openLoginPopup,
            ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE,
            selectedPlan: selectedPlan,
            source: "PLAN",
        });
    }

    handleTenureSelection = () => {
        let { closePopup, handlePaymentSuccess } = this.props;
        closePopup();
        handlePaymentSuccess();
    }

    render() {
        let { stepNumber } = this.state;
        let appWidth = document.getElementById('app').clientWidth;

        return (
            <React.Fragment>
                <div>
                    {stepNumber === 1 && <SelectPlan
                        proceedNextAction={this.updateStepNumber}
                        onPlanSelection={this.handlePlanSelection}
                    />}
                    {stepNumber === 2 && <ComparePlan
                        onPlanSelection={this.handlePlanSelection}
                    />}
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        packListingData: get(state.subscriptionDetails, 'packListingData'),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
        fromLogin: get(state.commonContent, 'fromLogin'),
        isManagedApp: get(state.headerDetails, "isManagedApp"),
    }
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            getPackListing,
            hideFooter,
            openPopup,
            closePopup,
            openLoginPopup,
            getNotLoggedInPack
        }, dispatch),
    }
}

PackSelection.propTypes = {
    packListingData: PropTypes.array,
    getPackListing: PropTypes.func,
    hideFooter: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    openLoginPopup: PropTypes.func,
    handlePaymentSuccess: PropTypes.func,
    currentSubscription: PropTypes.object,
    history: PropTypes.object,
    fromLogin: PropTypes.bool,
    isManagedApp: PropTypes.bool
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(PackSelection);