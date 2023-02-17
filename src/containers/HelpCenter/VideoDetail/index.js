import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";
import { isEmpty } from "lodash";

import { hideMainLoader, showMainLoader } from "@src/action";
import { isUserloggedIn, safeNavigation } from "@utils/common";
import { URL } from "@constants/routeConstants";

import { getSearchResult } from "../APIs/action";
import {
  ACCORDION_DEFAULT_LIMIT,
  checkEmbedLink,
  OFFSET_DEFAULT_VALUE,
} from "../APIs/constants";
import SubHeader from "../SubHeader";
import HelpVideoCard from "../Common/HelpVideoCard";
import YouTubePlayer from "../Common/YouTubePlayer";
import HelpfulTracker from "../Common/HelpfulTracker";

import "./style.scss";
import "../style.scss";

class VideoDetail extends Component {
  componentDidMount = () => {
    this.fetchVideoDetail();
  };

  componentDidUpdate = (prevProps) => {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.fetchVideoDetail();
    }
  };

  fetchVideoDetail = async () => {
    let { getSearchResult, hideMainLoader, showMainLoader } = this.props;

    const userType = isUserloggedIn() ? "LOGGED_IN " : "GUEST";
    const { id, type } = this.props.match.params;
    let params = {
      id: id,
      type: type ? type : "HELP_VIDEO",
      limit: ACCORDION_DEFAULT_LIMIT,
      offset: OFFSET_DEFAULT_VALUE,
      visibleTo: userType,
    };
    showMainLoader();
    await getSearchResult(params);
    if (isEmpty(this.props.searchResultData?.details)) {
      safeNavigation(this.props.history, {
        pathname: `/${URL.HELP_CENTER}`,
      });
    }
    hideMainLoader();
  };

  render() {
    let { searchResultData, searchResultDataHelpVideos } = this.props;

    return (
      <div className="help-center-container">
        <React.Fragment>
          <div className="video-detail-page">
            <SubHeader title={"Videos"} />
            <div className="result-section">
              <section className="altBg">
                <div>
                  <div className="container">
                    <div className="pT0 indv-video-contr">
                      <div className="heading-md">
                        <h1 className="heading1 gradient mB0">
                          {searchResultData?.details?.title}
                        </h1>
                      </div>
                      <div className="body-contr">
                        <div className="video-contr">
                          {checkEmbedLink(searchResultData?.details) && (
                            <div className="sub-cat-section mT20">
                              <YouTubePlayer
                                contentId={searchResultData.details.id}
                                videoLink={
                                  searchResultData.details.diyVideoLink
                                    ? searchResultData.details.diyVideoLink
                                    : searchResultData.details.videoLink
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="innercontainer-md mT30">
                          <div
                            className="content-detail"
                            dangerouslySetInnerHTML={{
                              __html: searchResultData?.details?.response,
                            }}
                          />
                          {checkEmbedLink(searchResultData?.details) && (
                            <HelpfulTracker
                              trackDetails={searchResultData?.details}
                              isSubTypePlacement
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          {searchResultDataHelpVideos &&
            searchResultDataHelpVideos?.rail.length > 0 && (
              <div className="related-video-section">
                <HelpVideoCard
                  title={searchResultDataHelpVideos.title}
                  wrapperClassName="wrapper-background"
                  helpVideoList={searchResultDataHelpVideos.rail}
                  seeAllUrl={searchResultDataHelpVideos?.seeAllUrl}
                  showViewAllSection={
                    searchResultDataHelpVideos?.totalCount >
                    searchResultDataHelpVideos?.rail?.length
                  }
                />
                {/* <div className="horizontal-line"></div> */}
              </div>
            )}
          {checkEmbedLink(searchResultData?.details) && (
            <div
              className="need-help"
              style={{
                borderTop: "1px solid rgba(34, 0, 70, .1)",
                boxShadow: " inset 0px 11px 8px -10px rgb(0 0 0 / 10%)",
              }}
            >
              {" "}
              <HelpfulTracker isSubTypePlacement={false} />
            </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  searchResultData: get(state.helpCenterReducer, "searchResultData.data"),
  searchResultDataHelpVideos: get(
    state.helpCenterReducer,
    "searchResultData.data.helpVideos"
  ),
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        showMainLoader,
        hideMainLoader,
        getSearchResult,
      },
      dispatch
    ),
  };
}

VideoDetail.propTypes = {
  showMainLoader: PropTypes.func,
  hideMainLoader: PropTypes.func,
  getSearchResult: PropTypes.func,
  searchResultData: PropTypes.object,
  searchResultDataHelpVideos: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
  history: PropTypes.object,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(VideoDetail);
