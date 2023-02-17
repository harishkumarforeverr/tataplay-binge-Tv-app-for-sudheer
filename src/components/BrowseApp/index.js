import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';

import './style.scss';
import {
    getProviderLogo,
    LOCALSTORAGE,
    providerImage
} from "@utils/common";
import { LAYOUT_TYPE } from "@constants";
import { cloudinaryCarousalUrl } from "@utils/common";
import { getVariableWidth } from '@common/Listing/constants';
import imagePlaceholderPortrait from "@assets/images/image-placeholder-portrait.png"
import imagePlaceholderLandscape from "@assets/images/image-placeholder-landscape.png"
import imagePlaceholderAppRail from "@assets/images/app-icon-place.svg";
import { getKey } from "@utils/storage";

class BrowseApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredData: {
                hovered: false,
                id: null,
            },
            onErrorData: {
                error: false,
                id: null,
            },
        }
    }

    onMouseEvent = (e, hovered, id) => {
        if (this.props.dragging) {
            return false;
        }
        let { onErrorData } = this.state;
        let data = {
            hovered: hovered,
            id: id,
        };
        let errorID = onErrorData.id;
        if (this.state.hoveredData.hovered !== hovered) {
            if (errorID === null || (id === errorID && !onErrorData.error)) {
                this.setState({
                    hoveredData: data,
                });
            }
        }
    }

    getImage = (view) => {
        if (view === LAYOUT_TYPE.LANDSCAPE) {
            return imagePlaceholderLandscape
        } else if ([LAYOUT_TYPE.PORTRAIT, LAYOUT_TYPE.TOP_PORTRAIT].includes(view)) {
            return imagePlaceholderPortrait
        } else if (view === LAYOUT_TYPE.CIRCULAR) {
            return imagePlaceholderAppRail
        } else {
            return imagePlaceholderLandscape
        }
    };


    getContentImageUrl = (view, item) => {
        if (view === LAYOUT_TYPE.CIRCULAR) {
            return providerImage(item.provider, view);
        } else {
            return item.image;
        }
    }

    render() {
        const { browseAppList, railItem, onClickHandler } = this.props;
        const railItemView = LAYOUT_TYPE.CIRCULAR
        const width = getVariableWidth(railItemView, railItem.sectionSource)
        let settings = {
            dots: true,
            speed: 1000,
            variableWidth: true,
            centerMode: true,
            focusOnSelect: true,
            className: "center",
            appendDots: dots => <ul><div className='slick-divider'>{dots}</div></ul>,
            customPaging: () => (
                <div className="slick-dot-container"/>
            ),
        };
        let data = {
            sectionSource: railItem.sectionSource,
            sectionType: railItem.sectionType,
            contentPosition: railItem.contentPosition,
            title: railItem.title,
            railPosition: railItem.railPosition,
            isPartnerPage: railItem.isPartnerPage,
        };

        return (
            <React.Fragment>
                <div className={'provider-title'}>
                    <h3>{railItem.title}</h3>
                </div>
                <div className='browse-listing-container'>
                    <ul className='listing-horizontal'>
                        <Slider {...settings}>
                            {railItem.contentList.map((item, index) => {
                                let contentImageUrl = this.getContentImageUrl(item.layoutType ? item.layoutType : railItemView, item);
                                let placeHolderImage = this.getImage(railItemView);

                                return (
                                    <span key={index} className='listing-block'>
                                        <li
                                            className='listing-item browse-rails-container'
                                            key={index}
                                            style={{ width: width }}
                                            onClick={(e) => onClickHandler && onClickHandler(e, item, data)}
                                            onMouseEnter={(e) => navigator.onLine && this.onMouseEvent(e, true, item.id)}
                                            onMouseLeave={(e) => navigator.onLine && this.onMouseEvent(e, false, item.id)}
                                        >
                                            <div
                                                key={item.id}
                                            >
                                                {/* <img
                                                    src={placeHolderImage}
                                                    alt={'place-holder-image'}
                                                /> */}
                                                <img
                                                    src={`${cloudinaryCarousalUrl(this.state.hoveredData.hovered, railItemView)}${contentImageUrl}`}
                                                    alt='rail-image'
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        //e.target.src = placeHolderImage;
                                                        //e.target.className = 'broken-image'
                                                        this.setErrorData(true, item.id);
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    </span>
                                )
                            })
                            }
                        </Slider>
                    </ul>
                </div>
                <div className='browse-main-container'>
                    <div>
                        <ul className='browse-sub-container'>
                            {browseAppList.map((item, index) => {
                                let contentImageUrl = this.getContentImageUrl(item.layoutType, item);
                                let placeHolderImage = this.getImage(item.layoutType);
                                return (
                                    <li
                                        key={index}
                                        className={`${item.layoutType === LAYOUT_TYPE.PORTRAIT ? 'portrait-block' : 'landscape-block'}`}
                                    >
                                        <div>
                                            <img
                                                src={placeHolderImage}
                                                alt={'place-holder-image'}
                                                className='place-holder-image'
                                            />
                                            <img
                                                src={`${cloudinaryCarousalUrl(this.state.hoveredData.hovered, item.layoutType)}${contentImageUrl}`}
                                                alt=''
                                                className='listing-item-image'
                                            />
                                        </div>
                                        {item.layoutType === LAYOUT_TYPE.LANDSCAPE ? <span>Movie or TV Series gif
                                            <br /> title in two lines</span>
                                            :
                                            <span className='content-info'> <img
                                                alt='freemium-image'
                                                src={`../../assets/images/crown-icon.svg`}
                                            /></span>
                                        }
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    {!!browseAppList.contentList?.length &&
                        <div className='browse-all-link' >
                            <span className='browse-all-image'>See all</span>
                        </div>
                    }
                </div>

            </React.Fragment>
        )
    }
}

BrowseApp.propTypes = {
    railItem: PropTypes.Object,
    browseAppList: PropTypes.array,
    onClickHandler: PropTypes.func,
    dragging: PropTypes.bool,
};

export default BrowseApp;