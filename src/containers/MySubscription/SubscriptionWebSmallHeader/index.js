import React, {Fragment} from 'react';
import webSmallLogoImage from "@assets/images/web-amall-login-logo.png";
import ProgressBar from "@common/ProgressBar";
import {WEB_SMALL_LOGIN_STEP} from "@containers/BingeLogin/APIs/constants";
import PropTypes from 'prop-types';


const SubscriptionWebSmallHeader = (props) => {
    const {data, mobileBack, activeStep, showProgressBar = true, showLogo = true} = props;
    return (
        <Fragment>
            <div className={'for-mobile back-block'}>
                <i className={'icon-back-2'} onClick={mobileBack}/>
            </div>
            {showLogo && <div className={'web-small-logo for-mobile'}>
                <img src={webSmallLogoImage} alt={'Logo-Image'}/>
            </div>}
            {data && showProgressBar &&
            <div className={'for-mobile'}><ProgressBar stepNumberArray={WEB_SMALL_LOGIN_STEP} activeStep={activeStep}/>
            </div>}
        </Fragment>
    )
};

SubscriptionWebSmallHeader.propTypes = {
    data: PropTypes.object,
    mobileBack: PropTypes.func,
    activeStep: PropTypes.number,
    showProgressBar: PropTypes.bool,
    showLogo: PropTypes.bool,
}

export default SubscriptionWebSmallHeader;