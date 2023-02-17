import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import InputBox from "@common/InputBox";
import get from "lodash/get";
import PropTypes from "prop-types";

import Button from "@common/Buttons";
import {COMMON_TEXT, WEB_SMALL_LOGIN_STEP} from "@containers/BingeLogin/APIs/constants";
import {MESSAGE, REGEX} from "@constants";
import {isMobile, removeClass} from "@utils/common";
import {openPopup} from "@common/Modal/action";
import {createBingeUser} from '@containers/BingeLogin/APIs/action';
import {withRouter} from 'react-router';

import '../style.scss'
import {MODALS} from "@common/Modal/constants";
import {hideFooter, hideHeader, hideMainLoader, showMainLoader} from "@src/action";
import ProgressBar from "@common/ProgressBar";
import {quickRecharge} from "@containers/PackSelection/APIs/action";
import {createUser} from "@containers/BingeLogin/bingeLoginCommon";

class Eula extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            errors: {},
        };
        this.errors = {};
    }

    componentDidMount = () => {
        let {sidDetails} = this.props;
        sidDetails && sidDetails.emailId && setTimeout(() => this.setState({email: sidDetails.emailId}), 500);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(Object.keys(prevProps.sidDetails).length !== Object.keys(this.props.sidDetails).length) {
            let {sidDetails} = this.props;
            sidDetails && sidDetails.emailId && setTimeout(() => this.setState({email: sidDetails.emailId}), 500);
        }
    }

    handleChange = (name, value) => {
        this.setState({[name]: value}, () => {
            this.state.errors[name] && this.validateChange(name, value);
        })
    };

    validateChange = (name, value, charCode) => {
        let element = document.getElementsByName(name) && document.getElementsByName(name)[0];
        if (value) {
            switch (name) {
                case 'email':
                    REGEX.EMAIL.test(value) ? delete this.errors[name] :
                        this.errors[name] = MESSAGE.INVALID_EMAIL;
                    break;
                default:
                    this.errors[name] ? delete this.errors[name] : false
            }
            this.errors[name] ? element.classList.add('error') : removeClass(element, 'error');
        } else {
            delete this.errors[name];
        }
        this.setState({
            errors: this.errors,
        }, () => {
            if (charCode === 13) {
                const {sidDetails, loginWithRMN, authType, history} = this.props;
                sidDetails.emailId = this.state.email;
                !Object.keys(this.state.errors).length && createUser(sidDetails, loginWithRMN, authType, history, "", this.props.openPopup);
            }
        })
    };

    onEnterClick = (event) => {
        const {charCode} = event;
        charCode && charCode === 13 && this.validateChange('email', this.state.email, charCode)
    };

    errorPopup = () => {
        const {openPopup, newUserDetails} = this.props;
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal',
            instructions: newUserDetails.message,
            primaryButtonText: 'Ok',
            closeModal: true,
            hideCloseIcon: true,
        })
    };

    getHeight = () => {
        let appWidth = document.getElementById('app').clientWidth,
            appHeight = document.getElementById('app').clientHeight,
            height;
        if (isMobile.any() && (appWidth <= 320 || appWidth <= 812)) {
            height = appHeight - (488);
            return height > 250 ? height : 286
        }
    };

    createUser = () => {
        const {sidDetails, loginWithRMN, authType, history, openPopup} = this.props;
        let data = {...sidDetails, emailId: this.state.email};
        createUser(data, loginWithRMN, authType, history, "", openPopup)
    };

    render = () => {
        let {email, errors} = this.state,
            isProceedDisabled = (email.length === 0 || Object.keys(errors).length);
        const {sidDetails, loginWithRMN, authType, history, openPopup} = this.props;
        return (
            <div className='eula-form-container'>
                <div className={'for-mobile'}><ProgressBar stepNumberArray={WEB_SMALL_LOGIN_STEP} activeStep={3}/></div>
                <div className='title'>{sidDetails.emailId ? 'Confirm your Email ID' : 'Update your Email ID'}</div>
                <div className={'login-eula-container'}>
                    <div className='form-data'>
                        <label>Name</label>
                        <p className={'prefilled-text'}>{sidDetails.subscriberName}</p>
                    </div>
                    <div className='form-data'>
                        <label>Registered Mobile Number</label>
                        <p className={'prefilled-text'}>+91 {sidDetails.rmn}</p>
                    </div>
                    <InputBox InputType="email"
                              labelName='Email ID'
                              name="email"
                              value={email}
                              required={true}
                              errorMessage={get(errors, 'email')}
                              onChange={this.handleChange}
                              onBlur={this.validateChange}
                              onKeyPress={(e) => this.onEnterClick(e)}
                    />
                    <div className={'button-block without-blue-text'} style={{minHeight: this.getHeight()}}>
                        <div className={'button-container'}>
                            <Button cName="btn primary-btn" bType="button"
                                    bValue={sidDetails.emailId ? COMMON_TEXT.CONFIRM : COMMON_TEXT.UPDATE}
                                    disabled={isProceedDisabled}
                                    clickHandler={this.createUser}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        newUserDetails: get(state.bingeLoginDetails, 'newUser'),
    };
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        createBingeUser,
        openPopup,
        hideHeader,
        hideFooter,
        quickRecharge,
        showMainLoader,
        hideMainLoader,
    }, dispatch)
);

Eula.propTypes = {
    sidDetails: PropTypes.object,
    createBingeUser: PropTypes.func,
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    newUserDetails: PropTypes.object,
    history: PropTypes.object,
    openPopup: PropTypes.func,
    authType: PropTypes.string,
    loginWithRMN: PropTypes.bool,
    quickRecharge: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Eula));
