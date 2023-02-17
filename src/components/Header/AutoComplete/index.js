import React from "react";
import AutoCompleteItem from "./AutoCompleteItem/index";
import PropTypes from "prop-types";
import { isMobile } from "@utils/common";

const AutoComplete = ({resData, passingVal, searchText}) => {
  return (
    <div search="true" className={`Autocomplete ${!isMobile.any() ? 'web-large' : 'web-small'}`}>
        {
          resData?.length && resData.map((item,index) => {
            return <AutoCompleteItem
                      key={index}
                      passingVal={(val) => passingVal(val)}
                      item={item}
                      searchText={searchText}
                    />;
          })
        }
    </div>
  );
};

export default AutoComplete;

AutoComplete.propTypes = {
  resData: PropTypes.arrayOf(Object),
  passingVal: PropTypes.func,
  searchText: PropTypes.string,
}