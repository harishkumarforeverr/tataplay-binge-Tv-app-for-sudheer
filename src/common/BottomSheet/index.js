import React, {Component} from "react";
import {bindActionCreators, compose} from "redux";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";

import SwipeableBottomSheet from '@common/BottomSheetDrawer';

import {LOCALSTORAGE, DIRECTIONS, MOBILE_BREAKPOINT, MINI_SUBSCRIPTION, CATEGORY_NAME} from "@constants";
import {setKey} from "@utils/storage";
import {detectSwipe, handleOverflowOnHtml, isSubscriptionDiscount, getVerbiages, unmountSwipeEvents} from "@utils/common";
import {BOTTOM_SHEET} from "@utils/constants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import {closeMobilePopup} from "@containers/Languages/APIs/actions";
import {closeLoginPopup, updateLoginStep} from "@containers/Login/APIs/actions";
import CategoryDropdown from "@components/Header/CategoryDropdown"
import {categoryDropDown} from "@components/Header/APIs/actions";

import SelectLanguage from "@containers/Languages/SelectLanguage";
import Login from '@containers/Login';

import "./style.scss";
import Movie from "../../containers/Movie";
import PlanSelection from "@containers/Subscription/PlanSelection";
import ChangeTenureModal from "@containers/Subscription/ChangeTenureModal";
import { openMiniSubscription } from "@containers/Subscription/APIs/action";
import { isEmpty } from "lodash";
import { notNow } from "@containers/Login/LoginCommon";
import SelectionDrawer from "@containers/Subscription/SelectionDrawer";

class BottomSheet extends Component {
    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();

        this.state = {
            overFlowHeight: 280,
            barStatus: false,
            touchStatus: false,
            swipeableContainer: 'react-swipeable-view-container',
            selectedPlan: ''
        };
    }

    componentDidMount = async() => {
        let ComponentName = get(this.props.miniSubscription,'ComponentName');
        this.addEventListeners();
        if (this.props.type === BOTTOM_SHEET.LOGIN || ComponentName == MINI_SUBSCRIPTION.LOGIN  ) {
            setTimeout(() => this.setState({
                overFlowHeight: 392,
            }), 0);
        }
        if ( ComponentName === MINI_SUBSCRIPTION.PLAN_SELECT || ComponentName === MINI_SUBSCRIPTION.CHANGE_TENURE || this.props.type === BOTTOM_SHEET.LANGUAGE || ComponentName === MINI_SUBSCRIPTION.SELECTION_DRAWER ) {
           await this.setState({
                ...this.state, barStatus: true, overFlowHeight:0
            });
            if(ComponentName === MINI_SUBSCRIPTION.PLAN_SELECT){
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_INITIATE,{
                    [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.APP_LAUNCH,
                  });
            }else if(ComponentName === MINI_SUBSCRIPTION.SELECTION_DRAWER){
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_INITIATE,{
                    [`${MIXPANEL.PARAMETER.SOURCE}`]: (this.props.miniSubscription.source)?.toUpperCase(),
                  })
            }
            // setTimeout(() => this.setState({
            //     ...this.state, overFlowHeight: 500,
            // }), 0);
            // this.wrapperRef.current.style.height = 'auto';
        }
        if (this.props.type === BOTTOM_SHEET.CATEGORIES && window.innerWidth <= MOBILE_BREAKPOINT) {
            let height, categoriesLength = this.props.categoriesList.items.length;
            if (categoriesLength <= 2) {
                height = 253;
            } else {
                let n;
                if (categoriesLength > 2 && categoriesLength <= 4) {
                    n = 1
                } else if (categoriesLength > 4 && categoriesLength <= 6) {
                    n = 2
                } else {
                    n = 3;
                }
                height = 253 + (100 * n);
            }
            setTimeout(() => this.setState({
                ...this.state, overFlowHeight: height,
            }), 0);
            this.wrapperRef.current.style.height = 'auto';
        }
        if (this.props.type === BOTTOM_SHEET.LANGUAGE && document.body.clientHeight < 690) {
            this.setState({
                ...this.state, barStatus: false, overFlowHeight: document.body.clientHeight - 100
            });
        }
        
        handleOverflowOnHtml();
        document.body.style.pointerEvents = "none";
    }

    componentDidUpdate(prevProps, prevState) {
        let { loginStepNumber, type, subscriptionsList } = this.props;
        let ComponentName = get(this.props.miniSubscription,'ComponentName');
        if (prevProps.miniSubscription !== this.props.miniSubscription &&  ComponentName === MINI_SUBSCRIPTION.CHANGE_TENURE) {
            setTimeout(() => this.setState({
                overFlowHeight: 280,barStatus:true
            }), 0);
            this.wrapperRef.current.style.height = 'auto';
            handleOverflowOnHtml(true)
        }
        if (prevProps.loginStepNumber !== loginStepNumber && type === BOTTOM_SHEET.LOGIN || ComponentName == MINI_SUBSCRIPTION.LOGIN   ) {
            let height;
            if (loginStepNumber === 1) {
                height = 0
            }
            else if (loginStepNumber === 2) {
                height = 300
            }
            else if (loginStepNumber === 3) {
                let subscriptionsListLength = subscriptionsList?.length;
                if (subscriptionsListLength > 4) {
                    height = 392;
                } else {
                    height = 270 + (56 * subscriptionsListLength);
                }
            } else {
                height = 392;
            }
            setTimeout(() => this.setState({
                overFlowHeight: height,barStatus: true
            }), 0);
            this.wrapperRef.current.style.height = 'auto';
            handleOverflowOnHtml();
        }
    }

    componentWillUnmount() {
        let ComponentName = get(this.props.miniSubscription,'ComponentName');
        handleOverflowOnHtml(true);
        document.body.style.pointerEvents = "auto";
        window.removeEventListener("touchmove", (d) => {
        });
        window.removeEventListener("touchend", (d) => {
        });
        unmountSwipeEvents(this.state.swipeableContainer);
        if(ComponentName === MINI_SUBSCRIPTION.PLAN_SELECT){
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_CLOSE,this.getMixpanalData())
        }
        
    }
    getMixpanalData=()=>{
          return {
            [`${MIXPANEL.PARAMETER.PACK_NAME}`]: this.state.selectedPlan || "" ,
            [`${MIXPANEL.PARAMETER.SOURCE}`]: MIXPANEL.VALUE.APP_LAUNCH,
            [`${MIXPANEL.PARAMETER.SUBSCRIPTION_DRAWER_CLOSE}`] :MIXPANEL.VALUE.YES,
           }
       }

    addEventListeners = () => {
        window.addEventListener("touchstart", (e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            this.swipe = {y: touch.clientY};
            this.setState({
                ...this.state, touchStatus: false, touchClientY: touch.clientY,
            });
        });

        window.addEventListener("touchmove", (e) => {
            e.stopPropagation();
            if (e.changedTouches && e.changedTouches.length) {
                const touch = e.changedTouches[0];
                if (touch.clientY < this.state.touchClientY && this.wrapperRef?.current?.contains(e.target)) {
                    this.setState({...this.state, touchStatus: true});
                }
            }
        });

        window.addEventListener("touchend", (e) => {
            e.stopPropagation();
            this.setState({...this.state, touchStatus: false});
        });

        detectSwipe(this.state.swipeableContainer, (el, dir) => {
            if (dir === DIRECTIONS.UP) {
                document.getElementsByClassName('ReactSwipeableBottomSheet--closed').length > 0 && this.bottomSheetClose();
            }
        });
    };

    handleBar = (e) => {
        if (e) {
            this.setState({
                ...this.state, barStatus: true,
            });
        }
        else if(isSubscriptionDiscount(this.props.history) && this.props.miniSubscription.ComponentName === MINI_SUBSCRIPTION.LOGIN){
            return
        }
        else if(this.props.miniSubscription?.fromLogin){
            let props ={...this.props,closeLoginModel:this.bottomSheetClose, showNotNowPopup:this.props.miniSubscription.fromLogin}
            notNow(props)
        }
        else if ((this.state.barStatus === true && !isEmpty(this.props.miniSubscription)) || (this.state.barStatus === true && this.props.type === BOTTOM_SHEET.LANGUAGE )){
            this.bottomSheetClose();
        }
         else {
            if (this.state.barStatus === false) {
                this.bottomSheetClose();
            } else {
                this.setState({
                    ...this.state, barStatus: false, touchStatus: false,
                });
            }
        }
    };

    bottomSheetClose = () => {
        if(this.props?.miniSubscription?.ComponentName == MINI_SUBSCRIPTION.LOGIN && isSubscriptionDiscount(this.props.history)){
            return
        }else{
        this.setState({
            ...this.state, barStatus: false, overFlowHeight: 0,
        });
        this.onCloseAction();
    }
    };

    onCloseAction = () => {
        this.onPopupClose();
        this.props.type === BOTTOM_SHEET.LANGUAGE && setKey(LOCALSTORAGE.NO_LANGUAGE_SELECTED, true);
        this.props.categoryDropDown(false);
        document.body.style.pointerEvents = "auto";
        handleOverflowOnHtml(true);
        this.props?.miniSubscription?.ComponentName === MINI_SUBSCRIPTION.SELECTION_DRAWER &&(
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SUBSCRIPTION_DRAWER_CLOSE,{
                [`${MIXPANEL.PARAMETER.SOURCE}`]: (this.props.miniSubscription.source)?.toUpperCase(),
              })
        )
        this.props.openMiniSubscription();
    }

    bottomSheetExpand = () => {
        this.setState({
            ...this.state, barStatus: true,
        });
    };

    bottomSheetCollapse = () => {
        this.setState({
            ...this.state, barStatus: false,
        });
    };

    bottomSheetStyle = () => {
        return {
            textAlign: "center", zIndex: 1000, pointerEvents: "auto", overFlow: "none",
        };
    };

    bottomSheetBodyStyle = () => {
        let ComponentName = get(this.props.miniSubscription,'ComponentName');
        // let planSelectionHeight = `${document.body.clientHeight-100}px`
        return {
            background:`${ComponentName == MINI_SUBSCRIPTION.PLAN_SELECT ? "linear-gradient(330.71deg, #020005 66.43%, #220046 100%)" : "linear-gradient(294.99deg, #020005 0%, #220046 100%)"}`,
            borderTopLeftRadius: "30px",
            borderTopRightRadius: "30px",
            position: "relative",
            pointerEvents: "auto",
            paddingBottom: ComponentName === MINI_SUBSCRIPTION.LOGIN && isSubscriptionDiscount(this.props.history) && '40px',
        };
    };

    swipeableBottomSheetProps = () => {
        const {overFlowHeight, barStatus} = this.state;
        return {
            overflowHeight: overFlowHeight,
            onChange: (e) => {
               !this.props.isLandscape && this.handleBar(e);
            },
            style: this.bottomSheetStyle(),
            bodyStyle: this.bottomSheetBodyStyle(),
            open: barStatus,
            marginTop: 100,
            shadowTip: false,
            topShadow: true,
            overlay: true,
            overlayStyle: this.state.overFlowHeight > 0 ? {opacity: 0.7, pointerEvents: "auto"} : null,
            checkDisable: this.props.miniSubscription?.ComponentName === MINI_SUBSCRIPTION.PLAN_SELECT && this.props.miniSubscription.isScroll ? true : false
        };
    };

    handlePlanSelected = (selectedPlan) => {
        this.setState({
            selectedPlan
        })
    }

    getSubscriptionComponent = () => {
        let { isfromMiniModal, selectedPlan, ComponentName, partnerData, source, isFromCampaign} = this.props.miniSubscription
        const {barStatus, touchStatus} = this.state;
        if(ComponentName == MINI_SUBSCRIPTION.PLAN_SELECT){
            return <PlanSelection onPlanSelected={this.handlePlanSelected} partnerData = {partnerData} source = {source} selectedPlan={selectedPlan} isFromCampaign={isFromCampaign}/>
        }else if(ComponentName == MINI_SUBSCRIPTION.CHANGE_TENURE){
            return <ChangeTenureModal isfromMiniModal = {isfromMiniModal} selectedPlan = {selectedPlan} isFromCampaign={isFromCampaign}/>
        }else if(ComponentName == MINI_SUBSCRIPTION.LOGIN){
            return (<Login
                barStatus = {barStatus}
                touchStatus = {touchStatus}
                bottomSheetClose = {this.bottomSheetClose}
                source = {this.props.miniSubscription?.source}
                showNotNowPopup = {this.props.miniSubscription?.fromLogin}
                selectedPlan = {this.props.miniSubscription?.selectedPlan}
                cartId = {this.props.miniSubscription?.cartId}
            />)
        }else if(ComponentName == MINI_SUBSCRIPTION.SELECTION_DRAWER){
            return(
                <SelectionDrawer source={this.props.miniSubscription?.source} partnerData= {this.props.miniSubscription?.partnerData}/>
            )
        }
    }
    getBottomSheetContent = () => {
        const {barStatus, touchStatus} = this.state;
        const { episode } = this.props;
        let data = getVerbiages(CATEGORY_NAME.LANGUAGE_DRAWER);
        if (this.props.type === BOTTOM_SHEET.LANGUAGE) {
            return (<>
                <div className="bottomSheetHeading">{data?.header || 'Select Content Languages'}</div>
                <SelectLanguage
                    bottomSheetExpand={this.bottomSheetExpand}
                    barStatus={barStatus}
                    touchStatus={touchStatus}
                    bottomSheetClose={this.bottomSheetClose}
                />
            </>)
        } else if (this.props.type === BOTTOM_SHEET.LOGIN) {
            return (<Login
                barStatus={barStatus}
                touchStatus={touchStatus}
                bottomSheetClose={this.bottomSheetClose}
                source={this.props.miniSubscription?.source}
            />)
        } else if (this.props.type === BOTTOM_SHEET.CATEGORIES) {
            return <CategoryDropdown bottomSheetClose={this.bottomSheetClose}/>
        } else if (this.props.type === BOTTOM_SHEET.PI_DETAIL || this.props.type === BOTTOM_SHEET.PI_DETAIL_DESCRIPTION) {
            return <Movie episode={episode} isShowMore={this.props.type === BOTTOM_SHEET.PI_DETAIL} onClose={this.onPopupClose}  meta={this.props.meta}/>
        } else if (this.props.type === BOTTOM_SHEET.MINI_SUBSCRIPTION) {
            return this.getSubscriptionComponent()
        }
    }

    onPopupClose = () => {
        const {showMobilePopup, showLoginPopup, closeMobilePopup, closeLoginPopup, updateLoginStep, onClose} = this.props;
        if(onClose){
            onClose();
            return;
        }
        if (showMobilePopup) {
            closeMobilePopup();
        } else if (showLoginPopup) {
            closeLoginPopup();
            updateLoginStep(1);
        }
    }

    render() {
        // const {miniSubscription:{ComponentName}} = this.props
        let ComponentName = get(this.props.miniSubscription,'ComponentName');
        return (<SwipeableBottomSheet {...this.swipeableBottomSheetProps()}>
            <div className={this.props.big ? "bottom-sheet-block" : "bottom-sheet-block-short"} ref={this.wrapperRef}>
            {(ComponentName === MINI_SUBSCRIPTION.PLAN_SELECT || ComponentName === MINI_SUBSCRIPTION.SELECTION_DRAWER) && <div className="background-img">
                  <img src={this.props.backgroundImage} alt="" /></div>}
                  {(ComponentName === MINI_SUBSCRIPTION.PLAN_SELECT || ComponentName === MINI_SUBSCRIPTION.SELECTION_DRAWER) && <div className={`bottom-shadow ${ComponentName === MINI_SUBSCRIPTION.SELECTION_DRAWER && 'drawer-shadow'}`}></div>}
                {this.props.type === BOTTOM_SHEET.PI_DETAIL && <div className='bg-wrapper'/>}
                <div className={`bar ${this.props.type === BOTTOM_SHEET.LOGIN && 'login-bar'}`}/>
                {this.getBottomSheetContent()}
            </div>
        </SwipeableBottomSheet>);
    }
}

const mapStateToProps = (state) => {
    return {
        showMobilePopup: get(state.languageReducer, 'showMobilePopup'),
        showLoginPopup: get(state.loginReducer, 'showLoginPopup'),
        loginStepNumber: get(state.loginReducer, 'loginStepNumber'),
        categoriesList: get(state.headerDetails, "categoriesList"),
        subscriptionsList: get(state.loginReducer, "subscriptionDetails.data"),
        miniSubscription: get(state.subscriptionDetails, "miniSubscription"),
        meta: get(state.PIDetails.data, 'meta'),
        isLandscape: get(state.commonContent, "isLandscape"),
        backgroundImage: get(state.headerDetails, "configResponse.data.config.FreemiumBackgroundPoster.web.otherPackPoster"),
    };
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            closeMobilePopup, closeLoginPopup, updateLoginStep, categoryDropDown,openMiniSubscription
        }, dispatch),
    };
}

BottomSheet.propTypes = {
    onClose: PropTypes.func,
    closeMobilePopup: PropTypes.func,
    closeLoginPopup: PropTypes.func,
    updateLoginStep: PropTypes.func,
    showMobilePopup: PropTypes.bool,
    showLoginPopup: PropTypes.bool,
    type: PropTypes.string,
    loginStepNumber: PropTypes.number,
    categoryDropDown: PropTypes.func,
    big: PropTypes.bool,
    categoriesList: PropTypes.object,
    episode: PropTypes.object,
    miniSubscription: PropTypes.object,
    openMiniSubscription: PropTypes.func,
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(BottomSheet);
