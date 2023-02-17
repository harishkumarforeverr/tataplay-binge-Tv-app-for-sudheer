import React from "react";
import { withRouter, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { toast, ToastContainer } from "react-toastify";
import get from "lodash/get";
import isEqual from 'lodash/isEqual';
import isEmpty from "lodash/isEmpty";
import "react-app-polyfill/ie11";
import "react-toastify/dist/ReactToastify.min.css";

import Header from "@components/Header";
import Footer from "@common/Footer";
import Modal from "@common/Modal";
import { openPopup, closePopup } from "@common/Modal/action";
import { mainRoutes, URL } from "@constants/routeConstants";
import {
    dropDownDismissalCases,
    isMobile,
    openTimeoutPopup,
    showAtvUpgradePopup,
    ftvWOEvents,
    getAnonymousId,
    handlePaymentSDKPrefetch,
    isWebSmallLinkPayment,
    isUserloggedIn,
    scrollToTop,
    handleOverflowOnHtml,
    getEnvironmentConstants,
    isMSalesPrevInfoExist,
    callLogOut,
    isPaymentRedirectURL,
    handleSilentLogout,
    initializeQoeSdk,
} from "@utils/common";
import {
    accountDropDown,
    switchAccountDropDown,
    setSearch,
    notificationDropDown,
    fetchConfig,
    fetchHeaderData,
    getCategoriesList,
    categoryDropDown,
    isHideDownloadHeaderAction,
} from "@components/Header/APIs/actions";
import { getProfileDetails } from "@containers/Profile/APIs/action";
import NetworkDetector from "@components/HOC/networkDetector";
import { deleteKey, getKey, setKey } from "@utils/storage";
import { closeMobilePopup, openMobilePopup } from "@containers/Languages/APIs/actions";
import { closeLoginPopup, setLoginManual, openLoginPopup } from "@containers/Login/APIs/actions";
import { BOTTOM_SHEET, MOBILE_BREAKPOINT, LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import BottomSheet from "@common/BottomSheet";
import { hideSplash, loggedIn, fromLoginLoader } from "@src/action";
import { getCurrentSubscriptionInfo, getNotLoggedInPack, getWebPortalLink, openMiniSubscription, getPackListing, getWebPortalBackLink, checkFallbackFlow } from "@containers/Subscription/APIs/action";
import { fetchDetailsFromURL } from '@containers/SubscriptionPayment/APIs/constants';
import Splash from "@common/Splash";
import HeaderHC from '@containers/HelpCenter/Common/HeaderHC';
import TopHeaderDownload from "@containers/HelpCenter/Common/TopHeaderDownload";
import { fetchWatchlistItems } from "@containers/Watchlist/API/action";
import Analytics from "@components/HOC/analytics";
import ManagedApp from "@containers/Subscription/ManagedApp";
import createRoute from "@utils/createRoute";
import { showLangOrSubPopup, checkHomePage, accordingToMobileShowHideDownload, callBackToHideDownload, showRegionalAppNudge } from './MainCommon';
import RegionalNudge from "@containers/RegionalAppNudge";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

class Main extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            minContainerHeight: window.innerHeight - 250,
            windowContainerWidth: window.innerWidth,
            isSubscriptionCallFinished: false,
        };

    }

    componentDidMount = async () => {
        if (window.location.pathname.toLowerCase() === `/${URL.DISCOUNT}`) {
            // to take user back from offers domain to actual domain for further discount activities
            window.location.replace(`${getEnvironmentConstants().ENV_URL}/${URL.SUBSCRIPTION_DISCOUNT}`);
        } else {
            await this.loadData();
            accordingToMobileShowHideDownload(this);

            let paramData = new URLSearchParams(this.props.location.search);
            let status = paramData.get('status');

            if (status === 'login') {
                window.history.pushState(null, "", window.location.href);
                window.onpopstate = this.onBackBtnCallManageAppAPI;
            }
        }
    };

    onBackBtnCallManageAppAPI = () => {
        let paramData = new URLSearchParams(this.props.location.search);
        let cartId = paramData.get('cartId');

        this.props.getWebPortalBackLink(cartId)
    }

    componentDidUpdate = async (prevProps, prevState) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let isSilentLogout = JSON.parse(getKey(LOCALSTORAGE.IS_SILENT_LOGOUT));
        let ismSalesPaymentRedirectURLBack = isPaymentRedirectURL(this.props.location) && isSilentLogout;
        if (prevState.windowContainerWidth !== this.state.windowContainerWidth) {
            if (this.state.windowContainerWidth > MOBILE_BREAKPOINT) {
                this.props.showLoginPopup && this.props.closeLoginPopup();
            } else {
                this.props.closePopup();
            }
        }

        if (this.props.location !== prevProps.location) {
            scrollToTop()
            let deviceRemoved =
                JSON.parse(getKey(LOCALSTORAGE.DEVICE_REMOVED)) === true;
            deviceRemoved && openTimeoutPopup(this.props.history);

            let ftvWoGenerated = get(
                this.props.location.state,
                "ftvWoGenerated",
                false,
            );

            if (
                prevProps.location.pathname === `/${URL.FIRE_TV_INSTALLATION}` &&
                !ftvWoGenerated
            ) {
                ftvWOEvents(false);
            }

            if ((prevProps?.location?.pathname === `/${URL.SUBSCRIPTION_TRANSACTION}` ||
                prevProps?.location?.pathname === `/${URL.BALANCE_INFO}`)) {
                this.trackMixpanelOnPaymentExitFlow();
            }
        }

        if (prevProps && this.props && (
            !isEqual(get(this.props, 'newUserDetail.subscriberId'), get(prevProps, 'newUserDetail.subscriberId')) ||
            !isEqual(get(this.props, 'existingUserDetail.subscriberId'), get(prevProps, 'existingUserDetail.subscriberId'))
        ) && userInfo.accessToken) {
            this.props.fetchWatchlistItems(false, false, true);
            await this.loggedInUserJourney();
        }

        if (this.props.location !== prevProps.location && (this.props.modalStatus || !isEmpty(this.props.miniSubscription)) && !ismSalesPaymentRedirectURLBack) {
            this.props.closePopup()
            this.props.openMiniSubscription()
        }
    
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleOnResize);
        window.removeEventListener("storage", this.handleLocalStorageUpdate);
        window.removeEventListener("touchstart", this.handleBouncingMobile);
        this.timerPolling = null;
        window.clearInterval(this.timerPolling)

        window.onpopstate = () => { }
    }

    loadData = async () => {
        let {
            location: { pathname },
            fetchConfig,
            fetchHeaderData,
            getCategoriesList,
            configResponse,
            getCurrentSubscriptionInfo,
            getNotLoggedInPack,
            history,
            checkFallbackFlow
        } = this.props;
        let isSilentLogout = JSON.parse(getKey(LOCALSTORAGE.IS_SILENT_LOGOUT));
        isSilentLogout && handleSilentLogout();
        this.addEventListeners();
        await this.logOutPreviousMSalesUser();
        await fetchConfig(true);
        await fetchHeaderData();
        await getCategoriesList();
        await getAnonymousId();
        await checkFallbackFlow()
        // !isUserloggedIn()&&await getNotLoggedInPack()
        //isEmpty(configResponse) && await fetchConfig(true);

        if (isUserloggedIn()) {
            //initialize qoe sdk at every page refresh
            await initializeQoeSdk();
            await getCurrentSubscriptionInfo();
            this.setState({
                isSubscriptionCallFinished: true
            });
            await this.loggedInUserJourney();
            handlePaymentSDKPrefetch();
        } else {
            this.setState({
                isSubscriptionCallFinished: true
            });
        }
        let userLanguage = JSON.parse(getKey(LOCALSTORAGE.PREFERRED_LANGUAGES));
        let noLanguageSelected = JSON.parse(getKey(LOCALSTORAGE.NO_LANGUAGE_SELECTED));
        const urls = [URL.HELP_CENTER, URL.SUBSCRIPTION, URL.SUBSCRIPTION_TRANSACTION_REDIRECT, URL.SUBSCRIPTION_TRANSACTION, URL.BALANCE_INFO, URL.TRANSACTIONS];
        const urlArr = pathname.split("/");
        let deviceRemoved = JSON.parse(getKey(LOCALSTORAGE.DEVICE_REMOVED)) === true;
        let drawerTimer = get(this.props.configResponse, "data.config.SubscriptionDrawer")
        let tickTick = get(this.props.configResponse, 'data.config.tickTickDrawerScreen.openTickTickDrawer')
        //  let {openSubscriptionDrawer,delayToOpenSubscriptionDrawer} = drawerTimer

        // if (
        //     isEmpty(userLanguage) &&
        //     !noLanguageSelected &&
        //     this.state.windowContainerWidth > MOBILE_BREAKPOINT &&
        //     !urls.some((url) => url === urlArr[1])
        //     && !deviceRemoved
        // ) {
        //     showLanguageOnboardingPopup(this.state.windowContainerWidth);
        // }
        // if (isEmpty(userInfo) && drawerTimer?.openSubscriptionDrawer){
        //     const urlArr = pathname.split("/");
        //     let { location } = this.props;
        //     let isHelpCenterPage = [URL.HELP_CENTER].includes(urlArr[1]);
        //     let fsJourney = isWebSmallPaymentLink(location);
        //     setTimeout(async()=>{
        //         (urlArr[1] === URL.HOME || !urlArr[1]) && (!fsJourney && !isHelpCenterPage) && await loginInFreemium({
        //             openPopup, closePopup, openLoginPopup, source: MIXPANEL.VALUE.APP_LAUNCH, ComponentName:MINI_SUBSCRIPTION.SELECTION_DRAWER
        //         });
        //     },drawerTimer?.delayToOpenSubscriptionDrawer)
        // }
        
        await showLangOrSubPopup(this);
        this.deleteTickTickParam();
        // if(!isUserloggedIn() && tickTick && !statusCheck){
        //     const urlArr = pathname.split("/");
        //     let { location } = this.props;
        //     let isHelpCenterPage = [URL.HELP_CENTER].includes(urlArr[1]);
        //     let fsJourney = isWebSmallPaymentLink(location);
        //     (urlArr[1] === URL.HOME || !urlArr[1]) && (!fsJourney && !isHelpCenterPage) && await loginInFreemium({
        //                   openPopup, closePopup, openLoginPopup, source: MIXPANEL.VALUE.TICK_TICK_APP_LAUNCH, ComponentName:MINI_SUBSCRIPTION.SELECTION_DRAWER
        //               });
        // }

        deviceRemoved && openTimeoutPopup(this.props.history);
        pathname && setKey(LOCALSTORAGE.CURRENT_PATH, pathname);
        deleteKey(LOCALSTORAGE.JWT_TOKEN);
    }

    logOutPreviousMSalesUser = async () => {
        let {history} = this.props;
        if (isMSalesPrevInfoExist(history)) {
            await callLogOut(false, history, false);
        }
    }

    deleteTickTickParam = () => {
        let { location, history } = this.props;
        let paramData = new URLSearchParams(this.props.location.search);
        if (paramData.has("tickTick")) {
            let liveRailId = paramData.get("liveRailId"),
            newState = liveRailId ? { railId: liveRailId } :{};
            paramData.delete('tickTick');
            paramData.delete('liveRailId');
            let newSearch = paramData.toString() || ''
            history.replace({ pathname: location.pathname, search: newSearch, state: newState })
        }
    }

    addEventListeners = () => {
        window.addEventListener("resize", this.handleOnResize);
        window.addEventListener("storage", this.handleLocalStorageUpdate);
        window.addEventListener("popstate", dropDownDismissalCases);
        window.addEventListener("click", (event) => {
            if (
                event.target &&
                (event.target.id === "app" ||
                    (event.target.parentElement &&
                        event.target.parentElement.id === "app"))
            )
                dropDownDismissalCases("closeCondition");
        });
        window.addEventListener("touchstart", (e) => { e.stopPropagation(); });
        window.addEventListener("message", (e) => {
            // this block is added to handle the scroll issue in case of S360 chatbot opened 
            //to avoid the backgoriund scrolling issue over cahtbot we have stopped scrolling of main app
            if (e?.data?.chatBotClosed === "true") {
                isMobile.any() && handleOverflowOnHtml(true);
            }
        });
    };


    loggedInUserJourney = async () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let atvUpgradeKey = JSON.parse(getKey(LOCALSTORAGE.ATV_UPGRADE));
        let {
            location: { pathname },
            history,
            getProfileDetails,
            loggedIn,
        } = this.props;
        const urlArr = pathname.split("/");
        let webSmallPaymentJourney = isWebSmallLinkPayment(location);
        if (!webSmallPaymentJourney && !userInfo?.helpCenterSilentLogin) {
            await getProfileDetails(true);
        }
        !urlArr.includes(URL.PLAYER) && atvUpgradeKey && showAtvUpgradePopup(history);
        loggedIn(true);
    };

    handleOnResize = () => {
        this.setState({
            ...this.state,
            minContainerHeight: window.innerHeight - 250,
            windowContainerWidth: window.innerWidth,
        });
        accordingToMobileShowHideDownload(this);
    };

    handleLocalStorageUpdate = () => {
        let showAtvPopup = JSON.parse(getKey(LOCALSTORAGE.ATV_UPGRADE)) === true;
        showAtvPopup && showAtvUpgradePopup(this.props.history);
    };

    checkIfDeviceIsMobile = () => {
        let screenWidth = screen.width;
        let orientation =
            (screen.orientation || {}).type ||
            screen.mozOrientation ||
            screen.msOrientation;
        if (
            orientation === "portrait-primary" ||
            orientation === "portrait-secondary"
        ) {
            return screenWidth >= 319 && screenWidth <= MOBILE_BREAKPOINT;
        } else {
            return screenWidth >= 319 && screenWidth <= 892;
        }
    };

    showTopHeaderDownload = () => {
        let { location: { pathname }, isHideDownloadHeader } = this.props;
        const urls = [URL.HELP_CENTER, URL.TRANSACTIONS, URL.SUBSCRIPTION_CAMPAIGN, URL.SUBSCRIPTION_DISCOUNT];
        const urlArr = pathname.split("/");
        const shouldShowOnUrl = !urls.includes(urlArr[1] || pathname),
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        return !isHideDownloadHeader && isMobile.any() && shouldShowOnUrl && !sourceIsMSales;
    }

    getMainContainerClass = () => {
        const { location: { pathname } } = this.props;
        const urlArr = pathname.split("/");
        let showHelpCenterHeader = [URL.HELP_CENTER].includes(urlArr[1]);
        let isPlayerScreen = [URL.PLAYER, URL.TRAILER].includes(urlArr[1]);
        let isHelpCenterPage = [URL.HELP_CENTER].includes(urlArr[1]);
        let isCampaignPage = [URL.SUBSCRIPTION_CAMPAIGN, URL.SUBSCRIPTION_DISCOUNT].includes(urlArr[1]);
        return `main-container bottom-margin ${(!showHelpCenterHeader && !isPlayerScreen && !isHelpCenterPage && !isCampaignPage) ? 'top-margin' : ''} ${checkHomePage(this) ? 'home-page' : ''} ${isPlayerScreen && this.showTopHeaderDownload() && 'margin-player'} ${isCampaignPage ? 'campaign-page-subscription' : ''}`;
    }

    trackMixpanelOnPaymentExitFlow = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PAYMENT_FLOW_EXIT,
            {
                [MIXPANEL.PARAMETER.EXIT_STATUS]: MIXPANEL.VALUE.BACKPRESSED,
                [MIXPANEL.PARAMETER.PAYMENT_METHOD]: MIXPANEL.VALUE.NOT_SELECTED,
                [MIXPANEL.PARAMETER.PAYMENT_STATUS]: MIXPANEL.VALUE.NOT_ATTEMPTED
            });
    }

    render() {
        let {
            modal: { showModal },
            setSearch,
            accountDropDown,
            switchAccountDropDown,
            history,
            header,
            notificationDropDown,
            footer,
            configResponse,
            location: { pathname },
            categoriesDropdownVal,
            categoryDropDown,
            isHideDownloadHeader,
            getPortalLink,
            showMobilePopup,
            currentSubscription,
            isManagedApp
        } = this.props;
        const urlArr = pathname.split("/");
        let { minContainerHeight, windowContainerWidth, isSubscriptionCallFinished } = this.state;
        let showHelpCenterHeader = pathname === `/${URL.HELP_CENTER}`,
            showAppHeader = !header && ![URL.HELP_CENTER, URL.SUBSCRIPTION_CAMPAIGN, URL.TRANSACTIONS, URL.SUBSCRIPTION_DISCOUNT].includes(urlArr[1]);
        return (
            <div>
                <Splash />
                {
                    <React.Fragment>
                        {
                            <>
                                 <ManagedApp />
                                 <RegionalNudge/>
                                {this.showTopHeaderDownload() && <TopHeaderDownload callBackToHideDownload={callBackToHideDownload} />}
                                <div className={`${this.showTopHeaderDownload() && "top-download-header"} ${`page-cls-${urlArr[1]}`}`}>
                                    {showHelpCenterHeader &&
                                        <HeaderHC history={history} urlArr={urlArr} />}
                                    {showAppHeader && <Header />}
                                    <div
                                        className={this.getMainContainerClass()}
                                        onClick={() => {
                                            dropDownDismissalCases("closeCondition");
                                        }}
                                        style={{ minHeight: minContainerHeight }}>

                                        <ToastContainer
                                            autoClose={3000}
                                            hideProgressBar={true}
                                            style={{ color: "#000", background: "transparent" }}
                                            limit={1}
                                            position={
                                                isMobile.any()
                                                    ? toast.POSITION.BOTTOM_CENTER
                                                    : toast.POSITION.TOP_RIGHT
                                            }
                                        />

                                        {showMobilePopup && (
                                            <BottomSheet big={true} type={BOTTOM_SHEET.LANGUAGE} />
                                        )}
                                        {!isEmpty(this.props.miniSubscription) &&
                                            <BottomSheet big={true} type={BOTTOM_SHEET.MINI_SUBSCRIPTION} />}
                                        {categoriesDropdownVal && windowContainerWidth <= 768 &&
                                            <BottomSheet big={true} type={BOTTOM_SHEET.CATEGORIES} />}
                                        {/*  {this.props.showLoginPopup && <BottomSheet big={true} type={BOTTOM_SHEET.LOGIN} />} */}
                                        {isSubscriptionCallFinished && <Switch>{createRoute(mainRoutes)}</Switch>}
                                    </div>

                                    {showModal && <Modal {...this.props.history} />}
                                    {!footer && ![URL.HELP_CENTER, URL.TRANSACTIONS, URL.SUBSCRIPTION_CAMPAIGN, URL.SUBSCRIPTION_DISCOUNT].includes(urlArr[1]) && (
                                        <Footer
                                            configResponse={configResponse}
                                            setSearch={setSearch}
                                            accountDropDown={accountDropDown}
                                            notificationDropDown={notificationDropDown}
                                            history={history}
                                            switchAccountDropDown={switchAccountDropDown}
                                            categoryDropDown={categoryDropDown}
                                        />
                                    )}
                                </div>
                            </>
                        }
                    </React.Fragment>
                }
            </div>
        );
    }
}

Main.propTypes = {
    commonContent: PropTypes.object,
    modal: PropTypes.object,
    history: PropTypes.object,
    setSearch: PropTypes.func,
    accountDropDown: PropTypes.func,
    switchAccountDropDown: PropTypes.func,
    notificationDropDown: PropTypes.func,
    getProfileDetails: PropTypes.func,
    header: PropTypes.bool,
    footer: PropTypes.bool,
    configResponse: PropTypes.object,
    location: PropTypes.object,
    fetchConfig: PropTypes.func,
    currentSubscription: PropTypes.object,
    openPopup: PropTypes.func,
    anonymousUserId: PropTypes.string,
    fetchHeaderData: PropTypes.func,
    headerItems: PropTypes.array,
    closePopup: PropTypes.func,
    closeMobilePopup: PropTypes.func,
    getCategoriesList: PropTypes.func,
    categoriesDropdownVal: PropTypes.bool,
    closeLoginPopup: PropTypes.func,
    showMobilePopup: PropTypes.bool,
    showLoginPopup: PropTypes.bool,
    newUserDetail: PropTypes.object,
    existingUserDetail: PropTypes.object,
    profileDetails: PropTypes.object,
    hideSplash: PropTypes.func,
    getCurrentSubscriptionInfo: PropTypes.func,
    loggedIn: PropTypes.func,
    categoryDropDown: PropTypes.func,
    isHideDownloadHeaderAction: PropTypes.func,
    isHideDownloadHeader: PropTypes.bool,
    fetchWatchlistItems: PropTypes.func,
    setLoginManual: PropTypes.func,
    loggedStatus: PropTypes.bool,
    modalStatus: PropTypes.bool,
    openLoginPopup: PropTypes.func,
    getNotLoggedInPack: PropTypes.func,
    openMiniSubscription: PropTypes.func,
    fromLoginLoader: PropTypes.func,
    getPortalLink: PropTypes.object,
    isManagedApp: PropTypes.bool,
    checkFallbackFlow: PropTypes.func
};

const mapStateToProps = (state) => ({
    modal: state.modal,
    header: get(state.commonContent, "header"),
    footer: get(state.commonContent, "footer"),
    configResponse: get(state.headerDetails, "configResponse"),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    anonymousUserId: get(state.headerDetails, "anonymousUserData.anonymousId"),
    headerItems: get(state, "headerDetails.headerItems.items"),
    showMobilePopup: get(state.languageReducer, 'showMobilePopup'),
    showLoginPopup: get(state.loginReducer, 'showLoginPopup'),
    newUserDetail: get(state.loginReducer, 'newUser.data'),
    existingUserDetail: get(state.loginReducer, 'existingUser.data'),
    profileDetails: get(state.profileDetails, 'userProfileDetails'),
    categoriesDropdownVal: state.headerDetails.categoriesDropdown,
    isHideDownloadHeader: state.headerDetails.isHideDownloadHeader,
    loggedStatus: get(state.commonContent, 'loggedStatus'),
    modalStatus: get(state.modal, 'showModal'),
    miniSubscription: get(state.subscriptionDetails, 'miniSubscription'),
    getPortalLink: get(state.subscriptionDetails, "getPortalLink"),
    isManagedApp: get(state.headerDetails, "isManagedApp"),
});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(
            {
                getProfileDetails,
                setSearch,
                accountDropDown,
                switchAccountDropDown,
                notificationDropDown,
                fetchConfig,
                openPopup,
                fetchHeaderData,
                closePopup,
                closeMobilePopup,
                getCategoriesList,
                closeLoginPopup,
                hideSplash,
                getCurrentSubscriptionInfo,
                loggedIn,
                categoryDropDown,
                isHideDownloadHeaderAction,
                fetchWatchlistItems,
                setLoginManual,
                openLoginPopup,
                getNotLoggedInPack,
                openMiniSubscription,
                getPackListing,
                openMobilePopup,
                fromLoginLoader,
                getWebPortalLink,
                getWebPortalBackLink,
                checkFallbackFlow
            },
            dispatch,
        ),
    };
};
export default NetworkDetector(
    Analytics(withRouter(connect(mapStateToProps, mapDispatchToProps)(Main)))
);
