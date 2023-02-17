import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import Heading from "@common/Heading";
import ToggleSwitch from '@common/ToggleSwitch';
import {getProfileDetails} from "@containers/Profile/APIs/action";
import {scrollToTop} from "@utils/common";

import {NOTIFICATION_TYPES} from './constants';

import './style.scss';
import PropTypes from "prop-types";


class NotificationSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transactionalNotification: false,
            watchNotification: false,
            myOffersNotification: false,
            bingeUpdates: false,
            bingeOffers: false,
            bingeSurveys: false,
        }
    }

    componentDidMount = () => {
        const {getProfileDetails, profileDetails} = this.props;
        isEmpty(profileDetails) && getProfileDetails();
        scrollToTop();
        this.trackEvents();
    };

    handleOnChange = (name, value) => {
        this.setState({[name]: value});
    };

    trackEvents = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.NOTIFICATION_SETTINGS)
        moengageConfig.trackEvent(MOENGAGE.EVENT.NOTIFICATION_SETTINGS)
    }

    render() {
        let {profileDetails} = this.props;
        return (
            <div className='account-notification-settings form-container'>
                <Heading heading='Notification Settings'/>
                <div className='notification-settings'>
                    <p className='notification-settings-head'>Notifications</p>
                    <ul>
                        {NOTIFICATION_TYPES && NOTIFICATION_TYPES.map((item, idx) => {
                            return <li className="form-group" key={idx}>
                                <div className="form-data">
                                    <ToggleSwitch labelText={item.displayName}
                                                  name={item.name}
                                                  value={item.name}
                                                  onToggleChange={(e) => this.handleOnChange(e.target.name, e.target.checked)}/>
                                </div>
                            </li>
                        })}
                    </ul>
                </div>
                {/*
                Commented because will be worked upon in next phase delivery

                <div className='email-notification-settings'>
                    <p className='notification-settings-head'>Email Updates</p>
                    <p className='notification-settings-sub-head'>Stay updated with our latest offers, updates and
                        customer surveys</p>
                    <ul>
                        {EMAIL_NOTIFICATION_TYPES && EMAIL_NOTIFICATION_TYPES.map((item, idx) => {
                            return <li className="form-group" key={idx}>
                                <div className="form-data">
                                    <Checkbox leftLabelText={item.displayName}
                                              name={item.name}
                                              value={item.name}
                                              chandler={(e) => this.handleOnChange(e.target.name, e.target.checked)}/>
                                </div>
                            </li>
                        })}
                    </ul>
                </div>
                <div className='email-block'>
                    <h6>All communication is sent to {get(profileDetails, 'data.email')}</h6>
                </div>*/}
            </div>
        )
    }
}

NotificationSettings.propTypes = {
    getProfileDetails: PropTypes.func,
    profileDetails: PropTypes.object,
};

function mapStateToProps(state) {
    return {
        profileDetails: get(state.profileDetails, 'userProfileDetails'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            getProfileDetails,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(NotificationSettings))