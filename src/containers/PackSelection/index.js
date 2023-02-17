import React, {Component} from 'react';
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import queryString from 'querystring';
import isEmpty from 'lodash/isEmpty';
import {Link} from "react-router-dom";

import webSmallLogoImage from "@assets/images/web-amall-login-logo.png";
import ProgressBar from "@common/ProgressBar";
import Button from "@common/Buttons";
import {MODALS} from "@common/Modal/constants";
import {closePopup, openPopup} from "@common/Modal/action";
import {LOCALSTORAGE, PACK_TYPE, SUBSCRIPTION_TYPE} from "@constants";
import {URL} from "@constants/routeConstants";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import {cancelPack} from "@containers/MySubscription/APIs/action";
import {ACCOUNT_STATUS, WEB_SMALL_LOGIN_STEP} from "@containers/BingeLogin/APIs/constants";
import {
    getBalanceInfo,
    getCurrentSubscriptionInfo,
    packListing,
    quickRecharge,
} from "@containers/PackSelection/APIs/action";
import {hideMainLoader, showMainLoader} from "@src/action";
import {getKey} from "@utils/storage";
import {isMobile, queryStringToObject, safeNavigation, showNoInternetPopup} from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";

import {SUBSCRIPTION_CHANGE_MODAL} from './constant';
import SubscriptionSummaryModal from './SubscriptionSummaryModal';
import FreeTrialPack from './FreeTrialPack';
import {createSubscription} from "./APIs/action";
import {openLowBalancePopUp} from './APIs/common'

import './style.scss';
import SubscriptionWebSmallHeader from "@containers/MySubscription/SubscriptionWebSmallHeader";
import appsFlyerConfig from '@utils/appsFlyer';
import APPSFLYER from '@utils/constants/appsFlyer';

class PackSelection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            packList: null,
            currentlySubscribedPackId: null,
            currentlySubscribedPackAlternateId: null,
            select: 1,
            showSubscriptionSummary: false,
            selectedItem: null,
            activeCase: false,
            partnerLeastPack: null,
            basePackProvidersLength: null,
            callSubscription: false,
            analyticsSource: '',
            modificationType: '',
        };
        this.urlChange = false;
    }

    componentDidMount = () => {
        this.onMountHandler();
    }

    componentDidUpdate = () => {
        //window.scrollTo(0, 0);
        const {location, currentSubscription: {data} = {}, packList} = this.props;
        let search = queryString.parse(location.search),
            aboutSubscription = search['aboutSubscription'],
            contentRecharge = search['contentRecharge'],
            modifyAboutSubscription = search['modifyAboutSubscription'];

        if (aboutSubscription === 'true' && !this.urlChange) {
            if (this.state.showSubscriptionSummary) {
                setTimeout(() => this.setState({showSubscriptionSummary: false}, async () => {
                    // about your subscription from recharge popup
                    let packId = !isEmpty(data) ? data.packId : packList.data.defaultPackId;
                    await this.getBalanceData(packId, 'aboutSubscription');
                }), 0);
            }
            if (!(contentRecharge && contentRecharge === 'true')) {
                this.changeRoute();
            }
            this.urlChange = false;
        }

        if(modifyAboutSubscription === 'true' && !this.urlChange) {
            this.setInitialValues(packList);
            this.urlChange = true;
        }
    }

    /**
     * @function onMountHandler:- set initial state
     * @returns
     */
    onMountHandler = async () => {
        const {
            packListing, newUserDetails, existingUserDetails, getCurrentSubscriptionInfo, currentSubscription,
            history, location, showMainLoader, hideMainLoader,
        } = this.props;
        if (isEmpty(currentSubscription) && isEmpty(newUserDetails) && isEmpty(existingUserDetails)) {
            safeNavigation(history, URL.MY_SUBSCRIPTION);
            return;
        }
        showMainLoader();
        await getCurrentSubscriptionInfo();
        await packListing();
        hideMainLoader();

        const {currentSubscription: {data} = {}, packList = {}, getBalanceInfo} = this.props;
        let packId;

        // about your subscription from recharge popup
        if (!isEmpty(location.state) && location.state.subscription) {
            //current subscription expired or no subscription exist
            showMainLoader();
            packId = !isEmpty(data) ? data.packId : packList.data.defaultPackId;
            await getBalanceInfo(packId);
            hideMainLoader();

            if (this.props.balanceInfo.code !== 0) {
                this.balanceErrorPopup('aboutSubscription');
                return;
            }
        }
        this.setInitialValues(packList);
        this.selectPartnerPack();

        let search = queryStringToObject(location.search);
        let source = search.source;

        this.setState({
            analyticsSource: source,
        });

        if (!this.state.showSubscriptionSummary && (isEmpty(location.state))) {
            moengageConfig.trackEvent(MOENGAGE.EVENT.PACK_SELECTION_INITIATE, {
                [`${MOENGAGE.PARAMETER.SOURCE}`]: source || '',
                /**
                 * Needs to be changed when nudge will be integrated
                 */
                [`${MOENGAGE.PARAMETER.IS_FROM_NUDGE}`]: MOENGAGE.VALUE.NO,
            });
        }
    }


    /**
     * @function getBalanceData
     * @param packId
     * @param redirectionCheck
     * @returns {Promise<void>}
     */
    getBalanceData = async (packId, redirectionCheck) => {
        const {showMainLoader, hideMainLoader, getBalanceInfo} = this.props;
        showMainLoader();
        await getBalanceInfo(packId);
        hideMainLoader();
        if (this.props.balanceInfo.code !== 0) {
            this.balanceErrorPopup(redirectionCheck);
        }
    }


    /**
     * @function changeRoute
     */
    changeRoute = () => {
        const {location, history} = this.props;
        let search = queryString.parse(location.search);
        let newSearch = `?source=${search['?source']}`;
        let path = {
            pathname: location.pathname,
            search: newSearch,
        }
        if (location.state) {
            path.state = location.state;
        }
        safeNavigation(history, path);
        this.urlChange = true;
    }


    /**
     * @function selectPartnerPack
     */
    selectPartnerPack = () => {
        const {packList, location} = this.props;
        let data = [],
            search = queryString.parse(location.search),
            providerId = search['?partnerId'];

        if (packList?.code === 0) {
            let packData = get(packList, 'data.packList');
            packData.forEach(item => {

                let status = item.providers && item.providers.some(i => {
                    return parseInt(i.providerId) === parseInt(providerId);
                });

                status && data.push({
                    packId: item.packId,
                    price: item.price,
                    alternatePackId: item.alternatePackId,
                })
            });
        }

        let price = !isEmpty(data) && data.reduce(function (prev, current) {
            return (prev.price < current.price) ? prev : current
        });

        this.setState({partnerLeastPack: price});
    }


    /**
     * @function setInitialValues:- to set some state values on response of packListing API
     * @param packList
     */
    setInitialValues = (packList) => {
        const {currentSubscription: {data} = {}, location} = this.props;
        if (packList?.code === 0) {
            const {
                alternatePackId,
                expirationDate,
                packId,
                bingeAccountStatus,
            } = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));

            // alternate pack id is paid pack id for free user
            const currentPackId = data && get(data, 'packType') && data.packType.toLowerCase() === PACK_TYPE.FREE ? alternatePackId : packId ? packId : null;

            this.setState({
                packList: packList.data,
                currentlySubscribedPackId: packId,
                currentlySubscribedPackAlternateId: alternatePackId,
                expirationDate: !isEmpty(data) ? data.expirationDate : expirationDate,
                bingeAccountStatus: !isEmpty(data) ? data.status : bingeAccountStatus,
                selectedItem: this.selectDefaultPack(packList.data),
            }, () => {
                isEmpty(location.state) && isMobile.any() && this.state.selectedItem && this.selectedPack(this.state.selectedItem);
                this.getBasePackPartners();
                if (isEmpty(data)) {
                    this.setState({
                        currentlySubscribedPackId: packList.data.defaultPackId,
                    })
                }
            });
        }
    }

    /**
     * @function checkSelectedPack
     * @param item
     * @param listClick
     * @param fromFreeTrialScreen - in case this func is called from FreeTrialPack,
     * we need to call create API i.e written in second if condition
     */
    checkSelectedPack = async (item, listClick, fromFreeTrialScreen = false) => {
        const {openPopup, closePopup, currentSubscription, history} = this.props;
        let {packList} = this.state;
        let fsEligibilityCheck = (item && !item.fsEligibility);
        let statusCheck = (get(currentSubscription, 'data.status') === ACCOUNT_STATUS.WRITTEN_OFF);
        let eligibleForUpgrade = (get(packList, 'eligibleForUpgrade'));
        const currentPackPrice = get(currentSubscription, 'data.packPrice');

        const {dthStatus} = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));

        let updatedDthStatus = this.props?.packList?.data?.subscriberAccountStatus?.toUpperCase() ? this.props?.packList?.data?.subscriberAccountStatus?.toUpperCase() : dthStatus;
        //Check if user has no pack or cancelled free pack
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        if ((isEmpty(currentSubscription?.data) || statusCheck || (!isEmpty(currentSubscription?.data)
                && currentSubscription?.data?.cancelled && currentSubscription?.data?.packType.toLowerCase() === PACK_TYPE.FREE)) &&
            updatedDthStatus === ACCOUNT_STATUS.ACTIVE && !this.props?.packList?.data?.sufficientBalance) {
            openLowBalancePopUp(this.props, this.props?.packList?.data);

        } else if (!userInfo.freeTrialAvailed && fromFreeTrialScreen) {
            await createSubscription(item.packId);
        } else if ((isEmpty(currentSubscription.data) || statusCheck) && eligibleForUpgrade && fsEligibilityCheck) {
            /*if ((eligibleForUpgrade && (isEmpty(currentSubscription.data) && fsEligibilityCheck) || (fsEligibilityCheck && statusCheck))) {*/
            let data = this.state.packList && this.state.packList.packList.find(i => i.price !== item.price);

            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal higher-plan-modal',
                headingMessage: 'Upgrade to Premium and get Amazon Fire TV Stick – Tata Play Edition at no extra cost',
                primaryButtonText: 'Upgrade to Premium',
                primaryButtonAction: () => {
                    isMobile.any() ? this.proceedHandler(data) : this.packSelection(data, listClick, true);
                    this.trackUpsellAnalyticsEvent(item, data, 'FTV_UPSELL_CONVERTED');
                },
                instructions: "<img class='firestick-img' src='../../assets/images/amazon-firestick.jpg' alt=''/>",
                isHtml: true,
                hideCloseIcon: true,
                secondaryButtonText: 'Cancel',
                secondaryButtonAction: () => isMobile.any() ? this.proceedHandler(item) : this.packSelection(item, listClick),
            });

            this.trackUpsellAnalyticsEvent(item, data, 'FTV_UPSELL_VIEW');

        } else if (!statusCheck && !isEmpty(currentSubscription.data) && parseFloat(currentPackPrice) > parseFloat(item.price) &&
            currentSubscription.data.fsTaken) {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal subscription-change-modal',
                errorIcon: 'icon-alert-upd',
                headingMessage: SUBSCRIPTION_CHANGE_MODAL.HEADING,
                instructions: SUBSCRIPTION_CHANGE_MODAL.INSTRUCTION,
                primaryButtonText: SUBSCRIPTION_CHANGE_MODAL.BUTTON_TEXT_1,
                primaryButtonAction: () => {
                    isMobile.any() ? this.proceedHandler(item) : this.packSelection(item, listClick, true)
                },
                secondaryButtonText: SUBSCRIPTION_CHANGE_MODAL.BUTTON_TEXT_2,
                secondaryButtonAction: () => {
                    closePopup();
                    safeNavigation(history, URL.MY_SUBSCRIPTION);
                },
                isCloseModal: false,
                hideCloseIcon: true,
            });
        } else {
            isMobile.any() ? this.proceedHandler(item) : this.packSelection(item, listClick);
        }

        !statusCheck && !isEmpty(currentSubscription.data) && this.trackModifyPackAnalyticsEvent(item);
    };

    trackModifyPackAnalyticsEvent = (item) => {

        let modType = this.getModificationType(item);
        let mixpanelData = {
                [`${MIXPANEL.PARAMETER.PACK_NAME}`]: item.title,
                [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: item.price,
                [`${MIXPANEL.PARAMETER.MOD_TYPE}`]: modType,
                [`${MIXPANEL.PARAMETER.SOURCE}`]: this.state.analyticsSource,
            },
            moengageData = {
                [`${MOENGAGE.PARAMETER.PACK_NAME}`]: item.title,
                [`${MOENGAGE.PARAMETER.PACK_PRICE}`]: item.price,
                [`${MOENGAGE.PARAMETER.MOD_TYPE}`]: modType,
                [`${MOENGAGE.PARAMETER.SOURCE}`]: this.state.analyticsSource,
            };
        const appsFlyerData = {
            [APPSFLYER.PARAMETER.PACK_NAME]:item.title,
            [APPSFLYER.PARAMETER.PACK_PRICE]:item.price,
            [APPSFLYER.PARAMETER.MOD_TYPE]:modType,
            [APPSFLYER.PARAMETER.SOURCE]:this.state.analyticsSource
        }
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MODIFY_PACK_INITIATE, mixpanelData);
        moengageConfig.trackEvent(MOENGAGE.EVENT.MODIFY_PACK_INITIATE, moengageData);
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.MODIFY_PACK_INITIATE, appsFlyerData);

    };

    getModificationType = (item) => {
        const {
            currentSubscription,
            currentSubscription: {data: {status, expiredWithinSixtyDays, cancelled}},
        } = this.props;
        const currentPackPrice = get(currentSubscription, 'data.packPrice');
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let dummyUserCondition = ((userInfo?.dummyUser || !userInfo.freeTrialAvailed) && userInfo?.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE);
        let modType = '';

        if (parseFloat(currentPackPrice) > parseFloat(item.price)) {
            modType = MIXPANEL.VALUE.DOWNGRADE;
        } else if (parseFloat(currentPackPrice) < parseFloat(item.price)) {
            modType = MIXPANEL.VALUE.UPGRADE;
        }


        if (([ACCOUNT_STATUS.DEACTIVATED, ACCOUNT_STATUS.DEACTIVE, ACCOUNT_STATUS.WRITTEN_OFF].includes(status)
            && cancelled && expiredWithinSixtyDays) || dummyUserCondition) {
            modType = MIXPANEL.VALUE.RENEW;
        }

        this.setState({
            modificationType: modType,
        })

        return modType;
    };

    trackUpsellAnalyticsEvent = (item, data, eventName) => {
        let mixpanelData = {
            [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: item.price || '',
        };

        let moengageData = {
            [`${MOENGAGE.PARAMETER.PACK_PRICE}`]: item.price || '',
        };

        if (eventName === 'FTV_UPSELL_CONVERTED') {
            mixpanelData = {...mixpanelData, [`${MIXPANEL.PARAMETER.UPGRADED_PACK_PRICE}`]: data.price || ''};
            moengageData = {...moengageData, [`${MOENGAGE.PARAMETER.UPGRADED_PACK_PRICE}`]: data.price || ''};
        }

        mixPanelConfig.trackEvent(MIXPANEL.EVENT[eventName], mixpanelData);
        moengageConfig.trackEvent(MOENGAGE.EVENT[eventName], moengageData);
    };


    /**
     * pack selection for web large and small
     * @param item
     * @param listClick
     * @param closePopUp
     * @returns {Promise<void>}
     */
    packSelection = async (item, listClick, closePopUp = false) => {
        closePopUp && this.props.closePopup();
        if (isMobile.any()) {
            this.setState({
                currentlySubscribedPackId: item.packId,
                selectedItem: item,
                activeCase: true,
            }, () => this.selectedPack(item));
        } else {
            if (!listClick) {
                await this.props.getBalanceInfo(item.packId);
                if (this.props.balanceInfo.code !== 0) {
                    this.balanceErrorPopup();
                    return;
                }
                this.setState({
                    currentlySubscribedPackId: item.packId,
                    selectedItem: item,
                    partnerLeastPack: null,
                });

                await this.checkForSubscriptionCancellation();
                this.trackAnalyticsEvent(item);
            }
        }
    }


    /**
     * @function closeSubscriptionSummary:- called on back from summary screen
     */
    closeSubscriptionSummary = () => {
        const {history, location} = this.props;
        if (!isEmpty(location.state)) {
            safeNavigation(history, URL.HOME);
        }
        this.setState({
            showSubscriptionSummary: false,
        }, () => {
            // selectedPack and checkProceedButtonDisable are called here to set default css of selected pack and handle proceed disable
            this.selectedPack(this.state.selectedItem);
            this.checkProceedButtonDisable();
        });
    }


    /**
     * @function skip:- called on click of skip
     */
    skip = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.ADD_PACK_SKIP);
        moengageConfig.trackEvent(MOENGAGE.EVENT.ADD_PACK_SKIP);

        !isMobile.any() && safeNavigation(this.props.history, URL.DEFAULT);
    }


    /**
     * @function proceedHandler for web small
     * @param item
     * @returns {Promise<void>}
     */
    proceedHandler = async (item) => {
        const {currentlySubscribedPackId} = this.state;
        let mobileWeb = item ? item.packId : currentlySubscribedPackId;

        this.setState({
            currentlySubscribedPackId: item.packId,
            selectedItem: item,
            activeCase: true,
        });

        this.props.closePopup();
        await this.props.getBalanceInfo(mobileWeb);
        if (this.props.balanceInfo.code !== 0) {
            this.balanceErrorPopup();
            return;
        }
        await this.checkForSubscriptionCancellation();
        this.trackAnalyticsEvent(item);
    }


    /**
     * @function checkForSubscriptionCancellation
     * @returns {Promise<void>}
     */
    checkForSubscriptionCancellation = async () => {
        const {currentSubscription: {data}, cancelPack} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        if ((!isEmpty(data) && (data?.status === ACCOUNT_STATUS.DEACTIVE || data?.status === ACCOUNT_STATUS.DEACTIVATED)
                && data?.expiredWithinSixtyDays && !data?.cancelled)
            || (userInfo?.dummyUser && data?.fdoOrderRaised && data?.status === ACCOUNT_STATUS.WRITTEN_OFF)) {
            await cancelPack(true, false);
            const {cancelData} = this.props;
            if (!isEmpty(cancelData)) {
                this.setState({
                    showSubscriptionSummary: true,
                    callSubscription: true,
                });
            }
        } else {
            this.setState({
                showSubscriptionSummary: true,
            });
        }
    };

    /**
     * @function balanceErrorPopup
     * @param redirectionCheck
     */
    balanceErrorPopup = (redirectionCheck) => {
        const {openPopup, history} = this.props;
        if (this.props.balanceInfo.message !== 'Network Error') {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal upgrade-modal balance-error',
                headingMessage: this.props.balanceInfo.message,
                primaryButtonText: 'OK',
                errorIcon: 'icon-alert-upd',
                primaryButtonAction: redirectionCheck ? () => safeNavigation(history, `/${URL.MY_SUBSCRIPTION}`) : () => safeNavigation(history, `/${URL.PACK_SELECTION}?source=${MIXPANEL.VALUE.MY_ACCOUNT}`),
                hideCloseIcon: true,
                secondaryButtonText: 'Cancel',
                secondaryButtonAction: () => {
                    safeNavigation(history, `/${URL.MY_SUBSCRIPTION}`)
                },
            });
        }
    }

    /**
     * method:- to select default selected pack, when subscribed to any pack OR when no subscription is
     * taken based on defaultPackId key received in current subscription response
     * @param:- packList - listing of pack received from API
     * @returns:- detail of default pack
     */
    selectDefaultPack = (packList) => {
        const {currentSubscription: {data}} = this.props,
            defaultPackId = packList.defaultPackId;
        let defaultSelectedPackDetails;
        if (isEmpty(data) || data.dummyUser) {
            //when currently no subscription is taken or dummyUser, we will compare packId OR alternatePackId of pack listing packs
            // with defaultPackId key received in current subscription response
            defaultSelectedPackDetails = packList.packList.filter((item) => {
                return ((item.packId === defaultPackId) || (item.alternatePackId === defaultPackId))
            })
        } else if (!isEmpty(data)) {
            defaultSelectedPackDetails = packList.packList.filter(item => {
                return this.checkAlternateAndPackId(item);
            })
        }
        return defaultSelectedPackDetails && defaultSelectedPackDetails[0];
    }

    /**
     * method for button and expire text in case of subscribed or for disabling or enabling proceed button in web small
     * @param item
     * @returns {boolean}
     */
    handleSelectButtonVisibility = (item) => {
        const {currentSubscription: {data}} = this.props;
        let currentSubscriptionStatus = get(data, 'status');
        let subscriptionType = get(data, 'subscriptionInformationDTO.subscriptionType') && data?.subscriptionInformationDTO?.subscriptionType?.toUpperCase();
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        // show button when pack is expired | user current subscription is free | no subscription

        if (!isEmpty(data) && userInfo?.dummyUser) {
            return isEmpty(this.state.selectedItem)
        } else if ((currentSubscriptionStatus !== ACCOUNT_STATUS.ACTIVE) && subscriptionType === SUBSCRIPTION_TYPE.ANDROID_STICK) {
            // when pack is expired and is FTV user then we need to disable 299 pack
            return this.checkAlternateAndPackId(item);
        } else if (currentSubscriptionStatus !== ACCOUNT_STATUS.ACTIVE) {
            return false;
        } else if (this.checkAlternateAndPackId(item)) {
            return true
        }
        return false;
    }

    /**
     * method for button focus in web large and whole list focus in web small
     * @param item
     * @returns {boolean}
     */
    selectedPack = (item) => {
        const {currentlySubscribedPackId, partnerLeastPack} = this.state;
        const {currentSubscription, packList} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        if (partnerLeastPack) {
            return partnerLeastPack.packId === item.packId || partnerLeastPack.packId === item.alternatePackId;
        } else {
            //mobile selection case
            if (currentlySubscribedPackId === item.packId || currentlySubscribedPackId === item.alternatePackId ||
                ((isEmpty(currentSubscription?.data) || currentSubscription?.data?.dummyUser) && ((packList.data.defaultPackId === item.packId)
                    || packList.data.defaultPackId === item.alternatePackId))) {
                const previousSelectedPack = document.getElementsByClassName("pack-allowed")[0];
                previousSelectedPack && previousSelectedPack.classList.remove('pack-allowed');
                let currentSelectedPack = document.getElementById(item.packId);
                if (currentSelectedPack) {
                    currentSelectedPack.parentNode.className += " pack-allowed";
                    !userInfo?.dummyUser && currentSelectedPack.scrollIntoView();
                }
            }
        }
    };

    /**
     * @function trackAnalyticsEvent
     * @param packDetail
     */
    trackAnalyticsEvent = (packDetail) => {
        let mixpanelData = {
            [`${MIXPANEL.PARAMETER.PACK_NAME}`]: packDetail.title || '',
            [`${MIXPANEL.PARAMETER.TYPE}`]: packDetail.packType || '',
            [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: packDetail.price || '',
        };
        let moengageData = {
            [`${MOENGAGE.PARAMETER.PACK_NAME}`]: packDetail.title || '',
            [`${MOENGAGE.PARAMETER.TYPE}`]: packDetail.packType || '',
            [`${MOENGAGE.PARAMETER.PACK_PRICE}`]: packDetail.price || '',
        };

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.ADD_PACK_CONTINUE, mixpanelData);
        moengageConfig.trackEvent(MOENGAGE.EVENT.ADD_PACK_CONTINUE, moengageData);

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_SELECTED, mixpanelData);
        moengageConfig.trackEvent(MOENGAGE.EVENT.PACK_SELECTED, moengageData);
    }

    /**
     * @function getBasePackPartners
     */
    getBasePackPartners = () => {
        let {packList} = this.state;
        packList && packList.packList.find((i) => {
            i.price === 149 && this.setState({
                basePackProvidersLength: i.providers.length - 1,
            })
        });
        let arr1 = packList && packList.packList.find((i) => i.price === 149)?.providers;
        let arr2 = packList && packList.packList.find((i) => i.price === 299)?.providers;
        let diff = arr2 && arr2.filter(function (item1) {
            for (let i in arr1) {
                if (item1.name === arr1[i].name) {
                    return false;
                }
            }
            return true;
        });
        this.setState({
            basePackProviders: arr1,
            higherPackProviders: diff,
        })
    };

    /**
     * @function handleKnowMore
     * @param data
     */
    handleKnowMore = (data) => {
        let {openPopup, closePopup} = this.props;
        let detail = data.value;

        let detailList = detail.split(':');
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal know-more-modal',
            imageUrl: data.imageUrl,
            headingMessage: data.title,
            instructions: detailList && detailList.length === 1 ? data.value : false,
            instructionsList: detailList && detailList.length > 1 ? detailList : false,
            primaryButtonText: 'Close',
            primaryButtonAction: closePopup,
            hideCloseIcon: true,
        });
    };

    /**
     * @function isPackSubscribedOrExpired
     * @returns {string}
     */
    isPackSubscribedOrExpired = (item) => {
        const {bingeAccountStatus} = this.state;
        const {currentSubscription, packList} = this.props;
        let defaultPackId = this.state?.packList?.defaultPackId;
        /*
        Check if the user's current pack is subscribed or expired and show the text accordingly.
         */
        if ((get(currentSubscription, 'data.packId') === item.packId ||
            get(currentSubscription, 'data.packId') === item.alternatePackId ||
            get(currentSubscription, 'data.alternatePackId') === item.packId ||
            get(currentSubscription, 'data.alternatePackId') === item.alternatePackId)) {

            if (bingeAccountStatus === ACCOUNT_STATUS.ACTIVE) {
                return 'Subscribed';
            } else if ((bingeAccountStatus === ACCOUNT_STATUS.DEACTIVATED || bingeAccountStatus === ACCOUNT_STATUS.DEACTIVE)
                && currentSubscription.data) {
                return 'Expired';
            }
        }
        /*
        Checks if the pack on the listing screen is a default pack then show the recommended saver pack text on it
         */
        else if (defaultPackId === item.packId || defaultPackId === item.alternatePackId) {
            return get(packList, 'data.verbiage.recommendedMessage');
        }
    }

    /**
     * @function checkProceedButtonDisable - to check enable and disable of Proceed button
     */
    checkProceedButtonDisable = () => {
        let {currentSubscription} = this.props;
        let currentSubscriptionStatus = get(currentSubscription, 'data.status');
        let subscriptionType = get(currentSubscription, 'data.subscriptionInformationDTO.subscriptionType') && currentSubscription.data.subscriptionInformationDTO.subscriptionType.toUpperCase();
        let {selectedItem} = this.state;
        let bingeStatus = currentSubscription?.data?.subscriptionInformationDTO?.bingeAccountStatus?.toUpperCase();
        const {alternatePackId, packId} = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        if (!isEmpty(currentSubscription.data) && userInfo?.dummyUser) {
            return isEmpty(selectedItem)
        } else if ((currentSubscriptionStatus !== ACCOUNT_STATUS.ACTIVE) && subscriptionType === SUBSCRIPTION_TYPE.ANDROID_STICK) {
            // when pack is expired and is FTV user then we need to disable 299 pack proceed
            return this.checkAlternateAndPackId(selectedItem);
        } else if (isEmpty(currentSubscription.data) || (bingeStatus !== ACCOUNT_STATUS.ACTIVE)) {
            return isEmpty(selectedItem)
        } else {
            return (selectedItem && ((selectedItem.packId === packId) || (selectedItem.packId === alternatePackId) ||
                (selectedItem.alternatePackId === packId) || (selectedItem.alternatePackId === alternatePackId)))
        }
    }

    /**
     * @function checkAlternateAndPackId - function to compare alternate and pack ids received in subscription APi and pack item
     * @param item
     * @returns {boolean}
     */
    checkAlternateAndPackId = (item) => {
        const {currentSubscription} = this.props;
        let defaultPackId = this.state?.packList?.defaultPackId;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        if (userInfo?.dummyUser) {
            return (defaultPackId === item.packId || defaultPackId === item.alternatePackId)
        } else {
            return (get(currentSubscription, 'data.packId') === item.packId ||
                get(currentSubscription, 'data.packId') === item.alternatePackId ||
                get(currentSubscription, 'data.alternatePackId') === item.packId ||
                get(currentSubscription, 'data.alternatePackId') === item.alternatePackId)
        }

    }

    selectViewToRender = () => {
        const {
            packList, showSubscriptionSummary, selectedItem, bingeAccountStatus, basePackProvidersLength,
            callSubscription, modificationType,
        } = this.state;
        const {history, currentSubscription, location} = this.props;
        let searchParams = new URLSearchParams(location.search);
        const source = searchParams.get('source');

        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let fdrUserConditions = ((userInfo?.bingeAccountStatus === ACCOUNT_STATUS.ACTIVE) && userInfo?.dummyUser);

        if ((!userInfo.freeTrialAvailed) && isEmpty(currentSubscription?.data)) {
            return <FreeTrialPack skip={this.skip} history={history} analyticsSource={source}/>
        } else if (!showSubscriptionSummary && (isEmpty(location.state))) {
            return <div className="pack-parent">
                {fdrUserConditions && <SubscriptionWebSmallHeader data={currentSubscription?.data} history={history}
                                                                  mobileBack={() => safeNavigation(history, URL.MY_SUBSCRIPTION)}
                                                                  showProgressBar={false} showLogo={false}/>}
                <div className={'web-small-logo for-mobile'}>
                    <img src={webSmallLogoImage} alt={'Logo-Image'}/>
                </div>
                {!fdrUserConditions && <div className={'for-mobile'}>
                    <ProgressBar stepNumberArray={WEB_SMALL_LOGIN_STEP} activeStep={4}/>
                </div>}
                <div className="pack-header">
                    <h3>{packList.title}</h3>
                    <p className="free-trial-text">{packList.value}</p>
                </div>
                <ul className="pack-body">
                    {packList.packList.map((item, index) =>
                        <div className="pack-outer" key={index}>
                            <li key={index}
                                id={item.packId}
                                onClick={() => this.packSelection(item, true)}>
                                {this.isPackSubscribedOrExpired(item) &&
                                <span className="pack-subscribed">{this.isPackSubscribedOrExpired(item)}</span>
                                }
                                <div className={'body-head'}>
                                    <div>
                                        <span>{item.title}</span>
                                        <span>₹ {item.price} per month</span>
                                    </div>
                                    <div>{item.providers.length} Apps</div>
                                </div>
                                <div className="app-block">
                                    {

                                        fdrUserConditions ? <React.Fragment>
                                                <ul className="app-listing">
                                                    {item.providers && item.providers.map((items, index) =>
                                                        <img key={index} src={items.iconUrl} alt="provider"/>,
                                                    )}
                                                </ul>
                                                <div
                                                    className={'provider-text'}>{isMobile.any() ? item?.partnerDescHybrid : item?.partnerDesc}</div>
                                            </React.Fragment>
                                            :
                                            <React.Fragment>
                                                <ul className="app-listing">
                                                    {this.state.basePackProviders && this.state.basePackProviders.map((items, index) =>
                                                        index <= basePackProvidersLength &&
                                                        <img key={index} src={items.iconUrl} alt="provider"/>,
                                                    )}
                                                </ul>
                                                {item.price !== 149 &&
                                                <div>
                                                    <div className={'add'}><i className={'icon-plus'}/></div>
                                                    <ul className="app-listing">
                                                        {this.state.higherPackProviders && this.state.higherPackProviders.map((items, index) =>
                                                            <img key={index} src={items.iconUrl} alt="provider"/>,
                                                        )}
                                                    </ul>
                                                    <div
                                                        className={'provider-text'}>{isMobile.any() ? item?.partnerDescHybrid : item?.partnerDesc}</div>
                                                </div>
                                                }
                                            </React.Fragment>
                                    }

                                </div>
                                <div className="pack-details">
                                    {item.packOffers && item.packOffers.map((item, index) =>
                                        <div className={!item.value ? 'blur-block' : ''} key={index}>
                                            <i className={item.value ? 'icon-check' : 'icon-close'}/>
                                            <img className={`offer-img${index}`} src={item.image} alt={'img'}/>
                                            {index === 0 && <span>{item.title}</span>}
                                            {index === 1 && <span>TV(On Amazon Fire TV Stick Tata Play Edition)</span>}
                                        </div>)}
                                    {!fdrUserConditions && <div className={'know-more'}><span
                                        onClick={() => this.handleKnowMore(item.knowMore)}>Know More</span>
                                    </div>}
                                </div>

                                {this.handleSelectButtonVisibility(item) ?
                                    <p className="pack-expiry for-web">{currentSubscription?.data?.subscriptionExpiryMessage}</p> :
                                    <div className="for-web buton-center">
                                        <Button bValue="Select" cName={`btn`}
                                                clickHandler={() => this.checkSelectedPack(item, false)}/>
                                    </div>
                                }
                            </li>
                        </div>,
                    )}
                </ul>

                {fdrUserConditions && <p className={'footer-message'}>{get(packList, 'verbiage.footerMessage')}</p>}
                <Button cName={`btn primary-btn for-mobile ${fdrUserConditions ? 'add-margin' : ''}`} bValue="Proceed"
                        disabled={this.checkProceedButtonDisable()}
                        clickHandler={() => this.checkSelectedPack(selectedItem, false)}/>
                {!fdrUserConditions && <div className="skip for-web" onClick={this.skip}>Skip</div>}
                {!fdrUserConditions && <div className={'skip-link'}>
                    <Link className="for-mobile" to={navigator.onLine && `${URL.MY_ACCOUNT}`}
                          onClick={!navigator.onLine ? showNoInternetPopup : this.skip}>
                        Skip
                    </Link>
                </div>}
            </div>
        } else {
            return <SubscriptionSummaryModal aboutSubscription={location?.state?.subscription}
                                             modifyCallback={() => this.setState({showSubscriptionSummary: false})}
                                             historyState={location?.state?.accountDropDown}
                                             history={history} bingeAccountStatus={bingeAccountStatus}
                                             packDetail={location?.state?.accountDropDown && currentSubscription?.data ? currentSubscription?.data : selectedItem}
                                             currentSubscription={currentSubscription}
                                             dunning={location?.state?.dunning}
                                             closeSubscriptionSummary={this.closeSubscriptionSummary}
                                             packSelectionSource={location?.search}
                                             callSubscription={callSubscription}
                                             rechargeSource={location?.state?.source}
                                             modificationType={modificationType}/>
        }
    }

    render() {
        let {packList} = this.state;
        if (!packList)
            return null;
        return (this.selectViewToRender())

    }
}

PackSelection.propTypes = {
    packListing: PropTypes.func,
    packList: PropTypes.object,
    history: PropTypes.object,
    showMainLoader: PropTypes.func,
    getBalanceInfo: PropTypes.func,
    getCurrentSubscriptionInfo: PropTypes.func,
    currentSubscription: PropTypes.object,
    newUserDetails: PropTypes.object,
    existingUserDetails: PropTypes.object,
    location: PropTypes.object,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    hideMainLoader: PropTypes.func,
    balanceInfo: PropTypes.object,
    quickRecharge: PropTypes.func,
    cancelPack: PropTypes.func,
    cancelData: PropTypes.object,
    quickRechargeUrl: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        packList: get(state.packSelectionDetail, 'packList'),
        balanceInfo: get(state.packSelectionDetail, 'balanceInfo'),
        currentSubscription: get(state.packSelectionDetail, 'currentSubscription'),
        existingUserDetails: get(state.bingeLoginDetails, 'existingUser.data'),
        newUserDetails: get(state.bingeLoginDetails, 'newUser'),
        cancelData: get(state.mySubscriptionReducer, 'cancelData'),
        quickRechargeUrl: get(state.packSelectionDetail, 'quickRecharge'),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            packListing,
            showMainLoader,
            getBalanceInfo,
            hideMainLoader,
            getCurrentSubscriptionInfo,
            quickRecharge,
            openPopup,
            closePopup,
            cancelPack,
            createSubscription,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(PackSelection))

