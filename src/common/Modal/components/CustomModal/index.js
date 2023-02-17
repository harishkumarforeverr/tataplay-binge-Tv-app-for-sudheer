import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {closePopup} from "@common/Modal/action";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

class CustomModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {childComponent, movieSeries} = this.props;
        return (
            <div className={`modal-body clearfix align-center ${movieSeries ? "movie-series-height" : ""}`} >
                {childComponent}
            </div>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(
            {
                closePopup,
            },
            dispatch,
        ),
    };
};

CustomModal.propTypes = {
    closePopup: PropTypes.func,
    childComponent: PropTypes.object,
    movieSeries: PropTypes.bool,
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CustomModal),
);
