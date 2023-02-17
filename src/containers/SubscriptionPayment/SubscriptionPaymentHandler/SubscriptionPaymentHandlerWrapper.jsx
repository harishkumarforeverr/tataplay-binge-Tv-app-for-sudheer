import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom';
import SubscriptionPaymentHandler from '.';
import { setSubscriptionPaymentMode } from '../APIs/action';

export default function SubscriptionPaymentHandlerWrapper() {
  const subscriptionPaymentMode = useSelector(state => state?.subscriptionPaymentReducer?.paymentMode);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(()=>{
    if(subscriptionPaymentMode){
        dispatch(setSubscriptionPaymentMode(false))
        // dispatch action to remove paymentMode
    }
  },[location.pathname])

  if(!subscriptionPaymentMode){
      return null;
  }
  return (
    <SubscriptionPaymentHandler paymentMethod={subscriptionPaymentMode} />
  )
}
