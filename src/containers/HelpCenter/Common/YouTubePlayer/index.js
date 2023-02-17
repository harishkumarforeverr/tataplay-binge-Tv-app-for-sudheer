import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const YouTubePlayer = (props) => {
    const { videoLink, contentId } = props;
    return (
        <div className="you-tube-player video-contr">
               <iframe
               key={contentId}
               width="100%"
                height={180}
                src={videoLink}
                title="YouTube video player"
                frameBorder={0}
                //allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                allowFullScreen />
        </div>
    )
};

YouTubePlayer.propTypes = {
    height: PropTypes.number,
    videoLink: PropTypes.string,
};

export default YouTubePlayer;
