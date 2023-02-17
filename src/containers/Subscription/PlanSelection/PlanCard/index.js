import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {  compose } from "redux";
import { withRouter } from "react-router";
import get from "lodash/get";
import { isEmpty } from "lodash";
import { cloudinaryCarousalUrl, isSubscriptionDiscount } from "@utils/common";
import RadioButton from "@common/RadioButton";
import Crown from "@assets/images/crown-top-10.png";
import ErrorImage from "@assets/images/binge-mobile-asset.png";
import placeHolderImage from "@assets/images/app-icon-place.svg";

import "./style.scss";
export class PlanCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  partnerDetails = (list) => {
    let [partner] = list;
    return (
      <React.Fragment>
        {partner &&
          partner.partnerList.map(
            (data, key) =>
              data?.included && (
                <React.Fragment key={key}>
                  <div
                    className={`img-container ${data.starterPackHighlightApp ? "premium-content" : ""
                      }`}
                  >
                    <img
                      src={`${cloudinaryCarousalUrl("", "", 120, 120)}${data.iconUrl}`}
                      alt=""
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeHolderImage;
                        e.target.className = "broken-image";
                      }}
                    />
                  </div>
                </React.Fragment>
              )
          )}
      </React.Fragment>
    );
  };

  checkSelectedPackStatus = (data) => {
    if (this.props.selectedPack?.productId !== data?.productId) {
      return false;
    }
    return true;
  };

  checkCurrentplan = (data) => {
    if (this.props.isCurrentPlan && this.props.isCurrentPlan(data)) {
      return true;
    } else {
      return false;
    }
  };

  render() {
    const { data, history, currentSubscription } = this.props;
    let [partner] = data.componentList;
    let deviceCount = get(data, "deviceDetails.deviceCount");
    return (
      <React.Fragment>
      {get(data, 'specialOfferVerbiage') && !this.checkCurrentplan(data) && (
        <div className="current-pack-tag">
          {get(data, 'specialOfferVerbiage')}
        </div>)}
      {this.checkCurrentplan(data) && (
        <div className={"current-pack-tag"}>Current plan</div>
      )}
      <div
        id={data?.productId}
        className={`plan-container ${
          this.checkSelectedPackStatus(data) ? "plan-select" : `${!this.checkCurrentplan(data) && "hover"}`
        } ${!isEmpty(get(data,'discountList')) ? 'mb-top' : '' } `}
        onClick={(e)=>!this.checkCurrentplan(data)&&this.props.handlePackSelection(e,data)}
        > 
        {!isEmpty(get(data,'discountList')) && isSubscriptionDiscount(history) &&
        <div className = "save-discount">
          <p>{`Save ${get(data,'discountList')[0].discountValue}%`}</p> 
        </div>    
      } 
        {/* {!get(data, "highlightedPack") && (
          <div className="overlay-shadow"></div>
        )} */}
        {/* {get(data, "elitePlan") && <div className="elite-plan"></div>} */}
        <div className="description-container flex-sb">
          <div className="flex-sb">
            <div className="crown-wrapper">
              <img src={Crown} />
            </div>
            <p
              className={`pack-description ${
                get(data, "highlightedPack") && "pack-highlight"
              }`}
            >
              {data?.productName}
            </p>
          </div>
          <div className ="discount-amount-container">
          {!isEmpty(get(data,'discountList')) && isSubscriptionDiscount(history) &&
          <div className='discount-amount'>
          <span
          dangerouslySetInnerHTML={{ __html: data?.rupeesSymbol  }}/>
          <span>{get(data,"amountValue")?.split(".")[0]}</span>
          </div>
           }
            <div className="radio-wrapper">
              <span
                dangerouslySetInnerHTML={{ __html: data?.rupeesSymbol}}
              />
              <span>
                {(isSubscriptionDiscount(history) && get(data,"amountDiscountValue")?.split(".")[0]) ? 
                (get(data,"amountDiscountValue")?.split(".")[0])
                : get(data,"amountValue")?.split(".")[0]}
              </span>
              <span>{`/${get(data,"packCycle")}`}</span>
              {!this.checkCurrentplan(data) && (
                <RadioButton
                  id={data.productId}
                  name={data.productId}
                  value={data.productId}
                  showLabel={false}
                  checked={this.checkSelectedPackStatus(data)}
                  chandler={(e) => this.props.handlePackSelection(e, data)}
                />
              )}
            </div>
          </div>
        </div>
        <div className="device-details flex-sb">
          <div className="mobile-wrapper flex-sb">
          <div>
            <img
              src={get(data, "deviceDetails.url")}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ErrorImage;
              }}
            />
            </div>
            <p className="pack-description">
              {get(data, "deviceDetails.platformName")}
            </p>
          </div>
          <p className="app-count">{deviceCount ? <span>{`${get(partner, "numberOfApps")}  | ${deviceCount}`}</span> : <span>{`${get(partner, "numberOfApps")}`}</span>}</p>
        </div>
        <div className="partner-container">
          {this.partnerDetails(data.componentList)}
        </div>
        {get(data, "sunnextFooterMessage") && (
          <p className="sunnext-msg">{`${get(
            data,
            "sunnextFooterMessage"
          )}`}</p>
        )}{" "}
         {get(data, "launchOfferVerbiage") && get(data, "nammaFlixVerbiage") &&  (
          <p className={`packFooterMessage ${!get(data, "sunnextFooterMessage") && "mb-pack"}`}>
            {<b>{get(data,"launchOfferVerbiage" )}</b>}
            {get(data,"nammaFlixVerbiage")}
            </p>
        )}
        {get(data, "packFooterMessage") && (
          <p className={`packFooterMessage ${!get(data, "sunnextFooterMessage") && "mb-pack"}`}>{`${get(
            data,
            "packFooterMessage"
          )}`}</p>
        )}
        {get(data, "deviceDetails.mxPlatformName") && (
          <p className={`packFooterMessage ${!get(data, "deviceDetails.mxPlatformName") && "mb-pack"}`}>{`${get(
            data,
            "deviceDetails.mxPlatformName"
          )}`}</p>
        )}
      </div>
      </React.Fragment>
    );
  }
}
PlanCard.propTypes = {
  data: PropTypes.object,
  modalStatus: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  modalStatus: get(state.modal, "showModal"),
  currentSubscription: get(state.subscriptionDetails, "currentSubscription.data"),
});

const mapDispatchToProps = {};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(PlanCard);