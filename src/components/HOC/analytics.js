import useAppsFlyer from '@src/Hooks/useAppsFlyer';
import useLoginDeeplinkHandler from '@src/Hooks/useLoginDeeplinkHandler';
import useMixpanel from '@src/Hooks/useMixpanel';
import React from 'react';

export default function Analytics(Component) {
  return function WrappedComponent(props) {
    const distinctId = useMixpanel();
    useAppsFlyer(distinctId);
    useLoginDeeplinkHandler()
    return <Component {...props} />;
  };
}
