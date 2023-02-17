import React, { Component } from 'react';
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { fetchLiveContentData } from '@containers/PIDetail/API/actions';
import { LiveUpperContent } from './LiveUpperContent';
import './style.scss';
import PropTypes from "prop-types";
import { trackEvent } from '@containers/PIDetail/PIDetailCommon';
import { get } from "lodash";
import { cloudinaryCarousalUrl } from '@utils/common';
import { LiveBottomRail } from './LiveBottomRail';

class LiveContentDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
        }
    }

    componentDidMount = async () => {
        await this.fetchLiveData();
        trackEvent(this);
    }

    componentDidUpdate = async (prevProps) => {
        if (prevProps.location.pathname !== this.props.location.pathname) {
            await this.fetchLiveData();
            trackEvent(this);
        }
    }

    fetchLiveData = async () => {
        const { location, fetchLiveContentData } = this.props;
        let urlArr = location.pathname.split("/");
        this.setLoadingState(true);
        await fetchLiveContentData(urlArr[3]);
        this.setLoadingState(false);
    }

    setLoadingState = (data) => {
        this.setState({
            isLoading: data
        });
    }

    render() {
        const { meta, channelMeta, playLiveClick, railId } = this.props;
        const { isLoading } = this.state;
        let width = 926, height = 462;

        return (
            <React.Fragment>
                {!isLoading &&
                    <React.Fragment>
                        <div
                            className="live-detail-container"
                        >
                            <div
                                className={`live-detail-background`}
                            >
                                <img
                                    // src={meta?.boxCoverImage}
                                    src={`${cloudinaryCarousalUrl('', '', width, height)}${(meta?.boxCoverImage)}`}
                                    alt="" onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '';
                                        e.target.className = 'broken-image'
                                    }} />
                            </div>
                            <LiveUpperContent
                                meta={meta}
                                channelMeta={channelMeta}
                                playLiveClick={playLiveClick}
                            />
                        </div>
                        {<LiveBottomRail railId={railId}  />}
                        </React.Fragment>}

            </React.Fragment>)
    }
};

const mapStateToProps = (state) => {
    return {
        meta: get(state.PIDetails, 'liveDetail.data.meta[0]'),
        channelMeta: get(state.PIDetails, 'liveDetail.data.channelMeta'),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                fetchLiveContentData,
            },
            dispatch,
        ),
    };
}

LiveContentDetail.propTypes = {
    playLiveClick: PropTypes.func,
    meta: PropTypes.object,
    channelMeta: PropTypes.object,
    liveMetaData: PropTypes.object,
    location: PropTypes.object,
    fetchLiveContentData: PropTypes.func,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(LiveContentDetail);
