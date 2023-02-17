import React from 'react';
import Button from "@common/Buttons";
import PropTypes from 'prop-types';
import {getKey} from "@utils/storage";
import {LOCALSTORAGE} from "@constants";
import {isMobile} from "@utils/common";

export default class FreeTrial extends React.Component {

    redirection = async () => {
        const {packDetail, createSubscription, freeOpenPopup, isCreate, modifySubscription} = this.props;
        const user_info = JSON.parse(getKey(LOCALSTORAGE.USER_INFO));
        const {alternatePackId} = user_info;
        const dropPackId = alternatePackId ? alternatePackId : user_info.packId;
        if (isCreate) {
            await createSubscription(packDetail.packId);
        } else {
            await modifySubscription(packDetail.packId, dropPackId);
        }

        // update alternatepackId and expirationdate of userinfo key
        freeOpenPopup();
    }

    render() {
        const {aboutSubscription, packDetail} = this.props;
        return (<div className="dth-balance-block">
            <p className={`dth-instructions ${isMobile.any() && 'for-mobile-view'} ${!aboutSubscription && `dth-top`}`}>{packDetail.footerVerbiage}</p>
            <div className={'button-group'}>
                <Button bValue="Proceed" cName="btn primary-btn" clickHandler={this.redirection}/>
            </div>
        </div>)
    }
}

FreeTrial.propTypes = {
    packDetail: PropTypes.object,
    createSubscription: PropTypes.func,
    freeOpenPopup: PropTypes.func,
    isCreate: PropTypes.bool,
    modifySubscription: PropTypes.func,
    aboutSubscription: PropTypes.bool,
    getInstructions: PropTypes.func,
};
