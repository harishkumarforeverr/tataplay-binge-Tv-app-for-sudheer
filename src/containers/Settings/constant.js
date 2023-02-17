import SettingSelectLanguage from "./SettingLanguage";
import React from "react";
import {accountRefresh, confirmLogoutPopup, getVerbiages} from "@utils/common";
import {URL} from "@constants/routeConstants";
import DeviceManagement from "../DeviceManagement";
import Profile from "../Profile";
import SwitchAccountSetting from "./SwitchAccountSetting";
import {CATEGORY_NAME, MENU_LIST} from "@constants";

const rightIcons = `icon-Path`;

export let SETTING_DROPDOWN_LIST = [
    {
        name: "profile",
        displayName: "Edit Profile",
        reDirectTo: `/${URL.SETTING}/${URL.PROFILE}`,
        leftIcon: `icon-profile-upd`,
        rightIcon: rightIcons,
        component: Profile,
    },
    {
        name: "contentLanguage",
        displayName: `${getVerbiages(CATEGORY_NAME.LANGUAGE_SETTING)?.header || "Content Language"}`,
        reDirectTo: `/${URL.SETTING}/${URL.LANGUAGE}`,
        leftIcon: `icon-content-language-upd`,
        rightIcon: rightIcons,
        component: SettingSelectLanguage,
    },
    {
        name: "deviceManagement",
        displayName: MENU_LIST.MANGE_DEVICES,
        reDirectTo: `/${URL.SETTING}/${URL.DEVICE_MANAGEMENT}`,
        leftIcon: `icon-device-manage-upd`,
        rightIcon: rightIcons,
        component: DeviceManagement,
    },
    /*{
          name: "parentalPin",
          displayName: "Parental Control",
          reDirectTo: `/${URL.PROFILE}`,
          leftIcon: `icon-parental-lock-upd`,
          rightIcon: rightIcons,
      },*/
    {
        name: 'switchAccount',
        displayName: "Switch Account",
        reDirectTo: `/${URL.SETTING}/${URL.SWITCH_ACCOUNT}`,
        leftIcon: `icon-switch-account-upd`,
        rightIcon: rightIcons,
        component: SwitchAccountSetting,
    },
    /*{
         name:'autoplayTrailers',
         displayName: "Autoplay Trailers",
         //reDirectTo: `/${URL.DEVICE_MANAGEMENT}`,
         leftIcon: `icon-autoplay-trailer-upd`,
         // rightIcon: rightIcons,
         toggleSwitch: true,
     },
     {
         name:'notificationSettings',
         displayName: "Notification Settings",
         //reDirectTo: `/${URL.DEVICE_MANAGEMENT}`,
         leftIcon: `icon-notification-settings-upd`,
         // rightIcon: rightIcons,
         toggleSwitch: true,
     },
     {
         name: "transactionHistory",
         displayName: "Transaction History",
         //reDirectTo: `/${URL.TRANSACTION_HISTORY}`,
         leftIcon: `${iconPath}transaction-history.png`,
           leftHoverIcon:`${iconPath}TransactionHistory.svg`,
         rightIcon: rightIcons,
     },*/
    {
        name: 'accountRefresh',
        displayName: "Account Refresh",
        leftIcon: `icon-Account-Refresh`,
        funcClick: accountRefresh,
    },
    {
        name: 'logout',
        displayName: "Logout",
        leftIcon: `icon-sign-out-upd`,
        funcClick: confirmLogoutPopup,
    },
];