import React, {Component} from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {getFAQ} from "@components/Header/APIs/actions";
import {hideMainLoader, showMainLoader} from "@src/action";

import './style.scss';
import mixPanelConfig from "@utils/mixpanel";
import MIXPANEL from "@constants/mixpanel";
import MOENGAGE from "@constants/moengage";
import moengageConfig from "@utils/moengage";

class FAQ extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeElement: '',
        }

    }

    componentDidMount() {
        this.props.showMainLoader();
        this.props.getFAQ();
        setTimeout(() => this.props.hideMainLoader(), 500);
        this.trackEvents();
    }

    trackEvents = () => {
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.FAQ_VIEW)
        moengageConfig.trackEvent(MOENGAGE.EVENT.FAQ_VIEW)
    }

    panelClick = (newActiveState) => {
        let currentActiveState = this.state.activeElement;
        let state;
        if (currentActiveState !== newActiveState) {
            state = newActiveState;
        } else {
            state = '';
        }
        this.setState({
            activeElement: state,
        }, () => {
            let length = this.props.faqData.length;
            if(newActiveState === length - 1) {
                let el = document.getElementsByClassName('accordion');
                let elementHeight = document.querySelector('#panel_'+newActiveState+' .acc-body').offsetHeight;
                el[0].scrollBy(0, elementHeight);
            }
        });
    }

    render() {
        let {activeElement} = this.state;
        return (
            this.props.faqData ?
                <div className="faq-container">
                    <div className='heading'>
                        FAQs
                    </div>

                    <div className='accordion'>
                        {
                            this.props.faqData.map((item, index) => {
                                return (
                                    <div id={`panel_${index}`} className={`panel ${activeElement === index ? 'panel-active' : ''}`}
                                         key={index} onClick={() => this.panelClick(index)}>
                                        <div className="acc-header">
                                            <span>{item.question}</span>
                                            <span><i className='icon-down'/></span>
                                        </div>
                                        <div className="acc-body">{item.answer}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div> : <div/>
        )
    }
}


FAQ.propTypes = {
    getFAQ: PropTypes.func,
    faqData: PropTypes.array,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
};


function mapStateToProps(state) {
    return {
        faqData: get(state.headerDetails, 'faq.data'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            getFAQ,
            showMainLoader,
            hideMainLoader,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(FAQ))
