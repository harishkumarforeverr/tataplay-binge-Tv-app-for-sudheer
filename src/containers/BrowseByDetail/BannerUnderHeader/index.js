import React from 'react';
import {BROWSE_TYPE} from '../APIs/constants';
import {
    capitalizeFirstLetter,
} from '@utils/common';
import placeHolder from '@assets/images/image-placeholder-content-language.png';
import PropTypes from "prop-types";

const BannerUnderHeader = (props) => {
    const { browseType, selectedGenre, selectedLanguage, bannerImg, bannerLogoImg, } = props;
    const lang = props?.location?.state?.pageType === 'search' ? props.params?.browseBy : capitalizeFirstLetter(selectedLanguage);
    const genre = props?.location?.state?.pageType === 'search' ? props.params?.browseBy : capitalizeFirstLetter(selectedGenre);
    return (
        // <div className="banner-height">
        <div className="banner-on-header">
            <div className="genre-languager-banner">

                <div className="genre-banner-img">
                    <img src={bannerImg ? bannerImg : placeHolder} alt=''/>
                </div>
                <div className="set-genre-text">
                    <div className="set-genre-text-inner">
                        <h3>{
                            browseType === BROWSE_TYPE.LANGUAGE
                                ? lang
                                : genre
                        }</h3>
                        {browseType === BROWSE_TYPE.LANGUAGE &&
                        <img src={bannerLogoImg ? bannerLogoImg : placeHolder} alt=''
                             onError={(e) => {
                                e.target.style.display='none';
                             }}
                        />}
                    </div>
                </div>
            </div>
        </div>
        // </div>
    )
}

export default BannerUnderHeader;
BannerUnderHeader.propTypes = {
    browseType: PropTypes.string,
    selectedGenre: PropTypes.string,
    selectedLanguage: PropTypes.string,
    bannerImg: PropTypes.string,
    bannerLogoImg: PropTypes.string,
}