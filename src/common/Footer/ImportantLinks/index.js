import React from 'react';
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import {withRouter} from "react-router";
import PropTypes from "prop-types";
import {fireFooterClickEvent, handleRedirectionOnClick} from '@utils/common';
import {FOOTER_ITEMS} from '../constants';
import {closePopup, openPopup} from "@common/Modal/action";
import {openLoginPopup} from '@containers/Login/APIs/actions';
import './style.scss';
import isEmpty from "lodash/isEmpty";
import {SIDE_MENU_HEADERS} from "@components/Header/APIs/constants";
import get from "lodash/get";
import {getCurrentSubscriptionInfo} from "@containers/Subscription/APIs/action";
import {checkCurrentSubscription} from "@containers/Subscription/APIs/subscriptionCommon";
import {ACCOUNT_STATUS} from "@containers/BingeLogin/APIs/constants";
import {URL} from "@constants/routeConstants";

class ImportantLinks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            footerItems: [],
        };
    }

    componentDidMount = async () => {
        this.footerItemsList();
    }

    componentDidUpdate = async (prevProps) => {
        if ((this.props.loggedStatus !== prevProps.loggedStatus) || (this.props.currentSubscription !== prevProps.currentSubscription)) {
            this.footerItemsList();
        }
    }

    footerItemsList = () => {
        const {currentSubscription, loggedStatus} = this.props;
        if (loggedStatus && !checkCurrentSubscription(currentSubscription)) {
            FOOTER_ITEMS?.map(i => {
                if (i.displayName === SIDE_MENU_HEADERS.SUBSCRIBE) {
                    i.displayName = SIDE_MENU_HEADERS.MY_PLAN;
                    i.linkToRedirect = `${URL.SUBSCRIPTION}`;
                }
            })
        } else if (!loggedStatus) {
            if (FOOTER_ITEMS[0].displayName === SIDE_MENU_HEADERS.MY_PLAN) {
                FOOTER_ITEMS[0].displayName = SIDE_MENU_HEADERS.SUBSCRIBE
                FOOTER_ITEMS[0].linkToRedirect = `${URL.SUBSCRIPTION}`
            }
        }

        this.setState({
            footerItems: FOOTER_ITEMS,
        });
    }

    menuItemClick = async (item) => {
        fireFooterClickEvent(item?.name);
        const {history, openPopup, closePopup, openLoginPopup} = this.props;
        await handleRedirectionOnClick(item, history, openPopup, closePopup, openLoginPopup);
    }

    render() {
        const {footerItems} = this.state;
        return (
            <div className="important-links">
                {footerItems && footerItems.length > 0 && <ul>
                    {
                        footerItems.map((item, index) => {
                            return (<li
                                onClick={() => this.menuItemClick(item)}
                                key={index}
                            >
                                <div>
                                    {item.displayName}
                                </div>
                            </li>)
                        })
                    }
                </ul>}
            </div>
        )
    }
}


const mapStateToProps = (state) => ({
    loggedStatus: state.commonContent.loggedStatus,
    currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
});

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            openPopup,
            closePopup,
            openLoginPopup,
            getCurrentSubscriptionInfo,
        }, dispatch),
    }
};


ImportantLinks.propTypes = {
    history: PropTypes.object,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    openLoginPopup: PropTypes.func,
    loggedStatus: PropTypes.bool,
    currentSubscription: PropTypes.object,
    getCurrentSubscriptionInfo: PropTypes.func,
}


export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(ImportantLinks);