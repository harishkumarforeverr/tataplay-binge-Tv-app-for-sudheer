import React, {Component} from "react";
import Heading from "@common/Heading";
import {scrollToTop} from "@utils/common";
import {CONTACT_US_ITEMS} from '../constants'
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

import './style.scss';
import Faq from "./FAQ";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";

class ContactUs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemName: 'faqs',
        }
    }

    componentDidMount() {
        scrollToTop();
        this.trackEvents();
    }

    trackEvents = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTACT_US)
        moengageConfig.trackEvent(MOENGAGE.EVENT.CONTACT_US)
    }

    render() {
        let {itemName} = this.state;
        return (
            <div className="contact-us-container form-container">
                <Heading heading='Contact Us'
                         subHeading={' If you need any further support please go to the FAQs page or reach out to us via Email. Thank you. '}/>
                <div className='contact-us-block'>
                    <div className={'contact-us-items'}>
                        {
                            CONTACT_US_ITEMS && CONTACT_US_ITEMS.map((item, index) => {
                                return (
                                    <div key={index} onClick={() => this.setState({itemName: item.name})}>
                                        <li className={`${itemName === item.name ? 'active' : ''}`}>
                                            <div>
                                                <span><i className={item.leftIcon}/></span>
                                                <span>{item.displayName}</span>
                                            </div>
                                        </li>
                                    </div>
                                )
                            })
                        }
                        <div className="message">
                            For any further support you can reach out to us at &nbsp;
                            <a href="mailto:help@tatasky.com">help@tatasky.com</a>
                        </div>
                    </div>
                    {
                        itemName === 'faqs' && <Faq/>
                    }
                </div>
            </div>
        )
    }
}

export default ContactUs;
