import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { get, isEmpty } from "lodash";
import { openPopup, closePopup } from "@common/Modal/action";
import { hideFooter } from "@src/action";

import { cloudinaryCarousalUrl } from "@utils/common";

import { SUBSCRIPTION_STATUS } from "../APIs/constant";
import { getComponentList, isPrimeVisible } from '../APIs/subscriptionCommon';
import { getCurrentSubscriptionInfo, revokeSubscription } from "../APIs/action";
import PrimePack from '../PrimePack';

import "./style.scss";
import { isMobile } from "@utils/common";

class ComboPlans extends Component {

    componentDidMount = async () => {
        const {
            hideFooter, currentSubscription, getCurrentSubscriptionInfo,
        } = this.props;
        hideFooter(true);
    };

    componentWillUnmount = () => {
        this.props.hideFooter(false);
    }

    renderPartnerImage = (imgData) => {
        let placeholderImg = "../../../assets/images/image-placeholder-app-rail.png";
        return (
            <div className="content-wrapper">
                <img
                    src={`${cloudinaryCarousalUrl("", "", 120, 120)}${imgData.iconUrl}`}
                    alt=""
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImg;
                        e.target.className = "broken-image";
                    }}
                />
            </div>
        );
    };

    render() {
        let { currentSubscription, showAddOnCancel, handleBingeCancelPlan } = this.props;
        currentSubscription = get(currentSubscription, 'data');
        let partnerList, numberOfApps, isSubscriptionExpired, componentList;
        if (!isEmpty(currentSubscription)) {
            componentList = getComponentList(currentSubscription);
            partnerList = componentList?.partnerList;
            numberOfApps = componentList?.numberOfApps;
            isSubscriptionExpired = currentSubscription?.subscriptionStatus?.toUpperCase() === SUBSCRIPTION_STATUS.DEACTIVE;
        }
        let notMobileAndisNetFlixCombo = (!(!!isMobile.any()) && get(currentSubscription, "netflixCombo"))
        return (
            <React.Fragment>
                {
                    !isEmpty(currentSubscription) ?
                        <div className="myplan-bgimage-container-combo combo-plan">
                            <div className={`my-plans-wrapper ${notMobileAndisNetFlixCombo && 'netflix-full-width'}`}>
                                <h3>My Plan</h3>
                                <div className={`product-name ${notMobileAndisNetFlixCombo && 'netflix-730-width'}`}>
                                    <div>{get(currentSubscription, "productName")}</div>
                                    {!(!!isMobile.any()) && <div className={`product-name-price`}>
                                        <span
                                            dangerouslySetInnerHTML={{ __html: get(currentSubscription, 'amount')?.split(';')[0] }}
                                        />
                                        {get(currentSubscription, 'amount')?.split(';')[1]}
                                    </div>
                                    }
                                </div>
                                <div className="inline-center">
                                    {(!!isMobile.any()) && <div className={`product-name-price`}>
                                        <span
                                            dangerouslySetInnerHTML={{ __html: get(currentSubscription, 'amount')?.split(';')[0] }}
                                        />
                                        {get(currentSubscription, 'amount')?.split(';')[1]}
                                        <span className="renewal-text">
                                        </span>
                                    </div>
                                    }
                                    <div className={`product-name-price ${notMobileAndisNetFlixCombo && 'netflix-730-width'}`}>
                                        {!(!!isMobile.any()) && get(currentSubscription, 'packValidity')}
                                    </div>
                                    <span className={`renewal-text`}>
                                        {!!isMobile.any() && get(currentSubscription, 'packValidity')}
                                    </span>
                                </div>
                                <div className={`my-plans-container ${notMobileAndisNetFlixCombo && 'netflix-width'} && ${isSubscriptionExpired ? 'expired' : ''}`}>
                                    <div className={`${notMobileAndisNetFlixCombo && 'netflix-width-for-partner-list'}`}>
                                        <div className="my-plans-heading">
                                            <div
                                                className={`right-heading ${get(currentSubscription, "highlightedPack") && 'active'}`}>
                                                <React.Fragment>
                                                    <span className="apps-count">{numberOfApps}</span>
                                                </React.Fragment>
                                            </div>
                                        </div>
                                        <div className="partner-container">
                                            {partnerList &&
                                                partnerList.map((imgData) => (
                                                    <React.Fragment key={imgData.partnerId}>
                                                        {this.renderPartnerImage(imgData)}
                                                    </React.Fragment>
                                                ))}
                                        </div>
                                        <div className="partner-desc">
                                            {get(currentSubscription, "partnerDesc")}
                                        </div>
                                    </div>
                                    <div className="border-image-plus">
                                        <hr className="border-line" />
                                        <img src='../../../assets/images/combo_plus.svg' className="first-img" />
                                    </div>
                                    <div className={`${notMobileAndisNetFlixCombo && 'd-flex center'}`}>
                                        {get(currentSubscription, "netflixCombo") &&
                                            <div className="netflix-container">
                                                <div className="netflix-sub-conatiner">
                                                    <div className="card-image">
                                                        <img src={get(currentSubscription, "netflixData.imageUrl")} alt="netflix-icon" />
                                                    </div>
                                                    <div className="card-text">
                                                        <p>{get(currentSubscription, "netflixData.deviceVerbiage")}</p>
                                                    </div>
                                                </div>
                                                <div className="nextflix-sub-title">
                                                    <p>{get(currentSubscription, "netflixData.verbiage")}</p>
                                                </div>

                                            </div>
                                        }
                                    </div>
                                    {
                                        get(currentSubscription, "netflixCombo") &&
                                        <div className="border-image-plus">
                                            <hr className="border-line" />
                                            <img src='../../../assets/images/combo_plus.svg' />
                                        </div>
                                    }
                                    <div>
                                        <div className="channels-view">
                                            <span className="ottchanels">{get(currentSubscription, "comboInfo.ottChannels")}</span>
                                            <span>
                                                <span className="lg-d-grid">
                                                    {currentSubscription?.comboInfo?.channels.map((channel) => {
                                                        return (
                                                            <span className="lg-mt-29">
                                                                <span className="channel-name">
                                                                    {channel.name}
                                                                </span>
                                                                <span className="channel-count">
                                                                    {channel.count}
                                                                </span>
                                                            </span>
                                                        )
                                                    })}
                                                </span>
                                            </span>
                                        </div>
                                        {isMobile.any() && <div className="comboinfo-verbiage">{get(currentSubscription, "comboInfo.verbiage")}</div>}
                                    </div>
                                </div>
                                {!isMobile.any() && <div className={!notMobileAndisNetFlixCombo ? "comboinfo-verbiage" : "comboinfo-verbiage net-flix-comboinfo-verbiage"}>{get(currentSubscription, "comboInfo.verbiage")}</div>}
                                <div className="footer-text-container">

                                    <div className="footer-text-first">{get(currentSubscription, "comboInfo.footerVerbiageFirst")} </div>
                                    <div className="footer-text-second">{get(currentSubscription, "comboInfo.footerVerbiageSecond")} </div>
                                </div>
                            </div>
                            {isPrimeVisible() &&
                                <PrimePack
                                    showAddOnCancel={showAddOnCancel}
                                    handleBingeCancelPlan={handleBingeCancelPlan} />
                            }
                        </div> : null
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription'),
        planOption: get(state.subscriptionDetails, "currentSubscription.data.planOption"),
        revokeSubscriptionRes: get(state.subscriptionDetails, 'revokeSubscriptionRes'),
        primePackDetails: get(state.subscriptionDetails, "currentSubscription.data.primePackDetails"),
    };
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                openPopup,
                closePopup,
                hideFooter,
                getCurrentSubscriptionInfo,
                revokeSubscription,
            },
            dispatch,
        ),
    };
}

ComboPlans.propTypes = {
    hideFooter: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    getCurrentSubscriptionInfo: PropTypes.func,
    currentSubscription: PropTypes.object,
    planOption: PropTypes.object,
    revokeSubscription: PropTypes.func,
    history: PropTypes.object,
    switchToPackSelection: PropTypes.func,
    revokeSubscriptionRes: PropTypes.object,
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(ComboPlans);
