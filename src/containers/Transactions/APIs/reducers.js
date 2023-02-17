import {ACTION} from "./constants";
import get from "lodash/get";

let initialState = {
    invoicePDF: {},
};

export default function transactionReducer(state = initialState, action) {
    switch (action.type) {
        case ACTION.FETCH_INVOICEPDF:
            return {
                ...state,
                invoicePDF: get(action, "apiResponse", {}),
            };
        default:
            return state;
    }
}
