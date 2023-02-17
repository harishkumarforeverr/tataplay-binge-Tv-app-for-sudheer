import React, { useEffect } from 'react';
import Accordion from '../Accordion';
import MIXPANEL from "@constants/mixpanel";
import mixPanelConfig from "@utils/mixpanel";


const Faq = (props) => {

    // useEffect(()=>{
    //     mixPanelConfig.trackEvent(MIXPANEL.EVENT.FAQ_VIEW);
    // },[])

    return (
        <>
            <Accordion {...props} />
        </>
    )
}

export default Faq;