import React from 'react';
import Button from "@common/Buttons";
import PropTypes from 'prop-types';
import {URL} from "@constants/routeConstants";
import {isMobile, showNoInternetPopup} from "@utils/common";
import {DTH_BALANCE} from "@containers/PackSelection/constant";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import PackUpgrade from "@containers/PackSelection/SubscriptionSummaryModal/PackUpgrade";
import get from "lodash/get";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";

export default class DTHBalance extends React.Component {

    showPaymentBlock = () => {
        const {bingeAccountStatus, balanceInfo, packDetail, aboutSubscription} = this.props;
        let balance = get(balanceInfo, 'data.balanceQueryRespDTO.balance');
        return aboutSubscription && [ACCOUNT_STATUS.DEACTIVE, ACCOUNT_STATUS.DEACTIVATED].includes(bingeAccountStatus.toUpperCase())
            && parseFloat(balance) >= packDetail.packPrice;
    }

    proceedCases = () => {
        const {inactiveProceed, filteredList, dthProceed, packDetail} = this.props;
        {
            if (inactiveProceed) {
                filteredList();
            } else {
                dthProceed(packDetail.packId)
            }
        }
    }

    render() {
        const {
            balanceInfo,
            packDetail,
            openPopup,
            history,
            aboutSubscription,
            paidPackUpgrade,
        } = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

        return (
            <div className="dth-balance-block">
                {paidPackUpgrade ?
                    <PackUpgrade balanceInfo={balanceInfo} packDetail={packDetail} openPopup={openPopup}
                                 lowBalance={false}/> :
                    <>
                        <p className={`dth-instructions ${isMobile.any() && 'for-mobile-view'} ${!aboutSubscription && `dth-top`}`}>
                            {!aboutSubscription && packDetail.footerVerbiage}
                        </p>
                        {this.showPaymentBlock() &&
                        <span>
                            <i className="icon-check"/>
                            <span>{DTH_BALANCE.TATA_SKY_BALANCE}</span>
                        </span>
                        }
                    </>
                }
                <div className={'button-group'}>
                    <Button bValue="Proceed" cName="btn primary-btn"
                            clickHandler={() => this.proceedCases()}/>
                    {!userInfo?.dummyUser && <a className="for-mobile blue-text"
                        onClick={() => !navigator.onLine ? showNoInternetPopup : history.push(`/${URL.MY_SUBSCRIPTION}`)}>Skip</a>}
                </div>
            </div>)
    }
};

DTHBalance.propTypes = {
    packDetail: PropTypes.object,
    dthProceed: PropTypes.func,
    bingeAccountStatus: PropTypes.string,
    history: PropTypes.object,
    inactiveProceed: PropTypes.bool,
    filteredList: PropTypes.func,
    balanceInfo: PropTypes.object,
    openPopup: PropTypes.func,
    aboutSubscription: PropTypes.bool,
    paidPackUpgrade: PackUpgrade.bool,
    getInstructions: PropTypes.func,
};
