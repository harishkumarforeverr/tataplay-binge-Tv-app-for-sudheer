import React from 'react'
import { cloudinaryCarousalUrl } from "@utils/common";
import placeHolderImage from "@assets/images/app-icon-place.svg";

 function PartnerCard({partnerData}) {
         return (
          <React.Fragment>
            {partnerData &&
                partnerData?.map(
                (data, key) =>
                  data?.included && (
                    <React.Fragment key={key}>
                      <div
                        className={`img-container ${
                          data.starterPackHighlightApp ? "premium-content" : ""
                        }`}
                      >
                      <img
                        src={`${cloudinaryCarousalUrl("", "", 120, 120)}${data.iconUrl}`}
                        alt=""
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeHolderImage;
                            e.target.className = "broken-image";
                        }}
                    />
                      </div>
                    </React.Fragment>
                   )
              )}
          </React.Fragment>
        );
    };
 
export default React.memo(PartnerCard)