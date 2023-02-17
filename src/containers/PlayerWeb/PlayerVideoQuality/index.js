import React from 'react';
import PropTypes from "prop-types";
import './style.scss';
import {CONSTANT} from "@constants/index";
import isEmpty from "lodash/isEmpty";
import {PROVIDER_NAME} from "@constants/playerConstant";


export default class PlayerVideoQuality extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeVideoQualityItem: {},
        }
    }

    componentDidUpdate() {
        this.clicked = false;
    }

    toggleActiveVideoQualityItem(e, imgId) {
        e.stopPropagation();
        this.props.controlsVisibility();
        const currentState = this.state.activeVideoQualityItem && this.state.activeVideoQualityItem[imgId];
        this.setState({activeVideoQualityItem: {[imgId]: currentState || true}})
    }

    itemCheck = (item) => {
        switch (item) {
            case 1080:
                return CONSTANT.VIDEOQUALITY.HIGH;
            case 480:
            case 720:
                return CONSTANT.VIDEOQUALITY.MEDIUM;
            case 360:
            case 270:
                return CONSTANT.VIDEOQUALITY.LOW;
            default:
                return false;
        }
    }

    setVideoQuality = () => {
        const {
            videoQualityList,
            videoQualityActiveIndex,
            isHungama,
            isSonyLiv,
            provider,
        } = this.props;
        let videoQualityListItem = videoQualityList;
        let getActiveIndex = videoQualityActiveIndex;

        if (!isHungama && !isSonyLiv) {
            videoQualityListItem = videoQualityList.filter((v, i, a) => a.findIndex(t => (t.height === v.height)) === i);
            videoQualityListItem.unshift(CONSTANT.VIDEOQUALITY.AUTO);
        }
        if([PROVIDER_NAME.VOOTSELECT, PROVIDER_NAME.VOOTKIDS].includes(provider)) {
            const removeItems = [720, 1080, CONSTANT.VIDEOQUALITY.AUTO];
            videoQualityListItem = videoQualityList.filter(function (value) {
                return !removeItems.includes(value.height);
            });
            const checkAutoIndex = (element) => element.height === 480 ? 480 : 0;
            let findIndex = videoQualityListItem.findIndex(checkAutoIndex)
            getActiveIndex = findIndex !== -1 ? findIndex : 0;
            videoQualityListItem = [...new Map(videoQualityListItem.map(item => [item.width, item])).values()];
        }
        if(provider?.toLowerCase() === PROVIDER_NAME.TRAVEL_XP) {
            videoQualityListItem = videoQualityListItem.sort((a, b) => {
                return a.height - b.height;
            });
        }
        videoQualityListItem = [...new Set(videoQualityListItem)];

        return {videoQualityListItem, getActiveIndex};
    };

    render() {
        const {
            videoQualityClickHandler,
            videoQualityListClickHandler,
        } = this.props;

        let {videoQualityListItem, getActiveIndex} = this.setVideoQuality();

        return (
            !this.clicked && <div className="video-quality" onClick={(e) => e.stopPropagation()}>
                <h4>Video Quality</h4>
                <ul>
                    {videoQualityListItem.map((item, index) => <li key={index} onClick={(e) => {
                        this.clicked = true;
                        videoQualityListClickHandler(item, index);
                        videoQualityClickHandler();
                        this.toggleActiveVideoQualityItem(e, index);
                    }}
                    className={this.state.activeVideoQualityItem[index] || (isEmpty(this.state.activeVideoQualityItem) &&
                    getActiveIndex === index) ? 'select' : ''}>{item.height ? `${item.height}p` : item}</li>)}
                </ul>
            </div>
        );
    }
}

PlayerVideoQuality.propTypes = {
    controlsVisibility: PropTypes.func,
    videoQualityList: PropTypes.array,
    videoQualityClickHandler: PropTypes.func,
    videoQualityListClickHandler: PropTypes.func,
    videoQualityActiveIndex: PropTypes.number,
    isHungama: PropTypes.bool,
    provider:PropTypes.string,
    isSonyLiv: PropTypes.bool,
}
