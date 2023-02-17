import React, {Component} from 'react';
import get from "lodash/get";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import PropTypes from "prop-types";
import webSmallLogoImage from "@assets/images/web-amall-login-logo.png";
import {getUpgradeTransitionDetails} from '../APIs/action';
import Button from "@common/Buttons";
import '../style.scss';
import './style.scss';
import Heading from "../../../common/Heading";
import {cloudinaryCarousalUrl, safeNavigation} from "@utils/common";
import {getKey, setKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";
import {modifySubscription} from "@containers/PackSelection/APIs/action";
import isEmpty from "lodash/isEmpty";
import {subscriptionFailure} from "@containers/MySubscription/APIs/subscriptionCommon";
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";
import moengageConfig from "@utils/moengage";
import MOENGAGE from "@constants/moengage";
import {toast} from "react-toastify";
import {BASE_PACK_LOGO_DIMENSIONS} from "@containers/MySubscription/constant";

const UpgradeSuccess = ({message}) => {
    return <div className="upgrade-success-container">
        <div className="upgrade-success-image">
            <img src={`../../assets/images/Success-tick.png`} alt=""/>
        </div>
        <div className="upgrade-success-text">
            <div>Free Trial upgraded</div>
            <div>{message}</div>
        </div>
    </div>
};

UpgradeSuccess.propTypes = {
    message: PropTypes.string,
};

class UpgradeFreeTrial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upgradedPackLogo: {
                width: 144,
                height: 90,
            },
        };
    }

    componentDidMount = async () => {
        await this.loadHandler();
    }

    loadHandler = async () => {
        let {getUpgradeTransitionDetails} = this.props;
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        if (userInfo.packId) {
            await getUpgradeTransitionDetails(userInfo.packId);
            this.getUpgradedProviderLogoDimensions();
        }
        this.trackModifyAnalyticsEvent('MODIFY_PACK_INITIATE');
        this.trackModifyAnalyticsEvent('PACK_SELECTION_INITIATE');
    }

    onBackClickHandler = () => {
        this.props.history.goBack();
    }

    upgradeClickHandler = async () => {
        const {modifySubscription, upgradeTransitionDetails, history, location} = this.props;
        const {from} = location.state || {};
        let userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        await modifySubscription(upgradeTransitionDetails?.upgradePackId, userInfo.packId, false);

        const {modifySubscriptionDetail} = this.props;
        if (modifySubscriptionDetail?.code === 0) {
            this.trackModifyAnalyticsEvent('MODIFY_PACK_SUCCESS');
            setKey(LOCALSTORAGE.SHOW_FS_POPUP, JSON.stringify(true));
            safeNavigation(history, from);
            toast(<UpgradeSuccess message={modifySubscriptionDetail?.data?.message}/>, {
                closeButton: false,
            });
        } else {
            subscriptionFailure(modifySubscriptionDetail, history);
        }
    }

    trackModifyAnalyticsEvent = (eventName) => {
        let {upgradeTransitionDetails, location} = this.props;
        let searchParams = new URLSearchParams(location.search);
        const source = searchParams.get('source');
        let data = {};

        if(eventName === 'PACK_SELECTION_INITIATE') {
            /** Below value to be updated after nudge work is done **/
            data = {
                [`${MIXPANEL.PARAMETER.IS_FROM_NUDGE}`]: MIXPANEL.VALUE.NO,
                [`${MIXPANEL.PARAMETER.SOURCE}`]: source || '',
            }
        } else  {
            data = {
                [`${MIXPANEL.PARAMETER.PACK_NAME}`]: upgradeTransitionDetails.packName || '',
                [`${MIXPANEL.PARAMETER.PACK_PRICE}`]: upgradeTransitionDetails.packPrice || '',
                [`${MIXPANEL.PARAMETER.MOD_TYPE}`]: MIXPANEL.VALUE.UPGRADE,
                [`${MIXPANEL.PARAMETER.SOURCE}`]: source || '',
            }
        }

        mixPanelConfig.trackEvent(MIXPANEL.EVENT[eventName], data);
        moengageConfig.trackEvent(MOENGAGE.EVENT[eventName], data);
    }

    getUpgradedProviderLogoDimensions = () => {
        let {upgradeTransitionDetails} = this.props;
        if (upgradeTransitionDetails?.upgradedProviders?.length > 2) {
            this.setState({
                upgradedPackLogo: {
                    width: BASE_PACK_LOGO_DIMENSIONS.width,
                    height: BASE_PACK_LOGO_DIMENSIONS.height,
                },
            });
        }
    }

    render() {
        let {upgradeTransitionDetails} = this.props;
        const {upgradedPackLogo} = this.state;

        return <div className={'my-subscription form-container upgrade-free-trial-container'}>
            <div className="free-trial-block">
                <div className={'for-mobile back-block'}>
                    <i className={'icon-back-2'} onClick={() => this.onBackClickHandler()}/>
                </div>
                <div className={'web-small-logo for-mobile'}>
                    <img src={webSmallLogoImage} alt={'Logo-Image'}/>
                </div>
                <Heading heading={upgradeTransitionDetails?.upgradeTransitionMessage}/>

                <div className={'provider-container'}>
                    <div>
                        <ul className="app-listing upgraded-provider">
                            {upgradeTransitionDetails?.upgradedProviders && upgradeTransitionDetails.upgradedProviders.map((items, index) =>
                                <img key={index}
                                     src={`${cloudinaryCarousalUrl('', '', upgradedPackLogo.width, upgradedPackLogo.height)}${items.iconUrl}`}
                                     alt="upgrade-provider"/>,
                            )}
                        </ul>
                    </div>
                    <div className={'plus'}><span>+</span></div>
                    <div>
                        <ul className="app-listing base-provider">
                            {upgradeTransitionDetails?.basePackProviders && upgradeTransitionDetails.basePackProviders.map((items, index) =>
                                <img key={index}
                                     src={`${cloudinaryCarousalUrl('', '', BASE_PACK_LOGO_DIMENSIONS.width, BASE_PACK_LOGO_DIMENSIONS.height)}${items.iconUrl}`}
                                     alt="base-provider"/>,
                            )}
                        </ul>
                    </div>
                </div>
                <div className={'expiry-text'}><p>{upgradeTransitionDetails?.expiryDate}</p></div>

                <div className={'plan-message'}><p>{upgradeTransitionDetails?.planApplicableMessage}</p></div>

            </div>

            <div className={'select-plan button-block'}>
                <Button cName="btn primary-btn" bType="button" bValue={'Upgrade'}
                        clickHandler={() => this.upgradeClickHandler()}/>
                <div className="blue-text">
                    <a onClick={() => this.onBackClickHandler()}>{'Not Now'}</a>
                </div>
            </div>
        </div>
    }
}

UpgradeFreeTrial.propTypes = {
    getUpgradeTransitionDetails: PropTypes.func,
    upgradeTransitionDetails: PropTypes.object,
    history: PropTypes.object,
    modifySubscription: PropTypes.func,
    modifySubscriptionDetail: PropTypes.object,
    location: PropTypes.object,
}

const mapStateToProps = (state) => {
    return {
        upgradeTransitionDetails: get(state.mySubscriptionReducer, 'upgradeTransitionDetails'),
        modifySubscriptionDetail: get(state.packSelectionDetail, 'modifySubscription'),
    }
};

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            getUpgradeTransitionDetails,
            modifySubscription,
        }, dispatch),
    }
}

export default (connect(mapStateToProps, mapDispatchToProps)(UpgradeFreeTrial));