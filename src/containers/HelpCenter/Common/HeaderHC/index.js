import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { URL } from "@constants/routeConstants";
import { redirectToHomeScreen } from "@containers/BingeLogin/bingeLoginCommon";
import { getKey } from "@utils/storage";
import { LOCALSTORAGE } from "@utils/constants";



import DesktopLogo from '@assets/images/bingeLogo.svg';
import MobileLogo from "@assets/images/newLogoSmall.svg";

import '../../style.scss';
import './style.scss';
import { isMobile, isHelpCenterWebView } from '@utils/common';



const HeaderHC = (props) => {
  const { urlArr, history } = props;
  const isRenderHcView = useSelector(state => state.helpCenterReducer?.renderHcView);
  let isHelpCenterInMobileApp = JSON.parse(getKey(LOCALSTORAGE.IS_HELP_CENTER_IN_MOBILE_APP)) === true
  return (
    <React.Fragment>
      {isRenderHcView && <div className={'header-hc'}>
        <header className="for-desktop text-center" onClick={() => redirectToHomeScreen(history)}>
          <img src={DesktopLogo} className="img-fluid" alt='' />
        </header>
        {urlArr && !urlArr.includes(URL.HC_SEARCH_RESULT) && <div className="logo-contr for-mobile">
          <div className="container">
            <a
              className="back"
              onClick={() => !isHelpCenterWebView() && redirectToHomeScreen(history)}
            ><img src={MobileLogo} alt='' /></a>
          </div>
        </div>}
      </div>}
    </React.Fragment>
  )
};

HeaderHC.propTypes = {
  height: PropTypes.number,
  videoLink: PropTypes.string,
  urlArr: PropTypes.array,
  history: PropTypes.object,
};

export default HeaderHC;
