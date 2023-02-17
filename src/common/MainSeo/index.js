import React, { useEffect } from "react";
import { Helmet } from "react-helmet";

function MainSeo({ metaTitle, metaDescription, metaName, metaContent }) {

  return (
    <Helmet>
      <meta charSet="utf-8" name={metaName} content={metaContent} />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  )
}

export default React.memo(MainSeo);