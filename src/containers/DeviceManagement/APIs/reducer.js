import get from 'lodash/get'
import { ACTION } from './constants'

export default function deviceManagement(state = {}, action) {
    switch (action.type) {
        case ACTION.GET_SUBSCRIBER_DEVICE_LIST:
            return { ...state, subscriberDeviceList: get(action, 'apiResponse') };
        //return {...state, subscriberDeviceList: subscriberDeviceListItem};
        case ACTION.DELETE_SUBSCRIBER_DEVICE:
            return { ...state, deletedSubscriberIdResponse: get(action, 'apiResponse') };

        default:
            return state;
    }
}
