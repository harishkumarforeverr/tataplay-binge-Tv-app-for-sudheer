import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { URL } from "@constants/routeConstants";
import RightArrow from '@assets/images/arrow-right.svg';
import { LOCALSTORAGE } from "@utils/constants";
import { setKey } from "@utils/storage";
import { getLayeredIcon, safeNavigation,getSearchParamsAsObject } from '@utils/common';

import { CATEGORY_LIST } from '../../APIs/constants';

import './style.scss';
import '../../style.scss';

class HelpCard extends Component {

    getCardIcon = (category) => {
        let matchedCategory = CATEGORY_LIST.find(item => item.name === category);
        if (!matchedCategory) {
          matchedCategory = CATEGORY_LIST[0];
        }       

        return matchedCategory&&matchedCategory?.isLayeredIcon ? getLayeredIcon(matchedCategory.leftIcon) : <span className={matchedCategory.leftIcon} />
    }

    handleCategoryClick = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        const { history } = this.props;
        //setKey(LOCALSTORAGE.HC_SELECTED_CATEGORY_DETAILS, JSON.stringify(item));
        safeNavigation(history, {
            pathname: `/${URL.HELP_CENTER}/${URL.HC_CATEGORY}`,
            search: `?${URL.HC_CATEGORY_NAME}=${item.category}`,
        })
    }

    render() {
        let { helpCardList } = this.props;
        return (
            <section className="more-way-tohelp1">
                <div className="container">
                    <div className="heading-md">
                        <h2 className="heading1">{helpCardList?.title}</h2>
                    </div>
                    <div className="body-container more-way-help1">
                        <ul>
                            {helpCardList?.data && helpCardList?.data.map((item, index) => {
                                return (
                                    <li className='helpcard-item-wrapper'
                                        key={index}
                                        onClick={(event) => this.handleCategoryClick(event, item)} >
                                        <a>
                                            <span className="text-contr">
                                                <span className="icon-contr">
                                                    {this.getCardIcon(item.category)}
                                                </span>
                                                <span>{item.category}</span>
                                            </span>
                                            <span className="arrow-contr">
                                                <img src={RightArrow} />
                                            </span>
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </section>
        )
    }
}

HelpCard.propTypes = {
    helpCardList: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
};

export default withRouter(HelpCard);