import ListingItem from '@common/ListingItem'
import { SECTION_SOURCE } from '@utils/constants'
import React from 'react'

function SearchResultItem({item, layoutType, title, handleClick, index, scrollPosition }) {
  return (
    <ListingItem
        item={item}
        view={layoutType}
        sectionSource={SECTION_SOURCE.SEARCH}
        title={title}
        pageType={"search"}
        contentPosition={index + 1}
        isToolTipRequired={true}
        onClickHandler={handleClick}
        scrollPosition={scrollPosition}
        classNameSetHover="set-hover-search"
    />
  )
}

export default React.memo(SearchResultItem)