import React, { Component, Fragment } from 'react';
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { LAYOUT_TYPE, SECTION_SOURCE, MOBILE_BREAKPOINT } from "@constants";
import ListingItem from "@common/ListingItem";
import { deleteKey, getKey, setKey } from "@utils/storage";
import {
    capitalizeFirstLetter,
    horizontalScroll,
    initialArrowState,
    scrollToTop,
    safeNavigation,
    showNoInternetPopup,
    isMobile,
    getSearchParams,
    getSearchParamsAsObject,
    getSearchParam,
    trackFilterToggle,
    isHomePage,
    getFormattedURLValue,
    getSEOData,
} from '@utils/common';
import { fetchHeaderData } from "@components/Header/APIs/actions";
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";

import {
    fetchBrowsingFilters,
    fetchSearchData,
    resetBrowseByState,
    resetBrowseDataState,
} from './APIs/action';
import { BROWSE_BY_QUERY_PARAM, BROWSE_TYPE } from './APIs/constants';

import './style.scss';
import queryString from "querystring";
import InfiniteScroll from 'react-infinite-scroll-component';
import BannerUnderHeader from './BannerUnderHeader';
import PaginationLoader from '../../common/PaginationLoader';
import appsFlyerConfig from '@src/utils/appsFlyer';
import APPSFLYER from '@src/utils/constants/appsFlyer';
import ContentSwitch from '@common/ToggleSwitch/ContentSwitch';
import { LOCALSTORAGE } from "@utils/constants";
import { URL } from '@utils/constants/routeConstants';
import MainSeo from '@common/MainSeo';
class BrowseByDetail extends Component {
    constructor(props) {
        super(props);
        const freeToggle = getSearchParam(BROWSE_BY_QUERY_PARAM.FREE_TOGGLE)
        this.state = {
            showFilter: false,
            leftArrow: false,
            rightArrow: false,
            activeItem: {},
            selectedGenre: '',
            browseType: '',
            selectedLanguage: '',
            activeItemName: '',
            showContainer: false,
            pageNumber: 1,
            fromFilterBrowse: 1,
            reSized: false,
            freeToggle: freeToggle === 'true',
            windowContainerWidth: window.innerWidth,
            metaTitle: '',
            metaDescription: '',
        }
        this.urlChange = false;
    }

    componentDidMount = async () => {
        const { fetchHeaderData, headerItems, location } = this.props;
        const { browseBy, browseByType } = this.props.match.params, urlArr = location?.state?.prevPath?.split('/'),
            isFromHomeScreen = isHomePage(location?.state?.prevPath),
            updateLangGenrePageSource = [URL.MOVIES, URL.TV_Shows].includes(urlArr[1]);
        if (isEmpty(headerItems)) {
            await fetchHeaderData();
        }
        await this.loadHandler();
        scrollToTop();
        window.addEventListener('resize', this.handleOnResize);
        isFromHomeScreen && deleteKey(LOCALSTORAGE.LANG_GENRE_PAGE_SOURCE);
        updateLangGenrePageSource && setKey(LOCALSTORAGE.LANG_GENRE_PAGE_SOURCE, urlArr[1]);
        this.getSEOMappedData();
        if (browseByType?.toUpperCase() === BROWSE_TYPE.LANGUAGE) {
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.VIEW_LANGUAGE, {
                [APPSFLYER.PARAMETER.LANGUAGE]: browseBy,
                [APPSFLYER.PARAMETER.SOURCE]: '',
            })
        }
        else {
            appsFlyerConfig.trackEvent(APPSFLYER.EVENT.VIEW_GENRE, {
                [APPSFLYER.PARAMETER.GENRE]: browseBy,
                [APPSFLYER.PARAMETER.SOURCE]: '',
            })
        }
    }

    componentDidUpdate = async (prevProps, prevState, snapshot) => {
        if (prevProps.location.search !== this.props.location.search && !this.urlChange) {
            let { location: { pathname }, resetBrowseDataState } = this.props;
            const urlArr = pathname.split('/');
            resetBrowseDataState();
            setTimeout(() => this.setState({
                pageNumber: 1,
                activeItem: {},
                activeItemName: '',
                fromFilterBrowse: 1,
            }), 0);
            await this.loadFilterData(urlArr);
        }
    }

    componentWillUnmount() {
        this.props.resetBrowseByState();
        window.removeEventListener('resize', this.handleOnResize);
        // deleteKey(LOCALSTORAGE.LANG_GENRE_PAGE_SOURCE);
    }

    getSEOMappedData = () => {
        let { location: { pathname } } = this.props;
        let { metaTitle, metaDescription } = getSEOData(pathname);
        this.setState({
            metaTitle,
            metaDescription,
        });
    }
    /**
     * @function loadHandler - contains API call just after the page renders or reloads, set state of browseType
     */
    loadHandler = async () => {
        let { location: { pathname } } = this.props;
        const urlArr = pathname.split('/');
        this.setState({
            browseType: (urlArr[2]),
        }, async () => {
            await this.loadFilterData(urlArr);
            this.setState({ showContainer: true }); // to handle error message while loading - TBAA-2412
            this.setSelectedItemsDetail(urlArr[3])
            await this.showFilterHandler();
        });
    };

    handleOnResize = () => {
        horizontalScroll('filter-container', this, 'leftArrow', 'rightArrow');
        this.setState({
            ...this.state,
            windowContainerWidth: window.innerWidth,
        });
    };

    loadFilterData = async (urlArr) => {
        const { location, filtersData, fetchBrowsingFilters, fetchSearchData } = this.props;
        let data = queryString.parse(location?.search);
        const { browseType, pageNumber } = this.state;
        let state = location?.state;
        const paramKey = browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE ? BROWSE_TYPE.GENRE : BROWSE_TYPE.LANGUAGE;
        const searchParams = getSearchParamsAsObject();
        let selectedBrowseTypeValue = capitalizeFirstLetter(urlArr[3]);
        let activeItemName = (browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE ? data[BROWSE_TYPE.GENRE?.toLowerCase()] : data[BROWSE_TYPE.LANGUAGE?.toLowerCase()]);
        if (!isEmpty(searchParams) && searchParams[paramKey?.toLowerCase()] !== undefined) {
            await this.setState({
                activeItem: { [state.itemId]: true },
                activeItemName: activeItemName,
            });
            if (filtersData && !Object.keys(filtersData).length) {
                // call API for only if there is no data
                (browseType.toUpperCase()) === BROWSE_TYPE.LANGUAGE
                    ? await fetchBrowsingFilters((BROWSE_TYPE.GENRE.toLowerCase()))
                    : await fetchBrowsingFilters((BROWSE_TYPE.LANGUAGE.toLowerCase()));
            }

            let selectedBrowseTypeValue = capitalizeFirstLetter(urlArr[3]);
            const { filterLanguage, filterGenre } = this.setFilters(browseType, selectedBrowseTypeValue, activeItemName);
            let payload = this.setFilterPayloadData(filterLanguage, filterGenre, this.state.fromFilterBrowse);
            await fetchSearchData(payload);
        } else {
            let filterLanguage = browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE ? [urlArr[3]] : [],
                filterGenre = browseType?.toUpperCase() === BROWSE_TYPE.GENRE ? [urlArr[3]] : [];
            let payload = this.setFilterPayloadData(filterLanguage, filterGenre, pageNumber);
            await fetchSearchData(payload);
        }

        const URLSearch = location?.search;
        const BrowseByfilterType = browseType?.toUpperCase() === BROWSE_TYPE.GENRE ? BROWSE_TYPE.LANGUAGE : BROWSE_TYPE.GENRE;
        const isBrowseByfilterType = URLSearch.includes(BrowseByfilterType);
        this.setState({
            showFilter: !!isBrowseByfilterType,
            activeItemName: isBrowseByfilterType ? URLSearch.split(`${BrowseByfilterType}=`)[1] : '',
            activeItem: !isBrowseByfilterType ? { 0: true } : {},
        })
    }

    setFilters = (browseType, selectedBrowseTypeValue, activeItemName) => {
        let filterLanguage = [], filterGenre = [];
        if (browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE) {
            filterLanguage = [selectedBrowseTypeValue];
            filterGenre = Object.keys(this.state.activeItem)[0] === "0" ? [] : [activeItemName];
        } else if (browseType?.toUpperCase() === BROWSE_TYPE.GENRE) {
            filterGenre = [selectedBrowseTypeValue];
            filterLanguage = Object.keys(this.state.activeItem)[0] === "0" ? [] : [activeItemName];
        }
        return { filterLanguage, filterGenre };
    }

    setFilterPayloadData = (filterLanguage, filterGenre, pageNumber) => {
        const { location } = this.props;
        let state = location?.state;
        let pageName = this.getPageName(state);
        return {
            "filterGenre": filterGenre,
            "filterLanguage": filterLanguage,
            "pageNumber": pageNumber,
            "pageName": pageName,
            "queryString": "",
            "freeToggle": this.state.freeToggle,
        };
    }

    getPageName = (state) => {
        let path = state?.pathUpdated ? state.pathUpdated.split('/')[1] : '';
        let pageName = path ? path : "Home";
        let data = this.props.headerItems.filter(item => item.pageName?.toLowerCase() === pageName?.toLowerCase());
        return data[0] ? (data[0].searchPageName ? data[0].searchPageName : '') : '';
    }

    /**
     * @function setSelectedItemsDetail - set state of selectedLanguage and selectedGenre on basis of browseType
     * @param value - string
     */
    setSelectedItemsDetail = (value) => {
        this.state.browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE ?
            this.setState({
                selectedLanguage: value,
            }) :
            this.setState({
                selectedGenre: value,
            })
    };

    /**
     * @function showFilterHandler
     * @return will set the state of showFilter and call the API to get filters value when showFilter is true
     */
    showFilterHandler = async () => {
        const { fetchBrowsingFilters, filtersData } = this.props;
        let { browseType, activeItem } = this.state;
        //textName = e && e.target.innerText; // text name i.e. Show Filter or Hide Filter

        /*if user clicks Show Filter, then API to fetch filter value will be called,
           if browseType is LANGUAGE then GENRE filters will be called else LANGUAGE filters*/
        if (activeItem && Object.keys(activeItem)[0] !== "0" && Object.keys(activeItem).length) {
            this.setState((previousState) => {
                return {
                    // showFilter: !previousState.showFilter,
                }
            }, () => {
                initialArrowState('filter-container', this, 'rightArrow');
            });
        } else {
            if (filtersData && !Object.keys(filtersData).length) {
                // call API for only if there is no data
                (browseType.toUpperCase()) === BROWSE_TYPE.LANGUAGE
                    ? await fetchBrowsingFilters((BROWSE_TYPE.GENRE.toLowerCase()))
                    : await fetchBrowsingFilters((BROWSE_TYPE.LANGUAGE.toLowerCase()));
            }

            this.setState((previousState) => {
                return {
                    // showFilter: !previousState.showFilter,
                }
            }, () => {
                initialArrowState('filter-container', this, 'rightArrow');
            });
        }
    };

    /**
     * @function toggleActiveItem
     * @param itemId - string
     * @param activeItemName - string
     */
    toggleActiveItem(itemId, activeItemName) {
        const currentState = this.state.activeItem && this.state.activeItem[itemId];
        let { selectedGenre, selectedLanguage, browseType } = this.state;
        let selectedBrowseTypeValue = (browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE)
            ? capitalizeFirstLetter(selectedLanguage)
            : capitalizeFirstLetter(selectedGenre);

        this.setState({
            activeItem: { [itemId]: currentState ? !currentState : true },
            activeItemName: activeItemName,
            fromFilterBrowse: 1,
        }, async () => {
            const { fetchSearchData, resetBrowseDataState } = this.props;
            resetBrowseDataState();
            await this.changeURL();

            this.urlChange = false;
            if (!currentState) {
                const {
                    filterLanguage,
                    filterGenre,
                } = this.setFilters(browseType, selectedBrowseTypeValue, activeItemName, itemId);
                let payload = this.setFilterPayloadData(filterLanguage, filterGenre, this.state.fromFilterBrowse);
                await fetchSearchData(payload);
            } else {
                this.setState({ pageNumber: 1, activeItem: {}, activeItemName: '', fromFilterBrowse: 1 });
                await this.loadHandler();
            }
        })
    }

    changeURL = () => {
        const { location, history } = this.props;
        let searchParams = getSearchParamsAsObject();
        const { browseType, activeItemName, activeItem } = this.state;
        const itemId = Number(Object.keys(activeItem)?.[0]);
        let newSearch, newState, prevState = location?.state;
        searchParams = {
            ...searchParams,
            [BROWSE_BY_QUERY_PARAM.FREE_TOGGLE]: !!this.state.freeToggle
        }
        const filterKey = browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE ? BROWSE_TYPE.GENRE?.toLowerCase() : BROWSE_TYPE.LANGUAGE.toLowerCase();
        if (this.state.activeItem[itemId] && itemId !== 0) {
            searchParams = {
                ...searchParams,
                [filterKey]: getFormattedURLValue(activeItemName)
            }
            newState = prevState && { ...prevState, itemId: itemId };
        } else {
            delete searchParams?.[filterKey]
            delete prevState.itemId;
            newState = prevState;
        }
        newSearch = new URLSearchParams(searchParams).toString();
        safeNavigation(history, {
            pathname: location?.pathname,
            search: newSearch,
            state: newState,
        });
        this.urlChange = true;
    }

    loadMore = () => {
        const {
            pageNumber,
            activeItem,
            fromFilterBrowse,
            selectedGenre,
            selectedLanguage,
            browseType,
            activeItemName,
        } = this.state;
        const { fetchSearchData } = this.props;

        if (activeItem && Object.keys(activeItem).length) {
            let selectedBrowseTypeValue = (browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE)
                ? capitalizeFirstLetter(selectedLanguage)
                : capitalizeFirstLetter(selectedGenre);

            this.setState({
                fromFilterBrowse: fromFilterBrowse + 1,
            }, async () => {

                const {
                    filterLanguage,
                    filterGenre,
                } = this.setFilters(browseType, selectedBrowseTypeValue, activeItemName);
                let payload = this.setFilterPayloadData(filterLanguage, filterGenre, this.state.fromFilterBrowse);
                await fetchSearchData(payload);
            });
        } else {
            let selectedBrowseTypeValue = (browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE)
                ? capitalizeFirstLetter(selectedLanguage)
                : capitalizeFirstLetter(selectedGenre);
            this.setState({
                pageNumber: pageNumber + 1,
            }, async () => {
                const {
                    filterLanguage,
                    filterGenre,
                } = this.setFilters(browseType, selectedBrowseTypeValue, activeItemName);
                let payload = this.setFilterPayloadData(filterLanguage, filterGenre, this.state.pageNumber);
                await fetchSearchData(payload);
            });
        }
    }

    getSectionSource = (pageType) => {
        if (pageType === "searchLanguage" || pageType === "searchGenre") {
            return SECTION_SOURCE.SEARCH;
        }
    }
    handleOnChangeFreeToggle = (value) => {
        let { location: { pathname }, resetBrowseDataState } = this.props;
        const urlArr = pathname.split('/');
        let { activeItem, activeItemName, browseType, selectedLanguage, selectedGenre } = this.state;
        resetBrowseDataState();
        // setTimeout(() => this.setState({
        //     pageNumber: 1,
        //     activeItem: {},
        //     activeItemName: '',
        //     fromFilterBrowse: 1,
        // }), 0);
        this.setState({
            freeToggle: value,
            pageNumber: 1
        }, async () => {
            this.changeURL();
            let selectedBrowseTypeValue = (browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE)
                ? capitalizeFirstLetter(selectedLanguage)
                : capitalizeFirstLetter(selectedGenre);
            const {
                filterLanguage,
                filterGenre,
            } = this.setFilters(browseType, selectedBrowseTypeValue, activeItemName);
            let payload = this.setFilterPayloadData(filterLanguage, filterGenre, this.state.pageNumber);
            await this.props.fetchSearchData(payload);
            trackFilterToggle(MIXPANEL, value, selectedBrowseTypeValue, this.props.currentSubscription)

            // if(activeItemName){	
            //     this.toggleActiveItem(activeItemName === 'All' ? 0 : activeItem[0], activeItemName)
            // }
            // else{
            //     this.changeURL();
            // }
        })
    };


    render() {
        const { filtersData, browseByDataItems, browseByData, location, headerDetails, isFetchingBrowseByData } = this.props;
        let {
            leftArrow,
            rightArrow,
            browseType,
            selectedLanguage,
            selectedGenre,
            showContainer,
            freeToggle
        } = this.state;
        const { railTitle, pathUpdated, pageType, bannerImg, bannerLogoImg, refUseCase } = location.state || {};
        let freeToggleEnable = headerDetails.configResponse?.data?.config?.freeToggleEnable,
            noResultFound = (browseByData && browseByData.itemCount === 0) || (browseByDataItems && browseByDataItems.length === 0 && !isFetchingBrowseByData)
        return (
            <React.Fragment>
                <MainSeo
                    metaTitle={this.state.metaTitle}
                    metaDescription={this.state.metaDescription}
                />
                <div className={'browse-by-container '}>
                    <BannerUnderHeader
                        bannerImg={bannerImg} 
                        bannerLogoImg={bannerLogoImg}
                        browseType={browseType?.toUpperCase()} 
                        selectedLanguage={selectedLanguage}
                        selectedGenre={selectedGenre} 
                        params={this.props?.match?.params}
                        location={location}
                    />
                    <div className={'heading-section'}>
                        <Fragment>
                            <div className="filter-container">

                                <h3 className="set-browseBy-header">{this.state.windowContainerWidth
                                    < MOBILE_BREAKPOINT ? "Filter" :
                                    browseType?.toUpperCase() === BROWSE_TYPE.LANGUAGE ? 'Genres' : 'Language'}</h3>
                                <ul className="language-filter" id="filter-container"
                                    onScroll={() => horizontalScroll('filter-container', this, 'leftArrow', 'rightArrow')}>
                                    {(this.state.windowContainerWidth
                                        > MOBILE_BREAKPOINT) && leftArrow &&
                                        <i className="left-icon"
                                            onClick={() => document.getElementById('filter-container').scrollLeft -= 200} />
                                    }
                                    {!isEmpty(filtersData) &&
                                        filtersData.map((item, index) =>
                                            <li key={index}
                                                className={this.state.activeItem[index] || (item.title === this.state.activeItemName) ? 'active' : ''}
                                                onClick={() => navigator.onLine ? this.toggleActiveItem(index, item.title) : showNoInternetPopup()}>{this.state.activeItem[index]}{item.title}
                                            </li>,
                                        )}
                                    {(this.state.windowContainerWidth
                                        > MOBILE_BREAKPOINT) && rightArrow &&
                                        <i className="right-icon"
                                            onClick={() => document.getElementById('filter-container').scrollLeft += 200}
                                        />}
                                </ul>
                                {
                                    freeToggleEnable &&
                                    <ContentSwitch
                                        name={'contentType'}
                                        value={freeToggle}
                                        onToggleChange={(e) => this.handleOnChangeFreeToggle(e.target.checked)} />
                                }
                            </div>
                        </Fragment>
                    </div>
                    <div className={'browse-by-items-section'}>
                        <ul className={`listing-landscape`}>
                            {
                                showContainer &&

                                <React.Fragment>
                                    {browseByDataItems && browseByDataItems.length ?

                                        <InfiniteScroll
                                            dataLength={browseByDataItems && browseByDataItems.length}
                                            next={this.loadMore}
                                            hasMore={browseByDataItems.length < browseByData.totalSearchCount}
                                            loader={<PaginationLoader />}
                                            scrollThreshold={isMobile.any() ? 0.3 : 0.8}
                                        >
                                            {browseByDataItems.map((item) =>
                                                <ListingItem item={item} key={item.id} view={LAYOUT_TYPE.LANDSCAPE}
                                                    source={this.getSectionSource(pageType)}
                                                    title={railTitle} pathUpdated={pathUpdated}
                                                    pageType={"browseBy"}
                                                    isToolTipRequired={true}
                                                    classNameSetHover="set-browse-popup"
                                                    refUseCase={refUseCase}
                                                />)}
                                        </InfiniteScroll>
                                        : noResultFound &&
                                        <div className={'no-result-found'}>
                                            <p>Sorry! We could not find any matching results</p>
                                        </div>
                                    }
                                </React.Fragment>
                            }
                            {/* {
                            browseByDataItems.length < browseByData.totalSearchCount &&
                            <div className='load-more'>
                                <img src="../../assets/images/loadmore.svg" alt='' onClick={() => this.loadMore()}/>
                                <span>
                                    Load More
                                </span>
                            </div>
                        } */}

                        </ul>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        filtersData: get(state.browseBy, 'browsingFilters'),
        browseByData: get(state.browseBy, 'browseByData'),
        browseByDataItems: get(state.browseBy, 'browseByDataItems'),
        headerItems: get(state, 'headerDetails.headerItems.items'),
        headerDetails: get(state, 'headerDetails'),
        currentSubscription: get(state.subscriptionDetails, 'currentSubscription.data'),
        isFetchingBrowseByData: get(state.browseBy, 'isFetchingBrowseByData')
    }
};

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        fetchBrowsingFilters,
        fetchSearchData,
        resetBrowseByState,
        resetBrowseDataState,
        fetchHeaderData,
    }, dispatch)
);

BrowseByDetail.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    filtersData: PropTypes.array,
    fetchBrowsingFilters: PropTypes.func,
    fetchSearchData: PropTypes.func,
    resetBrowseByState: PropTypes.func,
    browseByDataItems: PropTypes.array,
    browseByData: PropTypes.object,
    resetBrowseDataState: PropTypes.func,
    headerItems: PropTypes.array,
    headerDetails: PropTypes.object,
    fetchHeaderData: PropTypes.func,
    currentSubscription: PropTypes.array,
};

export default connect(mapStateToProps, mapDispatchToProps)(BrowseByDetail)
