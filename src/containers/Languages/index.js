import React, {Component} from "react";
import {bindActionCreators, compose} from "redux";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import get from "lodash/get";
import {hideMainLoader, showMainLoader} from "@src/action";
import "./style.scss";
import {showLanguageOnboardingPopup, isMobile} from "@utils/common";
import {getLanguageListing, openMobilePopup} from "./APIs/actions";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE, MOBILE_BREAKPOINT} from "@constants";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";

class Languages extends Component {
    state = {
        toggle: false,
    };

    componentDidMount() {
        this.loadHandler();
    }

    handleModal = () => {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            this.props.openMobilePopup();
        } else {
            showLanguageOnboardingPopup(window.innerWidth);
        }
    };

    loadHandler = async () => {
        let id = getKey(LOCALSTORAGE.ANONYMOUS_ID);
        isEmpty(this.props.languageList) && await this.props.getLanguageListing(id);
    };

    render() {
        return (
            <React.Fragment>
                {!this.state.toggle ? (
                    <div className="language-container">
                        <div className="lang-sub-container">
                            <div className="lang-message">
                                <div>
                                    <img
                                        className="text-box-image"
                                        alt=""
                                        src="../../assets/images/language.png"
                                    />
                                    <img
                                        className="hindi-letter-image"
                                        alt=""
                                        src="../../assets/images/hindi-letter.svg"
                                    />
                                    <img
                                        className="english-letter-image"
                                        alt=""
                                        src="../../assets/images/english-letter.svg"
                                    />
                                </div>
                                <div className="lang-text">
                                    <span>Personalise your videos</span>
                                    <span>with your preferred languages</span>
                                </div>
                            </div>
                            <div className="lang-cross-icon-wrapper">
                                <div className="select-language" onClick={this.handleModal}>
                                    <span>Select Languages</span>
                                    {
                                        isMobile.any() && <img alt="" src={isMobile.any() ? "../../assets/images/seeAll-small.png" :"../../assets/images/language-see-all.png"}/>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    languageList: get(state.languageReducer,'languageList'),
    header: get(state.commonContent, "header"),
    footer: get(state.commonContent, "footer"),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                showMainLoader,
                hideMainLoader,
                openMobilePopup,
                getLanguageListing,
            },
            dispatch,
        ),
    };
}

Languages.propTypes = {
    openMobilePopup: PropTypes.func,
    getLanguageListing: PropTypes.func,
    languageList: PropTypes.object,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Languages);
