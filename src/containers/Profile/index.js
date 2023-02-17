import React, {Component} from "react";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import {withRouter} from 'react-router';
import {
  getLayeredIcon,
  formDataGenerator,
  scrollToTop,
  showToast,
  safeNavigation,
  isMobile,
  
} from "@utils/common";
import {URL} from "@constants/routeConstants";
import Button from "@common/Buttons";

import {openPopup} from "@common/Modal/action";
import NoDataAvailable from "@common/NoDataAvailable";
import {DTH_TYPE, ERROR_CODE, MESSAGE, TAB_BREAKPOINT,LOCALSTORAGE, REGEX} from "@constants";
import {
  getProfileDetails,
  updateProfileImage,
  updateProfileDetailsNonDthUser,
  updateEmail,
  setProfileImage,
} from "./APIs/action";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import InputBox from "@common/InputBox";
import "./style.scss";
import moengageConfig from "@utils/moengage";
import {deleteKey, getKey} from "@utils/storage";
import {Link} from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import UnkwownUser from "@assets/images/profile-avatar.svg";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";

class Profile extends Component {
  constructor(props) {
    super(props);
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    this.state = {
      showAvatarImage: false,
      email: "",
      name: "",
      btnDisable: true,
      errors: {},
      dthStatus: userInfo.dthStatus,
      isChange: false,
      dimensions: {},
      isShown: false,
    };
  }

  componentDidMount = async () => {
    await this.loadHandler();
    this.handleOnResize();
    window.addEventListener("resize", this.handleOnResize);
  }

  componentDidUpdate = async (prevProps) => {
    let { userProfileDetails } = this.props;
    const profileDataUpdated = JSON.stringify(prevProps?.userProfileDetails) !== JSON.stringify(userProfileDetails)
    if (profileDataUpdated) {
      let name = !isEmpty(get(userProfileDetails, "firstName") || get(userProfileDetails, "lastName")) ?
        `${get(userProfileDetails, "firstName")} ${get(userProfileDetails, "lastName")}` : '';

      this.setState({
        showAvatarImage: !userProfileDetails.profileImage && !isEmpty(userProfileDetails?.firstName),
        name: name,
        email: get(userProfileDetails, "email"),
      });
    }
  }

  handleOnResize = () => {
    this.setState({
      dimensions: {
        height: window.innerHeight,
        width: window.innerWidth,
      },
    })
  }
  loadHandler = async () => {
    await this.props.getProfileDetails(true);
    let {userProfileDetails} = this.props;
    let name = !isEmpty(get(userProfileDetails, "firstName") || get(userProfileDetails, "lastName")) ?
      `${get(userProfileDetails, "firstName")} ${get(userProfileDetails, "lastName")}` : '';

    this.setState({
      ...this.state,
      showAvatarImage: !userProfileDetails.profileImage && !isEmpty(userProfileDetails?.firstName),
      name: name,
      email: get(userProfileDetails, "email"),
    });

    if (getKey(LOCALSTORAGE.PROFILE_UPDATED) === "true") {
      mixPanelConfig.profileChanges();
      moengageConfig.profileChanges();
      deleteKey(LOCALSTORAGE.PROFILE_UPDATED);
    }

    scrollToTop();
    this.trackEvents();
  };

  validateForm = () => {
    let {email, name} = this.state;
    let errors = {};
    let formIsValid = true;
    /**if (!name) {
        errors.name = MESSAGE.INVALID_NAME;
    }**/
    /**if (!email) {
        errors.email = MESSAGE.INVALID_EMAIL;
    }**/

    if (typeof email !== "undefined") {
      if (!REGEX.EMAIL.test(email)) {
        errors.email = MESSAGE.INVALID_EMAIL;
      }
    }

    if (!name && !email) {
      formIsValid = false;
    }

    this.setState({...this.state, errors: errors});
    return formIsValid;
  };

  // dth with binge old stack
  updateProfileDetails = async () => {
    let {updateEmail} = this.props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let payload = {
      "emailId": this.state.email,
      "subscriberId": `${userInfo.sId}`,
    };
    await updateEmail(payload);
    let {updateEmailResponse} = this.props;
    if (updateEmailResponse?.code === 0) {
      showToast(updateEmailResponse?.message);

      if (isMobile.any() && this.props?.updateEmailResponse?.code === 0) {
        safeNavigation(this.props.history, `/${URL.SETTING}`);
      }
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PROFILE);
      moengageConfig.trackEvent(MOENGAGE.EVENT.UPDATE_PROFILE);

      mixPanelConfig.profileChanges();
      moengageConfig.profileChanges();
    }
  };

  callback = (response) => {
    let errors = {};
    if (response.code === ERROR_CODE.ERROR_20109) {
      errors.name = response.message;
    }
    if (response.code === ERROR_CODE.ERROR_700006) {
      errors.email = response.message;
    }
    this.setState({...this.state, errors: errors});
  };

  updateProfile = async (e) => {
    e.preventDefault();
    if (this.validateForm()) {
      let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
      let dthStatus = userInfo.dthStatus
      let {
        userProfileDetails,
        updateProfileDetailsNonDthUser,
      } = this.props;
      let {email, name} = this.state;
      let payload = {
        emailId: email,
        subscriberName: name,
        rmn: get(userProfileDetails, "rmn"),
        subscriberId: userInfo.sId,
        baId: userInfo.baId,
      };

      if ([DTH_TYPE.NON_DTH_USER, DTH_TYPE.DTH_W_BINGE_NEW_USER].includes(dthStatus)) {
        await updateProfileDetailsNonDthUser(payload, this.callback);
      } else {
        await this.updateProfileDetails()
      }

      if (this.props?.updateProfileDetailsResponse?.code === 0) {
        isMobile.any() && safeNavigation(this.props.history, `/${URL.SETTING}`);
        mixPanelConfig.profileChanges();
        moengageConfig.profileChanges();
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.UPDATE_PROFILE);
        dataLayerConfig.trackEvent(DATALAYER.EVENT.SETTING_CTAS,{
          [DATALAYER.PARAMETER.BUTTON_NAME]:this.state.dimensions?.width > TAB_BREAKPOINT ? DATALAYER.VALUE.SAVE_CHANGES : DATALAYER.VALUE.CONFIRM ,
           
         }
        )
        await this.props.getProfileDetails();
        this.setState(
          {
            ...this.state,
            btnDisable: true,
          },
        );
      }
    }
   
  }

  updateImage = async (e) => {
    e.preventDefault();
    let selectedFile = e.target.files[0];
    e.target.value = ''
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    if (selectedFile && selectedFile.size < 2000000) {
      let {updateProfileImage} = this.props,
        rightFormat = false;
      let splitName = selectedFile.name.split(".");
      let format = splitName[splitName.length - 1].toLowerCase();
      if (format === "jpg" || format === "jpeg" || format === "png") {
        rightFormat = true;
      }
      if (rightFormat) {
        await updateProfileImage(formDataGenerator({
          image: selectedFile,
          profileId: userInfo.profileId,
        }));
        let {updateProfileImageResponse, setProfileImage} = this.props;
        if (updateProfileImageResponse) {
          if(updateProfileImageResponse?.code === 0){
            updateProfileImageResponse?.data?.relativePath && setProfileImage(updateProfileImageResponse?.data?.relativePath)
          }
          showToast(updateProfileImageResponse.message);
        }
      }
    }
    else{
      showToast('File exceeds the maximum size ("2MB")');
    }
  }

  trackEvents = () => {
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.EDIT_PROFILE, { [MIXPANEL.PARAMETER.TYPE]: MIXPANEL.VALUE.DEFAULT });
    moengageConfig.trackEvent(MOENGAGE.EVENT.EDIT_PROFILE);
  };


  handleOnChange = (name, value) => {
    let {userProfileDetails} = this.props;
    let btnDisable = false;
    let allowedValue = name === 'name' ? value.replace(/[^a-z\s]/gi, '') : value;
    if(name === 'name') {
      let userName = !isEmpty(get(userProfileDetails, "firstName") || get(userProfileDetails, "lastName")) ?
        `${get(userProfileDetails, "firstName")} ${get(userProfileDetails, "lastName")}` : '';
      btnDisable = value.replace(/[0-9]/g,"").trim() === userName.trim();
    }

    if(name === 'email') {
      btnDisable = value.trim() === get(userProfileDetails, "email").trim();
    }
    
    this.setState(
      {
        ...this.state,
        [name]: allowedValue,
        isChange: true,
        btnDisable: btnDisable,
        errors: {...this.state.errors, [name]: ""},
      },
    );
  };

  handleBrokenImage = () => {
    this.setState({
      showAvatarImage: true,
    })
  };

  render() {
    let {userProfileDetails = {}, configResponse, history} = this.props;
    let {name, email, errors, btnDisable, showAvatarImage} = this.state;
    let profileImage = `${get(userProfileDetails, "profileImage")}`;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let dthStatus = userInfo.dthStatus
    //"Non DTH User";

    return !isEmpty(userProfileDetails) ? (
      <div className="profile-container">
        <div className="profile-wrapper">
          <h3 className="content-header">Edit Profile</h3>
          {configResponse && userProfileDetails && (
            <div className={"profile-img-section"}>
              <div
                className={`profile-img ${profileImage && "gradient-active"
                  }`}
              >
                {profileImage && !showAvatarImage && (
                  <img
                    alt="profile"
                    src={`${get(
                      configResponse,
                      "data.config.subscriberImage.subscriberImageBaseUrl"
                    )}${profileImage}`}
                    onError={this.handleBrokenImage}
                  />
                )}

                {showAvatarImage && (
                  <div className={"avatar-block"}>
                    <p>
                      {get(userProfileDetails, "firstName", "*").charAt(0)}
                    </p>
                  </div>
                )}

                {!profileImage && !showAvatarImage && (
                  <span className="profile-avatar-wrapper">
                    <img
                      src={UnkwownUser}
                      className={`unknown-user`}
                      alt="unkown-user-avatar"
                    />
                  </span>
                )}
                <span className="profile-img-icon"
                  onMouseOver={() => this.setState({ isShown: true })}
                  onMouseLeave={() => this.setState({ isShown: false })}>
                  <input
                    type="file"
                    id={"imageUpload"}
                    accept="image/*"
                    onChange={this.updateImage}
                  />
                  <label
                    htmlFor={"imageUpload"}
                    onChange={this.updateImage}
                  >
                    {getLayeredIcon("icon-camera")}
                  </label>
                </span>
              </div>
              {this.state.isShown && <div className="profile-hover">Profile Size Of Maximum "2Mb"</div>}
            </div>
          )}

          {dthStatus === DTH_TYPE.NON_DTH_USER ? (
            <div className="input-container">
              <InputBox
                InputType="name"
                labelName="Name"
                name="name"
                onChange={this.handleOnChange}
                value={name}
                errorMessage={errors.name}
                placeholder={"Enter Name Here"}
                maxLength={50}
                className="infoPlaceholder"
              />
            </div>
          ) : (
            <div className="input-container">
              <label>Name</label>
              <p className="name"> {name} </p>
            </div>
          )}
          <div className="input-container">
            <InputBox
              InputType="email"
              labelName="Email ID"
              name="email"
              onChange={this.handleOnChange}
              value={email}
              errorMessage={errors.email}
              placeholder={"Enter Email ID"}
              className="infoPlaceholder"
            />
          </div>
          <div className="mobile-wrapper">
            <p>Registered Mobile Number</p>
            <p> {`+91 ${get(userProfileDetails, "rmn")}`} </p>
          </div>
          <div className={`btn-wrapper`}>
            <Button
              cName="primary-btn next"
              bType="button"
              bValue={`${this.state.dimensions?.width > TAB_BREAKPOINT
                ? "Save Changes"
                : "Confirm"
                }`}
              disabled={btnDisable}
              clickHandler={this.updateProfile}
            />
          </div>
          <div className={`btn-wrapper cancel-btn`}>
            <Link onClick={() => history.goBack()}>
              <div className="btn-link">Cancel</div>
            </Link>
          </div>
        </div>
      </div>
    ) : (
      <NoDataAvailable text={MESSAGE.NO_DATA} />
    );
  }
}

Profile.propTypes = {
  history: PropTypes.object,
  userProfileDetails: PropTypes.object,
  getProfileDetails: PropTypes.func,
  updateProfileDetailsResponse: PropTypes.object,
  updateProfileImageResponse: PropTypes.object,
  updateProfileImage: PropTypes.func,
  openPopup: PropTypes.func,
  configResponse: PropTypes.object,
  updateEmail: PropTypes.func,
  updateProfileDetailsNonDthUser: PropTypes.func,
  updateEmailResponse: PropTypes.func,
  setProfileImage: PropTypes.func
};

function mapStateToProps(state) {
  return {
    userProfileDetails: get(state.profileDetails, "userProfileDetails"),
    updateProfileDetailsResponse: get(
      state.profileDetails,
      "updateProfileDetailsResponse",
    ),
    updateProfileImageResponse: get(
      state.profileDetails,
      "updateProfileImageResponse",
    ),
    configResponse: get(state.headerDetails, "configResponse"),
    anonymousUserId: get(state.headerDetails, "anonymousUserData.anonymousId"),
    updateEmailResponse: get(state.profileDetails, 'updateEmailResponse'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        getProfileDetails,
        openPopup,
        updateProfileImage,
        updateEmail,
        updateProfileDetailsNonDthUser,
        setProfileImage
      },
      dispatch,
    ),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
