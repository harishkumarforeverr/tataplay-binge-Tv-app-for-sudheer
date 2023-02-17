import FIREBASE from "@utils/constants/firebase";
import trackEventsConfig from "@utils/firebaseAndFacebook";
import { rmnMaskingFunction } from "@containers/BingeLogin/bingeLoginCommon";

let trackEvent = {
    loginEnter(value) {
        const payload = {
            [FIREBASE.PARAMETER.SOURCE]: value,
        }
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.LOGIN_ENTER, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.LOGIN_ENTER, payload);
    },

    loginOTPInvoke(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.LOGIN_OTP_INVOKE, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.LOGIN_OTP_INVOKE, payload)
    },

    loginOtpResent() {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.LOGIN_OTP_RESEND);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.LOGIN_OTP_RESEND)
    },

    loginOtpEnter() {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.LOGIN_OTP_ENTER);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.LOGIN_OTP_ENTER)
    },

    loginSuccess(value) {
        const payload = {
            [FIREBASE.PARAMETER.TYPE]: FIREBASE.VALUE.RMN,
            [FIREBASE.PARAMETER.AUTH]: FIREBASE.VALUE.OTP,
            [FIREBASE.PARAMETER.VALUE]: rmnMaskingFunction(value.rmn)
        }
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.LOGIN_SUCCESS, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.LOGIN_SUCCESS, payload)
    },

    loginFail(value) {
        const payload = {
            [FIREBASE.PARAMETER.TYPE]: FIREBASE.VALUE.RMN,
            [FIREBASE.PARAMETER.AUTH]: FIREBASE.VALUE.OTP,
            [FIREBASE.PARAMETER.VALUE]: rmnMaskingFunction(value?.rmn),
            [FIREBASE.PARAMETER.REASON]: value?.loginErrorMessage
        }
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.LOGIN_FAILED, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.LOGIN_FAILED, payload)
    },

    completeRegistration() {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.COMPLETE_REGISTRATION);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.COMPLETE_REGISTRATION);
    },

    signUpEvent(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.SIGN_UP, payload);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.SIGN_UP, payload);

    },

    packSelectionInitiate(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.PACK_SELECTION_INITIATE, payload);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.PACK_SELECTION_INITIATE, payload);
    },

    packSelected(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.PACK_SELECTED, payload);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.PACK_SELECTED, payload);

    },

    subscriptionSuccess(payload) {
        const data = {
            [FIREBASE.PARAMETER.CURRENCY]: FIREBASE.VALUE.CURRENCY,
            'value': payload[FIREBASE.PARAMETER.PACK_PRICE]
        };

        let purchasePayload = {...payload, ...data};

        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.SUBSCRIBE_SUCCESS, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.SUBSCRIBE_SUCCESS, payload);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.PURCHASE, purchasePayload);
    },

    subscriptionFailed(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.SUBSCRIBE_FAILED, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.SUBSCRIBE_FAILED, payload);
    },

    subscriptionSuccessNew(payload) {
        const data = {
            [FIREBASE.PARAMETER.CURRENCY]: FIREBASE.VALUE.CURRENCY,
            'value': payload?.[FIREBASE.PARAMETER.PACK_PRICE]
        };

        let purchasePayload = {...payload, ...data};

        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.PURCHASE, purchasePayload);
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.SUBSCRIBE_SUCCESS_NEW, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.SUBSCRIBE_SUCCESS_NEW, payload);
    },

    subscriptionSuccessModifyPack(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.SUBSCRIBE_SUCCESS_MODIFY_PACK, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.SUBSCRIBE_SUCCESS_MODIFY_PACK, payload);
    },

    subscriptionSuccessRepeat(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.SUBSCRIBE_SUCCESS_REPEAT, payload);
        trackEventsConfig.trackFacebookEvent('trackCustom', FIREBASE.EVENT.SUBSCRIBE_SUCCESS_REPEAT, payload);

    },

    playContentPremiumSeventyPrecent(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.PLAY_CONTENT_PREMIUM_VTR75, payload);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.PLAY_CONTENT_PREMIUM_VTR75, payload);
    },

    playContentPremiumFiftyPrecent(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.PLAY_CONTENT_PREMIUM_VTR50, payload);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.PLAY_CONTENT_PREMIUM_VTR50, payload);
    },

    playPremiumContent(payload) {
        trackEventsConfig.trackFirebaseEvent(FIREBASE.EVENT.PLAY_CONTENT_PREMIUM, payload);
        trackEventsConfig.trackFacebookEvent('track', FIREBASE.EVENT.PLAY_CONTENT_PREMIUM, payload);
    }
}

export default trackEvent;