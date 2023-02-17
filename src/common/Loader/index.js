import React from 'react';
import PropTypes from "prop-types";
import loaderImage from "@assets/images/loader.gif";
import './style.scss';
import { useSelector } from 'react-redux';

const Loader = (props) => {
    let {showContainer = true, alwaysVisible = true} = props;
    const isLoading = useSelector(state => state.commonContent.isLoading);
    const isPaginationLoaderVisible=useSelector((state)=>{
        return state.commonContent.isPaginationLoaderVisible;
    })
    const fromLogin = useSelector(state => state.commonContent.fromLogin);
     if((!isLoading || isPaginationLoaderVisible ) && (!alwaysVisible && !fromLogin)){
        return null;
    }
    return (
        <div className={`${showContainer && `loader-container`}`}>
            <img className={'scroll-loader'} src={loaderImage} alt="img" />
        </div>

    )
};

Loader.propTypes = {
    showContainer: PropTypes.bool,
    alwaysVisible: PropTypes.bool,
};
export default React.memo(Loader);
