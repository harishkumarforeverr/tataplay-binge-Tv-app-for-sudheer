import React, { useCallback } from 'react';
import Button from "@common/Buttons";
import { MESSAGE, PLAY_ACTION } from "@constants";
import PropTypes from 'prop-types';
import { getLayeredIcon, showNoInternetPopup, showToast, isMobile, checkTrailer, showActivateAppleTV } from "@utils/common";
import useContentPlay from "@src/Hooks/useContentPlay";

import ActionButton from '../actionButton';
import { fireProductLandingCtasEvent } from '@containers/PIDetail/PIDetailCommon';
import DATALAYER from '@utils/constants/dataLayer';
import { connect } from 'react-redux';
import { get } from 'lodash';
import store from '../../../../store';
import { PROVIDER_NAME } from '@utils/constants/playerConstant';

export const MoviesButton = (props) => {
    const {
        playMovieBtn,
        movieProps,
        commonProps,
        commonProps: {
            meta,
            addToFavourite,
        },
        movieProps: { playTrailer, contentType, id, detail },
    } = props;
    const { modal } = store.getState();
    let showModal = get(modal, "showModal");
    const appleActivationData = props.headerData?.config?.verbiages.filter((item) => item?.categoryName === 'apple-activation-popup');
    const onPlayContent = useContentPlay({ contentType })
    const playClick = useCallback(() => {
        if ((props?.commonProps?.currentSubscription?.productName === "Mega" && props?.commonProps?.currentSubscription?.appleRedemptionStatus !== "Completed" && meta?.provider.toLowerCase() === PROVIDER_NAME.APPLE)) {
            showActivateAppleTV(meta?.partnerDeepLinkUrl, appleActivationData, true);
        } else {
            fireProductLandingCtasEvent(commonProps?.meta, DATALAYER.VALUE.PLAY)
            onPlayContent(meta, { ...commonProps, ...movieProps });
        }
    }, [props]);

    return <div className="detail-button">
        <div className='detail-button-container'>
            <div
                className={`${isMobile.any() ? `${checkTrailer(meta, detail) ? 'mobile-button-configure' : 'mobile-button-configure no-trailer'}` : 'website-button-configure'}`}>
                <Button
                    bIcon={playMovieBtn === PLAY_ACTION.REPLAY ? getLayeredIcon('icon-replay') : ''}
                    bValue={playMovieBtn}
                    cName={`btn primary-btn ${playMovieBtn === PLAY_ACTION.REPLAY ? 'icon-replay' : 'play-btn'}`}
                    clickHandler={navigator.onLine ? playClick : showNoInternetPopup} />
                {
                    checkTrailer(meta, detail) &&
                    <Button bValue="View Trailer" cName="btn primary-btn trailer-btn" clickHandler={() => {
                        playTrailer(contentType, id)
                    }} />
                }

                {(props?.commonProps?.currentSubscription?.productName === "Mega" && props?.commonProps?.currentSubscription?.appleRedemptionStatus !== "Completed" && meta?.provider.toLowerCase() === PROVIDER_NAME.APPLE) &&
                    <Button
                        bValue={appleActivationData[0]?.data?.header}
                        clickHandler={() => showActivateAppleTV(meta?.partnerDeepLinkUrl, appleActivationData, false)}
                        cName="play-btn-activate-apple-tv"

                    />
                }
            </div>
            <ActionButton favorite={!!props.favorite} title={props.movieProps.title} changeText={() => {
                addToFavourite()
            }} onClickWhatsapp={() => {
                window.open("https://web.whatsapp.com/", '_blank')
            }} onClickShare={() => {
                navigator.clipboard.writeText(window.location.href)
                showToast(MESSAGE.SHARE_URL_MESSAGE);
            }} {...props} />
        </div>
    </div>
}

const mapStateToProps = (state) => ({
    headerData: get(state.headerDetails, 'configResponse.data'),
});

export default connect(mapStateToProps, {})(MoviesButton);

MoviesButton.propTypes = {
    playMovieBtn: PropTypes.string,
    history: PropTypes.object,
    playTrailer: PropTypes.func,
    contentType: PropTypes.string,
    id: PropTypes.number,
    meta: PropTypes.object,
    addToFavourite: PropTypes.func,
    movieProps: PropTypes.object,
    playZee5Content: PropTypes.func,
    playHotStarContent: PropTypes.func,
    currentSubscription: PropTypes.object,
    isTVOD: PropTypes.bool,
    tvodExpiry: PropTypes.func,
    commonProps: PropTypes.object,
    favorite: PropTypes.bool,
};
