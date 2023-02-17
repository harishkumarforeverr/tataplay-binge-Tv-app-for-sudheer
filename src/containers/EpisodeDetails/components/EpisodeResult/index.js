import React from 'react';
import {LAYOUT_TYPE} from "@constants";
import InfiniteScroll from "react-infinite-scroll-component";
import {isMobile} from "@utils/common";
import PaginationLoader from "@common/PaginationLoader";
import EpisodeListItem from "@common/EpisodeListItem";
import PropTypes from "prop-types";

export const EpisodeResult = props => {
    const {detail, loadMore, loadMoreDetails, showModal} = props;
    return <>
        {detail && detail.length > 0 && (
            <div className="seeall-content episode-list">
                <ul className={`seeall listing-${LAYOUT_TYPE.LANDSCAPE.toLowerCase()
                } `}>

                    <InfiniteScroll
                        dataLength={detail.length}
                        next={() => loadMoreDetails()}
                        hasMore={detail.length < loadMore}
                        scrollThreshold={isMobile.any() ? 0.3 : 0.8}
                        loader={<PaginationLoader/>}
                    >
                        {
                            <div className="infinite-scroll-container seeall-content">
                                {detail.map((item, idx) => {
                                    return (
                                        <EpisodeListItem key={idx} item={item} handleModal={showModal}/>
                                    );
                                })}
                            </div>
                        }
                    </InfiniteScroll>
                </ul>
            </div>
        )}
    </>
};

EpisodeResult.propTypes = {
    detail: PropTypes.array,
    loadMore: PropTypes.number,
    loadMoreDetails: PropTypes.func,
    showModal: PropTypes.func,
};