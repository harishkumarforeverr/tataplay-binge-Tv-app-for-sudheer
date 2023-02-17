import React, { memo } from 'react';


const RecentSearch=(props)=>{
    const {list,recentSearchHandler,clickOnCrossIcon}=props;
    return(
        <React.Fragment>
        <div className="search-result-header">
            <h3 className="list-heading">Recent Search</h3>
        </div>
        <div className="explore-similar-list">
            <ul>
                {list.map((item) => (
                    <li
                        key={item}
                        onClick={() => recentSearchHandler(item)}
                    >
                        <span>{item}</span>
                        <span onClick={(e) => clickOnCrossIcon(e, item)} className="marginLeft10"><i className={'icon-close'}/></span>
                    </li>
                ))}
            </ul>
        </div>
    </React.Fragment>
    )
}

export default memo(RecentSearch);