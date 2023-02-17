import React, {Component, useEffect, useState} from 'react'
import {SETTING_DROPDOWN_LIST} from './constant'
import './style.scss';
import { safeNavigation} from "@utils/common";
import PropTypes from 'prop-types';
import {URL} from '@routeConstants';
import {useDispatch} from "react-redux";
import {LOCALSTORAGE, TAB_BREAKPOINT} from "@constants";
import {window} from "mixpanel-browser/src/utils";
import {redirectToHomeScreen} from "@containers/BingeLogin/bingeLoginCommon";
import {useLocation} from 'react-router';
import {subscriberListing} from "@containers/Login/APIs/actions";
import {getKey} from "@utils/storage";
import mixPanelConfig from '@utils/mixpanel';
import MIXPANEL from "@constants/mixpanel";
import dataLayerConfig from '@utils/dataLayer';
import DATALAYER from '@utils/constants/dataLayer';

const Setting = (props) => {
    const dispatch = useDispatch();
    const [toggle, setToggle] = useState({});
    const [settingList, setSettingList] = useState();
    const [renderComponentIndex, setRenderComponentIndex] = useState(undefined);
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });
    const location = useLocation();

    const handleClick = (name) => {
        setToggle((prevState) => {
            return {
                ...prevState,
                [name]: !prevState[name],
            };
        });
    };

    const getAccountDetails = async () => {
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        let response = await dispatch(subscriberListing(userInfo.rmn));
        let list = SETTING_DROPDOWN_LIST, deleteSwitchAccount = false;
        if (response?.code === 0) {
            const accountDetails = response?.data;
            let accountData = accountDetails?.find((i) => i.subscriberId === userInfo.sId);
            let accountList = accountData?.accountDetailsDTOList;

            if (accountList?.length < 2) {
                deleteSwitchAccount = true;
            }
        } else {
            deleteSwitchAccount = true;
        }

        if (deleteSwitchAccount) {
            list = list.filter(function (obj) {
                return obj.name !== 'switchAccount';
            });
        }

        list.map((val, i) => {
            if (props.location.pathname === `/${URL.SETTING}/switch-account` && deleteSwitchAccount) {
                redirectToHomeScreen(props.history);
            } else {
                val.reDirectTo === props.location.pathname ? setRenderComponentIndex(i) : null;
            }
        });

        setSettingList(list);
    }

    const handleResize = () => {
        setDimensions({
            height: window.innerHeight,
            width: window.innerWidth,
        });
       // settingsRedirection({width: window.innerWidth}, props.history);
    };

    //componentDidMount
    useEffect(() => {
        (async () => await getAccountDetails())();
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SETTINGS_VISITS);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
       
    }, []);

    const redirectLink = (url, index) => {
        safeNavigation(props.history, url);
        setRenderComponentIndex(index);
    };

    //componentDidUpdate
    useEffect(() => {
        SETTING_DROPDOWN_LIST.map((val, i) => {
            val.reDirectTo === props.location.pathname ? setRenderComponentIndex(i) : null;
        });
    }, [location]);

    const toggleSwitch = (name) => {
        return (
            <div className="toggle-wrapper">
                <span>Off</span>
                <div
                    onClick={() => handleClick(name)}
                    className="ToggleSwitch"
                >
                    <div className={toggle[name] ? "knob active" : "knob"}/>
                </div>
                <span className={toggle[name] ? "span-active" : ""}>On</span>
            </div>
        )
    }
    const Component = !(renderComponentIndex === undefined || renderComponentIndex === null) ? SETTING_DROPDOWN_LIST[renderComponentIndex].component : null;

    const mobileSettings = props.location.pathname === `/${URL.SETTING}`;
    const deviceManagement = props.location.pathname === `/${URL.SETTING}/device-management`;

    const sideMenuClick = (item, i) => {
        if (item?.reDirectTo) {
            redirectLink(item.reDirectTo, i)
        } else if (item?.funcClick) {
            let params = {
                history: props.history,
                dimensions,
            };
            item.funcClick(item.name === 'logout' ? params : '');
        }
        mixPanelConfig.trackEvent(MIXPANEL.EVENT.SETTINGS_MENU_OPTION);
        dataLayerConfig.trackEvent(DATALAYER.EVENT.SETTING_CTAS,{
            [DATALAYER.PARAMETER.BUTTON_NAME]:item.displayName,
           
            
        })
    };

    return (
        <div className="main-setting-page">
            <main>
                <div
                    className={`language-setting-container ${mobileSettings ? "sidebar-marginTop" : ""} ${deviceManagement ? 'device-screen' : ''}`}>
                    <div className={!mobileSettings
                        ? `${dimensions.width >= TAB_BREAKPOINT ? "sidebar sidebar--expanded" : "d-none"}`
                        : "fullWidth"}>
                        <div className="side-bar-container">
                            <h3>Settings</h3>
                            {settingList?.map((item, i) => (
                                <div className="side-bar-inner-wrapper"
                                     onClick={() => sideMenuClick(item, i)} key={i}>
                                    <div className={"left-image"}>
                                        <i className={item.leftIcon}/>
                                    </div>
                                    <p>{item.displayName}</p>
                                    {item.toggleSwitch
                                        ? toggleSwitch(item.name)
                                        : null}
                                    {item.rightIcon &&
                                    <div className={`${mobileSettings ? "right-image" : props.location.pathname === item.reDirectTo ? "right-image" : "dont-show-right-icon"}`}>
                                        <i className={item.rightIcon}/>
                                    </div>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                    {!mobileSettings && Component &&
                    <div className={"main-content main-content--expanded"}>
                        <Component isSwitchAccDropdownOpen={true}/>
                    </div>
                    }
                </div>
            </main>
        </div>
    );
};

export default Setting;

Setting.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
}