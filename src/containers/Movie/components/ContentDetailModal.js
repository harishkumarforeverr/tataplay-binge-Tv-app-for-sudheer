import React from "react";
import {isMobile} from "@utils/common";
import {LanguageBlock} from "@components/LanguageBlock";
import {getTitleAndDesc} from "@containers/PIDetail/PIDetailCommon";

const ContentDetail = ({text, data}) => {
    return <>
        <p className="movie-popup-detail-title">{text}</p>
        <div className="wrap-text">
            {data && data.length > 0 ? (
                data.map((act, index) => {
                    return (
                        <p key={index} className="movie-popup-detail-subtitle">
                            {act}&nbsp;
                            {data.length === index + 1 ? null : (
                                <span>|</span>
                            )}
                            &nbsp;
                        </p>
                    );
                })
            ) : (
                <p className="movie-popup-detail-subtitle">N/A</p>
            )}
        </div>
    </>
};

const ContentDetailModal = (props) => {
    const {meta} = props;

    return <React.Fragment>
        <div className="movie-popup movie-popup-movie">
            <p className="popup-header">
                {getTitleAndDesc(meta, meta?.parentContentType)}
            </p>
            <div className={`${isMobile.any() ? "desc-scroll-mobile" : "desc-scroll-large"}`}>
                <p className="popup-desc">
                    {getTitleAndDesc(meta, meta?.parentContentType, true)}
                </p>
            </div>
            <div className="movie-popup-divider"/>
            <div>
                {meta.actor && meta.actor.length>0 && <ContentDetail text={'Starring'} data={meta.actor}/>}
                {meta.actor && meta.director.length>0 &&<ContentDetail text={'Director'} data={meta.director}/>}
                {meta.actor && meta.genre.length>0 &&<ContentDetail text={'Genre'} data={meta.genre}/>}
            </div>
            <LanguageBlock
                center={true}
                audio={meta.audio}
                class="language-section mobile-movie-popup"
            />
        </div>
    </React.Fragment>;
}

export default ContentDetailModal;