import React, {useState, useEffect} from 'react';
import Button from "@common/Buttons";
import PropTypes from "prop-types";
import './style.scss';
import {time_convert} from "@utils/common";

export default function PlayerNext(props) {
    const {playerNextVal: {title, totalDuration, boxCoverImage, description}, initialVal,playNextBack, nextPlay} = props;
    const [count, setCount] = useState(initialVal);
    useEffect(() => {
        const interval = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="playNext-popup">
            <div className="back-image" style={{backgroundImage: `url(${boxCoverImage})`}}/>
            <i className="icon-back-2" onClick={() => playNextBack()}/>
            <div className="next-detail">
                <div className={"next-detail-block"}>
                <p>Starting in {count > 0 ? count : 0} seconds</p>
                <h5>{title}</h5>
                <h6>{description}</h6>
                <span>{time_convert(totalDuration)}</span>
                <Button bValue="Play Now" clickHandler={nextPlay} cName="btn primary-btn"/>
                </div>
            </div>
        </div>)
}

PlayerNext.propTypes = {
    playerNextVal: PropTypes.object,
    playNextBack: PropTypes.func,
    nextPlay: PropTypes.func,
    initialVal:PropTypes.number,
};
