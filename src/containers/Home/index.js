import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import InfiniteScroll from 'react-infinite-scroll-component';

import {
    checkIsUserSubscribed,
    ftvWOEvents,
    getAnalyticsSource,
    getPackInfo,
    isMobile,
    isPartnerSubscribed,
    isUserloggedIn,
    removeLAExpiredData,
    safeNavigation,
    deletePaymentKeysFromLocal,
    setSavedLanguages,
    handleSilentLogout,
    getFormattedURLValue,
    getSEOData
} from "@utils/common";
import { hideFooter, hideHeader, hideMainLoader, showMainLoader } from "@src/action";
import {
    accountDropDown,
    fetchHeaderData,
    isHomePage,
    loginPopupState,
    notificationDropDown,
    setSearch,
} from '@components/Header/APIs/actions';

import HeroBanner from '../../components/HeroBanner/index';
import Listing from '../../common/Listing/index';
import { fetchHomeData, getTAHeroBanner, resetHomeData } from './APIs/actions';
import { fetchHomeDataHeirarachy, getRailContent } from './APIs/newAction';
import URL from "@environment/index";
import { URL as ROUTE_URL } from "@constants/routeConstants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import './style.scss';
import PartnerHomePageBar from "@containers/PartnerHomePageBar";
import { LOCALSTORAGE, SECTION_TYPE } from "@constants";
import moengageConfig from "@utils/moengage";
import { deleteKey, getKey, setKey } from "@utils/storage";
import { closePopup, openPopup } from "@common/Modal/action";
import { dunningRecharge } from "@containers/PackSelection/APIs/action";
import { MODALS } from "@common/Modal/constants";
import {
    createCancelSubscriberAccount,
    getAccountDetailsFromSid,
    inactivePopupOpened,
} from "@containers/BingeLogin/APIs/action"
import { getDeviceStatus, handleDeviceCancelledUser } from "@utils/cancellationFlowCommon";
import { BOTTOM_SHEET } from "@utils/constants";
import CategoryDropdown from "@components/Header/CategoryDropdown";
import PaginationLoader from '@src/common/PaginationLoader';
import isEmpty from 'lodash/isEmpty';
import { clearWatchlistData } from "@containers/Watchlist/API/action";
import MainSeo from '@common/MainSeo';
import { DRP_STATE } from './APIs/constants';
import {getCurrentSubscriptionInfo} from "@containers/Subscription/APIs/action";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            apiUrl: '',
            limit: 10,
            offset: 0,
            getHomePageDetails: this.getHomePageDetails.bind(this),
            isPartnerPage: false,
            metaTitle: '',
            metaDescription: '',
            drpState: '',
            homePageDetailApiCounter:0
        }
    }

    componentDidMount = async () => {
        let isSilentLogout = JSON.parse(getKey(LOCALSTORAGE.IS_SILENT_LOGOUT));
        isSilentLogout && handleSilentLogout();
        setKey(LOCALSTORAGE.USER_LANGUAGE_UPDATED, JSON.stringify(false)) // fix for duplicate rails when language updated from settings.
        window.addEventListener('resize', this.handleOnResize);
        window.scrollTo(0, 0);
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;//for ios device
        }, 0)
        const login = get(this.props.location.state, 'login');
        let { match: { params: { provider } }, loginPopupState, hideHeader, hideFooter, header, footer, isHomePage, getCurrentSubscriptionInfo } = this.props;
        header && hideHeader(false);
        footer && hideFooter(false);
        let { homeScreenFilteredDataItems, resetHomeData } = this.props;
        !isEmpty(homeScreenFilteredDataItems) && resetHomeData();

        isUserloggedIn() && isEmpty(this.props.currentSubscription) && await getCurrentSubscriptionInfo();
        //homePageDetailApiCounter is added to handle duplicate data push in homedetail reducer state{homeScreenDataItems}
        this.state.homePageDetailApiCounter < 1 && await this.getHomePageDetails(); 

        deleteKey(LOCALSTORAGE.TVOD_DATA);
        this.trackEvents(provider);
        login && loginPopupState(false);
        this.showFireStickPopup();
        window.addEventListener("storage", this.handleLocalStorageUpdate);
        await this.handleCancelledUser();
        isHomePage(true);
        deleteKey(LOCALSTORAGE.IS_PAYMENT_FROM_SUBSCRIPTION);
        // if (JSON.parse(getKey(LOCALSTORAGE.IS_TSWALLET_PAYMENT_MODE_SUCCESS))) {
        //     this.showPaymentSuccessPopup();
        // }
        let fsJourney = JSON.parse(getKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY)) === true;
        fsJourney && deleteKey(LOCALSTORAGE.FS_PAYMENT_JOURNEY);
        this.getSEOMappedData();
    };

    componentDidUpdate = async (prevProps) => {
        //window.scrollTo(0, 0);
        let { location: { pathname }, selectedLanguages, currentSubscriptionResponse = {}, currentSubscription = {} } = this.props;
        const urlArr = pathname.split('/');
        // const mountHomeScreenLoggedInState = (this.props.loggedStatus !== prevProps.loggedStatus) && this.props.loggedStatus;
        const mountHomeScreenLoggedOutState = (this.props.loggedStatus !== prevProps.loggedStatus) && !this.props.loggedStatus;
        const pathDifferent = prevProps.location.pathname !== this.props.location.pathname;
        const headerItemsResponse = !isUserloggedIn() && urlArr[1].toUpperCase() !== ROUTE_URL.CATEGORIES.toUpperCase() &&
            this.props.headerItems !== undefined && (prevProps.headerItems !== this.props.headerItems);
        const isUserLangUpdated = JSON.parse(getKey(LOCALSTORAGE.USER_LANGUAGE_UPDATED)) === true && !pathDifferent;
        const isCurrentSubUpdated = (currentSubscriptionResponse?.code !== prevProps?.currentSubscriptionResponse?.code) || (currentSubscription?.productName !== prevProps?.currentSubscription?.productName);
        // isCurrentSubUpdated: Should update home data basis on the packname in latest current subscription

        if (mountHomeScreenLoggedOutState || pathDifferent || headerItemsResponse || isUserLangUpdated || isCurrentSubUpdated) {
            await this.resetHomeState();
            isUserLangUpdated && setKey(LOCALSTORAGE.USER_LANGUAGE_UPDATED, JSON.stringify(false));
            (this.state.homePageDetailApiCounter < 1 ) && await this.fetchHomeDataOnUpdate();
            this.getSEOMappedData();
        }
    }

    componentWillUnmount() {
        this.props.resetHomeData();
        this.props.clearWatchlistData();
        this.resetHomeState();
        window.addEventListener('resize', this.handleOnResize);
        window.removeEventListener('scroll', this.handleFetchMoreData);
        window.removeEventListener('storage', this.handleLocalStorageUpdate);
        this.props.isHomePage(false);
    }

    getSEOMappedData = () => {
        let { location: { pathname } } = this.props;
        let { metaTitle, metaDescription } = getSEOData(pathname);
        this.setState({
            metaTitle,
            metaDescription,
        });
    }

    fetchHomeDataOnUpdate = async () => {
        let {selectedLanguages } = this.props;
        this.resetHomeState();
        await this.getHomePageDetails();
        !(!!selectedLanguages) && await setSavedLanguages();
    }

    handleCancelledUser = async () => {
        let { location: { pathname } } = this.props;
        const urlArr = pathname.split('/');
        if (urlArr[1].toUpperCase() !== ROUTE_URL.PARTNER.toUpperCase()) {
            const handleCancelledUser = getDeviceStatus();
            handleCancelledUser && await handleDeviceCancelledUser(this.props.history, false, MIXPANEL.VALUE.HOME);
        }
    }

    handleOnResize = () => {
        let appBodyWidth = document.body.clientWidth;
        let scrollDivHeight = document.getElementById('scroll') && document.getElementById('scroll').clientHeight;
        (appBodyWidth && scrollDivHeight) && appBodyWidth > 2060 && (scrollDivHeight > 800 && scrollDivHeight < 3000) && this.fetchMoreData();
    };

    handleLocalStorageUpdate = () => {
        let showPopup = JSON.parse(getKey(LOCALSTORAGE.SHOW_FS_POPUP)) === true;
        showPopup && this.showFireStickPopup();
    };

    trackEvents = (provider) => {
        let { providerId } = this.props.match.params;
        let { isPartnerPage } = this.state;
        let subscribed = checkIsUserSubscribed(isPartnerPage, providerId);

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.HOME_PAGE_VIEW, {
            [`${MIXPANEL.PARAMETER.NAME}`]: isPartnerPage ? `${provider}-Home` : getAnalyticsSource(this.props.location.pathname, MIXPANEL),
            [`${MIXPANEL.PARAMETER.VIEW_TYPE}`]: subscribed ? MIXPANEL.VALUE.SUBSCRIBED : MIXPANEL.VALUE.UNSUBSCRIBED,
        });
        moengageConfig.trackEvent(MOENGAGE.EVENT.HOME_PAGE_VIEW, {
            [`${MOENGAGE.PARAMETER.NAME}`]: isPartnerPage ? `${provider}-Home` : getAnalyticsSource(this.props.location.pathname, MOENGAGE),
            [`${MOENGAGE.PARAMETER.VIEW_TYPE}`]: subscribed ? MOENGAGE.VALUE.SUBSCRIBED : MOENGAGE.VALUE.UNSUBSCRIBED_SMALL,
        });
    };

    /*bingeAccountScenarios = async () => {
       const {history, inactivePopupOpened} = this.props;
       if (await this.checkForOpenDunningPopup()) {
           const {dunningRechargeData} = this.props;
           openRechargePopUp(history, dunningRechargeData);
           inactivePopupOpened(true);
       } else if (this.checkForOpenRechargePopup()) {
           let header = 'Recharge';
           let btnText = 'Proceed';
           let instructions = 'Your Tata Sky Binge subscription is inactivate due to insufficient balance. Proceed to recharge and activate your subscription.';
           openRechargePopUp(history, false, false, false, {header, instructions, btnText});
           inactivePopupOpened(true);
       } else if (getKey('inactive')) {
           deleteKey('inactive');
       }
   }*/

    /*/!**
     * check For Open Recharge Popup when user account is deactivate and not mobile and user and popup opened once      * is on home page
     * return boolean
     *!/
    checkForOpenRechargePopup = () => {
        const {subscribed} = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let {location: {pathname}, inactivePopup} = this.props;
        let pathNameLowerCase = pathname.toLowerCase();
        return !inactivePopup && !isMobile.any() && !getKey('inactive') &&
            (subscribed === ACCOUNT_STATUS.DEACTIVE || subscribed === ACCOUNT_STATUS.DEACTIVATED) &&
            (pathNameLowerCase.includes(ROUTE_URL.HOME) || pathNameLowerCase === ROUTE_URL.DEFAULT)
    }*/

    /*/!**
     * check for dunning case when user account is about to deactive
     *!/
    checkForOpenDunningPopup = async () => {
        const {bingeAccountStatus} = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let {location: {pathname}, inactivePopup} = this.props;
        let pathNameLowerCase = pathname.toLowerCase();
        if (bingeAccountStatus === ACCOUNT_STATUS.ACTIVE && !getKey('inactive') && !isMobile.any() && (pathNameLowerCase.includes(ROUTE_URL.HOME) || pathNameLowerCase === ROUTE_URL.DEFAULT) && !(inactivePopup)) {
            const {dunningRecharge} = this.props;
            await dunningRecharge();
            const {dunningRechargeData} = this.props
            if (dunningRechargeData && dunningRechargeData.code === 0) {
                return true;
            }
        }
        return false;
    };*/

    showFireStickPopup = () => {
        let { openPopup, currentSubscription, history, closePopup } = this.props;
        let showPopup = JSON.parse(getKey(LOCALSTORAGE.SHOW_FS_POPUP)) === true;
        let popupShownOnce = JSON.parse(getKey(LOCALSTORAGE.FS_POPUP_SHOWN));
        let packPrice = currentSubscription?.amountValue
        if (showPopup && (popupShownOnce === null || !popupShownOnce) && currentSubscription && currentSubscription.fsEligibility && !currentSubscription.fsTaken && !currentSubscription.fSRequestRaised && !currentSubscription.downgradeRequested) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.FTV_UPSELL_VIEW, {
                [MIXPANEL.PARAMETER.PACK_PRICE]: packPrice
            });
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: "alert-modal fsEdition ",
                headingMessage: "<img src='../../assets/images/Firetv.png' alt=''/>",
                instructions: 'Get Amazon Fire TV Stick – Tata Play Edition at no extra cost',
                isHtml: true,
                hideCloseIcon: true,
                primaryButtonText: "Avail Now",
                primaryButtonAction: () =>
                    safeNavigation(history, `/${ROUTE_URL.FIRE_TV_INSTALLATION}`),
                secondaryButtonText: "Remind Me Later",
                secondaryButtonAction: () => {
                    closePopup();
                    ftvWOEvents(false);
                },
                closeModal: true,
            });
            setKey(LOCALSTORAGE.SHOW_FS_POPUP, JSON.stringify(false));
            setKey(LOCALSTORAGE.FS_POPUP_SHOWN, JSON.stringify(true));
        }
    };

    resetHomeState = async () => {
       await this.setState({
            apiUrl: '', limit: 10, offset: 0, homePageDetailApiCounter: 0
        })
    };

    paginateHomePage = () => {
        const { homeScreenFilteredDataItems, homeScreenData, homeScreenDataItems } = this.props;
        if (homeScreenFilteredDataItems.length < 7 && homeScreenDataItems.length < homeScreenData?.length) {
            this.fetchMoreData();
        }
    }

    homeUrl = (page) => { // API URL on the basis of drp enabled , and user logged in or guest
        let { bingeWebDrpEnabled, drpPartnerPages} = this.props;

        if (page === "") {
            page = ROUTE_URL.HOME
        }
        let drpPageEnabled = drpPartnerPages?.includes(page.toUpperCase()) && bingeWebDrpEnabled;

        if (isUserloggedIn() && drpPageEnabled) {
            this.setState({
                drpState: DRP_STATE.TA,
            })
            return URL.HOME_MENU_URL_TA
        }
        else if (drpPageEnabled) {
            this.setState({
                drpState: DRP_STATE.TA_GUEST,
            })
            return URL.HOME_MENU_URL_TA_GUEST
        }
        else {
            this.setState({
                drpState: DRP_STATE.VR,
            })
            return URL.HOME_MENU_URL_VR
        }
    }

    getHomePageDetails = async () => {
        let { location: { pathname }, } = this.props;
        const urlArr = pathname.split('/');
        removeLAExpiredData();

        if (urlArr[1].indexOf(ROUTE_URL.PARTNER) !== -1) {
            let { providerId, provider } = this.props.match.params;
            let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO));
            let data = partnerInfo && partnerInfo.find && partnerInfo.find(i => parseInt(i.partnerId) === parseInt(providerId));

            this.setState({
                apiUrl: `${this.homeUrl(provider)}${data?.pageType}`, isPartnerPage: true,
                limit: this.state.limit + 10,
                homePageDetailApiCounter: this.state.homePageDetailApiCounter + 1
            }, async () => {

                let homeData = {
                    apiUrl: this.state.apiUrl,
                    limit: this.state.limit,
                    offset: this.state.offset,
                    pageType: data?.pageType,
                    isPartnerPage: this.state.isPartnerPage,
                    providerId: providerId,
                    provider: provider,
                    anonymousId: this.props.anonymousUserId,
                    drpState: this.state.drpState,
                };
                await this.props.fetchHomeDataHeirarachy(homeData)
                // await this.paginateHomePage();
                // this.handleOnResize();
            })
        } else {
            let { headerItems, categoriesList } = this.props;

            let selectedTabDetails = headerItems && headerItems.find((item) => {
                if (item.pageName.toLowerCase() === urlArr[1].toLowerCase()) {
                    return item
                }
                if (pathname.toLowerCase() === ROUTE_URL.DEFAULT && item.pageName.toLowerCase() === ROUTE_URL.HOME) {
                    return item;
                }
            });

            let selectedTabDetailCategory = urlArr[1] === BOTTOM_SHEET.CATEGORIES.toLowerCase() &&
                categoriesList?.items && categoriesList?.items.find((item) => {
                    let pageName = getFormattedURLValue(item?.pageName);
                    if (pageName === urlArr[2]?.toLowerCase()) {
                        return item;
                    }
                });

            let pageType = urlArr[1] === BOTTOM_SHEET.CATEGORIES.toLowerCase() ? selectedTabDetailCategory?.pageType : selectedTabDetails?.pageType;

            selectedTabDetails && this.setState({
                apiUrl: `${this.homeUrl(urlArr[1] === BOTTOM_SHEET.CATEGORIES.toLowerCase() ? urlArr[2].toLowerCase() : urlArr[1].toLowerCase())}${pageType}`,
                limit: this.state.limit + 10, //first time pagination of 20 rail renders
                homePageDetailApiCounter: this.state.homePageDetailApiCounter + 1
            }, async () => {
                let homeData = {
                    apiUrl: this.state.apiUrl,
                    limit: this.state.limit,
                    offset: this.state.offset,
                    pageType: pageType,
                    isPartnerPage: this.state.isPartnerPage,
                    providerId: "",
                    provider: "",
                    anonymousId: this.props.anonymousUserId,
                    drpState: this.state.drpState,
                };
                await this.props.fetchHomeDataHeirarachy(homeData)
                // await this.props.fetchHomeData(homeData);
                // await this.paginateHomePage();
                // this.handleOnResize();
            });

            typeof selectedTabDetails === 'undefined' && headerItems && this.setState({
                apiUrl: `${this.homeUrl("")}${headerItems[0].pageType}`,
                limit: this.state.limit + 10,
                homePageDetailApiCounter: this.state.homePageDetailApiCounter + 1
            }, async () => {
                let homeData = {
                    apiUrl: this.state.apiUrl,
                    limit: this.state.limit,
                    offset: this.state.offset,
                    pageType: headerItems[0].pageType,
                    isPartnerPage: this.state.isPartnerPage,
                    providerId: '',
                    anonymousId: this.props.anonymousUserId,
                    drpState: this.state.drpState,
                };
                // await this.props.fetchHomeData(homeData);
                await this.props.fetchHomeDataHeirarachy(homeData)
                // await this.paginateHomePage();
                // this.handleOnResize();
            })
        }

    };

    handleFetchMoreData = () => {
        let scrollableElement = document.getElementById('app');
        if (scrollableElement.scrollHeight - scrollableElement.scrollTop === scrollableElement.clientHeight) {
            this.fetchMoreData();
        }
    };

    fetchMoreData = () => {
        let { limit, offset, isPartnerPage } = this.state;
        let { provider } = this.props?.match?.params;
        const { anonymousUserId, homeScreenHeirarchyResponse } = this.props;
        let providerId = isPartnerPage ? this.props.match.params.providerId : '';
        let pageType = '';
        let providerInfo = ""
        if (isPartnerPage) {
            let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO));
            let data = partnerInfo && partnerInfo.find && partnerInfo.find(i => parseInt(i.partnerId) === parseInt(providerId));
            pageType = data.pageType;
            providerInfo = provider;
        }
        this.setState({
            offset: limit + offset,
            limit: 10,
        }, async () => {
            let homeData = {
                apiUrl: this.state.apiUrl,
                limit: this.state.limit,
                offset: this.state.offset,
                pageType: pageType,
                isPartnerPage: isPartnerPage,
                providerId: providerId,
                showLoader: false,
                anonymousId: anonymousUserId,
                provider: providerInfo,
                drpState: this.state.drpState,
            };

            getRailContent(homeScreenHeirarchyResponse, homeData, true)
            // await this.paginateHomePage()
            // this.handleOnResize();
        })
    };

    isPartnerSubscribed = () => {
        let { packExpired } = getPackInfo();
        let { providerId } = this.props.match.params;
        let subscribed = false;

        if (packExpired) {
            return false;
        }
        subscribed = isPartnerSubscribed(providerId);
        return subscribed;
    }

    getAnalyticsData = (analytics = MIXPANEL) => {
        let { currentSubscription } = this.props;
        return {
            [`${analytics.PARAMETER.PACK_NAME}`]: currentSubscription?.productName,
            [`${analytics.PARAMETER.PACK_TYPE}`]: currentSubscription?.subscriptionType,
            [`${analytics.PARAMETER.PAYMENT_TYPE}`]: currentSubscription?.paymentMode,
            [`${analytics.PARAMETER.PAYMENT_METHOD}`]: currentSubscription?.paymentMethod,
            [`${analytics.PARAMETER.SOURCE}`]: currentSubscription?.paymentMethod,
        };

    };

    render() {
        let {
            homeScreenFilteredDataItems,
            currentSubscription,
            showModal,
            showMobilePopup,
            homeScreenDataItems,
            homeScreenHeirarchyResponse,
        } = this.props;
        const heirarchResponseLength = homeScreenHeirarchyResponse?.length
        let heroBannerItems = homeScreenFilteredDataItems && homeScreenFilteredDataItems.filter(item => item.sectionType === SECTION_TYPE.HERO_BANNER);
        let { provider, providerId } = this.props.match.params;
        let subscribed = this.state.isPartnerPage && isUserloggedIn() && this.isPartnerSubscribed();

        return (<React.Fragment>
            <MainSeo
                metaTitle={this.state.metaTitle}
                metaDescription={this.state.metaDescription}
            />
            <div className={`home-container ${heroBannerItems.length === 0 ? 'handle-top' : ''}`}>
                {this.props.categoriesDropdownVal && <CategoryDropdown />}
                {!!heroBannerItems.length && <HeroBanner heroBannerItems={heroBannerItems && heroBannerItems[0]}
                    isPartnerPage={this.state.isPartnerPage}
                    partnerSubscribed={subscribed}
                />}
                {this.state.isPartnerPage && <PartnerHomePageBar currentSubscription={currentSubscription}
                    heroBannerItems={heroBannerItems && heroBannerItems[0]} />}
                {homeScreenHeirarchyResponse && homeScreenDataItems && <div id={'scroll'}>
                    <InfiniteScroll
                        dataLength={homeScreenDataItems && homeScreenDataItems.length}
                        next={this.fetchMoreData}
                        hasMore={homeScreenDataItems.length > 0 && homeScreenDataItems.length < heirarchResponseLength}
                        loader={<PaginationLoader />}
                        scrollThreshold={isMobile.any() ? 0.3 : 0.5}
                    >
                        <Listing items={homeScreenFilteredDataItems} analyticsHomeEvent={true}
                            isPartnerPage={this.state.isPartnerPage} showMobilePopup={showMobilePopup}
                            showModal={showModal}
                            provider={provider} providerId={providerId} pageType="home" />
                    </InfiniteScroll>
                </div>}
            </div>
        </React.Fragment>)
    }
}

const mapStateToProps = (state) => ({
    headerItems: get(state, 'headerDetails.headerItems.items'),
    bingeWebDrpEnabled: get(state, "headerDetails.configResponse.data.config.bingeWebDrpEnabled"),
    drpPartnerPages: get(state, "headerDetails.configResponse.data.config.drpPartnerPages"),
    homeScreenHeirarchyResponse: get(state, 'homeDetails.homeScreenHeirarchyData'),
    homeScreenData: get(state, 'homeDetails.homeScreenData'),
    homeScreenFilteredDataItems: get(state, 'homeDetails.homeScreenFilteredDataItems'),
    homeScreenDataItems: get(state, 'homeDetails.homeScreenDataItems'),
    dunningRechargeData: get(state, 'homeDetails.dunningRecharge'),
    postSwitchAccountResponse: get(state.switchAccountDetails, 'postSwitchAccountResponse'),
    taHeroBanner: get(state, 'homeDetails.taHeroBanner'),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    inactivePopup: get(state.bingeLoginDetails, 'inactivePopup'),
    header: get(state.commonContent, 'header'),
    footer: get(state.commonContent, 'footer'),
    accountDetailsFromSid: get(state.bingeLoginDetails, 'accountDetailsFromSid'),
    anonymousUserId: get(state.headerDetails, 'anonymousUserData.anonymousId'),
    newUserDetail: get(state.loginReducer, 'newUser.data'),
    existingUserDetail: get(state.loginReducer, 'existingUser.data'),
    categoriesList: get(state.headerDetails, "categoriesList"),
    showMobilePopup: get(state.languageReducer, 'showMobilePopup'),
    showModal: state.modal.showModal,
    loggedStatus: state.commonContent.loggedStatus,
    selectedLanguages: get(state.languages, 'selectedLanguage.data'),
    currentSubscriptionResponse: get(state.subscriptionDetails, 'currentSubscription'),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            showMainLoader,
            hideMainLoader,
            setSearch,
            accountDropDown,
            notificationDropDown,
            fetchHomeDataHeirarachy,
            fetchHomeData,
            fetchHeaderData,
            resetHomeData,
            loginPopupState,
            getTAHeroBanner,
            dunningRecharge,
            openPopup,
            inactivePopupOpened,
            hideHeader,
            hideFooter,
            closePopup,
            getAccountDetailsFromSid,
            createCancelSubscriberAccount,
            isHomePage,
            clearWatchlistData,
            getCurrentSubscriptionInfo,
        }, dispatch),
    }
}

Home.propTypes = {
    item: PropTypes.object,
    homeScreenData: PropTypes.object,
    homeScreenFilteredDataItems: PropTypes.array,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    fetchHomeDataHeirarachy: PropTypes.func,
    homeScreenHeirarchyResponse: PropTypes.any,
    getRailContent: PropTypes.func,
    drpPartnerPages: PropTypes.array,
    bingeWebDrpEnabled: PropTypes.bool,
    fetchHomeData: PropTypes.func,
    accountDropDown: PropTypes.func,
    setSearch: PropTypes.func,
    notificationDropDown: PropTypes.func,
    location: PropTypes.object,
    headerItems: PropTypes.array,
    resetHomeData: PropTypes.func,
    postSwitchAccountResponse: PropTypes.object,
    match: PropTypes.object,
    loginPopupState: PropTypes.func,
    fetchHeaderData: PropTypes.func,
    history: PropTypes.object,
    dunningRechargeData: PropTypes.object,
    dunningRecharge: PropTypes.func,
    openPopup: PropTypes.func,
    currentSubscription: PropTypes.object,
    inactivePopup: PropTypes.object,
    inactivePopupOpened: PropTypes.func,
    header: PropTypes.bool,
    footer: PropTypes.bool,
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    closePopup: PropTypes.func,
    getAccountDetailsFromSid: PropTypes.func,
    createCancelSubscriberAccount: PropTypes.func,
    accountDetailsFromSid: PropTypes.object,
    anonymousUserId: PropTypes.string,
    newUserDetail: PropTypes.object,
    existingUserDetail: PropTypes.object,
    categoriesList: PropTypes.object,
    categoriesDropdownVal: PropTypes.bool,
    homeScreenDataItems: PropTypes.array,
    showModal: PropTypes.bool,
    showMobilePopup: PropTypes.bool,
    isHomePage: PropTypes.func,
    loggedStatus: PropTypes.bool,
    getCurrentSubscriptionInfo: PropTypes.func,
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(Home);
