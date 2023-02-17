import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {hideFooter, hideHeader} from "@src/action";
import './style.scss';

class BestViewMobile extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let {
            hideHeader,
            hideFooter,
        } = this.props;
        hideHeader(true);
        hideFooter(true);
    }

    componentWillUnmount() {
        let {
            hideHeader,
            hideFooter,
        } = this.props;
        hideHeader(false);
        hideFooter(false);
    }

    render() {
        return <div className="best-view-mobile-container page-heading">
            <h2 className="page-main-heading">
                This site is best viewed on a mobile browser
            </h2>
        </div>
    }
};

BestViewMobile.propTypes = {
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        hideHeader,
        hideFooter,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(BestViewMobile);