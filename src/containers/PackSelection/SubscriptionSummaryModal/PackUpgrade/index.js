import React from 'react';
import {MODALS} from "@common/Modal/constants";
import {isMobile} from "@utils/common";
import {DTH_BALANCE} from "@containers/PackSelection/constant";
import PropTypes from "prop-types";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

export default class PackUpgrade extends React.Component {

    payablePopup = () => {
        const {openPopup, balanceInfo} = this.props;
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal billing-popup ',
            headingMessage: 'Subscription Upgrade',
            instructions: balanceInfo?.data?.message,
            errorIcon: isMobile.any() ? 'icon-info' : 'icon-circle-copy',
            closeModal: true,
            hideCloseIcon: true,
            primaryButtonText: 'Close',
        })
    }

    render() {
        const {balanceInfo, packDetail, lowBalance} = this.props;
        let retrofitAmount = get(balanceInfo, 'data.retrofitAmount');
        return (
            <>
                {!isEmpty(retrofitAmount) && retrofitAmount !== "" && parseInt(retrofitAmount) !== 0 &&
                <>
                    <p className={`dth-balance upgrade-journey`}>
                        {
                            <>
                                <div>
                                    <span className="total-payment">{packDetail.title}</span>
                                    <span className="sub-summary-right-amount">
                                        <span className={'price'}>₹</span>
                                        {packDetail.price}
                                    </span>
                                </div>
                                <div>
                                    <span className="total-payment">{DTH_BALANCE.CURRENT_SUBSCRIPTION}</span>
                                    <span className="sub-summary-right-amount">
                                        <span className={'price'}>- ₹</span>
                                        {parseInt(balanceInfo?.data?.retrofitAmount)}
                                    </span>
                                </div>
                            </>
                        }
                    </p>
                    <div className="upgrade-total-amount">
                        <span className="total-payment">{DTH_BALANCE.TOTAL_PAYABLE}
                            {parseInt(balanceInfo?.data?.retrofitAmount) !== 0 &&
                            <i className="icon-info" onClick={() => this.payablePopup()}>
                                <span className="path1"/>
                                <span className="path2"/>
                            </i>
                            }
                        </span>
                            <span className="sub-summary-right-amount">
                            <span className={'price'}>₹</span>
                                {parseInt(balanceInfo?.data?.totalAmount)}
                        </span>
                    </div>
                </>
                }

                {!lowBalance && <div className="upgrade-text">{packDetail?.footerVerbiage}</div>}
            </>)
    }
}

PackUpgrade.propTypes = {
    packDetail: PropTypes.object,
    balanceInfo: PropTypes.object,
    openPopup: PropTypes.func,
    lowBalance: PropTypes.bool,
};