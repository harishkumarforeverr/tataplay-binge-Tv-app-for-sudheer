import hotstarNewLogo from '@assets/images/hotstar-new.png';
import { closePopup, openPopup } from '@common/Modal/action';
import { MODALS } from '@common/Modal/constants';
import { openLoginPopup } from '@containers/Login/APIs/actions';
import { getTVODExpiry } from '@containers/PIDetail/API/actions';
import {
    getZee5Tag,
    setContinueWatching,
    setLA,
} from '@containers/PlayerWeb/APIs/actions';
import { hideMainLoader, showMainLoader } from '@src/action';
import {
    checkPartnerPlayable,
    isMobile,
    isUserloggedIn,
    playContent,
    playContentEventTrack,
    redirectToApp,
    safeNavigation,
    setLALogic
} from '@utils/common';
import {CONTENTTYPE, LOCALSTORAGE, PARTNER_SUBSCRIPTION_TYPE,} from '@utils/constants';
import {getKey, setKey} from '@utils/storage';
import {get, isEmpty} from 'lodash';
import {useCallback, useRef} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import MIXPANEL from '@constants/mixpanel';
import MOENGAGE from '@constants/moengage';
import {checkForNonIntegratedPartner, getCircularLogo} from "@containers/PIDetail/PIDetailCommon";
import useContentAnalytics from './useContentAnalytics';
import { useParams, useLocation, useHistory } from "react-router-dom";
import store from '@src/store';

export default function useContentPlay({
    onPlay,
    contentType,
    sectionData = {
        railTitle: '',
        source: '',
        origin: '',
        railPosition: '',
        configType: '',
        sectionType: '',
        contentPosition: '',
    },
}) {
    const partnerUniqueIdInfo = useSelector((state) => state?.subscriptionDetails?.currentSubscription?.data?.partnerUniqueIdInfo, shallowEqual);
    const lastWatch = useSelector(state => state?.PIDetails?.continueWatchingDetails?.data, shallowEqual) || {};
    const getTVODExpiryTime = useSelector(state => state?.PIDetails?.tvodExpiryDetails?.data?.purchaseExpiry, shallowEqual)
    const history = useHistory();
    const dispatch = useDispatch();
    let params = useParams();
    const location = useLocation();

    // Location : state : values
    // conPosition: 1
    // configType: "Editorial"
    // prevPath: "/"
    // railPosition: 0
    // railTitle: "Continue Watching"
    // sectionSource: "CONTINUE_WATCHING"
    // sectionType: "RAIL"
    // setPathIs: {pathname: '/', search: '', state: {…}, hash: '', key: 'wkcozf'}
    // source: "Home"
    // title: "My Little Baby"

    const mixpanelData = {
        railTitle: location?.state?.railTitle,
        source: location?.state?.source,
        origin: location?.state?.prevPath,
        railPosition: location?.state?.railPosition,
        conPosition: location?.state?.conPosition,
        sectionSource: location?.state?.sectionSource,
        configType: location?.state?.configType,
        sectionType: location?.state?.sectionType,
        contentSectionSource: location?.state?.contentSectionSource,
    };

    const contentRef = useRef({
        meta: {},
    });

    const { trackMixPanelEvent, trackMongageEvent } = useContentAnalytics({
        ...sectionData,
    });
    const maskingHotstar = (phoneNumber) => {
        let subNum = phoneNumber.toString().substring(5, 10);
        subNum = `"xxxxx${subNum}"`;
        return subNum;
    };


    const partnerErrorPopup = useCallback(() => {
        dispatch(closePopup());
        toast('Error. Content not found!', {
            position: toast.POSITION.BOTTOM_CENTER,
        });
    }, [dispatch]);

    const setCWForPartner = useCallback(async (useCWData = false, cwData) => {
        const { meta } = contentRef.current;
        let { contentType } = params;
        if (useCWData) {
            await dispatch(
                setContinueWatching(
                    cwData.id,
                    1,
                    cwData.totalDuration,
                    cwData.contentType
                )
            );
        } else if (
            contentType === CONTENTTYPE.TYPE_BRAND ||
            contentType === CONTENTTYPE.TYPE_TV_SHOWS ||
            contentType === CONTENTTYPE.TYPE_SERIES
        ) {
            let seriesContentType = meta.vodContentType
                ? meta.vodContentType
                : meta.contentType, id;
            if (meta?.isEpisodeContent) {
                id = meta.id;
            } else {
                id = lastWatch?.vodId ? lastWatch.vodId : meta.vodId || meta.id;
            }
            await dispatch(
                setContinueWatching(
                    id,
                    1,
                    meta?.duration || meta?.totalDuration,
                    seriesContentType
                )
            );
        } else {
            await dispatch(
                setContinueWatching(
                    meta?.vodId || meta?.id,
                    1,
                    meta?.duration || meta?.totalDuration,
                    contentType
                )
            );
        }
    }, [dispatch, lastWatch.contentType, lastWatch.id, params]);

    const zee5Redirection = useCallback(async (partnerWebUrl, tag, useCWData, cwData, learnData) => {
        const { meta } = contentRef.current;
        await setCWForPartner(useCWData, cwData);
        await store.dispatch(setLA(learnData))
        setKey(LOCALSTORAGE.DEEPLINK, JSON.stringify(true));
        trackMixPanelEvent(contentRef?.current, MIXPANEL.EVENT.PLAY_CONTENT);
        trackMongageEvent(contentRef?.current, MOENGAGE.EVENT.PLAY_CONTENT);
        playContentEventTrack(meta);
        let partnerUrl = partnerWebUrl?.split("?")
        let constUrl = "utm_source=tataskybinge&utm_medium=amazonstick&utm_campaign=zee5campaign&partner=tataskybinge"
        let newPartnerUrl = `${partnerUrl[0]}?${constUrl}`
        window.location.href = `${newPartnerUrl}&tag=${tag}`;
    }, [setCWForPartner, trackMixPanelEvent, trackMongageEvent]);

    const playZee5Content = useCallback(async (partnerWebUrl, useCWData, cwData, learnData, firstEpisodeSubscriptionType) => {
        const { meta } = contentRef.current;
        const isFreemium =
            meta?.partnerSubscriptionType?.toUpperCase() !==
            PARTNER_SUBSCRIPTION_TYPE.PREMIUM;
        if (partnerWebUrl) {
            let partnerUniqueId;
            let partnerPlayable = isUserloggedIn() && await checkPartnerPlayable(meta?.partnerId, meta?.provider);
            if (!firstEpisodeSubscriptionType && ((!isFreemium || partnerPlayable) && !isEmpty(partnerUniqueIdInfo)))  {
                partnerUniqueId = partnerUniqueIdInfo[meta.provider.toUpperCase()]?.partnerUniqueId;
                partnerUniqueId = !isEmpty(partnerUniqueId) ? partnerUniqueId : '';

                showMainLoader();
                await dispatch(getZee5Tag(partnerUniqueId)).then(async (response) => {
                    dispatch(hideMainLoader());
                    if (isEmpty(response.data)) {
                        partnerErrorPopup(response);
                    } else {
                        const tag = response?.data?.tag;
                        await zee5Redirection(partnerWebUrl, tag, useCWData, cwData, learnData)
                    }
                })
                    .catch(() => {
                        partnerErrorPopup();
                    });
            } else {
                await zee5Redirection(partnerWebUrl, '', useCWData, cwData, learnData);
            }
        } else {
            partnerErrorPopup();
        }
    }, [partnerUniqueIdInfo, dispatch, partnerErrorPopup, zee5Redirection]);

    const appleTVRedirection = useCallback(async (partnerWebUrl, setCW, learnData) => {
        const { meta } = contentRef.current;
        if (partnerWebUrl) {
            setCW && (await setCWForPartner()); // Ask
            await setLALogic(learnData?.id) && await store.dispatch(setLA(learnData)) // Ask
            setKey(LOCALSTORAGE.DEEPLINK, JSON.stringify(true));
            trackMixPanelEvent(
                contentRef?.current,
                MIXPANEL.EVENT.PLAY_CONTENT
            );
            trackMongageEvent(
                contentRef?.current,
                MOENGAGE.EVENT.PLAY_CONTENT
            );
            playContentEventTrack(meta);
            window.location.href = partnerWebUrl;
        } else {
            partnerErrorPopup();
        }

    }, [setCWForPartner, trackMixPanelEvent, trackMongageEvent]);
  

    const playAppleTVContent = useCallback(async (partnerWebUrl, setCW, learnData) => {
        appleTVRedirection(partnerWebUrl, setCW, learnData)
    }, [dispatch, partnerErrorPopup, appleTVRedirection]);

    const reDirectToHotstar = async (hotstarWebDeeplink, setCW, learnData) =>{
        const { meta } = contentRef.current;
        if (hotstarWebDeeplink) {
            setCW && (await setCWForPartner());
            await store.dispatch(setLA(learnData))
            setKey(LOCALSTORAGE.DEEPLINK, JSON.stringify(true));
            trackMixPanelEvent(
                contentRef?.current,
                MIXPANEL.EVENT.PLAY_CONTENT
            );
            trackMongageEvent(
                contentRef?.current,
                MOENGAGE.EVENT.PLAY_CONTENT
            );
            playContentEventTrack(meta);
            window.location.href = hotstarWebDeeplink;
        } else {
            partnerErrorPopup();
        }
    }

    const playHotStarContent = useCallback((hotstarWebDeeplink, setCW, ispopUp, learnData) => {
        const userInfo = JSON.parse(getKey(LOCALSTORAGE.USER_INFO)) || {};
        const rmn = get(userInfo, 'rmn');
        if(ispopUp){
        dispatch(
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal hotstar',
                instructions: `<img src=${hotstarNewLogo} alt='' height="90" width="130"/>
            <p class='primary-hotstar-text'> You will be redirected to Disney+ Hotstar</p>
            <p class='secondary-hotstar-text'> Please ensure you are logged in with your Tata Play Registered Mobile Number ${maskingHotstar(rmn)}</p>`,
                primaryButtonText: 'Proceed',
                isHtml: true,
                primaryButtonAction: async () => {
                    await redirectionHandling(hotstarWebDeeplink, setCW, learnData);
                    dispatch(closePopup());
                },
            })
        );
        }else{
            reDirectToHotstar(hotstarWebDeeplink,setCW, learnData)
        }
    },[dispatch, partnerErrorPopup, setCWForPartner, trackMixPanelEvent, trackMongageEvent]);

    const redirectionHandling = async (partnerDeepLinkUrl, setCW, learnData) => {
        if (partnerDeepLinkUrl) {
            const { meta } = contentRef.current;
            setCW && (await setCWForPartner());
            await store.dispatch(setLA(learnData))
            setKey(LOCALSTORAGE.DEEPLINK, JSON.stringify(true));
            trackMixPanelEvent(
                contentRef?.current,
                MIXPANEL.EVENT.PLAY_CONTENT
            );
            trackMongageEvent(
                contentRef?.current,
                MOENGAGE.EVENT.PLAY_CONTENT
            );
            playContentEventTrack(meta);
            window.location.href = partnerDeepLinkUrl;
        } else {
            partnerErrorPopup();
        }
    }

    const playSonyLivContent = (partnerDeepLinkUrl, meta) => {
        const { openPopup, closePopup } = this.props;
        openPopup(MODALS.ALERT_MODAL, {
            modalClass: 'alert-modal sonyLiv',
            instructions: `<img src=${getCircularLogo(meta)} alt=''/>
              <p class='primary-sonyLiv-text'>SonyLiv is currently available only on mobile. 
              Please download Tata Play Binge app on your Android/iOS ${isMobile.any() ? 'device' : 'mobile'} to access SonyLiv</p>
            `,
            primaryButtonText: `${isMobile.any() ? 'Proceed' : 'Done'}`,
            isHtml: true,
            primaryButtonAction: async () => {
                if (isMobile.any()) {
                    redirectToApp();
                }
                closePopup();
            },
            secondaryButtonText: `${isMobile.any() ? 'Close' : ''}`,
            secondaryButtonAction: () => {
                closePopup();
            },
        });
    }

    const deepLinkContent = (message) => {
        const currentPath = getKey(LOCALSTORAGE.CURRENT_PATH);
        dispatch(
            openPopup(MODALS.ALERT_MODAL, {
                modalClass: 'alert-modal vootplay',
                instructions: ` 
              <p class='primary-sonyLiv-text'>${message}</p>`,
                primaryButtonText: `${isMobile.any() ? 'Go to app' : 'Ok'}`,
                isHtml: true,
                primaryButtonAction: async () => {
                    if (isMobile.any()) {
                        redirectToApp(currentPath);
                    }
                },
                secondaryButtonText: "Cancel",
                secondaryButtonAction: () => {
                    closePopup()
                },
            })
        );
    }

    const playMXPlayerContent = (history) => {
        if (isMobile.any()) {
            redirectToApp();
        } else {
            dispatch(
                openPopup(MODALS.ALERT_MODAL, {
                    modalClass: 'alert-modal',
                    closeModal: true,
                    hideCloseIcon: true,
                    instructions: 'MX Player content is playable only on mobile',
                    primaryButtonText: 'Ok',
                    primaryButtonAction: () => {
                        safeNavigation(history, "/");
                        dispatch(closePopup());
                    },
                })
            );
        }
    }
    const hotstarPopup = async (hotstarWebDeeplink, setCW, learnData) =>{
        if (hotstarWebDeeplink) {
            const { meta } = contentRef.current;
            setCW && (await setCWForPartner());
            await store.dispatch(setLA(learnData))
            setKey(LOCALSTORAGE.DEEPLINK, JSON.stringify(true));
            trackMixPanelEvent(
                contentRef?.current,
                MIXPANEL.EVENT.PLAY_CONTENT
            );
            trackMongageEvent(
                contentRef?.current,
                MOENGAGE.EVENT.PLAY_CONTENT
            );
            playContentEventTrack(meta);
            window.location.href = hotstarWebDeeplink;
        } else {
            partnerErrorPopup();
        }
    }


    const tvodExpiry = useCallback(async () => {
        const { meta } = contentRef.current;
        if (!meta?.showcase && !meta?.isPlaybackStarted) {
            meta?.vodId && (await dispatch(getTVODExpiry(meta?.vodId, true)));
            const result = meta.id.split('?');
            const tvodInfo = JSON.parse(getKey(LOCALSTORAGE.TVOD_DATA));
            const data = tvodInfo && tvodInfo?.find((i) => i.id === parseInt(result[0]));

            if (data && getTVODExpiryTime) {
                const index = tvodInfo && tvodInfo?.findIndex((i) => i.id === parseInt(result[0]));
                tvodInfo[index].rentalExpiry = this.props.getTVODExpiryTime;
                setKey(LOCALSTORAGE.TVOD_DATA, tvodInfo);
            }
        }
    }, [dispatch, getTVODExpiryTime]);

    return useCallback((meta, options = {}) => {
        contentRef.current = {meta, ...options};
        playContent(
            {
                meta,
                history,
                checkForNonIntegratedPartner,
                contentType,
                id: meta.id || meta.vodId,
                mixpanelData,
                playZee5Content,
                playHotStarContent,
                deepLinkContent,
                playSonyLivContent,
                playMXPlayerContent,
                isTVOD: meta?.isTVOD,
                tvodExpiry,
                lastWatch: lastWatch || {},
                openPopup,
                closePopup,
                openLoginPopup,
                hotstarPopup,
                redirectionHandling,
                playAppleTVContent,
                appleTVRedirection
            },
            meta?.type === 'seasonsType' ? 'seasonsType' :
                [
                    CONTENTTYPE.TYPE_BRAND,
                    CONTENTTYPE.TYPE_TV_SHOWS,
                    CONTENTTYPE.TYPE_SERIES,
                ].includes(meta.contentType)
                    ? 'seriesType'
                    : 'movieType'
        );
    }, [contentType, history, lastWatch, mixpanelData, playHotStarContent, deepLinkContent, playZee5Content, tvodExpiry, playMXPlayerContent,hotstarPopup]);

    return onPlayContent
}
