import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {COMMON_ERROR} from "@constants";
import ListingItem from "@common/ListingItem";
import {getPackInfo, isUserloggedIn} from "@utils/common";
import isEmpty from 'lodash/isEmpty';
import {CURRENT_SUBSCRIPTION} from "@containers/MySubscription/constant";

class AppListing extends Component {

    constructor(props) {
        super(props);
        this.state = {
            subscribedList: [],
            unsubscribedList: [],
            callComplete: false,
        }
    }

    componentDidMount = async () => {
        await this.loadData();
    }

    componentDidUpdate = async (prevProps, prevState, snapshot) => {
        if (this.props.renderPage !== prevProps.renderPage) {
            await this.loadData();
        }
    }

    loadData = async () => {
        const {detail, getCurrentSubscriptionInfo, currentSubscription} = this.props;
        let nonSubscribedPartners = [], subscribedList = [], unsubscribedList = [];

        if (isUserloggedIn() && isEmpty(currentSubscription)) {
            await getCurrentSubscriptionInfo();
        }

        let {packExpired, nonSubscribedPartnerList} = getPackInfo();

        if (isUserloggedIn() && !isEmpty(nonSubscribedPartnerList)) {
            nonSubscribedPartnerList && nonSubscribedPartnerList.map(i => {
                nonSubscribedPartners.push(parseInt(i.partnerId));
            });
        }

        isUserloggedIn() && detail?.contentList?.length > 0 && detail.contentList.map((item) => {
            nonSubscribedPartners && nonSubscribedPartners.includes(item.partnerId) ? unsubscribedList.push(item) : subscribedList.push(item);
        });

        if (!isUserloggedIn()) {
            unsubscribedList = detail.contentList;
        }

        this.setState({subscribedList, unsubscribedList, callComplete: true});
    }

    render() {
        const {detail} = this.props;
        const {subscribedList, unsubscribedList, callComplete} = this.state;

        return (
            <Fragment>
                {detail &&
                <div className="seeall-content">
                    <h3>{detail.title}</h3>
                    {
                        subscribedList && callComplete &&
                        <React.Fragment>
                            <div className={`app-view ${isEmpty(subscribedList) && `no-subscribers`}`}>
                                <h4>Subscribed</h4>
                                <p className="divider"/>
                                {
                                    isEmpty(subscribedList) ?
                                        <div>
                                            {CURRENT_SUBSCRIPTION.NO_SUBSCRIPTION}
                                        </div> :
                                        <ul className={`seeall listing-${
                                            detail.layoutType && detail.layoutType.toLowerCase()
                                        } `}>
                                            <React.Fragment>
                                                {subscribedList.length > 0 ? subscribedList.map((item) => {
                                                        return <ListingItem pageType="seeAll" item={item} key={item.id}
                                                                            view={detail.layoutType}
                                                                            title={detail.title} subscribed={true}/>
                                                    }) :
                                                    <p>{COMMON_ERROR.SOME_ERROR}</p>}
                                            </React.Fragment>
                                        </ul>
                                }
                            </div>
                        </React.Fragment>
                    }
                    {
                        unsubscribedList && !isEmpty(unsubscribedList) &&
                        <React.Fragment>
                            <div className="app-view">
                                <h4>Not Subscribed</h4>
                                <p className="divider"/>
                                <ul className={`seeall listing-${
                                    detail.layoutType && detail.layoutType.toLowerCase()
                                } `}>
                                    {
                                        unsubscribedList && !isEmpty(unsubscribedList) &&
                                        <React.Fragment>
                                            {unsubscribedList.length > 0 ? unsubscribedList.map((item) => {
                                                return <ListingItem pageType="seeAll" item={item} key={item.id}
                                                                    view={detail.layoutType} title={detail.title}/>
                                            }) : <p>{COMMON_ERROR.SOME_ERROR}</p>}
                                        </React.Fragment>
                                    }
                                </ul>
                            </div>
                        </React.Fragment>
                    }
                </div>
                }
            </Fragment>
        )
    }
}

AppListing.propTypes = {
    detail: PropTypes.object,
    getCurrentSubscriptionInfo: PropTypes.func,
    currentSubscription: PropTypes.object,
    renderPage: PropTypes.bool,
};

export default AppListing;