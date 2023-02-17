
import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {closePopup} from "@common/Modal/action";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";
import './style.scss';

class CommentModal extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        const {childComponent,modalClass} = this.props;
        return (
            <div className={modalClass}>
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

CommentModal.propTypes = {
    closePopup: PropTypes.func,
    childComponent: PropTypes.object,
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CommentModal),
);
