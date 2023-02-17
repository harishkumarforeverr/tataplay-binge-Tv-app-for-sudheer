import get from 'lodash/get';
import {ACTION} from '../APIs/constants';

let initialState = {};

export default function AppInstallPageReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.GET_APP_INSTALL_DETAILS :
            return {...state, appInstallDetails: get(action, 'apiResponse', {})};
        default:
            return state;
    }
}
