import React from 'react';
import PropTypes from "prop-types";
import { LiveButton } from '../LiveButton';
import { formatAMPM,cloudinaryCarousalUrl } from '@utils/common';
import { isEmpty } from "lodash";

const PITitle = props => {
    const { meta } = props;
    return <p className='heading-title'>{meta?.title}</p>
};

PITitle.propTypes = {
    meta: PropTypes.object,
};

export const LiveUpperContent = props => {
    const { meta, channelMeta, playLiveClick } = props;

    return <div className="live-container live-detail">
        {
            <React.Fragment>
                <div className={`live-detail-tag`}> Live</div>
                <div className='live-detail-title'>
                    <img
                        className="circular-img"
                        src={`${cloudinaryCarousalUrl('', '', 0, 0, false, true)}${channelMeta?.logo}`}
                        alt=""
                    />
                    <div>
                        <div className='live-detail-description'>
                            <span>
                                {channelMeta?.channelName}
                            </span>
                            <span>
                                {!isEmpty(meta) && `${formatAMPM(meta?.startTime, false)} - ${formatAMPM(meta?.endTime)}`}
                            </span>
                        </div>
                        {meta && <PITitle meta={meta} />}
                    </div>
                </div>
                <LiveButton playLiveClick={playLiveClick} />
            </React.Fragment>
        }
    </div>
};

LiveUpperContent.propTypes = {
    meta: PropTypes.object,
    playLiveClick: PropTypes.func,
    channelMeta: PropTypes.object,
};