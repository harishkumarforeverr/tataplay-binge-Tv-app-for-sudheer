import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import * as moment from "moment";
import get from "lodash/get";

import { MODALS } from "@common/Modal/constants";
import { openPopup } from "@common/Modal/action";
import { TICKET_STATUS, TICKET_STATE, TICKET_TAG } from "../../APIs/constants";
import openTicket from "@assets/images/open-ticket.svg";

import { getTicketDetails, postReopenTicket } from "../../APIs/action";
import ReopenTicket from "../ReopenTicket/index";
import CommentCard from "../CommentCard";

import "./style.scss";

class TicketCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      imageEnlarge: false,
      scroll: "",
      showpopup: false,
      datedata:{}
    };
  }

  componentDidMount = () => {
    document.addEventListener("click", this.closeModal, false);
    document.addEventListener("scroll", this.handleScroll);
  };

  componentWillUnmount() {
    document.removeEventListener("click", this.closeModal, false);
    document.removeEventListener("scroll", this.handleScroll);
  };

  handleScroll = () => {
    const position = window.pageYOffset;
    this.setState({ ...this.state, scroll: position });
  };

  closeModal = ({ target }) => {
    if (
      this.modal &&
      this.modal.contains(target) &&
      target.className !== "modal-content"
    ) {
      this.handleImageClose();
    }
  };

  dateFormat = (date) => {
    return moment.utc(date).format("lll");
  };

  checkStatus = (status) => {
    if (status?.toLowerCase() == TICKET_STATE.OPEN || status?.toLowerCase() == TICKET_STATE.REOPEN) {
      return "active";
    } else {
      return "done";
    }
  };

  listExpand = (id) => {
    this.setState({ ...this.state, expand: !this.state.expand }, () => {
      if (this.state.expand) {
        this.props.getTicketDetails(id);
      }
    });
  };

  clickHandle = (cardData) => {
    this.props.openPopup(MODALS.COMMENT_MODAL, {
      modalClass: "comment-modal-popup reopen-modal",
      childComponent: (
        <ReopenTicket
          id={this.props.id}
          parentCallback={this.handleCallback}
          status={this.props.status}
          reopenComments={this.props.postReqResponse}
          cardData={cardData}
        />
      ),
    });
  };

  reOpen = (raisedDate, id) => {
   const data = this.props.cardData;
  // const currentTime = moment().format('DD-MM-YYYY hh:mm:ss A');
  // const raisedDatetime = moment.utc(raisedDate).format("DD/MM/YYYY, h:mm:ss A");
  // const startShiftTime = moment(raisedDatetime, 'DD-MM-YYYY hh:mm:ss A');
  // const hoursDiff = startShiftTime.add(1, 'hour').format('DD-MM-YYYY hh:mm:ss A')
  // var format = 'DD-MM-YYYY hh:mm:ss A'
  // var time = moment(currentTime, format);
  // var startDate = moment(raisedDatetime, format);
  // var endDate = moment(hoursDiff, format);

  // if(moment(time).isBetween( startDate,endDate) ){
  //   if( Number(data.reOpenCounter) < 1 ? true : false){
  //   return true;
  //   }
  //   else 
  //   return false;
    
  // }
  // else{
  //       return false;
  // }

  const originalDate = moment().format();
  const remainingDays = moment(originalDate).diff(raisedDate, "days");
  let checkFalsy = remainingDays == 0 ? 1 : remainingDays;
  const showReopen = checkFalsy <= 7 && Number(data.reOpenCounter) < 1 ? true : false;
  return showReopen;
  };

  requestStatus = (status) => {
    return status?.toLowerCase() == TICKET_STATE.CLOSE ? TICKET_TAG.CLOSED 
    : status?.toLowerCase() == TICKET_STATE.OPEN ? TICKET_TAG.OPEN : TICKET_TAG.REOPENED;
  };

  
   getStatusDate = (statusCode, isReclose) => {
    const filteredData = this.props.cardData?.statusChange?.filter(
      (data) => data?.status?.toLowerCase() === statusCode.toLowerCase()
    ); 
    let date;

    if(statusCode.toLowerCase() === TICKET_STATE.CLOSE && this.props.cardData?.reCloseComments){
      // if a ticket is reclosed then 2 close entry will come in statusChange array and the latest one will be the latest close i.e reclose
      date = isReclose ? filteredData[0]?.changeDate : filteredData[1]?.changeDate;
      }
      else {
        date =  filteredData[0]?.changeDate
      }
      return this.dateFormat(date);
  };
  
  

  render() {
    const { description, status, raisedDate, closeDate, id, isLandingPage, subCategory, leafCategory, imageStatusWidth,cardData } = this.props;
    var checkstatus = status?.toLowerCase() == TICKET_STATE.CLOSE;
    return (
      <>
        <div className="ticket">
          <div className="content-area">
            <div className="request-top">
              <div className="ticket-no">
                <div className="label">
                  {status?.toLowerCase() !== TICKET_STATE.CLOSE && (
                    <img
                      src={openTicket}
                      width={imageStatusWidth}
                      className="mR5"
                    />
                  )}
                  <div className="marquee">
                    <span>{`Request #${id}`}</span>
                  </div>
                </div>
              </div>
              <div
                className={`request-status ${
                  isLandingPage ? "active-status" : ""
                }`}
              >
                <div className={`data ${this.checkStatus(status)} `}>
                  {this.requestStatus(status)}
                </div>
              </div>
            </div>
            <div className="info-data">
              {subCategory &&
                leafCategory &&
                subCategory.concat("  ", leafCategory)}
            </div>
            {isLandingPage && (
              <div className="wrapper">
                <div className="request-detail">
                  <div className="req-contr req-date req-contr-active">
                    <div className="label">{TICKET_STATUS.SOLVED_BY}</div>
                    <div className="data">{this.dateFormat(closeDate)}</div>
                  </div>
                </div>
                <div className="cta-contr">
                  <p className="link-view " onClick={this.props.handleNavigate}>
                  {TICKET_STATUS.VIEW_DETAIL}
                  </p>
                </div>
              </div>
            )}
            {!isLandingPage && 
            <React.Fragment>
                {
                // This fragment will come only when a ticket is in reopen or reclose state
                (status?.toLowerCase() == TICKET_STATE.REOPEN || (status?.toLowerCase() == TICKET_STATE.CLOSE && cardData?.reCloseComments)) && 
                <React.Fragment>
                  <div className="request-detail">
                  <div className="req-contr req-date">
                    <div className="label">{TICKET_STATUS.REOPEN}</div>
                    <div className="data">{this.getStatusDate(TICKET_STATE.REOPEN)}</div>
                  </div>
                  <div className="req-contr req-type">
                    <div className="label">
                      {status?.toLowerCase() == TICKET_STATE.REOPEN ? TICKET_STATUS.SOLVED_BY : TICKET_STATUS.RECLOSED}</div>
                    <div className="data">
                      {status?.toLowerCase() == TICKET_STATE.REOPEN ? this.dateFormat(cardData.expectedResolutionDate) : this.getStatusDate(TICKET_STATE.CLOSE, true)}
                    </div>
                  </div>
                  </div>
                </React.Fragment>
                }
                {
                    // This fragment will come everytime 
                    <React.Fragment>
                    <div className="request-detail">
                      <div className="req-contr req-date">
                        <div className="label">{TICKET_STATUS.CREATED}</div>
                        <div className="data">{this.dateFormat(raisedDate)}</div>
                      </div>
                      <div className="req-contr req-type">
                        <div className="label">
                          {(status?.toLowerCase() == TICKET_STATE.OPEN) ? TICKET_STATUS.SOLVED_BY : TICKET_STATUS.RESOLVED}
                        </div>
                        <div className="data">
                          {(status?.toLowerCase() == TICKET_STATE.OPEN) ? this.dateFormat(cardData.expectedResolutionDate) : this.getStatusDate(TICKET_STATE.CLOSE)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                }
            </React.Fragment>
            }

            {!isLandingPage && description?.length > 0 && (
              <div className="request-view ">
                <div
                  className={`${
                    this.state.expand ? "collapse-show" : "collapse-hide"
                  }`}
                >
                  <div className="sts-contr sts-comment ">
                    <CommentCard cardData={this.props?.cardData} />
                  </div>
                </div>
                <div className="cta-contr">
                  <p className="link-view" onClick={() => this.listExpand(id)}>
                    {!this.state.expand ? "View Details" : "View Less"}
                  </p>
                  {this.reOpen(raisedDate, id) && checkstatus && (
                    <a className="reopen-btn" onClick={() => {this.clickHandle(this.props.cardData);}}>
                      Re-open
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  ticketDetails: get(state.helpCenterReducer, "ticketDetail.data"),
  postReqResponse: get(state.helpCenterReducer, "postReqResponse"),
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        openPopup,
        getTicketDetails,
        postReopenTicket,
      },
      dispatch
    ),
  };
}

TicketCard.propTypes = {
  getTicketDetails: PropTypes.func,
  ticketDetails: PropTypes.object,
  description: PropTypes.string,
  status: PropTypes.string,
  raisedDate: PropTypes.string,
  closeDate: PropTypes.string,
  id: PropTypes.string,
  externalID: PropTypes.string,
  isLandingPage: PropTypes.bool,
  handleNavigate: PropTypes.func,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(TicketCard);
