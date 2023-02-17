import React, {Component, Fragment} from 'react';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import PropTypes from "prop-types";

import WatchNotifications from "@containers/Notification/WatchNotification";
import TransactionNotifications from "@containers/Notification/TransactionNotification";

import {notificationResponse} from './APIs/constants'

import './style.scss';


class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0,
            isEditMode: false,
            popUpContainerWidth: '',
            notificationInnerContainerWidth: '',
            selectedNotifications: [],
        }
    }

    switchTab = async (selectedIndex) => {
        this.setState({
            selectedIndex,
            isEditMode: false,
            popUpContainerWidth: '',
            notificationInnerContainerWidth: '',
            selectedNotifications: [],
        });
    };

    onDeleteClickHandler = () => {
        this.setState((previousState) => {
            return {
                isEditMode: !previousState.isEditMode,
            }
        }, () => {
            let {isEditMode} = this.state;
            this.setState({
                popUpContainerWidth: isEditMode ? '417px' : '',
                notificationInnerContainerWidth: isEditMode ? '386px' : '',
            })
        });
    };

    handleOnChange = (name, value, notificationId) => {
        //let index = this.state.selectedNotifications.indexOf(notificationId);
        if (!value) {
            let filteredArray = this.state.selectedNotifications.filter(item => item !== notificationId);
            this.setState({
                [name]: value,
                selectedNotifications: filteredArray,
            });
        } else {
            this.setState({
                [name]: value,
                selectedNotifications: [...this.state.selectedNotifications, notificationId],
            });
        }
    };

    render() {
        let {isNotificationOpen} = this.props;
        let {selectedIndex, isEditMode, notificationInnerContainerWidth, popUpContainerWidth, selectedNotifications} = this.state;
        return (
            <Fragment>
                {isNotificationOpen &&
                <div className='notification-popup' onClick={(e) => e.stopPropagation()}
                     style={{width: popUpContainerWidth}}>
                    <div className='notification-tab' style={{marginLeft: isEditMode ? '29px' : ''}}>
                        <Tabs selectedIndex={selectedIndex} onSelect={index => this.switchTab(index)}>
                            <TabList className="tab-row">
                                <Tab className="tab" selectedClassName="active">Watch<i className={'icon-oval'}/></Tab>
                                <Tab className="tab" selectedClassName="active">Transactions</Tab>
                            </TabList>
                            <TabPanel>
                                <WatchNotifications notificationList={notificationResponse}
                                                    isEditMode={isEditMode}
                                                    onDeleteClickHandler={this.onDeleteClickHandler}
                                                    notificationInnerContainerWidth={notificationInnerContainerWidth}
                                                    handleOnChangeCheckbox={this.handleOnChange}
                                                    selectedNotifications={selectedNotifications}/>
                            </TabPanel>
                            <TabPanel>
                                <TransactionNotifications notificationList={notificationResponse}
                                                          isEditMode={isEditMode}
                                                          onDeleteClickHandler={this.onDeleteClickHandler}
                                                          notificationInnerContainerWidth={notificationInnerContainerWidth}
                                                          handleOnChangeCheckbox={this.handleOnChange}
                                                          selectedNotifications={selectedNotifications}/>
                            </TabPanel>
                        </Tabs>
                    </div>

                </div>
                }
            </Fragment>
        )
    }
}

Notification.propTypes = {
    isNotificationOpen: PropTypes.bool,
    scroll: PropTypes.bool,
};
export default Notification;
