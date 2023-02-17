import {ACTION, MODALS} from './constants';

export const openErrorPopup = (errorMessage, primaryButtonText,onPrimaryButtonClick) => dispatch => {
    dispatch(
        openPopup(MODALS.ALERT_MODAL, {
            headingMessage: 'Error Message',
            modalClass: 'alert-modal error-alert',
            instructions: errorMessage || "Content not found",
            primaryButtonText: primaryButtonText || 'Ok',
            primaryButtonAction: () => {
                dispatch(closePopup());
                onPrimaryButtonClick && onPrimaryButtonClick()
            },
            closeModal: true,
            hideCloseIcon: true,
            errorIcon: 'icon-alert-upd',
        })
    )
}

export const openPopup = (modalName, modalParameters) => {
    return {type: ACTION.OPEN_MODAL, data: {modalName, modalParameters}}
};

export const closePopup = () => {
    return {type: ACTION.CLOSE_MODAL}
};

export const loginSignUp = (val = true) => {
    return {type: ACTION.LOGIN_SIGNUP, val}
};

export const resetInput = (val) => {
    return {type: ACTION.RESET, val}
}



