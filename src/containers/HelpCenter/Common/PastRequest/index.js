import React, { Component } from "react";
import PropTypes from "prop-types";
import History from "@assets/images/history.svg";
import './style.scss'

export default class PastRequest extends Component {
  render() {
    return (
      <div className="past-request-container">
        <section className="altBg">
          <div className="container">
            <div className="ticket-compact archive">
              <div className="content-area">
                <div className="request-top">
                  <div className="img-contr">
                    <img src={History} />
                  </div>
                  <div className="text-contr">
                    <div className="heading">Past Requests</div>
                    <div className="info-txt">
                      View a list of your previously raised requests
                    </div>
                  </div>
                  <p
                    className="btn btn-tertiary btn-sm cta"
                    onClick={this.props.handleNavigate}
                  >
                    View <span className="pL3">Past Requests</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

PastRequest.propTypes = {
  handleNavigate: PropTypes.func,
};