import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { closeMobilePopup, fetchUserSelectedData, getLanguageListing, savePreferredLanguages, } from "../APIs/actions";
import "./style.scss";
import Buttons from "@common/Buttons";
import { closePopup, openPopup } from "@common/Modal/action";
import { CATEGORY_NAME, LOCALSTORAGE, MOBILE_BREAKPOINT } from "@constants";
import { getKey, setKey } from "@utils/storage";
import { fetchAnonymousId } from "@components/Header/APIs/actions";
import PropTypes from "prop-types";
import placeHolder from '@assets/images/image-placeholder-content-language.png';
import {
    getUserSelectedLanguages,
    isMobile,
    isUserloggedIn,
    safeNavigation,
    showToast,
    getVerbiages,
} from "@utils/common";
import { URL } from "@constants/routeConstants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import { isEqual, sortBy } from "lodash";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import isEmpty from "lodash/isEmpty";

class SelectLanguage extends Component {
    constructor(props) {
        super(props);
        this.state = {languageSelected: [], buttonDisable: true, languageSelectedBeforeChange: [],  languageSubHeader : 'Watch content in these preferred languages'};
    }

    componentDidMount = async () => {
        let id = getKey(LOCALSTORAGE.ANONYMOUS_ID);
        await this.props.getLanguageListing(id);
        if (this.props.isChangeSelectedLanguageComponent) {
            let selectedLanguages = await getUserSelectedLanguages();
            this.getSelectedLanguage(selectedLanguages);
        }
        let source = (this.props.isChangeSelectedLanguageComponent ? MIXPANEL.VALUE.HAMBURGER : MIXPANEL.VALUE.NUDGE);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_LANG_OPEN, { [MIXPANEL.PARAMETER.SOURCE]: source });
        if (!this.props.isChangeSelectedLanguageComponent && document.body.contains(document.querySelector('.selection-container')) && isMobile.any() && document.body.clientHeight < 690) {
            document.querySelector('.selection-container').style.height = `${document.body.clientHeight - 165}px`;
            document.querySelector('.selection-container').style.overflowY = 'scroll';
        }
        this.getLanguageVerbiages();
    }

    check = (id) => {
        const { languageSelected } = this.state;
        return languageSelected.includes(id);
    };

    handleLanguageSelect = async (id, e) => {
        e.persist();
        const { barStatus } = this.props;
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            await this.languageHandle(id);
        } else {
            if (!this.props.isChangeSelectedLanguageComponent && !barStatus) {
                this.setState({
                    languageSelected: [...this.state.languageSelected, id],
                });
                this.props.bottomSheetExpand();
            } else {
                await this.languageHandle(id);
            }
        }
    };

    checkChangeSelectedLanguage = () => {
        const { languageSelectedBeforeChange, languageSelected } = this.state
        const isChange = isEqual(sortBy(languageSelectedBeforeChange, [(o) => o]), sortBy(this.state.languageSelected, [(o) => o]))
        if (languageSelectedBeforeChange.length > 0) {
            if (languageSelected.length > 0 && isChange) {
                this.setState({ buttonDisable: true })
            }
            else {
                this.setState({ buttonDisable: false })
            }
        }
        else if (languageSelectedBeforeChange?.length === 0 && languageSelected.length > 0) {
            this.setState({ buttonDisable: false })
        }
        else {
            this.setState({ buttonDisable: true })
        }
    }

    languageHandle = (id) => {
        const { languageSelected } = this.state;
        const { maxLanguageAllowed, maxLanguageErrorMessage } = this.props.languageData.data;
        if (languageSelected.some((d) => d === id)) {
            let data = languageSelected.filter((d) => d !== id);
            this.setState({
                languageSelected: data,
            }, () => {
                this.checkChangeSelectedLanguage()
            });

        } else {
            if (this.state.languageSelected.length >= maxLanguageAllowed) {
                return showToast(maxLanguageErrorMessage);
            }
            this.setState({
                languageSelected: [...this.state.languageSelected, id]
            }, () => {
                this.checkChangeSelectedLanguage()
            });
        }
    }

    mixpanelLanguage = (language) => {
        const selectedLanguage = {};

        language && language.forEach((data, key) => {
            selectedLanguage[`${MIXPANEL.VALUE.LANGUAGE}${key + 1}`] = data.name;
        })

        return selectedLanguage
    }
    getSelectedLanguageName = () => {
        const { languageList } = this.props;
        const { languageSelected } = this.state;
        return languageList.data?.contentList?.filter(data => ((languageSelected)?.includes(data?.id))).map(data => (data?.title))?.join(" , ")
    }


    saveLanguages = async () => {
        const { languageSelected } = this.state;
        const {
            savePreferredLanguages,
            fetchAnonymousId,
            closePopup,
            closeMobilePopup,
            bottomSheetClose,
            isChangeSelectedLanguageComponent,
            history,
        } = this.props;

        let body = {
            languageId: languageSelected,
        }, userPreferredLanguages = [],
            userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const { baId, rmn: mobileNumber, sId: bingeSubscriberId } = userInfo
        const data = { baId, mobileNumber, bingeSubscriberId };
        let id = getKey(LOCALSTORAGE.ANONYMOUS_ID);


        if (isUserloggedIn()) {
            body = {
                languageId: languageSelected,
                ...data,
            };
        }

        await savePreferredLanguages(body, id);
        this.getSelectedLanguageName()
        dataLayerConfig.trackEvent(DATALAYER.EVENT.SETTING_CTAS,
            {
                [DATALAYER.PARAMETER.BUTTON_NAME]: DATALAYER.VALUE.PROCEED,

                [DATALAYER.PARAMETER.LANGUAGE_NAME]: this.getSelectedLanguageName()

            })

        if (isChangeSelectedLanguageComponent && this.props.savedPreferredLanguages?.code === 0) {
            safeNavigation(history, `/${URL.HOME}`);
        }

        if (isUserloggedIn()) {
            userPreferredLanguages = await getUserSelectedLanguages();
        } else {
            await fetchAnonymousId();
            userPreferredLanguages = this.props.headerDetails?.anonymousUserData?.preferredLanguages;
        }
        this.setState({ buttonDisable: true, languageSelected: [], languageSelectedBeforeChange: [] }, () => {
            this.getSelectedLanguage(userPreferredLanguages);
        })

        setKey(LOCALSTORAGE.PREFERRED_LANGUAGES, userPreferredLanguages);
        let mixpanelData = this.mixpanelLanguage(userPreferredLanguages);
        let noLanguageSelected = JSON.parse(getKey(LOCALSTORAGE.NO_LANGUAGE_SELECTED));
        mixpanelData[`${MIXPANEL.PARAMETER.SOURCE}`] = !noLanguageSelected ? MIXPANEL.VALUE.APP_LAUNCH : (isChangeSelectedLanguageComponent ? '' : MIXPANEL.VALUE.NUDGE);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_LANG_SELECT, mixpanelData);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_LANG_PROCEED);
        closePopup();
        closeMobilePopup();
        window.innerWidth > MOBILE_BREAKPOINT && bottomSheetClose && bottomSheetClose();

    };

    modalClose = () => {
        const { closePopup, closeMobilePopup, bottomSheetClose } = this.props;
        closePopup();
        closeMobilePopup();
        window.innerWidth < MOBILE_BREAKPOINT && bottomSheetClose();

        setKey(LOCALSTORAGE.NO_LANGUAGE_SELECTED, true);
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.CONTENT_LANG_SKIP, "");

    };

    getSelectedLanguage = (value) => {
        if (value && value.length > 0) {
            const selectedLanguages = value && value.map(selectedLan => (selectedLan.id))
            this.setState({
                ...this.state,
                languageSelected: [...this.state.languageSelected, ...selectedLanguages],
                languageSelectedBeforeChange: [...this.state.languageSelected, ...selectedLanguages]
            });
        }
    }

    languagePopup = () => {
        const { languageList } = this.props;

        return (
            languageList?.data?.contentList?.length > 0 &&
            languageList.data.contentList.map((d) => (
                <div
                    className={
                        this.check(d.id)
                            ? "languageId-innercontainer gradient "
                            : "languageId-innercontainer"
                    }
                    key={d.id}
                    onClick={(e) => {
                        this.handleLanguageSelect(d.id, e);
                    }}
                >
                    <img
                        src={
                            d.backgroundImage ? d.backgroundImage : placeHolder
                        }
                        alt="bg"
                        className={`lang-img ${this.check(d.id) ? "img-gradient" : ""} ${!d.backgroundImage && 'placeholder-image'}`}
                    />
                    <p className="language-name">{d.title}</p>
                    {
                        <div className="language-symbol">
                            <img
                                src={d.image}
                                alt={d.nativeName}
                                onError={(e) => {
                                    e.target.className = "broken-image";
                                }}
                            />
                        </div>
                    }
                </div>
            ))
        );
    }

    getLanguageVerbiages = () => {
        let data;
        if (this.props.isChangeSelectedLanguageComponent) {
            data = getVerbiages(CATEGORY_NAME.LANGUAGE_SETTING);
        } else {
            data = getVerbiages(CATEGORY_NAME.LANGUAGE_DRAWER);
        }
        !isEmpty(data) && this.setState({
            languageSubHeader: data?.subHeader,
            buttonTitle: data?.others?.buttonTitle || 'Select content language',
        });
    }

    render() {
        const { barStatus, touchStatus, isChangeSelectedLanguageComponent } = this.props;
        const { languageSelected } = this.state;

        return (
            <div className="selection-container">
                {!isChangeSelectedLanguageComponent && <h4 className="languageId-subHeading">{this.state.languageSubHeader}</h4>}
                <div className="languageId-container">{this.languagePopup()}</div>
               { this.state.buttonTitle && 
               <Buttons
                    bValue={this.state.buttonTitle}
                    // cName={isChangeSelectedLanguageComponent ? "save-prefernces-button selected-language-btn primary-btn" : `save-prefernces-button primary-btn ${
                    //     barStatus === false && !touchStatus ? `swipe-screen` : null
                    // }`}
                    cName="save-prefernces-button selected-language-btn primary-btn"
                    bType="button"
                    clickHandler={this.saveLanguages}
                    disabled={this.state.buttonDisable}
                />
               }
                {isChangeSelectedLanguageComponent ? null : <p
                    className={`not-click`}
                    // className={`not-click ${
                    //     barStatus === false && !touchStatus ? `swipe-screen-not-click` : null
                    // }`}
                    onClick={this.modalClose}
                >
                    Not Now
                </p>}

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        languageList: state.languageReducer.languageList,
        modal: state.modal,
        headerDetails: state.headerDetails,
        selectedLanguages: state.languages.selectedLanguage.data,
        languageData: state.languages.languageList,
        savedPreferredLanguages: state.languages.savedPreferredLanguages,
    };
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                getLanguageListing,
                openPopup,
                closePopup,
                savePreferredLanguages,
                fetchAnonymousId,
                closeMobilePopup,
                fetchUserSelectedData,
            },
            dispatch,
        ),
    };
}

SelectLanguage.propTypes = {
    languageList: PropTypes.object,
    modal: PropTypes.object,
    headerDetails: PropTypes.object,
    getLanguageListing: PropTypes.func,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    savePreferredLanguages: PropTypes.func,
    fetchAnonymousId: PropTypes.func,
    barStatus: PropTypes.bool,
    closeMobilePopup: PropTypes.func,
    bottomSheetClose: PropTypes.func,
    touchStatus: PropTypes.bool,
    bottomSheetExpand: PropTypes.func,
    isChangeSelectedLanguageComponent: PropTypes.bool,
    fetchUserSelectedData: PropTypes.func,
    selectedLanguages: PropTypes.object,
    savedPreferredLanguages: PropTypes.object,
    history: PropTypes.object,
    languageData: PropTypes.object,
};
export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(SelectLanguage);
