import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {withRouter} from "react-router";

import Button from "@common/Buttons";
import {URL} from "@constants/routeConstants";
import {MODALS} from "@common/Modal/constants";
import {openPopup} from "@common/Modal/action";
import PropTypes from "prop-types";
import {createWo, getSubscriberAddress} from "@containers/FireTvInstallation/APIs/action";

import '../style.scss';
import get from "lodash/get";
import {LOCALSTORAGE, MESSAGE, NO_OP} from "@constants";
import {getKey} from "@utils/storage";
import {showNoInternetPopup} from "@utils/common";

class ConfirmAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            landmark: '',
        }
    }

    async componentDidMount() {
        await this.props.getSubscriberAddress(true);
        let {subscriberAddressDetails, openPopup, updateInfo, installationMethod, closePopup} = this.props;
        if (subscriberAddressDetails && subscriberAddressDetails.code !== 0) {
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal',
                instructions: subscriberAddressDetails?.message ? subscriberAddressDetails.message : MESSAGE.ERROR_OCCURRED,
                primaryButtonAction: () => {
                    subscriberAddressDetails.code !== 40050 ? closePopup() : updateInfo(1, installationMethod)
                },
                primaryButtonText: 'Ok',
                hideCloseIcon: true,
            });
        }
    };

    proceedHandler = async () => {
        const {openPopup, history, createWo, installationMethod, updateInfo} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        /*if (installationMethod === 'fs-diy') {
            let param = {"dyi": true, "slotEndTime": "", "slotStartTime": "", "subscriberId": userInfo.sId}
            await createWo(true, param);

            const {woResponse} = this.props;
            if (woResponse && woResponse.code === 0) {
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal fs-register-modal',
                    headingMessage: `Thank You`,
                    instructions: `Details will be sent via SMS to your Registered Mobile Number.`,
                    primaryButtonText: 'Start Watching Now',
                    primaryButtonAction: () => safeNavigation(history, URL.DEFAULT),
                    hideCloseIcon: true,
                    icon: true,
                });
            } else {
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal',
                    instructions: woResponse?.message ? woResponse.message : MESSAGE.ERROR_OCCURRED,
                    primaryButtonText: 'Ok',
                    closeModal: true,
                    hideCloseIcon: true,
                });
            }
        } else {
            let stepNo = 3;
            updateInfo(stepNo, installationMethod);
        }*/
        let stepNo = 3;
        updateInfo(stepNo, installationMethod);
    }


    render() {
        let { subscriberAddressDetails } = this.props;
        return (
            <div className='address-container'>
                {/* <div className={`fs-img ${this.props.installationMethod === 'fs-diy' ? 'hidden' : ''}`}>
                    <img src='../../../assets/images/fs-icon.png' alt=''/>
                </div> */}
                <h1> Confirm Your Address </h1>
                <div className='instructions'>Thank you for showing interest on Fire TV Stick.
                    <div>Please confirm the details to arrange for delivery.</div></div>
                {/*<div className='instructions second'>Please confirm the following details to arrange for a firestick
                    {this.props.installationMethod === 'fs-diy' ? ' delivery' : ' installation'}
                </div>*/}
                {subscriberAddressDetails && <React.Fragment>
                    <div className='form'>
                        <div className='form-block'>
                            <div className='heading'>Name</div>
                            <div className='value'>{get(subscriberAddressDetails, 'data.name')}</div>
                        </div>

                        <div className='form-block'>
                            <div className='heading'>Address</div>
                            <div className='value'>{get(subscriberAddressDetails, 'data.address')}
                            </div>
                        </div>
                        <div className='form-block'>
                            <div className='valued'>* If the address is incorrect then please reach 
                            out to our representatives on 18123456789</div> 
                        </div>

                    </div>
                    <div className='btn-block'>
                        <Button bType="submit" cName="btn primary-btn btn-block button-margin"
                            clickHandler={() => this.proceedHandler()}
                            bValue={"Confirm"} />
                        <Link to={navigator.onLine && URL.DEFAULT} onClick={!navigator.onLine ? showNoInternetPopup : NO_OP}>
                            <div className='btn-link'>Not now</div>
                        </Link>
                    </div>
                </React.Fragment>}
            </div>
        )
    }
}


const mapStateToProps = (state) => ({
    woResponse: get(state.fireTvInstallation, 'workOrder'),
    subscriberAddressDetails: get(state.fireTvInstallation, 'subscriberAddressDetails'),
});

const mapDispatchToProps = dispatch => {
    return {
        ...bindActionCreators({
            openPopup,
            createWo,
            getSubscriberAddress,
        }, dispatch),
    }
}

ConfirmAddress.propTypes = {
    openPopup: PropTypes.func,
    history: PropTypes.object,
    createWo: PropTypes.func,
    getSubscriberAddress: PropTypes.func,
    woResponse: PropTypes.object,
    installationMethod: PropTypes.string,
    updateInfo: PropTypes.func,
    subscriberAddressDetails: PropTypes.object,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConfirmAddress))

