import { closePopup, openPopup } from '@common/Modal/action';
import { MODALS } from '@common/Modal/constants';
import { safeNavigation } from '@utils/common';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom';

export default function ErrorPopup({message, onPrimaryButtonClick, primaryButtonText}) {
    const dispatch = useDispatch();
    const history = useHistory();
    useEffect(()=>{
        dispatch(
            openPopup(MODALS.ALERT_MODAL, {
                headingMessage: 'Error Message',
                modalClass: 'alert-modal error-alert',
                instructions: message || "Content not found",
                primaryButtonText: primaryButtonText || 'Ok',
                primaryButtonAction: () => {
                    dispatch(closePopup());
                    onPrimaryButtonClick ?
                        onPrimaryButtonClick() :
                        safeNavigation(history, "/");
                },
                closeModal: true,
                hideCloseIcon: true,
                errorIcon: 'icon-alert-upd',
            })
        )
    },[dispatch])
  return null
}
