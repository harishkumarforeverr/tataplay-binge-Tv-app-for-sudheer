import React, {Component} from 'react';
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";

import Heading from "@common/Heading";
import InputBox from "@common/InputBox";
import Button from "@common/Buttons";
import {getProfileDetails} from "@containers/Profile/APIs/action";
import {updateUserProfileDetails} from "@containers/Profile/APIs/constants";
import {openPopup} from "@common/Modal/action";
import {checkEmptyValue, scrollToTop} from "@utils/common";


class ChangeName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
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

    handleOnChange = (name, value) => {
        delete this.errors[name];
        this.setState({[name]: value}, () => {
        });
    };

    validateForm = (e) => {
        e.preventDefault();
        let {firstName} = this.state;

        !firstName.length && checkEmptyValue('firstName', firstName, 'enter first name', this);

        if (firstName.length && !(Object.keys(this.state.errors).length)) {
            this.SubmitForm();
        }
    };

    SubmitForm = async () => {
        let {updateProfileDetails, userProfileDetails} = this.props;
        let payload = {
            "firstName": this.state.firstName,
            "lastName": get(this.state, 'lastName') ? get(this.state, 'lastName') : get(this.state, 'firstName'),
            "email": get(userProfileDetails, 'email'),
            "rmn": get(userProfileDetails, 'rmn'),
        };
        await updateProfileDetails(payload);
        updateUserProfileDetails(this.props, 'Name');
    };

    render() {
        let {firstName, lastName, errors} = this.state;
        return (
            <div className='change-name-container form-container'>
                <Heading heading='Change Name' profileEditSubHeading profileEditSubHeadingText={'name'}/>
                <form className='change-name-form' autoComplete='off'>
                    <ul>
                        <li className="form-group">
                            <div className="form-data">
                                <InputBox inputType="text"
                                          labelName='First Name'
                                          name="firstName"
                                          isAlpha
                                          onChange={this.handleOnChange}
                                          value={firstName}
                                          errorMessage={errors.firstName}
                                          maxLength={25}
                                />
                            </div>
                        </li>
                        <li className="form-group">
                            <div className="form-data">
                                <InputBox InputType="text"
                                          labelName='Last Name'
                                          name="lastName"
                                          isAlpha
                                          onChange={this.handleOnChange}
                                          value={lastName}
                                          errorMessage={errors.lastName}
                                          maxLength={25}
                                />
                            </div>
                        </li>
                        <li className="form-group">
                            <div className="form-data ">
                                <Button bType="submit" cName="btn primary-btn btn-block"
                                        clickHandler={this.validateForm} bValue={"Save Changes"}/>
                            </div>
                        </li>
                    </ul>
                </form>
            </div>
        )
    }
}

ChangeName.propTypes = {
    history: PropTypes.object,
    userProfileDetails: PropTypes.object,
    updateProfileDetailsResponse: PropTypes.object,
    updateProfileDetails: PropTypes.func,
    openPopup: PropTypes.func,
    getProfileDetails: PropTypes.func,
};

function mapStateToProps(state) {
    return {
        userProfileDetails: get(state.profileDetails, 'userProfileDetails'),
        updateProfileDetailsResponse: get(state.profileDetails, 'updateProfileDetailsResponse'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            updateProfileDetails,
            getProfileDetails,
            openPopup,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(ChangeName))
