import React, {Fragment} from 'react';
import PropTypes from "prop-types";
import './style.scss';

export default function PlayerControls(props) {
    const {
        rewind,
        pause,
        showControls,
        playerCurrentTime,
        play,
        pauseHandling,
        forward,
        playHandling,
        controlVisibility,
        isSeeking,
        playerDuration,
        isLiveStatus
    } = props;
    return (
        <div className="play-controls" onClick={() => controlVisibility()}>
            {showControls && <Fragment>
                <i className={`icon-rewind ${isLiveStatus && 'hide'}`}
                   style={{visibility: `${playerCurrentTime > 10 ? 'visible' : 'hidden'}`}} onClick={() => rewind()}/>
                {play &&
                <i className={`icon-play ${isSeeking ? `hidden` : `shown`}`} onClick={() => pauseHandling()}/>}
                {pause &&
                <i className={`icon-pause ${isSeeking ? `hidden` : `shown`}`} onClick={() => playHandling()}/>}
              <i className={`icon-forward ${isLiveStatus && 'hide'}`}
                   style={{visibility: `${playerDuration - playerCurrentTime > 10 ? 'visible' : 'hidden'}`}} onClick={() => forward()}/>
                
            </Fragment>}
        </div>
    );
};

PlayerControls.propTypes = {
    isLoader: PropTypes.bool,
    playerCurrentTime: PropTypes.number,
    rewind: PropTypes.func,
    pause: PropTypes.bool,
    showControls: PropTypes.bool,
    play: PropTypes.bool,
    pauseHandling: PropTypes.func,
    forward: PropTypes.func,
    playHandling: PropTypes.func,
    controlVisibility: PropTypes.func,
    isSeeking: PropTypes.bool,
    playerDuration: PropTypes.number,
}
