import React from 'react';
import PropTypes from "prop-types";

import {SOCIAL_MEDIA_URL} from '@constants';

import Facebook from "@assets/images/facebook.svg";
import Instagram from "@assets/images/instagram.svg";
import Twitter from "@assets/images/twitter.svg";
import Youtube from "@assets/images/youtube.svg";
import './style.scss';
import DATALAYER from '@utils/constants/dataLayer';
import {fireFooterClickEvent} from '@utils/common';

class ConnectUs extends React.Component {
    render() {
        const {showTitle} = this.props;
        return (
            <div className='connect-link'>
                {showTitle && <span className='connect-us-title'>Connect with us</span>}
                <span className={"connect-us-btn"}>
                <a href={SOCIAL_MEDIA_URL.FACEBOOK} onClick={() => fireFooterClickEvent(DATALAYER.VALUE.FACEBOOK)}
                       target="_blank" rel="noreferrer">
                        <img src={Facebook} alt="Facebook"/>
                    </a>
                    <a href={SOCIAL_MEDIA_URL.INSTAGRAM} onClick={() => fireFooterClickEvent(DATALAYER.VALUE.INSTAGRAM)}
                       target="_blank" rel="noreferrer">
                        <img src={Instagram} alt="Instagram"/>
                    </a>
                    <a href={SOCIAL_MEDIA_URL.TWITTER} onClick={() => fireFooterClickEvent(DATALAYER.VALUE.WHATSAPP)}
                       target="_blank" rel="noreferrer">
                        <img src={Twitter} alt="Twitter"/>
                    </a>
                    <a href={SOCIAL_MEDIA_URL.YOUTUBE} onClick={() => fireFooterClickEvent(DATALAYER.VALUE.WHATSAPP)}
                       target="_blank" rel="noreferrer">
                        <img src={Youtube} alt="Youtube"/>
                    </a>
                </span>
            </div>
        )
    }
}

ConnectUs.propTypes = {
    showTitle: PropTypes.bool,
}

export default ConnectUs;