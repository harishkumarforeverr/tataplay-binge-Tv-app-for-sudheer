import { loginInFreemium } from "@utils/common";
import { MINI_SUBSCRIPTION } from "@utils/constants";
import { closePopup, openPopup } from "@common/Modal/action";
import { openLoginPopup } from "@containers/Login/APIs/actions";
import React from "react";

const useLoginFreemium = () => {
    return ({source, componentName } = {source: "", componentName: ""}) => {
        loginInFreemium({
            openPopup,
            closePopup, 
            openLoginPopup,
            source: source,
            getSource: source,
            ComponentName: componentName || MINI_SUBSCRIPTION.LOGIN,
        });
    }
}

export default useLoginFreemium;