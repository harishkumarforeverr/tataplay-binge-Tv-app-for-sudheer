import React, {Component} from "react";
import PropTypes from "prop-types";

import TopMenuBar from './TopMenuBar';
import BottomMenuBar from './BottomMenuBar';

import "./style.scss";
import {handleOverflowOnHtml, isMobile} from "@utils/common";

class AccountSideMenuBar extends Component {

    closeMenu = (e) => {
        if (!e.target?.offsetParent?.className?.includes('nav-menu')) {
            this.props.onClose();
        }
        handleOverflowOnHtml(true);
    };

    render() {
        const {
            isMenuOpen,
            onClose,
            menuListOptions,
            profileDetails,
            isExpired,
            onLoginClick,
            dimensions,
            currentSubscription,
            configResponse,
            isHideDownloadHeader,
            history,
        } = this.props;
        return (
            <div className={isMenuOpen ? 'side-bar-overlay' : ''} onClick={(e) => this.closeMenu(e)}>
                <div className={`nav-menu ${isMenuOpen ? 'nav-menu-active' : 'nav-menu-inactive'} ${!isHideDownloadHeader && isMobile.any() && 'nav-top-header'}`}>
                    <TopMenuBar
                        history={history}
                        onClose={onClose}
                        profileDetails={profileDetails}
                        onLoginClick={onLoginClick}
                        currentSubscription={currentSubscription}
                        configResponse={configResponse}
                    />
                    <BottomMenuBar
                        dimensions={dimensions}
                        isExpired={isExpired}
                        menuListOptions={menuListOptions}
                        showContactDetails={true}
                        onClose={onClose}
                        onLoginClick={onLoginClick}
                        isMenuOpen={isMenuOpen}
                    />
                </div>
            </div>
        )
    }
}

AccountSideMenuBar.propTypes = {
    isMenuOpen: PropTypes.bool,
    menuListOptions: PropTypes.array,
    onClose: PropTypes.func,
    profileDetails: PropTypes.object,
    isExpired: PropTypes.bool,
    onLoginClick: PropTypes.func,
    dimensions: PropTypes.object,
    currentSubscription: PropTypes.object,
    configResponse: PropTypes.object,
    isHideDownloadHeader: PropTypes.bool,
    history: PropTypes.object,
}

export default AccountSideMenuBar;
