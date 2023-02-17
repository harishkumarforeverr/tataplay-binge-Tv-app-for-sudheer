import React, { memo } from 'react';
import { isMobile } from "@utils/common";


const ResultHeader = (props) => {
    const { totalSearchCount, searchText, toggleFilter, isFilterExpanded,isLoading } = props;
    return (
        <div className={`search-result-header ${isLoading&&"filter"}`}>
           {!isLoading&& <h3 className="list-heading">
                {isMobile.any() ? `${totalSearchCount || totalSearchCount} results found` : `${totalSearchCount || totalSearchCount} results from "${searchText}"`}
                {/* for &quot;{searchText ? searchText : this.values ? this.values['?q'] : null}&quot; */}
            </h3>}
            <h3 className="search-filter-toggle" onClick={() => toggleFilter()} >
                {isMobile.any() ? `Filter  ` : `Filters `}
                {/* <img src="../../../assets/images/Shape.png"  className={`icon ${this.state.isFilterExpanded ? "expanded" : ""
                                            }`} alt="right-img"/> */}
                <i
                    className={`icon-down ${isFilterExpanded ? "expanded" : ""
                        }`}
                />
            </h3>
        </div>
    )
}


export default memo(ResultHeader);