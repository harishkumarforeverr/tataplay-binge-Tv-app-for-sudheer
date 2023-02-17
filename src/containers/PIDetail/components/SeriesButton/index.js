import React, {useCallback} from "react";
import Button from "@common/Buttons";
import {MESSAGE, PLAY_ACTION} from "@constants";
import PropTypes from "prop-types";
import {
    getLayeredIcon,
    showNoInternetPopup,
    playContent,
    isMobile,
    showToast, checkTrailer, showActivateAppleTV,
} from "@utils/common";
import {PROVIDER_NAME} from "@constants/playerConstant";
import {getSystemDetails} from "@utils/browserEnvironment";
import {BROWSER_TYPE} from "@constants/browser";
import useContentPlay from "@src/Hooks/useContentPlay";

import ActionButton from "../actionButton";
import {fireProductLandingCtasEvent} from "@containers/PIDetail/PIDetailCommon";
import DATALAYER from "@utils/constants/dataLayer";
import { connect } from "react-redux";
import { get } from "lodash";

const SeriesButton = (props) => {
    const {
        playMovieBtn,
        commonProps,
        commonProps: {meta, addToFavourite},
        seriesProps: {playTrailer, id, contentType, detail},
    } = props;

    const onPlayContent = useContentPlay({contentType});
    const appleActivationData = props.headerData?.config?.verbiages.filter((item) => item?.categoryName === 'apple-activation-popup');
    const playClick = useCallback(async () => {
        if ((props?.commonProps?.currentSubscription?.productName === "Mega" && props?.commonProps?.currentSubscription?.appleRedemptionStatus !== "Completed" && meta?.provider.toLowerCase() === PROVIDER_NAME.APPLE)) {
            showActivateAppleTV(meta?.partnerDeepLinkUrl, appleActivationData, true);
        } else {
            fireProductLandingCtasEvent(commonProps?.meta, DATALAYER.VALUE.PLAY)
            onPlayContent(meta, {...commonProps, ...props.seriesProps});
        }
    }, [props]);

    return <div className='detail-button'>
        <div className='detail-button-container'>
            <div
                className={`${isMobile.any() ? `${checkTrailer(meta, detail) ? 'mobile-button-configure' : 'mobile-button-configure no-trailer'}` : 'website-button-configure'}`}>
                <Button
                    bIcon={playMovieBtn === PLAY_ACTION.REPLAY ? getLayeredIcon('icon-replay') : ''}
                    bValue={playMovieBtn}
                    cName={`btn primary-btn ${playMovieBtn === PLAY_ACTION.REPLAY ? 'icon-replay' : 'play-btn'}`}
                    clickHandler={() => navigator.onLine ? playClick() : showNoInternetPopup()}
                />
                {
                    checkTrailer(meta, detail) &&
                    <Button bValue="View Trailer" cName="btn primary-btn trailer-btn" clickHandler={() => {
                        playTrailer(contentType, id)
                    }}/>
                }
                {(props?.commonProps?.currentSubscription?.productName === "Mega" && props?.commonProps?.currentSubscription?.appleRedemptionStatus !== "Completed" && meta?.provider.toLowerCase() === PROVIDER_NAME.APPLE) &&
                    <Button
                        bValue={appleActivationData[0]?.data?.header}
                        clickHandler={() => showActivateAppleTV(meta?.partnerDeepLinkUrl, appleActivationData, false)}
                        cName="play-btn-activate-apple-tv"

                    />
                }
            </div>
            <ActionButton favorite={props.favorite} title={props.seriesProps.title} changeText={() => {
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

export default connect(mapStateToProps, {})(SeriesButton);


SeriesButton.propTypes = {
    playMovieBtn: PropTypes.string,
    lastWatch: PropTypes.object,
    history: PropTypes.object,
    meta: PropTypes.object,
    addToFavourite: PropTypes.func,
    seriesProps: PropTypes.object,
    playZee5Content: PropTypes.func,
    playHotStarContent: PropTypes.func,
    currentSubscription: PropTypes.object,
    isTVOD: PropTypes.bool,
    tvodExpiry: PropTypes.func,
    commonProps: PropTypes.object,
    favorite: PropTypes.bool,
    contentType: PropTypes.string,
    id: PropTypes.number,
    playTrailer: PropTypes.func,
    seriesList: PropTypes.array,
}
