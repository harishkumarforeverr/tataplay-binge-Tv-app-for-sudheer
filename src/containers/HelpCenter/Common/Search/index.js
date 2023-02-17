import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import get from 'lodash/get';

import SearchIcon from '@assets/images/search-global.svg';
import SearchClose from '@assets/images/search-close.svg';
import backArrow from '@assets/images/arrow-back-gray.svg';
import whiteBackArrow from '@assets/images/arrow-back-wht.svg';
import noResultImage from '@assets/images/no-result.png';
import playVideoSvg from '@assets/images/play_video.svg';
import { URL } from '@constants/routeConstants';
import { isUserloggedIn, safeNavigation } from "@utils/common";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import ArrowBack from "@assets/images/arrow-back.svg";


import { getSearchAutoComplete, getTrendingList, clearDetails, helpCenterPopularityTrack } from '../../APIs/action';
import { TRENDING_TYPE, USER_TYPE, FAQ_DEFAULT_LIMIT, OFFSET_DEFAULT_VALUE, checkEmbedLink } from '../../APIs/constants'
import { HC_SCREEN_NAME, ACTION } from '../../APIs/constants';
import Accordion from '../Accordion';

import '../../style.scss';
import './style.scss';


class Search extends Component {
    constructor(props) {
        super(props);
        let { location } = this.props;
        this.state = {
            searchValue: get(location, 'state.searchValue', ''),
        }
    }

    componentDidMount = async () => {
        let { location: { pathname }, faqDataList } = this.props;
        const urlArr = pathname.split('/');

        if (urlArr && urlArr.includes(URL.HC_SEARCH)) {
            faqDataList === undefined && this.getTrendingFaqList();
            get(this.props.location, 'state.searchValue') && this.handleSearchChange();
        }
    };

    componentDidUpdate = (prevProps) => {
        let { location: { pathname }, searchValueText } = this.props;
        const urlArr = pathname.split('/');
        if (urlArr && urlArr.includes(URL.HC_SEARCH_RESULT)) {
            if (searchValueText?.length > 0 &&
                (prevProps?.searchValueText !== searchValueText)) {
                setTimeout(() => this.setState({
                    searchValue: searchValueText,
                }), 0);
            }
        }
    };

    getTrendingFaqList = async () => {
        let { getTrendingList } = this.props;
        const userType = isUserloggedIn() ? USER_TYPE.LOGGED_IN : USER_TYPE.GUEST;
        await getTrendingList(TRENDING_TYPE.FAQ, FAQ_DEFAULT_LIMIT, OFFSET_DEFAULT_VALUE, userType);
    }

    handleSearchFocus = () => {
        let { location: { pathname } } = this.props;
        const urlArr = pathname.split('/');
        this.state.searchValue === '' && this.trackEvents(MIXPANEL.EVENT.HC_SEARCH_START);
        if (!urlArr.includes(URL.HC_SEARCH)) {
            let { clearDetails, faqDataList, history } = this.props;
            clearDetails(ACTION.CLEAR_SEARCH_AUTO_COMPLETE);
            faqDataList === undefined && this.getTrendingFaqList();
            safeNavigation(history, {
                pathname: `/${URL.HELP_CENTER}/${URL.HC_SEARCH}`,
                state: {
                    searchValue: this.state.searchValue,
                },
            })
        }
    };


    handleSearchChange = (e) => {
        const userType = isUserloggedIn() ? USER_TYPE.LOGGED_IN : USER_TYPE.GUEST;

        this.setState({
            searchValue: e ? e.target.value : get(this.props.location, 'state.searchValue'),
        }, async () => {

            let { getSearchAutoComplete, clearDetails } = this.props,
                { searchValue } = this.state,
                params = { searchValue, userType };
            if (searchValue.length >= 2) {
                await getSearchAutoComplete(params);
                let { searchAutoCompleteData } = this.props;
                searchAutoCompleteData && searchAutoCompleteData.item.length === 0 ?
                    this.trackEvents(MIXPANEL.EVENT.HC_NO_SEARCH_RESULT) :
                    this.trackEvents(MIXPANEL.EVENT.HC_SEARCH_RESULT);
            }
            else {
                clearDetails(ACTION.CLEAR_SEARCH_AUTO_COMPLETE);
            }
        })
    }

    handleSearchResultClick = async (item) => {
        this.trackEvents(MIXPANEL.EVENT.HC_SEARCH, item?.title);
        if (isUserloggedIn()) {
            await this.props.helpCenterPopularityTrack(item).then(() => {
                safeNavigation(this.props.history, {
                    pathname: `/${URL.HELP_CENTER}/${URL.HC_SEARCH_RESULT}/${item.id}/${item.type}`,
                })
            });
        }
        else {
            safeNavigation(this.props.history, {
                pathname: `/${URL.HELP_CENTER}/${URL.HC_SEARCH_RESULT}/${item.id}/${item.type}`,
            })
        }
    }

    onIconClickHandler = (fromClose = false) => {
        fromClose ?
            this.setState({ searchValue: '' }, () => {
                this.props.clearDetails(ACTION.CLEAR_SEARCH_AUTO_COMPLETE);
            }) :
            safeNavigation(this.props.history, {
                pathname: `/${URL.HELP_CENTER}`,
            })
    }

    searchEventData = (analytics, eventValue) => {
        let searchVal = this.state.searchValue;
        return {
            [`${analytics.PARAMETER.KEYWORD}`]: searchVal,
            [`${analytics.PARAMETER.PHRASE}`]: eventValue,
            [`${analytics.PARAMETER.SOURCE}`]: analytics.VALUE.HC_AUTO_COMPLETE,
            [`${analytics.PARAMETER.SCREEN_NAME}`]: HC_SCREEN_NAME.HC_SEARCH,
        }
    };

    noResultEventData = (analytics) => {
        return {
            [`${analytics.PARAMETER.KEYWORD}`]: this.state.searchValue,
            [`${analytics.PARAMETER.SEARCH_TYPE}`]: analytics.VALUE.SEARCH_TYPE,
        }
    };

    searchResultEventData = (analytics) => {
        return {
            [`${analytics.PARAMETER.KEYWORD}`]: this.state.searchValue,
            [`${analytics.PARAMETER.SEARCH_COUNT}`]: this.props?.searchAutoCompleteData?.item.length,
        }
    }

    trackEvents = (eventName, eventValue) => {
        if (eventName === MIXPANEL.EVENT.HC_SEARCH_START) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_SEARCH_START);
            moengageConfig.trackEvent(MOENGAGE.EVENT.HC_SEARCH_START);
        }
        else if (eventName === MIXPANEL.EVENT.HC_SEARCH) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_SEARCH, this.searchEventData(MIXPANEL, eventValue));
            moengageConfig.trackEvent(MOENGAGE.EVENT.HC_SEARCH, this.searchEventData(MOENGAGE, eventValue));
        }
        else if (eventName === MIXPANEL.EVENT.HC_NO_SEARCH_RESULT) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_NO_SEARCH_RESULT, this.noResultEventData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.HC_NO_SEARCH_RESULT, this.noResultEventData(MOENGAGE));
        }
        else if (eventName === MIXPANEL.EVENT.HC_SEARCH_RESULT) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.HC_SEARCH_RESULT, this.searchResultEventData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.HC_SEARCH_RESULT, this.searchResultEventData(MOENGAGE));
        }
    }

    render() {
        let { searchValue } = this.state;
        let { mostlySearchedList = [], title, className, location: { pathname },
            searchAutoCompleteData, faqDataList, showBackArrow = false } = this.props;
        const urlArr = pathname.split('/');
        const autoFocus = !!(urlArr && urlArr.includes(URL.HC_SEARCH));

        return (
            <section className={`search-section ${className ? className : ''}`}>
                <React.Fragment>
                    <div className={'search-container'}>
                        {/* <h2>{isUserloggedIn() ? USER_TYPE.LOGGED_IN : USER_TYPE.GUEST}</h2>
                        <h2 className="heading1">{hCPopularityResp ? hCPopularityResp?.message : 'No Resp'}</h2>
                        <h2>{userInfo?.sId}</h2> */}
                        {title && <div className="heading-md">
                            <h2 className="heading1">{title}</h2>
                        </div>}
                        <div className="location-info-contr">
                            {showBackArrow &&
                                <span className="icon-contr search-global-back"
                                    onClick={() => this.onIconClickHandler(false)}>
                                    <a><img src={ArrowBack} alt='' /></a>
                                </span>}
                            <div className="location-details selectLocation">
                                {urlArr.includes(URL.HC_SEARCH) ?
                                    <span className="icon-contr search-back"
                                        onClick={() => this.onIconClickHandler(false)}><a><img
                                            src={backArrow} alt='' /></a>
                                    </span> :
                                    <span className="icon-contr search-global">
                                        <a><img src={SearchIcon} alt='' /></a>
                                    </span>}
                                <div className="search-add">
                                    <input type="text" className="form-control"
                                        onChange={(e) => this.handleSearchChange(e)}
                                        onFocus={this.handleSearchFocus}
                                        autoFocus={autoFocus}
                                        placeholder="Type Keyword. Eg : Change plan, Manage Devices, Subscription details…"
                                        style={{ border: 'none' }}
                                        name={'searchvalue'}
                                        value={searchValue}
                                        id="search-value"
                                        autoComplete={'off'} />
                                </div>
                                <span className="icon-contr search-speaker">
                                    {/*{searchValue === '' ? <a><img src={SearchSpeaker}/></a> :
                                <a onClick={this.onIconClickHandler}><img className='search-close'
                                                                          src={SearchClose}/></a>}*/}
                                    {searchValue !== '' &&
                                        <a onClick={() => this.onIconClickHandler(true)}>
                                            <img className='search-close' src={SearchClose} alt='' /></a>}
                                </span>
                            </div>
                            {!!mostlySearchedList.length && <div className="most-search">
                                <div className="heading-md">
                                    <h2 className="heading1">Most Searched</h2>
                                </div>
                                <ul>{mostlySearchedList.map((item, index) => {
                                    return <li key={index}><a>{item.label}</a></li>
                                })}</ul>
                            </div>}
                        </div>

                        {urlArr.includes(URL.HC_SEARCH) && <div className={'searched-data-block'}>
                            <React.Fragment>
                                {(searchAutoCompleteData && searchAutoCompleteData.item.length === 0) &&
                                    <div className="nores-outer">
                                        <span className="nores-icon">
                                            <img src={noResultImage} width="30" alt='' />
                                        </span>
                                        <div className="text-cont">
                                            <div
                                                className="heading">{`We couldn't find any result for '${searchValue}'`}</div>
                                            <div className="text">`Please ask your question differently`</div>
                                        </div>
                                    </div>}
                                {searchAutoCompleteData && searchAutoCompleteData?.item.length > 0 &&
                                    <div className={'searched-data'}>
                                        <ul>
                                            {searchAutoCompleteData.item.map((i, index) => {
                                                return <li key={index} onClick={() => {
                                                    this.handleSearchResultClick(i)
                                                }}>
                                                    <span>{i?.title}</span>
                                                    {checkEmbedLink(i) && <span className="video-tag">
                                                        <span className='video-icon'>
                                                            <img src={playVideoSvg} alt={'play-video'} />
                                                        </span>
                                                        {'video'}
                                                    </span>}
                                                </li>
                                            })}
                                        </ul>
                                    </div>}
                                {/* <!-- faq start --> */}
                                {(searchValue?.length < 2) && get(faqDataList, 'rails[0].rail') && faqDataList?.rails[0]?.rail.length > 0 &&
                                    <div className={'mostly-asked'}>
                                        <Accordion
                                            accordionList={faqDataList.rails[0].rail}
                                            title={faqDataList.rails[0].title}
                                            screenName={HC_SCREEN_NAME.HC_SEARCH}
                                        />
                                    </div>}
                            </React.Fragment>
                        </div>}
                    </div>
                </React.Fragment>
            </section>
        )
    }
}

Search.propTypes = {
    mostlySearchedList: PropTypes.array,
    title: PropTypes.string,
    history: PropTypes.object,
    getSearchAutoComplete: PropTypes.func,
    getTrendingList: PropTypes.func,
    clearDetails: PropTypes.func,
    searchAutoCompleteData: PropTypes.object,
    faqDataList: PropTypes.object,
    location: PropTypes.object,
    showBackArrow: PropTypes.bool,
    className: PropTypes.string,
    helpCenterPopularityTrack: PropTypes.func,
    searchValueText: PropTypes.string,
};

const mapStateToProps = (state) => ({
    searchAutoCompleteData: get(state.helpCenterReducer, 'searchAutoCompleteData.data'),
    faqDataList: get(state.helpCenterReducer, 'faqDataList.data'),
    hCPopularityResp: get(state.helpCenterReducer, 'hCPopularityResp'),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            getSearchAutoComplete,
            getTrendingList,
            clearDetails,
            helpCenterPopularityTrack,
        }, dispatch),
    }
}

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Search);

