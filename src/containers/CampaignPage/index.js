import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useHistory} from "react-router";
import {useSelector,useDispatch, shallowEqual} from 'react-redux'
import { get, isEmpty } from 'lodash';
import { cloudinaryCarousalUrl, safeNavigation, isUserloggedIn, redirectToMangeApp } from "@utils/common";
import Logo from "@assets/images/bingeLogo.svg";
import crownLogo from "@assets/images/crown-icon.svg";
import RightArrow from "@assets/images/mini-arrow.svg";
import Button from '@common/Buttons';
import HeroBanner from '@components/HeroBanner';
import {
  getNotLoggedInPack,
  getCampaignPageData,
  getPackListing,
  getCampaignBannerData,
  isUserEligibileForPack,
  checkFallbackFlow,
} from "@containers/Subscription/APIs/action";
import Accordion from '@containers/HelpCenter/Common/Accordion';
import { filterPack, handleNativeFlow, handleUserNavigation, mixpanelHandler } from './APIs/campaignCommon';
import PartnerCard from './partnerCard';
import MIXPANEL from "@constants/mixpanel";
import { URL } from '@utils/constants/routeConstants';
import './style.scss'

export default function CampaignPage() {
 const [sticky,setSticky] = useState(false)
 const [plan,setPlan] = useState(null)
 const stickyElementOffset = useRef()
 const history = useHistory()
 const dispatch = useDispatch()

 const packListingData = useSelector(state => state.subscriptionDetails?.packListingData,shallowEqual)
 const campaignPage = useSelector(state => state.subscriptionDetails?.campaignPage?.data,shallowEqual) 
 const campaignBannerData = useSelector(state => state.subscriptionDetails?.campaignBannerData?.data.items,shallowEqual) 

 useEffect( () =>{
  dispatch(checkFallbackFlow());
   window.addEventListener('scroll',(e) =>{
    e.preventDefault()
    isSticky()
   });
   let filteredPlan;
    dispatch(getNotLoggedInPack()).then((resp)=> {
      filteredPlan = resp && resp?.data && filterPack(resp?.data, history);
      isEmpty(resp?.data) &&  handleNativeFlow(history,true)
      isEmpty(campaignBannerData) && dispatch(getCampaignBannerData(filteredPlan?.productName))
    });
    isEmpty(campaignPage) &&  dispatch(getCampaignPageData());
    return () => {
    window.removeEventListener('scroll', isSticky);
    }
 },[])
 
 
 useEffect(() => {
     let filteredPlan = packListingData && filterPack(packListingData,history)
     !isEmpty(packListingData) && isEmpty(filteredPlan) && handleNativeFlow(history,true)
     !isEmpty(filteredPlan) && setPlan(filteredPlan)
     !isEmpty(filteredPlan) && mixpanelHandler(MIXPANEL.EVENT.CUSTOM_SUBSCRIPTION_PAGE_INITIATE,filteredPlan)
 },[packListingData])

 const isSticky = () => {
    const scrollTop = window.scrollY;
    scrollTop  > stickyElementOffset?.current?.offsetTop ? setSticky(true) : setSticky(false);
 };


const informationCard = (verbiage1,verbiage2,image) =>{
    return(
        <div className='info-wrapper'>
        <div><img src={image}/></div>
        <p>{verbiage1}</p>
        <p>{verbiage2}</p>
        </div>
    )}

const handleNavigation = async (param) =>{
  isUserloggedIn() && await dispatch(isUserEligibileForPack(plan?.productId))
  handleUserNavigation(plan,history,param)
  mixpanelHandler(param?.isTenure ? MIXPANEL.EVENT.CUSTOM_SUBSCRIPTION_PROCEED:MIXPANEL.EVENT.CUSTOM_SUBSCRIPTION_EXPLORE_PLANS,plan)
}

const getImageData = () => {
  let contentList = [];
  campaignBannerData.map((i) => {
    let j;
    for(j = 0; j <= i.contentList.length - 1; j++){
      contentList.push(i.contentList[j]);
    }
  });
  return {contentList};
};

let heroBannerData = campaignBannerData?.length && getImageData();
  return (
    <div className='campaign-container'>
    {!isEmpty(plan) &&
      <>
    {sticky && <div className='sticky-block'/>}
     <div className={`header-logo ${sticky ? 'sticky':''}`}>
       <img src={Logo} alt='logo' onClick={() => safeNavigation(history,'/')}/>
     </div>
     <div className='campaign-hero-banner-container'>
      <HeroBanner heroBannerItems={campaignBannerData && heroBannerData} isCampaign = {true}/>
     </div>
     <div className='pack-detail-container' >
     <p className='info'>{get(campaignPage,'campaignHeader')}</p>
     <div className= {`pack-details ${sticky ? 'sticky':''}`} >
     <div className='pack-info' ref={stickyElementOffset}>
     <div className='pack-name'>
     <div>
     <img src={crownLogo}/>
     </div>
     <p className={get(plan, "highlightedPack") ? "pack-highlight" :""}>{get(plan,'productName')}</p>
     </div>
    {get(plan,'campaignAmount') && get(plan,'campaignDiscount')  && <div className='pack-discount'>
      <p className='amount'dangerouslySetInnerHTML={{ __html: get(plan,'campaignAmount')}}/>
      <div className='save-container'>
      <p>{get(plan,'campaignDiscount')}</p>
      </div>
     </div> }
     </div>
     <div className='apps-info'>
     <div className='apps-device'>
     {`${plan?.componentList[0].numberOfApps} | ${get(plan,'deviceDetails.platformName')}`}
     </div>
     <div className='pack-amount'>
     <span dangerouslySetInnerHTML={{ __html: plan?.rupeesSymbol}}/>
      <span>{get(plan,"amountValue")?.split(".")[0]}</span>
     <span>{`/${get(plan,"packCycle")}`}</span>
     </div>
     </div>
     <div>
     </div>
     </div>
     <div className='partner-container'>
     <PartnerCard partnerData={plan?.componentList[0].partnerList}/>
     </div>
     { get(plan,"packFooterMessage") && <p className='msg-info amazon'>{get(plan,"packFooterMessage")}</p>}
     {get(plan,"sunnextFooterMessage") && <p className='msg-info'>{get(plan,"sunnextFooterMessage")}</p>}
     {get(plan,"deviceDetails.mxPlatformName") && <p className='msg-info amazon'>{get(plan,"deviceDetails.mxPlatformName")}</p>}
     </div>
     <div className='faq-whytp-container'>
     <div className='why-tp'>
     <div className='why-tp-text-block'>
     <p className='why-tp-text'>{get(campaignPage,'knowBingeDto.knowBingeHeader')}</p>
     <img src={get(campaignPage,'knowBingeDto.knowBingeImage')}/>
     <div className='border-line'/>
     </div>
     <React.Fragment>
     {get(campaignPage,'knowBingeDto.knowBingeDtoSubDetails') && get(campaignPage,'knowBingeDto.knowBingeDtoSubDetails').map( (data,key) => (
        <React.Fragment key ={key}>
            {informationCard(data.verbiage1,data.verbiage2,data.image)}
         </React.Fragment>
        )) }
     </React.Fragment>
     </div>
     <div className='explore-plans'>
     <p>{get(campaignPage,'explorePlanDto.explorePlanHeader')}</p>
     <p onClick ={()=> handleNavigation({isExplorePlans: true,selectedPack:plan})}><span>{get(campaignPage,'explorePlanDto.explorePlanCTO')}</span><img src={RightArrow}/></p>
     </div>
     <div className='faq-container'>
     <h3 className='faq-headings'>{get(campaignPage,'faqDto.faqheader')}</h3>
     <Accordion
     wrapperClassName='campaign-faq-wrapper'
     title={get(campaignPage,'faqDto.faqtitle')}
     accordionList={get(campaignPage,'faqDto.faqQandAList') || []}
     showHelpfulTracker = {false}
     hideCardBorder
     isCampaign = {true}
     />
     </div>
     </div>
     {get(plan,"amountValue") && <div className='buy-now-btn-container' >
     <Button cName={`buy-btn`} bType="button"
     clickHandler={() => handleNavigation({ isTenure: true ,selectedPack : plan })}
     bValue={`Buy Now @ ${plan?.rupeesSymbol}${get(plan,"amountValue")?.split(".")[0]}/${get(plan,"packCycle")}`}/>
     </div>}
     </>
      }
     </div>
  )
}
