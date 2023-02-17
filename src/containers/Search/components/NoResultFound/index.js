import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { accountDropDown, recentSearch } from "@components/Header/APIs/actions";

const NoResultFound = () => {
    const dispatch = useDispatch();
    const recentSearchVal = useSelector(state => state.headerDetails.recentSearch)
    const accountDropDownVal = useSelector(state => state.headerDetails.accountDropDown)


    return (
        <div
            className="search-no-result"
            onClick={() => {
                recentSearchVal && dispatch(recentSearch(false));
                accountDropDownVal && dispatch(accountDropDown(false));
            }}
        >
            <p>No results found</p>
        </div>
    )
}


export default memo(NoResultFound);