import React, {useCallback} from "react";
import {secondsToHms, isMobile, showNoInternetPopup} from "@utils/common";
import imagePlaceholderLandscape from "@assets/images/image-placeholder-landscape.png";
import rightImage from "@assets/images/right.png";
import leftImage from "@assets/images/left.png";
import withContentPlay from '@components/HOC/withContentPlay';
import DATALAYER from "@utils/constants/dataLayer";
import PlayNext from '@assets/images/play-next-circle.svg';

const EpisodeModal = (props) => {
    let {
        id,
        detail,
        onClose,
        seriesPopupData,
        upDateId,
        onPlayContent,
        meta
    } = props;

    const playClick = useCallback(async () => {
        onClose();
        seriesPopupData?.episodeId && onPlayContent({
            ...seriesPopupData,
            type: 'seasonsType',
            isEpisodeContent: true
        })
    }, [props]);


    return <React.Fragment>
        <div className="image-container">
            <div className="season-container">
                <div className="image-season-container"
                     onClick={() => navigator.onLine ? playClick() : showNoInternetPopup()}>
                    <img
                        className="season-image"
                        src={seriesPopupData?.boxCoverImage}
                        alt=""
                        onError={(e) => {
                            e.target.onerror = null;
                            //e.target.src = imagePlaceholderLandscape;
                        }}
                    />
                    <img
                        className="video-icon"
                        alt="play-vedio-icon"
                        src={PlayNext}
                    />
                    <p className="duration">
                        {secondsToHms(seriesPopupData?.totalDuration)}
                    </p>
                </div>
            </div>
        </div>
        <div className="movie-popup movie-popup-series">
            <p className="popup-header-brand">
                {`Episode ${seriesPopupData?.episodeId}: ${seriesPopupData?.title}`}
            </p>
            <div className="divider-header-threedots"/>
            <div className={`${isMobile.any() ? "desc-scroll-mobile" : "desc-scroll-large"}`}>
                <p className="popup-desc series-desc">
                    {seriesPopupData?.description}
                </p>
            </div>
            <div className="prev-next">
                {id !== 0 ? (
                    <div
                        onClick={() => upDateId(id - 1, DATALAYER.VALUE.PREV_EPISODE, seriesPopupData?.episodeId)}
                        className="container-link"
                    >
                        <img className="arrow" src={leftImage}/>
                        <p
                            onClick={() => upDateId(id - 1)}
                            className="close-link"
                        >
                            Previous Episode
                        </p>
                    </div>
                ) : (
                    <div/>
                )}
                {id !== detail?.length - 1 ? (
                    <div
                        onClick={() => upDateId(id + 1, DATALAYER.VALUE.NEXT_EPISODE, seriesPopupData?.episodeId)}
                        className="container-link"
                    >
                        <p className="close-link">Next Episode</p>
                        <img className="arrow" src={rightImage}/>
                    </div>
                ) : (
                    <div/>
                )}
            </div>
        </div>
    </React.Fragment>;
}

// export default EpisodeModal;
export default withContentPlay(EpisodeModal);