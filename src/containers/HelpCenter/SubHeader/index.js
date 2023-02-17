import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';

import backArrow from "@assets/images/arrow-back.svg";
import { URL } from '@constants/routeConstants';
import { safeNavigation } from "@utils/common";

import { CATEGORY_LIST } from '../APIs/constants';

import './style.scss';``
import '../style.scss';


class SubHeader extends Component {

    getCardIcon = (category) => {
        let matchedCategory = CATEGORY_LIST.find(item => item.name === category);
        if (!matchedCategory) {
            matchedCategory = CATEGORY_LIST[0];
        }
        return matchedCategory.isLayeredIcon ? getLayeredIcon(matchedCategory.leftIcon) : <span className={matchedCategory.leftIcon} />
    }

    handleBackClick = (e) => {
        let { history, location:{pathname} } = this.props;
        //safeNavigation(history,{pathname: `/${URL.HELP_CENTER}`})
        //pathname.includes(`/${URL.HC_CATEGORY}`) ? safeNavigation(history,{pathname: `/${URL.HELP_CENTER}`}) : history && history.goBack();
        history && history.goBack();
    };

    render() {
        const { title } = this.props;
        return (
            <React.Fragment>
                <section className="page-header">
                    <div className="container">
                        <div className="category-header">
                            <div className="icon-contr" onClick={(e) => this.handleBackClick(e)}>
                                <a><img src={backArrow} alt={'back-arrow'}/></a>
                            </div>
                            <div className="img-contr">
                                <span>
                                    {this.getCardIcon(title)}
                                </span>
                            </div>
                            <div className="text-contr">{title}</div>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        )
    }
}

SubHeader.propTypes = {
    title: PropTypes.string,
    history: PropTypes.object,
    location: PropTypes.object,
};

export default withRouter(SubHeader);

