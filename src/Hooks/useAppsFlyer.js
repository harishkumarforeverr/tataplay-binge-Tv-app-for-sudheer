import appsFlyerConfig from "@utils/appsFlyer";
import { isUserloggedIn, loginInFreemium, trackRechargeEvent } from "@utils/common";
import APPSFLYER, {
    APPSFLYER_SCREEN_EVENTS,
} from "@utils/constants/appsFlyer";
import React, { useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "querystring";
import { useDispatch, useSelector } from "react-redux";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import { closePopup, openPopup } from "@common/Modal/action";
import { setIsSourceAppsFlyerDeeplink } from "@src/action";
import { getKey } from "@utils/storage";
import { DTH_TYPE, LOCALSTORAGE } from "@utils/constants";
import { getBalanceInfo, quickRecharge } from "@containers/SubscriptionPayment/APIs/action";
import { renewSusbcription } from "@containers/Subscription/APIs/subscriptionCommon";
import { SUBSCRIPTION_STATUS } from "@containers/Subscription/APIs/constant";
import MIXPANEL from "@utils/constants/mixpanel";

const getUserInfo = () => JSON.parse(getKey(LOCALSTORAGE.USER_INFO));

export default function useAppsFlyer(uniqueId) {
    const isInitialMount = useRef(true);
    
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    
    const currentSubscriptionStatus = useSelector((state)=> state?.subscriptionDetails?.currentSubscription?.data?.subscriptionStatus )
    
    useEffect(()=>{
        if(uniqueId){
            appsFlyerConfig.setUser(uniqueId);
        }
    },[uniqueId])

    /** Trigger APP-LAUNCH Event when app loaded  */
    useEffect(() => {
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.APP_LAUNCH);
    }, []);
    
    /** Check if Appsflyer journey */
    useEffect(() => {
        if (!isInitialMount.current) {
            return;
        }
        const queryParams = queryString.parse(location.search);
        if (queryParams?.deep_link_value) {
            dispatch(setIsSourceAppsFlyerDeeplink());
        }
    }, [dispatch, location.search]);
    
    /** Handle Subscription Renew / Reactivation Deeplink journey */
    useEffect(()=>{
        const userInfo = getUserInfo();
        if(!userInfo){
            return;
        }
        const queryParams = queryString.parse(location.search);
        if(
            queryParams?.deep_link_value !== APPSFLYER.DEEPLINK.MY_SUBSCRIPTION && 
            queryParams?.deep_link_sub1 !== APPSFLYER.DEEPLINK.RENEW
        ){
            return;
        }
        if(!currentSubscriptionStatus || currentSubscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE){
            return;
        }
        renewSusbcription(history);
    },[currentSubscriptionStatus])

    /** Handle Recharge Deeplink journey */
    useEffect(()=>{
        async function handleRechargeJouney(){
            try{
                const {data: balanceData} = await dispatch(getBalanceInfo());
                const {code, data} = await dispatch(quickRecharge(balanceData?.recommendedAmount || 0));
                if(code === 0 && data.rechargeUrl){
                    trackRechargeEvent();
                    appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_INITIATE, { [APPSFLYER.PARAMETER.SOURCE]: APPSFLYER.VALUE.DEEPLINK })
                    mixPanelConfig.trackEvent(MIXPANEL.EVENT.TS_RECHARGE_INITIATE,{[MIXPANEL.PARAMETER.SOURCE]: APPSFLYER.VALUE.DEEPLINK,[MIXPANEL.PARAMETER.AMOUNT]: balanceData?.recommendedAmount || 0});
                    window.location.assign(`${data.rechargeUrl}`);
                }
            }
            catch(e){
                console.log("AppsFlyer recharge journey error");
            }
        }
        if (!isInitialMount.current) {
            return;
        }
        const queryParams = queryString.parse(location.search);
        if(queryParams?.deep_link_value !== APPSFLYER.DEEPLINK.RECHARGE){
            return;
        }
        const userInfo = getUserInfo();
        if(!userInfo){
            loginInFreemium({
                openPopup,
                closePopup,
                openLoginPopup,
                source: APPSFLYER.VALUE.DEEPLINK,
            });
        }
        if(userInfo?.dthStatus === DTH_TYPE.NON_DTH_USER){
            return;
        }
        handleRechargeJouney();
        
    },[location])


    /** Show login popup for protected routes */
    // useEffect(() => {
    //     if (location.state?.showLogin) {
    //         if (!isUserloggedIn()) {
    //             /** Open Login Popup for protected routes * */
    //             loginInFreemium({
    //                 openPopup,
    //                 closePopup,
    //                 openLoginPopup,
    //                 source: APPSFLYER.VALUE.DEEPLINK,
    //             });
    //         }
    //     }
    // }, [location.pathname, dispatch]);

    /** Trigger Appsflyer Screen Events if path changes */
    useEffect(() => {
        let screenEventName = "";
        if (location.pathname === "/") {
            screenEventName = APPSFLYER.EVENT.HOME;
        } else {
            const matchedScreen = Object.keys(APPSFLYER_SCREEN_EVENTS).find(
                (url) => location.pathname.includes(url)
            );
            screenEventName = APPSFLYER_SCREEN_EVENTS[matchedScreen];
        }

        screenEventName && appsFlyerConfig.trackEvent(screenEventName);
    }, [location.pathname]);

    useEffect(() => {
        isInitialMount.current = false;
    }, []);

    return null;
}
