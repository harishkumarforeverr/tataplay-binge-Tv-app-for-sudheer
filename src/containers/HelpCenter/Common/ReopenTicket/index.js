import React, { Component } from "react";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { closePopup,openPopup } from "@common/Modal/action";
import { withRouter } from "react-router";
import { getTicketDetails, postReopenTicket } from "../../APIs/action";
import { MODALS } from "@common/Modal/constants";
import { MAX_CHAR } from "../../APIs/constants";
import { isEmpty } from 'lodash';

import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

import get from "lodash/get";
import PropTypes from "prop-types";
import "./style.scss";

class ReOpenTicket extends Component {
	constructor(props) {
		super(props);
		this.state = {
			remainingChar: MAX_CHAR,
			show: false,
			count: 0,
			textData: "",
		};
	}
	componentDidMount() {
		document.addEventListener("click", this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.handleClickOutside);
	}
	wrapperRef = React.createRef();
	handleClickOutside = (event) => {
		if (
			this.wrapperRef.current &&
			!this.wrapperRef.current.contains(event.target)
		) {
			this.closeModal();
		}
	};
	handleWordCount = (event) => {
		let charCount = event.target.value.length;
		const charLeft = MAX_CHAR - charCount;
		this.setState({
			count: charCount,
			remainingChar: charLeft,
			show: false,
			textData: event.target.value,
		});
	};

	reopenButtonHandler = async () => {
		const { cardData , postReopenTicket , id } = this.props;
		if (this.state.textData.length >= MAX_CHAR) {
			let payload = {
				externalId: cardData?.externalId,
				status: "REOPEN",
				sourceApp: "BINGE",
				ticketId: this.props.id,
				reopenComments: this.state.textData,
			};
			
			await postReopenTicket(payload);
			let {postReqResponse} = this.props;
			if (isEmpty(get(postReqResponse, 'data')) && get(postReqResponse, 'message')) {
				this.responseAlert();
			}
			else {
				mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_REOPEN_TICKET, {
					[`${MIXPANEL.PARAMETER.TICKET_ID}`]:id,
					
				  })
				this.closeModal();
			}
		} else {
			this.setState({ ...this.state, show: true });
		}
	};

	 responseAlert=()=>{
		const { postReqResponse } = this.props;
		this.props.openPopup(MODALS.ALERT_MODAL, {
            modalClass: "alert-modal",
            instructions:  get(postReqResponse, 'message'),
			primaryButtonAction: () => {
				this.closeModal();
			},
            closeModal: false,
            hideCloseIcon: false,
        });
	};

	closeModal = async () => {
		this.props.closePopup();
	};

	render() {
		const { id } = this.props;

		return (
			<div className="modal-body-container">
				<div className="popup-body" ref={this.wrapperRef}>
					<div className="modal-header ticketinfo ">
						<div className="marquee">
							<span className="requestId">{`Request - #${id}`}</span>
						</div>
					</div>
					<div className="modal-fullbody">
						<div className="ticketpara">
							Are you sure you want to reopen the ticket?
						</div>
						<div className="reopencomment">Reopen Comment*</div>

						<div>
							<textarea
								className="form-control"
								id="field"
								type="text"
								rows="4"
								cols="50"
								//maxLength="500"
								value={this.state.textData}
								onChange={(e) => {
									this.handleWordCount(e);
								}}
							></textarea>
						</div>
						<div className="suggestion">
							*comments are mandatory{" "}
							{this.state.textData.length < MAX_CHAR &&
								`(${this.state.remainingChar} characters are left)`}
						</div>
						<div>
							{this.state.show && (
								<div className="error">
									Please add your comment
								</div>
							)}
						</div>
					</div>
					<div className="bottom">
						<button
							className="button reopen"
							onClick={(e, id) => {
								this.reopenButtonHandler(e, id);
							}}
						>
							Reopen
						</button>
						<button
							className="button close"
							onClick={() => {
								this.closeModal();
							}}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
	}
}
const mapStateToProps = (state) => ({
	postReqResponse: get(state.helpCenterReducer, "postReqResponse"),
});

function mapDispatchToProps(dispatch) {
	return {
		...bindActionCreators(
			{
				openPopup,
				closePopup,
				postReopenTicket,
				getTicketDetails,
			},
			dispatch
		),
	};
}
ReOpenTicket.propTypes = {
	postReqResponse: PropTypes.object,
}
export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ReOpenTicket)
);
