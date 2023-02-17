import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { isEmpty } from 'lodash';

import { LOCALSTORAGE, PRIVATE_DEEPLINKS, SEARCH_PARAM, SEARCH_PARAM_ACTION_VALUE } from "@constants";
import { deleteKey, getKey, setKey } from "@utils/storage";
import { showMainLoader, hideMainLoader, hideHeader } from "@src/action";
import BackgroundImage from "@assets/images/Subscription-Page-Background.png";
import backgroundImageSmall from "@assets/images/subscription-page-background-small.png";
import { closePopup, openPopup } from "@common/Modal/action";
import { MODALS } from "@common/Modal/constants";

import { getCurrentSubscriptionInfo, getWebPortalLink, checkFallbackFlow } from './APIs/action';
import { JOURNEY_SOURCE, PRIME_STATUS } from './APIs/constant';
import MyPlan from './MyPlan';
import PackSelection from './PackSelection';
import ComboPlans from './ComboPlans';
import CancelPlan from "./MyPlan/CancelPlan";
import "./style.scss";
import { errorForAPIFailure, checkCurrentSubscription, handleCancelActivePlan, getAnalyticsData } from './APIs/subscriptionCommon';
import { isMobile, isUserloggedIn, safeNavigation, setSubscriptionJourneySource, getSearchParam, getDeepLinkParameters } from '@utils/common';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import APPSFLYER from '@utils/constants/appsFlyer';
import queryString from "querystring";

class Subscription extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMyPlanScreen: true,
            isComboPlan: false,
        }
    }

    componentDidMount = async () => {
        let {
          getCurrentSubscriptionInfo,
          currentSubscription,
          showMainLoader,
          hideMainLoader,
          hideHeader,
          setUpdatedTenure,
          location,
          source,
          isSourceAppsFlyerDeeplink,
          checkFallbackFlow,
        } = this.props;
        hideHeader(false);
        showMainLoader();
        setSubscriptionJourneySource(this.props.source || location?.state?.prevPath || (isSourceAppsFlyerDeeplink ? APPSFLYER.VALUE.DEEPLINK : ""));
        if (!this.props.history.location?.state?.isPaymentScreenPressed) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_PAGE_INITIATE, {
                [`${MIXPANEL.PARAMETER.SOURCE}`]: this.getMixpanelSource(),
            })
        }
        await checkFallbackFlow()
        if (isUserloggedIn()) {
            isEmpty(currentSubscription) && await getCurrentSubscriptionInfo(false, false, false, true);
            let fsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;
            fsJourney && deleteKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY);
            this.checkCurrentSubResponse();
            this.checkIsCombo();
        }
        await this.handleRender();
        hideMainLoader();
    }

    componentDidUpdate = async () => {
        // if (get(this.props, 'location.state.subscriptionRenderCallback') && !this.state.showMyPlanScreen) {
        //     this.handleHeaderMyPlanReClick();
        // }
    }

    checkCurrentSubResponse = () => {
        let { currentSubscription } = this.props;
        if (get(currentSubscription, 'code') !== 0 && isEmpty(get(currentSubscription, 'data')) && get(currentSubscription, 'message')) {
            errorForAPIFailure(currentSubscription)
        }
    }

    getMixpanelSource = () => {
        const { currentSubscription } = this.props;
        return currentSubscription?.planOption?.changePlanOption ? MIXPANEL.VALUE.CHANGE_PLAN : (this.props.location?.state?.source)?.toUpperCase()
    }

    checkIsCombo = () => {
        let { currentSubscription } = this.props;
        if (!isEmpty(get(currentSubscription, 'data')) && get(currentSubscription, 'data.combo')) {
            this.setState({
                isComboPlan: get(currentSubscription, 'data.combo'),
                showMyPlanScreen: !get(currentSubscription, 'data.combo'),
            })
        }
    }


    handleHeaderMyPlanReClick = () => {
        let { history, location, currentSubscription } = this.props;
        currentSubscription = get(currentSubscription, 'data');
        if (!checkCurrentSubscription(currentSubscription)) {
            let subscriptionRenderCallback = get(location, 'state.subscriptionRenderCallback');
            subscriptionRenderCallback && this.handleRenderCallback();
            if (get(history, 'location.state.subscriptionRenderCallback')) {
                const state = { ...history.location.state };
                delete state.subscriptionRenderCallback;
                history.replace({ ...history.location, state });
            }
        }
    }

    handleRender = async () => {
        let { currentSubscription, location: { state }, planOption, getWebPortalLink } = this.props;
        currentSubscription = get(currentSubscription, 'data');
     
        let isSubscriptionDeactive = checkCurrentSubscription(currentSubscription),
            searchPath = queryString.parse(location.search.concat(location?.hash)),
            actionSearchParam = getSearchParam(SEARCH_PARAM.ACTION),
            journeySourceRefId = get(searchPath,`${SEARCH_PARAM.JOURNEYSOURCE_REF_ID}`),
            // journeySourceRefId = queryString.parse(searchPath),
            // packNameSearchParam = getSearchParam(SEARCH_PARAM.PACK_NAME),
            // providerNameSearchParam = getSearchParam(SEARCH_PARAM.PROVIDER_NAME),
            hasSelectedPlanDeeplink = actionSearchParam && [SEARCH_PARAM_ACTION_VALUE.MY_PLAN, SEARCH_PARAM_ACTION_VALUE.RENEW].includes(actionSearchParam) && isSubscriptionDeactive && isUserloggedIn(),
            isPlanSelectionDeeplink = (actionSearchParam === SEARCH_PARAM_ACTION_VALUE.REGIONAL_APP_SELECTION && !isUserloggedIn()) ? false : (actionSearchParam && journeySourceRefId),
            isPlanSelectionFallback = actionSearchParam && [SEARCH_PARAM_ACTION_VALUE.PACK_SELECTION].includes(actionSearchParam),
            // isReginalAppDeeplink = actionSearchParam && [SEARCH_PARAM_ACTION_VALUE.REGIONAL_APP_SELECTION].includes(actionSearchParam) && isUserloggedIn(),
            // redirectToManageApp = isPlanSelectionDeeplink || hasSelectedPlanDeeplink || isReginalAppDeeplink,
            redirectToManageApp = isPlanSelectionDeeplink || hasSelectedPlanDeeplink || isPlanSelectionFallback,
            isPrivateDeeplink = PRIVATE_DEEPLINKS.includes(actionSearchParam) && !isUserloggedIn();
        if (redirectToManageApp) {
            let activeUserToChangePlan = isPlanSelectionDeeplink && !!planOption?.changePlanOption;
            let headers = {
                initiateSubscription: JOURNEY_SOURCE.DRAWER_CYOP,
                // journeySource: activeUserToChangePlan ? JOURNEY_SOURCE.MYPLAN_CHANGE : JOURNEY_SOURCE.DRAWER_CYOP,
                journeySource: actionSearchParam,
                analyticSource: MIXPANEL.VALUE.HOME,
                journeySourceRefId: journeySourceRefId === undefined ? '' : journeySourceRefId,
                action: actionSearchParam,
            }
            // !!packNameSearchParam && (headers[SEARCH_PARAM.PACK_NAME] = packNameSearchParam);
            // !!providerNameSearchParam && (headers[SEARCH_PARAM.PROVIDER_NAME] = providerNameSearchParam);
            return await getWebPortalLink(headers).then(webPortalLinkResponse => {
                // On API Failure redirect to Home
                isEmpty(get(webPortalLinkResponse, 'data.data')) && safeNavigation(this.props.history, '/');
            }).catch(err => {
                safeNavigation(this.props.history, '/');
            });
        }
        if ((isSubscriptionDeactive && !isPrivateDeeplink && this.props.isManagedApp)) {
             safeNavigation(this.props.history, "/");
        }
        if (isSubscriptionDeactive || (!isEmpty(state) && state.upgradePack)) {
            this.setState({
                showMyPlanScreen: false,
            })
        }
    }

    handleRenderCallback = () => {
        this.setState((previousState) => {
            return {
                showMyPlanScreen: !previousState.showMyPlanScreen,
            };
        });
    }

    handleBingeCancelPlan = (cancelPrime = false, cancelCurrentSub = false) => {
        let { planOption, openPopup } = this.props;
        let headerMessage = cancelPrime ? planOption?.cancellationOption?.primeCancelHeaderMessage : planOption?.cancellationOption?.bingeCancelHeaderMessage,
            cancelFooterMessage = cancelPrime ? planOption?.cancellationOption?.primeCancelFooterMessage : planOption?.cancellationOption?.bingeCancelFooterMessage,
            cancelExpiryVerbiage = cancelPrime ? planOption?.cancellationOption?.primeCancelExpiryVerbiage : planOption?.cancellationOption?.bingeCancelExpiryVerbiage;

        openPopup(MODALS.CUSTOM_MODAL, {
            modalClass: "alert-modal cancel-addon-container",
            childComponent: (
                <CancelPlan
                    headerMessage={headerMessage}
                    cancelFooterMessage={cancelFooterMessage}
                    cancelExpiryVerbiage={cancelExpiryVerbiage}
                    handleCancelPlan={() => handleCancelActivePlan(cancelPrime, cancelCurrentSub)}
                />
            ),
            closeModal: true,
            hideCloseIcon: true,
        });
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MY_PLAN_CANCEL_PLAN, getAnalyticsData(MIXPANEL));
    };

    showAddOnCancel = () => {
        let { primePackDetails } = this.props;
        let bundleState = get(primePackDetails, 'bundleState');
        let platform = get(primePackDetails, 'platform');
        let cancelled = get(primePackDetails, 'cancelled')
        return !!(primePackDetails && (bundleState?.toUpperCase() === PRIME_STATUS.ACTIVATED || bundleState?.toUpperCase() === PRIME_STATUS.SUSPENDED) && platform?.toUpperCase() === 'MOBILE' && !cancelled);
    }

    render() {
        let { showMyPlanScreen, isComboPlan } = this.state;
        return (
            <div className='subscription-container'>
                <div className={`subscription-background ${showMyPlanScreen && 'hide-background-img'}`}>
                    {!(isComboPlan && !!isMobile.any()) && <img src={isMobile.any() ? backgroundImageSmall : BackgroundImage} alt=""
                    />
                    }
                </div>
                {/* <React.Fragment>
                    {isComboPlan ? <ComboPlans
                        showAddOnCancel={this.showAddOnCancel}
                        handleBingeCancelPlan={this.handleBingeCancelPlan} />
                        : (showMyPlanScreen && !this.props.fromLogin ?
                            <MyPlan
                                showAddOnCancel={this.showAddOnCancel}
                                handleBingeCancelPlan={this.handleBingeCancelPlan}
                                handlePaymentSuccess={this.handlePaymentSuccess}
                                switchToPackSelection={this.handleRenderCallback} /> :
                            <PackSelection
                                handlePaymentSuccess={this.handlePaymentSuccess}
                                switchToMyPlan={this.handleRenderCallback} />)
                    }
                </React.Fragment> */}
                <React.Fragment>
                    {isComboPlan ? <ComboPlans
                        showAddOnCancel={this.showAddOnCancel}
                        handleBingeCancelPlan={this.handleBingeCancelPlan} />
                        : (showMyPlanScreen && !this.props.fromLogin ?
                            <MyPlan
                                showAddOnCancel={this.showAddOnCancel}
                                handleBingeCancelPlan={this.handleBingeCancelPlan}
                                handlePaymentSuccess={this.handlePaymentSuccess}
                                switchToPackSelection={this.handleRenderCallback} />
                            : <PackSelection
                            handlePaymentSuccess={this.handlePaymentSuccess}
                            switchToMyPlan={this.handleRenderCallback} />)
                    }
                </React.Fragment>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription'),
    planOption: get(state.subscriptionDetails, "currentSubscription.data.planOption"),
    primePackDetails: get(state.subscriptionDetails, "currentSubscription.data.primePackDetails"),
    isSourceAppsFlyerDeeplink: get(state.commonContent, "isSourceAppsFlyerDeeplink"),
    fromLogin: get(state.commonContent, "fromLogin"),
    isManagedApp: get(state.headerDetails, "isManagedApp"),
});

function mapDispatchToProps(dispatch) {
    return {
      ...bindActionCreators(
        {
          getCurrentSubscriptionInfo,
          showMainLoader,
          hideMainLoader,
          hideHeader,
          closePopup,
          openPopup,
          getWebPortalLink,
          checkFallbackFlow,
        },
        dispatch
      ),
    };
}

Subscription.propTypes = {
  showMainLoader: PropTypes.func,
  hideMainLoader: PropTypes.func,
  getCurrentSubscriptionInfo: PropTypes.func,
  currentSubscription: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  hideHeader: PropTypes.func,
  openPopup: PropTypes.func,
  closePopup: PropTypes.func,
  getWebPortalLink: PropTypes.func,
  checkFallbackFlow: PropTypes.func,
  isManagedApp: PropTypes.bool,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Subscription);
