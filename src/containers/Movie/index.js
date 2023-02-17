import React, {Component} from "react";
import {bindActionCreators, compose} from "redux";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {closePopup} from "@common/Modal/action";
import {closeMobilePopup} from "../Languages/APIs/actions";
import "./styles.scss";
import get from "lodash/get";
import PropTypes from "prop-types";
import ContentDetailModal from './components/ContentDetailModal';
import EpisodeModal from './components/EpisodeModal';
import {fireProductLandingCtasEvent} from "@containers/PIDetail/PIDetailCommon";
import DATALAYER from "@utils/constants/dataLayer";

class MoviePopup extends Component {
    constructor(props) {
        super(props);
        const {episode = {}} = this.props;
        const modalType = episode !== {};
        this.state = {
            id: 0,
            episode,
            modalType,
            episodeNumber: 0,
        };
    }

    componentDidMount() {
        const {episode = {}, detail = []} = this.props;
        const {modalType} = this.state;
        const itemIndex = detail.findIndex(item => item.episodeId === episode.episodeId)
        setTimeout(() => this.setState({
            id: modalType ? itemIndex : 0,
            episodeNumber: modalType ? detail[itemIndex]?.episodeId : 0,
        }), 0);
    }

    modalClose = () => {
        fireProductLandingCtasEvent(this.props?.meta, DATALAYER.VALUE.CLOSE, this.state.episodeNumber)
        const {closePopup, closeMobilePopup} = this.props;
        closePopup();
        (this.props?.onClose && this.props.onClose()) || closeMobilePopup();
    };

    upDateId = (val, buttonName, episodeNumber) => {
        fireProductLandingCtasEvent(this.props?.meta, buttonName, episodeNumber)
        this.setState({
            id: val,
            episodeNumber: episodeNumber
        })
    }

    render() {
        const {detail, isShowMore = false} = this.props;
        const {modalType, id} = this.state;
        let seriesPopupData = {};
        if (modalType && detail && id !== undefined) {
            seriesPopupData = detail[id];
        }
        return (
            <>
                {isShowMore ? <ContentDetailModal {...this.props} /> :
                    <EpisodeModal {...this.props} id={id} seriesPopupData={seriesPopupData} upDateId={this.upDateId}
                                  onClose={this.modalClose}/>}
                <p onClick={this.modalClose} className="close-link close-container">
                    Close
                </p>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        meta: get(state.PIDetails.data, "meta"),
        detail: get(state.seasonReducer, "items"),
    };
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                closePopup,
                closeMobilePopup,
            },
            dispatch,
        ),
    };
}

MoviePopup.propTypes = {
    closePopup: PropTypes.func,
    closeMobilePopup: PropTypes.func,
    meta: PropTypes.object,
    episode: PropTypes.object,
    detail: PropTypes.array,
    isShowMore: PropTypes.bool,
    onClose: PropTypes.func,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(MoviePopup);
