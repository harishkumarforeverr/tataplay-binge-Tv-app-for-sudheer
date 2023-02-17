import React from "react";
import whatsappImage from "@assets/images/whatapp.png";
import PropTypes from "prop-types";
import {bindActionCreators, compose} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import {withRouter} from "react-router";
import {
    getAnalyticsSource,
    getContentLanguage,
    getPrimaryLanguage,
    isFreeContentEvent,
    isFreeContentMixpanel,
    isMobile,
    isUserloggedIn,
    loginInFreemium,
    showToast,
} from "@utils/common";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import {CONTENTTYPE, MESSAGE, MINI_SUBSCRIPTION, PARTNER_SUBSCRIPTION_TYPE} from "@constants";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@utils/constants";
import {fireProductLandingCtasEvent, getParentContentData} from "@containers/PIDetail/PIDetailCommon";
import firebase from "@constants/firebase";
import {closePopup, openPopup} from "@common/Modal/action";
import {openLoginPopup} from "@containers/Login/APIs/actions";
import DATALAYER from "@utils/constants/dataLayer";

class ActionButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updatedId: '',
            addedInBingeList: false,
        }
    }

    componentDidMount() {
        let { updatedId } = getParentContentData(this.props.meta);
        this.setState({ updatedId });
        if(this.checkIsFav(updatedId)) {
            this.setState({
                addedInBingeList: true
            })
        } else {
            this.setState({
                addedInBingeList: false
            })
        }
    }

    onShareClickHandler = () => {
        let data = window.location.href;
        if (isMobile.any()) {
            window.navigator.share({ url: data })
        } else {
            navigator.clipboard.writeText(data);
            showToast(MESSAGE.SHARE_URL_MESSAGE);
        }
        fireProductLandingCtasEvent(this.props.commonProps?.meta, DATALAYER.VALUE.SHARE)
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SHARE_CLICK, this.trackAnalyticsData(MIXPANEL),);
    };

    trackAnalyticsData = (analytics = MIXPANEL) => {
        const { meta = {}, mixpanelData } = this.props.commonProps;
        let { location, currentSubscription } = this.props
        let searchParams = new URLSearchParams(location.state);
        // let searchParams = new URLSearchParams(location.state);
        const source = searchParams.get("source");
        const RailPosition = searchParams.get("railPosition");
        const sectionSource = searchParams.get("sectionSource");
        const contentSectionSource = searchParams.get("contentSectionSource");
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let { updatedContentType } = getParentContentData(this.props.meta);
        if (updatedContentType === CONTENTTYPE.TYPE_MOVIES) {
            updatedContentType = CONTENTTYPE.TYPE_MOVIE
        }
        let partnerInfo = JSON.parse(getKey(LOCALSTORAGE.PARTNER_INFO)) || [];
        const contentAuth = (isFreeContentEvent(meta.contractName, partnerInfo, meta.partnerId, currentSubscription?.subscriptionStatus) || (meta.partnerSubscriptionType.toLowerCase() === PARTNER_SUBSCRIPTION_TYPE.PREMIUM.toLowerCase()))
        let parentTitle =
            meta.contentType === CONTENTTYPE.TYPE_MOVIES
                ? meta.vodTitle
                : meta.brandTitle || meta.seriesTitle || meta.vodTitle || meta.title;
        let title = meta.contentType === CONTENTTYPE.TYPE_MOVIES
            ? meta.vodTitle
            : meta.title || meta.brandTitle || meta.vodTitle || meta.seriesTitle;
        let isFreeContent = isFreeContentMixpanel(meta);
        return {
            [`${analytics.PARAMETER.PAGE_NAME}`]: getAnalyticsSource(this.props.location.pathname),
            [`${analytics.PARAMETER.CONTENT_TITLE}`]: title,
            [`${analytics.PARAMETER.CONTENT_GENRE}`]: meta?.genre?.join(),
            [`${analytics.PARAMETER.CONTENT_GENRE_PRIMARY}`]: meta?.genre[0] || "",
            [`${analytics.PARAMETER.CONTENT_RATING}`]: meta.rating,
            [`${analytics.PARAMETER.CONTENT_LANGUAGE}`]: getContentLanguage(meta?.audio) || "",
            [`${analytics.PARAMETER.CONTENT_LANGUAGE_PRIMARY}`]: getPrimaryLanguage(meta?.audio) || "",
            [`${analytics.PARAMETER.PARTNER_NAME}`]: meta.provider,
            [`${analytics.PARAMETER.RAIL_TITLE}`]: mixpanelData.railTitle || "",
            [`${analytics.PARAMETER.SOURCE}`]: source || "",
            [`${analytics.PARAMETER.CONTENT_AUTH}`]: contentAuth ? MIXPANEL.VALUE.YES : MIXPANEL.VALUE.NO,
            [`${analytics.PARAMETER.RELEASE_YEAR}`]: meta.releaseYear || "",
            [`${analytics.PARAMETER.FREE_CONTENT}`]: isFreeContent,
            [`${analytics.PARAMETER.DEVICE_TYPE}`]: MIXPANEL.VALUE.WEB,
            [`${analytics.PARAMETER.ACTOR}`]: meta?.actor?.join() || "",
            [`${analytics.PARAMETER.PACK_NAME}`]: currentSubscription?.productName,
            [`${analytics.PARAMETER.PACK_PRICE}`]: Math.round(currentSubscription?.amountValue),
            [`${analytics.PARAMETER.RAIL_POSITION}`]: RailPosition,
            [`${analytics.PARAMETER.RAIL_CATEGORY}`]: this.props.railCategory,
            [`${analytics.PARAMETER.RAIL_TYPE}`]: sectionSource,
            [`${analytics.PARAMETER.CONTENT_TYPE}`]: contentSectionSource,//sectionSource,
            [`${analytics.PARAMETER.CONTENT_CATEGORY}`]: updatedContentType,
            [`${analytics.PARAMETER.CONTENT_POSITION}`]: mixpanelData.conPosition,
            [`${analytics.PARAMETER.CONTENT_PARENT_TITLE}`]: parentTitle,
            [`${analytics.PARAMETER.LIVE_CONTENT}`]: MIXPANEL.VALUE.NO,//userInfo.autoPlayTrailer,
            [`${analytics.PARAMETER.CONTENT_PARTNER}`]: meta?.provider || "",
        };
    };

    onWhatsAppClick = () => {
        let sendData = isMobile.any() ? `https://api.whatsapp.com/send/?text=Please Visit ${window.location.href}` : `https://web.whatsapp.com/send?text= Please Visit ${window.location.href}`;
        window.open(sendData, "_blank");
        fireProductLandingCtasEvent(this.props.commonProps?.meta, DATALAYER.VALUE.WHATSAPP)
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.WHATSAPP_SHARE_CLICK, this.trackAnalyticsData(MIXPANEL));
    };

    addRemoveBingeList = async () => {
        fireProductLandingCtasEvent(this.props.commonProps?.meta, DATALAYER.VALUE.BINGE_LIST);
        if (isUserloggedIn()) {
            await this.props.changeText();
            if (this.checkIsFav(this.state.updatedId)) {
                showToast(MESSAGE.REMOVE_FROM_BINGE_LIST);
                this.setState({
                    addedInBingeList: false
                });
            } else {
                showToast(MESSAGE.ADDED_TO_BINGE_LIST);
                this.setState({
                    addedInBingeList: true
                });
            }
        } else {
            const { openPopup, closePopup, openLoginPopup } = this.props;
            await loginInFreemium({
                openPopup, closePopup, openLoginPopup,
                source: firebase.VALUE.PLAY_CLICK,
                getSource: firebase.VALUE.PLAYBACK,
                ComponentName: MINI_SUBSCRIPTION.LOGIN,
            });
        }
    }

    checkIsFav = (contentId) => {
        const watchListId = JSON.parse(getKey(LOCALSTORAGE.WATCHLIST));
        return watchListId?.includes(parseInt(contentId));
    };

    render() {
        let { id } = this.props.match.params;
        let result = id.split("?");
        return (
            <>
                <div className="movieButtonRight">
                    <div className="movieBlock">
                        <div onClick={() => this.addRemoveBingeList()} className="movieButtonContainer">
                            <i className={this.state.addedInBingeList ? "icon-check imagesBlock" : "icon-plus imagesBlock"}
                            />
                            <span
                                className="textBlock">{MESSAGE.ADD_TO_BINGE_LIST}</span>
                        </div>
                        <div onClick={this.onWhatsAppClick} className="movieButtonContainer">
                            <img className="imagesBlock" src={whatsappImage} alt="" />
                            <span className="textBlock">Whatsapp</span>
                        </div>
                        <div onClick={this.onShareClickHandler} className="movieButtonContainer">
                            <i className="icon-share2 imagesBlock" />
                            {/* <img className='imagesBlock' src={shareImage} alt='' /> */}
                            <span className="textBlock">Share</span>
                        </div>
                    </div>
                </div>
                <div className="mobile-border-bottom" />
            </>
        )
    }
}

ActionButton.propTypes = {
    onClickShare: PropTypes.func,
    changeText: PropTypes.func,
    onClickWhatsapp: PropTypes.func,
    favorite: PropTypes.bool,
    meta: PropTypes.object,
    title: PropTypes.string,
};

const mapStateToProps = (state) => ({
    meta: get(state.PIDetails.data, "meta"),
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            openPopup,
            closePopup,
            openLoginPopup,
        }, dispatch),
    }
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(ActionButton)