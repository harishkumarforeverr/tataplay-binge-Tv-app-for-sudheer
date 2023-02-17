import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { isEmpty } from 'lodash';

import { LOCALSTORAGE } from "@utils/constants";
import { getKey } from "@utils/storage";
import { URL } from '@constants/routeConstants';
import { isUserloggedIn, safeNavigation, getSearchParam } from "@utils/common";
import { hideFooter, hideHeader, hideMainLoader, showMainLoader } from "@src/action";

import SubHeader from '../SubHeader';
import Accordion from '../Common/Accordion';
import HelpVideoCard from '../Common/HelpVideoCard';
import HelpfulTracker from '../Common/HelpfulTracker';
import { ACCORDION_DEFAULT_LIMIT, ACTION, HC_SCREEN_NAME } from "../APIs/constants";
import { clearDetails, getCategoryDetail, getHCViewMoredata } from '../APIs/action';

import './style.scss';
import '../style.scss';

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: ACCORDION_DEFAULT_LIMIT,
            offset: 0,
            paginationList: {
                subCategories: [],
                helpVideos: {},
            },
        }
    }

    componentDidMount = async () => {
        let { hideHeader, hideFooter, getCategoryDetail, history, location } = this.props;
        const { limit, offset } = this.state;
        hideHeader(true);
        hideFooter(true);
        let categoryName = decodeURIComponent(window.location.search.split('?')?.[1].split('=')?.[1]);
        //let categoryInfo = JSON.parse(getKey(LOCALSTORAGE.HC_SELECTED_CATEGORY_DETAILS)) || {};
        //isEmpty(categoryInfo) && safeNavigation(history, { pathname: `/${URL.HELP_CENTER}` });
        (isEmpty(categoryName) || categoryName === "null") && safeNavigation(history, { pathname: `/${URL.HELP_CENTER}` });
        const userType = isUserloggedIn() ? 'LOGGED_IN ' : 'GUEST';
        const params = {
            category: encodeURIComponent(encodeURIComponent(categoryName)),
           // subCategories: categoryInfo?.subCategory.length > 0 && this.encodeSubCategoryData(categoryInfo?.subCategory),
            limit,
            offset,
            visibleTo: userType,
        }
        const categoryDetails = await getCategoryDetail(params);
        const faqList = get(categoryDetails, 'data.faqs');
        const helpVideoList = get(categoryDetails, 'data.helpVideos');
        const subCategoriesList = (get(categoryDetails, 'data.subCategories') || []).map(item => {
            return {
                title: item.title, totalCount: item.totalCount, limit: ACCORDION_DEFAULT_LIMIT, offset: 0,
            }
        });
        let isRespNotAvailable = (faqList?.totalCount === 0 && helpVideoList?.totalCount === 0 && subCategoriesList.length === 0);
        isRespNotAvailable && safeNavigation(history, { pathname: `/${URL.HELP_CENTER}` });
        !!subCategoriesList.length && setTimeout(() => this.setState({
            paginationList: {
                subCategories: subCategoriesList,
                helpVideos: {
                    title: helpVideoList.title,
                    totalCount: helpVideoList.totalCount,
                    limit: ACCORDION_DEFAULT_LIMIT,
                    offset: 0,
                },
            },
        }), 0);
    };

    componentWillUnmount = () => {
        this.props.clearDetails(ACTION.CLEAR_CATEGORY_DEATILS);
    };

    encodeSubCategoryData = (arrToEncode) => {
        return arrToEncode.length > 0 && arrToEncode.map((item) => {
            return encodeURIComponent(encodeURIComponent(item))
        });
    };

    handleLoadMoreClick = async (item, type) => {
        let paginationListClone = { ...this.state.paginationList };
        const helpVideos = get(this.state.paginationList, 'helpVideos');
        const subCategoriesList = get(this.state.paginationList, 'subCategories');
        let isViewMore = item?.totalCount > item.rail.length;
        if (type === 'subCategories') {
            paginationListClone.subCategories = subCategoriesList.map(row => {
                if (row.title === item.title) {
                    return {
                        ...row,
                        offset: isViewMore ? row.limit + row.offset : 0,
                    }
                } else {
                    return row
                }
            });
        } else {
            paginationListClone.helpVideos = {
                ...helpVideos,
                offset: isViewMore ? helpVideos.limit + helpVideos.offset : 0,
            };
        }
        this.setState({
            paginationList: paginationListClone,
        }, async () => {
            const itemToLoadMoreData =
                type === 'subCategories'
                    ? get(this.state.paginationList, 'subCategories').find(data => data.title === item.title)
                    : get(this.state.paginationList, 'helpVideos')
            const payload = {
                apiBaseUrl: item.seeAllUrl,
                limit: itemToLoadMoreData.limit,
                offset: itemToLoadMoreData.offset,
                type,
                title: item.title,
                isViewMore,
            };
            await this.props.getHCViewMoredata(payload, ACTION.HC_VIEW_MORE_DATA)
        })
    }

    getCategoryName = () => {
        const urlString = this.props.history?.location?.search,
        categoryName = (urlString.split('?')?.[1]).split('=')?.[1]; 
        return decodeURI(categoryName);
    }

    render() {
        const { categoryDetails, subCategoriesList } = this.props,
         faqList = get(categoryDetails, 'faqs'),
         helpVideoList = get(categoryDetails, 'helpVideos');
        return (
            <React.Fragment>
                <div className="help-center-container category-page">
                    <SubHeader
                        title={this.getCategoryName()}
                    />

                    {faqList && faqList?.rail.length > 0 && <div className='category-faq-warpper'>
                        <Accordion
                            showHelpfulTracker={true}
                            title={faqList?.title}
                            accordionList={faqList?.rail || []}
                            screenName={HC_SCREEN_NAME.CATEGORY_DETAIL_SCREEN}
                        />
                    </div>}

                    {subCategoriesList?.length > 0 && <div>
                        {(subCategoriesList || []).map((item, index) => {
                            return (
                                <Accordion key={index}
                                    wrapperClassName='subCategory-faq-wrapper'
                                    showHelpfulTracker
                                    title={item.title}
                                    accordionList={item?.rail || []}
                                    totalItemsCount={item?.totalCount}
                                    totalDataFetched={item.rail.length}
                                    showViewAllSection={item?.totalCount > item.rail.length}
                                    hideCardBorder
                                    screenName={HC_SCREEN_NAME.CATEGORY_DETAIL_SCREEN}
                                    handleClick={() => this.handleLoadMoreClick(item, 'subCategories')}
                                    id ={index}
                                />
                            )
                        },
                        )}
                    </div>}

                    {helpVideoList?.rail.length > 0 && <div>
                        <HelpVideoCard
                            title={helpVideoList?.title}
                            helpVideoList={helpVideoList?.rail || []}
                            seeAllUrl={helpVideoList?.seeAllUrl}
                            showViewAllSection={helpVideoList?.totalCount > helpVideoList?.rail?.length}
                            viewAllBtnText='Load More'
                            handleClick={() => this.handleLoadMoreClick(helpVideoList, 'helpVideos')}
                            screenName={HC_SCREEN_NAME.CATEGORY_DETAIL_SCREEN}
                        />
                    </div>}
                    {categoryDetails && 
                    <div className="category-helpful-tracker">
                        <HelpfulTracker isSubTypePlacement={false} />
                    </div>}
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    header: get(state.commonContent, 'header'),
    footer: get(state.commonContent, 'footer'),
    categoryDetails: get(state.helpCenterReducer, 'categoryDetails.data'),
    subCategoriesList : get(state.helpCenterReducer, 'categoryDetails.data.subCategories')
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            showMainLoader,
            hideMainLoader,
            hideHeader,
            hideFooter,
            getCategoryDetail,
            getHCViewMoredata,
            clearDetails,
        }, dispatch),
    }
}

Category.propTypes = {
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    location: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    header: PropTypes.bool,
    footer: PropTypes.bool,
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
    getCategoryDetail: PropTypes.func,
    getHCViewMoredata: PropTypes.func,
    categoryDetails: PropTypes.object,
    clearDetails: PropTypes.func,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Category);

