import React, {Component} from "react";
import {cloudinaryCarousalUrl, getProviderLogo, safeNavigation} from "@utils/common";

import './style.scss';
import {LOCALSTORAGE,LAYOUT_TYPE} from "@constants";
import {withRouter} from "react-router";
import imagePlaceholderPartnerCircular from "@assets/images/image-placeholder-partner-circular.png";
import {getKey} from "@utils/storage";
import PropTypes from "prop-types";
import {URL} from "@constants/routeConstants";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import isEmpty from 'lodash/isEmpty';
import MIXPANEL from "@constants/mixpanel";
import {getDeviceStatus, handleDeviceCancelledUser} from "@utils/cancellationFlowCommon";
import {isMobile, openPopupSubscriptionUpgrade,providerImage} from "../../utils/common";
import {SUBSCRIPTION} from "../PIDetail/API/constant";

class PartnerHomePageBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pageType: '',
            title: '',
            provider: '',
            partnerId: '',
        }
    }

    componentDidMount() {
        let {providerId} = this.props.match.params;
        let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO));
        let data = partnerInfo && partnerInfo.find && partnerInfo.find(i => parseInt(i.partnerId) === parseInt(providerId));
        setTimeout(() => {
            this.setState({
                pageType: data?.pageType,
                title: data?.title,
                provider: data?.provider,
                partnerId: data?.partnerId,
            });
        }, 500);
    }


    addToMySubscription = () => {
        const handleCancelledUser = getDeviceStatus();
        const {currentSubscription, history} = this.props;
        let {partnerId} = this.state;
        const {bingeAccountStatus} = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        let subscribed = false, headingMessage, instructions, errorIcon, primaryBtnText, source = MIXPANEL.VALUE.PARTNER_HOME,
            updatedBingeAccountStatus = currentSubscription?.subscriptionInformationDTO?.bingeAccountStatus ?
            currentSubscription?.subscriptionInformationDTO?.bingeAccountStatus : bingeAccountStatus,
            contentSubsVerbiage = currentSubscription?.verbiage?.contentSubs, meta = {};

        if (handleCancelledUser) {
            handleDeviceCancelledUser(history, true, source);
        } else {
            if (currentSubscription?.providers) {
                subscribed = currentSubscription.providers.some(item => partnerId === parseInt(item.providerId));
            }
            let cancelledLowerPack = (updatedBingeAccountStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE && !subscribed && currentSubscription?.cancelled)

            if (updatedBingeAccountStatus?.toUpperCase() !== ACCOUNT_STATUS.ACTIVE && subscribed) {
                safeNavigation(history, {
                    pathname: `/${URL.PACK_SELECTION}`,
                    search: `?source=${source}&aboutSubscription=true`,
                    state: {subscription: 'recharge', source: source},
                })
            } else if (cancelledLowerPack) {
                headingMessage = contentSubsVerbiage.title;
                errorIcon = 'icon-upgrade1';
                primaryBtnText = SUBSCRIPTION.UPGRADE;
                instructions = contentSubsVerbiage.message;
                meta.partnerId = partnerId;

                openPopupSubscriptionUpgrade({headingMessage, instructions, primaryBtnText, errorIcon, history, meta, source});
            } else {
                //TO DO - Apply dth check if dth active then only take user to pack selection screen - call checkUserDTHStatus() with partnerid and source
                safeNavigation(history, `/${URL.PACK_SELECTION}?partnerId=${partnerId}&source=${source}`);
            }
        }

    }

    render() {
        let {title, provider} = this.state;
        let imageUrl = '';
        let providerLogo = getProviderLogo();
        let {heroBannerItems, currentSubscription} = this.props;

        //let bingeAccountStatus = currentSubscription?.subscriptionInformationDTO?.bingeAccountStatus?.toUpperCase();

        if (providerLogo && Object.entries(providerLogo).length !== 0) {
            let circularLogo = {
                width: 55,
                height: 55,
            };

            if(isMobile.any()) {
                circularLogo = {
                    width: 45,
                    height: 45,
                };
            }
            let url = providerImage(provider, LAYOUT_TYPE.CIRCULAR);
            imageUrl = url ? `${cloudinaryCarousalUrl('', '', circularLogo.width * 3, circularLogo.height * 3)}${url}` : '';
        }

        return (
            <div className={`${isEmpty(heroBannerItems) ? 'partner-home-bar' : 'partner-home-bar with-banner'}`}>
                <div className={`${title && title.length > 12 ? 'big-block' : 'normal-block'} left-block`}>
                    {imageUrl && <div className="partner-logo">
                        {
                            <img src={imageUrl}
                                alt=""
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                    e.target.className = 'broken-image'
                                }} />
                        }
                    </div>}
                    {title && <div className="partner-info">
                        <div className="partner-name">{title}</div>
                    </div>}
                </div>
                {/*<div
                    className={`${title && title.length > 12 ? 'btn-small' : 'btn-normal'} partner-subscribe-btn-section`}>
                    <Button cName="btn primary-btn next" bType="button"
                            bValue={bingeAccountStatus === ACCOUNT_STATUS.WRITTEN_OFF || isEmpty(currentSubscription)
                                ? 'Subscribe to get this App' : 'Upgrade to get this App'}
                            clickHandler={() => this.addToMySubscription()}/>
                </div>*/}
            </div>
        )
    }
}

PartnerHomePageBar.propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    currentSubscription: PropTypes.object,
    heroBannerItems: PropTypes.object,
}

export default withRouter(PartnerHomePageBar)
