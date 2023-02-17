import React from 'react';
import { SECTION_SOURCE, MOBILE_BREAKPOINT } from '@utils/constants';
import isEmpty from 'lodash/isEmpty';
import { useSelector } from 'react-redux';

const GenreFilter = (props) => {

    const browseByData = useSelector(state => state.browseBy?.browseByData);
    const { genreFilters, appWidth, renderSlider, DEFAULT_FILTER, renderFilterItem } = props;

    return (
        genreFilters?.contentList?.length > 0 && (
            <React.Fragment>
                <h4 className="list-heading no-horizontal-padding">{"Filter By Genre"}</h4>
                <div
                    className={`genre-filter  horizontal-scroll listing-${browseByData?.layoutType?.toLowerCase()}`}
                >
                    {
                        appWidth > MOBILE_BREAKPOINT ?
                            renderSlider(
                                genreFilters,
                                SECTION_SOURCE.GENRE,
                                "searchGenre",
                                genreFilters.title,
                                true,
                            )
                            :
                            <React.Fragment>
                                {!isEmpty(genreFilters) && renderFilterItem({
                                    item: DEFAULT_FILTER,
                                    source: SECTION_SOURCE.GENRE,
                                    index: -1,
                                })}
                                {
                                    !isEmpty(genreFilters) && genreFilters.contentList.map((item, index) => renderFilterItem({ item: item, source: SECTION_SOURCE.GENRE, index: index }),
                                    )}
                            </React.Fragment>
                    }
                </div>
            </React.Fragment>
        )
    )
}

export default GenreFilter;