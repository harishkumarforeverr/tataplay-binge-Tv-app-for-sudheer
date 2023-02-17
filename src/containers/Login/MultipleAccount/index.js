import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Button from "@common/Buttons";
import RadioButton from "@common/RadioButton";
import get from "lodash/get";

import "./style.scss";
import {notNow} from "@containers/Login/LoginCommon";
import { withRouter } from 'react-router-dom';

class MultipleAccounts extends Component {

    render() {
        const {
            barStatus,
            touchStatus,
            accountList,
            selectedAccount,
            handleProceedBtn,
            radioButtonClickHandler,
            configResponse,
        } = this.props;
        return (<React.Fragment>
                <p className="account-list-header">{get(configResponse, "data.config.ios_freetrial_title")}</p>
                <p className="account-subheader">Chosen Sub ID has multiple Plans. Please select the one you want to use.
                    </p>
                <ul className={`account-list ${barStatus === false && !touchStatus ? `acc-swipe-screen` : null}`}>
                    {accountList.map((item, index) => {
                        return (<li key={index}>
                                <div className="account-item">
                                    <i className="icon-mobile-upd"/>
                                    <span className="account-name">{item.aliasName}</span>
                                </div>
                                <div>
                                    <RadioButton
                                        id={item.baId}
                                        name={item.baId}
                                        value={item.baId}
                                        chandler={() => radioButtonClickHandler('selectedAccount', item)}
                                        showLabel={false}
                                        checked={selectedAccount.baId === item.baId}
                                    />
                                </div>
                            </li>)
                    })}
                </ul>
                <div className="button-container">
                    <Button
                        cName={`btn primary-btn login-btn`}
                        bType="button"
                        bValue="Proceed"
                        disabled={!selectedAccount}
                        clickHandler={handleProceedBtn}
                    />
                </div>
                <div className="acc-not-now" onClick={() => notNow(this.props)}>
                    Not now
                </div>
            </React.Fragment>)
    }
}

MultipleAccounts.propTypes = {
    radioButtonClickHandler: PropTypes.func,
    handleProceedBtn: PropTypes.func,
    closeLoginModel: PropTypes.func,
    accountList: PropTypes.array,
    selectedAccount: PropTypes.string,
    barStatus: PropTypes.bool,
    touchStatus: PropTypes.bool,
    configResponse: PropTypes.object,
}

export default withRouter(MultipleAccounts);