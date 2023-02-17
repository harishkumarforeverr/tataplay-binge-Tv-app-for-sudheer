import React from 'react';
import {
    checkPartnerSubscribed,
    contentType,
    convertEpochTimeStamp,
    getAnalyticsRailCategory,
    getEpisodeVerbiage,
    getPlayAction,
    isMobile,
    showCrown
} from "@utils/common";
import {CircularProvider} from "@containers/PIDetail/components/CircularProvider";
import {PIDetailSection} from "@containers/PIDetail/components/PIDetailSection";
import crownLogo from "@assets/images/crown-icon.svg";
import {PIDescription} from "@containers/PIDetail/components/PIDescription";
import {LanguageBlock} from "@components/LanguageBlock";
import {CONTENTTYPE, CONTRACT, LOCALSTORAGE} from "@constants";
import SeriesButton from "@containers/PIDetail/components/SeriesButton";
import MIXPANEL from "@constants/mixpanel";
import MoviesButton from "@containers/PIDetail/components/MoviesButon";
import {getTitleAndDesc} from "@containers/PIDetail/PIDetailCommon";
import {getKey} from "@utils/storage";
import PropTypes from "prop-types";
import get from "lodash/get";

const PITitle = props => {
    const {meta, parentContentType} = props;
    return <p className='heading-title'>{getTitleAndDesc(meta, parentContentType)}</p>
};

export const PIUpperContent = props => {
    const {
        meta,
        contentType,
        parentContentType,
        handleModal,
        id,
        isFavouriteMarked,
        seriesList,
        mixpanelData,
        seriesProps,
        movieProps,
        commonProps,
        detail,
        lastWatch,
        time_convert,
        currentSubscription
    } = props;
    let result = id.split("?");
    let isTVOD = detail && detail.contractName === CONTRACT.RENTAL;
    let tvodInfo = JSON.parse(getKey(LOCALSTORAGE.TVOD_DATA));
    let data = tvodInfo && tvodInfo.find && tvodInfo.find(i => i.id === parseInt(result[0]));
    const playMovieBtn = getPlayAction(get(lastWatch, 'durationInSeconds'), get(lastWatch, 'secondsWatched'));
    let showEpisode = !checkPartnerSubscribed(currentSubscription, meta?.partnerId, meta?.provider) && meta?.freeEpisodesAvailable;

    return <div className="container detail">
        {
            isMobile.any() ?
            <>
                  {showEpisode && <div className={"episode-free"}>{getEpisodeVerbiage(true)}</div>}
                <div className={`mobile-detail-section ${meta.freeEpisodesAvailable && "episode-free-handling"}`}>
                    <CircularProvider meta={meta}/>
                    <div>
                        <PITitle meta={meta} parentContentType={parentContentType}/>
                        <PIDetailSection meta={meta} contentType={contentType} time_convert={time_convert} />
                    </div>
                    {
                        showCrown(meta) && <div className='image-crown-logo'>
                            <img className='crown-logo' src={crownLogo} alt=""/>
                        </div>
                    }
                </div>
                </> :
                <>
                   {showEpisode && <div className={"episode-free"}>{getEpisodeVerbiage(true)}</div>}
                    <div className='detail-title'>
                        <CircularProvider meta={meta}/>
                        <PITitle meta={meta} parentContentType={parentContentType}/>
                        {showCrown(meta) && <img className='crown-logo' src={crownLogo} alt=""/>}
                    </div>
                    <PIDetailSection meta={meta} contentType={contentType} time_convert={time_convert}/>
                </>
        }
        {isTVOD && data && data.rentalExpiry &&
            <div className='tvod-expiry'><span>Expires in: </span>
                <span>{convertEpochTimeStamp(parseInt(data.rentalExpiry))}</span></div>
        }
        <PIDescription meta={meta} parentContentType={parentContentType} handleModal={handleModal}/>
        <LanguageBlock center={false} class='language-section pi-detail-lang' audio={meta.audio}/>
        {[CONTENTTYPE.TYPE_BRAND, CONTENTTYPE.TYPE_TV_SHOWS, CONTENTTYPE.TYPE_SERIES].includes(contentType) ?
            <SeriesButton seriesList={seriesList} favorite={isFavouriteMarked}
                          playMovieBtn={playMovieBtn} seriesProps={seriesProps()}
                          commonProps={commonProps()}
                          railCategory={getAnalyticsRailCategory(mixpanelData?.sectionType, MIXPANEL)}/> :
            <MoviesButton favorite={isFavouriteMarked} playMovieBtn={playMovieBtn}
                          movieProps={movieProps()}
                          commonProps={commonProps()}
                          railCategory={getAnalyticsRailCategory(mixpanelData?.sectionType, MIXPANEL)}/>}
    </div>
};

PIUpperContent.propTypes = {
    meta: PropTypes.object,
    contentType: PropTypes.string,
    handleModal: PropTypes.func,
    id: PropTypes.string,
    isFavouriteMarked: PropTypes.bool,
    seriesList: PropTypes.array,
    mixpanelData: PropTypes.object,
    seriesProps: PropTypes.func,
    movieProps: PropTypes.func,
    commonProps: PropTypes.func,
    detail: PropTypes.object,
    lastWatch: PropTypes.object,
};