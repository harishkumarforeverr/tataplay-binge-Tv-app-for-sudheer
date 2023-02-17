import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import PropTypes from "prop-types";
import {Link, NavLink, withRouter} from "react-router-dom";
import Button from "@common/Buttons";
import DownloadLinks from "@common/Footer/DownloadLinks";
import ConnectUs from "@common/Footer/ConnectUs";
import {closePopup, openPopup} from "@common/Modal/action";
import {openLoginPopup} from '@containers/Login/APIs/actions';
import {hideMainLoader, showMainLoader} from "@src/action";

import "./style.scss";
import {isMobile, safeNavigation, handleRedirectionOnClick, trackRechargeEvent, getSearchParam, isUserloggedIn, getUserInfo} from "@utils/common";
import {ACTION_BTN_NAME, BOTTOM_CONTACT_LIST} from "../../constants";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import {quickRecharge, getBalanceInfo} from "@containers/SubscriptionPayment/APIs/action";
import {renewSusbcription} from '@containers/Subscription/APIs/subscriptionCommon';
import {URL} from "@constants/routeConstants";
import {SIDE_MENU_HEADERS, MENU_LIST_FIRST_LABEL} from "@components/Header/APIs/constants";
import {DTH_TYPE, MOBILE_BREAKPOINT, SEARCH_PARAM, SEARCH_PARAM_ACTION_VALUE} from "@constants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import appsFlyerConfig from "@utils/appsFlyer";
import APPSFLYER from "@utils/constants/appsFlyer";

class BottomMenuBar extends Component {

    componentDidMount(){
        this.handleRechargeDeeplink();
    }

    async handleRechargeDeeplink(){
        const userInfo = getUserInfo();
        const actionSearchParam = getSearchParam(SEARCH_PARAM.ACTION);
        if(isUserloggedIn() && [SEARCH_PARAM_ACTION_VALUE.RECHARGE].includes(actionSearchParam) && userInfo?.dthStatus !== DTH_TYPE.NON_DTH_USER){
            await this.props.getBalanceInfo();
            this.rechargeCheck();
        }
    }

    getMenuItem = (item) => {
        let {onClose} = this.props;
        return (
            <li
                key={item.firstLabel}
                className={item.secondLabelClassName === 'second-label-text' ? 'top-margin' : null}
            >
                <div className="top-list-item" onClick={(e) => this.itemClick(item)}>
                    <span className={`${!item.secondLabelClassName && 'list-item-span'} ${item.firstLabel === SIDE_MENU_HEADERS.TATA_SKY_BALANCE && 'w-70'}`}>
                        {item.iconName && <div className={item.firstIconClassName}><i className={item.iconName} /></div>}
                        {item.leftIconPath &&
                        <div className={item.firstIconClassName}><img alt="" src={item.leftIconPath}/></div>}
                        <div
                            className={item.firstLabelClassName}
                            
                        >
                            {item.firstLabel === SIDE_MENU_HEADERS.MY_PLAN && window.innerWidth > MOBILE_BREAKPOINT ?<span><span>{item.firstLabel}</span>
                            <img alt="" src={item.endIconPath} className={item.endIconClass}/></span>:item.firstLabel}
                            {isMobile.any() && item.endIconPath &&
                            <img alt="" src={item.endIconPath} className={item.endIconClass}/>}
                        </div>
                    </span>
                    <span className={item.secondLabelClassName === 'second-label-text' ? 'bal-margin' : null}>
                        {(item.secondLabel || (isMobile.any() && item.endIconPath)) && 
                        <NavLink
                            to={navigator.onLine && item.linkToRedirect && `/${item.linkToRedirect}`}
                            className={item.secondLabelClassName}
                            onClick={() => onClose && onClose()}
                        >
                            {item.secondLabel &&
                            <div className="balance-info" onClick={() => onClose && onClose()}>
                               <span className={!item.dthBlock && 'pack-name'}>{item.dthBlock && '₹'} {item.secondLabel}</span>
                            </div>}
                        </NavLink>}
                    </span>
                </div>
                {item.showActionButton && <div className="bottom-list-item">
                    {item.endData && <span
                        className={`due-date-text ${item.isExpired ? 'expired-date' : null}`}>{item.endData}</span>}
                    <Button
                        cName={`btn primary-btn renew-btn ${!item.endData && `renew-btn-with-margin`}`}
                        bType="button"
                        bValue={item.actionBtnName}
                        account="true"
                        clickHandler={() => this.btnClickHandler(item.actionBtnName)}
                    />
                </div>}
            </li>
        )
    }


    itemClick = async (item) => {
        const {history, openPopup, closePopup, openLoginPopup, dimensions} = this.props;
        await handleRedirectionOnClick(item, history, openPopup, closePopup, openLoginPopup, dimensions)
        this.props.onClose && this.props.onClose();
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MENU_OPTION);
        if(item.firstLabel===MENU_LIST_FIRST_LABEL.HELP_AND_SUPPORT){
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_HAMBURGER_CLICK);
    }
    }

    btnClickHandler = async (actionBtnName) => {
        if (actionBtnName === ACTION_BTN_NAME.RECHARGE) {
            //recharge btn click
            await this.rechargeCheck();
        } else if (actionBtnName.includes(ACTION_BTN_NAME.RENEW)) {
            const {isMenuOpen, onClose} = this.props;
            isMenuOpen && onClose();
            await renewSusbcription(this.props.history);
        } else if (actionBtnName === ACTION_BTN_NAME.GET_A_PLAN) {
            const {history, onClose} = this.props;
            safeNavigation(history, `/${URL.SUBSCRIPTION}`);
            onClose && onClose();
        }
    }

    rechargeCheck = async () => {
        let recommendedAmount = this.props?.balanceInfo?.data?.recommendedAmount;
        recommendedAmount = recommendedAmount === undefined ? 0 : recommendedAmount;
        const {quickRecharge, showMainLoader, hideMainLoader} = this.props;
        showMainLoader();
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_INITIATE,{[APPSFLYER.PARAMETER.SOURCE]:APPSFLYER.VALUE.HAMBURGER});
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.TS_RECHARGE_INITIATE,{[MIXPANEL.PARAMETER.SOURCE]: MIXPANEL.VALUE.HAMBURGER_MENU,[MIXPANEL.PARAMETER.AMOUNT]:recommendedAmount});
        await quickRecharge(parseInt(recommendedAmount));
        const {quickRechargeSelfCareUrl} = this.props;
        if (quickRechargeSelfCareUrl?.code === 0 && !isEmpty(quickRechargeSelfCareUrl.data)) {
            trackRechargeEvent();
            window.location.assign(`${quickRechargeSelfCareUrl.data.rechargeUrl}`);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.TS_RECHARGE_SUCCESS);
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_SUCCESS);
        } else {
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_FAILED,{ [`${APPSFLYER.PARAMETER.REASON}`]: quickRechargeSelfCareUrl.message});
            hideMainLoader();
        }
    };

    bottomLinkClick = (item) => {
        const {history, onClose} = this.props;
        safeNavigation(history, item.reDirectTo);
        onClose();
    }

    render() {
        const {menuListOptions = [], showContactDetails} = this.props;
        const bottomContactList = BOTTOM_CONTACT_LIST;
        return (
            <div className="bottom-menu-wrapper">
                <ul>
                    {menuListOptions.map((item, index) => this.getMenuItem(item, index))}
                </ul>
                {showContactDetails &&
                <>
                    <div className="download-link-wrapper">
                        <DownloadLinks/>
                    </div>
                    <div className="contact-link-wrapper">
                        <ConnectUs/>
                        <div>
                            <span className="dot"/>
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={'https://www.tataplay.com'}>
                                www.tataplay.com
                            </a>
                        </div>
                    </div>
                    <div className="contact-link-wrapper mb-link">
                        {BOTTOM_CONTACT_LIST.map((item, index) => {
                            return (
                                <Link to="/#" key={index} onClick={() => this.bottomLinkClick(item)}>
                                    {item.showDot && <span className="dot"/>}
                                    {item.displayName}
                                </Link>
                            )
                        })}

                    </div>
                </>}
            </div>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        quickRechargeSelfCareUrl: get(state.subscriptionPaymentReducer, 'quickRecharge'),
        balanceInfo: get(state.subscriptionPaymentReducer, 'balanceInfo'),
        maxRechargeAmount: get(state.headerDetails, 'configResponse.data.config.maxRechargeAmount'),
    }
}

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators({
        openPopup,
        closePopup,
        openLoginPopup,
        quickRecharge,
        showMainLoader,
        hideMainLoader,
        getBalanceInfo
    }, dispatch),
});


BottomMenuBar.propTypes = {
    showContactDetails: PropTypes.bool,
    menuListOptions: PropTypes.array,
    onClose: PropTypes.func,
    onLoginClick: PropTypes.func,
    history: PropTypes.object,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    openLoginPopup: PropTypes.func,
    quickRecharge: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    quickRechargeSelfCareUrl: PropTypes.object,
    balanceInfo: PropTypes.object,
    dimensions: PropTypes.object,
    isMenuOpen: PropTypes.bool,
}


export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(BottomMenuBar);
