import React, { Component } from 'react';
import PropTypes from "prop-types";
import get from "lodash/get";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import { hideFooter, hideHeader, hideMainLoader, showMainLoader } from "@src/action";
import { loginUser } from "@containers/BingeLogin/bingeLoginCommon";
import { updateUser } from '@containers/Login/LoginCommon';
import { openPopup } from "@common/Modal/action";
import { URL } from "@constants/routeConstants";
import { logOut, resetValidateWebSmallResponse, validateWebSmallUrl } from "@containers/BingeLogin/APIs/action";
import { validateFSWebSmallUrl } from '@containers/Login/APIs/actions';
import { getKey, setKey } from "@utils/storage";
import { LOCALSTORAGE, SILENT_LOGIN_PLATFORM, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { callLogOut, isUserloggedIn, safeNavigation, getAnonymousId, redirectToMangeApp, isMobile } from "@utils/common";
import { getProfileDetails } from '@containers/Profile/APIs/action';
import { isEmpty } from 'lodash';
import queryString from "querystring";
import MIXPANEL from "@constants/mixpanel";
import { managedAppPushChanges } from '@components/Header/APIs/actions';

class WebSmallValidate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
        }
    }

    componentDidMount = async () => {
        this.updateKeysInLocal();
    };

    componentWillUnmount() {
        this.props.resetValidateWebSmallResponse();
    }

    loadHandler = async () => {
        let {
            validateWebSmallUrl,
            validateFSWebSmallUrl,
            wsRoute,
            history,
            hideHeader,
            hideFooter,
            openPopup,
            hideMainLoader,
            showMainLoader,
            existingUser,
            userProfileDetails,
            getProfileDetails,
            webSmallPaymentRouteKey,
            webSmallRouteToken
        } = this.props;

        // hideHeader(true);
        hideFooter(true);
        const oldFsJourney = webSmallPaymentRouteKey === WEB_SMALL_PAYMENT_SOURCE.DETAILS,
            newFsJourney = webSmallPaymentRouteKey === WEB_SMALL_PAYMENT_SOURCE.TRANSACTION_ID,
            infoUrl = webSmallPaymentRouteKey === WEB_SMALL_PAYMENT_SOURCE.INFO,
            mSalesUrl = webSmallPaymentRouteKey === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE,
            isBingeOpenFS = getKey(LOCALSTORAGE.SILENT_LOGIN_PLATFORM) === SILENT_LOGIN_PLATFORM.BINGE_OPEN_FS;
        if (oldFsJourney) {
            await validateWebSmallUrl(wsRoute, !oldFsJourney);
            let { validateWebSmallUrlResponse } = this.props;
            if (validateWebSmallUrlResponse && validateWebSmallUrlResponse.code === 0) {
                if (!oldFsJourney) {
                    let item = {
                        baId: get(validateWebSmallUrlResponse, 'data.baId'),
                        subscriberId: get(validateWebSmallUrlResponse, 'data.subscriberId'),
                    };
                    loginUser(false, item, openPopup, history, {}, false);
                } else {
                    if (validateWebSmallUrlResponse?.data?.rechargeUrl) {
                        window.location.href = validateWebSmallUrlResponse?.data?.rechargeUrl;
                    }
                    else {
                        this.setState({
                            message: validateWebSmallUrlResponse?.message ? validateWebSmallUrlResponse.message : 'Something Went Wrong. Please try again later',
                        });
                    }
                    oldFsJourney && hideMainLoader();
                }
            } else if (isUserloggedIn() && validateWebSmallUrlResponse && validateWebSmallUrlResponse.code === 3005) {
                if (!oldFsJourney) {
                    let expireLinkSid = validateWebSmallUrlResponse && validateWebSmallUrlResponse.data;
                    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
                    let loggedInSid = userInfo.sId;
                    if (parseInt(expireLinkSid) === loggedInSid) {
                        await callLogOut(false, history);
                    } else {
                        safeNavigation(history, URL.DEFAULT);
                    }
                } else {
                    oldFsJourney && hideMainLoader();
                    this.setState({
                        message: validateWebSmallUrlResponse?.message ? validateWebSmallUrlResponse.message : 'Something Went Wrong. Please try again later',
                    });
                }
            } else {
                if (!oldFsJourney) {
                    safeNavigation(history, `/${URL.HOME}`);
                } else {
                    oldFsJourney && hideMainLoader();
                    this.setState({
                        message: validateWebSmallUrlResponse?.message ? validateWebSmallUrlResponse.message : 'Something Went Wrong. Please try again later',
                    });
                }
            }

        } else {
            if (get(existingUser, 'data')) {
                return false
            }
            showMainLoader();
            await getAnonymousId();
            await validateFSWebSmallUrl(webSmallRouteToken);
            let { validateFSUrlResponse } = this.props;
            if (!isEmpty(validateFSUrlResponse) && validateFSUrlResponse.code === 0) {
                const data = {
                    baId: get(validateFSUrlResponse, "data.baId"),
                    bingeSubscriberId: get(validateFSUrlResponse, "data.bingeSubscriberId"),
                    dthStatus: get(validateFSUrlResponse, "data.dthStatus"),
                    subscriberId: get(validateFSUrlResponse, "data.sId"),
                    rmn: get(validateFSUrlResponse, "data.mobileNumber"),
                    otp: get(validateFSUrlResponse, "data.login"),
                    userAuthenticateToken: get(validateFSUrlResponse, "data.userAuthenticateToken"),
                    deviceAuthenticateToken: get(validateFSUrlResponse, "data.deviceAuthenticateToken"),
                    helpCenterSilentLogin: true,
                    temporaryId: isBingeOpenFS ? '' : webSmallRouteToken,
                };
                await updateUser(data);
                let { existingUser } = this.props;
                if (!isEmpty(existingUser) && existingUser?.code === 0) {
                    (existingUser?.data?.externalSourceMSales || mSalesUrl) && (setKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY, WEB_SMALL_PAYMENT_SOURCE.NON_BINGE), this.props.managedAppPushChanges(false))
                    hideMainLoader();
                    setKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY, JSON.stringify(true));
                    isEmpty(userProfileDetails) && await getProfileDetails(false);
                    if (get(existingUser, 'data.dth') && !infoUrl) {
                        safeNavigation(history, `${URL.BALANCE_INFO}`)
                    }
                    else if (!isEmpty(get(existingUser, 'data.paymentPayload')) && !infoUrl) {
                        safeNavigation(history, `${URL.SUBSCRIPTION_TRANSACTION}`)
                    } else {
                        // if infoUrl : should land on subscription screen 
                        if(existingUser?.data?.externalSourceMSales || !!isBingeOpenFS || mSalesUrl){
                            return safeNavigation(history, `${URL.SUBSCRIPTION}`)
                        }
                       !this.props.isManagedApp ? safeNavigation(history, `${URL.SUBSCRIPTION}`) : redirectToMangeApp(MIXPANEL.VALUE.M_SALES)
                    }
                }
                else {
                    hideMainLoader();
                    this.setState({
                        message: existingUser?.message ? existingUser.message : 'Something Went Wrong. Please try again later',
                    });
                }
            }
            else {
                hideMainLoader();
                this.setState({
                    message: validateFSUrlResponse?.message ? validateFSUrlResponse.message : 'Something Went Wrong. Please try again later',
                });
            }
        }
    };

    updateKeysInLocal = async () => {
        let { webSmallPaymentRouteKey, webSmallRouteToken, webSmallRouteParam } = this.props;
        setKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY, webSmallPaymentRouteKey);
        setKey(LOCALSTORAGE.PAYMENT_SOURCE_TOKEN, webSmallRouteToken);
        setKey(LOCALSTORAGE.SILENT_LOGIN_PLATFORM, queryString.parse(this.props?.wsRoute)?.platform);
        setKey(LOCALSTORAGE.PAYMENT_SOURCE_PARAM, webSmallRouteParam);
        this.loadHandler();
    }

    render() {
        return (
            <div className='fs-message'>{this.state.message}</div>
        )
    }
}

WebSmallValidate.propTypes = {
    history: PropTypes.object,
    validateWebSmallUrl: PropTypes.func,
    validateFSWebSmallUrl: PropTypes.func,
    resetValidateWebSmallResponse: PropTypes.func,
    wsRoute: PropTypes.string,
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    openPopup: PropTypes.func,
    logOut: PropTypes.func,
    validateWebSmallUrlResponse: PropTypes.object,
    logOutResponse: PropTypes.object,
    newFsJourney: PropTypes.bool,
    oldFsJourney: PropTypes.bool,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    infoUrl: PropTypes.bool,
    isManagedApp: PropTypes.bool,
    managedAppPushChanges: PropTypes.func
};


function mapStateToProps(state) {
    return {
        validateWebSmallUrlResponse: get(state.bingeLoginDetails, 'validateWebSmallUrlResponse'),
        validateFSUrlResponse: get(state.loginReducer, 'validateFSUrlResponse'),
        logOutResponse: get(state.bingeLoginDetails, 'logOutResponse'),
        existingUser: get(state.loginReducer, 'existingUser'),
        userProfileDetails: get(state.profileDetails, 'userProfileDetails'),
        isManagedApp: get(state.headerDetails, "isManagedApp")
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            validateWebSmallUrl,
            validateFSWebSmallUrl,
            resetValidateWebSmallResponse,
            hideHeader,
            hideFooter,
            openPopup,
            logOut,
            showMainLoader,
            hideMainLoader,
            getProfileDetails,
            managedAppPushChanges
        }, dispatch),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WebSmallValidate))