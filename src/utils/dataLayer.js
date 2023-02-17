import { getSidValue } from "./common";
import DATALAYER from '@utils/constants/dataLayer.js';
import { LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { getKey } from "@utils/storage";

const dataLayerConfig = {
    trackEvent: function (event, properties = {}) {
        let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
        if (properties && sourceIsMSales && properties.hasOwnProperty(DATALAYER.PARAMETER.SOURCE)) {
            properties[DATALAYER.PARAMETER.SOURCE] = DATALAYER.VALUE.MSALES;
        }

        window.dataLayer.push({
            event: event, ...properties,
            ...getSidValue()
        })
    }
}


export default dataLayerConfig