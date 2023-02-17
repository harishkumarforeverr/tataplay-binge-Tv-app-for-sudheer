import React, { Fragment } from 'react';
import { connect } from "react-redux";

import PlayerSubtitles from "@containers/PlayerWeb/PlayerSubtitles";
import PlayerVideoQuality from "@containers/PlayerWeb/PlayerVideoQuality";
import { isUserloggedIn, loginInFreemium, secondsToHms, time_convert } from "@utils/common";
import get from "lodash/get";
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css';
import './style.scss';
import PropTypes from "prop-types";
import { getKey, setKey } from "@utils/storage";
import { LOCALSTORAGE ,MINI_SUBSCRIPTION} from "@constants";
import firebase from '@utils/constants/firebase';

class PlayerFooter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentTime: false,
            volumeChange: false,
            currentTimeVal: 0,
        }
        this.subtitleActiveIndex = JSON.parse(getKey(LOCALSTORAGE.SUBTITLE)) && JSON.parse(getKey(LOCALSTORAGE.SUBTITLE)).index;
    }

    componentDidMount() {
        let element = document.getElementsByClassName('rangeslider__handle')[0];
        let tag = document.createElement("span");
        let tagText = document.createTextNode(secondsToHms(this.props.playerFooter.currentTime));
        tag.appendChild(tagText)
        tag.setAttribute('class', "current-time")
        element.appendChild(tag);
        element.addEventListener('mousemove', this.setTime(this.props.playerFooter.currentTime));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.playerFooter.currentTime !== prevState.currentTimeVal) {
            this.setTime(prevProps.playerFooter.currentTime)
        }
    }

    setTime = (currentTime) => {
        let element = document.getElementsByClassName('current-time')[0];
        let time = currentTime;
        let classNameCheck = time > 3600 ? 'centre-hr' : time > 180 ? 'centre-min' : '';
        element.setAttribute('class', 'current-time ' + classNameCheck)
        element.innerText = secondsToHms(time);
        this.setState({
            currentTimeVal: currentTime,
        })
    }

    subtitleActive = (index) => {
        this.subtitleActiveIndex = index;
    }

    audioActive = (index) => {
        this.audioActiveIndex = index;
    }

    changeStart = () => {
        this.volumeComplete = true;
    }

    setVolumeState = () => {
        this.volumeComplete = false;
        this.timer = setTimeout(() =>
            !this.volumeHover && this.setState((prevState) => {
                return {
                    volumeChange: prevState.false,
                }
            }), 1000,
        )

        let volumeState = this.props.playerFooter.volumeIcon;
        if (volumeState === 'icon-mute') {
            setKey(LOCALSTORAGE.PLAYER_MUTE, JSON.stringify(true));
        } else {
            setKey(LOCALSTORAGE.PLAYER_MUTE, JSON.stringify(false));
        }
    }

    watchListClick = async () => {
        let getSource = firebase.VALUE.PLAYBACK;
        const {
            playerFooter: { watchlistClick, controlsVisibility, openPopup, closePopup, openLoginPopup }
        } = this.props;
        if (isUserloggedIn()) {
            watchlistClick();
            controlsVisibility()
        } else {
            await loginInFreemium({ openPopup, closePopup, openLoginPopup, source: firebase.VALUE.PLAY_CLICK, getSource , ComponentName:MINI_SUBSCRIPTION.PLAN_SELECT });
        }
    }

    render() {
        const {
            playerFooter: {
                currentTime,
                videoPercent,
                nextPrevClick,
                playerDuration,
                progressClickHandler,
                progressCompleteHandler,
                subtitleClickHandler,
                videoQualityClickHandler,
                subtitleList,
                audioList,
                videoQualityList,
                videoQualityListClickHandler,
                audioActiveIndex,
                subtitleActiveIndex,
                setSubtitle,
                setAudio,
                activeAudioItem,
                activeSubtitleItem,
                videoQualityActiveIndex,
                addedWatchlist,
                volumeIcon,
                expand,
                minimise,
                toggleActiveSubtitleItem,
                enlarge,
                url,
                controlsVisibility,
                volumeClick,
                volumeHover,
                volumePercent,
                volumeBarClick,
                toggleActiveAudioItem,
                isHungama,
                isSonyLiv,
                provider,
                isTrailer,
                isLiveStatus
            }, nextEpisodeExists, previousEpisodeDetail, previousEpisodeExists, nextEpisodeDetail,
        } = this.props;
        return (
            <footer className={`${enlarge ? 'full-screen' : ''}`}>
                <div className={`seekbar ${isLiveStatus && 'hide'}`}>
                    <div className={`${playerDuration - currentTime > 3600 ? 'hr-case-seekbar' : 'min-case-seekbar'}`}>
                        <Slider
                            orientation="horizontal"
                            valueLabelDisplay="auto"
                            value={videoPercent}
                            onChange={e => {
                                progressClickHandler(e, this.setTime);
                            }}
                            onChangeComplete={e => {
                                progressCompleteHandler(e)
                            }}
                            tooltip={false}
                        />
                    </div>
                    <p className={`endTime ${playerDuration - currentTime > 3600 ? 'hr-case' : 'min-case'}`}>{secondsToHms(playerDuration - currentTime)}</p>
                </div>
                <div className="controls">
                    <div className="controls-left">
                        {previousEpisodeExists && !isTrailer && <i className="icon-select-prev" onClick={() => nextPrevClick('prev')}>
                            {previousEpisodeDetail   && <div className="prev-episode-detail">
                                <h5>Play Previous Episode</h5>
                                <div className='next-image'>
                                    <img src={previousEpisodeDetail.boxCoverImage} alt='' />
                                </div>
                                <div className='next-detail-content'>
                                    <h4>{previousEpisodeDetail.title}</h4>
                                    <p className='duration'>{`${time_convert(previousEpisodeDetail.totalDuration)} `}</p>
                                    <p className='description'>
                                        {previousEpisodeDetail.description}
                                    </p>
                                </div>

                            </div>}
                        </i>}
                    </div>
                    <div className="controls-right">
                        {nextEpisodeExists && !isTrailer && <i className="icon-select-prev" onClick={() => nextPrevClick('next')}>
                            {nextEpisodeDetail && <div className="next-episode-detail">
                                <h5>Play Next Episode</h5>
                                <div className='next-image'>
                                    <img src={nextEpisodeDetail.boxCoverImage} alt='' />
                                </div>
                                <div className='next-detail-content'>
                                    <h4>{nextEpisodeDetail.title}</h4>
                                    <p className='duration'>{`${time_convert(nextEpisodeDetail.totalDuration)}`}</p>
                                    <p className='description'>
                                        {nextEpisodeDetail.description}
                                    </p>
                                </div>

                            </div>}
                        </i>}

                        <i className={volumeIcon} onMouseOver={() => {
                            this.setState({ volumeChange: true });
                            volumeHover();
                            controlsVisibility();
                            this.volumeHover = true
                        }} onClick={() => {
                            volumeClick();
                            this.volumeComplete = false
                        }}
                            onMouseOut={() => {
                                this.volumeHover = false;
                                !this.volumeComplete && this.setState({
                                    volumeChange: false,
                                });
                            }}>
                            <div className="volume-parent" />
                            <div
                                className={`volume seekbar ${this.state.volumeChange ? 'volume-change' : 'no-volume-change'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    controlsVisibility()
                                }}>
                                <Slider
                                    orientation="vertical"
                                    valueLabelDisplay="auto"
                                    value={volumePercent}
                                    onChangeStart={this.changeStart}
                                    onChangeComplete={this.setVolumeState}
                                    onChange={volumeBarClick}
                                    tooltip={false}
                                // format={value => <span className={`current-time ${currentTime
                                // >3600 ? 'centre-hr':currentTime>180?'centre-min':''}`}>{secondsToHms(currentTime)}</span>}
                                />
                            </div>
                        </i>

                        <i className={`${addedWatchlist ? 'icon-fav' : 'icon-star-empty'}`}
                            onClick={() => this.watchListClick()} />
                        {!url.includes('trailer') &&
                            <Fragment><i className="icon-audio-and-subtitles" onMouseOver={() => {
                                subtitleList && subtitleClickHandler(this.audioActiveIndex, this.subtitleActiveIndex);
                                controlsVisibility()
                            }}
                                onMouseOut={() => controlsVisibility()}>
                                <div className="volume-parent" />
                                <PlayerSubtitles subtitleList={subtitleList} audioActive={this.audioActive}
                                    setSubtitle={setSubtitle} setAudio={setAudio}
                                    controlsVisibility={controlsVisibility}
                                    audioActiveIndex={audioActiveIndex}
                                    subtitleActiveIndex={subtitleActiveIndex}
                                    subtitleActive={this.subtitleActive} audioList={audioList}
                                    subtitleClickHandler={subtitleClickHandler}
                                    toggleActiveAudioItem={toggleActiveAudioItem}
                                    toggleActiveSubtitleItem={toggleActiveSubtitleItem}
                                    activeAudioItem={activeAudioItem}
                                    activeSubtitleItem={activeSubtitleItem} isSonyLiv={isSonyLiv}
                                />
                            </i>
                                <i className="icon-settings" onMouseOver={() => {
                                    videoQualityList && videoQualityClickHandler();
                                    controlsVisibility();
                                }} onMouseOut={() => controlsVisibility()}>
                                    <div className="volume-parent" />

                                    <PlayerVideoQuality videoQualityActiveIndex={videoQualityActiveIndex}
                                        videoQualityListClickHandler={videoQualityListClickHandler}
                                        controlsVisibility={controlsVisibility}
                                        videoQualityClickHandler={videoQualityClickHandler} isSonyLiv={isSonyLiv}
                                        videoQualityList={videoQualityList} isHungama={isHungama} provider={provider} />
                                </i></Fragment>}
                        {!enlarge && <i className="icon-enlarge" onClick={() => expand()} />}
                        {enlarge && <i className="icon-minimise" onClick={() => minimise()} />}
                    </div>
                </div>
            </footer>
        );
    }
}

const mapStateToProps = (state) => ({
    nextEpisodeExists: get(state.playerWatchlist, 'checkEpisode.nextEpisodeExists'),
    previousEpisodeExists: get(state.playerWatchlist, 'checkEpisode.previousEpisodeExists'),
    nextEpisodeDetail: get(state.playerWatchlist, 'checkEpisode.nextEpisode'),
    previousEpisodeDetail: get(state.playerWatchlist, 'checkEpisode.previousEpisode'),
});

PlayerFooter.propTypes = {
    url: PropTypes.string,
    nextEpisodeDetail: PropTypes.object,
    previousEpisodeDetail: PropTypes.object,
    nextEpisodeExists: PropTypes.bool,
    previousEpisodeExists: PropTypes.bool,
    currentTime: PropTypes.number,
    videoPercent: PropTypes.number,
    nextPrevClick: PropTypes.func,
    playerDuration: PropTypes.number,
    progressClickHandler: PropTypes.func,
    subtitleClickHandler: PropTypes.func,
    videoQualityClickHandler: PropTypes.func,
    subtitleList: PropTypes.array,
    audioList: PropTypes.array,
    videoQualityList: PropTypes.array,
    videoQualityListClickHandler: PropTypes.func,
    audioActiveIndex: PropTypes.number,
    subtitleActiveIndex: PropTypes.number,
    setSubtitle: PropTypes.func,
    setAudio: PropTypes.func,
    videoQualityActiveIndex: PropTypes.number,
    watchlistClick: PropTypes.func,
    addedWatchlist: PropTypes.bool,
    expand: PropTypes.func,
    minimise: PropTypes.func,
    enlarge: PropTypes.bool,
    volumeIcon: PropTypes.string,
    controlsVisibility: PropTypes.func,
    volumeClick: PropTypes.func,
    volumeHover: PropTypes.func,
    volumePercent: PropTypes.number,
    volumeBarClick: PropTypes.func,
    playerFooter: PropTypes.object,
    progressCompleteHandler: PropTypes.func,
    isHungama: PropTypes.bool,
    isSonyLiv: PropTypes.bool,
    provider:PropTypes.string,
    isTrailer:PropTypes.string,

};

export default connect(mapStateToProps, null)(PlayerFooter);

