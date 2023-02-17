import React, { Component } from 'react';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import Slider from "react-slick";
import { URL } from "@constants/routeConstants";
import { connect } from "react-redux";
import queryString from 'querystring';
import { bindActionCreators } from "redux";
import { searchFilterList, resetSearchState } from './APIs/actions';
import ListingItem from "@common/ListingItem";
import { getKey, setKey } from "@utils/storage";
import { accountDropDown, getGenreInfo, recentSearch, setSearch, setSearchText } from "@components/Header/APIs/actions";
import {
    fetchPIRecommendedData,
} from '@containers/PIDetail/API/actions';
import { hideHeader } from "@src/action";
import './style.scss';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import { getProfileDetails } from "@containers/Profile/APIs/action";
import PropTypes from 'prop-types';
import { LOCALSTORAGE } from "@constants";
import {
    afterChangeHandler,
    beforeChangeHandler,
    COMMON_VALUE,
    getDefaultValue,
    slidesToShow,
} from "@common/Listing/constants";
import { updateSearchList, isMobile, safeNavigation, getAnalyticsSource,trackFilterToggle } from "@utils/common";
import {
    fetchSearchData,
    resetBrowseDataState,
    fetchSearchLandingData,
    fetchTrendingData, resetBrowseByState,
} from "@containers/BrowseByDetail/APIs/action";
import RecentSearch from './components/RecentSearch';
import NoResultFound from './components/NoResultFound';
import SearchBottomSection from './components/SearchBottomSection';
import SearchResult from './components/SearchResult';
import TopSearchHeader from './components/TopSearchHeader';

const DEFAULT_FILTER = {
    id: -1,
    title: "All",
}

const settings = {
    dots: false,
    infinite: false,
    speed: 1000,
    draggable: true,
    slidesToScroll: COMMON_VALUE.LARGE.DEFAULT_SLIDE_SCROLL,
    swipeToSlide: true,
    variableWidth: true,
    arrows: !isMobile.any(),
    focusOnSelect: true,

};

class Search extends Component {

    constructor(props) {
        super(props);
        const { location: { search, hash } } = this.props;
        this.values = queryString.parse(search);
        let data = hash ? `${this.values['?q']}${hash}` : this.values['?q'];
        this.state = {
            hideFilter: true,
            searchText: data || '',
            activeItem: {},
            activeFilterItem: { ...DEFAULT_FILTER },
            activeFilterLanguageItem: [DEFAULT_FILTER],
            activeFilterGenerItem: [DEFAULT_FILTER],
            slidesToScroll: null,
            toggleContent: false,
            pageNumber: 1,
            trendingPageNumber: 1,
            dragging: false,
            swipe: false,
            visitedSliderID: [],
            isFilterExpanded: false,
            showRailsOnLoadInMobileView: true,
            list: JSON.parse(getKey(LOCALSTORAGE.SEARCH)),
            isSearchFieldActive: false,
            sourcePath: '',
            isLoading: false,
            resetToggle: false,
        }
        this.searchText = "";
        this.appWidth = document.getElementById('app').clientWidth;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.searchText && nextProps.searchText !== prevState.searchText) {
            return { searchText: nextProps.searchText }
        }
        return null
    }

    componentDidMount() {
        const { state = {} } = this.props.location;
        this.handleOnResize();
        window.addEventListener('resize', this.handleOnResize);
        const data = this.state.searchText;
        if (isMobile.any() && data) {
            this.apiCall(data)
        } else {
            data && this.apiCall(data)
        }
        this.setState({
            ...this.state,
            sourcePath: state.prevPath,
        })
        this.props.fetchTrendingData(this.setSearchPayload(''));
        this.props.fetchSearchLandingData();
        this.getGenreAndLanguage();
        document.querySelector('#search-input').addEventListener("blur", this.searchFieldBlur);
        document.querySelector('#search-input').addEventListener("click", this.searchFieldClicked);
    }

    componentDidUpdate(prevProps, prevState) {
        const { location } = this.props;
        const isEmptySearchParam = location.search.length === 0;
        if (Object.keys(this.props.searchReducerData).length !== 0 && isEmptySearchParam) {
            this.apiCall(this.props?.searchReducerData?.searchText, isEmptySearchParam);
            this.props.resetSearchState();
        } else {
            if (prevState.searchText !== this.state.searchText
                // prevState.activeFilterGenerItem !== this.state.activeFilterGenerItem ||
                // prevState.activeFilterLanguageItem !== this.state.activeFilterLanguageItem
            ) {
                this.resetFilterItem();
                this.setState({
                    toggleContent: false,
                });
                this.resetToggleVal(true);
                this.apiCall(this.state.searchText, isEmptySearchParam);
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleOnResize);
        this.setState({ reSized: false });
        const { hideHeader } = this.props;
        hideHeader(false);
        this.props.setSearch(false);
        this.props.resetBrowseByState();
        this.props.resetBrowseDataState();
        this.props.setSearchText("");
        // this.props.resetSearchState();  //TSF-3505
    }

    searchFieldBlur = () => {
        setTimeout(() => {
            this.setState({ isSearchFieldActive: false })
        }, 10)
    }

    searchFieldClicked = () => {
        const allowRecentSearch = this.searchText.length === 0;
        this.setState({ isSearchFieldActive: allowRecentSearch });
    }

    clickOnCrossIcon = (e, item) => {
        e.stopPropagation();
        let list = JSON.parse(getKey(LOCALSTORAGE.SEARCH));
        list = list.filter(i => i !== item)
        this.setState({ list: list })
        setKey(LOCALSTORAGE.SEARCH, JSON.stringify(list));
    }

    handleOnResize = () => {
        // on resizing slider width is changing because slider component is working on window width so added thos to re-render the component on resizing
        this.setState((previousState) => {
            return {
                reSized: !previousState.reSized,
            }
        });
        this.state.visitedSliderID && this.state.visitedSliderID.map((item) => {
            let showItemCount = slidesToShow(item.layoutType, item.sectionSource);
            let leftItemsCount = item.totalItems - (item.currentSlide + item.showItemCount);
            if (showItemCount > leftItemsCount) {
                this[`slider${item.id}`] && this[`slider${item.id}`].slickGoTo((item.currentSlide + item.showItemCount) - showItemCount);
            }
        })
    };

    handleClick = (e, item, data) => {
        this.values = queryString.parse(this.props.location.search);
        let searchVal = this.props.location.hash ? `${this.values['?q']}${this.props.location.hash}` : this.values['?q'];
        updateSearchList(searchVal);
        this.trackInSearchClickResult(item.title, data.contentPosition);

    };

    apiCall = async (searchVal, isEmptySearchParam = false) => {
        if (!searchVal) { this.setState({ isSearchFieldActive: false }); }
        this.setState({
            isLoading: true
        })
        this.props.resetBrowseDataState();
        const list = JSON.parse(getKey(LOCALSTORAGE.SEARCH));
        let searchObj = {
            pageNumber: 1,
            searchText: searchVal,
            showRailsOnLoadInMobileView: false,
            list
        }
        if (isEmptySearchParam && !this.state.searchText) {
            let { activeFilterLanguageItem, activeFilterGenerItem, toggleContent } = this.state;
            activeFilterLanguageItem = activeFilterGenerItem = [DEFAULT_FILTER];
            searchObj = {
                ...searchObj,
                activeFilterLanguageItem,
                activeFilterGenerItem,
                isFilterExpanded: false,
                showRailsOnLoadInMobileView: true,
                toggleContent,
            }
        }
        /*
            TSF-3505: Part of Optimisation
        */
        this.searchText = searchVal;
        if (searchVal.length !== 0) {
            searchObj = {
                ...searchObj,
                isSearchFieldActive: false
            }
        }
        this.setState(searchObj, async () => {
            let payload = this.setSearchPayload(searchVal, 1);
            await this.props.fetchSearchData(payload, true);
            this.setState({
                isLoading: false
            })
            if (searchVal.length === 0 && isEmptySearchParam) { this.props.resetBrowseDataState(); }
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEARCH, this.searchEventData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.SEARCH, this.searchEventData(MOENGAGE));
            this.prevSearch = this.searchText;
            this.trackAnalytics();
            this.trackInSearchHome();
            this.trackInSearchHomeClick();
        });
    }
 
    getGenreAndLanguage = async () => {
        const { getGenreInfo, genreInfo } = this.props;
        if (isEmpty(genreInfo)) {
            await getGenreInfo();
        }
    }

    setSearchPayload = (searchVal, pageNumber = this.state.pageNumber) => {
        const { browseByData } = this.props;
        const filterLang = this.state.activeFilterLanguageItem.reduce((acc, item) => {
            if (item.id !== -1)
                acc.push(item.title);
            return acc;
        }, []);
        const filterGener = this.state.activeFilterGenerItem.reduce((acc, item) => {
            if (item.id !== -1)
                acc.push(item.title);
            return acc;
        }, []);
        /*
            TSF-3173: 6. Filters are not working
        */
        let payload = {
            "filterGenre": filterGener[0] ? filterGener : [],
            "filterLanguage": filterLang[0] ? filterLang : [],
            "queryString": searchVal,
            "pageNumber": pageNumber,
            "filter": !!(filterGener?.length || filterLang?.length),
            "freeToggle": this.state.toggleContent,

        };

        payload.intentUrl = this.props?.browseByData?.intentUrl || ""

        return payload;
    }

    trackAnalytics = () => {
        if (this.props.browseByData && this.props?.browseByData?.totalSearchCount === 0) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.NO_SEARCH_RESULT, this.noResultEventData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.NO_SEARCH_RESULT, this.noResultEventData(MOENGAGE));
        } else {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEARCH_RESULT, this.searchResultEventData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.SEARCH_RESULT, this.searchResultEventData(MOENGAGE));
        }
    };

    trackInSearchHome = () => {
        if (this.props.browseByData && this.props?.browseByData?.totalSearchCount !== 0) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEARCH_HOME, this.inHomeSearchEventData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.SEARCH_HOME, this.inHomeSearchEventData(MOENGAGE));
        }
    };

    trackInSearchHomeClick = () => {
        if (this.props.browseByData && this.props?.browseByData?.totalSearchCount !== 0) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEARCH_HOME_CLICKS, this.inHomeClickEventData(MIXPANEL));
            moengageConfig.trackEvent(MOENGAGE.EVENT.SEARCH_HOME_CLICKS, this.inHomeClickEventData(MOENGAGE));
        }
    };

    trackInSearchClickResult = (contentTitle, contentPosition) => {
        if (this.props.browseByData && this.props?.browseByData?.totalSearchCount !== 0) {
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEARCH_RESULT_CLICKS, this.inClickResultEventData(MIXPANEL, contentTitle, contentPosition));
            moengageConfig.trackEvent(MOENGAGE.EVENT.SEARCH_RESULT_CLICKS, this.inClickResultEventData(MOENGAGE, contentTitle, contentPosition));
        }
    };

    inHomeClickEventData = (analytics) => {
        const { location } = this.props;
        let searchParams = new URLSearchParams(location.state);
        const sectionSource = searchParams.get("sectionSource");
        return {
            [`${analytics.PARAMETER.SECTION}`]: sectionSource || MIXPANEL.VALUE.SEARCH_BAR,
        }
    }

    inClickResultEventData = (analytics = MIXPANEL, contentTitle, contentPosition) => {
        return {
            [`${analytics.PARAMETER.POSITION}`]: contentPosition,
            [`${analytics.PARAMETER.CONTENT_TITLE}`]: contentTitle,

        }
    }

    inHomeSearchEventData = (analytics) => {
        let getSource = getAnalyticsSource(this.state.sourcePath)
        return {
            [`${analytics.PARAMETER.SOURCE}`]: getSource,
        }
    }

    noResultEventData = (analytics) => {
        const { searchSourceVal } = this.props;
        const { activeFilterGenerItem = [], activeFilterLanguageItem = [] } = this.state;
        const currentLocation = window.location.pathname;
        let getSource = getAnalyticsSource(currentLocation)
        return {
            [`${analytics.PARAMETER.KEYWORD}`]: this.searchText,
            [`${analytics.PARAMETER.SEARCH_TYPE}`]: analytics.VALUE.SEARCH_TYPE,
            [`${analytics.PARAMETER.SOURCE}`]: getSource,
            [`${analytics.PARAMETER.SEARCH_COUNT}`]: this.props?.browseByData?.totalSearchCount,
            [`${analytics.PARAMETER.FILTER_LANGUAGE}`]: activeFilterLanguageItem.map(o => o.title).join() || '',
        }
    }

    searchResultEventData = (analytics = MIXPANEL) => {
        const { searchSourceVal } = this.props;
        const { activeFilterGenerItem = [], activeFilterLanguageItem = [] } = this.state;

        return {
            [`${analytics.PARAMETER.KEYWORD}`]: this.searchText,
            [`${analytics.PARAMETER.SEARCH_COUNT}`]: this.props?.browseByData?.totalSearchCount,
            [`${analytics.PARAMETER.SEARCH_TYPE}`]: analytics.VALUE.SEARCH_TYPE,
            [`${analytics.PARAMETER.SOURCE}`]: searchSourceVal || analytics.VALUE.SEARCH_SOURCE_MANUAL,
            [`${analytics.PARAMETER.FILTER_GENRE}`]: activeFilterGenerItem.map(o => o.title).join(',') || '',
            [`${analytics.PARAMETER.FILTER_LANGUAGE}`]: activeFilterLanguageItem.map(o => o.title).join(',') || '',
        }
    }

    searchEventData = (analytics) => {
        const { list, activeFilterGenerItem = [], activeFilterLanguageItem = [] } = this.state;
        const currentLocation = window.location.pathname;
        let screenName;
        let searchVal = this.props.searchSourceVal;
        if (!searchVal) {
            screenName = analytics.VALUE.RESULT_PAGE;
        } else {
            screenName = this.prevSearch ? analytics.VALUE.RESULT_PAGE : analytics.VALUE.SEARCH_PAGE;
        }
        const sourceVal = searchVal ? searchVal : analytics.VALUE.SEARCH_SOURCE_MANUAL;
        return {
            [`${analytics.PARAMETER.KEYWORD}`]: this.searchText,
            [`${analytics.PARAMETER.SCREEN_NAME}`]: screenName,
            [`${analytics.PARAMETER.SOURCE}`]: sourceVal,
            [`${analytics.PARAMETER.RECENT_SEARCH}`]: list?.join(",") || "",
            [`${analytics.PARAMETER.FILTER_GENRE}`]: activeFilterGenerItem.map(o => o.title).join() || '',
            [`${analytics.PARAMETER.FILTER_LANGUAGE}`]: activeFilterLanguageItem.map(o => o.title).join() || '',
        }
    };

    handleFilterClick = (item, source) => {
        /*
            TSF-3505: Part of Optimisation
        */
        let { activeFilterLanguageItem, activeFilterGenerItem, toggleContent } = this.state;
        if (source === "LANGUAGE") {
            const activeItem = this.state.activeFilterLanguageItem.length > 0 ? this.state.activeFilterLanguageItem[0].id : -1;
            if (activeItem !== item.id) {
                const arr = this.state.activeFilterLanguageItem.some(ele => this.state.selectedItem && ele.id === item.id) ? [] : [item];
                activeFilterLanguageItem = arr;
            }
            if (item.id !== -1 && this.state.activeFilterLanguageItem.some(ele => ele.id === item.id)) {
                activeFilterLanguageItem = [DEFAULT_FILTER];
            }
        } else {
            const activeItem = this.state.activeFilterGenerItem.length > 0 ? this.state.activeFilterGenerItem[0].id : -1;
            if (activeItem !== item.id) {
                const arr = this.state.activeFilterGenerItem.some(ele => ele.id === item.id) ? [] : [item];
                activeFilterGenerItem = arr;
            }
            if (item.id !== -1 && this.state.activeFilterGenerItem.some(ele => ele.id === item.id)) {
                activeFilterGenerItem = [DEFAULT_FILTER];
            }
        }
        this.setState({
            activeFilterGenerItem,
            activeFilterLanguageItem,
            toggleContent,
        }, () => {
            this.apiCall(this.searchText);
        });
    }

    resetFilterItem() {
        this.setState({
            activeFilterLanguageItem: [DEFAULT_FILTER],
            activeFilterGenerItem: [DEFAULT_FILTER],
        })
    }

    /*
    * @param filter
    * returns JSX
    */
    renderFilterItem = (filter) => {
        const { item, index, source } = filter;
        let selectedItem = this.state.activeFilterLanguageItem.find(ele => ele.id === item.id);
        if (source !== "LANGUAGE") {
            selectedItem = this.state.activeFilterGenerItem.find(ele => ele.id === item.id);
        }
        return <span
            className={`filter-item ${selectedItem ? 'active' : ''}`}
            key={`search-${index}`}
            title={item.title}
            onClick={() => this.handleFilterClick(item, source)}
        >
            {item.title}
            {selectedItem && index > -1 &&
                <span className={`icon-close`} innerRef={(el) => (this.iconClose = el)} onClick={() => this.inputClick()} />}
        </span>
    }

    toggleFilter = () => {
        this.setState({
            isFilterExpanded: !this.state.isFilterExpanded,
        })
    }

    /**
     *
     * @param data
     * @param sectionSource
     * @param pageType
     * @param newRailTitle
     * @param filter
     * @returns {JSX.Element}
     */
    renderSlider = (data, sectionSource, pageType, newRailTitle, filter = false) => {

        return (
            <Slider {...{
                ...settings,
                // 'slidesToScroll': this.state[`slidesToScroll_${data.id}`] ? this.state[`slidesToScroll_${data.id}`] :
                //     getDefaultValue(data.layoutType, data.contentList.length, data.sectionType, !!isMobile.any(), true),
            }}
                beforeChange={() => beforeChangeHandler(this)}
                afterChange={(item, e) => afterChangeHandler(item, e, data.contentList.length, data.id, data.layoutType, sectionSource, this, true)}
                slidesToShow={slidesToShow(data.layoutType, sectionSource, !!isMobile.any(), true)}
                ref={slider => this[`slider${data.id}`] = slider}>
                {filter && !isEmpty(data) && this.renderFilterItem({
                    item: DEFAULT_FILTER,
                    source: sectionSource,
                    index: -1,
                })}
                {
                    !isEmpty(data) && data.contentList.map((item, index) => {
                        return !filter ? <ListingItem
                            key={`search-${index}`}
                            item={item}
                            view={data.layoutType}
                            title={item.title}
                            sectionSource={sectionSource}
                            pageType={pageType}
                            newRailTitle={newRailTitle}
                            dragging={this.state.dragging}
                            classNameSetHover="set-hover-search"
                        /> : (
                            this.renderFilterItem({ item: item, source: sectionSource, index: index })
                        )
                    },
                    )}
            </Slider>
        )
    };

    loadMore = () => {
        document.querySelector('#search-input')?.blur();
        const { pageNumber } = this.state;
        let values = queryString.parse(this.props.location.search);
        let searchVal = this.props.location.hash ? `${values['?q']}${this.props.location.hash}` : values['?q'];
        this.setState({
            pageNumber: pageNumber + 1,
        }, async () => {
            let payload = this.setSearchPayload(searchVal);
            await this.props.fetchSearchData(payload, true);
            mixPanelConfig.trackEvent(MIXPANEL.EVENT.SEARCH_RESULT_SWIPE, {
                [`${MIXPANEL.PARAMETER.KEYWORD}`]: searchVal,
            });

            //need to ask if to be tracked
            //this.trackAnalytics();
        });
    };
    loadMoreTrending = () => {
        document.querySelector('#search-input')?.blur();
        const { trendingPageNumber } = this.state;
        this.setState({
            trendingPageNumber: trendingPageNumber + 1,
        }, async () => {
            let payload = this.setSearchPayload('', this.state.trendingPageNumber);
            await this.props.fetchTrendingData(payload);
        });
    };

    recentSearchHandler = item => {
        /*
            TSF-3505: Part of Optimisation
        */
        setKey(LOCALSTORAGE.CALL_TO_LEARN_API, JSON.stringify(true));
        const { history, setSearchText } = this.props;
        safeNavigation(history, `/${URL.SEARCH}?q=${item}`);
        setSearchText(item);
    }

    getToggleVal = (val) => {
        this.setState({
            toggleContent: val
        }, () => {
            this.apiCall(this.searchText);
            trackFilterToggle(MIXPANEL,this.state.toggleContent,'',this.props.currentSubscription)

        })
    }

    resetToggleVal = (val) => {
        this.setState({
            resetToggle: val,
        })
    }

    render() {
        const {
            browseByData,
            browseByDataItems,
            recentSearchVal,
            accountDropDownVal,
            searchLandingInfo,
        } = this.props;
        const {
            list,
            isSearchFieldActive,
            resetToggle,
        } = this.state;
        const { appInfo, genreInfo, langInfo } = searchLandingInfo;
        let { languageFilters, genreFilters, totalSearchCount } = this.props;
        languageFilters = langInfo;
        genreFilters = genreInfo;

        const shouldShowTopHeader = !isEmpty(browseByDataItems) || (this.state.isLoading && this.state.isFilterExpanded)

        return (
            <div className={`search-container ${isMobile.any() && 'for-mobile-view'}`}>
                <div
                    className="container-top search-result-list paddingTop40"
                    onClick={() => {
                        recentSearchVal && this.props.recentSearch(false);
                        accountDropDownVal && this.props.accountDropDown(false);
                    }}
                >
                    {list?.length > 0 && isMobile.any() && isSearchFieldActive && (
                        <RecentSearch
                            list={list}
                            recentSearchHandler={this.recentSearchHandler}
                            clickOnCrossIcon={this.clickOnCrossIcon}
                        />
                    )}

                    <TopSearchHeader
                        isShowTopHeader={shouldShowTopHeader}
                        renderSlider={this.renderSlider}
                        searchText={this.state.searchText}
                        isFilterExpanded={this.state.isFilterExpanded}
                        languageFilters={languageFilters}
                        genreFilters={genreFilters}
                        appWidth={this.appWidth}
                        renderFilterItem={this.renderFilterItem}
                        DEFAULT_FILTER={DEFAULT_FILTER}
                        toggleFilter={this.toggleFilter}
                        isLoading={this.state.isLoading}
                        getToggleVal={this.getToggleVal}
                        resetToggle={resetToggle}
                        resetToggleVal={this.resetToggleVal}
                    />
                    <SearchResult
                        browseByData={browseByData}
                        browseByDataItems={browseByDataItems}
                        loadMore={this.loadMore}
                        handleClick={this.handleClick}
                    />
                </div>

                {(browseByData.totalSearchCount === 0 || (isEmpty(browseByDataItems) && this.state.searchText?.length !==0) ) && <NoResultFound />}

                <SearchBottomSection
                    showRailsOnLoadInMobileView={this.state.showRailsOnLoadInMobileView}
                    renderSlider={this.renderSlider}
                    loadMoreTrending={this.loadMoreTrending}
                    handleClick={this.handleClick}
                    languageFilters={languageFilters}
                    genreFilters={genreFilters}
                    browseByDataItems={browseByDataItems}
                />
                <br />
            </div>)
    }
}

const mapStateToProps = (state) => {
    let searchText = state.headerDetails && state.headerDetails.searchText ? state.headerDetails.searchText.trim() : ''
    searchText = searchText.replace(/\s\s+/g, ' ')
    return {
        meta: get(state.PIDetails.data, 'meta'),
        browseByData: get(state.browseBy, 'browseByData'),
        browseByDataItems: get(state.browseBy, 'browseByDataItems'),
        searchLandingInfo: get(state.browseBy, 'searchLandingInfo'),
        trendingData: get(state.browseBy, 'trendingData'),
        trendingDataItems: get(state.browseBy, 'trendingDataItems'),
        languageFilters: get(state.searchReducer, 'searchFilterLanguage.data'),
        genreFilters: get(state.searchReducer, 'searchFilterGenre.data'),
        searchText,
        searchSourceVal: state.headerDetails.searchSource,
        accountDropDownVal: state.headerDetails.accountDropDown,
        recentSearchVal: state.headerDetails.recentSearch,
        genreInfo: get(state, 'headerDetails.genreInfo'),
        profileDetails: get(state, 'profileDetails.userProfileDetails'),
        itemsReceivedTillNow: state.browseBy.itemsReceivedTillNow,
        searchReducerData: state.searchReducer,
        totalSearchCount: get(state.browseBy, 'totalSearchCount'),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        fetchSearchData,
        fetchSearchLandingData,
        fetchTrendingData,
        searchFilterList,
        setSearch,
        setSearchText, //TSF-3505
        recentSearch,
        accountDropDown,
        hideHeader,
        getGenreInfo,
        getProfileDetails,
        resetBrowseDataState,
        fetchPIRecommendedData,
        resetSearchState,
        resetBrowseByState,
    }, dispatch)
)

Search.propTypes = {
    meta: PropTypes.object,
    searchText: PropTypes.string,
    hideHeader: PropTypes.func,
    location: PropTypes.object,
    setSearch: PropTypes.func,
    recentSearch: PropTypes.func,
    accountDropDown: PropTypes.func,
    fetchSearchData: PropTypes.func,
    fetchSearchLandingData: PropTypes.func,
    fetchTrendingData: PropTypes.func,
    searchFilterList: PropTypes.func,
    browseByData: PropTypes.object,
    trendingData: PropTypes.object,
    trendingDataItems: PropTypes.array,
    browseByDataItems: PropTypes.array,
    searchLandingInfo: PropTypes.object,
    searchSourceVal: PropTypes.string,
    languageFilters: PropTypes.object,
    genreFilters: PropTypes.object,
    recentSearchVal: PropTypes.bool,
    accountDropDownVal: PropTypes.bool,
    genreInfo: PropTypes.object,
    profileDetails: PropTypes.object,
    getGenreInfo: PropTypes.func,
    getProfileDetails: PropTypes.func,
    resetBrowseDataState: PropTypes.func,
    itemsReceivedTillNow: PropTypes.number,
    fetchPIRecommendedData: PropTypes.func,
    taRecommendationList: PropTypes.object,
    history: PropTypes.object,
    searchReducerData: PropTypes.object,
    resetSearchState: PropTypes.func,
    resetBrowseByState: PropTypes.func,
    currentSubscription: PropTypes.array,
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
