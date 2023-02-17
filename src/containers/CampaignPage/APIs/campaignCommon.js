import React from "react";
import store from "@src/store";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import { URL } from "@constants/routeConstants";
import { getDeviceId, isUserloggedIn,safeNavigation, getUserType, redirectToMangeApp} from "@utils/common";
import { toast } from "react-toastify";
import { LoginSuccessToast } from "@containers/Login/LoginCommon";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";import { LOCALSTORAGE } from "@utils/constants";
import { getKey } from "@utils/storage";

export const filterPack = (packListingData,history) => {
    const packId = new URLSearchParams(history.location.search).get('packId')
    if(packListingData && packListingData?.length > 0  && packId){
        for (const key in packListingData) {
          if(packListingData[key].productId == packId){
             return packListingData[key]
          }
       }
   }
}

export const handleUserNavigation = async (selectedPack,history,param) =>{
    let state = store.getState();
    let currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data');
    let userPackId = get(currentSubscription,'productId');
    let selectedPackId = get(selectedPack,'productId');
    let eligibleInfo  = get(state.subscriptionDetails, 'userEligible');
    let isManagedApp = get(state.headerDetails, "isManagedApp")

  if(isUserloggedIn() && isEmpty(eligibleInfo)){
     return
  }
  else if(isUserloggedIn() && !isEmpty(eligibleInfo)){
     if (eligibleInfo?.allowPG || eligibleInfo?.nonSubscribedToSamePack) {
        //   eligibleInfo?.nonSubscribedToSamePack ?  redirectToHome(history,{...param,isHigher:true}) : redirectToHome(history,param) 
          eligibleInfo?.nonSubscribedToSamePack ?  redirectToHome(history,{...param,isHigher:true}) : param?.isExplorePlans ? handleNativeFlow(history) : redirectToHome(history,param) 
      }
      else if(userPackId === selectedPackId && eligibleInfo?.loginToastFlag){
          safeNavigation(history,URL.SUBSCRIPTION)
      }
      else if(eligibleInfo?.fdoRequested || eligibleInfo?.loginToastFlag){
        safeNavigation(history, '/')
           toast(
              <LoginSuccessToast message={ eligibleInfo?.loginToastMessage || "You are already subscribed to Tata Play Binge" }/>,
              {
                  position:toast.POSITION.BOTTOM_CENTER,
                  className: `login-toast-wrapper`,
                  autoClose: 2000
              }
           )  
      }
   }
   else{
      isManagedApp ? handleNativeFlow(history) : (param.isExplorePlans ?  safeNavigation(history, {pathname: URL.SUBSCRIPTION, state: param }) : redirectToHome( history, param))
   }
}

const redirectToHome = (history,param) => {
    safeNavigation(history, {pathname: '/',state: param })
}


export const mixpanelHandler = (EventName,data) =>{
    let state = store.getState();
    let currentSubscription = get(state.subscriptionDetails, 'currentSubscription.data');
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO))
     const {productId,productName,amountValue}= data
     const amountFinal = Math.floor(Number(amountValue))
    let analyticsData = {
        [MIXPANEL.PARAMETER.PACK_NAME]: productName ,
        [MIXPANEL.PARAMETER.PACK_PRICE]: amountFinal,
        [MIXPANEL.PARAMETER.PACK_ID]: productId,
        [MIXPANEL.PARAMETER.DEVICE_ID]: getDeviceId(),
        [MIXPANEL.PARAMETER.SID]: Number(get(userInfo,'sId')),
        [MIXPANEL.PARAMETER.USER_TYPE]: getUserType(),
        [MIXPANEL.PARAMETER.RMN]: Number(get(userInfo,'rmn')),
    };
     mixPanelConfig.trackEvent(EventName, analyticsData);
}

/** 
    * @handleNativeFlow native subscription and managed app flow is determined on the basis of the isManagedApp key  
    * @isManagedApp boolean 
* 
*/

export const handleNativeFlow = (history,isCampaign) =>{
   let state = store.getState()
   let isManagedApp = get(state.headerDetails, "isManagedApp")
     if(isManagedApp){
        redirectToMangeApp(MIXPANEL.VALUE.CAMPAIGN,isCampaign)
     }else{
        safeNavigation(history,URL.SUBSCRIPTION)
     }
}