import React from 'react';
import Listing from "@common/Listing";
import {getParentContentData, getTAUpdatedId} from "@containers/PIDetail/PIDetailCommon";
import get from "lodash/get";
import {CONTRACT} from "@constants";

export const PIRelatedRail = props => {
    const {taRecommendedRail, list, meta, detail, configResponse, taRecommendationList, contentType, id, location} = props;

    let result = id.split("?");
    let isTVOD = detail && detail.contractName === CONTRACT.RENTAL;
    let taRelatedRail = get(configResponse, 'config.taRelatedRail');
    let {updatedId, updatedContentType} = getParentContentData(meta);

    return <>
        {!taRecommendedRail && list &&
            <Listing items={[list]} recommended contentType={updatedContentType} id={updatedId}
                     isTVOD={isTVOD} addClass='no-bottom-container'
                     location= {location }
                     taRecommendedRail={taRecommendedRail} taShowType={meta && meta.taShowType}/>}
        {taRecommendedRail && taRecommendationList &&
            <Listing items={[taRecommendationList]} recommended contentType={contentType}
                     id={getTAUpdatedId(result[0], contentType, meta.vodId)}
                     addClass='no-bottom-container'
                     provider={meta.provider} taShowType={meta && meta.taShowType}
                     taRelatedRail={taRelatedRail}
                     location= {location}
                     taRecommendedRail={taRecommendedRail}/>}
    </>
};

PIRelatedRail.propTypes = {

}