import React from 'react';
import useContentPlay from '@src/Hooks/useContentPlay';
import { get } from 'lodash';

const withContentPlay = (Component) =>
  React.memo(function ContentPlay(props) {
    let {
      episode,
      item,
      mixpanelData,
      sectionSource,
      sectionType,
      railPosition,
      pageType,
    } = props;
    let contentType;
    if (get(props, 'episode')) {
      contentType = episode?.contentType;
    } else {
      contentType = item?.contentType
    }

    let sectionData = mixpanelData || {
      sectionType,
      railPosition,
      pageType,
      sectionSource,
    };
    const onPlayContent  = useContentPlay({
      contentType,
      sectionData,
    });
    return <Component {...props} onPlayContent={onPlayContent} test="Test" />;
  });

export default withContentPlay;
