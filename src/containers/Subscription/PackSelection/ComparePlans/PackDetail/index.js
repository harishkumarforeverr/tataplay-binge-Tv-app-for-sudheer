import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.scss'
import {getComponentList, getHigherPack} from "@containers/Subscription/APIs/subscriptionCommon";
class PackDetail extends Component {
    constructor(props) {
        super(props);
        this.higherPlan = '';
    }

    componentDidMount() {
        this.higherPlan = getHigherPack();
    }


    render() {
        let { packItem, selectedPlan, handlePackSelection } = this.props;
        let componentList = getComponentList(packItem);
        let partnerList = componentList.partnerList;
        return (
            <div className={`pack-wrapper ${selectedPlan.productName === packItem.productName && 'selected-plan'} 
            ${selectedPlan?.productName === this.higherPlan?.productName && packItem?.productName === this.higherPlan?.productName && 'higher-plan'}`}
                onClick={(e) => handlePackSelection(e, packItem)}>
                <ul className={`pack-availability ${selectedPlan.productName !== packItem.productName && 'active-plan-hover'}`}>{partnerList.map((item, index) => {
                    return (
                        <>
                            <li key={item.partnerId} className={(index === partnerList.length - 1) && 'last-pack-item'}>
                                {index === 0 && (<div className={`pack-detail ${packItem.highlightedPack && 'preemium-text'}`} >
                                    <span><img alt='crown-icon' className='crown-icon' src={'../../assets/images/crown-icon.svg'} /></span>
                                    <span className='pack-name'>{packItem.productName}</span>
                                    <span className='pack-count'>{componentList.numberOfApps}</span>
                                    <div className='pack-amount'>
                                        <span dangerouslySetInnerHTML={{ __html: packItem.amount?.split(';')[0] }} />
                                        <span>{packItem.amount?.split(';')[1]}</span>
                                    </div>
                                </div>)}
                                {item.included ? <div className={`checked-item`}>
                                    <i className='icon-check' />
                                    {/* {item.footerMessage && <span>{item.footerMessage}</span>} */}
                                </div> :
                                    <div className={`checked-item`}>
                                    </div>
                                }
                                {(index === partnerList.length - 1) &&
                                    (<div className={`pack-footer-detail ${packItem.highlightedPack && 'preemium-text'}`}>
                                        <div>{packItem.deviceDetails.platformName}</div>
                                        <div className="hr" />
                                        <div>{packItem.deviceDetails.deviceCount}</div>
                                    </div>)}

                            </li>
                            <div className="hr" />
                        </>
                    )
                })}</ul>
            </div>
        )

    }
}

PackDetail.propTypes = {
    packItem: PropTypes.object,
    handlePackSelection: PropTypes.func,
    selectedPlan: PropTypes.object,
};

export default PackDetail;


