import React, {Component} from "react";
import {compose, bindActionCreators} from "redux";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {get, isEmpty} from "lodash";
import PropTypes from "prop-types";
import {
    getPackSelectionListingType,
 
    isMobile,
    isUserloggedIn,
    loginInFreemium,
    safeNavigation,
    trackPackSelectionInitiate
} from "@utils/common";

import Button from "@common/Buttons";
import {
    getComponentList,
    checkLowerPack,
} from "../../APIs/subscriptionCommon";
import placeHolderImage from "@assets/images/app-icon-place.svg";
import {SUBSCRIPTION_STATUS, PACK_NAME} from "../../APIs/constant";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import "./style.scss";
import {CONTENTTYPE} from "@utils/constants";
import PlanCard from "../../PlanSelection/PlanCard";
import {MINI_SUBSCRIPTION, LOCALSTORAGE} from "@constants";
import {openLoginPopup} from "@containers/Login/APIs/actions";
import {closePopup, openPopup} from "@common/Modal/action";
import APPSFLYER from "@utils/constants/appsFlyer";
import appsFlyerConfig from "@utils/appsFlyer";
import {getKey, setKey} from "@utils/storage";
import RightArrow from "@assets/images/mini-arrow.svg";
import {setUpdatedTenure, openMiniSubscription} from "../../APIs/action";
import googleConversionConfig from "@utils/googleCoversion";
import googleConversion from "@utils/constants/googleConversion";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import { URL } from "@utils/constants/routeConstants";
class SelectPlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPack: '',
        };
    }

    componentDidMount() {
        const {packListingData, location} = this.props;
        const partnerName = location.state?.partnerName;
        this.getPackFromParam()
        
        if (!isEmpty(packListingData) && !isEmpty(location.state?.partnerName )) {
            for (const key in packListingData) {
                let pack = packListingData[key].componentList
                let [partner] = pack
                let data = partner?.partnerList && partner?.partnerList.find(data => (data?.partnerId == partnerName?.partnerId || data.provider?.toLowerCase() == partnerName.provider?.toLowerCase()) && data.included)
                if (data) {
                    this.setState({selectedPack: packListingData[key]})
                    break
                }
            }
        }

        if(location?.state?.isExplorePlans){
            this.setState({selectedPack: location?.state?.selectedPack}, () => {
                let scrollElement = document.getElementById(this.state.selectedPack?.productName?.toLowerCase());
                scrollElement && scrollElement.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
            });
        }
        
        const {location: {state}, currentSubscription} = this.props;
        const source = currentSubscription?.planOption?.changePlanOption ? MIXPANEL.VALUE.CHANGE_PLAN : state?.source
        trackPackSelectionInitiate(source);
        if (isMobile.any()) {
            let isHideDownloadHeader = JSON.parse(getKey(LOCALSTORAGE.IS_HIDE_DOWNLOAD_HEADER))
            document.querySelector('.scrollable').style.height = isHideDownloadHeader ? `${document.body.clientHeight - 240}px` : `${document.body.clientHeight - 280}px`
            document.querySelector('body').style.overflowY = 'hidden'
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            location: {state},
            packListingData,
        } = this.props;
        if (
            prevProps.packListingData !== this.props.packListingData &&
            !isEmpty(packListingData)
        ) {
            const partnerName = state?.partnerName;
            if (!isEmpty(packListingData) && !isEmpty(state?.partnerName)) {
                for (const key in packListingData) {
                    let pack = packListingData[key].componentList
                    let [partner] = pack
                    let data = partner?.partnerList && partner?.partnerList.find(data => (data?.partnerId == partnerName?.partnerId || data.provider?.toLowerCase() == partnerName.provider?.toLowerCase()) && data.included)
                    if (data) {
                        this.setState({selectedPack: packListingData[key]})
                        break
                    }
                }
            }
            if(!isEmpty(packListingData)){
                this.getPackFromParam()
            }
          
            let lowestPack = checkLowerPack(get(state, "provider"));
            let element = document.getElementById(lowestPack?.productName);
            element?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
            });
            if (!isEmpty(state?.selectedPlan)) {
                let isPreSelected = packListingData.find(data => data.productId === state?.selectedPlan.productId) //check preselected plan
                isPreSelected && this.setState({selectedPack: isPreSelected});
            }
        }
        if (isMobile.any()) {
            document.querySelector('body').style.overflow = 'hidden'
        }     
        if(prevProps.isManagedApp !== this.props.isManagedApp){
            safeNavigation(this.props.history,URL.HOME)
        } 
    }

    componentWillUnmount() {
        let {} = this.props;
        document.querySelector('body').style.overflow = 'unset';
    }

    getSource() {
        const {currentSubscription} = this.props;
        return currentSubscription?.planOption?.changePlanOption ? MIXPANEL.VALUE.CHANGE_PLAN : (this.props.location?.state?.source)?.toUpperCase()
    }
    getPreemiumVIPList = (item) => {
        const componentList = getComponentList(item);
        const providerList = componentList?.partnerList;
        const premiumList = providerList.filter(
            (i) => i?.premiumPartner && i?.included
        );
        if (isEmpty(premiumList)) {
            return providerList.filter((i) => !i.included);
        } else {
            return premiumList;
        }
    };

    isCurrentPlan = (item) => {
        let {currentSubscription} = this.props;
        return (
            item?.productId === currentSubscription?.productId &&
            get(currentSubscription, "subscriptionStatus")?.toUpperCase() !==
            SUBSCRIPTION_STATUS.DEACTIVE
        );
    };

    handleComparePlan = () => {
        let {proceedNextAction} = this.props;
        proceedNextAction(2);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PACK_COMPARE_PLANS_VIEW);
    };

    handlePlanSelection = async (item) => {
        // this.props.onPlanSelection(item);

        const {
            meta = {},
            match: {
                params: {contentType},
            },
        } = this.props;

        let title =
            meta.contentType === CONTENTTYPE.TYPE_MOVIES
                ? meta.vodTitle
                : meta.brandTitle || meta.seriesTitle || meta.vodTitle || meta.title;

        let mixpanel = {
            [`${MIXPANEL.PARAMETER.PACK_NAME}`]: item.productName || "",
        };


        let commonData = {
            [`${MIXPANEL.PARAMETER.CONTENT_TITLE}`]: title,
            [`${MIXPANEL.PARAMETER.CONTENT_PARTNER}`]: meta.provider,
        };

        mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPGRADE_POPUP_UPGRADE, commonData);
    };
    handlePackSelection = (e, data) => {
        this.setState({
            selectedPack: data,
        });
    };
    handleTenure = async () => {
        const {openLoginPopup, openPopup, closePopup} = this.props;
        const {selectedPack} = this.state;
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_PAGE_PROCEED, {
            [`${MIXPANEL.PARAMETER.SOURCE}`]: this.getSource(),
            [`${MIXPANEL.PARAMETER.PACK_AMOUNT}`]: selectedPack?.amountValue,
            [`${MIXPANEL.PARAMETER.PACK_NAME}`]: selectedPack?.productName,
        });
        googleConversionConfig.trackEvent(googleConversion.EVENT.PACK_SELECTION_INITIATE,{
            [googleConversion.PARAMETER.VALUE]:selectedPack?.amountValue,
            [googleConversion.PARAMETER.CURRENCY]:googleConversion.VALUE.CURRENCY
        })
        dataLayerConfig.trackEvent(DATALAYER.EVENT.PROCEED_SUB_JOURNEY,
            {
                [DATALAYER.PARAMETER.PACK_NAME]:selectedPack?.productName,
                [DATALAYER.PARAMETER.PACK_PRICE]:selectedPack?.amountValue,
               
            
            })
        // if(isEmpty(userInfo)){
        await loginInFreemium({
            openPopup,
            closePopup,
            openLoginPopup,
            ComponentName: MINI_SUBSCRIPTION.CHANGE_TENURE,
            selectedPlan: this.state.selectedPack,
        });
        // }else{
        //     this.handlePlanSelection(this.state.selectedPack)
        // }
    };

    navigateToLogin = async () => {
        await loginInFreemium({
            openPopup,
            closePopup,
            openLoginPopup,
            ComponentName: MINI_SUBSCRIPTION.LOGIN,
            source: this.props.source || MIXPANEL.VALUE.SUBSCRIBE,
        });
        this.props.setUpdatedTenure()
    };
    
    getPackFromParam = () =>{
        const isPackName = new URLSearchParams(location.search)
        let getPackName = isPackName.get(PACK_NAME)
        let {packListingData,currentSubscription} = this.props
        if(!isEmpty(packListingData) && getPackName && (getPackName?.toLowerCase() !== currentSubscription?.productName?.toLowerCase())){
            for (const key in packListingData) {
              if(packListingData[key].productName?.toLowerCase() === getPackName?.toLowerCase()){
                this.setState({selectedPack: packListingData[key]},()=>{
                let scrollElement = document.getElementById(getPackName?.toLowerCase());
                scrollElement?.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                })
              }
           }
       }
    }

    
    render() {
        let {
            packListingData = [],
            proceedNextAction,
            onPlanSelection,
            currentSubscription,
        } = this.props;
        const packListingTitle = get(
            currentSubscription?.planOption,
            "changePlanOption"
        )
            ? get(currentSubscription?.planOption, "changePlanMessage")
            : "Choose A Plan & Start Watching";
        const isSuntextPresent = packListingData.find(
            (pack) => pack.sunnextFooterMessage
        );

        return (
            <div className={"pack-listing-container"}>
                {isMobile.any() && !isUserloggedIn() && <div className="login-msg">
                    <span onClick={this.navigateToLogin}> Existing User Login</span>
                    <img src={RightArrow}/>
                </div>}
                <div className="pack-listing-title">{packListingTitle}</div>
                <div>
                    <ul
                        className={`pack-block ${
                            get(currentSubscription?.planOption, "changePlanOption") &&
                            "current-plan-exist"
                        }`}
                    >
                        <div className="pack-block-wrapper">
                            <div className="scrollable">
                                {(packListingData?.length > 1) && (<div className="bottom-shadow"></div>)}
                                {!!packListingData?.length &&
                                    packListingData.map((item, index) => (
                                        <li id={item.productName?.toLowerCase()} key={index}
                                            //className={`${this.isCurrentPlan(item) ? "mb-top" : ""}`}
                                            >
                                            {/* {this.isCurrentPlan(item) && (
                                                <div className={"current-pack-tag"}>Current plan</div>
                                            )} */}
                                            <PlanCard
                                                data={item}
                                                handlePackSelection={this.handlePackSelection}
                                                selectedPack={this.state.selectedPack}
                                                isCurrentPlan={this.isCurrentPlan}
                                            />
                                        </li>
                                    ))}
                            </div>
                            {(packListingData?.length >= 1) && (
                                <Button
                                    bValue={"Proceed"}
                                    cName="btn primary-btn btn-wrapper"
                                    clickHandler={this.handleTenure}
                                    disabled={isEmpty(this.state.selectedPack)}
                                />
                            )}
                        </div>
                    </ul>
                </div>


            </div>
        );
    }
}

// {!(packListingData?.length <= 1) && (
//   <div className="compare-plan" onClick={this.handleComparePlan}>
//     {"Compare Plans"}
// </div>
// )}

const mapStateToProps = (state) => {
    return {
        // packListingData: get(state.subscriptionDetails, 'notloggedInUserPackData.data'),

        packListingData: get(state.subscriptionDetails, "packListingData"),
        currentSubscription: get(state.subscriptionDetails,"currentSubscription.data"),
        detail: get(state.PIDetails.data, "meta"),
        isManagedApp: get(state.headerDetails, "isManagedApp"),
    };
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                openPopup,
                closePopup,
                openLoginPopup,
                setUpdatedTenure
            },
            dispatch
        ),
    };
}

SelectPlan.propTypes = {
    currentSubscription: PropTypes.object,
    packListingData: PropTypes.array,
    proceedNextAction: PropTypes.func,
    onPlanSelection: PropTypes.func,
    detail: PropTypes.object,
    location: PropTypes.object,
    setUpdatedTenure: PropTypes.func,
};
export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps)
)(SelectPlan);
