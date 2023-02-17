import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import {getCurrentSubscriptionInfo} from "@containers/PackSelection/APIs/action";
import {checkUserDTHStatus, safeNavigation, updatePackDetailStorage} from "@utils/common";
import {closePopup, openPopup} from "@common/Modal/action";
import {cancelPack, clearCancelRevokeData, resumePack} from "@containers/MySubscription/APIs/action";

import './style.scss';
import {hideMainLoader, showMainLoader} from "@src/action";
import CurrentSubscription from "@containers/MySubscription/CurrentSubscription";
import {cancelResumeNotifications, showExpiryInfo} from "@containers/MySubscription/APIs/subscriptionCommon";
import {URL} from "@routeConstants";
import {LOCALSTORAGE, PACK_TYPE} from "@constants";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import {getKey} from "@utils/storage";
import {getDeviceStatus, handleDeviceCancelledUser} from "@utils/cancellationFlowCommon";
import MIXPANEL from "@constants/mixpanel";
import FreeTrialPack from "@containers/PackSelection/FreeTrialPack";

class MySubscription extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cancelData: '',
        }
    }

    static getDerivedStateFromProps = (nextProps, prevState) => {
        if ((nextProps.cancelData === prevState.cancelData || nextProps.resumeData === prevState.cancelData) && prevState.cancelData) {
            return {cancelData: 'updated'}
        }
        return {cancelData: ''}
    }

    componentDidMount = async () => {
        const {showMainLoader, hideMainLoader, getCurrentSubscriptionInfo} = this.props;
        showMainLoader();
        await getCurrentSubscriptionInfo();
        hideMainLoader();
        if (!isEmpty(this.props.currentSubscription.data)) {
            const {currentSubscription: {data}} = this.props;
            updatePackDetailStorage(data);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        window.scrollTo(0, 0);
        try {
            if (prevState.cancelData === 'updated') {
                cancelResumeNotifications();
            }
        } catch (e) {
            console.log(e);
        }
    }

    setStateApiSuccess = (data) => {
        this.setState({
            cancelData: data,
        })
    }

    mobileBack = () => {
        safeNavigation(this.props.history, URL.MY_ACCOUNT);
    }

    showCancelledTag = () => {
        const {currentSubscription} = this.props;
        let data = currentSubscription?.data;
        if (data?.packType?.toLowerCase() === PACK_TYPE.PAID && data?.cancelled &&
            (data?.status?.toUpperCase() === ACCOUNT_STATUS.DEACTIVATED || data?.status?.toUpperCase() === ACCOUNT_STATUS.DEACTIVE)) {
            return true;
        }
    }

    choosePlan = async () => {
        const {currentSubscription, history} = this.props;
        let data = currentSubscription?.data;
        const handleCancelledUser = getDeviceStatus();
        if (handleCancelledUser) {
            await handleDeviceCancelledUser(history, true, MIXPANEL.VALUE.MY_ACCOUNT);
        } else {
            checkUserDTHStatus(data, history, false, false, '');
        }
    }

    render() {
        const {currentSubscription, history, location} = this.props;
        if (isEmpty(currentSubscription)) return null;
        const {currentSubscription: {data}} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return (
            ((userInfo?.dummyUser || !userInfo?.freeTrialAvailed) && isEmpty(data)) ?
            <FreeTrialPack history={history} analyticsSource={MIXPANEL.VALUE.MY_ACCOUNT}/> :
            <CurrentSubscription data={data} history={history} location={location} choosePlan={this.choosePlan}
                                 expiredCheck={showExpiryInfo} showCancelledTag={this.showCancelledTag}
                                 currentState={this} mobileBack={this.mobileBack}
            />
        )
    }
}

MySubscription.propTypes = {
    currentSubscription: PropTypes.object,
    data: PropTypes.object,
    history: PropTypes.object,
    getCurrentSubscriptionInfo: PropTypes.func,
    openPopup: PropTypes.func,
    cancelPack: PropTypes.func,
    resumePack: PropTypes.func,
    cancelData: PropTypes.object,
    resumeData: PropTypes.object,
    clearCancelRevokeData: PropTypes.func,
    closePopup: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    location: PropTypes.object,
}

const mapStateToProps = (state) => {
    return {
        currentSubscription: get(state.packSelectionDetail, 'currentSubscription'),
        cancelData: get(state.mySubscriptionReducer, 'cancelData'),
        resumeData: get(state.mySubscriptionReducer, 'resumeData'),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            getCurrentSubscriptionInfo, openPopup, cancelPack, resumePack,
            clearCancelRevokeData, closePopup, hideMainLoader, showMainLoader,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(MySubscription));

