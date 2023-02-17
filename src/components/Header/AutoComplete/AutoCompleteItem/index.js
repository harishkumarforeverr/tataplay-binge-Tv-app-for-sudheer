import React, { useMemo } from "react";
import "./style.scss";
import Highlighter from "react-highlight-words";
import Search from '@assets/images/search.png';
import LiveDot from '@assets/images/livedot.png';
import PropTypes from 'prop-types';
import { capitalizeFirstLetter } from "@utils/common";
import { SUGGESTOR } from "@components/Header/constants";

const AutoCompleteItem = ({ searchText, passingVal, item }) => useMemo( () => {
  const renderHighlighter = () => {
    return (
      <Highlighter
        searchWords={[searchText]}
        autoEscape={true}
        textToHighlight={capitalizeFirstLetter(item?.title)}
        highlightStyle={{ color: 'white', fontWeight: 'bold', background: 'transparent' }}
      />
    )
  }

  const renderValues = (item) => {
    switch (item?.suggestor) {
      case SUGGESTOR.KEYWORD_SUGGESTOR: 
        return <KeywordComponent title={capitalizeFirstLetter(item?.title)} />
      case SUGGESTOR.TITLE_SUGGESTOR:
        return <TitleComponent
          item={item}
          language={item?.language[0]}
          genre={item?.genre[0]}
          releaseYear={item?.releaseYear}
          contentType={item?.contentType}
          isLive={item?.liveContent}
        />
      case SUGGESTOR.PROVIDER_SUGGESTOR:
        return <ProviderComponent item={item} subText={item?.subText} suggestor={item.suggestor} />
      case SUGGESTOR.GENRE_SUGGESTOR:
        return <ProviderComponent item={item} subText={item?.subText} suggestor={item.suggestor} />
      case SUGGESTOR.LANGUAGE_SUGGESTOR:
        return <ProviderComponent item={item} subText={item?.subText} suggestor={item.suggestor} />
    }
  }

  const KeywordComponent = ({ title }) => (
    <span className="Keyword__wrapper">
      <img src={Search} alt="search" className="Keyword__wrapper-img" />
      <p className="AutoCompleteItem__title">{renderHighlighter() || title}</p>
    </span>
  );

  const liveVal = () =><span className="live-content"> Live |</span>
  const liveDot = () => <img src={LiveDot} className={'live-dot-image'} />

  const TitleComponent = ({ item, genre, title, language, contentType, releaseYear, isLive = true}) => (
    <div  className="AutoCompleteItem"><span className="AutoCompleteItem__img">
        <img src={item?.image} alt="" />
      </span>
      <div search="true" className="AutoCompleteItem__content">
        <span className="AutoCompleteItem__title auto_id">{renderHighlighter() || title} </span>
        <p className="AutoCompleteItem__title">{isLive && liveDot()} {isLive && liveVal()}  {`${genre} | ${contentType} | ${releaseYear} | ${language}`}</p>
      </div>
    </div>
  )

  const renderImage = (suggestor, backgroundImage, image) => {
    if (suggestor === SUGGESTOR.LANGUAGE_SUGGESTOR || suggestor === SUGGESTOR.GENRE_SUGGESTOR) {
      return (
        <span className="AutoCompleteItem__img autocomplete-background-image"
          style={{ 
            background: `url(${backgroundImage})`,
            }}
        >
          <img src={image} className={'top-image'} alt="" />
        </span>
      )
    } else if (suggestor === SUGGESTOR.PROVIDER_SUGGESTOR) {
      return (<span className="AutoCompleteItem__img">
        <img src={image} alt="" />
      </span>)
    }
  }

  const ProviderComponent = ({item, subText, suggestor}) => (
    <div  className="AutoCompleteItem">
      {renderImage(suggestor, item?.backgroundImage, item.image)}
      <div search="true" className="AutoCompleteItem__content">
        <span className="AutoCompleteItem__title">{renderHighlighter() || title} </span>
        <p className="AutoCompleteItem__title">{subText}</p>
      </div>
    </div>
  )

  return (
    <div search="true"
      className="autocomplete-item-wrapper"
      onClick={
        () => passingVal({
          title: item?.title,
          suggestor: item?.suggestor,
          partnerId: item.partnerId,
          contentType: item?.contentType,
          id: item?.id,
          item: item,
    })}>
        {
          renderValues(item)
        }
    </div>
  );
}, [searchText]);

export default AutoCompleteItem;


AutoCompleteItem.propTypes = {
  item: PropTypes.any,
  passingVal: PropTypes.func,
  searchText: PropTypes.string,
}