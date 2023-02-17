import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from "prop-types";

import { MODALS } from './constants';
import { closePopup, loginSignUp, resetInput } from './action';
import AlertModal from "@common/Modal/components/AlertModal";

import { get } from 'lodash';
import './style.scss'
import { loginPopupState } from "@components/Header/APIs/actions";
import { scrollToTop } from "@utils/common";
import CustomModal from "@common/Modal/components/CustomModal";
import ChangeTenureModal from '@containers/Subscription/ChangeTenureModal';
import CommentModal from "@common/Modal/components/CommentModal";
import BackgroundImage from "@assets/images/tick-tick-drawer.png";
class Modal extends Component {
    constructor(props) {
        super(props);
        this.state = {}
        if (typeof document != "undefined" && this.props.modal.showModal === true) {
            document.body.style.overflowY = 'scroll';
            document.body.style.width = '100%';
            document.body.style.position = 'fixed';
        }
    }

    componentWillUnmount() {
        document.body.style.overflowY = 'unset';
        document.body.style['-ms-overflow-style'] = 'unset'
        document.body.style.width = '';
        document.body.style.position = 'initial';
        scrollToTop();
    }

    showModalContent = () => {
        const { modal: { modalName, modalParameters } } = this.props;

        if (modalName) {
            switch (modalName) {
                case MODALS.ALERT_MODAL:
                    return (
                        <AlertModal {...modalParameters} />
                    );
                case MODALS.CUSTOM_MODAL:
                    return (
                        <CustomModal {...modalParameters} />
                    )
                case MODALS.SUBSCRIPTION_CHANGE_TENURE:
                    return (
                        <ChangeTenureModal {...modalParameters} />
                    )
                case MODALS.COMMENT_MODAL:
                    return (
                        <CommentModal {...modalParameters} />
                    )
            }
        }
    };

    closeModal = () => {
        const { modal: { modalParameters }, closePopup } = this.props;
        this.props.loginPopupState(true);
        this.props.loginSignUp(true);
        this.props.resetInput(true);
        modalParameters && modalParameters.onCloseAction && modalParameters.onCloseAction()
        closePopup();
    };
    render = () => {
        const { modal: { modalParameters }, backgroundImage } = this.props;
        const gradiantBG = modalParameters?.modalClass.indexOf("gradiant-bg") > -1;
        const content = this.showModalContent();
        const isTickTick = modalParameters.modalClass.includes('selection-drawer')
        return (
            <div className={modalParameters && modalParameters.modalClass ? modalParameters.modalClass : ''}>
                <div className='popupOuter'>

                    <div className='popupSec'>
                        {gradiantBG && <div className='bg-wrapper' />}
                        {isTickTick && <div className="tick-tick-background-img"><img src={BackgroundImage} alt="" /></div>}
                        <div>
                            {modalParameters && modalParameters.heading && <div className="modal-header">
                                <h3>{modalParameters.heading}</h3>
                            </div>}
                            {modalParameters && !modalParameters.hideCloseIcon &&
                                <span onClick={() => this.closeModal()}><i className="icon-close" /></span>}
                            {content}
                        </div>
                    </div>
                </div>
                <div className='popup_overlay black_overlay' />

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    modal: state.modal,
    backgroundImage: get(state.headerDetails, "configResponse.data.config.FreemiumBackgroundPoster.web.otherPackPoster"),
});

const mapDispatchToProps = (dispatch) => ({
    ...bindActionCreators({
        closePopup,
        loginPopupState,
        loginSignUp,
        resetInput,
    }, dispatch),
});

Modal.propTypes = {
    modalState: PropTypes.object,
    modalName: PropTypes.string,
    closePopup: PropTypes.func,
    loginPopupState: PropTypes.func,
    loginSignUp: PropTypes.func,
    resetInput: PropTypes.func,
    modal: PropTypes.object,
};

const ModalContainer = connect(mapStateToProps, mapDispatchToProps)(Modal);

export default ModalContainer;
