import React, {Component} from "react";
import PropTypes from "prop-types";
import {isUserloggedIn, getIconInfo, isMobile, safeNavigation,} from "@utils/common";
import UnknownUser from "@assets/images/profile-avatar-white.png";
import "./style.scss";
import get from "lodash/get";
import {URL} from "@routeConstants";
import {LOCALSTORAGE} from "@utils/constants";
import {getKey} from "@utils/storage";
import {isEmpty} from "lodash";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";

class TopMenuBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showAvatarImage: false,
            brokenImage: false,
        }
    }

    componentDidMount() {
        this.setAvatarFlag();
    }

    setAvatarFlag = () => {
        let {profileDetails} = this.props;
        this.setState({
            showAvatarImage: !get(profileDetails, "profileImage")
        })
    };

    handleBrokenImage = () => {
        this.setState({
            showAvatarImage: true,
            brokenImage: true,
        })
    };

    editProfileClick = () => {
        const {onClose, history} = this.props;
        safeNavigation(history, `/${URL.SETTING}/${URL.PROFILE}`);
        !!isMobile.any() && onClose();
    }

    showProfileImage = () => {
        const isLogin = isUserloggedIn();
        let {configResponse, profileDetails} = this.props;
        const {showAvatarImage, brokenImage} = this.state;
        let imgUrl = `${get(configResponse, 'data.config.subscriberImage.subscriberImageBaseUrl')}${get(profileDetails, "profileImage")}`
        if (isLogin) {
            return (
                configResponse && profileDetails?.profileImage ?
                    <span className={'img-section profile-avatar-wrapper'} onClick={() => this.editProfileClick()}>
                        {
                            get(profileDetails, 'profileImage') && !brokenImage &&
                            <div className={`profile-img-section`}>
                                <span className="profile-img add-border">
                                    <img alt=""
                                         src={imgUrl}
                                         onError={this.handleBrokenImage}/>
                                </span>
                            </div>
                        }
                        {
                            brokenImage && this.showProfileAvatar()
                        }
                        {/* {
                            (!get(profileDetails, 'profileImage') || showAvatarImage) &&
                            <div className={'avatar-block'}>
                                <p>{get(profileDetails, 'firstName', '*').charAt(0)}</p>
                            </div>
                        }*/}
                    </span> : this.showProfileAvatar()
            )
        } else {
            return this.showProfileAvatar();
        }
    }

    showProfileAvatar = () => {
        return (
            <span className="profile-avatar-wrapper" onClick={() => this.editProfileClick()}>
                <img src={UnknownUser} alt="unknown-user-avatar"/>
            </span>
        )
    }

    handleLogin = () => {
        const {onLoginClick, onClose} = this.props;
        onLoginClick();
        !!isMobile.any() && onClose();
        dataLayerConfig.trackEvent(DATALAYER.EVENT.LOGIN_HEADER);
    }

    getUserName = () => {
        let {profileDetails} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        if (get(profileDetails, 'firstName') && get(profileDetails, 'lastName')) {
            return `${profileDetails?.firstName} ${profileDetails?.lastName}`;
        } else if (get(profileDetails, 'firstName') && !get(profileDetails, 'lastName')) {
            return `${profileDetails?.firstName}`;
        } else if (!get(profileDetails, 'firstName') && get(profileDetails, 'lastName')) {
            return `${profileDetails?.lastName}`;
        } else if (get(userInfo, 'firstName') && get(userInfo, 'lastName')) {
            return `${userInfo?.firstName} ${userInfo?.lastName}`;
        } else if (get(userInfo, 'firstName') && !get(userInfo, 'lastName')) {
            return `${userInfo?.firstName}`;
        } else if (!get(userInfo, 'firstName') && get(userInfo, 'lastName')) {
            return `${userInfo?.lastName}`;
        }
    }

    showLoginDetail = () => {
        const isLogin = isUserloggedIn();
        const {currentSubscription, profileDetails} = this.props;
        if (isLogin) {
            let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
            const userName = this.getUserName();
            const aliasName = !isEmpty(profileDetails) ? profileDetails?.aliasName : userInfo?.aliasName;
            const userRmn = !isEmpty(profileDetails) ? profileDetails?.rmn : userInfo?.rmn
            return (
                <span className="logged-in-user-detail">
                    {userName && <div className="login-text">{userName}</div>}
                    {userRmn && <div className="user-detail user-rmn-detail">+91 {userRmn}</div>}
                    <div>
                        {currentSubscription?.subscriptionType && profileDetails?.aliasName &&
                            <img className="binge-asset"
                                 src={getIconInfo(currentSubscription)}
                                 alt={'img'}/>}
                        {aliasName && <span className="user-detail">{aliasName}</span>}
                    </div>
                </span>
            )
        } else {
            return (
                <>
                    <span className="login-text">Login now to access your <br/> account</span>
                    <span onClick={this.handleLogin} className="login-btn">Log In</span>
                </>
            )
        }
    }


    render() {
        return (
            <div className="top-menu-wrapper">
                {this.showProfileImage()}
                {this.showLoginDetail()}
            </div>
        )
    }

}

TopMenuBar.propTypes = {
    onClose: PropTypes.func,
    onLoginClick: PropTypes.func,
    profileDetails: PropTypes.object,
    currentSubscription: PropTypes.object,
    configResponse: PropTypes.object,
    history: PropTypes.object,
}


export default (TopMenuBar)