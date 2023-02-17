import React, {Component} from 'react';
import {isUserloggedIn} from "@utils/common";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {showSplash, hideSplash} from "@src/action";
import get from "lodash/get";
import {getKey, setKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";
import {fetchPubnubHistory} from '@containers/Home/APIs/actions';
import {URL} from "@constants/routeConstants";
import './style.scss';
import { BROWSER_TYPE } from "@constants/browser";
import { getSystemDetails } from "@utils/browserEnvironment";

class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            style: {'background': 'linear-gradient(69.87deg, #070316 43.33%, #130837 71.53%); !important', 'display': 'none'}
        }
        this.myRef = React.createRef();
        this.systemDetail = '';
    }
    componentDidMount = async() => {
        this.systemDetail = getSystemDetails();
        let deepLinked = JSON.parse(getKey(LOCALSTORAGE.DEEPLINK)) === true;
        if(!deepLinked) {
            this.props.showSplash();
        }
        //setKey(LOCALSTORAGE.HIDE_SPLASH, true);
        setKey(LOCALSTORAGE.DEEPLINK, JSON.stringify(false))
    }

    componentDidUpdate = () =>{
        if(this.myRef.current && this.props.splash){
            this.myRef.current.addEventListener("playing", () => {
                this.setState({
                    style: {'background': 'linear-gradient(69.87deg, #070316 43.33%, #130837 71.53%); !important', 'display': 'block'},
                });
            });

            this.myRef.current.play();
            this.myRef.current.addEventListener("ended", ()=>this.props.hideSplash());
            this.myRef.current.addEventListener("error", ()=>this.props.hideSplash());
        }
    }
    showSplashVideo = () => {
        let paramData = new URLSearchParams(location.search);
        let cartId = paramData.get('cartId')
        let statusInfo = paramData.get('status')
        let tickTick = paramData.get('tickTick')
        const urlArr = location.pathname.split("/");
        let showSplash = [
            URL.PAGE_NOT_FOUND,
            URL.BEST_VIEW_MOBILE,
            URL.APP_INSTALL,
            URL.SUBSCRIPTION_TRANSACTION,
            URL.SUBSCRIPTION_TRANSACTION_REDIRECT,
            URL.HELP_CENTER,
            URL.TRANSACTIONS,
            URL.SUBSCRIPTION_CAMPAIGN,
            URL.SUBSCRIPTION_DISCOUNT
        ].includes(urlArr[1])
        if((cartId && statusInfo) || tickTick || statusInfo){
            return false
        }
         return !showSplash    
}

    render() {
        let {
         location,
         } = this.props;
        return (
            <div> 
                {
                this.systemDetail.browser !== BROWSER_TYPE.SAFARI &&
                this.props.splash ? 
                this.showSplashVideo() ?
                 <div className="fullscreen-bg" style={{ 'background': 'linear-gradient(69.87deg, #070316 43.33%, #130837 71.53%)' }}>
                    <video className="fullscreen-bg__video" muted ref={this.myRef} autoPlay="autoPlay"
                           style={this.state.style} playsInline onError={this.props.hideSplash} >
                        {/*<source src="../../assets/images/splash.ogv" type="video/ogg" />*/}
                     {window.innerWidth>414? <source src="../../assets/images/splashLarge.mp4" type="video/mp4" />:
                       <source src="../../assets/images/splashSmall.mp4" type="video/mp4" />}
                        {/* <source src="../../assets/images/splash.webm" type="video/webm" /> */}
                    </video>
                </div> :
                null :
                null}          
            </div>
        );
    }
}

Splash.propTypes = {
    showSplash: PropTypes.func,
    splash: PropTypes.bool,
    hideSplash: PropTypes.func,
    fetchPubnubHistory: PropTypes.func,
};


function mapStateToProps(state) {
    return {
        splash: get(state.commonContent, 'splash'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            showSplash,
            hideSplash,
            fetchPubnubHistory,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(Splash))
