import React from 'react';
import './style.scss';
import PlayStore from "@assets/images/play-store.png"
import AppStore from "@assets/images/apple-store.png"
import Close from '../../../../assets/images/close-wht.svg';
import {setKey} from "@utils/storage";
import {LOCALSTORAGE, PLAY_STORE_URL} from '@utils/constants';
import PropTypes from "prop-types";

class TopHeaderDownload extends React.Component {
    onCloseDownload = (e) => {
        e.preventDefault();
        setKey(LOCALSTORAGE.IS_HIDE_DOWNLOAD_HEADER, 'true')
        this.props.callBackToHideDownload(true)
    }

    render() {
        const isIOS = navigator.userAgent.toLowerCase().indexOf("iphone") > -1
        return (
                <div className="top-header-download">
                    <div className="d-flex download-container">
                        <div className="text-size">
                            {`It's Better on the app.`}
                            <div className="text-size">
                                Download now
                            </div>
                        </div>
                        <div className="d-flex right-side">
                        <a href={isIOS ? PLAY_STORE_URL.IOS : PLAY_STORE_URL.ANDROID} target="_blank" rel="noreferrer">
                            <img src={isIOS ? AppStore : PlayStore} className={isIOS ? 'apple-store': "play-store"} alt=""/>
                            </a>
                            <div className="download-close-container" onClick={this.onCloseDownload}>
                                <img src={Close} className="close-btn" alt=""/>
                            </div>
                        </div>
                    </div>
                </div>
        )
    }
}

TopHeaderDownload.propTypes = {
    callBackToHideDownload: PropTypes.func,
};

export default TopHeaderDownload;