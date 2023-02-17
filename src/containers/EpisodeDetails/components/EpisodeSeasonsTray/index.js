import React from 'react';
import {isMobile} from "@utils/common";
import PropTypes from "prop-types";

export const EpisodeSeasonsTray = props => {
    const {detail, leftSeasonArrow, rightSeasonArrow, searchText, seriesId, seriesList, allClick, fetchSeasonDetail, seasonsScroll} = props;
    return <>
        {detail && detail.length === 0 ? '':
            <div className={`seasons-block seasons-margin ${leftSeasonArrow && !isMobile.any() && 'left-arrow'}`}>
                { seriesList?.length > 0 &&
                    <ul
                        className="seasons-number"
                        id="seasons-list"
                        onScroll={() => seasonsScroll()}
                    >
                        {leftSeasonArrow && !isMobile.any() && (
                            <i
                                className="left-icon"
                                onClick={() =>
                                    (document.getElementById("seasons-list").scrollLeft -= 500)
                                }
                            />
                        )}

                        {searchText && (
                            <li onClick={() => allClick()} className={searchText && !seriesId && "active"}>
                                All
                            </li>
                        )}
                        {!searchText && seriesList && seriesList.length > 0 &&
                            seriesList.map((item, index) => {
                                return (
                                    <li
                                        onClick={() => fetchSeasonDetail(item.id)}
                                        className={`${
                                            seriesId === item.id ? "active" : undefined
                                        }`}
                                        key={index}
                                    >
                                        {item.seriesName}
                                    </li>
                                );
                            })}

                        {rightSeasonArrow && !isMobile.any() && (
                            <i
                                className="right-icon"
                                onClick={() =>
                                    (document.getElementById("seasons-list").scrollLeft += 500)
                                }
                            />
                        )}
                    </ul>
                }
            </div>
        }
    </>
};

EpisodeSeasonsTray.propTypes = {
    detail: PropTypes.array,
    leftSeasonArrow: PropTypes.bool,
    rightSeasonArrow: PropTypes.bool,
    searchText: PropTypes.string,
    seriesId: PropTypes.any,
    seriesList: PropTypes.array,
    allClick: PropTypes.func,
    fetchSeasonDetail: PropTypes.func,
};