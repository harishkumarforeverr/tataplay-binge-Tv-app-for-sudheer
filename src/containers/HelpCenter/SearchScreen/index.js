import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import Search from '../Common/Search';
import '../style.scss';
import './style.scss';


class SearchScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        let { } = this.props;
        let { } = this.state;
        return <div className={'help-center-container search-screen-container'}>
            <Search title='What can we help you with today?' />
        </div>
    }
}

const mapStateToProps = (state) => ({
    faqDataList: get(state.helpCenterReducer, 'faqDataList.data'),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            
        }, dispatch),
    }
}

SearchScreen.propTypes = {
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(SearchScreen);