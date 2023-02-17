import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Checkbox from "@common/Checkbox";
import {getDeleteIconClassname} from '../APIs/constants';

import './style.scss';

class TransactionNotifications extends Component {
    constructor(props) {
        super(props);
    }

    onNotificationClick = (id) => {
        document.getElementById(id).style.backgroundColor = "transparent";
    };

    render() {
        let {
                notificationList, onDeleteClickHandler, notificationInnerContainerWidth, isEditMode,
                handleOnChangeCheckbox, selectedNotifications,
            } = this.props,
            marginLeft = isEditMode ? '29px' : '';
        let deleteIconClassname = getDeleteIconClassname(this.props);
        return (
            <div className='transaction-notification' style={{width: notificationInnerContainerWidth}}>
                <div className='tab-sub-header' style={{marginLeft: isEditMode ? '29px' : ''}}>Recent
                    <span
                        className={isEditMode && !selectedNotifications.length ? 'delete-block disable-delete' : 'delete-block'}>
                        <i className={deleteIconClassname} onClick={() => onDeleteClickHandler('watch')}/></span>

                </div>
                <div className='recent-block'>
                    <div>
                        <div className='recent-notification-container'>
                            {notificationList && notificationList.data.recent.map((item, index) => {
                                return <div className='notification-block-container' key={index}>
                                    <div className='notification-checkbox'
                                         style={{visibility: isEditMode ? 'visible' : 'hidden'}}>
                                        <Checkbox name={item.id}
                                                  value={item.id}
                                                  chandler={(e) => handleOnChangeCheckbox(e.target.name, e.target.checked)}/>
                                    </div>
                                    <div className='notification-block' id={item.id}
                                         style={{backgroundColor: '#33354d', marginLeft: marginLeft}}
                                         onClick={() => this.onNotificationClick(item.id)}>
                                        <div><p>{item.title}</p><p>{item.summary}</p></div>
                                        <div><p>1m</p></div>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
                <div className='earlier-block'>
                    <div>
                        <div className='tab-sub-header earlier' style={{marginLeft: isEditMode ? '29px' : ''}}>Earlier
                        </div>
                        <div className='earlier-notification-container'>
                            {notificationList && notificationList.data.earlier.map((item, index) => {
                                return <div className='notification-block-container' key={index}>
                                    <div className='notification-checkbox'
                                         style={{visibility: isEditMode ? 'visible' : 'hidden'}}>
                                        <Checkbox name={item.id}
                                                  value={item.id}
                                                  chandler={(e) => handleOnChangeCheckbox(e.target.name, e.target.checked)}/>
                                    </div>
                                    <div className='notification-block' id={item.id}
                                         style={{backgroundColor: '#33354d', marginLeft: marginLeft}}
                                         onClick={() => this.onNotificationClick(item.id)}>
                                        <div><p>{item.title}</p><p>{item.summary}</p></div>
                                        <div><p>1m</p></div>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

TransactionNotifications.propTypes = {
    isEditMode: PropTypes.bool,
    notificationList: PropTypes.object,
    onDeleteClickHandler: PropTypes.func,
    handleOnChangeCheckbox: PropTypes.func,
    notificationInnerContainerWidth: PropTypes.string,
    selectedNotifications: PropTypes.array,
};

export default TransactionNotifications;