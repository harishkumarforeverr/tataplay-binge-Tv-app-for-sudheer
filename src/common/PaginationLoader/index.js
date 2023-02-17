import React, {useEffect, useRef, useState} from 'react';
import loaderImage from "@assets/images/loader.gif";
import {useDispatch, useSelector} from 'react-redux';
import {togglePaginationLoaderVisbility} from '@src/action';

function PaginationLoader() {
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState(true);
    const isLoading = useSelector(state => state.commonContent.isLoading);
    const isMounted = useRef(true);

    useEffect(() => {
       dispatch(togglePaginationLoaderVisbility(true))

        return () => {
            dispatch(togglePaginationLoaderVisbility(false))
        }
    }, [])
    // useEffect(()=>{
    //     isMounted.current = true;
    //     const timer = setTimeout(()=>{
    //         console.log("paginationLoader-isMounted ", isMounted.current, mountNumber)
    //         if(isMounted.current){
    //             setIsVisible(true);
    //         }
    //     },[500]);
    //     return () => {
    //         console.log("paginationLoader-unmounted", mountNumber)
    //         clearTimeout(timer);
    //         isMounted.current = false
    //     }
    // }, [])

    useEffect(()=>{
        if(isLoading){
            setIsVisible(true);
        }else{
            setIsVisible(false);
        }
    },[isLoading])


    if(!isVisible){
        return null;
    }
    return (
        <img className={'scroll-loader'} src={loaderImage} alt="img"/>
    )
}

export default React.memo(PaginationLoader)