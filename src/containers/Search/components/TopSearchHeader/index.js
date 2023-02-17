import React, { memo, useState, useEffect } from 'react';
import ResultHeader from '../ResultHeader';
import LanguageFilter from '../LanguageFilter';
import GenreFilter from '../GenreFilter';
import { useSelector } from 'react-redux';
import ContentSwitch from '@common/ToggleSwitch/ContentSwitch';


const TopSearchHeader = (props) => {
    const {
        isShowTopHeader,
        renderSlider,
        searchText,
        isFilterExpanded,
        toggleFilter,
        appWidth,
        genreFilters,
        languageFilters,
        renderFilterItem,
        DEFAULT_FILTER,
        isLoading,
        getToggleVal,
        resetToggle,
        resetToggleVal,
    } = props;

    const totalSearchCount = useSelector(state => state.browseBy?.totalSearchCount)
    let freeToggleEnable = useSelector(state => state.headerDetails?.configResponse?.data?.config?.freeToggleEnable);
    const [toggleChange, setToggle] = useState(false)
    const handleOnChange = (value) => {
        setToggle(value);
        getToggleVal(value);
    };
    
    useEffect(() => {
        setToggle(false);
        resetToggleVal(false);
    }, [resetToggle]);

    return (
        isShowTopHeader && <>
            <ResultHeader
                isFilterExpanded={isFilterExpanded}
                totalSearchCount={totalSearchCount}
                toggleFilter={toggleFilter}
                searchText={searchText}
                isLoading={isLoading}
            />
            <div className={`filter-container ${isFilterExpanded ? "expanded" : ""
                }`}
            >
                {freeToggleEnable &&
                    <ContentSwitch
                        name={'contentType'}
                        value={toggleChange}
                        onToggleChange={(e) => handleOnChange(e.target.checked)} />
                }

                <LanguageFilter
                    renderSlider={renderSlider}
                    renderFilterItem={renderFilterItem}
                    appWidth={appWidth}
                    DEFAULT_FILTER={DEFAULT_FILTER}
                    languageFilters={languageFilters}
                />
                <GenreFilter
                    renderSlider={renderSlider}
                    renderFilterItem={renderFilterItem}
                    appWidth={appWidth}
                    genreFilters={genreFilters}
                    DEFAULT_FILTER={DEFAULT_FILTER}
                />
            </div>
        </>
    )
}

export default memo(TopSearchHeader);