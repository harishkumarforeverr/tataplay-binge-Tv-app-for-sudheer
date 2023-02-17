import { LAYOUT_TYPE, SECTION_SOURCE } from "@constants/index";

export const COMMON_VALUE = {
    LARGE: {
        DEFAULT_SLIDE_SCROLL: 3,

        LANDSCAPE_ITEM_WIDTH: 200,
        PORTRAIT_ITEM_WIDTH: 200,
        CIRCULAR_ITEM_WIDTH: 90,
        TOP_PORTRAIT_ITEM_WIDTH: 310,
        GENRE_LANDSCAPE_ITEM_WIDTH: 90,
        LANDSCAPE_LANDSCAPE_ITEM_WIDTH: 90,

        LANDSCAPE_ITEM_BLOCK_WIDTH: 220, //width = width of slide item + margin | 200+20
        PORTRAIT_ITEM_BLOCK_WIDTH: 220, //200+20
        CIRCULAR_ITEM_BLOCK_WIDTH: 115, // 90+ 20
        TOP_PORTRAIT_ITEM_BLOCK_WIDTH: 330, // 310+20
        GENRE_LANDSCAPE_ITEM_BLOCK_WIDTH: 115,
        LANDSCAPE_LANDSCAPE_ITEM_BLOCK_WIDTH: 115,
        GENRE_ITEM_WIDTH: 10,
        LANGUAGE_ITEM_WIDTH: 22,
        LIVE_ITEM_BLOCK_WIDTH: 70, // 50+20
        LIVE_ITEM_WIDTH: 50,
    },
    SMALL: {
        DEFAULT_SLIDE_SCROLL: 3,

        LANDSCAPE_ITEM_WIDTH: 140,
        PORTRAIT_ITEM_WIDTH: 93,
        CIRCULAR_ITEM_WIDTH: 64,
        TOP_PORTRAIT_ITEM_WIDTH: 153,
        GENRE_LANDSCAPE_ITEM_WIDTH: 70,
        LANDSCAPE_LANDSCAPE_ITEM_WIDTH: 70,

        LANDSCAPE_ITEM_BLOCK_WIDTH: 147, // width = width of slide item + margin | 140+7
        PORTRAIT_ITEM_BLOCK_WIDTH: 100, // 93+7
        CIRCULAR_ITEM_BLOCK_WIDTH: 71, //64+7
        TOP_PORTRAIT_ITEM_BLOCK_WIDTH: 160, //153+7
        GENRE_LANDSCAPE_ITEM_BLOCK_WIDTH: 77, // 70+7
        LANDSCAPE_LANDSCAPE_ITEM_BLOCK_WIDTH: 77, //70+7
        GENRE_ITEM_WIDTH: 0,
        LANGUAGE_ITEM_WIDTH: 0,
        LIVE_ITEM_BLOCK_WIDTH: 52,
        LIVE_ITEM_WIDTH: 46,
    },
};

/**
 * @function getVariableWidth - to get width of single item of slider with or without margin
 * @param layoutType
 * @param sectionSource
 * @param completeWidth - boolean | decides width with margin or not
 * @returns {number}
 * @param isMobile
 */
export const getVariableWidth = (layoutType, sectionSource, completeWidth = false, isMobile = false, isSearch = false) => {
    //lines are commented due to performance issuees in mozilla but refer the commented line constants and update them if changing values
    let width;
    const TYPE = isMobile ? 'SMALL' : 'LARGE';
    if(sectionSource === SECTION_SOURCE.BINGE_CHANNEL){
        width = completeWidth ? COMMON_VALUE[TYPE].LIVE_ITEM_BLOCK_WIDTH : COMMON_VALUE[TYPE].LIVE_ITEM_WIDTH;
    }
    else if (layoutType === LAYOUT_TYPE.CIRCULAR) {
        if (sectionSource === SECTION_SOURCE.GENRE || sectionSource === 'RAIL') {
            width = completeWidth ? COMMON_VALUE[TYPE].GENRE_LANDSCAPE_ITEM_BLOCK_WIDTH : COMMON_VALUE[TYPE].GENRE_LANDSCAPE_ITEM_WIDTH;
        }
        else if (sectionSource === SECTION_SOURCE.LANGUAGE || sectionSource === 'RAIL') {
            width = completeWidth ? COMMON_VALUE[TYPE].LANDSCAPE_LANDSCAPE_ITEM_BLOCK_WIDTH : COMMON_VALUE[TYPE].LANDSCAPE_LANDSCAPE_ITEM_WIDTH;
        }
        else {
            width = completeWidth ? COMMON_VALUE[TYPE].CIRCULAR_ITEM_BLOCK_WIDTH : COMMON_VALUE[TYPE].CIRCULAR_ITEM_WIDTH;
        }
    }
    else if (layoutType === LAYOUT_TYPE.LANDSCAPE) {
        const landscapeLangWidth = isSearch ? COMMON_VALUE[TYPE].LANGUAGE_ITEM_WIDTH : 0;
        const landscapeGenreWidth = isSearch ? COMMON_VALUE[TYPE].GENRE_ITEM_WIDTH : 0;
        if (sectionSource === SECTION_SOURCE.GENRE || sectionSource === 'RAIL') {
            width = completeWidth ? COMMON_VALUE[TYPE].GENRE_LANDSCAPE_ITEM_BLOCK_WIDTH + landscapeGenreWidth: COMMON_VALUE[TYPE].GENRE_LANDSCAPE_ITEM_WIDTH;
        }
        else if (sectionSource === SECTION_SOURCE.LANGUAGE || sectionSource === 'RAIL') {
            width = completeWidth ? COMMON_VALUE[TYPE].LANDSCAPE_LANDSCAPE_ITEM_BLOCK_WIDTH + landscapeLangWidth : COMMON_VALUE[TYPE].LANDSCAPE_LANDSCAPE_ITEM_WIDTH;
           
        }
        else {
            width = completeWidth ? COMMON_VALUE[TYPE].LANDSCAPE_ITEM_BLOCK_WIDTH : COMMON_VALUE[TYPE].LANDSCAPE_ITEM_WIDTH;
        }
    }
    else if (layoutType === LAYOUT_TYPE.PORTRAIT) {
        width = completeWidth ? COMMON_VALUE[TYPE].PORTRAIT_ITEM_BLOCK_WIDTH : COMMON_VALUE[TYPE].PORTRAIT_ITEM_WIDTH;
    }
    else if (layoutType === LAYOUT_TYPE.TOP_PORTRAIT) {
        width = completeWidth ? COMMON_VALUE[TYPE].TOP_PORTRAIT_ITEM_BLOCK_WIDTH : COMMON_VALUE[TYPE].TOP_PORTRAIT_ITEM_WIDTH;
    }
    return width;
};


/**
 * @function afterChangeHandler - executed after clicking on slider arrow - set value of slidesToScrollVal
 * @param currentSlide - (number) index of item visible currently at first position
 * @param e - event
 * @param totalItems - (number) total items in list
 * @param id - id received from BE of item visible currently at first position
 * @param layoutType
 * @param sectionSource
 * @param currentState
 * @param isMobile
 */
export const afterChangeHandler = (currentSlide, e, totalItems, id, layoutType, sectionSource, currentState, isMobile, isSearch = false) => {
    currentState.setState({ dragging: false });
    let showItemCount = slidesToShow(layoutType, sectionSource, isMobile, isSearch);
    let remainingItems = totalItems - (currentSlide + (showItemCount));
    let defaultSlidesToScroll = document.getElementById('app').clientWidth > 520 ? 3 : 1;
    let slidesToScrollVal = (remainingItems > showItemCount) ? defaultSlidesToScroll : remainingItems;
    if (slidesToScrollVal < 0) {
        currentState.setState({
            [`slidesToScroll_${id}`]: showItemCount,
        })
    } else if (slidesToScrollVal !== 0) {
        currentState.setState({
            [`slidesToScroll_${id}`]: slidesToScrollVal,
        })
    }
    let freshObj = { id, currentSlide, slidesToScrollVal, totalItems, showItemCount, layoutType, sectionSource };
    let findId = currentState.state.visitedSliderID && currentState.state.visitedSliderID.find(obj => obj.id === id);
    if (currentState?.state?.visitedSliderID?.length === 0 || findId === undefined) {
        currentState.setState(prevState => ({
            visitedSliderID: [...prevState.visitedSliderID, freshObj],
        }))
    }
    else {
        currentState.setState(prevState => ({
            visitedSliderID: prevState.visitedSliderID && prevState.visitedSliderID.map(
                obj => (
                    obj.id === id ?
                        Object.assign(obj, { id, currentSlide, slidesToScrollVal, totalItems, showItemCount, layoutType, sectionSource }) :
                        obj
                ),
            ),
        }));
    }

};

/**
 * @function beforeChangeHandler
 */
export const beforeChangeHandler = (currentState) => {
    currentState.setState({ dragging: true })
};

/**
 * @function - to get the value of slidesToScroll when its value is not in state
 * @param layoutType
 * @param noItems - total number of items in list
 * @param sectionSource
 * @returns {number} - number of slidesToScrollVal
 * @param isMobile
 */
export const getDefaultValue = (layoutType, noItems, sectionSource, isMobile, isSearch = false) => {
    if (noItems <= 7) return 1;
    let showItemCount = slidesToShow(layoutType, sectionSource, isMobile, isSearch);
    let remainingItems = noItems - (showItemCount);
    let defaultSlidesToScroll = document.getElementById('app').clientWidth > 520 ? 3 : 2;
    let slidesToScrollVal = remainingItems > showItemCount ? defaultSlidesToScroll : remainingItems;
    return slidesToScrollVal ? slidesToScrollVal : defaultSlidesToScroll;
};


/**
 * @function slidesToShow - to get the number of slides to be shown at once acc to screen size
 * @param layoutType - value received from BE for view
 * @param sectionSource - value received from BE for sectionSource
 * @returns {number} - number of slides
 * @param isMobile
 */
export const slidesToShow = (layoutType, sectionSource, isMobile, isSearch = false) => {
    let slidesNumber;
    // railContainerWidth is app width minus the left padding given in css i.e 90px
    let railContainerWidth = (document.getElementById('app').clientWidth - document.getElementById('app').style.paddingLeft);
    // slidesNumber is railContainerWidth divide by one rail item complete width
    slidesNumber = railContainerWidth / getVariableWidth(layoutType, sectionSource, true, isMobile, isSearch);
    //added this condition to fix-TSF-4652 which is due to genre has less slides than lang but width is equal to lang rail, also this is for search page only.
    if (sectionSource === SECTION_SOURCE.GENRE && isSearch) slidesNumber = slidesNumber - 1;

    return Math.floor(slidesNumber);
};




