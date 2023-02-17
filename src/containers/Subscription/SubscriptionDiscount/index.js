import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { useHistory} from "react-router";
import PropTypes from "prop-types";
import { get, isEmpty } from 'lodash';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { isMobile, isUserloggedIn, loginInFreemium, safeNavigation,cloudinaryCarousalUrl, setSubscriptionJourneySource, redirectToMangeApp, isSubscriptionDiscount } from '@utils/common';
import { LOCALSTORAGE, MINI_SUBSCRIPTION } from '@utils/constants';
import { openPopup, closePopup } from "@common/Modal/action";
import PlanCard from '../PlanSelection/PlanCard';
import Button from '@common/Buttons';
import {
  getCurrentSubscriptionInfo,
  getPackListing,
  checkFallbackFlow,
} from "../APIs/action";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import { checkCurrentSubscription, isUserEligibileForDiscount } from '../APIs/subscriptionCommon';
import { URL } from '@utils/constants/routeConstants';
import { getKey } from '@utils/storage';
import { DISCOUNT_SOURCE } from '../APIs/constant';
import './style.scss';

export default function SubscriptionDiscount() {
  const [selectedPack,setSelectedPack] = useState(null)
  const [discountEligible,setDiscountEligible] = useState(false)
  const packListingData =  useSelector(state => get(state.subscriptionDetails, "packListingData"),shallowEqual)
  const currentSubscription =  useSelector(state => get(state.subscriptionDetails, "currentSubscription.data"))
  const discountImages =  useSelector(state => get(state.headerDetails, "configResponse.data.config.discount"),shallowEqual)
  const isLoading =  useSelector(state => get(state.commonContent, "isLoading"))
  const dispatch = useDispatch()
  const history = useHistory()
  const isLoggedIn = useSelector(state => state.commonContent?.loggedStatus)
  const isManagedApp = useSelector(state => get(state.headerDetails, "isManagedApp"))

  useEffect(()=>{
    dispatch(checkFallbackFlow())
    if(!isUserloggedIn()){
         loginInFreemium({
            openPopup, closePopup, ComponentName: MINI_SUBSCRIPTION.LOGIN,source: MIXPANEL.VALUE.DISCOUNTING_PAGE
        })
    }
    const userEligilbiltyCheck = async (currentSubscription) =>{
      if(checkCurrentSubscription(currentSubscription)){
        dispatch(getPackListing(DISCOUNT_SOURCE)).then((data)=>{
          !isUserEligibileForDiscount(data.data) ? (isManagedApp ? redirectToMangeApp(MIXPANEL.VALUE.DISCOUNTING_PAGE,true): safeNavigation(history, URL.SUBSCRIPTION )): setDiscountEligible(true)
       })
      }else{
        safeNavigation(history, URL.SUBSCRIPTION )
      }
    }
    (async()=>{
      if(isLoggedIn && isEmpty(currentSubscription)){
       const response = await dispatch(getCurrentSubscriptionInfo())
       userEligilbiltyCheck(response?.data)
      }else if(isLoggedIn && !isEmpty(currentSubscription)){
       userEligilbiltyCheck(currentSubscription)
      }
    })()
  },[isLoggedIn])
 
  useEffect(() => {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};    
    isLoggedIn ? mixPanelConfig.trackEvent(MIXPANEL.EVENT.DISCOUNTING_PAGE_LOAD,{
    [`${MIXPANEL.PARAMETER.RMN}`]: userInfo?.rmn,
  }) : mixPanelConfig.trackEvent(MIXPANEL.EVENT.DISCOUNTING_PAGE_LOAD)
  },[isLoggedIn])

  const handlePackSelection = (e, data) => {
    setSelectedPack(data);
  };

  const handleTenure = async () => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_PAGE_PROCEED, {
        [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.DISCOUNTING_PAGE,
        [`${MIXPANEL.PARAMETER.PACK_AMOUNT}`]: selectedPack?.amountValue,
        [`${MIXPANEL.PARAMETER.PACK_NAME}`]: selectedPack?.productName,
        [`${MIXPANEL.PARAMETER.PAGE_NAME}`]: MIXPANEL.VALUE.DISCOUNTING_PAGE,
    });
    await loginInFreemium({
      openPopup,
      closePopup,
      ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE,
      selectedPlan: selectedPack,
      source: MIXPANEL.VALUE.DISCOUNTING_PAGE
    });
  };

  return (
    <div className = 'subscription-discount-container'>
       <div className = {`banner-container ${isUserloggedIn() ? 'rm-height' :''}`}>
       <img src = {!isUserloggedIn()  ? get(discountImages,'SubscriptionDiscountBackground')  : isMobile.any() ? get(discountImages,'SubscriptionBannerMobile')  : get(discountImages,'SubscriptionDiscountBanner')}/>
       </div>
       {isLoggedIn && !isEmpty(packListingData) && !isLoading  && discountEligible &&
        <Fragment>
        <div className='discount-pack-listing-container'>
        <p className='heading'>{get(discountImages,'eligibleListVerbiage')}</p>
        {packListingData &&
         packListingData.map((data, key) => (
           <React.Fragment key={data.productId}>
             <PlanCard
               data={data}
               handlePackSelection={handlePackSelection}
               selectedPack={selectedPack}
             />
           </React.Fragment>
         ))}
         </div>
         <div className="proceed-btn">
         <div className='discount-pack-listing-container'>
         <Button
          bValue={"Proceed"}
          cName="btn primary-btn btn-wrapper"
          clickHandler={handleTenure}
          disabled={isEmpty(selectedPack)}
        />
        </div>
        </div>
        </Fragment>
    }
    </div>
  )
}

SubscriptionDiscount.propTypes = {
   isLoading: PropTypes.bool,
   currentSubscription: PropTypes.object,
   packListingData: PropTypes.object,
   isManagedApp: PropTypes.bool
}

