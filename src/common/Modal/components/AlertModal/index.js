import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { URL } from '@routeConstants';
import { closePopup } from '@common/Modal/action';
import {
    getIconSuccessTickUpd,
    getLayeredIcon,
    scrollToTop,
    safeNavigation,
    logoutHandling,
    isSubscriptionDiscount,
    isPaymentRedirectURL
} from "@utils/common";

import './style.scss';
import { loginPopupState } from "@components/Header/APIs/actions";
import Checkbox from "@common/Checkbox";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE, PLAY_STORE_URL } from "@constants";
import { hideMainLoader } from "@src/action";
import GooglePlayStore from "@assets/images/google-play-badge.png";
import AppStore from "@assets/images/apple-store-badge.png";

class AlertModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bingeCheck: false,
            primeCheck: false,
            changePwdTimerSeconds: this.props.passwordRedirectionTimeInSecs,
        }
    }

    componentDidMount() {
        window.addEventListener('popstate', this.handleBrowserBack);
        if (this.props.forget) {
            setTimeout(() => {
                this.props.loginPopupState(true);
                this.props.closePopup();
            }, 10000)
        }
        if (this.props.changePwd) {
            this.myInterval = setInterval(() => {
                const { changePwdTimerSeconds } = this.state;

                if (changePwdTimerSeconds > 0) {
                    this.setState(({ changePwdTimerSeconds }) => ({
                        changePwdTimerSeconds: changePwdTimerSeconds - 1,
                    }))
                }
            }, 1000)
        }
        scrollToTop();
    }

    componentWillUnmount() {
         window.removeEventListener('popstate', this.handleBrowserBack);
        if (this.props.changePwd) {
            clearInterval(this.myInterval);
        }
    }

    handleBrowserBack = async () => {
        let sessionDetail = (getKey(LOCALSTORAGE.SESSION_EXPIRED));
        let isSilentLogout = JSON.parse(getKey(LOCALSTORAGE.IS_SILENT_LOGOUT));
        let ismSalesPaymentRedirectURLBack = isPaymentRedirectURL(this.props.location) && isSilentLogout;
        !ismSalesPaymentRedirectURLBack && this.props.closePopup();
        if (sessionDetail) {
            await logoutHandling();
            this.props.history.push(`/${URL.DEFAULT}`);
            hideMainLoader();
        }
    };

    primaryButtonClick = async () => {
        let { history, primaryButtonAction, closePopup, closeModal, isCloseModal = true } = this.props;
        const { primeCheck, bingeCheck } = this.state;
        if (primaryButtonAction) {
            await primaryButtonAction(bingeCheck, primeCheck, history);
            isCloseModal && closePopup();
        }else if(isSubscriptionDiscount(history)){
            safeNavigation(history,URL.SUBSCRIPTION)
        }
        else if (closeModal) {
            closePopup();
        } else {
            safeNavigation(history, URL.HOME);
        }
    };

    secondaryButtonClick = async (event) => {
        let { history, secondaryButtonAction, closePopup, isCloseModal = true } = this.props;
        if(isSubscriptionDiscount(history)){
            safeNavigation(history, URL.SUBSCRIPTION);
        }
        else if (secondaryButtonAction) {
            await secondaryButtonAction(event);
            isCloseModal && closePopup();
        } else {
            safeNavigation(history, URL.HOME);
        }
    };

    handleCheckboxChange = (e) => {
        if (e && e.target.name === 'bingeCheck') {
            this.setState((prevState) => {
                return {
                    bingeCheck: !prevState.bingeCheck,
                }
            })
        } else if (e && e.target.name === 'primeCheck') {
            this.setState((prevState) => {
                return {
                    primeCheck: !prevState.primeCheck,
                }
            })
        }
    };

    getRechargeValues = (item) => {
        for (const [key, value] of Object.entries(item)) {
            return <div>
                <span>{key}</span>
                <span>
                    ₹ {parseInt(value, 10)}
                </span>
            </div>
        }
    }

    render() {
        let {
            headingMessage,
            rechargeValues = {},
            packName,
            packPrice,
            icon = false,
            instructions,
            primaryButtonText,
            secondaryButtonText,
            isHtml,
            errorCode,
            errorIcon,
            errorCodeInstruction,
            extraInstructions,
            cancelCheck = false,
            changePwd,
            imageUrl,
            instructionsList,
            appStoreButtonBlock = false,
            secondaryButtonLinkText,
        } = this.props;
        const { primeCheck, bingeCheck, changePwdTimerSeconds } = this.state;
        return (
            <div className="modal-body clearfix align-center">
                {errorIcon && <div className="alert-icon">
                    {errorIcon && getLayeredIcon(errorIcon)}
                </div>}
                {icon && <div className="alert-icon">
                    {icon && getIconSuccessTickUpd()}
                </div>}
                {imageUrl && <div className="alert-icon">
                    <img src={imageUrl} alt='' />
                </div>}
                {headingMessage && !isHtml ? <h1>{headingMessage}</h1>
                    : headingMessage &&
                    <h1 className="instructions-text" dangerouslySetInnerHTML={{ __html: headingMessage }} />}
                {extraInstructions && !isHtml ? <p className="extra-instructions-text">{extraInstructions}</p>
                    : extraInstructions && <p className="extra-instructions-text"
                        dangerouslySetInnerHTML={{ __html: extraInstructions }} />}
                {instructions && !isHtml ? <p className="instructions-text">
                    {changePwd ? `You'll be redirected back to Login Page in ${changePwdTimerSeconds} secs` : instructions}
                </p>
                    : instructions &&
                    <p className="instructions-text" dangerouslySetInnerHTML={{ __html: instructions }} />}
                {instructionsList && instructionsList.map((item, index) => {
                    return <li key={index} className="instructions-text instructions-text-list"><p>{item}</p>
                    </li>
                })}
                <ul className="recharge-distribution">
                    {
                        rechargeValues?.bingeSubscriptionAmountList && rechargeValues.bingeSubscriptionAmountList.map((item, index) => {
                            return <li key={index}> {this.getRechargeValues(item)}</li>
                        })
                    }
                    {
                        rechargeValues.recommendedValue &&
                        <li>
                            <span>Total Payment</span>
                            <span>₹ {parseInt(rechargeValues.recommendedValue, 10)}</span>
                        </li>
                    }
                </ul>
                {cancelCheck && <ul className="pack-cancel-list">
                    <li><span>{packName} {parseInt(packPrice, 10)}</span> <Checkbox checked={bingeCheck}
                        chandler={(e) => this.handleCheckboxChange(e)}
                        name="bingeCheck" />
                    </li>
                    <li><span>Amazon Prime</span><Checkbox checked={primeCheck}
                        chandler={(e) => this.handleCheckboxChange(e)}
                        name="primeCheck" />
                    </li>
                </ul>}
                <div className="btn-group">
                    {primaryButtonText && <button className="btn primary-btn" type="submit"
                        disabled={cancelCheck && !primeCheck && !bingeCheck}
                        onClick={() => this.primaryButtonClick()}>
                        {primaryButtonText}
                    </button>}
                    {secondaryButtonText && <button className="btn secondary-btn" type="submit"
                        onClick={() => this.secondaryButtonClick()}>
                        {secondaryButtonText}
                    </button>}
                    {secondaryButtonLinkText &&
                        <div className='sec-btn-link'>
                            <p onClick={() => this.secondaryButtonClick()}>{secondaryButtonLinkText}</p>
                        </div>}
                </div>
                {errorCode && <p className="instructions-text">Error #{errorCode}</p>}
                {errorCodeInstruction && <p className="instructions-text error-code">{errorCodeInstruction}</p>}
                {appStoreButtonBlock && <div className={"app-store-btn"}>
                    <a href={PLAY_STORE_URL.ANDROID} target="_blank" rel="noreferrer">
                        <img src={GooglePlayStore} alt="google-play-store" />
                    </a>
                    <a href={PLAY_STORE_URL.IOS} target="_blank" rel="noreferrer">
                        <img src={AppStore} alt="app-store" />
                    </a>
                </div>}
            </div>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => {
    return {
        ...bindActionCreators({
            closePopup,
            loginPopupState,
        }, dispatch),
    }
};

AlertModal.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    rechargeValues: PropTypes.object,
    modal: PropTypes.object,
    closePopup: PropTypes.func,
    openPopup: PropTypes.func,
    primaryButtonAction: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    secondaryButtonAction: PropTypes.func,
    headingMessage: PropTypes.string,
    instructions: PropTypes.string,
    primaryButtonText: PropTypes.string,
    secondaryButtonText: PropTypes.string,
    closeModal: PropTypes.bool,
    isHtml: PropTypes.bool,
    icon: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
    ]),
    errorIcon: PropTypes.string,
    errorCode: PropTypes.string,
    isCloseModal: PropTypes.bool,
    forget: PropTypes.bool,
    loginPopupState: PropTypes.func,
    errorCodeInstruction: PropTypes.string,
    extraInstructions: PropTypes.string,
    packName: PropTypes.string,
    packPrice: PropTypes.number,
    cancelCheck: PropTypes.bool,
    changePwd: PropTypes.bool,
    imageUrl: PropTypes.string,
    instructionsList: PropTypes.array,
    passwordRedirectionTimeInSecs: PropTypes.number,
    appStoreButtonBlock: PropTypes.bool,
    languageModal: PropTypes.bool,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AlertModal));
