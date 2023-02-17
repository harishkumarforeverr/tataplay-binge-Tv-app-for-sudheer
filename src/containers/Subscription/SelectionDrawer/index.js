import React, { Component } from 'react';
import PropTypes from "prop-types";
import { bindActionCreators, compose } from 'redux';
import { withRouter, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { get, isEmpty, set } from 'lodash';
import Button from '@common/Buttons';
import { closePopup,openPopup } from "@common/Modal/action";
import { LOCALSTORAGE, MINI_SUBSCRIPTION } from "@constants";
import { openMiniSubscription, getWebPortalLink } from "@containers/Subscription/APIs/action";
import CrownImage from "@assets/images/crown-top-10.png";
import LOGO from "@assets/images/bingeLogo.svg";
import { isMobile, isUserloggedIn, loginInFreemium, safeNavigation ,handlePiRedirection } from '@utils/common';
import { URL } from "@constants/routeConstants";
import RightArrow from '@assets/images/drawer-right-arrow.svg'
import { cloudinaryCarousalUrl } from "@utils/common";
import placeHolderImage from "@assets/images/app-icon-place.svg";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import { deleteKey, getKey, setKey } from '@utils/storage';
import { JOURNEY_SOURCE } from '../APIs/constant';
import { journeySourceHeader, tickTickAnalytics} from '@containers/Subscription/APIs/subscriptionCommon';
import './style.scss'

class SelectionDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
          
        }
        this.source = ''
    }

    componentDidMount(){
        const {miniSubscription} = this.props
        this.source = this.props.source?.toUpperCase() || (miniSubscription.source)?.toUpperCase()
        !isMobile.any() && tickTickAnalytics(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_INITIATE,this.source)  
    }
  
    partnerDetails = (images) => {
      return (
        <React.Fragment>
          {images &&
            images.map(
              (image, key) =>
                  <React.Fragment key={key}>
                    <div className='img-container'
                    >
                    <img
                      src={`${cloudinaryCarousalUrl("", "", 120, 120)}${image.iconUrl}`}
                      alt=""
                      onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = placeHolderImage;
                          e.target.className = "broken-image";
                      }}
                  />
                    </div>
                  </React.Fragment>
            )}
        </React.Fragment>
      );
    };

    showButtons = (leftImg,text,rightImg,handleChange,isSecond) =>{
      const { enableTickTickJourney  } = this.props;
        return (<>
            {enableTickTickJourney && (
            <div className={`btn-container ${isSecond ? 'mt-top' : ''}`} onClick={()=>handleChange(isSecond)}>
              <div className='btn-left-container'>
               <div className='img-container'>
               <img src={`${cloudinaryCarousalUrl("", "", 100, 100)}${leftImg}`} alt="logo"/>
               </div>
               <p>{text}</p>
              </div>
              <div className='btn-right-container'>
               <img src={RightArrow} alt="logo"/>
              </div>
              </div>)}
          </>
        )
    }

    handleClose = () =>{
        let {closePopup,openMiniSubscription,miniSubscription} = this.props
        isMobile.any() ? openMiniSubscription() : closePopup()  
        tickTickAnalytics(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_DO_IT_LATER,this.source)
    }

    handleSubscription = async (checkPlans,isExplore) => {
      let {getWebPortalLink, miniSubscription, history, partnerData} = this.props
      const requestHeader = checkPlans 
      ? { journeySource : JOURNEY_SOURCE.DRAWER_CYOP, journeySourceRefId: "" , analyticSource: this.props.source || miniSubscription.source } 
      : { journeySource : JOURNEY_SOURCE.DRAWER_MYOP, journeySourceRefId: "", analyticSource: this.props.source || miniSubscription.source };
      requestHeader['initiateSubscription'] = JOURNEY_SOURCE.CURATED_PACK_SELECTION;
      handlePiRedirection(history);
      journeySourceHeader(partnerData, checkPlans)
      await getWebPortalLink(requestHeader)
      if(isExplore){
        tickTickAnalytics(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_EXPLORE,this.source)
        return
      }
      tickTickAnalytics(checkPlans?MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_CURATED_SELECT:MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_MYOP_SELECT,this.source)
    }

    navigateToLogin = async () => {
      tickTickAnalytics(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_EXISTING_USER_LOGIN,this.source)
      tickTickAnalytics(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_CLOSE,this.source)
        let {openPopup,closePopup} = this.props
        await loginInFreemium({
          openPopup,
          closePopup,
          ComponentName: MINI_SUBSCRIPTION.LOGIN,
        //   source:this.props.source,
        });

      };
     
    getVerbiage = (fixedPlanDrawerScreen,enableTickTickJourney) =>{
       return( 
        <div className={`sub-head-container ${!enableTickTickJourney ? 'fixed-sub-header' : '' }`}>
          <p>{get(fixedPlanDrawerScreen,'planStartMessage')} <span dangerouslySetInnerHTML={{ __html: get(fixedPlanDrawerScreen,'colorTitleValue')}}/></p>
        </div>)
      }

    render() {
        const { enableTickTickJourney } = this.props
        let fixedPlanDrawerScreen = enableTickTickJourney ? this.props.drawerScreen : this.props.fixedPlanDrawerScreen 
        let partnersImage = get(fixedPlanDrawerScreen,'partnersImage')
        return (
          <div className ={`selection-container ${!enableTickTickJourney && isMobile.any() ? 'fixed-container' :''}`} >
          {!isUserloggedIn() && <div className='login-text'> <span onClick={this.navigateToLogin}>{'Existing User Login'}</span><img src={RightArrow}/></div>}
          <div className='selection-wrapper'>
          <div className='logo-container'>
            <img src={LOGO}/>
          </div>
          <div className='heading-container'>
           <div className={`crown-container ${!enableTickTickJourney && isMobile.any() ? 'fixed-crown' :''}`}>
              <img src={CrownImage}/>
            </div>
            <p className = {`${!enableTickTickJourney && isMobile.any() ? 'rm-pl' :''}`}>{get(fixedPlanDrawerScreen,'ottAppsTitle')}</p>
          </div>
          {(enableTickTickJourney || (!enableTickTickJourney && !isMobile.any())) && this.getVerbiage(fixedPlanDrawerScreen,enableTickTickJourney)}
          <div className={`partner-container ${!enableTickTickJourney ? 'fixed-plan' :'' }`}>
          <div>{this.partnerDetails(partnersImage)}</div>
          <p>{get(fixedPlanDrawerScreen,'moreApp')}</p>
          </div>
          {!enableTickTickJourney && isMobile.any() && this.getVerbiage(fixedPlanDrawerScreen,enableTickTickJourney)}
           {this.showButtons(get(fixedPlanDrawerScreen,'plusImage'),get(fixedPlanDrawerScreen,'ownPack'),CrownImage,this.handleSubscription)}
           {this.showButtons(get(fixedPlanDrawerScreen,'valuePackImage'),get(fixedPlanDrawerScreen,'valuePack'),CrownImage,this.handleSubscription,true)}
           {!enableTickTickJourney && <div className="explore-btn">
           <Button
           cName="btn primary-btn"
           bType="button"
           bValue={get(fixedPlanDrawerScreen,'drawerFixedPlanCTA')}
           clickHandler={() => {this.handleSubscription(true,true)}}
           />
           </div>}
           <div className="do-later">
           <Button
             bValue={"Do It Later"}
             cName="btn primary-btn btn-wrapper"
             clickHandler={this.handleClose}
           />
         </div>
          </div>
          </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        drawerScreen: get(state.headerDetails, "configResponse.data.config.tickTickDrawerScreen"),
        fixedPlanDrawerScreen: get(state.headerDetails, "configResponse.data.config.tickTickFixedPlanDrawerScreen"),
        enableTickTickJourney: get(state.headerDetails, "configResponse.data.config.enableTickTickJourney"),
        miniSubscription: get(state.subscriptionDetails, "miniSubscription"),
    }
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            openPopup,
            closePopup,
            openMiniSubscription,
            getWebPortalLink
        }, dispatch),
    }
}

SelectionDrawer.propTypes = {
    closePopup: PropTypes.func,
    openPopup: PropTypes.func,
    openMiniSubscription: PropTypes.func,
    getWebPortalLink: PropTypes.func,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(SelectionDrawer);


 //   <div className="do-later">
    //   <Button
    //     bValue={"Do It Later"}
    //     cName="btn primary-btn btn-wrapper"
    //     clickHandler={this.handleClose}
    //   />
    // </div>
    //   <div className="do-later-fixed-plan">
    //   <Button
    //     bValue={"Do It Later"}
    //     cName="btn primary-btn btn-wrapper"
    //     clickHandler={this.handleClose}
    //   />
    // </div>