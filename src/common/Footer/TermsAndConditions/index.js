import React, {Component} from "react";
import {connect} from "react-redux";
import get from 'lodash/get';
import PropTypes from "prop-types";

import {scrollToTop} from "@utils/common";

import './style.scss';
import {bindActionCreators} from "redux";
import {hideMainLoader, showMainLoaderImmediate} from "@src/action";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import moengageConfig from "@utils/moengage";
class TermsAndConditions extends Component {
    constructor(props) {
        super(props);
        this.isLoaded = true;
    }

    componentDidMount() {
        this.props.showMainLoaderImmediate();
        scrollToTop();
        setTimeout(() => this.props.hideMainLoader(), 400);
        this.trackEvents();
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
    };

    trackEvents = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.TERMS_CONDITIONS)
        moengageConfig.trackEvent(MOENGAGE.EVENT.TERMS_CONDITIONS)
    }

    render() {
        let termsConditionsUrl = get(this.props.configResponse, 'data.config.termConditionPrivacy.termConditionsUrl');
        return (
            <div className="eula-container form-container">
                <iframe id="myframe" src={termsConditionsUrl} onLoad={() => this.loadHandler()}/>
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

TermsAndConditions.propTypes = {
    configResponse: PropTypes.object,
    showMainLoaderImmediate: PropTypes.func,
    hideMainLoader: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermsAndConditions);
