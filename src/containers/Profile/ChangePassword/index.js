import React, {Component} from 'react';
import PropTypes from "prop-types";

import Heading from "@common/Heading";
import InputBox from "@common/InputBox";
import Button from "@common/Buttons";
import {checkEmptyValue, removeClass, scrollToTop} from "@utils/common";
import {LENGTH_CHECK, MESSAGE} from "@constants";
import get from "lodash/get";
import {bindActionCreators} from "redux";
import {openPopup} from "@common/Modal/action";
import {connect} from "react-redux";
import {updateUserProfileDetails} from "@containers/Profile/APIs/constants";

import '../style.scss';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";


class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPassword: '',
            newPassword: '',
            reEnteredPassword: '',
            errors: {},
        };
        this.errors = {};
    }

    componentDidMount() {
        scrollToTop();
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PASSWORD_INVOKED);
        moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PASSWORD_INVOKED);
    }

    validateChange = (name, value, submitForm = false) => {
        let element = document.getElementsByName(name) && document.getElementsByName(name)[0];
        if (value) {
            switch (name) {
               /* case 'currentPassword':
                    value ? delete this.errors[name] :
                        this.errors.currentPassword = MESSAGE.INCORRECT_PASSWORD;
                    break;*/
                /*commented as long as password 000000 is mocked from BE
                */
                case 'newPassword':
                    if (value) {
                        this.state.newPassword === this.state.currentPassword ?
                            this.errors.newPassword = MESSAGE.NEW_OLD_PWD_SAME : delete this.errors[name];
                    } else {
                        this.errors.newPassword = MESSAGE.INCORRECT_PASSWORD;
                    }
                    break;
                case 'reEnteredPassword':
                    if (value) {
                        this.state.newPassword === this.state.reEnteredPassword ? delete this.errors[name] :
                            this.errors.reEnteredPassword = MESSAGE.PASSWORD_MISMATCH;
                    } else {
                        this.errors.reEnteredPassword = MESSAGE.INCORRECT_PASSWORD;
                    }
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
            if (submitForm) {
                let {currentPassword, newPassword, reEnteredPassword, errors} = this.state;
                if (currentPassword.length && newPassword.length && reEnteredPassword.length && !(Object.keys(errors).length)) {
                    this.SubmitForm();
                }
            }
        })
    };

    handleOnChange = (name, value) => {
        if (name === 'newPassword') {
            /*this.setState({
                reEnteredPassword: '',
            })*/
        }
        delete this.errors[name];
        this.setState({[name]: value}, () => {
        });
    };

    SubmitForm = async () => {
        let {updatePassword} = this.props;
        let {reEnteredPassword, newPassword, currentPassword} = this.state;
        let payload = {
            "confirmPwd": reEnteredPassword,
            "newPwd": newPassword,
            "oldPwd": currentPassword,
        };
        await updatePassword(payload);
        let {updatePasswordResponse} = this.props;
        updateUserProfileDetails(this.props, 'Password', updatePasswordResponse, this.inlinePwdError);
    };

    inlinePwdError = (message) => {
        this.errors.currentPassword = message;
        this.setState({
            errors: this.errors,
        });
        let name = 'currentPassword';
        let element = document.getElementsByName(name) && document.getElementsByName(name)[0];
        this.errors[name] ? element.classList.add('error') : removeClass(element, 'error');
    };

    validateForm = (e) => {
        e.preventDefault();
        let {currentPassword, newPassword, reEnteredPassword} = this.state;
        currentPassword.length ? this.validateChange('currentPassword', currentPassword) : checkEmptyValue('currentPassword', currentPassword, 'enter current password', this);
        newPassword.length ? this.validateChange('newPassword', newPassword) : checkEmptyValue('newPassword', newPassword, 'enter new password', this);
        reEnteredPassword.length ? this.validateChange('reEnteredPassword', reEnteredPassword, true) : checkEmptyValue('reEnteredPassword', reEnteredPassword, 're-enter password', this);
    };

    isFormDisabled = () => {
        let {currentPassword, newPassword, reEnteredPassword, errors} = this.state;
        return (!(currentPassword.length >= LENGTH_CHECK.PASSWORD) || !(newPassword.length >= 1)
            || !(reEnteredPassword.length >= 1)) || Object.keys(errors).length
    }

    render() {
        let {currentPassword, newPassword, reEnteredPassword, errors} = this.state;
        return (
            <div className='change-password-container form-container'>
                <Heading heading='Change Password' profileEditSubHeading profileEditSubHeadingText={'password'}/>
                <form className='change-password-form' autoComplete="off">
                    <ul>
                        <li className="form-group">
                            <div className="form-data">
                                <InputBox inputType="password"
                                          labelName='Current Password'
                                          name="currentPassword"
                                          onChange={this.handleOnChange}
                                          value={currentPassword}
                                          errorMessage={errors.currentPassword}
                                          removeSpaces = {true}
                                />
                            </div>
                        </li>
                        <li className="form-group">
                            <div className="form-data">
                                <InputBox inputType="password"
                                          labelName='New Password'
                                          name="newPassword"
                                          onChange={this.handleOnChange}
                                          value={newPassword}
                                          errorMessage={errors.newPassword}
                                          removeSpaces = {true}
                                          onPaste={(event) => event.preventDefault()}
                                          onCopy={(event) => event.preventDefault()}
                                          onCut={(event) => event.preventDefault()}
                                          onDrag={(event) => event.preventDefault()}
                                          onDrop={(event) => event.preventDefault()}
                                />
                            </div>
                        </li>
                        <li className="form-group">
                            <div className="form-data">
                                <InputBox inputType="password"
                                          labelName='Re-enter Password'
                                          name="reEnteredPassword"
                                          onChange={this.handleOnChange}
                                          value={reEnteredPassword}
                                          errorMessage={errors.reEnteredPassword}
                                          removeSpaces = {true}
                                />
                            </div>
                        </li>
                        <li className="form-group">
                            <div className="form-data ">
                                <Button bType="submit" cName="btn primary-btn btn-block"
                                        disabled={this.isFormDisabled()}
                                        clickHandler={this.validateForm} bValue={"Save Changes"}/>
                            </div>
                        </li>
                    </ul>
                </form>
            </div>
        )
    }
}

ChangePassword.propTypes = {
    history: PropTypes.object,
    updatePassword: PropTypes.func,
    updatePasswordResponse: PropTypes.object,
};


function mapStateToProps(state) {
    return {
        updatePasswordResponse: get(state.profileDetails, 'updatePasswordResponse'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            updatePassword,
            openPopup,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(ChangePassword))
