import React from 'react';
import isEmpty from 'lodash/isEmpty';
import './style.scss';
import PropTypes from "prop-types";

export default class PlayerSubtitles extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        this.clicked = false;
    }

    render() {
        let {
            setSubtitle,
            subtitleList,
            audioList,
            audioActiveIndex,
            subtitleActiveIndex,
            toggleActiveSubtitleItem,
            audioActive,
            subtitleActive,
            setAudio,
            subtitleClickHandler,
            toggleActiveAudioItem,
            activeAudioItem,
            activeSubtitleItem,
            isSonyLiv
        } = this.props;

        if (!subtitleList.some((item) => item.label === 'None')) {
            subtitleList.unshift({label: 'None', id: null})
        }
        if(audioList.length === 0 || (audioList[0] === '' && audioList.length === 1) ){
             audioList= [{label: 'None', id: null}];
        }
        return !this.clicked && <div className="tracks" onClick={(e) => e.stopPropagation()}>
            <div className="audio-tracks">
                <h4>Audio</h4>
                <ul>
                    {audioList.map((item, index) => <li key={index}
                                                        className={activeAudioItem[index] || (isEmpty(activeAudioItem) && audioActiveIndex === index) ? 'select' : ''}
                                                        onClick={(e) => {
                                                            toggleActiveAudioItem(e, index);
                                                            audioActive(index);
                                                            setAudio(isSonyLiv ? item : item.id);
                                                            subtitleClickHandler(index);
                                                            this.clicked = true;
                                                        }}>{item.label || item.lang || (typeof item === "string" && item)}</li>)}
                </ul>
            </div>
            <div className="subtitles-tracks">
                <h4>Subtitles</h4>
                <ul>
                    {subtitleList.map((item, index) => {
                        return (<li key={index}
                                    className={activeSubtitleItem[index] || (isEmpty(activeSubtitleItem) && subtitleActiveIndex === index) ? 'select' : ''}
                                    onClick={(e) => {
                                        subtitleActive(index);
                                        setSubtitle(isSonyLiv ? item : item.id, index);
                                        this.clicked = true;
                                        toggleActiveSubtitleItem(e, index);
                                        subtitleClickHandler('', index)
                                    }}>{item.label || item.lang || (typeof item === "string" && item)}</li>)
                    })}
                </ul>
            </div>
        </div>
    }
}

PlayerSubtitles.propTypes = {
    controlsVisibility: PropTypes.func,
    subtitleList: PropTypes.array,
    audioList: PropTypes.array,
    setSubtitle: PropTypes.func,
    audioActiveIndex: PropTypes.number,
    subtitleActiveIndex: PropTypes.number,
    audioActive: PropTypes.func,
    subtitleActive: PropTypes.func,
    setAudio: PropTypes.func,
    subtitleClickHandler: PropTypes.func,
    toggleActiveAudioItem: PropTypes.func,
    toggleActiveSubtitleItem: PropTypes.func,
    activeAudioItem: PropTypes.object,
    activeSubtitleItem: PropTypes.object,
    isSonyLiv: PropTypes.bool,
};
