import React, {Component, Fragment} from 'react';
import {bindActionCreators} from "redux";
import get from "lodash/get";
import PropTypes from 'prop-types';

import {getBalanceInfo} from "@containers/PackSelection/APIs/action";
import {connect} from "react-redux";
import Odometer from "odometer";
import 'odometer/themes/odometer-theme-default.css';

import './style.scss';

class BalanceAnimator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshBalance: false,
            animate: false,
            balanceData: props.balanceInfo,
        };
    }

    componentDidMount = () => {
        this.props.isFromMobile && this.getBalance();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.balanceInfo !== this.props.balanceInfo) {
            setTimeout(() => this.setState({
                balanceData: this.props.balanceInfo,
            }), 0);
        }
        if(prevProps.isAccOpen !== this.props.isAccOpen){
            this.props.isAccOpen && this.getBalance();
        }
    }

    getBalance = async () => {
        this.setState({refreshBalance: true, animate: true});
        const {currentSubscription, getBalanceInfo} = this.props;
        let packId = get(currentSubscription, 'packId');
        await getBalanceInfo(packId, true);
        this.setState({refreshBalance: false});
        this.animateBalance();
    };

    animateBalance = () => {
        const {balanceInfo} = this.props;
        this.setState({
            balanceData: balanceInfo,
        });
        let balance = balanceInfo?.balanceQueryRespDTO?.balance;
        const el = document.querySelector('.balAmt');

        if (el && !this.state.refreshBalance) {
            this.odometer = new Odometer({
                el,
                value: 10,
                duration: 500,
                format: '(ddd).dd',
            });
            this.odometer.update(0);
            this.odometer.update(balance);
        }
    }

    render() {
        const {balanceData} = this.state;
        return (
            <Fragment>
                <div account="true">
                <span className="balanceContainer">
                    <span>
                        <i className='icon-inr' account="true"/>
                        {
                            !this.state.animate ?
                                <span><span>{balanceData?.balanceQueryRespDTO?.balance ? balanceData?.balanceQueryRespDTO?.balance : ''}</span></span> :
                                <span><span className="balAmt"/></span>
                        }
                        <span className="refreshBal" onClick={this.getBalance}>
                            <i className={`icon-refresh material-icons ${(this.state.refreshBalance) ? 'refAnimate' : ''}`}
                               account="true"/>
                        </span>
                    </span>
                </span>
                </div>
            </Fragment>);
    }
}

function mapStateToProps(state) {
    return {balanceInfo: get(state.packSelectionDetail, 'accountBalanceInfo.data')}
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({getBalanceInfo}, dispatch),
    }
}

BalanceAnimator.propTypes = {
    getBalanceInfo: PropTypes.func,
    balanceInfo: PropTypes.object,
    currentSubscription: PropTypes.object,
    isAccOpen: PropTypes.bool,
    isFromMobile: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(BalanceAnimator);