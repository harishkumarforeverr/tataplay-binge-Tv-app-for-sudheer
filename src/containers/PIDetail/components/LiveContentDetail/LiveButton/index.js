import React from 'react';
import Button from "@common/Buttons";
import { PLAY_ACTION } from "@constants";
import PropTypes from 'prop-types';
import {showNoInternetPopup} from "@utils/common";

export const LiveButton = ({
    playLiveClick
}) => {

    return <div className="detail-button">
        <div className='detail-button-container'>
            <div>
                <Button
                    bValue={PLAY_ACTION.PLAY_NOW}
                    cName={`btn primary-btn play-btn`}
                    clickHandler={() => navigator.onLine ? playLiveClick() : showNoInternetPopup} 
                />
            </div>
        </div>
    </div>
}

LiveButton.propTypes = {
    playLiveClick: PropTypes.func,
};
