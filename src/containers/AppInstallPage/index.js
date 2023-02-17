import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import TagManager from 'react-gtm-module';

import {hideFooter, hideHeader, hideSplash} from "@src/action";

import './style.scss';
import PropTypes from "prop-types";
import {withRouter} from 'react-router';
import {isMobile, isUserloggedIn, redirectToAppStore} from "@utils/common";
import get from "lodash/get";

import logoImage from '@assets/images/login-page-logo.png';
import GooglePlayStore from '@assets/images/google-play-badge.png';
import AppStore from '@assets/images/apple-store-badge.png';
import {URL} from "@routeConstants";
import {getAppInstallDetails} from './APIs/action';
import {PLAY_STORE_URL} from "@constants";
import ENV_CONFIG from '@config/environment/index';


class AppInstallPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isForAdvertisement: false,
        }
    }

    componentDidMount() {
        let {hideHeader, hideFooter, location: {pathname}, history} = this.props;
        hideHeader(true);
        hideFooter(true);
        const urlArr = pathname.split('/');

        const tagManagerArgs = {
            gtmId: ENV_CONFIG.GTM_ID,
        }
        typeof document !== "undefined" && urlArr[1] === URL.APP_INSTALL && TagManager.initialize(tagManagerArgs);

        if (isMobile.any()) {
            this.loadHandler();
        } else {
            if (urlArr[1] === URL.APP_INSTALL) {
                history.push(`/${URL.BEST_VIEW_MOBILE}`);
            } else {
                window.location.href = "https://www.tatasky.com/binge/tata-sky-binge-prime";
            }
        }
    };

    componentWillUnmount() {
        let {hideHeader, hideFooter} = this.props;
        hideHeader(false);
        hideFooter(false);
    }

    loadHandler = () => {
        const isLogin = isUserloggedIn();
        let {hideHeader, hideFooter, getAppInstallDetails} = this.props;
        if (!isLogin && !isMobile.any()) {
            hideHeader();
            hideFooter();
        }

        let {location: {pathname}} = this.props;
        const urlArr = pathname.split('/');
        if ([URL.APP_INSTALL, URL.APP_INSTALL_2].includes(urlArr[1])) {
            this.setState({
                isForAdvertisement: true,
            }, async () => {
                if (urlArr[1] === URL.APP_INSTALL) {
                    await getAppInstallDetails();
                    isMobile.any() ? redirectToAppStore() : history.push(`/${URL.BEST_VIEW_MOBILE}`);
                }
            })
        }
    };

    render() {
        let {isForAdvertisement} = this.state;
        let {appInstallDetails, location: {pathname}} = this.props;
        const urlArr = pathname.split('/');
        return (
            isMobile.any() ?
                <div className="page-not-found">
                    <div className="pnf-border-top"/>
                    <div className={`page-not-found-bg ${!isForAdvertisement && 'show-bg-img'}`}>
                        <div className={`pageNotFound-content ${!isForAdvertisement && 'show-bg-color'}`}>
                            <img className={`logo ${isForAdvertisement && 'for-app-install'}`}
                                 src={logoImage} alt="logo"/>
                            {!isForAdvertisement && <h1>Coming Soon</h1>}
                            <p>{get(appInstallDetails, 'description', 'Unlimited entertainment from your favorite premium apps.')}</p>
                            {
                                urlArr[1].includes(URL.APP_INSTALL_2) ?
                                    <div className={`download-section ${isForAdvertisement && 'for-app-install'}`}>
                                        <a>
                                            <img src={GooglePlayStore} alt="google-play-store"/>
                                        </a>
                                        <a>
                                            <img src={AppStore} alt="app-store"/>
                                        </a>
                                    </div> :
                                    <div
                                        className={`download-section ${isForAdvertisement && 'for-app-install app-install-block'}`}>
                                        <a href={get(appInstallDetails, 'play_store', PLAY_STORE_URL.ANDROID)}
                                           target="_blank" rel="noreferrer">
                                            <img src={GooglePlayStore} alt="google-play-store"/>
                                        </a>
                                        <a href={get(appInstallDetails, 'app_store', PLAY_STORE_URL.IOS)}
                                           target="_blank" rel="noreferrer">
                                            <img src={AppStore} alt="app-store"/>
                                        </a>
                                    </div>

                            }
                        </div>
                    </div>
                    <div className="pnf-border-bottom"/>
                </div> :
                null
        )
    }
}

const mapStateToProps = (state) => {
    return {
        header: get(state.commonContent, 'header'),
        footer: get(state.commonContent, 'footer'),
        appInstallDetails: get(state.AppInstallPageDetails, 'appInstallDetails'),
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        hideHeader,
        hideFooter,
        hideSplash,
        getAppInstallDetails,
    }, dispatch)
);

AppInstallPage.propTypes = {
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    hideSplash: PropTypes.func,
    header: PropTypes.bool,
    footer: PropTypes.bool,
    history: PropTypes.object,
    location: PropTypes.object,
    appInstallDetails: PropTypes.object,
    getAppInstallDetails: PropTypes.func,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppInstallPage));