import React from 'react';
import PropTypes from "prop-types";
import {CONTENTTYPE} from "@constants";

export const PIDetailSection = props => {
    const {meta, contentType ,time_convert} = props;
    return <>
        <div className="detail-list">
            {meta?.releaseYear ?
                <span className="year">{meta?.releaseYear}  </span> : null}
            {meta.genre && meta.genre[0] ? <span  className="genre"> {meta.genre[0]}  </span> : null}
            {!meta?.allowedForKids ?
                <span
                    className={meta.rating ? "age-resptriction" : null}>{meta?.rating && `${meta?.rating}`} </span> :
                null}
            {meta?.duration &&
            meta?.parentContentType !== CONTENTTYPE.TYPE_BRAND &&
            contentType !== CONTENTTYPE.TYPE_BRAND &&
            meta?.parentContentType !== CONTENTTYPE.TYPE_SERIES &&
            contentType !== CONTENTTYPE.TYPE_SERIES &&
            contentType !== CONTENTTYPE.TYPE_WEB_SHORTS ?
                <span
                    className="duration">{time_convert(meta?.duration)}</span> : null}
            {(meta?.contentType === CONTENTTYPE.TYPE_BRAND || meta?.parentContentType === CONTENTTYPE.TYPE_BRAND) && (meta?.hasOwnProperty('seasonCount') || meta?.hasOwnProperty('season')) ?
                <span
                    className="season">  {(meta?.seasonCount === 0 || meta?.season === 0) ? 'No' : meta?.seasonCount || meta?.season} {meta?.seasonCount <= 1 || meta?.season <= 1 ? 'Season' : 'Seasons'} </span> : null}

        </div>
    </>
};

PIDetailSection.propTypes = {
    meta: PropTypes.object,
    contentType: PropTypes.string,
};
