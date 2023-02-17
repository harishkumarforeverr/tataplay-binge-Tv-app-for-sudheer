import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { get } from "lodash";
import { JOURNEY_SOURCE } from "@containers/Subscription/APIs/constant";
import { getWebPortalLink, setRegionalNudgeStatus } from "@containers/Subscription/APIs/action";
import CrossIcon from "@assets/images/cross.png";
import Icon from "@assets/images/nudge-icon.svg";
import { useEffect } from "react";
import { LOCALSTORAGE } from "@utils/constants";
import { showRegionalAppNudge } from "@containers/Main/MainCommon";
import { useHistory } from "react-router-dom";
import { getKey, setKey } from "@utils/storage";
import { isHomePage } from "@utils/common";
import MIXPANEL from "@constants/mixpanel";
import "./style.scss";

 function RegionalNudge() {
  const currentSubscription = useSelector(state => get(state.subscriptionDetails, 'currentSubscription.data'))
  const nudgeStatus = useSelector(state => get(state.subscriptionDetails, 'regionalNudgeStatus'))
  const loginReducer = useSelector(state => get(state?.loginReducer,'isLoginPopupVisible'))
  const dispatch = useDispatch();
  const history = useHistory()
  useEffect(()=> {
       let { location: { pathname } } = history;
       if (isHomePage(pathname) && !loginReducer) {
         let nudgeFrequency = JSON.parse(getKey(LOCALSTORAGE.NUDGE_LAUNCH_COUNTER)) || 0;
         setKey(LOCALSTORAGE.NUDGE_LAUNCH_COUNTER, ++nudgeFrequency);
       }
  },[])

  const handleRedirection = async () => {
    await dispatch(
      getWebPortalLink({
        initiateSubscription: JOURNEY_SOURCE.MY_PLAN_EDIT,
        journeySource: JOURNEY_SOURCE.MY_PLAN_REGIONAL,
        journeySourceRefId: "",
        analyticSource: MIXPANEL.VALUE.CHANGE_PLAN,
      })
    );
  };

  return (
    <>
      {nudgeStatus && showRegionalAppNudge(history) && (
        <div className = "nudge-container">
          <div className = "img-container">
            <img src={Icon} alt="icon" />
          </div>
          <div className="text-container">
            <p>{get(currentSubscription,'regionalAppNudge.regionalAppVerbiage')}</p>
            <p onClick={handleRedirection}>{get(currentSubscription,'regionalAppNudge.regionalAppCTA')}</p>
          </div>
          <div className="cross-icon-container">
            <div className="cross-icon" onClick={() => dispatch(setRegionalNudgeStatus())}>
              <img src={CrossIcon} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

RegionalNudge.propTypes = {
  currentSubscription: PropTypes.object,
  nudgeStatus: PropTypes.bool,
  loginReducer: PropTypes.bool,
};
  

export default React.memo(RegionalNudge)