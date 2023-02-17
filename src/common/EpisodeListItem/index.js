import React from 'react'
import PlayNextImage from '@assets/images/play-next-circle.png'
import ThreeDotsImage from '@assets/images/three-dots.png'
import ListingItem from '../ListingItem';
import { LAYOUT_TYPE, SECTION_SOURCE } from '@constants';
import { getTimeline, } from '@src/utils/common';
import { time_convert } from '@src/utils/common';

function EpisodeBottomContent({item, handleModal, routeName}){

    return (
        <>
            <div className="overBottomContent">
                <div className="overBottomContentLeft">
                    <img
                        className={"botmIcon"}
                        alt="freemium-image"
                        src={PlayNextImage}
                    />
                    <p>{`Ep.${item.episodeId} ${item?.title}`}</p>
                    <span
                        className="three-dots"
                        data-tip="Know more"
                        data-effect="solid"
                        data-offset="{'left': 30}"
                        onClick={e => {
                            e.stopPropagation();
                            handleModal(item);
                        }}>
                        <img
                            className={"three-dots"}
                            alt="freemium-image"
                            src={ThreeDotsImage}
                        />
                    </span>
                </div>
            </div>
            <div className="cardTime">{time_convert((item?.totalDuration || item?.durationInSeconds), true)}</div>
            <div className="time-line"><span style={{ width: `${getTimeline(item)}%` }}/></div>
        </>)
}

export default function EpisodeListItem({item, handleModal}) {
    return (
        <ListingItem
            episodePage={true}
            sectionSource={SECTION_SOURCE.SEASONS}
            item={{...item, image: item.boxCoverImage}}
            view = {LAYOUT_TYPE.LANDSCAPE}
            title={'test'}
            subscribed={false}
            routeName={'./'}
            isToolTipRequired={true}
            isContinueWatching={false}
            classNameSetHover="set-hover-search"
            customContents={(item)=><EpisodeBottomContent item={item} handleModal={handleModal}/>}
        />)
}
