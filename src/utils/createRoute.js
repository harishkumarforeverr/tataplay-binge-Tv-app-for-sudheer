import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isMobile, isUserloggedIn, isHelpCenterWebView, getWebSmallRouteValues, getSearchParam } from "@utils/common";
import { URL } from "@constants/routeConstants";
import NetworkAvailabilityModal from '@components/NetworkAvailabilityModal'
import { getKey, setKey } from "@utils/storage";
import { LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE, PLAY_STORE_URL, SEARCH_PARAM, SEARCH_PARAM_ACTION_VALUE } from "@constants";
import get from "lodash/get";
import WebSmallValidate from "@containers/WebSmallValidate";
import LandingScreen from "../containers/HelpCenter/LandingScreen";
import queryString from "querystring";

const definedRoute = (route) => {
    return (
        <Route path={route.path} exact={route.exact || false} render={props => {
            // pass the sub-routes down to keep nesting
            return (<route.component {...props} routes={route.routes} />)
        }
        } />
    )
};

const RouteWithSubRoutes = (route) => {
    const path = getKey(LOCALSTORAGE.CURRENT_PATH);
    const checkNetworkConnection = navigator.onLine;
    if (path !== route.location.pathname) {
        if (!checkNetworkConnection) {
            return (<NetworkAvailabilityModal />)
        }
    }

    setKey(LOCALSTORAGE.CURRENT_PATH, get(route, "location.pathname"));
    const searchPath = get(route, "location.search");
    const hashPath = get(route, "location.hash") || '';
    const currentPath = get(route, "location.pathname"),
        locationState = {};

    // Web small URL
    const { webSmallPaymentRouteKey, webSmallRouteToken } = getWebSmallRouteValues();

    //AppsFlyer
    const queryParams = queryString.parse(searchPath);
    const appsFlyerDeeplinkValue = queryParams?.deep_link_value;

    // Help center
    let isHelpCenterInMobileApp = JSON.parse(getKey(LOCALSTORAGE.IS_HELP_CENTER_IN_MOBILE_APP)) === true;
    if (searchPath !== "" && webSmallPaymentRouteKey) {
        let isSilentLoginCase = [WEB_SMALL_PAYMENT_SOURCE.NON_BINGE, WEB_SMALL_PAYMENT_SOURCE.INFO, WEB_SMALL_PAYMENT_SOURCE.ID].includes(webSmallPaymentRouteKey)
        if (isMobile.any() || isSilentLoginCase) {
            return (<WebSmallValidate
                webSmallPaymentRouteKey={webSmallPaymentRouteKey}
                webSmallRouteToken={webSmallRouteToken}
                wsRoute={searchPath}
            />);
        } else {
            return (<Redirect to={{
                pathname: `${URL.DEFAULT}`,
            }} />);
        }
    } else if (currentPath.includes("redirectToApp")) {
        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
            window.location.href = PLAY_STORE_URL.ANDROID;
        } else {
            window.location.href = PLAY_STORE_URL.ANDROID;
        }
    }
    else if ((searchPath !== '') && ((searchPath.includes("?token") || (searchPath.includes("?isUserLoggedIn"))))) {
        return (<LandingScreen hcToken={get(route, 'location.search')} />);
    }
    else if (isHelpCenterWebView() || isHelpCenterInMobileApp || (currentPath.includes(`/${URL.TRANSACTIONS}`))) {
        if (currentPath.includes(`/${URL.HELP_CENTER}`) || currentPath.includes(`/${URL.TRANSACTIONS}`)) {
            return definedRoute(route);
        }
        else {
            return (<Redirect to={{ pathname: `${URL.HELP_CENTER}` }} />);
        }
    }
    else if (currentPath.includes(`/${URL.HELP_CENTER}`)) {
        return definedRoute(route);
    }
    else if (currentPath.includes(`/${URL.MY_SUBSCRIPTION}`)) {
        // Allowed route for deeplinks handling
        return (<Redirect to={{
            pathname: `${URL.SUBSCRIPTION}`,
            search: decodeURIComponent(searchPath.concat(hashPath))
        }} />);
    }
    else {
        /* S360 chatbot close handling starts */
        // to close the S360 chatbot when user comes out from help center screens
        let isS360ChatabotOpen = Simplify360Chat.isChatIFrameOpen();
        isS360ChatabotOpen && Simplify360Chat.closeChat();
        /* S360 chatbot close handling ends */

        if (route.accessBeforeLogin) {
            return definedRoute(route);
        }
        if (isUserloggedIn()) {
            return definedRoute(route);
        }

        const actionParamValue = getSearchParam(SEARCH_PARAM.ACTION); // check is deeplink url
        if (appsFlyerDeeplinkValue || actionParamValue.includes(SEARCH_PARAM_ACTION_VALUE.DEEPLINK)) {
            locationState = { ...locationState, showLogin: true };
        }

        return (<Redirect to={{
            pathname: `${URL.DEFAULT}`,
            state: locationState,
        }} />);
    }
};

const createRoute = (routes, propsPassed) => (routes && routes.map && routes.map((route, i) => (
    <RouteWithSubRoutes key={i} {...route} {...propsPassed} />)));

export default createRoute;

