import {MODALS} from "@common/Modal/constants";
import isEmpty from "lodash/isEmpty";
import store from "@src/store";
import {safeNavigation} from "@utils/common";
import {URL} from "@routeConstants";
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";
import {closePopup, openPopup} from "@common/Modal/action";
import {hideMainLoader, showMainLoader} from "@src/action";

export const openLowBalancePopUp = (props, packListData) => {
    const {quickRecharge, history} = props;
    let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};

    store.dispatch (openPopup(MODALS.ALERT_MODAL, {
        modalClass: 'alert-modal inactive-alert',
        headingMessage: 'Low Balance',
        instructions: packListData?.message,
        primaryButtonText: 'Recharge',
        primaryButtonAction: async () => {
            store.dispatch(showMainLoader());
            await quickRecharge(packListData?.amount, userInfo.sId);
            const state = store.getState();
            let quickRechargeUrl = state?.packSelectionDetail?.quickRecharge;

            if (quickRechargeUrl?.code === 0 && !isEmpty(quickRechargeUrl?.data)) {
                window.location.assign(`${quickRechargeUrl?.data?.rechargeUrl}`);
            } else {
                store.dispatch(hideMainLoader());
            }
        },
        secondaryButtonText: 'Skip',
        secondaryButtonAction: () => {
            store.dispatch(closePopup());
            safeNavigation(history, URL.DEFAULT);
        },
        hideCloseIcon: true,
        errorIcon: 'icon-alert-upd',
    }));
}