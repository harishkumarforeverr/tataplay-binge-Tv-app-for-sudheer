import React, {Component} from 'react';

import {Link} from "react-router-dom";
import {URL} from "@constants/routeConstants";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import PropTypes from "prop-types";
import isEmpty from 'lodash/isEmpty';
import * as moment from "moment";
import get from "lodash/get";

import Button from "@common/Buttons";
import Calendar from "@common/Calender";
import RadioButton from "@common/RadioButton";
import {MODALS} from "@common/Modal/constants";
import {openPopup} from "@common/Modal/action";
import {LOCALSTORAGE, NO_OP} from "@constants";
import {getKey} from "@utils/storage";
import {
    ftvWOEvents,
    getMonthNameFromDate,
    getOrdinalNum,
    getWeekNameFromDate,
    openErrorPopUp,
    safeNavigation,
    showNoInternetPopup,
} from "@utils/common";
import {confirmSlot, createWo, getSlot} from "@containers/FireTvInstallation/APIs/action";
import {hideMainLoader, showMainLoader} from '@src/action';

import '../style.scss';

class InstallationSchedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            installationDate: null,
            slotStart: null,
            slotEnd: null,
            selectedRadio: null,
            slotSuggestions: {},
        }
    }

    componentDidMount() {
        this.onLoadHandler();
    }

    onLoadHandler = () => {
        const {subscriberAddressDetails} = this.props;
        if (subscriberAddressDetails && get(subscriberAddressDetails, 'data.ocsFlag') === 'N') {
            this.setState({
                slotSuggestions: get(subscriberAddressDetails, 'data.slotSuggestions'),
            })
        }
    };

    getDisplayDate = () => {
        let {installationDate} = this.state;
        let year = (installationDate.getFullYear()).toString();
        return `${getWeekNameFromDate(installationDate, true)} ${getOrdinalNum(installationDate.getDate())} ${getMonthNameFromDate(installationDate)} ${(year.substring(2, 4))}`
    };

    getPayloadSlotDate = (slotDate) => {
        let today = new Date();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let trimmedTime = slotDate ? moment(slotDate, "hh:mm A").format("HH:mm:ss") : time;
        return `${moment(this.state.installationDate).format("DD-MM-YYYY")} ${trimmedTime}`;
    };

    getRequestCO = (isTaskIdReq = false) => {
        const {subscriberAddressDetails, dynamicSlotDetails} = this.props;
        let {slotStart, slotEnd} = this.state,
            userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        return {
            "contactPoint": {
                "name": userInfo.sId,
                "number": userInfo.sId,
            },
            "locationAddress": {
                "city": get(subscriberAddressDetails, 'data.city'),
                "formattedAddress": get(subscriberAddressDetails, 'data.pincode'),
                "id": "",
                "pincode": get(subscriberAddressDetails, 'data.pincode'),
                "state": get(subscriberAddressDetails, 'data.state'),
            },
            "slot": {
                "end": this.getPayloadSlotDate(slotEnd),
                "start": this.getPayloadSlotDate(slotStart),
            },
            "teamId": get(subscriberAddressDetails, 'data.serviceRegionId'),
        };
    };

    proceedHandler = async () => {
        const {subscriberAddressDetails, confirmSlot, dynamicSlotDetails, showMainLoader, hideMainLoader} = this.props;
        let confirmSlotCO = this.getRequestCO();
        let confirmSlotCoAdd = {
            "taskId": get(dynamicSlotDetails, 'data.taskId.taskId'),
        };
        showMainLoader();

        if (subscriberAddressDetails && get(subscriberAddressDetails, 'data.ocsFlag') !== 'N') {
            await confirmSlot({...confirmSlotCO, ...confirmSlotCoAdd});
            let {confirmSlotResponse} = this.props;
            if (confirmSlotResponse && confirmSlotResponse.code === 0) {
                await this.createWo();
            } else {
                hideMainLoader();
                openErrorPopUp(this.props, confirmSlotResponse);
            }
        } else {
            await this.createWo();
        }
    };

    createWo = async () => {
        const {history, openPopup, createWo, hideMainLoader, installationMethod} = this.props;
        let {slotStart, slotEnd} = this.state,
            userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let isDiy = installationMethod === 'fs-diy'
        let param = {
            "dyi": isDiy,
            "slotEndTime": this.getPayloadSlotDate(slotEnd),
            "slotStartTime": this.getPayloadSlotDate(slotStart),
            "subscriberId": userInfo.sId,
        };
        await createWo(false, param); // false is for handling of loader in API call
        hideMainLoader();
        let {woResponse} = this.props;
        if(woResponse?.code === 0) {
            ftvWOEvents(true, installationMethod);

            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal fs-register-modal fs-install',
                headingMessage: isDiy ? `Thank You` : `Installation Scheduled`,
                instructions: `<div>${this.getDisplayDate()}</div> <div>${slotStart}-${slotEnd}</div> <div>Details will be sent via SMS to your Registered Mobile Number.</div>`,
                isHtml: true,
                primaryButtonText: 'Start Watching Now',
                primaryButtonAction: () => safeNavigation(history, {
                    pathname: `${URL.DEFAULT}`,
                    state: {ftvWoGenerated: true},
                }),
                hideCloseIcon: true,
                icon: true,
            });
        } else {
            openErrorPopUp(this.props, woResponse);
        }
    }

    handleChange = (name, value) => {
        this.setState({
            [name]: value,
        }, async () => {
            const { subscriberAddressDetails } = this.props;
            if (subscriberAddressDetails && get(subscriberAddressDetails, 'data.ocsFlag') !== 'N') {
                await this.props.getSlot(true, this.getRequestCO());
                let { dynamicSlotDetails } = this.props;
                dynamicSlotDetails && dynamicSlotDetails.code === 0 ?
                    this.setState({
                        slotSuggestions: get(dynamicSlotDetails, 'data.slotSuggestions'),
                    }) :
                    openErrorPopUp(this.props, dynamicSlotDetails);
            }
        })
    };

    checkBtnDisabled = () => {
        const {installationDate, selectedRadio} = this.state;
        return !installationDate || isEmpty(selectedRadio);
    };

    slotClickHandler = (e) => {
        let selectedItem = this.state?.slotSuggestions[e?.target?.selectedIndex || 0] ;
        this.setState({
            selectedRadio: e && e.target.value,
            slotStart: selectedItem.start,
            slotEnd: selectedItem.end,
        });
    };

    render() {
        let {installationDate, slotSuggestions} = this.state;
        return (
            <div className='installation-container'>
                {/* <div className={`fs-img`}>
                    <img src='../../../assets/images/fs-install-icon.png' alt=''/>
                </div> */}
                <h1> Schedule Delivery </h1>
                <div className='instructions'>Select a suitable Date and Time to deliver the device.</div>
                <div className='form'>
                    <div className='form-block'>
                        <Calendar label={'Date'} 
                                  minDate={moment().add(1, 'days').toDate()}
                                  maxDate={moment().add(29, 'days').toDate()}
                                  setDateValue={this.handleChange} name={'installationDate'}/>
                    </div>
                    {installationDate && <div className='form-block'>
                        {slotSuggestions && slotSuggestions.length && <div className='heading'>Time</div>}
                       <div>
                        <select className='select-box'
                                onChange={(e) => this.slotClickHandler(e)}>
                                    <option selected hidden>Please Select A time Slot</option>
                            {slotSuggestions && slotSuggestions.length && slotSuggestions.map((item, idx) =>
                                <option value={`${item.start} - ${item.end}`} 
                                        selected={this.state.selectedRadio === `${item.start} - ${item.end}`}>
                                    {`${item.start} - ${item.end}`}
                                </option>
                            )}
                        </select>
                        </div>
                        {/* {slotSuggestions && slotSuggestions.length && slotSuggestions.map((item, idx) => <div key={idx}
                                                                                                              className='radio-block'>
                            <div className='radio-text'>{item.start} - {item.end}</div>
                            <RadioButton name='fs-install-radio' value={`${item.start} - ${item.end}`}
                                         checked={this.state.selectedRadio === `${item.start} - ${item.end}`}
                                         showLabel={false}
                                         chandler={(e) => this.slotClickHandler(e, item.start, item.end)}/>
                        </div>)} */}
                    </div>}
                </div>
                <div className='btn-block'>
                    <Button bType="submit" cName="btn primary-btn btn-block button-margin" clickHandler={() => this.proceedHandler()}
                            disabled={this.checkBtnDisabled()}
                            bValue={"Confirm"}/>
                    <Link to={navigator.onLine && URL.DEFAULT} onClick={!navigator.onLine ? showNoInternetPopup : NO_OP}>
                        <div className='btn-link'>Not now</div>
                    </Link>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        ...bindActionCreators({
            openPopup,
            getSlot,
            confirmSlot,
            createWo,
            showMainLoader,
            hideMainLoader,
        }, dispatch),
    }
};

const mapStateToProps = (state) => ({
    subscriberAddressDetails: get(state.fireTvInstallation, 'subscriberAddressDetails'),
    dynamicSlotDetails: get(state.fireTvInstallation, 'dynamicSlotDetails'),
    confirmSlotResponse: get(state.fireTvInstallation, 'confirmSlotResponse'),
    woResponse: get(state.fireTvInstallation, 'workOrder'),
});

InstallationSchedule.propTypes = {
    openPopup: PropTypes.func,
    getSlot: PropTypes.func,
    createWo: PropTypes.func,
    confirmSlot: PropTypes.func,
    history: PropTypes.object,
    subscriberAddressDetails: PropTypes.object,
    dynamicSlotDetails: PropTypes.object,
    confirmSlotResponse: PropTypes.object,
    woResponse: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    installationMethod: PropTypes.string,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InstallationSchedule))
