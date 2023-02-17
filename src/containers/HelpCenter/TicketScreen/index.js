import React, { Component } from "react";
import { withRouter } from "react-router";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import get from "lodash/get";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

import ArrowBack from "@assets/images/arrow-back.svg";
import openTicket from "@assets/images/open-ticket.svg";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE } from "@constants";
import { URL } from "@constants/routeConstants";
import {isMobile, safeNavigation} from "@utils/common";
import { showMainLoader } from "@src/action";

import { getTicket, clearTicketData } from "../APIs/action";
import TicketCard from "../Common/TicketCard";
import HelpfulTracker from "../Common/HelpfulTracker";
import PaginationLoader from "../../../common/PaginationLoader";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import { HC_SCREEN_NAME } from "../APIs/constants";

import "./style.scss";

class TicketScreen extends Component {
  data = [
    { id: "1", tabTitle: "Track Requests" },
    { id: "2", tabTitle: "View Request History" },
  ];
  state = {
    active: "1",
    ticketData: [],
    limit: 6,
    offset: 0,
    hasMoreItems: true,
  };

  async componentDidMount() {
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    if (!userInfo.accessToken) {
      safeNavigation(this.props.history, {
        pathname: `/${URL.HELP_CENTER}`,
      });
    }

    if (userInfo.accessToken) {
      let Data = {
        limit: this.state.limit,
        offset: this.state.offset,
      };
      if (this.props.history.location.state?.id) {
        await this.setState({ ...this.state, active: "2" });
      } else {
        userInfo?.bingeSubscriberId && await this.props.getTicket(Data, false);
      }
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const { ticketRes } = this.props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

    if (prevState.active !== this.state.active) {
      this.setState({ ...this.state, ticketData: [] }, async () => {
        userInfo?.bingeSubscriberId && await this.props.getTicket(false);
      });
    }
    if (
      prevProps.ticketRes !== this.props.ticketRes &&
      this.props.ticketRes?.length > 0
    ) {
      this.ticketStatus(ticketRes);
    }
    if(prevProps.postReqResponse !== this.props.postReqResponse){
      this.setState({ ...this.state, limit: 6,offset: 0,ticketData: [] }, async () => {
        await this.props.clearTicketData()
        userInfo?.bingeSubscriberId && await this.props.getTicket(false);
      });  

    }
  }

  tabActive = (data) => {
    if (this.state.active == data) {
      return "active";
    }
  };

  tabToggle = async (id) => {
    const { ticketRes } = this.props;
    if(id==1)
    {
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_TRACK_REQUEST_CLICK,{
        [`${MIXPANEL.PARAMETER.SOURCE}`]:HC_SCREEN_NAME.TICKET_DETAIL_SCREEN,
      })
    }
    else{
      mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_VIEW_REQUEST_HISTORY_CLICK,{
        [`${MIXPANEL.PARAMETER.SOURCE}`]:HC_SCREEN_NAME.TICKET_DETAIL_SCREEN,
      })
    }
if(this.state.active!==id){
  
    this.setState({
      ...this.state,
      active: id,
      offset: 0,
      ticketData: [],
      hasMoreItems: true,
    });
  }
  };

  ticketStatus = (ticket) => {
    const filterTicket =
      ticket &&
      ticket.filter((data) => {
        if (this.state.active == "1") {
          return (data.status.toLowerCase() == "open" || data.status.toLowerCase() == "reopen");
        } else if (this.state.active == "2") {
          return data.status.toLowerCase() == "close";
        } else {
          return (data.status.toLowerCase() == "open" || data.status.toLowerCase() == "reopen");
        }
      });
    this.setState(
      {
        ...this.state,
        ticketData: [...this.state.ticketData, ...filterTicket],
      },

      async () => {
        let totalLength = this.state.ticketData.length + filterTicket.length;
        // if (filterTicket.length < 6) {
        if (totalLength < 6) {
          if (this.props.ticketRes.length == 0) {
            return;
          } 
           else {  
            this.fetchMoreData();
          }
        }
      }
    );
  };

  fetchMoreData = () => {
    let { limit, offset } = this.state;
    const { getTicket } = this.props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
    this.setState(
      {
        ...this.state,
        offset: limit + offset,
      },
      async () => {
        let Data = {
          limit: this.state.limit,
          offset: this.state.offset,
        };
        userInfo?.bingeSubscriberId && await getTicket(Data, false);
      }
    );
  };

  render() {
    const{isLoading,ticketRes}=this.props
    const{ticketData,hasMoreItems}=this.state
    return (
      <div className="ticket-container">
        <section className="page-header">
          <div className="container">
            <div className="category-header">
              <div
                className="icon-contr"
                onClick={() =>  safeNavigation(this.props.history, {
                  pathname: `/${URL.HELP_CENTER}`,
                })}              
              >
                <img src={ArrowBack} />
              </div>
              <div className="img-contr">
                <img src={openTicket} width="15" />
              </div>
              <div className="text-contr-msg">Raised Request</div>
            </div>
          </div>
        </section>
        <section className="tickets-data">
          <ul className="nav nav-tabs container ">
            {this.data.map((d) => (
              <li
                onClick={() => this.tabToggle(d.id)}
                className={this.tabActive(d.id)}
                key={d.id}
              >
                {d.tabTitle}
              </li>
            ))}
          </ul>

          {ticketData && ticketData.length > 0 ? (
            <InfiniteScroll
              dataLength={ticketData && ticketData.length}
              next={this.fetchMoreData}
              hasMore={hasMoreItems}
              loader={isLoading && <PaginationLoader />}
              scrollThreshold={isMobile.any() ? 0.3 : 0.8}
            >
              <div className="ticket-outer container">
                {ticketData && ticketData.length > 0 &&
                  ticketData.map((data) => (
                    <React.Fragment key={data.id}>
                      <TicketCard
                        description={data.description}
                        status={data.status}
                        raisedDate={data.creationDate}
                        closeDate={this.state.active === "2" ? data.resolutionDate : data.expectedResolutionDate}
                        id={data.id}
                        leafCategory={data.leafCategory}
                        subCategory={data.subCategory}
                        imageStatusWidth={"20"}
                        cardData ={data}
                      />
                    </React.Fragment>
                  ))}
              </div>
            </InfiniteScroll>
          ) : (
            <>
              {!isLoading &&
                ticketData.length == 0 &&
                ticketRes &&
                ticketRes.length == 0 && (
                  <div className="ticket-empty-message"> No Ticket Found</div>
                )}
            </>
          )}
        </section>
        <div className="ticket-chat-container">
          <HelpfulTracker isSubTypePlacement={false} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  ticketRes: get(state.helpCenterReducer, "hCTicketResp.data"),
  isLoading: get(state.commonContent, "isLoading"),
  postReqResponse: get(state.helpCenterReducer, "postReqResponse.data"),

});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        getTicket,
        showMainLoader,
        clearTicketData
      },
      dispatch
    ),
  };
}

TicketScreen.propTypes = {
  ticketRes: PropTypes.array,
  getTicket: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(TicketScreen);
