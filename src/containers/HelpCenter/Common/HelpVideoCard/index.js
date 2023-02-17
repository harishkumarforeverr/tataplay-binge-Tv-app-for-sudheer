import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import get from "lodash/get";

import { URL } from '@constants/routeConstants';
import { cloudinaryCarousalUrl, isUserloggedIn, safeNavigation } from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";

import placeHolderImage from "../../../../assets/images/video-placeholder.jpg";
import { helpCenterPopularityTrack } from "../../APIs/action";

import './style.scss';
import '../../style.scss';

class HelpVideoCard extends Component {

    getYouTubeImageThumbnail = (thumbnailImageUrl) => {
        let height = 300, width = 170;
        if (thumbnailImageUrl) {
            return `${cloudinaryCarousalUrl('', '', height, width)}${thumbnailImageUrl}`;
        }
        else {
            return placeHolderImage;
        }
    }

    getYouTubeTime = (time) => {
        let displayTime = '';
        if (time && time > 0) {
            time < 60 ? displayTime = `${time}s` : displayTime = `${(time / 60).toFixed(2)}m`
        }
        return displayTime;
    }

    handleVideoOnClick = async (item) => {
        this.trackAnalytics(item?.title);
        if (isUserloggedIn()) {
            await this.props.helpCenterPopularityTrack(item).then(() => {
                safeNavigation(this.props.history, {
                    pathname: `/${URL.HELP_CENTER}/${URL.HC_VIDEO_DETAIL}/${item.id}/${item.type}`,
                })
            });
        }
        else {
            safeNavigation(this.props.history, {
                pathname: `/${URL.HELP_CENTER}/${URL.HC_VIDEO_DETAIL}/${item.id}/${item.type}`,
            })
        }
    }

    handleSeeAllVideoClick = () => {
        let { location: { pathname }, seeAllUrl, handleViewMoreClick } = this.props;
        const urlArr = pathname.split('/');
        if (urlArr.includes(URL.HC_VIDEO_SEE_ALL)) {
            handleViewMoreClick();
        }
        else {
            safeNavigation(this.props.history, {
                pathname: `/${URL.HELP_CENTER}/${URL.HC_VIDEO_SEE_ALL}`,
                state: {
                    seeAllUrl,
                },
            })
        }
    }

    VideoClickData = (analytics, title) => {
        return {
            [`${analytics.PARAMETER.SOURCE}`]: this.props.screenName,
            [`${analytics.PARAMETER.TITLE}`]: title,
        }
    };

    trackAnalytics = (title) => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.HELP_VIDEO_CLICK, this.VideoClickData(MIXPANEL, title));
        moengageConfig.trackEvent(MOENGAGE.EVENT.HELP_VIDEO_CLICK, this.VideoClickData(MOENGAGE, title));
    }

    render() {
        let { helpVideoList, title, wrapperClassName, showViewAllSection = false,
            viewAllBtnText = 'View All Videos' } = this.props;
        return (
            <section className={`help-video-card-section altBg video-wrapper ${wrapperClassName}`}>
                <div className="container">
                    {title && <div className="heading-md">
                        <h2 className="heading1">{title}</h2>
                    </div>}
                    <div className="body-container">
                        <ul className="video-contr">
                            {(helpVideoList || []).map((item, index) => {
                                return (
                                    <li
                                        key={index}
                                        className='helpvedio-item-wrapper'
                                        onClick={() => this.handleVideoOnClick(item)}>
                                        <a>
                                            <div className="img-contr">
                                                <img src={this.getYouTubeImageThumbnail(item?.thumbnailImageUrl)} alt="" title={title} className="img-fluid" />
                                                <div className="video-icon"><span className="play-icon" title="Play Video" /></div>
                                            </div>
                                            <div className="text-contr">
                                                <span className="text">{item.title}</span>
                                                <span className="time-duration">{this.getYouTubeTime(item?.duration)}</span>
                                            </div>
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    {showViewAllSection &&
                        <div className="text-center vdo-btn-contr">
                            <a className="btn btn-tertiary waves-effect waves-light"
                                onClick={this.handleSeeAllVideoClick}>
                                {viewAllBtnText}
                            </a>
                        </div>}
                </div>
            </section>
        )
    }
}

const mapStateToProps = (state) => ({
    hCPopularityResp: get(state.helpCenterReducer, 'hCPopularityResp'),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            helpCenterPopularityTrack,
        }, dispatch),
    }
}

HelpVideoCard.propTypes = {
    helpVideoList: PropTypes.array,
    title: PropTypes.string,
    wrapperClassName: PropTypes.string,
    showViewAllSection: PropTypes.bool,
    viewAllBtnText: PropTypes.string,
    getHCViewMoredata: PropTypes.func,
    seeAllUrl: PropTypes.string,
    helpCenterPopularityTrack: PropTypes.func,
    hCPopularityResp: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    handleViewMoreClick: PropTypes.func,
    screenName: PropTypes.string,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(HelpVideoCard);