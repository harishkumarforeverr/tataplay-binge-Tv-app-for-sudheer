import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import get from "lodash/get";
import InfiniteScroll from "react-infinite-scroll-component";

import { LAYOUT_TYPE, MENU_LIST } from "@constants";
import ListingItem from "@common/ListingItem";
import { addWatchlist } from "@containers/PlayerWeb/APIs/actions";
import { isUserloggedIn, scrollToTop, isMobile } from "@utils/common";
import Buttons from "@common/Buttons";
import {
  fetchWatchlistItems,
  clearWatchlistData,
  removeWatchlistItems,
} from "./API/action";
import { DEFAULT_VALUE } from "./API/constants";

import "./style.scss";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import moengageConfig from "@utils/moengage";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE } from "@utils/constants";
import { redirectToHomeScreen } from "../BingeLogin/bingeLoginCommon";
import PaginationLoader from "@src/common/PaginationLoader";
import { isEmpty } from "lodash";

class Watchlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limit: DEFAULT_VALUE.LIMIT,
      offset: 0,
      selectWatchlist: [],
      select: false,
      selectAll: false,
      selectText: DEFAULT_VALUE.SELECTALL,
      isEmptyWatchlist:false
    };
  }

  componentDidMount() {
    let userInfo = isUserloggedIn();
    const {clearWatchlistData, fetchWatchlistItems} = this.props;
    clearWatchlistData();
    userInfo && fetchWatchlistItems();
    scrollToTop();
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.VIEW_WATCHLIST);
    moengageConfig.trackEvent(MOENGAGE.EVENT.VIEW_WATCHLIST);
    mixPanelConfig.trackEvent(MIXPANEL.EVENT.VIEW_FAVORITE);
    moengageConfig.trackEvent(MOENGAGE.EVENT.VIEW_FAVORITE);
  }

  componentDidUpdate(prevProps, prevState) {
    let { select, selectAll } = this.state;
    let { watchlistItems } = this.props;

    if (prevProps.watchlistItems !== watchlistItems) {
      select && selectAll && this.contentSelect(watchlistItems);
    }
  }

  componentWillUnmount() {
    this.resetState();
    this.props.clearWatchlistData();
  }

  handleSelectWatchList = (e, data) => {
    const { selectWatchlist } = this.state;
    const item = {
      contentId: data.contentId,
      contentType: data.contentType,
      partnerName:data.provider,
      title:data.title,
    };
    const spreadWatchList = [...selectWatchlist, item];
    if (selectWatchlist.some((d) => d.contentId === data.contentId)) {
      let filterValue = selectWatchlist.filter(
        (d) => d.contentId !== data.contentId,
      );

      this.setState({
        ...this.state,
        selectWatchlist: filterValue,
        selectAll: false,
        selectText: DEFAULT_VALUE.SELECTALL,
      });
    } else {
      if (spreadWatchList.length === this.props.watchlistItems.length) {
        this.setState({
          ...this.state,
          selectAll: true,
          selectText: DEFAULT_VALUE.DESELECTALL,
          selectWatchlist: spreadWatchList,
        });
      } else {
        this.setState({
          ...this.state,
          selectWatchlist: spreadWatchList,
        });
      }
    }
  };

  resetState = () => {
    this.setState({ ...this.state, limit: DEFAULT_VALUE.LIMIT, offset: 0 });
  };

  calculateContinue = (total, watched) => {
    let timeLeft = total > 0 && total - watched;
    return total > 0 && watched > 0 && timeLeft >= 0;
  };

  fetchMoreData = async () => {
    let { watchListData } = this.props;
    await this.props.fetchWatchlistItems(
      false,
      get(watchListData, "pagingState"),
    );
  };

  contentSelect = (data) => {
    const extract = data.map((d) => ({
      contentId: d.contentId,
      contentType: d.contentType,
    }));
    this.setState({
      ...this.state,
      selectWatchlist: extract,
      selectAll: true,
      selectText: DEFAULT_VALUE.DESELECTALL,
    });
  };

  selectAllWatchlist = (data) => {
    const { selectAll } = this.state;

    if (!selectAll) {
      this.contentSelect(data);
    } else {
      this.setState({
        ...this.state,
        selectWatchlist: [],
        selectAll: false,
        selectText: DEFAULT_VALUE.SELECTALL,
      });
    }
  };

  checkSelectedValue = (contentId) => {
    const { selectWatchlist } = this.state;

    let check;
    let found = selectWatchlist.find((el) => el.contentId === contentId);
    check = !!found;
    return check;
  };

  handleButtonPress = () => {
    this.buttonPressTimer = setTimeout(
      () => this.setState({ ...this.state, select: true }),
      1000,
    );
  };

  handleButtonRelease = () => {
    clearTimeout(this.buttonPressTimer);
  };

  //it will run on  click of remove
  removeHandler = async() => {
    const { removeWatchlistItems, fetchWatchlistItems} = this.props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    let { selectWatchlist } = this.state;
     
    const body = {
      contentIdAndType: selectWatchlist,
      profileId: userInfo.profileId,
      subscriberId: userInfo.sId,
    };
    if (selectWatchlist.length > 0) {
       selectWatchlist.forEach((data)=>{
        const properties={
        [MIXPANEL.PARAMETER.CONTENT_TITLE]:data.title,
        [MIXPANEL.PARAMETER.CONTENT_TYPE] :data.contentType,
        [MIXPANEL.PARAMETER.CONTENT_GENRE]:"",
        [MIXPANEL.PARAMETER.PARTNER_NAME]:data.partnerName,
        }
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.DELETE_FAVORITE,properties);
      })
     await removeWatchlistItems(true, body);
     if(selectWatchlist.length === this.props.watchListData.totalCount || this.props.watchlistItems.length === 0 ){
     this.setState({...this.state,isEmptyWatchlist:true})  
      const response = await fetchWatchlistItems()
         if(response){
          this.setState({...this.state,isEmptyWatchlist:false})  
         }
     }
     this.cancelClickHandler();
    }
  };

  cancelClickHandler = () => {
    this.setState({
      ...this.state,
      selectWatchlist: [],
      select: false,
      selectAll: false,
      selectText: DEFAULT_VALUE.SELECTALL,
    });
  };

  render() {
    let { watchListData, watchlistItems, loading, history } = this.props;
    let { select, selectWatchlist, selectText, isEmptyWatchlist } = this.state;
    return (
      <Fragment>
        {!loading && (
          <div className="watchlist-container form-container">
            <Fragment>
              {watchlistItems !== undefined && watchlistItems.length > 0 ? (
                <div className="watchlist-content">
                  <div className="watchlist-heading">
                    <p className="left-heading">{MENU_LIST.BINGE_LIST}</p>
                    {select ? (
                      <div className="right-heading">
                        <p onClick={() => this.cancelClickHandler()}>Cancel</p>
                        {!isMobile.any() && (
                          <p
                            onClick={() =>
                              this.selectAllWatchlist(watchlistItems)
                            }
                          >
                            {selectText}
                          </p>
                        )}

                        <p
                          onClick={this.removeHandler}
                          className={`${
                            selectWatchlist && selectWatchlist?.length > 0
                              ? ""
                              : "remove-button"
                          }`}
                        >
                          Remove
                          <span>
                            {selectWatchlist?.length > 0 &&
                              `(${selectWatchlist?.length})`}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          this.setState({ ...this.state, select: true })
                        }
                        className="right-heading"
                      >
                        <p className="right-inner-text">Select</p>
                      </div>
                    )}
                  </div>
                  <ul
                    className={`watchlist listing-landscape listing-circular`}
                  >
                    <InfiniteScroll
                      dataLength={watchlistItems.length}
                      next={this.fetchMoreData}
                      hasMore={get(watchListData, "continuePaging")}
                      loader={<PaginationLoader/>}
                      scrollThreshold={isMobile.any() ? 0.3 : 0.8}
                    >
                      {watchlistItems.map((item) => (
                        <ListingItem
                          item={item}
                          key={item.contentId}
                          view={LAYOUT_TYPE.LANDSCAPE}
                          title={""}
                          isWatchlist={true}
                          select={select}
                          handleButtonPress={
                            isMobile.any() && this.handleButtonPress
                          }
                          handleButtonRelease={
                            isMobile.any() && this.handleButtonRelease
                          }
                          isContinueWatching={this.calculateContinue(
                            item.durationInSeconds,
                            item.secondsWatched,
                          )}
                          onClickHandler={(e, item, data) =>
                            this.handleSelectWatchList(e, item, data)
                          }
                          checkSelectedValue={(contentId) =>
                            this.checkSelectedValue(contentId)
                          }
                        />
                      ))}
                    </InfiniteScroll>
                  </ul>
                </div>
              ) : (
                <Fragment>
                {!isEmptyWatchlist &&
                  <>
                  <p className="empty-heading">{MENU_LIST.BINGE_LIST}</p>
                  <div className="empty-watchlist">
                    <img
                      src=".././../assets/images/empty-list.svg"
                      alt="empty"
                      className="icon-watchlist"
                    />
                    <h1>Your Binge List is empty!</h1>
                    <p>
                    Browse and save exciting movies &amp; TV shows to your list
                    </p>
                    <Buttons
                      bValue="Discover to Add"
                      cName="discover-button"
                      bType="button"
                      clickHandler={() => redirectToHomeScreen(history)}
                    />
                  </div>
                  </>
                }
                </Fragment>
              )}
            </Fragment>
          </div>
        )}
      </Fragment>
    );
  }
}

Watchlist.propTypes = {
  addWatchlist: PropTypes.func,
  fetchWatchlistItems: PropTypes.func,
  clearWatchlistData: PropTypes.func,
  watchListData: PropTypes.object,
  watchlistItems: PropTypes.array,
  removeWatchlistItems: PropTypes.func,
  loading: PropTypes.bool,
  history: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    watchListData: get(state.watchlist, "watchListData"),
    watchlistItems: get(state.watchlist, "watchlistItems"),
    loading: get(state.watchlist, "loading"),
    isLoading: get(state.commonContent, "isLoading"),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        addWatchlist,
        fetchWatchlistItems,
        clearWatchlistData,
        removeWatchlistItems,
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Watchlist);
