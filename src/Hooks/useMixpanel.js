import { setLoginManual } from '@containers/Login/APIs/actions';
import { SUBSCRIPTION_STATUS } from '@containers/Subscription/APIs/constant';
import { getAnalyticsSource, getSearchParam, isHelpCenterWebView, isMobile, isUserloggedIn } from '@utils/common';
import { LOCALSTORAGE } from '@utils/constants';
import MIXPANEL from '@utils/constants/mixpanel';
import MOENGAGE from '@utils/constants/moengage';
import mixPanelConfig from '@utils/mixpanel';
import moengageConfig from '@utils/moengage';
import { getKey } from '@utils/storage';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { fetchMixpanelId } from '@src/action';
import { URL } from '@utils/constants/routeConstants';

export default function useMixpanel() {
  const [distinctId, setDistinctId] = useState();
  
  const location = useLocation();

  const dispatch = useDispatch();

  const loggedStatus = useSelector(state => state.commonContent?.loggedStatus);
  const isManualLogin = useSelector( state => state.loginReducer?.isManualLogin);
  const loginSource = useSelector( state => state.loginReducer.loginSource );
  const subscriptionStatus = useSelector( state => state.subscriptionDetails?.currentSubscription?.data?.subscriptionStatus);

  const initialMount = useRef(true);

  /** Handle When user manually logs in */
  useEffect(()=>{
    if(loggedStatus && isManualLogin && !initialMount.current){
        setUserProperties();
        triggerLoginEvent();
    }
  },[loggedStatus, isManualLogin])

  /** Handle when user logs out */
  useEffect(()=>{
    if(!loggedStatus && !initialMount.current){
        mixPanelConfig.resetUserType();
    }
  },[loggedStatus])

  /** Handle on mount */
  useEffect(()=>{
    const token = getSearchParam('token');
    let helpCenterToken = getKey(LOCALSTORAGE.HELP_CENTER_TOKEN);
    initialMount.current = false;
    if(isMobile.any() && token && window.location.pathname.includes( URL.HELP_CENTER )){
      // do nothing if user redirected from app to helpcenter 
      if(token !== helpCenterToken?.slice(7))
      return;
    }
    setUserProperties();
  },[])

  const triggerLoginEvent  = () => {
    if(!isHelpCenterWebView()){
      let mixpanel = {
          [`${MIXPANEL.PARAMETER.USER_STATE}`]: subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE ? MIXPANEL.VALUE.SUBSCRIBED: MIXPANEL.VALUE.FREEMIUM,
          [`${MIXPANEL.PARAMETER.SOURCE}`]: loginSource || '',
      }
      loginSource === MIXPANEL.VALUE.DISCOUNTING_PAGE && ( mixpanel = {...mixpanel,...{[`${MIXPANEL.PARAMETER.PAGE_NAME}`]: loginSource || '',}})
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.LOGIN_SUCCESS, mixpanel);
    }
    dispatch(setLoginManual(false))
  }


  const setUserProperties = async () => {
    if(isUserloggedIn()){
      mixPanelConfig.unsetSuperProperties();
    }
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    if(isUserloggedIn() && !userInfo?.mixpanelId){
      await dispatch(fetchMixpanelId());
    }
    mixPanelConfig.setSuperProperties();
    mixPanelConfig.setGroup();
    mixPanelConfig.setGroupProperties();
    mixPanelConfig.setPeopleProperties();
    moengageConfig.setUserAttributes(uniqueId);
    const uniqueId = mixPanelConfig.identifyUser();
    setDistinctId(uniqueId);
    if(!isHelpCenterWebView()){
      const mixpanel = {
          [`${MIXPANEL.PARAMETER.TIMESTAMP}`]: moment().valueOf(),
          [MIXPANEL.PARAMETER.FIRST_TIME]: userInfo.firstTimeLoginDate || "",
      };
    }
  }
  
  return distinctId;
}
