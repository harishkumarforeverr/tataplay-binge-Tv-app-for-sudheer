import {ACTION} from './constants';

const initialState = {
    modalParameters: {},
    showModal: false,
    modalName: '',
    showHeader: true,
};

export default function modalReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.OPEN_MODAL:
            return {
                ...state,
                showModal: true,
                modalParameters: action.data.modalParameters,
                modalName: action.data.modalName,
            };
        case ACTION.CLOSE_MODAL:
            return {...state, showModal: false, modalParameters: null, modalName: '', showHeader: true};
        case ACTION.LOGIN_SIGNUP:
            return {...state, login: action.val};
        case ACTION.RESET:
            return {...state, reset: action.val};
        default:
            return state;
    }
}
