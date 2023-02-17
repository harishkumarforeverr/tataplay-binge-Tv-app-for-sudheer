import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Checkbox from "@common/Checkbox";
import image from '@assets/images/tt-sky.png';
import placeHolder from '@assets/images/image-placeholder-landscape.png';
import {getDeleteIconClassname} from '../APIs/constants';
import './style.scss';

class WatchNotifications extends Component {
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
        //deleteDisable = isEditMode && !selectedNotifications.length;
        let deleteIconClassname = getDeleteIconClassname(this.props);
        return (
            <div className='watch-notification' style={{width: notificationInnerContainerWidth}}>
                <div className='tab-sub-header' style={{marginLeft: marginLeft}}> Recent
                    <span
                        className={isEditMode && !selectedNotifications.length ? 'delete-block disable-delete' : 'delete-block'}>
                        <i className={deleteIconClassname} onClick={() => onDeleteClickHandler('watch')}/></span>
                </div>
                <div className='recent-block'>
                    <div>
                        <div className='recent-notification-container'>
                            {notificationList && notificationList.data.recent.map((item, index) => {
                                return <div key={index} className='notification-block-container'>
                                    <div className='notification-checkbox'
                                         style={{visibility: isEditMode ? 'visible' : 'hidden'}}>
                                        <Checkbox name={item.id}
                                                  value={item.id}
                                                  chandler={(e) => handleOnChangeCheckbox(e.target.name, e.target.checked, item.id)}/>
                                    </div>
                                    <div className='notification-block' id={item.id}
                                         style={{backgroundColor: '#33354d', marginLeft: marginLeft}}
                                         onClick={() => this.onNotificationClick(item.id)}>
                                        <div>
                                            <img src={placeHolder} alt={'img'}/>
                                            <img src={item.image} alt={'img'}
                                                 onError={(e) => {
                                                     e.target.onerror = null;
                                                     e.target.src = placeHolder;
                                                 }}
                                            />
                                        </div>
                                        <div><p>{item.title}</p><p>{item.summary}</p></div>
                                        <div><p>1m</p><span><img className='tatasky' alt=''
                                                                 src={image}/></span></div>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
                <div className='tab-sub-header earlier' style={{marginLeft}}>Earlier</div>
                <div className='earlier-block'>
                    <div>

                        <div className='earlier-notification-container'>
                            {notificationList && notificationList.data.earlier.map((item, index) => {
                                return <div key={index} className='notification-block-container'>
                                    <div className='notification-checkbox'
                                         style={{visibility: isEditMode ? 'visible' : 'hidden'}}>
                                        <Checkbox name={item.id}
                                                  value={item.id}
                                                  chandler={(e) => handleOnChangeCheckbox(e.target.name, e.target.checked)}/>
                                    </div>
                                    <div className='notification-block' id={item.id}
                                         style={{backgroundColor: '#33354d', marginLeft: marginLeft}}
                                         onClick={() => this.onNotificationClick(item.id)}>
                                        <div>
                                            <img src={placeHolder} alt={'img'}/>
                                            <img src={item.image} alt={'img'}
                                                 onError={(e) => {
                                                     e.target.onerror = null;
                                                     e.target.src = placeHolder;
                                                 }}
                                            />
                                        </div>
                                        <div><p>{item.title}</p><p>{item.summary}</p></div>
                                        <div><p>1m</p><span><img className='tatasky' alt=''
                                                                 src={image}/></span></div>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

WatchNotifications.propTypes = {
    isEditMode: PropTypes.bool,
    notificationList: PropTypes.object,
    onDeleteClickHandler: PropTypes.func,
    handleOnChangeCheckbox: PropTypes.func,
    notificationInnerContainerWidth: PropTypes.string,
    selectedNotifications: PropTypes.array,
};

export default WatchNotifications;