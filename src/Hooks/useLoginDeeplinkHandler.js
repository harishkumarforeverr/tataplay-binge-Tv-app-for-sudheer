import { getSearchParam, isUserloggedIn, safeNavigation } from "@utils/common";
import { PRIVATE_DEEPLINKS, SEARCH_PARAM, SEARCH_PARAM_ACTION_VALUE, SOURCE } from "@utils/constants";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import useLoginFreemium from "./useLoginFreemium";

const useLoginDeeplinkHandler = () => {
    const history = useHistory()
    const showLogin = useLocation().state?.showLogin;
    const pathname = useLocation().pathname;
    const search = useLocation().search;
    const openLoginPopup = useLoginFreemium();

    /** show login poup if action is login and use not loggedIn */
    useEffect(() => {
        const actionSearchParamValue = getSearchParam(SEARCH_PARAM.ACTION)
        if (PRIVATE_DEEPLINKS.includes(actionSearchParamValue) && !isUserloggedIn()) {
            safeNavigation(history,{pathname:'/',state:{showLogin: true}})
            openLoginPopup({ source: SOURCE.DEEPLINK });
        }
    }, [search, pathname])

    /** show login popup if showLogin state is set in location object */
    useEffect(() => {
        if (showLogin && !isUserloggedIn()) {
            openLoginPopup({ source: pathname })
        }
    }, [showLogin, pathname])

}

export default useLoginDeeplinkHandler;