import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";

import { URL } from "@constants/routeConstants";
import { safeNavigation } from "@utils/common";

import {
  getHCViewMoredata,
  clearSeeAllVideoData,
  resetSeeAllVideoData,
} from "../APIs/action";
import { ACCORDION_DEFAULT_LIMIT, ACTION } from "../APIs/constants";
import HelpVideoCard from "../Common/HelpVideoCard";
import SubHeader from "../SubHeader";
import { HC_SCREEN_NAME } from "../APIs/constants";

import "../style.scss";
import "./style.scss";

class SearchAllVideos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limit: 6,
      offset: 0,
    };
  }

  componentDidMount = () => {
    this.getViewMore();
  };

  componentWillUnmount = () => {
    this.props.clearSeeAllVideoData();
  };
  handleResetVideoData =  async () => {
     this.props.resetSeeAllVideoData();
      this.setState({
      limit: ACCORDION_DEFAULT_LIMIT,
      offset: 6+0,
    });
  };
  getViewMore = async () => {
    let { limit, offset } = this.state;
    let { location } = this.props;
    let { hcSeeAllData } = this.props;
    const routeDetail = get(location, "state");
    !routeDetail &&
      safeNavigation(this.props.history, {
        pathname: `/${URL.HELP_CENTER}`,
      });
    let isViewMore = hcSeeAllData?.totalCount > hcSeeAllData?.rail?.length;
    const payload = {
      apiBaseUrl: routeDetail?.seeAllUrl,
      limit,
      offset,
      isViewMore,
    };
    await this.props.getHCViewMoredata(payload, ACTION.HC_SEE_ALL_DATA);

    this.setState({
      limit: ACCORDION_DEFAULT_LIMIT,
      offset: limit + offset,
    });
  };

  render() {
    let { hcSeeAllData, hcSeeAllDataItems } = this.props;
    let checkViewAllSection=hcSeeAllData?.totalCount === hcSeeAllDataItems?.length;
    return (
      <div className="help-center-container video-see-all-page">
        <SubHeader title={"Videos"} />
        {hcSeeAllData && hcSeeAllDataItems.length > 0 && (
          <HelpVideoCard
            helpVideoList={hcSeeAllDataItems}
            seeAllUrl={hcSeeAllData?.seeAllUrl}
            title={hcSeeAllData?.title}
            showViewAllSection={
              hcSeeAllData?.totalCount > hcSeeAllDataItems.length ||
              hcSeeAllData?.totalCount !== hcSeeAllDataItems.length
            }
            viewAllBtnText={"Load More"}
            handleViewMoreClick={this.getViewMore}
            screenName={HC_SCREEN_NAME.VIDEO_DETAIL_SCREEN}
          />
        )}
        {checkViewAllSection && hcSeeAllDataItems?.length>6 && (
          <div className="text-center vdo-btn-contr view-less">
            <a
              className="btn btn-tertiary waves-effect waves-light"
              onClick={this.handleResetVideoData}
            >
              View Less
            </a>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  hcSeeAllData: get(state.helpCenterReducer, "hcSeeAllData"),
  hcSeeAllDataItems: get(state.helpCenterReducer, "hcSeeAllDataItems"),
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        getHCViewMoredata,
        clearSeeAllVideoData,
        resetSeeAllVideoData,
      },
      dispatch
    ),
  };
}

SearchAllVideos.propTypes = {
  getHCViewMoredata: PropTypes.func,
  clearSeeAllVideoData: PropTypes.func,
  hcSeeAllDataItems: PropTypes.object,
  hcSeeAllData: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  resetSeeAllVideoData: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(SearchAllVideos);
