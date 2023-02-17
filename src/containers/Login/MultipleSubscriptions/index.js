import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from "@common/Buttons";
import RadioButton from "@common/RadioButton";

import "./style.scss";
import { ACCOUNT_STATUS } from "@containers/BingeLogin/APIs/constants";
import { notNow } from "@containers/Login/LoginCommon";
import get from "lodash/get";
import { withRouter } from 'react-router-dom';

class MultipleSubscriptions extends Component {

    render() {
        let { barStatus, touchStatus, subscriptionsList, selectedSubscriber, handleProceedBtn, configResponse, radioButtonClickHandler } = this.props;
        let bingClass,bingText = '';
        return (
            <React.Fragment>
                <p className='subscriber-list-header'>{get(configResponse, "data.config.ios_freetrial_title")}</p>
                <p className='subscriber-subheader'>You have multiple Subscription IDs. Please select the one you want to use.</p>
                <ul className={`subscriber-list 
                 ${barStatus === false && !touchStatus && subscriptionsList?.length > 4 ? `sub-swipe-screen` : null}`}>
                    {subscriptionsList.map((item, index) => {
                        if(item?.accountDetailsDTOList.length == 0){
                            bingText= '';
                            bingClass='hidden';
                        }
                        else if(item?.accountStatus?.toUpperCase() === ACCOUNT_STATUS.ACTIVE)
                         {
                            bingText ='Binge Active';
                             bingClass ='active-binge';
                          }
                         else if(item?.accountStatus?.toUpperCase() === ACCOUNT_STATUS.INACTIVE){                             
                            bingText ='Binge Inactive';
                            bingClass ='inactive-binge';                              
                         }
                         else{
                            bingText ='Binge Active';
                            bingClass ='active-binge';
                          }
                        return (
                            <li key={index}>
                                <div className='sudId-wrapper'>
                                    <span className='subscription-id'>{item.subscriberId}</span>
                                    <span className={bingClass}>{bingText}</span>
                                </div>
                                <div>
                                    <RadioButton
                                        id={item.subscriberId}
                                        name={item.subscriberId}
                                        value={item.subscriberId}
                                        chandler={() => radioButtonClickHandler('selectedSubscriber', item)}
                                        showLabel={false}
                                        checked={selectedSubscriber.subscriberId === item.subscriberId && selectedSubscriber.dthStatus === item.dthStatus}
                                    />
                                </div>
                            </li>
                        )
                    })}
                </ul>
                <div className='button-container'>
                    <Button
                        cName={`btn primary-btn login-btn`}
                        bType="button"
                        bValue='Proceed'
                        clickHandler={handleProceedBtn}
                        disabled={!selectedSubscriber}
                    />
                </div>
                <div className="sub-not-now" onClick={() => notNow(this.props)} >
                    Not now
                </div>
            </React.Fragment>
        )
    }
}
MultipleSubscriptions.propTypes = {
    radioButtonClickHandler: PropTypes.func,
    handleProceedBtn: PropTypes.func,
    closeLoginModel: PropTypes.func,
    subscriptionsList: PropTypes.array,
    selectedSubscriber: PropTypes.object,
    barStatus: PropTypes.bool,
    touchStatus: PropTypes.bool,
    configResponse: PropTypes.object,
}

export default withRouter(MultipleSubscriptions);