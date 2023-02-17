import { loginInFreemium } from "@utils/common";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import firebase from "@utils/constants/firebase";
import { MINI_SUBSCRIPTION, TOAST_ID } from "@utils/constants";
import { toast } from "react-toastify";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { closePopup, openPopup } from "@common/Modal/action";
import { withRouter } from "react-router";
import { openLoginPopup } from '@containers/Login/APIs/actions';
import get from "lodash/get";

const removeLoginNotNowToast = () => {
    const loginNotNowToast = document.getElementById(TOAST_ID.LOGIN_NOT_NOW_TOAST);
    if (loginNotNowToast) {
        toast.dismiss()
        loginNotNowToast.style.setProperty('visibility', 'hidden', 'important');
    }
}

const LoginNotNow = ({openPopup, closePopup, openLoginPopup ,showNotNowPopup,history}) => {
    useEffect(()=>{
        window.addEventListener('blur',removeLoginNotNowToast);
        let queryParams = new URLSearchParams(location.search)
        queryParams.has("status") && ( history.replace({pathname: location.pathname,search: '' }) )
        return () => window.removeEventListener('blur', removeLoginNotNowToast);
    },[])

    let getSource = firebase.VALUE.PLAYBACK;
    return <div className="login-not-now">
        <i className="icon-alert-upd" />
        <div className="text-fail">
            <div>Login not successful.</div>
            <div onClick={async () => await loginInFreemium({ openPopup, closePopup, openLoginPopup, source: firebase.VALUE.HOME, getSource, ComponentName: MINI_SUBSCRIPTION.LOGIN, fromLogin: showNotNowPopup })}>Please Try Again
            </div>
        </div>
    </div>
};

LoginNotNow.propTypes = {
    showNotNowPopup: PropTypes.object,
    openPopup: PropTypes.func,
    closePopup: PropTypes.func,
    openLoginPopup: PropTypes.func,
};
function mapStateToProps(state) {
    return {
        miniSubscription: get(state.subscriptionDetails, "miniSubscription"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {

                openPopup,
                closePopup,
                openLoginPopup
            },
            dispatch,
        ),
    };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginNotNow));

