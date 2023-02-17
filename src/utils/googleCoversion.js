import ENV_CONFIG from '@config/environment/index';
import GOOGLE_CONVERSION from "@utils/constants/googleConversion";
import { LOCALSTORAGE, WEB_SMALL_PAYMENT_SOURCE } from "@constants";
import { getKey } from "@utils/storage";

const googleConversionConfig = {
  trackEvent: function (event, value = {}) {
    let sourceIsMSales = getKey(LOCALSTORAGE.PAYMENT_SOURCE_KEY) === WEB_SMALL_PAYMENT_SOURCE.NON_BINGE;
    if (value && sourceIsMSales && value.hasOwnProperty(GOOGLE_CONVERSION.PARAMETER.SOURCE)) {
        value[GOOGLE_CONVERSION.PARAMETER.SOURCE] = GOOGLE_CONVERSION.VALUE.MSALES;
    }

    window.gtag("event", 'conversion', { 'send_to': `${ENV_CONFIG.GOOGLE_CONVERSION.KEY}/${event}`, ...value }).then(data => {
      console.log(data)
    }).catch(err => {
      console.log(err)
    });
  }
}


export default googleConversionConfig