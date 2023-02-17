import React, { memo } from 'react';
import isEmpty from 'lodash/isEmpty';
import { isMobile } from '@utils/common';
import InfiniteScroll from 'react-infinite-scroll-component';
import PaginationLoader from '@common/PaginationLoader';
import PropTypes from 'prop-types';
import SearchResultItem from './SearchResultItem';
import { trackWindowScroll } from 'react-lazy-load-image-component';

const SearchResult = (props) => {
    const { browseByDataItems, browseByData, scrollPosition } = props;
    return (
        !isEmpty(browseByDataItems) && browseByData?.totalSearchCount > 0 && (
            <ul
                className={`grid-view listing-${browseByData.layoutType.toLowerCase()}`}
            >
                <InfiniteScroll
                    dataLength={browseByDataItems && browseByDataItems.length}
                    next={props.loadMore}
                    hasMore={
                        (browseByDataItems.length < browseByData.totalSearchCount) && browseByData?.contentList?.length
                    }
                    loader={<PaginationLoader />}
                    scrollThreshold={isMobile.any() ? 0.3 : 0.8}
                >
                    {!isEmpty(browseByDataItems) &&
                        browseByDataItems.map((item, i) => (
                            <SearchResultItem 
                                item={item}
                                index={i} 
                                key={i} 
                                layoutType={browseByData?.layoutType}
                                title={browseByData?.title}
                                handleClick={props.handleClick} 
                                scrollPosition={scrollPosition}
                            />
                        ))}
                </InfiniteScroll>
            </ul>
        )
    )
}
SearchResult.propTypes = {
    loadMore: PropTypes.func,
    handleClick: PropTypes.func,
    browseByData: PropTypes.object,
    browseByDataItems: PropTypes.array

}
export default memo(trackWindowScroll(SearchResult));