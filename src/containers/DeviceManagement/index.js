import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";

import Heading from "@common/Heading";
import { closePopup, openPopup } from "@common/Modal/action";
import { getDeviceId, getLayeredIcon, isMobile, getAnalyticsSource, safeNavigation, scrollToTop, isSubscriptionDiscount } from "@utils/common";
import { MODALS } from "@common/Modal/constants";
import NoDataAvailable from "@common/NoDataAvailable";
import { withRouter } from "react-router";

import {
    getSubscriberDeviceList,
    deleteSubscriberDeviceList,
} from "./APIs/action";
import RadioButton from "../../common/RadioButton";
import "./style.scss";
import { DEVICE_TYPE, LOCALSTORAGE, MENU_LIST } from "@constants";
import { MESSAGES } from "@containers/DeviceManagement/constant";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import moengageConfig from "@utils/moengage";
import { getKey } from "@utils/storage";
import { updateUser, onLoginSuccess, handleLoginClose, notNow } from "@containers/Login/LoginCommon";
import { URL } from "@utils/constants/routeConstants";

class DeviceManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadHandler();
        scrollToTop();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        window.scrollTo(0, 0);
    }

    componentWillUnmount() {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_LISTING_EXIT, {
            [MIXPANEL.PARAMETER.SOURCE]: MIXPANEL.VALUE.DEVICE_MANAGEMENT,
        })
    }

    loadHandler = async () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let { getSubscriberDeviceList, isBeforeLogin, location: { state }, history, pathState } = this.props;
        const checkBeforeLogin = isBeforeLogin || state?.isBeforeLogin;
        const payload = isMobile.any() ? state?.data : pathState?.data;
        await getSubscriberDeviceList(checkBeforeLogin, payload).then(data => {
            const deviceNames = data?.deviceList?.map(device => device.deviceName).join(',');
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.LIST_DEVICES, {
                [MIXPANEL.PARAMETER.SID]: checkBeforeLogin ? payload?.subscriberId : userInfo.sId,
            });
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_LISTING_VIEW, {
                [MIXPANEL.PARAMETER.DEVICE_LIST]: deviceNames,
                [MIXPANEL.PARAMETER.SOURCE]: getAnalyticsSource(this.props.location.pathname),
            })
            moengageConfig.trackEvent(MOENGAGE.EVENT.LIST_DEVICES);
        }).catch(error => {
            if (location?.state?.isBeforeLogin) {
                notNow();
                safeNavigation(history, URL.DEFAULT);
            }
        })
    };

    deleteDevice = async (deviceDetail) => {
        let { openPopup, location, isBeforeLogin, history, closePopup } = this.props;
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_LISTING_REMOVE, {
            [MIXPANEL.PARAMETER.DEVICE]: deviceDetail?.deviceName,
            [MIXPANEL.PARAMETER.SOURCE]: getAnalyticsSource(this.props.location.pathname),
        })
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.REMOVE_DEVICE_POPUP, {
            [MIXPANEL.PARAMETER.SOURCE]: getAnalyticsSource(this.props.location.pathname),
            [MIXPANEL.PARAMETER.DEVICE]: deviceDetail.deviceName,
        })
        const checkisBeforeLogin = isBeforeLogin || location?.state?.isBeforeLogin;
        openPopup(MODALS.ALERT_MODAL, {
            errorIcon:
                deviceDetail && this.checkDeviceType(deviceDetail.deviceType, "delete"),
            modalClass: "device-management-modal",
            headingMessage: `${MESSAGES.REMOVE_DEVICE} ${deviceDetail.deviceName} ?`,
            hideCloseIcon: true,
            primaryButtonText: `${MESSAGES.PRIMARY_BTN_TEXT}`,
            primaryButtonAction: () => {
                this.deleteSubscriberDevice(deviceDetail);
            },
            secondaryButtonText: "Cancel",
            secondaryButtonAction: () => {
                this.cancelDeviceDelete(deviceDetail);
                if(isSubscriptionDiscount(history) || (isMobile.any() && location?.state?.prevPath === `/${URL.SUBSCRIPTION_DISCOUNT}`)){
                    safeNavigation(history, URL.SUBSCRIPTION);
                }else if (checkisBeforeLogin && isMobile.any()) {
                    notNow();
                    isMobile.any() && safeNavigation(history, location?.state?.prevPath);
                }
                else {
                    closePopup();
                }
            },
        });
    };

    cancelDeviceDelete = (deviceDetail) => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let { isBeforeLogin, location: { state }, pathState } = this.props;
        const checkBeforeLogin = isBeforeLogin || state?.isBeforeLogin;
        const payload = isMobile.any() ? state?.data : pathState?.data;
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_REMOVE_SKIP, {
            [MIXPANEL.PARAMETER.SOURCE]: getAnalyticsSource(this.props.location.pathname),
            [MIXPANEL.PARAMETER.SID]: checkBeforeLogin ? payload?.subscriberId : userInfo?.sId,
            [MIXPANEL.PARAMETER.DEVICE]: deviceDetail?.deviceName,
        })
        this.props.closePopup();
    }

    deleteSubscriberDevice = (deviceDetail) => {
        let { deleteSubscriberDeviceList, closePopup, isBeforeLogin, onDeviceRemoved, location, history, selectedPack, pathState } = this.props;
        const checkBeforeLogin = isMobile.any() ? location?.state?.isBeforeLogin : isBeforeLogin;
        const data = isMobile.any() ? location?.state?.data : pathState?.data;
        deleteSubscriberDeviceList(deviceDetail, checkBeforeLogin, data).then((response) => {
            if (response && response?.code === 0) {
                if (checkBeforeLogin) {
                    const source = isMobile.any() ? location?.state?.source : pathState?.source;
                    updateUser(data, onLoginSuccess, history, source, handleLoginClose, selectedPack)
                }
                else {
                    this.loadHandler();
                }
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.REMOVE_DEVICE);
                moengageConfig.trackEvent(MOENGAGE.EVENT.REMOVE_DEVICE);
                mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_REMOVE_CONFIRM,
                    {
                        ...this.deviceConfirmData(MIXPANEL),
                        [MIXPANEL.PARAMETER.DEVICE]: deviceDetail.deviceName
                    });
                moengageConfig.trackEvent(MOENGAGE.EVENT.DEVICE_REMOVE_CONFIRM, this.deviceConfirmData(MOENGAGE));
                closePopup();
            } else {
                console.log('DEVICE REMOVAL FAILED')
            }
        }).catch((error) => {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.DEVICE_REMOVE_ERROR, {
                [MIXPANEL.PARAMETER.SOURCE]: getAnalyticsSource(this.props.location.pathname),
                [MIXPANEL.PARAMETER.DEVICE]: deviceDetail.deviceName,
            })
        })
    };

    deviceConfirmData = (analytics) => {
        return {
            [`${analytics.PARAMETER.SOURCE}`]: getAnalyticsSource(this.props.location.pathname),
        }
    }

    checkDeviceType = (deviceType, action) => {
        if (
            deviceType.toLowerCase() === DEVICE_TYPE.ANDROID ||
            deviceType.toLowerCase() === DEVICE_TYPE.IOS ||
            deviceType.toLowerCase() === DEVICE_TYPE.WEB
        ) {
            if (action === "delete") {
                return "icon-remove-phone-upd";
            }
            if (deviceType.toLowerCase() === DEVICE_TYPE.WEB) {
                return 'icon-web-browser';
            }
            return "icon-mobile-upd";
        } else {
            return "icon-pack-device";
        }
    };

    render() {
        let { subscriberDeviceList, subscriberDeviceData, isBeforeLogin, location, subTitle, history } = this.props;
        let primaryDevices =
            subscriberDeviceList &&
            subscriberDeviceList.filter((item) => item.primary);
        let otherDevices =
            subscriberDeviceList &&
            subscriberDeviceList.filter((item) => !item.primary);
        otherDevices &&
            otherDevices.filter((deviceInfo) => {
                deviceInfo.showDeleteIcon = deviceInfo.deviceNumber !== getDeviceId();
            });
        const checkIsLoginBefore = isBeforeLogin || location?.state?.isBeforeLogin;
        const subHeading = subscriberDeviceData?.removeDeviceVerbiage;

        return (
            <div className={location?.state?.isBeforeLogin ? "device-management-container addPadding " : "device-management-container"} >
                <Heading
                    headingClassName="device-management-heading"
                    heading={MENU_LIST.MANGE_DEVICES}
                />
                <div className="device-management-sub-heading-section">
                    <Heading
                        headingClassName="logged-in"
                        heading={
                            isMobile.any() ? "Logged - in Devices" : "Logged-In Device"
                        }
                        subHeading={checkIsLoginBefore ? subHeading : "You can log into a maximum of 4 devices at a time"}

                    />
                </div>
                {primaryDevices && primaryDevices.length > 0 ? (
                    <div className="device-section">
                        <p className="device-section-head">TV Device</p>
                        {primaryDevices.map((item, index) => {
                            return (
                                <div className="device-container" key={index}>
                                    <div className="device" key={index}>
                                        <div className="device-left">
                                            <i className={this.checkDeviceType(item.deviceType)} />
                                            <span className="device-name">{item.deviceName}</span>
                                        </div>
                                        <div className="device-right device-right-tv">
                                            <span className="delete-device float-right">
                                                <RadioButton checked={true} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="tv-device">
                            <span>This primary device cannot be removed</span>
                            <span className="float-right">
                                {subscriberDeviceData?.largeDeviceFooterMessage}
                            </span>
                        </div>
                    </div>
                ) : null}
                {otherDevices && otherDevices.length && otherDevices.length > 0 && (
                    <div className="device-section">
                        {!checkIsLoginBefore && <p className="device-section-head">Mobile Devices</p>}
                        <div className="device-container">
                            {otherDevices.map((item, index) => {
                                return (
                                    <div className="device" key={index}>
                                        <div className="device-left">
                                            <i className={this.checkDeviceType(item.deviceType)} />
                                            <span className="device-name">{item.deviceName}</span>
                                        </div>
                                        <div className="device-right">
                                            {!item.showDeleteIcon && (
                                                <span className="float-right this-device">
                                                    This Device
                                                </span>
                                            )}
                                            {item.showDeleteIcon && (
                                                <span
                                                    className="delete-device float-right"
                                                    onClick={() => this.deleteDevice(item)}
                                                >
                                                    {getLayeredIcon("icon-delete")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="device-count">
                            <span className="float-right">
                                {subscriberDeviceData?.smallDeviceFooterMessage}
                            </span>
                        </div>
                    </div>
                )}
                {checkIsLoginBefore &&
                    <p
                        onClick={() => {
                            if(isSubscriptionDiscount(history) || (isMobile.any() && location?.state?.prevPath === `/${URL.SUBSCRIPTION_DISCOUNT}`)){
                                safeNavigation(history, URL.SUBSCRIPTION)
                            }
                            else if (isMobile.any()) {
                                notNow();
                                safeNavigation(history, location?.state?.prevPath)
                            }
                            else {
                                notNow();
                            }
                        }}
                        className="not-now">Not Now</p>}
                {(primaryDevices && primaryDevices.length === 0) || (otherDevices && otherDevices.length === 0 && (
                    <NoDataAvailable text="No Data Found!" />
                ))}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        subscriberDeviceList: get(
            state,
            "deviceManagement.subscriberDeviceList.data.deviceList",
        ),
        subscriberDeviceData: get(
            state,
            "deviceManagement.subscriberDeviceList.data",
        ),
        deletedSubscriberIdResponse: get(
            state.deviceManagement,
            "deletedSubscriberIdResponse",
        ),
        userProfileDetails: get(state.profileDetails, "userProfileDetails"),
        selectedPack: get(state.subscriptionDetails, "selectedTenureValue")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                getSubscriberDeviceList,
                deleteSubscriberDeviceList,
                openPopup,
                closePopup,
            },
            dispatch,
        ),
    };
}

DeviceManagement.propTypes = {
    getSubscriberDeviceList: PropTypes.func,
    deleteSubscriberDeviceList: PropTypes.func,
    subscriberDeviceList: PropTypes.array,
    deletedSubscriberIdResponse: PropTypes.object,
    openPopup: PropTypes.func,
    userProfileDetails: PropTypes.object,
    closePopup: PropTypes.func,
    subscriberDeviceData: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object,
    isBeforeLogin: PropTypes.bool,
    subTitle: PropTypes.string,
    onDeviceRemoved: PropTypes.func,
    selectedPack: PropTypes.object
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DeviceManagement));
