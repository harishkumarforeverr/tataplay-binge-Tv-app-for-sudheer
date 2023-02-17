import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MOBILE_BREAKPOINT, SECTION_SOURCE } from '@utils/constants';
import isEmpty from 'lodash/isEmpty';

const LanguageFilter = (props) => {
    const { languageFilters, appWidth, renderFilterItem, renderSlider, DEFAULT_FILTER } = props;
    return (
        languageFilters?.contentList?.length > 0 && (
            <React.Fragment>
                <h4 className="list-heading no-horizontal-padding">{"Filter By Language"}</h4>
                <div className={`language-filter mb20 language-filter horizontal-scroll`}>
                    {
                        appWidth > MOBILE_BREAKPOINT ?
                            renderSlider(
                                languageFilters,
                                SECTION_SOURCE.LANGUAGE,
                                "searchLanguage",
                                languageFilters.title,
                                true,
                            )
                            :
                            <React.Fragment>
                                {!isEmpty(languageFilters) && renderFilterItem({
                                    item: DEFAULT_FILTER,
                                    source: SECTION_SOURCE.LANGUAGE,
                                    index: -1,
                                })}
                                {
                                    !isEmpty(languageFilters) && languageFilters.contentList.map((item, index) => renderFilterItem({ item: item, source: SECTION_SOURCE.LANGUAGE, index: index }),
                                    )}
                            </React.Fragment>
                    }
                </div>
            </React.Fragment>
        )
    )
}

export default LanguageFilter;