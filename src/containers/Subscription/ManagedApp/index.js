import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { hideHeader, hideFooter, showMainLoaderImmediate, hideMainLoader } from "@src/action";
import BackgroundImage from "@assets/images/manage-app-bg.png";
import { POLLING_MAX_COUNT, TICK_TICK } from "../APIs/constant";
import { isUserloggedIn, loginInFreemium, safeNavigation, handleLogoutAllDevices, redirectToMangeApp } from '@utils/common';
import { closePopup, openPopup } from "@common/Modal/action";
import { MINI_SUBSCRIPTION, WEB_SMALL_PAYMENT_SOURCE } from '@utils/constants';
import { handleSubscriptionCall, isSubscriptionFreemium } from '@containers/Subscription/APIs/subscriptionCommon';
import { fromLoginLoader } from "@src/action";
import { getKey, setKey, deleteKey } from "@utils/storage";
import { LOCALSTORAGE, SUBSCRIPTION_TYPE, ERROR_CODE, DTH_TYPE } from "@constants";
import { URL } from "@constants/routeConstants";
import { getPlanSummaryUrl, migrateUserInfo, getWebPortalBackLink, getCurrentSubscriptionInfo } from "@containers/Subscription/APIs/action.js"
import RedirectionForm from './RedirectionForm';
import { updateUser, onLoginSuccess } from '@containers/Login/LoginCommon';
import { isEmpty } from 'lodash';
import MIXPANEL from "@constants/mixpanel";
import "./style.scss";
import { removePubNubListener } from "@utils/pubnub";
import ENV_CONFIG from "@config/environment/index";

class ManagedApp extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this.counter = 0
    }

    componentDidMount = async () => {
        let { location } = this.props;
        let paramData = new URLSearchParams(location.search);
        paramData && this.handleRedirection(paramData)
        let cartId = paramData.get('cartId')
        let status = paramData.get('status')
        let id = paramData.get("id");
        setKey(LOCALSTORAGE.CART_ID, cartId)
        let isMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        // this.props.isManagedApp && isMSales && !status && !id && redirectToMangeApp(MIXPANEL.VALUE.M_SALES) 
   }

    componentDidUpdate(prevProps){
        let { location } = this.props,
        paramData = new URLSearchParams(location.search),
        isMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE,
        urlArr = location.pathname.split("/");

       if (!isEmpty(this.props.getPortalLink) && this.props.getPortalLink?.code === 20022) {
        let paramData = new URLSearchParams(location.search);
        let cartId = paramData.get('cartId')
        this.props.fromLoginLoader(true)
        setTimeout(() => {
          this.timerPolling = setInterval( async () => {
            if(this.counter === POLLING_MAX_COUNT){
                clearInterval(this.timerPolling)
                this.timerPolling = null
                this.props.fromLoginLoader(false)
                return
            }
               this.counter++
               await this.props.getPlanSummaryUrl(cartId)
            }, 1000);
        }, 4000);
     }
    //   else if(prevProps.location !== this.props.location && urlArr[1] !== URL.SUBSCRIPTION_TRANSACTION && isMSales && this.props.isManagedApp){
    //       redirectToMangeApp(MIXPANEL.VALUE.M_SALES)
    //  }
    }


    componentWillUnmount() {
        clearInterval(this.timerPolling)
        this.timerPolling = null
    }

    handleRedirection = async (param) => {
        const { history, closePopup } = this.props
        let cartId = param.get('cartId')
        let statusInfo = param.get('status')?.toUpperCase(),
            subscription = param.get("subscription")?.toUpperCase();

        if (statusInfo === TICK_TICK.SUCCESS && this.props.isManagedApp) {
            this.redirectToPg(cartId)
        } else if (statusInfo === TICK_TICK.EXISTING_LOGIN) {
            await loginInFreemium({ openPopup, closePopup, ComponentName: MINI_SUBSCRIPTION.LOGIN })
        } else if (statusInfo === TICK_TICK.LOGIN) {
            if (isUserloggedIn()) {
                 subscription === SUBSCRIPTION_TYPE.ANYWHERE && !isEmpty(cartId) && this.handleTickTickSilentLogin(cartId);
            } else {
                await loginInFreemium({ openPopup, closePopup, ComponentName: MINI_SUBSCRIPTION.LOGIN, cartId: cartId });
            }
        }
        else if (statusInfo === TICK_TICK.FAIL) {
            safeNavigation(history, '/')
        }
    }

    handleTickTickSilentLogin = async (cartId) => {
        let migrateUserHeader = {
            cartId: cartId,
            securityKey: ENV_CONFIG?.MIGRATE_SECURITY_KEY,
        };
        console.log('Silent Login In-Progress: Migration Journey 1')
        setKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS, JSON.stringify(true));
        await this.props.migrateUserInfo(migrateUserHeader);
        let { migrateUserInfoRes, history, getCurrentSubscriptionInfo } = this.props;
        const { code, data, message, title = "Force Logout" } = migrateUserInfoRes;
        if (code === 0 && !isEmpty(data)) {
            let isSilentLoginInProgress = JSON.parse(getKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS)) === true;
            isSilentLoginInProgress && removePubNubListener();
            const { baId, accountId, dthSubscriberId, dthStatus, mobileNumber, authenticationToken, deviceToken } = data || {};
            const payload = {
                baId: baId,
                bingeSubscriberId: accountId,
                dthStatus: dthStatus,
                subscriberId: dthSubscriberId,
                rmn: mobileNumber,
                userAuthenticateToken: authenticationToken,
                deviceAuthenticateToken: deviceToken,
                cartId: cartId,
                silentLoginEvent: get(data, 'silentLoginEvent'),
                silentLoginTimestamp: get(data, 'silentLoginTimestamp'),
            };
            await updateUser(payload, onLoginSuccess, history);
            await getCurrentSubscriptionInfo();
            deleteKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS);
        } else if (migrateUserInfoRes?.code === ERROR_CODE.ERROR_130007) {
            handleLogoutAllDevices(title, message);
            deleteKey(LOCALSTORAGE.SILENT_LOGIN_INPROGRESS);
        }
        console.log('Silent Login Completed: Migration Journey 1')
    }

    handleBack = (logo) => {
        logo ? safeNavigation(this.props.history, '/') : this.props.history.goBack()
    }

    redirectToPg = async (cartId) => {
        const { history } = this.props
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {},
            isNonFreemiumDthUser = !isSubscriptionFreemium() && userInfo?.dthStatus !== DTH_TYPE.NON_DTH_USER,// non freemium and non dth user
            { fromLoginLoader } = this.props
        if (isNonFreemiumDthUser) {
            // if user is non-freemium i.e subscriptionType !== FREEMIUM and non dth user,
            // then in this case add and modify will be called on Make payment button click on balane info page
            setKey(LOCALSTORAGE.IS_NON_FREEMIUM_NON_DTH_SUBSCRIPTION_FLOW, true);
            safeNavigation(history, `/${URL.BALANCE_INFO}`);
        } else {
            // pack validate API will be called only for FREEMIUM users.
            fromLoginLoader(true)
            setTimeout(async () => {
                // isSubscriptionFreemium() && await store.dispatch(validateSelectedPack(updatedTenure?.tenureId));
                await handleSubscriptionCall(history, true, {}, cartId)
                fromLoginLoader(false)
            }, 4000)
        }

    }

    handleLoading = () => {
        this.props.hideMainLoader()
    }

    render() {
        let { getPortalLink, backgroundImage } = this.props
        const redirectionUrl = get(getPortalLink, 'data.href', '');
        const accessToken = get(getPortalLink, 'data.accessToken', '');
        const checksum = get(getPortalLink, 'data.checksum', '');
        const ttl = get(getPortalLink, 'data.ttl', '');
        let paramData = new URLSearchParams(this.props.location.search);
        let cartId = paramData.get('cartId')
        return (
            <>
                {redirectionUrl && <RedirectionForm url={redirectionUrl} accessToken={accessToken} checksum={checksum} cartId={cartId} isLoginForm={checksum ? true : false} />}
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    getPortalLink: get(state.subscriptionDetails, "getPortalLink"),
    backgroundImage: get(state.headerDetails, "configResponse.data.config.FreemiumBackgroundPoster.web.otherPackPoster"),
    isLoading: get(state.commonContent, "isLoading"),
    migrateUserInfoRes: get(state.subscriptionDetails, 'migrateUserInfo'),
    isManagedApp: get(state.headerDetails, "isManagedApp"),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            hideHeader,
            hideFooter,
            openPopup,
            closePopup,
            fromLoginLoader,
            hideMainLoader,
            showMainLoaderImmediate,
            migrateUserInfo,
            getPlanSummaryUrl,
            getWebPortalBackLink,
            getCurrentSubscriptionInfo,
        }, dispatch),
    }
}

ManagedApp.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  hideHeader: PropTypes.func,
  hideFooter: PropTypes.func,
  openPopup: PropTypes.func,
  closePopup: PropTypes.func,
  showMainLoaderImmediate: PropTypes.func,
  hideMainLoader: PropTypes.func,
  migrateUserInfo: PropTypes.func,
  getPlanSummaryUrl: PropTypes.func,
  getWebPortalBackLink: PropTypes.func,
  getCurrentSubscriptionInfo: PropTypes.func,
  isManagedApp: PropTypes.bool,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(ManagedApp);
