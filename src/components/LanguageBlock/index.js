import React from "react";
import volumeLogo from "@assets/images/soundicon.svg";
import './styles.scss';
import PropTypes from "prop-types";

export const LanguageBlock = (props) => {
    return (
        <div className={props.class}>
            <div className="audioImg">
            {props?.audio?.join('').length>0 && <img src={volumeLogo} alt='' />}
            </div>
            <div className={props.center ? 'language-section-container language-popup-center' : 'language-section-container'}>
                {
                    props.audio && props.audio.length > 0 && props.audio.map((single, i) => {
                        return (
                            <div key={i} className='language-block'>
                                <span className='language-text'>{single}</span>
                                <div className={props.audio.length === i + 1 ? '' : 'bullet-points'} />
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

LanguageBlock.propTypes = {
    class: PropTypes.string,
    audio: PropTypes.array,
    center: PropTypes.bool,
};