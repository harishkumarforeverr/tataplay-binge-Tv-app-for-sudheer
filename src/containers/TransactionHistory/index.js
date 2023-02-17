import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

import Heading from "@common/Heading";
import {openPopup} from "@common/Modal/action";
import {getLayeredIcon, featureUnderDevelopment} from '@utils/common';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

import {transactionHistoryList} from './APIs/constants';
import ShowMoreText from 'react-show-more-text';

import './style.scss';
import PropTypes from "prop-types";

class TransactionHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    conmponentDidMount(){
        this.trackEvents();
    }
    
    trackEvents = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.TRANSACTION_HISTORY)
    }

    render() {
        let {openPopup} = this.props;
        return (
            <div className='form-container'>
                <Heading heading='Transaction History'
                         subHeading='Sub ID: 2343341123  |  Taka Sky Binge Fire Stick 1'/>
                <div className='transaction-history-container'>
                    {transactionHistoryList && transactionHistoryList.map((item, index) => {
                        return (<div key={index} className='transaction-history-list'>
                            <div className='transaction-history-list-item'>
                                <h3>{item.date} | {item.time}</h3>
                                <h6>ID {item.id}</h6>
                                <p className={'description'}>
                                    <ShowMoreText
                                        lines={2}
                                        more='+More'
                                        less='- Less'
                                        expanded={false}
                                        width={0}
                                        anchorClass={'more-less'}>
                                        {item.description}
                                    </ShowMoreText>
                                </p>


                            </div>
                            <div className={'right-child'}>
                                <p><i className='icon-inr'/>{item.balance}</p>
                                <p className='down-icon'
                                   onClick={() => featureUnderDevelopment(openPopup)}>{getLayeredIcon('icon-download')}</p>
                            </div>
                        </div>)
                    })}

                </div>
            </div>
        )
    }
}

function mapStateToProps() {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            openPopup,
        }, dispatch),
    }
}

TransactionHistory.propTypes = {
    openPopup: PropTypes.func,
};

export default (connect(mapStateToProps, mapDispatchToProps)(TransactionHistory))