import React, { PureComponent } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { compose } from "redux";
import { withRouter } from "react-router";
import get from "lodash/get";
import { loginSignUp, closePopup, openPopup } from "@common/Modal/action";
import { URL } from "@constants/routeConstants";
import {
    isMobile,
    isUserloggedIn,
    updateSearchList,
    safeNavigation,
    loginInFreemium,
    handleRedirectionOnClick,
    categoryDropdownHeader,
    isWebSmallLinkPayment,
    resetSearchData, 
    handleOverflowOnHtml, 
    capitalizeFirstLetter, 
    getFormattedURLValue,
} from "@utils/common";
import { checkCurrentSubscription } from "@containers/Subscription/APIs/subscriptionCommon";
import { JOURNEY_SOURCE } from "@containers/Subscription/APIs/constant";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import { searchSource, getGenreInfo } from "@components/Header/APIs/actions";
import { getBalanceInfo } from "@containers/SubscriptionPayment/APIs/action";
import { deleteKey, getKey, setKey } from "@utils/storage";
import UnknownUser from "@assets/images/profile-avatar.svg";
import AccountWhiteUser from "@assets/images/profile-avatar-white.svg";
import crownIcon from "@assets/images/crown-icon.svg";
import isEmpty from "lodash/isEmpty";
import { setLoginManual, openLoginPopup } from '@containers/Login/APIs/actions';
import { MINI_SUBSCRIPTION, LOCALSTORAGE, SECTION_TYPE } from "@constants";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@constants/dataLayer";
import CategoryDropdown from './CategoryDropdown';
import {
    loginPopupState,
    setSearch,
    setSearchText,
    recentSearch,
    switchAccountDropDown,
    accountDropDown,
    notificationDropDown,
    categoryDropDown,
} from "./APIs/actions";
import AccountDropdown from "./AccountDropdown";
import AccountSideMenuBar from './AccountSideMenuBar';
import "./style.scss";
import { hideMainLoader, showMainLoader } from "@src/action";
import { GO_VIP_DATA, HEADER_MENU_LIST_GO_VIP, SIDE_BAR_MENU_LIST, SIDE_MENU_HEADERS } from './APIs/constants';
import queryString from "querystring";
import { ACTION_BTN_NAME, SUGGESTOR, VIEW } from "./constants";
import { TAB_BREAKPOINT, BOTTOM_SHEET, DTH_TYPE, WEB_SMALL_PAYMENT_SOURCE } from "@utils/constants";
import firebase from "@utils/constants/firebase";
import Button from "@common/Buttons";
import { setUpdatedTenure, getWebPortalLink } from "@containers/Subscription/APIs/action"
import { campaignPageFlow } from "@containers/Main/MainCommon";
import moreOption from "../../assets/images/more-option.png";
import AutoComplete from "./AutoComplete";
import Cross from '@assets/images/subtract.png';
import { fetchSearchAutosuggestedData } from "@containers/BrowseByDetail/APIs/action";
class Header extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isSwitchAccDropdownOpen: false,
            loggedIn: false,
            showAvatarImage: false,
            isNotificationOpen: false,
            undoAliasName: false,
            crossClick: false,
            searchAutoFocus: false,
            errors: {},
            menuListOptions: [],
            isExpired: false,
            isSideMenuOpen: false,
            // isDthUser: false,
            headerItems: [],
            dimensions: {
                height: window.innerHeight,
                width: window.innerWidth,
            },
            pageScrolled: false,
            brokenImage: false,
            list:  JSON.stringify(LOCALSTORAGE.SEARCH),
            disableCross: true,
            showAutoComplete: false,
            drpState: '',
        };
        this.searchInitated = false;
        this.errors = {};
    }

    componentDidMount = async () => {
        this.handleMenuList();
        window.addEventListener("scroll", this.handleScroll);
        window.addEventListener("resize", this.handleOnResize);
        this.clearLearnLocalStorage()
        campaignPageFlow(this)
        await this.loadData();
    };

    componentDidUpdate = async (prevProps, prevState) => {
        this.handleMenuList();

        const {
            location: { pathname, search, hash }, setSearch, miniStatus, isfromMini
        } = this.props;

        if (prevProps.searchTextVal !== this.props.searchTextVal && this.inputTitle) {
            this.inputTitle.value = this.props.searchTextVal
        }

        if (prevProps.location.pathname !== pathname) {
            this.oncloseSideBar()
            let source = capitalizeFirstLetter(pathname.split('/')[1]);
            if (source === BOTTOM_SHEET.CATEGORIES.toLowerCase()) {
                source = pathname.split('/').at(-1).toUpperCase()
            }

            let pageName = !isNaN(source) ? MIXPANEL.VALUE.OTHERS : !source ? MIXPANEL.VALUE.HOME : source;
            this.pageClickEvent(pageName)
        }
        if (pathname !== URL.DEFAULT) {
            if (
                prevProps.location.pathname !== pathname &&
                pathname !== `/${URL.SEARCH}`
            ) {
                this.searchInitated = false;
                this.setState({
                    searchAutoFocus: false,
                });
            }

            let values = queryString.parse(search);
            if (!this.state.crossClick) {
                if (!isEmpty(values["?q"])) {
                    setSearch(true);
                    if (this.inputTitle && !this.searchInitated) {
                        this.inputTitle.value = hash
                            ? `${values["?q"]}${hash}`
                            : values["?q"];
                    }
                }
            }
        }

        if ((this.props.loggedStatus !== prevProps.loggedStatus) || (this.props.items !== prevProps.items) || (this.props.currentSubscription !== prevProps.currentSubscription)) {
            await this.loadData();
        }

        if (((this.props.accountDropDownVal !== prevProps.accountDropDownVal && this.props.accountDropDownVal)
            || (this.state.isSideMenuOpen !== prevState.isSideMenuOpen && this.state.isSideMenuOpen))
            && this.props.loggedStatus) {
            await this.getBalanceData();
            let menuListOptions = this.getSideMenuListOptions();
            this.setState({
                menuListOptions: menuListOptions,
            });
        }
        if (prevProps.miniStatus !== this.props.miniStatus && !this.props.miniStatus) {
            await loginInFreemium({
                openPopup,
                closePopup,
                openLoginPopup,
                source: firebase.VALUE.HOME,
                ComponentName: MINI_SUBSCRIPTION.PLAN_SELECT
            })
        }

    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleOnResize);
    }

    pageClickEvent = (value) => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PAGE_CLICK, { [MIXPANEL.PARAMETER.PAGE_NAME]: value });
    }

    clearLearnLocalStorage = () => {
        setKey(LOCALSTORAGE.CALL_TO_LEARN_API, JSON.stringify(false));
    }

    addLearnLocalStorage = () => {
        setKey(LOCALSTORAGE.CALL_TO_LEARN_API, JSON.stringify(true));
    }

    getBalanceData = async () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        if (userInfo.dthStatus !== DTH_TYPE.NON_DTH_USER) {
            await this.props.getBalanceInfo(null, null, true);
        }
    }

    loadData = async () => {
        let menuListOptions = this.getSideMenuListOptions();
        let headerItems = this.props.items && this.getHeaderItemsList();
        this.setState({
            headerItems: headerItems,
            menuListOptions: menuListOptions,
        });
    };

    handleOnResize = () => {
        let {
            accountDropDownVal, accountDropDown, switchAccountDropDownVal, switchAccountDropDown,
        } = this.props;
        switchAccountDropDownVal && switchAccountDropDown(false);
        accountDropDownVal && accountDropDown(false);
        accountDropDownVal && this.handleAliasError(true, true);
        this.handleMenuList();
        this.setState({
            dimensions: {
                height: window.innerHeight,
                width: window.innerWidth,
            },
        });
    };

    clickOnCrossIcon = (e, item) => {
        e.stopPropagation();
        let list = JSON.parse(getKey(LOCALSTORAGE.SEARCH));
        list = list.filter(i => i !== item)
        this.setState({ list: list })
        setKey(LOCALSTORAGE.SEARCH, JSON.stringify(list));
        if (JSON.parse(getKey(LOCALSTORAGE.SEARCH)).length === 0) this.clearClick();
    }

    handleMenuList = () => {
        const path = this.props.location.pathname;
        if (
            path === URL.DEFAULT &&
            document.querySelector(".header-left ul li") &&
            document.querySelector(".header-left ul li").classList.length === 0
        ) {
            document.querySelector(".header-left ul li") &&
                document.querySelector(".header-left ul li").classList.add("active");
        } else if (path !== URL.DEFAULT) {
            document.querySelector(".header-left ul li") &&
                document.querySelector(".header-left ul li").classList.remove("active");
        }
        if (
            path === URL.DEFAULT &&
            document.querySelector(".header-for-responsive ul li") &&
            document.querySelector(".header-for-responsive ul li").classList
                .length === 0
        ) {
            document.querySelector(".header-for-responsive ul li") &&
                document
                    .querySelector(".header-for-responsive ul li")
                    .classList.add("active");
        } else if (path !== URL.DEFAULT) {
            document.querySelector(".header-for-responsive ul li") &&
                document
                    .querySelector(".header-for-responsive ul li")
                    .classList.remove("active");
        }
    };


    handleScroll = (e) => {
        let {
            recentSearch,
            recentSearchVal,
            accountDropDownVal,
            notificationDropDownVal,
            accountDropDown,
            notificationDropDown,
        } = this.props;
        recentSearchVal && recentSearch(false);
        if (!isMobile.any()) {
            this.inputTitle && this.inputTitle.blur();
        }
        this.handleAliasError(true, true);
        accountDropDownVal && accountDropDown(false);
        notificationDropDownVal && notificationDropDown(false);

        if (window.scrollY > 0) {
            this.setState({
                pageScrolled: true,
            });
        } else if (window.scrollY === 0) {
            this.setState({
                pageScrolled: false,
            });
        }
    };

    toggleHeaderDropdown = (e, name) => {
        const {
            accountDropDown,
            accountDropDownVal,
            switchAccountDropDownVal,
            switchAccountDropDown,
            notificationDropDown,
            notificationDropDownVal,
        } = this.props;
        e.stopPropagation();
        this.searchHide(e);
        if (name === "AccountDropdown") {
            if (accountDropDownVal) {
                this.handleAliasError(true, true);
                accountDropDown(false);
                switchAccountDropDownVal && switchAccountDropDown(false);
            } else {
                notificationDropDownVal && notificationDropDown(false);
                accountDropDown(true);
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.HOME_ACCOUNT);
                moengageConfig.trackEvent(MOENGAGE.EVENT.HOME_ACCOUNT);
            }
        } else if (name === "SwitchAccountDropdownOpen") {
            if (switchAccountDropDownVal) {
                switchAccountDropDown(false);
            } else {
                switchAccountDropDown(true);
            }
        } else if (name === "NotificationDropdown") {
            if (notificationDropDownVal) {
                notificationDropDown(false);
            } else {
                this.handleAliasError(true, true);
                accountDropDownVal && accountDropDown(false);
                switchAccountDropDownVal && switchAccountDropDown(false);
                notificationDropDown(true);
            }
        }
        this.pageClickEvent(MIXPANEL.VALUE.HAMBURGER)
    };

    searchEnter = (value) => {
        this.inputChange(value);
        this.searchRedirection(value);
    };

    searchRedirection = (value) => {
        const { searchSource, searchText, history } = this.props;
        if (value) {
            searchSource(MIXPANEL.VALUE.SEARCH_SOURCE_MANUAL);
            searchText(value);
            if (value.length > 1) {
                this.setState({ showAutoComplete: true});
            }
        } else {
            if (isMobile.any()) {
                safeNavigation(history, `/${URL.SEARCH}`);
            } else {
                safeNavigation(history, URL.DEFAULT);
            }
        }
    };

    searchHide = (e) => {
        if (
            get(e, "target") &&
            !e.target.getAttribute("search") &&
            this.props.searchVal
        ) {
            !location.href.includes("search") && this.props.setSearch(false);
            this.props.recentSearch(false);
        }
    };

    accountHide = (e) => {
        if (
            get(e.target, "className") !== "icon-account1" &&
            get(e.target, "parentElement.className") !== "account-dropdown" &&
            this.props.accountDropDownVal
        ) {
            this.handleAliasError(true, true);
            this.props.accountDropDown(false);
        }
    };

    notificationHide = (e) => {
        if (
            get(e.target, "className.animVal") !== "profile-svg" &&
            get(e.target, "parentElement.className") !== "notification-dropdown" &&
            this.props.notificationDropDownVal
        ) {
            this.props.notificationDropDown(false);
        }
    };

    menuItemClick = async (e, item) => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MENU_BOTTOM, {
            [MIXPANEL.PARAMETER.OPTION]: item?.pageName,
        })
        dataLayerConfig.trackEvent(DATALAYER.EVENT.HEADER_CLICKS, {
            [DATALAYER.PARAMETER.HEADER_NAME]: item?.pageName,

        })
        this.searchHide(e);
        this.accountHide(e);
        this.notificationHide(e);
        await handleRedirectionOnClick(
            item,
            this.props.history,
            openPopup,
            closePopup,
            openLoginPopup,
            this.state.dimensions,
        );
    };

    focusHandle = () => {
        if (JSON.parse(getKey(LOCALSTORAGE.SEARCH))?.length === 0) {
            this.clearClick();
            return;
        }
        if (this.inputTitle.value.length !== 0) {
            this.props.recentSearch(false);
        }
        if (
            !document.getElementById("search-input").value &&
            getKey(LOCALSTORAGE.SEARCH)
        ) {
            this.setState({
                list: JSON.parse(getKey(LOCALSTORAGE.SEARCH)),
            })
            this.props.recentSearch(true);
        }

    };

    inputChange = () => {
        if (this.inputTitle && this.inputTitle.value !== "") {
            this.props.recentSearch(false);
        } else if (getKey(LOCALSTORAGE.SEARCH)) {
            this.props.recentSearch(true);
        }
    };

    onSearchEnterAdd = (e) => {
        const { charCode } = e;
        const { history } = this.props;
        if (e.key === ACTION_BTN_NAME.ENTER) {
            this.setState({ showAutoComplete: false }, () => {
                updateSearchList(this.inputTitle.value);
                safeNavigation(history, `/${URL.SEARCH}?q=${this.inputTitle.value}`);
            });
        }
    };

    patternCheck = (e) => {
        let regex = new RegExp("[a-zA-Z 0-9-,!'#\$()+./:~;<=>?@*]+");
        let key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!regex.test(key) || this.inputTitle.value.length >= 25) {
            this.onSearchEnterAdd(e);
            e.preventDefault();
            return false;
        }

        if (isEmpty(this.inputTitle.value) && e.which === 32) {
            e.preventDefault();
            return false;
        } else {
            this.onSearchEnterAdd(e);
        }
    };

    returnBackClick = () => {
        const { searchText, history } = this.props;
        if (this.inputTitle.value.length === 0) {
            safeNavigation(history, URL.DEFAULT);
            return;
        }
        this.inputTitle.value = "";
        searchText("");
        this.searchInitated = false;
        resetSearchData();
        this.searchRedirection(this.inputTitle.value);
    }

    inputClick = () => {
        this.iconClose && (this.iconClose.style.display = "none");
        this.setState({
            crossClick: true,
            disableCross: true,
        });
        if (!this.state.searchAutoFocus) {
            this.setState({
                searchAutoFocus: true,
            });
        }
        this.returnBackClick();
    };

    clearClick = () => {
        deleteKey(LOCALSTORAGE.SEARCH);
        this.props.recentSearchVal && this.props.recentSearch(false);
    };

    searchChange = (e) => {
        const { searchText } = this.props;
        e.target.value = e.target.value.slice(0, 25);
        if (e.target.value.length > 0) {
            this.setState({
                disableCross: false,
            });
            if ( e.target.value.length  > 1) {
              this.setState({ showAutoComplete: true });
              this.props.fetchSearchAutosuggestedData(e.target.value);
            }
        } else {
            searchText("");
            this.setState({
                disableCross: true,
            });
            resetSearchData();
            this.searchRedirection(e.target.value);
        }
        this.searchInitated = true;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.clearLearnLocalStorage();
        let newValue = e.target.value.replace(/[^a-zA-Z 0-9-,!'#\$()+./:~;<=>?@*]+/, "")
        e.target.value = newValue;
        this.timer = setTimeout(this.searchEnter, 500, newValue);
    };

    searchIconClick = (e) => {
        const { loginPopupState, setSearch, history } = this.props;
        this.setState({
            searchAutoFocus: false,
            list: JSON.parse(getKey(LOCALSTORAGE.SEARCH)),
            showAutoComplete: false,
        });
        e.preventDefault();
        setSearch(true);
        isMobile.any() && safeNavigation(history, `/${URL.SEARCH}`);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEARCH_INITIATE);
        if (isUserloggedIn()) {
            this.accountHide(e);
            this.notificationHide(e);
            this.setGenreLogic();
        } else {
            loginPopupState(false);
        }
    };

    setGenreLogic = () => {
        let currentTimeStamp = new Date();
        let date = parseInt(getKey(LOCALSTORAGE.GENRE_FIRED_DATE));
        const { getGenreInfo, genreInfo } = this.props;

        if (date) {
            let genreFiringDate = new Date(date);
            let res = Math.abs(genreFiringDate - currentTimeStamp) / 1000;
            let hours = Math.floor(res / 3600) % 24;

            if (isEmpty(genreInfo) || hours >= 3) {
                getGenreInfo();
                setKey(LOCALSTORAGE.GENRE_FIRED_DATE, +new Date());
            }
        } else {
            getGenreInfo();
            setKey(LOCALSTORAGE.GENRE_FIRED_DATE, +new Date());
        }
    };

    passingVal = (val) => {
        const { searchText, history, location: { pathname } } = this.props;
        const { 
            title = '',
            suggestor = '', 
            partnerId = '', 
            contentType = '', 
            id= '', 
            item: {
                 backgroundImage = '', 
                 image = '', 
                 } 
            } = val || {};
        let routeUrl = pathname && pathname.split("/");
        let breadCrumbSource = pathname && routeUrl[1];    
        let navigator = '';
        if (suggestor == SUGGESTOR.KEYWORD_SUGGESTOR) {
            navigator = { pathname: `/${URL.SEARCH}`, state: { suggestor: suggestor }, search: `?q=${title.toLowerCase()}`};
        } else if (suggestor == SUGGESTOR.PROVIDER_SUGGESTOR) {
            navigator = { pathname: `/${URL.PARTNER}/${title}/${partnerId}`,state: {
                bannerImg: backgroundImage,
                bannerLogoImg: image,
                pageType: 'search',
                pathUpdate: pathname,
            },
            // search: `?breadCrumbSource=${breadCrumbSource}`,
        }
        } else if (suggestor == SUGGESTOR.TITLE_SUGGESTOR) {
            navigator = {pathname: `/${URL.DETAIL}/${contentType.toLowerCase()}/${id}/${title}`}
        } else if (suggestor == SUGGESTOR.GENRE_SUGGESTOR) {
            navigator = {pathname: `/${URL.BROWSE_BY}/genre/${title}`,  state: {
                bannerImg: backgroundImage,
                bannerLogoImg: image,
                pageType: 'search',
                pathUpdate: pathname,
            }}
        } else if (suggestor == SUGGESTOR.LANGUAGE_SUGGESTOR) {
            navigator = {pathname: `/${URL.BROWSE_BY}/language/${title}`, state: {
                bannerImg: backgroundImage,
                bannerLogoImg: image,
                pageType: 'search',
                pathUpdate: pathname,
                language: title,
            }}
        }
        this.setState({ showAutoComplete: false });
        if (val?.title.length > 2) {
            safeNavigation(history, navigator);
            searchText(val?.title);
        } else {
          safeNavigation(history, `/${URL.SEARCH}`);
          searchText("");
        }
    };

    recentSearchClick = (item) => {
        const { searchSource, recentSearchVal, recentSearch, searchText, history } = this.props;
        searchSource(MIXPANEL.VALUE.SEARCH_SOURCE_RECENT_SEARCH);
        recentSearchVal && recentSearch(false);
        this.inputTitle.value = item;
        let oldSearches = getKey(LOCALSTORAGE.SEARCH);
        oldSearches = oldSearches
            .replace(/['"]+/g, "")
            .replace(/[\[\]']+/g, "")
            .split(",");
        // deleteKey(LOCALSTORAGE.SEARCH);
        let idx = oldSearches.indexOf(item);
        oldSearches.splice(idx, 1);
        oldSearches.unshift(item);
        setKey(LOCALSTORAGE.SEARCH, oldSearches);
        document.body.style.overflowY = "auto";
        searchText(item);
        if (item.length > 0) {
            this.setState({
                disableCross: false,
            });
        }
        this.addLearnLocalStorage()
        safeNavigation(history, `/${URL.SEARCH}?q=${item}`);
    };

    handleBrokenImage = () => {
        this.setState({
            showAvatarImage: true,
            brokenImage: true,
        });
    };
    oncloseSideBar = () => {
        this.setState({
            isSideMenuOpen: false,
        });
        handleOverflowOnHtml(true);

    }

    handleAliasError = (reset, callBack) => {
        // if (reset) {
        //     this.errors = {};
        //     this.setState({
        //         errors: {},
        //     });
        //     callBack && this.setState((previousState) => {
        //         return {
        //             undoAliasName: !previousState.undoAliasName,
        //         };
        //     });
        // } else {
        //     let { addAliasResponse } = this.props;
        //     this.errors.alias = addAliasResponse.message;
        //     this.setState({
        //         errors: this.errors,
        //     });
        // }
    };

    onPastePatternCheck = (e) => {
        let regex = new RegExp("[a-zA-Z 0-9-,!'#$()+./:;<=>?@*~]+");
        let pastedData = e.clipboardData.getData("text");
        let data = pastedData.match(regex);
        if (data === null) {
            e.preventDefault();
            return false;
        } else {
            e.preventDefault();
            let element = document.getElementById("search-input");
            element.value = data[0];
            this.searchChange(e);
        }
    };

    headerMenuClick = (e, item) => {
        let { categoryDropDown, categoriesList } = this.props;
        if (item.pageName.toLowerCase() === BOTTOM_SHEET.CATEGORIES.toLowerCase()) {
            const selectedPageData = JSON.parse(getKey(LOCALSTORAGE.SELECTED_CATEGORY_PAGE));
            if (selectedPageData && isMobile.any()) {
                safeNavigation(this.props.history, {
                    pathname: `/${URL.CATEGORIES}/${getFormattedURLValue(selectedPageData?.pageName)}`,
                    state: {
                        pageType: selectedPageData?.pageType
                    }
                })
            }
            else {
                categoryDropDown && !isEmpty(categoriesList) && categoryDropDown(true);
            }
        } else {
            this.menuItemClick(e, item);
        }
    };

    getHeaderMenuItems = (item, index, view) => {
        let {
            location: { pathname, search },
        } = this.props;
        const params = new URLSearchParams(search);
        let breadCrumValue = params?.get("breadCrumbSource");
        const urlArr = pathname.split("/");
        urlArr[1] = urlArr[1] === "" ? "home" : urlArr[1];

        if (urlArr[1] === URL.BROWSE_BY) {
            breadCrumValue = this.props?.location?.state?.breadCrumbSource;
        }
        
        return (
            <li
                onClick={(e) => this.headerMenuClick(e, item)}
                key={index}
                className={
                    item.pageName.toLowerCase() === BOTTOM_SHEET.CATEGORIES.toLowerCase()
                        ? "open-popup"
                        : ""
                }
            >{item?.showCrown && <img src={crownIcon} className="crown-img" />}            
                <div
                    className={`header-menu-item ${(urlArr[1] === item.linkToRedirect || breadCrumValue?.toLowerCase() === item.linkToRedirect.toLowerCase()) && !this.props.categoriesDropdownVal ? "selectedLink" : ""
                        } ${item.pageName.toLowerCase() === BOTTOM_SHEET.CATEGORIES.toLowerCase() && this.props.categoriesDropdownVal && "selectedLink"} `}
                >
                    {view === VIEW.WEB_SMALL &&
                        (item?.iconName ? (
                            <i className={item.iconName} />
                        ) : (
                            <img alt="" className="header-menu-img" src={item.imagePath} />
                        ))}
                    {item.pageName.toLowerCase() === URL.SPORTS ?
                        <span className="kids-font-family">{item.pageName}</span> : item.pageName}
                </div>
                {this.props.categoriesDropdownVal &&
                    window.innerWidth > TAB_BREAKPOINT &&
                    item.pageName === "Categories" && <CategoryDropdown />}
            </li>
        );
    };


    handleSideBarClick = (e) => {
        e.preventDefault();
        this.setState((previousState) => {
            return {
                isSideMenuOpen: !previousState.isSideMenuOpen,
            };
        });
        this.pageClickEvent(MIXPANEL.VALUE.HAMBURGER)

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MENU_CLICK);
        handleOverflowOnHtml();
    };

    getHeaderItemsList = () => {
        const isLogin = this.props.loggedStatus;
        let { items, currentSubscription } = this.props;
        items.length === 5 && items.push(HEADER_MENU_LIST_GO_VIP);
        if (isLogin && !checkCurrentSubscription(currentSubscription) && !this.props.fromLogin) {
            items?.map((i) => {
                if (i.pageName === SIDE_MENU_HEADERS.SUBSCRIBE) {
                    i.pageName = SIDE_MENU_HEADERS.MY_PLAN;
                    i.linkToRedirect = `${URL.SUBSCRIPTION}`;
                }
            });
        } else if (!isLogin) {
            if (
                items &&
                items[items.length - 1].pageName === SIDE_MENU_HEADERS.MY_PLAN
            ) {
                items[items.length - 1].pageName = SIDE_MENU_HEADERS.SUBSCRIBE;
                //items[items.length-1].linkToRedirect = 'Compare plan go vip screen'
            }
            // items.length === 5 && items.push(HEADER_MENU_LIST_GO_VIP);
        }
        return items;
    };

    getSideMenuListOptions = () => {
        const isLogin = this.props.loggedStatus;
        let menuListOption = [...SIDE_BAR_MENU_LIST], subsData = GO_VIP_DATA;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const { balanceInfo, currentSubscription } = this.props;
        //Check if plan is expired then set isExpired as true.
        if (isLogin) {
            if (!checkCurrentSubscription(currentSubscription)) {
                subsData = {
                    firstLabel: SIDE_MENU_HEADERS.MY_PLAN,
                    secondLabel: currentSubscription?.combo ? currentSubscription?.comboPlanName : currentSubscription?.productName, //plan name
                    endData: currentSubscription?.planOption?.renewPlanVerbiage,
                    linkToRedirect: URL.SUBSCRIPTION,
                    endIconPath: '../../../assets/images/end-icon.svg',
                    endIconClass: `end-icon ${(currentSubscription?.planOption?.renewButtonOption || currentSubscription?.planOption?.getPlanOption) && 'renew-btn'}`, // iconName: 'icon-Crown',
                    leftIconPath: '../../../assets/images/crown-icon.svg',
                    firstIconClassName: 'crown-icon',
                    secondLabelClassName: 'second-label-text',
                    showActionButton: currentSubscription?.planOption?.renewButtonOption,
                    actionBtnName: currentSubscription?.planOption?.renewButtonMessage,
                    isExpired: currentSubscription?.planOption?.highlightDateVerbiage,
                    webView: true,
                    mobileView: true,
                };

                if (get(currentSubscription, "planOption.getPlanOption")) {
                    subsData = {
                        ...subsData,
                        showActionButton: currentSubscription?.planOption?.getPlanOption,
                        actionBtnName: currentSubscription?.planOption?.getPlanMessage,
                    };
                }
            }

            if (userInfo?.dthStatus !== DTH_TYPE.NON_DTH_USER && !isEmpty(balanceInfo)) {
                let dthData = {
                    firstLabel: SIDE_MENU_HEADERS.TATA_SKY_BALANCE,
                    secondLabel: get(balanceInfo, "balanceQueryRespDTO.balance"),
                    endData: get(balanceInfo, "endDateVerbiage"),
                    dthBlock: true,
                    linkToRedirect: false,
                    endIconPath: null,
                    endIconClass: "end-icon",
                    iconName: "icon-wallet",
                    showActionButton: true,
                    actionBtnName: "Recharge",
                    secondLabelClassName: "second-label-text",
                    isExpired: get(balanceInfo, "highlightDateVerbiage"),
                    webView: true,
                    mobileView: true,
                };
                menuListOption = [dthData, subsData, ...menuListOption];
            } else {
                menuListOption.unshift(subsData);
            }
        } else {
            menuListOption.unshift(GO_VIP_DATA);
        }


        return menuListOption.filter((item) =>
            !isMobile.any() ? item?.webView === true : true,
        );

    };

    handleLoginClick = async () => {
        this.props.setUpdatedTenure()
        await loginInFreemium({
            openPopup,
            closePopup,
            openLoginPopup,
            source: MIXPANEL.VALUE.HAMBURGER_MENU,
            ComponentName: MINI_SUBSCRIPTION.LOGIN,
            fromLogin: true
        });
    };

    getHeaderClass = () => {
        let {
            location: { pathname }, isHomePage,
            homeScreenFilteredDataItems
        } = this.props;
        const urlArr = pathname.split("/");
        let heroBannerItems = homeScreenFilteredDataItems && homeScreenFilteredDataItems.filter(item => item.sectionType === SECTION_TYPE.HERO_BANNER);
        let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        const isHideDownloadHeader = this.props.isHideDownloadHeader || sourceIsMSales;
        return `header for-web home-page 
        ${!isHideDownloadHeader && isMobile.any() && "header-top-margin"} 
        ${categoryDropdownHeader(this.props.location) && "category-page"}
        ${this.state.pageScrolled && "page-scroll"}
        ${urlArr[1] === URL.SUBSCRIPTION && 'subscription-header'}
        ${isHomePage && 'home-header'}
        ${this.isSearchPage() && 'home-search'}
        ${isHomePage && !heroBannerItems.length > 0 && "header-overlay-remove"}`;
    };

    showWebSmallHeader = () => {
        let {
            location: { pathname },
        } = this.props;
        const urls = [
            URL.SEARCH,
            URL.SETTING,
            URL.WATCHLIST,
            URL.SUBSCRIPTION,
            URL.SUBSCRIPTION_TRANSACTION_REDIRECT,
            URL.SUBSCRIPTION_TRANSACTION,
            URL.DEVICE_MANAGEMENT
        ];
        const urlArr = pathname.split("/");
        let webSmallPaymentJourney = isWebSmallLinkPayment(location);
        return !urls.some((url) => url === urlArr[1]) && !webSmallPaymentJourney;
    };

    showProfileImage = () => {
        const isLogin = this.props.loggedStatus;
        let { profileDetails, configResponse } = this.props;
        const { showAvatarImage, brokenImage } = this.state;
        let imgUrl = `${get(
            configResponse,
            "data.config.subscriberImage.subscriberImageBaseUrl",
        )}${get(profileDetails, "profileImage")}`;

        if (isLogin) {
            return (
                <>
                    {configResponse && profileDetails?.profileImage ? (
                        <>
                            {get(profileDetails, "profileImage") && !showAvatarImage && (
                                <div className="logged-in-user-img">
                                    <img src={imgUrl} onError={this.handleBrokenImage} alt="" />
                                </div>
                            )}
                            {/* {(showAvatarImage || !get(profileDetails, "profileImage")) && (
                                <div className={'avatar-block'}>
                                    <p>{get(profileDetails, 'firstName', '*').charAt(0)}</p>
                                </div>)}*/}
                            {brokenImage && this.showProfileAvatar()}
                        </>
                    ) : (
                        this.showProfileAvatar()
                    )}
                </>
            );
        } else {
            return this.showProfileAvatar();
        }
    };

    showProfileAvatar = () => {
        return (
            <div className={"logged-out-profile"}>
                <img src={UnknownUser} alt="unkown-user-avatar" onMouseOver={(e) => (e.currentTarget.src = AccountWhiteUser)}
                    onMouseOut={(e) => (e.currentTarget.src = UnknownUser)} />
            </div>
        );
    };

    isSearchPage = () => {
        const { location } = this.props;
        return [`/${URL.SEARCH}`].includes(location.pathname) || (isMobile.any() && this.props.searchVal && !location.pathname.indexOf(URL.SEARCH) > -1);
    }

    render() {
        const {
            loggedIn,
            searchVal,
            history,
            switchAccountDropDown,
            accountDropDown,
            recentSearchVal,
            accountDropDownVal,
            profileDetails,
            configResponse,
            switchAccountDropDownVal,
            categoryDropDown,
            categoriesList,
            currentSubscription,
            isHideDownloadHeader,
            location,
            enableTickTickJourney,
            getWebPortalLink,
            searchTextVal,
        } = this.props;

        let {
            showAvatarImage,
            errors,
            undoAliasName,
            searchAutoFocus,
            menuListOptions,
            isExpired,
            headerItems,
            dimensions,
            list,
        } = this.state;
        let userProfileImage = get(profileDetails, "profileImage") && !showAvatarImage,
            urlArray = [`/${URL.HOME}`, `/${URL.MOVIES}`, `/${URL.SPORTS}`, `/${URL.TV_Shows}`, `${URL.DEFAULT}`],
            headerButtonSubscription = urlArray.includes(location.pathname),
            urlArr = location.pathname.split("/"),
            isCategoryPage = urlArr[1] === BOTTOM_SHEET.CATEGORIES?.toLowerCase(),
            sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE,
            hideHamburgerMenu = this.isSearchPage() || sourceIsMSales,
            showSearchIcon = !sourceIsMSales && !searchVal && (isMobile.any() || !window.location.pathname.includes("search")),
            hideBrandLogo = this.isSearchPage(),
            showSubscribeButton = (headerButtonSubscription || isCategoryPage) && isMobile.any() && checkCurrentSubscription(currentSubscription) && !sourceIsMSales;

        return (<React.Fragment>
            <header>
                <div
                    className={this.getHeaderClass()}
                    onClick={(e) => {
                        this.searchHide(e);
                        if (!e.target.getAttribute("account")) {
                            accountDropDown && this.handleAliasError(true, true);
                            accountDropDownVal && accountDropDown(false);
                            this.notificationHide(e);
                            switchAccountDropDownVal && switchAccountDropDown(false);
                        }
                    }}
                >
                    <div className={`header-left`}>
                        <span
                            className={`more-option ${hideHamburgerMenu && "hide-more-option"}`}
                            onClick={(e) => this.handleSideBarClick(e)}>
                            <img
                                alt="more-option"
                                src={moreOption}
                            />
                        </span>
                        <h1
                            className={`${hideBrandLogo && "hide-more-option"}`}
                            onClick={() => !sourceIsMSales && safeNavigation(history, URL.DEFAULT)}>
                            Tata Play binge
                        </h1>
                        {showSubscribeButton &&
                            <div className="subscribe-action"
                                onClick={async () => {
                                    !this.props.isManagedApp ? safeNavigation(history,URL.SUBSCRIPTION) :(
                                    enableTickTickJourney ?
                                        await loginInFreemium({
                                            openPopup, closePopup, openLoginPopup, source: firebase.VALUE.HOME_SUBSCRIBE, ComponentName: MINI_SUBSCRIPTION.SELECTION_DRAWER
                                        })
                                        : await getWebPortalLink({
                                            initiateSubscription: JOURNEY_SOURCE.DRAWER_CYOP,
                                            journeySource: JOURNEY_SOURCE.DRAWER_CYOP,
                                            analyticSource: MIXPANEL.VALUE.HOME,
                                            journeySourceRefId: ""
                                        }))
                                }}>
                                <span>
                                    <img src={crownIcon} className="crown-img" />
                                </span>
                                <Button
                                    cName={`subscribe-btn`}
                                    bType="button"
                                    bValue="Subscribe"
                                />
                            </div>
                        }
                        {!sourceIsMSales &&
                            <ul
                                className={`${this.props.categoriesDropdownVal ? "active-Popup" : ""
                                    }`}
                            >
                                {headerItems?.map((item, index) =>
                                    this.getHeaderMenuItems(item, index),
                                )}
                            </ul>
                        }
                    </div>
                    {!sourceIsMSales && <div
                        className={`header-right`}>
                        <ul className={`header-menu-right ${!isMobile.any() ? 'web-large' : 'web-small'}`}>
                            {(searchVal || window.location.pathname.includes("search")) && (
                                <li
                                    className={`search search-position ${!isMobile.any() ? 'web-large' : 'web-small'}`}
                                    search="true"
                                    onClick={(e) => this.accountHide(e)}
                                >
                                    {/* <i
                                            className="icon-icon-search"
                                            search="true"
                                            onClick={() => {
                                                this.searchRedirection(this.inputTitle.value);
                                            }}
                                        /> */}

                                    {/*isMobile.any() && <i className={`icon-arrow-left2`}
                                                              onClick={() => this.props.history.goBack()}/>*/}
                                    {isMobile.any() && <i className={`icon-arrow-left2`}
                                        onClick={() => this.returnBackClick()} />}
                                        <i className="icon-icon-search" search="true"></i>
                                    <input
                                        autoComplete="off"
                                        search="true"
                                        type="text"
                                        maxLength="25"
                                        autoFocus={searchAutoFocus}
                                        placeholder="Search for a TV Show or movie"
                                        id="search-input"
                                        ref={(el) => (this.inputTitle = el)}
                                        onFocus={() => this.focusHandle()}
                                        onKeyUp={(e) => {
                                            this.patternCheck(e);
                                        }}
                                        onChange={(e) => this.searchChange(e)}
                                        onPaste={(e) => {
                                            this.onPastePatternCheck(e);
                                        }}
                                    />
                                    {/* <i className={`icon-search-blue`} src={SearchBlue}/> */}
                                    {/* <i search="true" className="icon-icon-search-upd-input" /> */}

                                    {/* {this.inputTitle && ( */}
                                    <i search="true"  className={`icon-close ${!isMobile.any() ? 'web-large' : 'web-small'}`} innerref={(el) => (this.iconClose = el)}
                                        onClick={() => this.inputClick()} />
                                    {/* )} */}
                                    {!isMobile.any() && list && recentSearchVal && (
                                        <ul search="true" className="recent-search-dp">
                                            <li search="true">
                                                Recent Searches{" "}
                                                <span onClick={() => this.clearClick()}>
                                                    Clear All
                                                </span>
                                            </li>
                                            {list.map((item, idx) => (<li
                                                key={idx}
                                                onClick={() => this.recentSearchClick(item)}
                                                search="true"
                                            >
                                                {/* <i className="icon-icon-search"/> */}
                                                {/* <span className="search-name">{item}</span> */}
                                                <div className="recent-search-sub-container">
                                                    <span className="search-name">{item}</span>
                                                    <div>
                                                        <img
                                                          src={Cross}
                                                          className={'header__input__cross'}
                                                          onClick={(e) => this.clickOnCrossIcon(e, item)}
                                                        />
                                                    </div>
                                                </div>
                                            </li>))}
                                        </ul>)}

                                        {this.state.showAutoComplete && this.props.searchAutoSuggestedData && this.props.searchAutoSuggestedData.length > 0  && (
                                            <AutoComplete
                                              resData={this.props.searchAutoSuggestedData}
                                              history={history}
                                              searchText={searchTextVal}
                                              passingVal={(val) => this.passingVal(val)}
                                            />
                                        )}
                                </li>)}
                            {showSearchIcon && (
                                <li
                                    search="true"
                                    className="search-header-icon"
                                    onClick={(e) => this.searchIconClick(e)}
                                >
                                    <i search="true" className="icon-icon-search-upd" />
                                </li>)}
                            {/* {!isMobile.any() && (<li className="notification-icon">
                                {getLayeredIcon("icon-Notification-Bell-upd")}
                               </li>)} */}
                            {!isMobile.any() && (
                                <li
                                    className="account-dropdown"
                                    onClick={(e) => {
                                        if (!e.target.getAttribute("account")) {
                                            this.handleAliasError(true, true);
                                            accountDropDownVal && accountDropDown(false);
                                            switchAccountDropDownVal &&
                                                switchAccountDropDown(false);
                                        }
                                    }}
                                >
                                    <span
                                        onClick={(e) =>
                                            this.toggleHeaderDropdown(e, "AccountDropdown")
                                        }
                                    >
                                        {this.showProfileImage()}
                                    </span>
                                    <AccountDropdown
                                        history={history}
                                        dimensions={dimensions}
                                        loggedIn={loggedIn}
                                        toggleHeaderDropdown={this.toggleHeaderDropdown}
                                        isOpen={accountDropDownVal}
                                        userProfileImage={userProfileImage}
                                        isSwitchAccDropdownOpen={switchAccountDropDownVal}
                                        errors={errors}
                                        undoAliasName={undoAliasName}
                                        handleAliasError={this.handleAliasError.bind(this)}
                                        menuListOptions={menuListOptions}
                                        profileDetails={profileDetails}
                                        isExpired={isExpired}
                                        onLoginClick={this.handleLoginClick}
                                    />
                                </li>
                            )}
                        </ul>
                    </div>}
                    {categoryDropdownHeader(this.props?.location) && (
                        <div
                            className="categoryPopup"
                            onClick={() =>
                                !isEmpty(categoriesList) && categoryDropDown(true)
                            }
                        >
                            {this.props.location.pathname.split("/")[2]}
                            <span>
                                <img src="../../assets/images/dropdown.png" alt="" />
                            </span>
                        </div>
                    )}
                </div>
            </header>
            {this.showWebSmallHeader() && (
                <div className={"header-for-responsive"}>
                    <ul>
                        {headerItems
                            ?.filter(
                                (item) =>
                                    ![
                                        SIDE_MENU_HEADERS.SUBSCRIBE,
                                        SIDE_MENU_HEADERS.MY_PLAN,
                                    ].includes(item.pageName),
                            )
                            .map((item, index) =>
                                this.getHeaderMenuItems(item, index, VIEW.WEB_SMALL),
                            )}
                    </ul>
                </div>
            )}
            <AccountSideMenuBar
                history={history}
                isHideDownloadHeader={isHideDownloadHeader}
                dimensions={dimensions}
                isMenuOpen={this.state.isSideMenuOpen}
                onClose={this.oncloseSideBar}
                isExpired={isExpired}
                menuListOptions={menuListOptions}
                profileDetails={profileDetails}
                onLoginClick={this.handleLoginClick}
                currentSubscription={currentSubscription}
                configResponse={configResponse}
            />
        </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    items: get(state, "headerDetails.headerItems.items"),
    showModal: state.modal.showModal,
    login: state.modal.login,
    popupLoginState: state.headerDetails.val,
    searchVal: state.headerDetails.search,
    recentSearchVal: state.headerDetails.recentSearch,
    searchTextVal: state.headerDetails.searchText,
    accountDropDownVal: state.headerDetails.accountDropDown,
    notificationDropDownVal: state.headerDetails.notificationDropDown,
    switchAccountDropDownVal: state.headerDetails.switchAccountDropDown,
    profileDetails: get(state.profileDetails, "userProfileDetails"),
    configResponse: get(state.headerDetails, "configResponse"),
    addAliasResponse: get(state, "headerDetails.addAliasResponse"),
    genreInfo: get(state, "headerDetails.genreInfo"),
    balanceInfo: get(state.subscriptionPaymentReducer, 'accountBalanceInfo.data'),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    categoriesDropdownVal: state.headerDetails.categoriesDropdown,
    loggedStatus: state.commonContent.loggedStatus,
    categoriesList: get(state.headerDetails, "categoriesList"),
    isHideDownloadHeader: state.headerDetails.isHideDownloadHeader,
    isHomePage: state.headerDetails.isHomePage,
    isManualLogin: get(state.loginReducer, "isManualLogin"),
    miniStatus: get(state.commonContent, 'miniStatus'),
    homeScreenFilteredDataItems: get(state, 'homeDetails.homeScreenFilteredDataItems'),
    fromLogin: get(state.commonContent, "fromLogin"),
    selectedCategoryPage: state.headerDetails.selectedCategoryPage,
    enableTickTickJourney: get(state.headerDetails, "configResponse.data.config.enableTickTickJourney"),
    isManagedApp: get(state.headerDetails, "isManagedApp"),
    searchAutoSuggestedData: get(state.browseBy, "searchAutoSuggestedData"),
});

const mapDispatchToProps = (dispatch) => ({
    loginSignUp: (val) => {
        return dispatch(loginSignUp(val));
    },
    loginPopupState: (val) => {
        return dispatch(loginPopupState(val));
    },
    setSearch: (val) => {
        return dispatch(setSearch(val));
    },
    searchText: (val) => {
        return dispatch(setSearchText(val));
    },
    recentSearch: (val) => {
        return dispatch(recentSearch(val));
    },
    searchSource: (val) => {
        return dispatch(searchSource(val));
    },
    accountDropDown: (val) => {
        return dispatch(accountDropDown(val));
    },
    notificationDropDown: (val) => {
        return dispatch(notificationDropDown(val));
    },
    switchAccountDropDown: (val) => {
        return dispatch(switchAccountDropDown(val));
    },
    categoryDropDown: (val) => {
        return dispatch(categoryDropDown(val));
    },
    showMainLoader: () => dispatch(showMainLoader()),
    hideMainLoader: () => dispatch(hideMainLoader()),
    getGenreInfo: () => dispatch(getGenreInfo()),
    getBalanceInfo: (val, amt, isFromAccHeader) => dispatch(getBalanceInfo(val, amt, isFromAccHeader)),
    openPopup: () => dispatch(openPopup()),
    closePopup: () => dispatch(closePopup()),
    openLoginPopup: () => dispatch(openLoginPopup()),
    setLoginManual: (value) => dispatch(setLoginManual(value)),
    setUpdatedTenure: (value) => dispatch(setUpdatedTenure()),
    getWebPortalLink: (value) => dispatch(getWebPortalLink(value)),

    fetchSearchAutosuggestedData: (val = '') => dispatch(fetchSearchAutosuggestedData(val)),
});
Header.propTypes = {
    items: PropTypes.array,
    recentSearch: PropTypes.func,
    accountDropDown: PropTypes.func,
    notificationDropDown: PropTypes.func,
    loginPopupState: PropTypes.func,
    loginSignUp: PropTypes.func,
    searchText: PropTypes.func,
    history: PropTypes.object,
    searchVal: PropTypes.any,
    searchInpVal: PropTypes.string,
    setSearch: PropTypes.func,
    searchSource: PropTypes.func,
    location: PropTypes.object,
    popupLoginState: PropTypes.bool,
    accountDropDownVal: PropTypes.bool,
    notificationDropDownVal: PropTypes.bool,
    switchAccountDropDownVal: PropTypes.bool,
    switchAccountDropDown: PropTypes.func,
    configResponse: PropTypes.object,
    profileDetails: PropTypes.object,
    login: PropTypes.bool,
    loggedIn: PropTypes.func,
    search: PropTypes.bool,
    recentSearchVal: PropTypes.bool,
    addAliasResponse: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    getGenreInfo: PropTypes.func,
    genreInfo: PropTypes.array,
    getBalanceInfo: PropTypes.func,
    currentSubscription: PropTypes.object,
    balanceInfo: PropTypes.object,
    openLoginPopup: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    categoriesDropdownVal: PropTypes.bool,
    categoryDropDown: PropTypes.func,
    loggedStatus: PropTypes.bool,
    categoriesList: PropTypes.object,
    userProfileDetails: PropTypes.object,
    isHideDownloadHeader: PropTypes.bool,
    isHomePage: PropTypes.bool,
    isManualLogin: PropTypes.bool,
    setLoginManual: PropTypes.func,
    miniStatus: PropTypes.bool,
    setUpdatedTenure: PropTypes.func,
    homeScreenFilteredDataItems: PropTypes.array,
    getWebPortalLink: PropTypes.func,
    isManagedApp: PropTypes.bool
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(Header);
