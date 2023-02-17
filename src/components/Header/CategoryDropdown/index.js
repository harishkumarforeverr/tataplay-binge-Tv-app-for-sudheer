import React, { Component } from "react";
import PropTypes from "prop-types";
import "./style.scss";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import get from "lodash/get";
import { NavLink } from "react-router-dom";
import { LOCALSTORAGE, NO_OP } from "@constants";
import { categoryDropDown } from "@components/Header/APIs/actions";
import { TAB_BREAKPOINT } from "@utils/constants";
import imagePlaceholderLandscape from "@assets/images/image-placeholder-landscape.png";
import { isMobile, showNoInternetPopup, getFormattedURLValue } from "@utils/common";
import { URL } from "@constants/routeConstants";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import dataLayerConfig from "@utils/dataLayer";
import DATALAYER from "@utils/constants/dataLayer";
import { setKey } from "@utils/storage";

class CategoryDropdown extends Component {
    componentDidMount() {
        document.addEventListener("click", this.handleClickOutside);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.pathname !== this.props.pathname) {
            this.props.categoryDropDown && this.props.categoryDropDown(false);
        }
    };

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
    }

    myRef = React.createRef();

    handleClickOutside = (e) => {
        if (this.myRef.current && !this.myRef.current.contains(e.target)) {
            this.props.categoryDropDown && this.props.categoryDropDown(false);
        }
    };

    listView = (categoriesList) => {
        return (<React.Fragment>
            {categoriesList?.items?.map((d, i) => (<div className="items-container" key={i}>
                <NavLink
                    to={{
                        pathname: `/${URL.CATEGORIES}/${getFormattedURLValue(d?.pageName)}`, state: { pageType: d.pageType },
                    }}
                    onClick={!navigator.onLine ? showNoInternetPopup : () => this.onCategoryClick(d)}
                    activeClassName="selectedLink"
                >
                    {window.innerWidth <= TAB_BREAKPOINT ? (<div className="subImage-container">
                        <img
                            src={d.subPageImage}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = imagePlaceholderLandscape;
                                e.target.className = "broken-image";
                            }}
                            alt=""
                        />
                        <p>{d.pageName}</p>
                    </div>) : (<p>{d.pageName}</p>)}
                </NavLink>
            </div>))}
        </React.Fragment>);
    };

    onCategoryClick = (pageData) => {
        if (isMobile.any()) {
            const data = {
                pageName: pageData?.pageName,
                pageType: pageData?.pageType
            }
            setKey(LOCALSTORAGE.SELECTED_CATEGORY_PAGE, data);
        }

        this.trackEvent(pageData?.pageName)
    }

    trackEvent = (pageName) => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.MENU_CATEGORY, {
            [MIXPANEL.PARAMETER.CATEGORY_NAME]: pageName,
        })
        dataLayerConfig.trackEvent(DATALAYER.EVENT.HEADER_CLICKS, {

            [DATALAYER.PARAMETER.HEADER_NAME]: DATALAYER.VALUE.CATEGORIES,
            [DATALAYER.PARAMETER.SUB_HEADER_NAME]: pageName
        })
    }

    render() {
        let { categoriesList, bottomSheetClose } = this.props;
        return (<React.Fragment>
            {window.innerWidth <= TAB_BREAKPOINT ? (<React.Fragment>
                <p className="bottomstyle-heading">Select Categories</p>
                <div className="bottomstyle-container">
                    {this.listView(categoriesList)}
                </div>
                <div className="bottom-close" onClick={() => bottomSheetClose()}>
                    Close
                </div>
            </React.Fragment>) : (<ul className="list-container" ref={this.myRef}>
                {this.listView(categoriesList)}
            </ul>)}
        </React.Fragment>);
    }
}

function mapStateToProps(state) {
    return {
        categoriesList: get(state.headerDetails, "categoriesList"),
        categoriesDropdownVal: state.headerDetails.categoriesDropdown,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            categoryDropDown,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CategoryDropdown));

CategoryDropdown.propTypes = {
    location: PropTypes.object,
    pathname: PropTypes.object,
    categoriesList: PropTypes.object,
    categoryDropDown: PropTypes.func,
    bottomSheetClose: PropTypes.func,
};
