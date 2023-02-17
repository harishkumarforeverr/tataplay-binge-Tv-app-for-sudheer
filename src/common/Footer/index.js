import React, {Component} from 'react';
import PropTypes from "prop-types";
import ConnectUs from './ConnectUs';
import Copyright from './Copyright';
import DownloadLinks from './DownloadLinks';
import TataSkyInfo from './TataskyInfo';
import ImportantLinks from './ImportantLinks';
import {dropDownDismissalCases, getVerbiages, queryStringToObject} from "@utils/common";
import {URL} from "@constants/routeConstants";

import './style.scss';
import {redirectToHomeScreen} from "@containers/BingeLogin/bingeLoginCommon";
import {BreadCrumbs} from "@common/Footer/BreadCrumbs";
import {CATEGORY_NAME, MENU_LIST, TAB_BREAKPOINT} from "@constants";
import {BROWSE_TYPE} from "@containers/BrowseByDetail/APIs/constants";

const getBreadCrumbName = (item) => {
    switch (item) {
        case URL.WATCHLIST:
            return MENU_LIST.BINGE_LIST;
        case URL.PROFILE:
            return MENU_LIST.EDIT_PROFILE;
        case URL.LANGUAGE:
            return `${getVerbiages(CATEGORY_NAME.LANGUAGE_SETTING)?.header || "Content Language" }`;
        case URL.DEVICE_MANAGEMENT:
            return MENU_LIST.MANGE_DEVICES;
        case URL.SWITCH_ACCOUNT:
            return MENU_LIST.SWITCH_ACCOUNT;
        case BROWSE_TYPE.LANGUAGE:
            return 'Language';
        case BROWSE_TYPE.GENRE:
            return 'Genre';
        case URL.SETTING:
            return MENU_LIST.SETTING;
        default:
            return item;
    }
}

const getLink = (item, history) => {
    const path = history.location.pathname;
    const pathHolderArr = path.toString().split('/');

    if ([URL.SEE_ALL, URL.TA_SEE_ALL, URL.TVOD, URL.CONTINUE_WATCHING_SEE_ALL, URL.RECOMMENDED_SEE_ALL, URL.WATCHLIST_SEE_ALL].includes(pathHolderArr[1])) {
        return history?.location?.state?.railTitle;
    }

    return item.charAt(0).toUpperCase() + item.slice(1);
}

const getDetailPageBreadCrumbs = (history, path) => {
    let breadCrumbData = [];
    let search = queryStringToObject(history.location.search);
    breadCrumbData.push(
        search?.breadCrumbSource?.charAt(0).toUpperCase() + search?.breadCrumbSource?.slice(1),
        history.location?.state?.title,
    );

    return breadCrumbData.map((link, index) => {
        if (Number(index) + 1 === breadCrumbData.length) {
            return <BreadCrumbs path="id" key={index} link={link} className="change-colour shorttext"/>
        }

        // path = `/${search?.breadCrumbSource}`;
        if (![URL.CATEGORIES.toLowerCase(), BROWSE_TYPE.LANGUAGE.toLowerCase(), BROWSE_TYPE.GENRE.toLowerCase(), URL.PARTNER].includes(search?.breadCrumbSource)) {
            path = `/${search?.breadCrumbSource}`;
        } else {
            path = history?.location?.state?.setPathIs
        }

        if (search?.breadCrumbSource === URL.PARTNER) {
            let partnerPath = history?.location?.state?.setPathIs?.pathname
            let routeUrl = partnerPath && partnerPath.split("/");
            link = routeUrl ? routeUrl[2] : link;
        }
        if(search?.breadCrumbSource === URL.SEARCH){
            let partnerPath = history?.location?.state?.setPathIs?.pathname;
            path= `${partnerPath}${history?.location?.state?.setPathIs?.search}`
        }

        return <BreadCrumbs path={path} key={index} link={link}/>
    });
};

const getEpisodePageBreadCrumbs = (history, path) => {
    let breadCrumbData = [];
    let search = queryStringToObject(history.location.search);
    breadCrumbData.push(
        search?.breadCrumbSource?.charAt(0).toUpperCase() + search?.breadCrumbSource?.slice(1),
        history.location?.state?.title,
    );

    return breadCrumbData.map((link, index) => {
        if (Number(index) + 1 === breadCrumbData.length) {
            return <BreadCrumbs path="id" key={index} link={link} className="change-colour shorttext"/>
        }

        // path = `/${search?.breadCrumbSource}`;
        if (![URL.CATEGORIES.toLowerCase(), BROWSE_TYPE.LANGUAGE.toLowerCase(), BROWSE_TYPE.GENRE.toLowerCase(), URL.PARTNER].includes(search?.breadCrumbSource)) {
            path = `/${search?.breadCrumbSource}`;
        } else {
            path = history?.location?.state?.setPathIs
        }

        if (search?.breadCrumbSource === URL.PARTNER) {
            let partnerPath = history?.location?.state?.setPathIs?.pathname
            let routeUrl = partnerPath && partnerPath.split("/");
            link = routeUrl ? routeUrl[2] : link;
        }

        return <BreadCrumbs path={path} key={index} link={link}/>
    });
};

const getRecommendedSeeAllPageBreadCrumbs = (history, path) => {
    let breadCrumbData = [];
    let contentLocation = history?.location?.state?.contentLocation;
    let title = contentLocation?.state?.title;

    breadCrumbData.push(
        title,
        history.location?.state?.railTitle || "",
    );

    return breadCrumbData.map((link, index) => {
        path = contentLocation;

        if (Number(index) + 1 === breadCrumbData.length) {
            return <BreadCrumbs path="id" key={index} link={link} className="change-colour shorttext"/>
        }

        return <BreadCrumbs path={path} key={index} link={link}/>
    });
};

const getBreadCrumbs = (history, categoryDropDown) => {
    let path = history.location.pathname;
    const pathHolderArr = path.toString().split('/');

    if (pathHolderArr[1] === URL.SETTING && window.innerWidth > TAB_BREAKPOINT) {
        pathHolderArr.pop();
    }

    const arrLength = pathHolderArr.length;
    let breadCrumbClick;

    let breadCrumb = ![URL.RECOMMENDED_SEE_ALL, URL.DETAIL].includes(pathHolderArr[1]) && pathHolderArr.filter((item) => {
        if (item.length > 2 && ![URL.HOME, URL.BROWSE_BY, URL.PARTNER, URL.SEE_ALL, URL.TA_SEE_ALL, URL.CONTINUE_WATCHING_SEE_ALL, URL.WATCHLIST_SEE_ALL].includes(item)) {
            return true;
        }
    }).map((item, index) => {
        if (item === URL.SETTING && window.innerWidth < TAB_BREAKPOINT && arrLength === 3) {
            path = `/${URL.SETTING}`;
        }

        item = getBreadCrumbName(item);
        let pathLink = getLink(item, history);

        if (Number(index) + 1 === arrLength - 1 || [URL.SEE_ALL, URL.TA_SEE_ALL, URL.TVOD, URL.CONTINUE_WATCHING_SEE_ALL, URL.PARTNER, URL.BROWSE_BY].includes(pathHolderArr[1])) {
            return <BreadCrumbs path="id" key={index} link={pathLink} className="change-colour"/>
        }

        if (item === URL.CATEGORIES) {
            breadCrumbClick = categoryDropDown;
        }

        return <BreadCrumbs path={path} key={index} link={pathLink} breadCrumbClick={breadCrumbClick}/>
    });

    if (pathHolderArr[1] === URL.DETAIL) {
        breadCrumb = getDetailPageBreadCrumbs(history, path);
    }

    if (pathHolderArr[1] === URL.EPISODE) {
        breadCrumb = getEpisodePageBreadCrumbs(history, path);
    }

    if (pathHolderArr[1] === URL.RECOMMENDED_SEE_ALL) {
        breadCrumb = getRecommendedSeeAllPageBreadCrumbs(history, path);
    }
    return breadCrumb;
}

export default class Footer extends Component {
    render() {
        const {history, categoryDropDown} = this.props;
        return (
            <footer onClick={() => dropDownDismissalCases('closeCondition')}>
                <div className="footer-wrapper">
                    <div className="footer-top-wrapper">
                        <div onClick={() => redirectToHomeScreen(history)}><i
                            className="icon-home"/></div>
                        <div className="path-fetch">
                            {getBreadCrumbs(history, categoryDropDown)}
                        </div>
                    </div>
                    <div className="horizontal-line"/>
                    <div className="footer-bottom-wrapper">
                        <div className="web-view">
                            <TataSkyInfo
                                history={history}
                            />
                        </div>
                        <ImportantLinks
                            history={history}
                        />
                        <div className="connection-details">
                            <ConnectUs
                                showTitle
                            />
                            <DownloadLinks/>
                            <div className="mobile-view">
                                <TataSkyInfo
                                    history={history}
                                />
                            </div>
                            <Copyright/>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }
};

Footer.propTypes = {
    setSearch: PropTypes.func,
    configResponse: PropTypes.object,
    accountDropDown: PropTypes.func,
    switchAccountDropDown: PropTypes.func,
    notificationDropDown: PropTypes.func,
    history: PropTypes.object,
    homeScreenDataItems: PropTypes.object,
    categoryDropDown: PropTypes.func,
};
