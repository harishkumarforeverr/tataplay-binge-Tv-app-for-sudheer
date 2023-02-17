import React, {Component} from 'react';
import NetworkAvailabilityModal from '@components/NetworkAvailabilityModal';
import {hideMainLoader, isLandscapeMode} from "@src/action";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import PropTypes from "prop-types";
import {LOCALSTORAGE, SCREEN_ORIENTATION} from "@constants/index";
import {getKey} from "@utils/storage";
import {URL} from "@constants/routeConstants";
import {MODALS} from "@common/Modal/constants";
import {openPopup, closePopup} from "@common/Modal/action";
import {isMobile} from "@utils/common";
import { withRouter } from 'react-router';
export default function (ComposedComponent) {
    class NetworkDetector extends Component {
        state = {
            isDisconnected: false,
            screenOrientation: SCREEN_ORIENTATION.PORTRAIT,
        };

        componentDidMount() {
            if (!window.location.search.includes("?details")) {
                this.handleConnectionChange();
                if(isMobile.any()) {
                    this.orientationChange();
                    window.addEventListener("orientationchange", this.orientationChange);
                }
                window.addEventListener('online', this.handleConnectionChange);
                window.addEventListener('offline', this.handleConnectionChange);
            }
        }

        componentDidUpdate(previousProps, previousState) {
            let { isDisconnected, screenOrientation } = this.state;
            if(isDisconnected !== previousState.isDisconnected){
                !isDisconnected && window.location.reload();
            }
            if(isMobile.any()) {
                if(screenOrientation !== previousState.screenOrientation) {
                    this.orientationChange();
                }
            }
            if (this.props.location.pathname !== previousProps.location.pathname) {
                this.orientationChange();
            }
        }

        componentWillUnmount() {
            window.removeEventListener('online', this.handleConnectionChange);
            window.removeEventListener('offline', this.handleConnectionChange);
            isMobile.any() && window.removeEventListener('orientationchange', this.orientationChange);
        }
        allowHorizontalOrientation=()=>{
            const pathname = this.props?.location?.pathname
          return pathname.includes(`/${URL.PLAYER}`) || pathname.includes(`/${URL.TRAILER}`)
        }
        orientationChange = (event) => {
            let orientationAngle;
            const {modal, openPopup, isLandscapeMode} = this.props;
            if(event && event.target.screen.orientation) {
                orientationAngle = event.target.screen.orientation.angle;
            }
            else {
                orientationAngle = window.orientation;
            }
            if (!this.allowHorizontalOrientation() && (orientationAngle === 90 || orientationAngle === 270 || (orientationAngle === -90))) {
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal',
                    headingMessage: `Please rotate your device`,
                    hideCloseIcon: true,
                    instructions: "Please go back to portrait mode for the best experience",
                    isCloseModal: false,
                    deviceRotationPopup: true,
                });
                this.setState({screenOrientation: SCREEN_ORIENTATION.LANDSCAPE});
                isLandscapeMode(true)

            }
            else if (orientationAngle === 0) {
                this.setState({screenOrientation: SCREEN_ORIENTATION.PORTRAIT});
                this.handleConnectionChange();
                if(event && navigator.onLine && modal?.modalParameters?.deviceRotationPopup) {
                    this.props.closePopup();
                }
                isLandscapeMode(false)
            }
        }

        handleConnectionChange = () => {
            const condition = navigator.onLine ? 'online' : 'offline';
            if (condition === 'online') {
                this.setState({isDisconnected: false});
            }
            else if ('offline') {
                this.props.hideMainLoader();
                this.setState({isDisconnected: true});
            }
        };

        render() {
            const {isDisconnected, screenOrientation} = this.state;
            const currentPath = getKey(LOCALSTORAGE.CURRENT_PATH);
            const IGNORE_DISCONNECT_URLS = [
                URL.PLAYER,
                URL.TRAILER,
            ];
            const showNetAvailablityModal = !IGNORE_DISCONNECT_URLS.some((url) => currentPath?.toLowerCase().includes(url));
            const SHOW_RETRY_POPUP_URLS = [];
            const networkRetry = SHOW_RETRY_POPUP_URLS.some((url) => currentPath?.toLowerCase().includes(url));
            return (
                <div>
                    {isDisconnected && showNetAvailablityModal && screenOrientation === SCREEN_ORIENTATION.PORTRAIT &&
                    (<NetworkAvailabilityModal networkRetry={networkRetry}/>)
                    }
                    <ComposedComponent {...this.props} />
                </div>
            );
        }
    }

    const mapDispatchToProps = (dispatch) => (
        bindActionCreators({
            hideMainLoader,
            openPopup,
            closePopup,
            isLandscapeMode
        }, dispatch)
    );

    NetworkDetector.propTypes = {
        hideMainLoader: PropTypes.func,
        location: PropTypes.object,
        openPopup: PropTypes.func,
        closePopup: PropTypes.func,
        modal: PropTypes.object,
        isLandscapeMode:PropTypes.func
    };

    const mapStateToProps = state => ({
        modal: state.modal,
    });

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(NetworkDetector));
}
