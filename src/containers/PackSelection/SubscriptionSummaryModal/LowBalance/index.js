import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router';
import {bindActionCreators, compose} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import Button from "@common/Buttons";
import InputBox from "@common/InputBox";
import {LOW_BALANCE} from "@containers/PackSelection/constant";
import {quickRecharge} from "@containers/PackSelection/APIs/action";
import PackUpgrade from "@containers/PackSelection/SubscriptionSummaryModal/PackUpgrade";
import {hideMainLoader, showMainLoader} from "@src/action";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import {showNoInternetPopup} from "@utils/common";
import {URL} from "@routeConstants";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import appsFlyerConfig from '@utils/appsFlyer';
import APPSFLYER from '@utils/constants/appsFlyer';

class LowBalance extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            rechargeAmt: '',
            errorMessage: '',
        }
    }

    componentDidMount = () => {
        this.loadHandler();
        this.trackRechargeEvents();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.recommendedValue !== this.props.recommendedValue) {
            setTimeout(() => this.setState({
                rechargeAmt: this.props.recommendedValue,
            }), 0);
        }
    }

    loadHandler = () => {
        let {recommendedValue} = this.props;
        this.setState({
            rechargeAmt: recommendedValue,
        })
    };

    trackRechargeEvents = () => {
        moengageConfig.trackEvent(MOENGAGE.EVENT.RECHARGE_INITIATE, {
            [`${MOENGAGE.PARAMETER.SOURCE}`]: this.props.rechargeSource || '',
            [`${MOENGAGE.PARAMETER.AMOUNT}`]: this.props.recommendedValue || 0,
        });
        appsFlyerConfig.trackEvent(APPSFLYER.EVENT.RECHARGE_INITIATE, {
            [`${MIXPANEL.PARAMETER.SOURCE}`]: this.props.rechargeSource || ''
        });
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.TS_RECHARGE_INITIATE,{[MIXPANEL.PARAMETER.SOURCE]: this.props.rechargeSource || '',[MIXPANEL.PARAMETER.AMOUNT]: this.props.recommendedValue || 0});
    }

    inputChange = (name, value) => {
        const {maxRechargeAmount} = this.props;
        let minimumRecharge = this.props?.balanceInfo?.data?.minimumRecharge;
        let amount = parseInt(minimumRecharge);
        let check_min = (parseInt(value) < amount);
        let check_max = (parseInt(value) > parseInt(maxRechargeAmount));
        this.setState({
            [name]: value,
            errorMessage: ((check_min || !value) && (LOW_BALANCE.MIN_ERROR_MESSAGE + Math.ceil(amount))) || (check_max && (LOW_BALANCE.MAX_ERROR_MESSAGE + maxRechargeAmount)),
        })
    };

    rechargeCheck = async (rechargeAmount) => {
        const {quickRecharge, showMainLoader, hideMainLoader} = this.props;
        showMainLoader();
        await quickRecharge(rechargeAmount);
        const {quickRechargeSelfCareUrl} = this.props;
        if (quickRechargeSelfCareUrl.code === 0 && !isEmpty(quickRechargeSelfCareUrl.data)) {
            window.location.assign(`${quickRechargeSelfCareUrl.data.rechargeUrl}`);
        } else {
            hideMainLoader();
        }
    };

    render() {
        const {
            recommendedValue, rechargePopup, balanceInfo, packDetail, openPopup, history, paidPackUpgrade,
        } = this.props;
        let bingeSubscriptionAmountList = this.props?.balanceInfo?.data?.bingeSubscriptionAmountList;
        const {errorMessage, rechargeAmt} = this.state;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        return (<div className='low-balance'>
            {!paidPackUpgrade &&
                <div className='recommend-recharge-info'/>
            }
            {
                paidPackUpgrade && <PackUpgrade balanceInfo={balanceInfo} packDetail={packDetail} openPopup={openPopup} lowBalance={true}/>
            }
            <p className={`recommend-recharge ${paidPackUpgrade ? 'paid-pack-low-balance' : ''}`}>Recommended Recharge Amount<span className={'req-field'}>*</span></p>
            <div className="input-div">
                <InputBox inputType={'tel'} name='rechargeAmt'
                          onChange={this.inputChange}
                          errorMessage={errorMessage}
                          maxLength="5"
                          isNumeric={true}
                          placeholder={'0'}
                          initialValIcon={'icon-inr'}
                          value={rechargeAmt}/>
                <div className={'icon-block'}>
                    <i className='icon-info'
                       onClick={() => rechargePopup(bingeSubscriptionAmountList, recommendedValue)}>
                        <span className="path1"/>
                        <span className="path2"/></i>
                </div>
            </div>
            <Button bValue='Recharge' cName='btn primary-btn' disabled={errorMessage}
                    clickHandler={() => {
                        this.rechargeCheck(rechargeAmt)
                    }}/>
            {!userInfo?.dummyUser && <a className="for-mobile blue-text"
                onClick={() => !navigator.onLine ? showNoInternetPopup : history.push(`/${URL.MY_SUBSCRIPTION}`)}>Cancel</a>}
        </div>)
    }
}

LowBalance.propTypes = {
    packDetail: PropTypes.object,
    recommendedValue: PropTypes.string,
    balanceInfo: PropTypes.object,
    quickRecharge: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    quickRechargeSelfCareUrl: PropTypes.func,
    rechargePopup: PropTypes.func,
    history: PropTypes.object,
    maxRechargeAmount: PropTypes.number,
    rechargeSource: PropTypes.string,
    openPopup: PropTypes.func,
    paidPackUpgrade: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        quickRechargeSelfCareUrl: get(state.packSelectionDetail, 'quickRecharge'),
        balanceInfo: get(state.packSelectionDetail, 'balanceInfo'),
        maxRechargeAmount: get(state.headerDetails, 'configResponse.data.config.maxRechargeAmount'),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            quickRecharge,
            showMainLoader,
            hideMainLoader,
        }, dispatch),
    }
}

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(LowBalance);
