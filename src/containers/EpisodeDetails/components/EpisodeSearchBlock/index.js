import React from 'react';
import backArrowImage from "@assets/images/back-arrow.png";
import searchImage from "@assets/images/search.png";
import crossImage from "@assets/images/cross.png";
import PropTypes from "prop-types";
import {isMobile} from '@utils/common'

export const EpisodeSearchBlock = props => {
    const {resetOnBackArrowClick, searchEpisode, searchCrossClick, searchText, spaceCheck} = props;

    return <>
        <img alt=''
            onClick={() => resetOnBackArrowClick()}
            className="back-arrow"
            src={backArrowImage}
        />
        <div className="text-input-block">
            {
                isMobile.any() && <img className="search-text-action" src={searchImage} alt=''/>
            }
            <input
                value={searchText}
                autoComplete="off"
                search="true"
                type="text"
                maxLength="25"
                placeholder="Search for episodes"
                className="input-container"
                onChange={(e) => {
                    searchEpisode(e);
                }}
                onKeyPress={(e) => {
                    spaceCheck(e);
                }}
            />
            <img alt=''
                onClick={() => searchCrossClick()}
                className={
                    searchText.length > 0
                        ? "cross-text-action"
                        : "search-text-action"
                }
                src={
                    searchText.length > 0 ? crossImage : searchImage
                }
            />
        </div>
    </>
};

EpisodeSearchBlock.propTypes = {
    resetOnBackArrowClick: PropTypes.func,
    searchEpisode: PropTypes.func,
    searchCrossClick: PropTypes.func,
    searchText: PropTypes.string,
    spaceCheck: PropTypes.func,
};