import React from 'react';
import PropTypes from "prop-types";
import { safeNavigation } from "@utils/common";
import { URL } from "@constants/routeConstants";
import './style.scss';

class TataskyInfo extends React.Component {

    render() {
        return (
            <div className='info-box'>
                <div className='footer-text-top display-block'>
                    <h1
                        onClick={() => safeNavigation(this.props.history, `${URL.DEFAULT}`)}
                    >Tata Play Binge Anywhere</h1>
                </div>
                <div className='footer-text-bottom display-block'>
                    <span>Tata Play Binge (formerly Tata Sky Binge) brings an extensive range of popular movies, web series, Originals, TV shows, live sports and more from 10+ OTT platforms, all under app and website.</span>
                    <span>So, you spend almost no time searching but all your time watching. Enjoy the latest movies, web series, Originals, TV shows, live sports and more from OTT platforms such as Disney+ Hotstar, ZEE5, Voot, SonyLIV, ShemarooMe, Eros Now, DocuBay, Hoichoi and more under one app and website.</span>
                </div>
            </div>
        )
    }
}

TataskyInfo.propTypes = {
    history: PropTypes.object,
}
export default TataskyInfo;