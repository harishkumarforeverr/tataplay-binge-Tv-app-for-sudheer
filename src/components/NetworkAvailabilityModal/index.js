import React, {Component} from 'react';
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {openPopup, closePopup} from '@common/Modal/action';
import {hideMainLoader, showMainLoader} from '@src/action';
import {showNoInternetPopup} from "@utils/common"

class NetworkAvailabilityModal extends React.Component{
    componentDidMount(){
        this.props.hideMainLoader();
        showNoInternetPopup(this.props.networkRetry);
    }

    render() {
        return (
            <div/>
        )
    }
}

function mapStateToProps(state) {
    return {
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            openPopup,
            closePopup,
            hideMainLoader,
            showMainLoader,
        }, dispatch),
    }
}
NetworkAvailabilityModal.propTypes = {
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    networkRetry: PropTypes.bool,
};


export default (connect(mapStateToProps, mapDispatchToProps)(NetworkAvailabilityModal))