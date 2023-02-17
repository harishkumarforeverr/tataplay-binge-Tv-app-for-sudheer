import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import InfiniteScroll from 'react-infinite-scroll-component';
import { isMobile } from '@utils/common';
import { SECTION_SOURCE } from "@constants";
import ListingItem from "@common/ListingItem";

const TrendingData=(props)=>{
     const trendingDataItems=useSelector(state=>state.browseBy?.trendingDataItems);
     const trendingData=useSelector(state=>state.browseBy?.trendingData);
     
    return(
        <div className="trending-section">
        {
            !isEmpty(trendingDataItems) && <React.Fragment>
                <h3 className="list-heading no-horizontal-padding">Trending</h3>
                <ul style={{marginTop:10}} className={`grid-view no-horizontal-padding listing-${trendingData.layoutType.toLowerCase()}`}>
                        <InfiniteScroll
                            dataLength={trendingDataItems && trendingDataItems.length}
                            next={props.loadMoreTrending}
                            hasMore={
                                trendingDataItems.length < trendingData.totalSearchCount
                            }
                            loader=""
                            scrollThreshold={isMobile.any() ? 0.3 : 0.8}
                        >
                        {trendingDataItems.map((item, i) =>
                            <ListingItem 
                                item={item}
                                key={i}
                                view={trendingData.layoutType}
                                sectionSource={SECTION_SOURCE.SEARCH}
                                title={item.title} pageType={"search"}
                                onClickHandler={props.handleClick}
                                classNameSetHover="set-hover-search"/>,
                                )}
                        </InfiniteScroll>
                    </ul>
                    </React.Fragment>
                }
            </div>

    )
}

export default memo(TrendingData);