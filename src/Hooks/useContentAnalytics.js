import mixPanelConfig from '@utils/mixpanel';
import moengageConfig from '@utils/moengage';
import MIXPANEL from '@constants/mixpanel';
import { getAnalyticsData, getCommonAnalyticsAttributes } from "@containers/PIDetail/PIDetailCommon";
import { useLocation } from 'react-router-dom';


export default function useContentAnalytics() {
    const location = useLocation();
    let state = {
        mixpanelData: {
            railTitle: location?.state?.railTitle,
            source: location?.state?.source,
            origin: location?.state?.prevPath,
            railPosition: location?.state?.railPosition,
            conPosition: location?.state?.conPosition,
            sectionSource: location?.state?.sectionSource,
            configType: location?.state?.configType,
            sectionType: location?.state?.sectionType,
            contentSectionSource: location?.state?.contentSectionSource,
        },
    }

    const trackMixPanelEvent = (props, eventName) => {
        const data = getCommonAnalyticsAttributes(eventName, props, state);
        mixPanelConfig.trackEvent(eventName, data.mixpanelData);
    };

    const trackMongageEvent = (props, eventName) => {
        const data = getCommonAnalyticsAttributes(eventName, props, state);
        moengageConfig.trackEvent(eventName, data.moengageData);
    };

    return {
        trackMixPanelEvent,
        trackMongageEvent,
    };
}
