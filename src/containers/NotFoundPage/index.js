import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {hideFooter, hideHeader} from "@src/action";

class NotFoundPage extends Component {
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
        let text = `This www.tataskybinge.com page can't be found`
        return (
            <div className="not-found-page-container">
                <div>
                    <img src="../../assets/images/notFound.png" alt="page not found"/>
                </div>
                <h1>{text}</h1>
                <p>No web page was found for the web address: https://www.tataskybinge.com/</p>
                <p className='error-404'>HTTP ERROR 404</p>
            </div>
        )
    }
};

NotFoundPage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(NotFoundPage);