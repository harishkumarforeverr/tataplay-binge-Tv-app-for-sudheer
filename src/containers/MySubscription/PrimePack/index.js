import React from 'react';
import PropTypes from 'prop-types';
import {PRIMESTATUS} from "@containers/MySubscription/constant";
import {PACK_TYPE} from "@constants";

const PrimePack = (props) => {
    const {data} = props;
    return (data?.primePackDetails?.packStatus && data?.primePackDetails?.bundleState !== PRIMESTATUS.CANCELLED ?
        <div className={`my-subscription-bottom`}>
            <div className='my-subscription-header'>
                <div className='my-subscription-header-left'>
                    <h5>Amazon Prime</h5>
                    <p>{data.primePackDetails.packType.toLowerCase() === PACK_TYPE.FREE ? 'Free trial ends on' : 'Expires'}
                        on {data.primePackDetails.expiryDate}</p>
                </div>
                <div className='my-subscription-header-right'>
                    ₹{data.primePackDetails.packAmount} <span>per month</span>
                </div>
            </div>
            <img alt='provider' key="amazon" src={data.primePackDetails.imageUrl}/>
        </div> : <div/>)
};

PrimePack.propTypes = {
    data: PropTypes.object,
}

export default PrimePack;