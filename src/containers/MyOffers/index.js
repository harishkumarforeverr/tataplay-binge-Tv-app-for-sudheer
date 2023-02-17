import React, {Component} from 'react';

import Heading from "@common/Heading";
import {COMMON_HEADINGS} from "@constants/index";

import './style.scss';

class MyOffers extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div className='my-offers form-container'>
                <Heading heading='My Offers'/>
                <div className='my-offers-container'>

                    <h1>{COMMON_HEADINGS.FEATURE_UNDER_DEVELOPMENT}</h1>
                    {/*<div className='card'>
                        <div className='card-image'>
                            <img src={image} alt={'card--image'}/>
                        </div>
                        <div className='card-content'>
                            <h2>Family Action Offer</h2>
                            <span>Offer is Valid until 05/02/2019</span>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent placerat nisl nec
                                laoreet mollis. </p>
                            <span>More +</span>
                            <Button bType="submit" cName="btn primary-btn btn-block"
                                    clickHandler={this.SubmitForm} bValue={"Select Offer"}/>

                        </div>

                    </div>*/}

                </div>
            </div>
        )
    }
}

export default MyOffers;