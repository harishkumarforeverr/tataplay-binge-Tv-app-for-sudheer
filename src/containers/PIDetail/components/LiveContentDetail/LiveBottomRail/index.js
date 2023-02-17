import React from 'react';
import Listing from "@common/Listing";
import get from "lodash/get";
import { isEmpty } from 'lodash';
import { useDispatch } from 'react-redux'
import { fetchRailContent } from "@containers/Home/APIs/newAction.js";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from "prop-types";
import { setLiveRailId } from '@containers/PIDetail/API/actions';

export const LiveBottomRail = ({
    railId
}) => {
    const dispatch = useDispatch();
    const [railContent, setRailContent] = useState({})
    const liveRailContents = useSelector(state => get(state, 'homeDetails.railContent.data'));

    const fetchLiveRail = async () => {  
        railId && dispatch(setLiveRailId(railId));
        railId && (await dispatch(fetchRailContent(railId, true)));
    }
   
    useEffect(() => {
        fetchLiveRail()
    }, [railId]);

    useEffect(() => {
        setRailContent(liveRailContents);
    }, [liveRailContents])


    return <>
        {!isEmpty(railContent) &&
            <Listing
                items={[railContent]}
            />
        }
    </>
};

LiveBottomRail.propTypes = {
    fetchRailContent: PropTypes.func,
    liveRailContents: PropTypes.object
}
