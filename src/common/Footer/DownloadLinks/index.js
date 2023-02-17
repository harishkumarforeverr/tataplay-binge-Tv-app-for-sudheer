import React from 'react';
import {PLAY_STORE_URL} from '@constants';
import './style.scss';
import GooglePlay from "@assets/images/play-store.png"
import AppleStore from "@assets/images/apple-store.png"
import {fireFooterClickEvent} from '@utils/common';
import DATALAYER from '@utils/constants/dataLayer';

class DownloadLink extends React.Component {
    render() {
        return (
            <div className='download-link'>
                <span>Download app now</span>
                <span className={"app-store-btn"}>
                    <a href={PLAY_STORE_URL.ANDROID} onClick={() => fireFooterClickEvent(DATALAYER.VALUE.PLAY_STORE)}
                       target="_blank" rel="noreferrer">
                        <img src={GooglePlay} className='play-store' alt="google-play-store"/>
                    </a>
                    <a href={PLAY_STORE_URL.IOS} target="_blank" rel="noreferrer"
                       onClick={() => fireFooterClickEvent(DATALAYER.VALUE.APP_STORE)}>
                        <img src={AppleStore} className='apple-store' alt="app-store"/>
                    </a>
                </span>
            </div>
        )
    }
}

export default DownloadLink;