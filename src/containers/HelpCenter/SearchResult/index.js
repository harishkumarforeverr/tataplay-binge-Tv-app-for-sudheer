import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";
import { isEmpty } from "lodash";

import { isUserloggedIn, safeNavigation } from "@utils/common";
import { hideMainLoader, showMainLoader } from "@src/action";
import { URL } from "@constants/routeConstants";

import Accordion from "../Common/Accordion";
import HelpVideoCard from "../Common/HelpVideoCard";
import Search from "../Common/Search";
import YouTubePlayer from "../Common/YouTubePlayer";
import HelpfulTracker from "../Common/HelpfulTracker";
import { getSearchResult, getHCViewMoredata } from "../APIs/action";
import {
  ACCORDION_DEFAULT_LIMIT,
  checkEmbedLink,
  OFFSET_DEFAULT_VALUE,
  ACTION,
} from "../APIs/constants";
import { HC_SCREEN_NAME } from "../APIs/constants";

import "../style.scss";
import "./style.scss";

class SearchResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      faqLimit: ACCORDION_DEFAULT_LIMIT,
      faqOffset: OFFSET_DEFAULT_VALUE,
      searchTextInputVal: "",
    };
  }

  componentDidMount = async () => {
    let { getSearchResult, hideMainLoader, showMainLoader } = this.props;
    const userType = isUserloggedIn() ? "LOGGED_IN " : "GUEST";
    const { id, type } = this.props.match.params;
    let params = {
      id,
      type,
      limit: ACCORDION_DEFAULT_LIMIT,
      offset: OFFSET_DEFAULT_VALUE,
      visibleTo: userType,
    };
    showMainLoader();
    await getSearchResult(params);
    setTimeout(
      () =>
        this.setState({
          searchTextInputVal: this.props.searchResultDataDetails?.title,
        }),
      0
    );
    if (isEmpty(this.props.searchResultDataDetails)) {
      safeNavigation(this.props.history, {
        pathname: `/${URL.HELP_CENTER}`,
      });
    }
    hideMainLoader();
  };

  handleViewMoreClick = async () => {
    let { faqLimit, faqOffset } = this.state;
    let { searchResultDataFaqs } = this.props;
    let isViewMore =
      searchResultDataFaqs?.rail.length < searchResultDataFaqs?.totalCount;
    this.setState(
      {
        faqLimit: isViewMore
          ? faqLimit + ACCORDION_DEFAULT_LIMIT
          : ACCORDION_DEFAULT_LIMIT,
        faqOffset: isViewMore ? faqLimit + faqOffset : OFFSET_DEFAULT_VALUE,
      },
      async () => {
        let { faqLimit, faqOffset } = this.state;
        let { getHCViewMoredata } = this.props;
        const { type } = this.props.match.params;
        const payload = {
          apiBaseUrl: searchResultDataFaqs?.seeAllUrl,
          limit: isViewMore ? faqLimit : ACCORDION_DEFAULT_LIMIT,
          offset: isViewMore ? faqOffset : OFFSET_DEFAULT_VALUE,
          type,
          title: encodeURIComponent(
            encodeURIComponent(searchResultDataFaqs?.title)
          ),
          isViewMore,
        };
        await getHCViewMoredata(payload, ACTION.HC_SEARCH_DETAIL_VIEW_MORE);
      }
    );
  };

  render() {
    let { searchTextInputVal } = this.state;
    let {
      searchResultDataFaqs,
      searchResultDataDetails,
      searchResultDataHelpVideos,
    } = this.props;
    let videoLink = searchResultDataDetails?.videoLink
      ? searchResultDataDetails?.videoLink
      : searchResultDataDetails?.diyVideoLink;
    return (
      <div className={"help-center-container search-result-container"}>
        <div className={"search-block"}>
          <Search
            className={"search-inner-page"}
            showBackArrow={true}
            searchValueText={searchTextInputVal}
          />
        </div>
        {!isEmpty(searchResultDataDetails) && (
          <div className={"result-section"}>
            <section className="altBg top-result-wrapper">
              <div className="container">
                <div className="small mB5">
                  {"Search result for"} {`"`}
                  <i>{searchResultDataDetails?.title}</i> {`"`}
                </div>
                <div className="sub-section top-result">
                  <div className="content-area">
                    <div className="rs-wra dflex-sb">
                      <div className="rs-heading">Top Result</div>
                    </div>
                    <div className="sub-cat-section mT20">
                      <h3>{searchResultDataDetails?.title}</h3>
                      {searchResultDataDetails?.response.length>0&&<div
                        className={"content-detail"}
                        dangerouslySetInnerHTML={{
                          __html: searchResultDataDetails?.response,
                        }}
                      />}
                    </div>
                    {searchResultDataDetails && (
                      <>
                        {checkEmbedLink(searchResultDataDetails) && (
                          <div className="sub-cat-section mT20">
                            <YouTubePlayer videoLink={videoLink} contentId={searchResultDataDetails?.id}/>
                          </div>
                        )}
                        <HelpfulTracker
                          trackDetails={searchResultDataDetails}
                          isSubTypePlacement
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        {searchResultDataFaqs && searchResultDataFaqs?.rail?.length > 0 && (
          <div className={"related-faq-section"}>
            <Accordion
              title={searchResultDataFaqs?.title}
              wrapperClassName={"wrapper-background"}
              accordionList={
                searchResultDataFaqs?.rail.length && searchResultDataFaqs?.rail
              }
              totalItemsCount={searchResultDataFaqs?.totalCount}
              totalDataFetched={searchResultDataFaqs?.rail.length}
              handleClick={this.handleViewMoreClick}
              screenName={HC_SCREEN_NAME.FAQ_DETAIL_SCREEN}
            />
          </div>
        )}
        {searchResultDataHelpVideos &&
          searchResultDataHelpVideos?.rail.length > 0 && (
            <div className={"related-video-section"}>
              <HelpVideoCard
                title={searchResultDataHelpVideos?.title}
                wrapperClassName={"wrapper-background"}
                helpVideoList={searchResultDataHelpVideos?.rail}
                seeAllUrl={searchResultDataHelpVideos?.seeAllUrl}
                showViewAllSection={
                  searchResultDataHelpVideos?.totalCount >
                  searchResultDataHelpVideos?.rail?.length
                }
                screenName={HC_SCREEN_NAME.FAQ_DETAIL_SCREEN}
              />
            </div>
          )}
           {
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
          }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  searchResultDataDetails: get(
    state.helpCenterReducer,
    "searchResultData.data.details"
  ),
  searchResultDataFaqs: get(
    state.helpCenterReducer,
    "searchResultData.data.faqs"
  ),
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
        getHCViewMoredata,
      },
      dispatch
    ),
  };
}

SearchResult.propTypes = {
  showMainLoader: PropTypes.func,
  hideMainLoader: PropTypes.func,
  match: PropTypes.object,
  history: PropTypes.object,
  getSearchResult: PropTypes.func,
  searchResultDataDetails: PropTypes.object,
  searchResultDataFaqs: PropTypes.object,
  searchResultDataHelpVideos: PropTypes.object,
  getHCViewMoredata: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(SearchResult);
