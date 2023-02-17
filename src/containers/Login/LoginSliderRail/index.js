import React, { Component } from "react";
import PropTypes from "prop-types";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { cloudinaryCarousalUrl, isMobile } from "@utils/common";

import imagePlaceholderAppRail from "@assets/images/app-icon-place.svg";
import Marquee from "react-fast-marquee";

import "./style.scss";

class LoginSliderRail extends Component {

  renderMarquee = (railItems) => {
    return <div className="marquee-inner">
      {railItems.map((railItem, index) => {
        return (
            <div key={index} className="login-slider-item">
              <React.Fragment>
                {railItem.iconUrl ? (
                    <img
                        src={`${railItem.iconUrl}`}
                        alt=""
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = imagePlaceholderAppRail;
                        }}
                    />
                ) : (
                    <img
                        src={imagePlaceholderAppRail}
                        alt={"place-holder-image"}
                        className={"place-holder-image"}
                    />
                )}
              </React.Fragment>
            </div>
        );
      })}
    </div>
  }

  render() {
    const { railItems = [] } = this.props;

    return (
      <section class="login-slider">
        <div class="marquee">
          {this.renderMarquee(railItems)}
          {this.renderMarquee(railItems)}
        </div>
      </section>
    );
  }
}

LoginSliderRail.propTypes = {
  railItems: PropTypes.array,
};
export default LoginSliderRail;
