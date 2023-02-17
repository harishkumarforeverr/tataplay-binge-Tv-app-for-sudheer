import React from 'react';
import PropTypes from "prop-types";
import { getTitleAndDesc} from "@containers/PIDetail/PIDetailCommon";
import ShowMoreText from "react-show-more-text";
import {isMobile} from "@utils/common";

export const PIDescription = props => {
    const {meta, handleModal, parentContentType} = props;
    return <div className="desc">
                <span className="description" id="description">
                        <ShowMoreText
                            lines={isMobile.any() ? 2 : 4}
                            more={'+More'}
                            onClick={(e) => {
                                handleModal()
                            }}
                            anchorClass='more-less alwaysVisible'
                            className={'more-content'}
                            expandByClick={false}
                            truncatedEndingComponent={''}
                            keepNewLines={true}
                        >
                            { 
                            getTitleAndDesc(meta, parentContentType, true)
                            }
                        </ShowMoreText>
                </span>
    </div>
};

PIDescription.propTypes = {
    meta: PropTypes.object,
    contentType: PropTypes.string,
    handleModal: PropTypes.func,
};
