import React from 'react';
import PropTypes from "prop-types";
import imagePlaceholderDetailCircular from "@assets/images/image-placeholder-detail-circular.png";
import {getCircularLogo} from "@containers/PIDetail/PIDetailCommon";

export const CircularProvider = props => {
    let imageUrl = getCircularLogo(props.meta);
    return !imageUrl ?
        <img src={imagePlaceholderDetailCircular} alt={'place-holder-image'}
             className="circular-img broken-image"/> :
        <img className="circular-img" src={imageUrl} alt=""
             onError={(e) => {
                 e.target.onerror = null;
                 e.target.src = imagePlaceholderDetailCircular;
                 e.target.className = 'circular-img broken-image'
             }}/>
};

CircularProvider.propTypes = {
    meta: PropTypes.object,
};
