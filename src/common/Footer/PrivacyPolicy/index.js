import React, {Component} from "react";
import {connect} from "react-redux";
import get from 'lodash/get';
import PropTypes from "prop-types";
import {hideMainLoader, showMainLoaderImmediate} from "@src/action";

import {scrollToTop} from "@utils/common";
import './style.scss';
import {bindActionCreators} from "redux";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

class PrivacyPolicy extends Component {
    constructor(props) {
        super(props);
        this.isLoaded = true;
    }

    componentDidMount() {
        this.props.showMainLoaderImmediate();
        scrollToTop();
        setTimeout(() => this.props.hideMainLoader(), 400);
        this.trackEvents()
    }

    loadHandler = () => {
        let iframe = document.getElementById('myframe');

        try {
            iframe && (iframe.contentWindow || iframe.contentDocument).location.href;
            this.isLoaded = true;
        } catch (err) {
            //err:SecurityError: Blocked a frame with origin "http://*********" from accessing a cross-origin frame.
            console.log('err:' + err);
            //this.isLoaded = false;
        }
    }

    trackEvents = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.PRIVACY_POLICY)
    }

    render() {
        let privacyPolicyUrl = get(this.props.configResponse, 'data.config.termConditionPrivacy.privacyPolicyUrl');
        return (
            <div className="privacy-policy-container form-container">
                <iframe id="myframe" src={privacyPolicyUrl} onLoad={() => this.loadHandler()}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    configResponse: get(state.headerDetails, 'configResponse'),
});

const mapDispatchToProps = dispatch => {
    return {
        ...bindActionCreators({
            showMainLoaderImmediate,
            hideMainLoader,
        }, dispatch),
    }
}


PrivacyPolicy.propTypes = {
    configResponse: PropTypes.object,
    showMainLoaderImmediate: PropTypes.func,
    hideMainLoader: PropTypes.func,
};

export default (connect(mapStateToProps, mapDispatchToProps)(PrivacyPolicy));
