import React, { memo } from 'react';
import { isMobile } from '@utils/common';
import { useSelector } from 'react-redux';
import { SECTION_SOURCE } from '@utils/constants';
import Listing from '@common/Listing';
import TrendingData from '../TrendingData';
import { isEmpty } from 'lodash';

const SearchBottomSection = (props) => {
    const searchLandingInfo = useSelector(state => state.browseBy?.searchLandingInfo);
    const browseByData = useSelector(state => state.browseBy?.browseByData);
    const { appInfo, categoryInfo } = searchLandingInfo;
    const { showRailsOnLoadInMobileView, renderSlider, languageFilters, genreFilters, loadMoreTrending, handleClick, browseByDataItems } = props;
    
    return (
        ((isMobile.any() && showRailsOnLoadInMobileView) || browseByData?.totalSearchCount === 0 || isEmpty(browseByDataItems)) &&
        <div className={`search-list container-top rails no-search-result top0`}>
            <div className="rails-container">
                {
                    !isMobile.any() && <div className="app-provider-container">
                        {
                            appInfo && <div className="listing-circular">
                                <div className="search-result-header no-horizontal-padding">
                                    <h4 className="list-heading no-horizontal-padding">
                                        {appInfo.title}
                                    </h4>
                                </div>
                                {renderSlider(appInfo, appInfo.sectionSource, appInfo.layoutType, appInfo.newRailTitle)}
                            </div>
                        }
                    </div>
                }
                {
                    languageFilters?.contentList?.length > 0 &&
                    <Listing
                        items={[languageFilters]}
                        contentType={SECTION_SOURCE.LANGUAGE}
                        id={new Date().getTime()}
                    />
                }
                {
                    genreFilters?.contentList?.length > 0 &&
                    <Listing
                        items={[genreFilters]}
                        contentType={SECTION_SOURCE.GENRE}
                        id={new Date().getTime()}
                    />
                }
                {
                    isMobile.any() && <div className="app-provider-container">
                        {
                            appInfo &&
                            <Listing
                                items={[appInfo]}
                                contentType={appInfo.sectionSource}
                                id={new Date().getTime()}
                            />
                        }
                    </div>
                }
                {
                    categoryInfo &&
                    <Listing
                        items={[categoryInfo]}
                        contentType={SECTION_SOURCE.CATEGORY}
                        id={new Date().getTime()}
                    />
                }
            </div>
            {
                isMobile.any() && <TrendingData
                    loadMoreTrending={loadMoreTrending}
                    handleClick={handleClick}
                />
            }
        </div>
    )
}

export default SearchBottomSection;