import React, { Component } from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import {isMobile, isSubscriptionDiscount} from "@utils/common";
import InputBox from "@common/InputBox";
import Button from "@common/Buttons";
import { LENGTH_CHECK } from "@utils/constants";
import { COMMON_TEXT } from "@containers/BingeLogin/APIs/constants";
import {  compose } from "redux";
import { withRouter } from "react-router";
import "./style.scss";
import { notNow, licenceAgreement } from "@containers/Login/LoginCommon";
import { URL } from "@utils/constants/routeConstants";

class RMNComponent extends Component {
  onEnterClick = (event) => {
    let { rmn} = this.props;
    const { charCode } = event;
    if (charCode === 13 && rmn?.length === 10) {
      this.props.handleGetOtpClick();
    }
  };

    render() {
        const {
            rmn,
            handleChange,
            handleGetOtpClick,
            getOtpIsDisabled,
            configResponse,
            rmnError,
        } = this.props;

        return (
          <div
            className={`rmn-input-container ${
              rmnError && "incorrect-input-container"
            }`}
          >
            <InputBox
              inputType={"tel"}
              initialVal={"+91"}
              name="rmn"
              value={rmn}
              isNumericWithZero
              maxLength={LENGTH_CHECK.RMN}
              onChange={handleChange}
              placeholder="Please enter your Mobile Number"
              errorMessage={rmnError}
              autoFocus={!isMobile.any()}
              onKeyPress={(e) => this.onEnterClick(e)}
            />
            <div className={"login-license"}>
              <p>
                {get(configResponse, "data.config.licenseAgreement.title")}
                <span className={"blue-text font-14"}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={get(configResponse, "data.config.url.eulaUrlHybrid")}
                    onClick={licenceAgreement}
                  >
                    {COMMON_TEXT.LICENCE_AGREEMENT}
                  </a>
                </span>
              </p>
            </div>
            <div className="button-container">
              <Button
                cName="btn primary-btn get-otp-btn"
                bType="button"
                bValue={COMMON_TEXT.GET_OTP}
                clickHandler={handleGetOtpClick}
                disabled={getOtpIsDisabled}
              />
            </div>
           {!isSubscriptionDiscount(this.props.history) && <div className="rmn-not-now" onClick={() => notNow(this.props)}>
              Not now
            </div> }
          </div>
        );
    }
}

RMNComponent.propTypes = {
    handleChange: PropTypes.func,
    handleGetOtpClick: PropTypes.func,
    closeLoginModel: PropTypes.func,
    rmn: PropTypes.string,
    rmnError: PropTypes.string,
    getOtpIsDisabled: PropTypes.bool,
    configResponse: PropTypes.object,
};

export default compose(
  withRouter,
)(RMNComponent);
