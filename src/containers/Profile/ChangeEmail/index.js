import React, {Component} from 'react';
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import get from "lodash/get";
import {connect} from "react-redux";

import Button from "@common/Buttons";
import {LOCALSTORAGE, REGEX} from "@utils/constants";
import {getProfileDetails, updateEmail} from "@containers/Profile/APIs/action";
import {updateUserProfileDetails} from "@containers/Profile/APIs/constants";
import {openPopup} from "@common/Modal/action";
import {checkEmptyValue, scrollToTop} from '@utils/common';
import {MESSAGE} from "@utils/constants/index";
import {getKey} from "@utils/storage";

import Heading from '../../../common/Heading';
import InputBox from "../../../common/InputBox";

import './style.scss';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import moengageConfig from "@utils/moengage";

class ChangeEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newEmail: '',
            reEnteredEmail: '',
            errors: {},
        };
        this.errors = {};
    }

    componentDidMount() {
        scrollToTop();
        this.loadHandler();
    }

    loadHandler = async () => {
        let {userProfileDetails} = this.props;
        if (userProfileDetails === undefined) {
            await this.props.getProfileDetails(true);
            let {userProfileDetails} = this.props;
            userProfileDetails && this.setPreFilledDetail(userProfileDetails);
        } else {
            userProfileDetails && this.setPreFilledDetail(userProfileDetails);
        }
    };

    setPreFilledDetail = (detail) => {
        this.setState({
            firstName: detail.firstName,
            lastName: detail.lastName,
        })
    };

    validateChange = (name, value, submitForm = false) => {
        let {userProfileDetails} = this.props;
        if (value) {
            switch (name) {
                case 'newEmail':
                case 'reEnteredEmail':
                    REGEX.EMAIL.test(value) ? delete this.errors[name] :
                        this.errors[name] = MESSAGE.INVALID_EMAIL;
                    if(name === 'newEmail' && value === get(userProfileDetails, 'email') ) {
                        this.errors[name] = MESSAGE.EMAIl_CANNOT_SAME;
                    }
                    if (name === 'reEnteredEmail') {
                        (this.state.newEmail).toLowerCase() === (this.state.reEnteredEmail).toLowerCase() ? delete this.errors[name] :
                            this.errors.reEnteredEmail = MESSAGE.EMAIL_MISMATCH;
                    }
                    break;
                default:
                    this.errors[name] ? delete this.errors[name] : false
            }
        } else {
            delete this.errors[name];
        }
        this.setState({
            errors: this.errors,
        }, () => {
            if(submitForm){
                let {newEmail, reEnteredEmail, errors} = this.state;
                if (newEmail.length && reEnteredEmail.length && !(Object.keys(errors).length)) {
                    this.SubmitForm();
                }
            }
        })
    };

    handleOnChange = (name, value) => {
        delete this.errors[name];
        this.setState({[name]: value}, () => {
        });
    };

    SubmitForm = async () => {
        let {updateEmail} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let payload = {
            "emailId": this.state.newEmail,
            "subscriberId": `${userInfo.sId}`,
        };
        await updateEmail(payload);
        let { updateEmailResponse } = this.props;
        if(updateEmailResponse?.code === 0){
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PROFILE);
            moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PROFILE);
        }
        updateEmailResponse && updateUserProfileDetails(this.props, 'Email', updateEmailResponse);
    };

    validateForm = (e) => {
        e.preventDefault();
        let {newEmail, reEnteredEmail} = this.state;
        newEmail.length ? this.validateChange('newEmail', newEmail) : checkEmptyValue('newEmail', newEmail, 'enter new email', this);
        reEnteredEmail.length ? this.validateChange('reEnteredEmail', reEnteredEmail, true) : checkEmptyValue('reEnteredEmail', reEnteredEmail, 're-enter email', this);
    };

    render() {
        let {newEmail, reEnteredEmail, errors} = this.state;
        let {userProfileDetails} = this.props;
        return (
          <div className="change-email-container form-container">
            <Heading
              heading="Change Email"
              profileEditSubHeading
              profileEditSubHeadingText={"email"}
            />
            <form className="change-email-form" autoComplete="off">
              <ul>
                <li className="form-group">
                  <div className="form-data">
                    <label>Current Email</label>
                    <div>
                      <p className={"current-email"}>
                        {userProfileDetails && get(userProfileDetails, "email")}
                      </p>
                    </div>
                  </div>
                </li>
                <li className="form-group">
                  <div className="form-data">
                    <InputBox
                      InputType="email"
                      labelName="New Email"
                      name="newEmail"
                      onChange={this.handleOnChange}
                      value={newEmail}
                      errorMessage={errors.newEmail}
                    />
                  
                  </div>
                </li>
                <li className="form-group">
                  <div className="form-data">
                    <InputBox
                      InputType="reEnteredEmail"
                      labelName="Re-enter Email"
                      name="reEnteredEmail"
                      onChange={this.handleOnChange}
                      value={reEnteredEmail}
                      errorMessage={errors.reEnteredEmail}
                    />
                  
                  </div>
                </li>
                <li className="form-group">
                  <div className="form-data ">
                    <Button
                      bType="submit"
                      cName="btn primary-btn btn-block"
                      clickHandler={this.validateForm}
                      bValue={"Save Changes"}
                    />
                  </div>
                </li>
              </ul>
            </form>
          </div>
        );
    }
}

ChangeEmail.propTypes = {
    history: PropTypes.object,
    userProfileDetails: PropTypes.object,
    updateEmailResponse: PropTypes.object,
    updateProfileDetails: PropTypes.func,
    openPopup: PropTypes.func,
    getProfileDetails: PropTypes.func,
    updateEmail: PropTypes.func,
};

function mapStateToProps(state) {
    return {
        userProfileDetails: get(state.profileDetails, 'userProfileDetails'),
        updateEmailResponse: get(state.profileDetails, 'updateEmailResponse'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            updateEmail,
            getProfileDetails,
            openPopup,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(ChangeEmail))
