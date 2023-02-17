import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux';
import PropTypes from 'prop-types';

import Main from '@containers/Main/index';
import bootstrap from '@config/bootup';
import {getDeviceId} from "@utils/common";
import ScrollIntoView from "@components/ScrollIntoView";
import Loader from '@common/Loader/index.js';
import SubscriptionPaymentHandlerWrapper from '@containers/SubscriptionPayment/SubscriptionPaymentHandler/SubscriptionPaymentHandlerWrapper.jsx';

import './assets/scss/base.scss';
import store from './store';

bootstrap();
getDeviceId();

if (!global._babelPolyfill) {
    require('babel-polyfill');
}
const Root = ({store}) => (
    <Provider store={store}>
        <BrowserRouter>
            <ScrollIntoView>
                <>
                    <Loader alwaysVisible={false} />
                    <SubscriptionPaymentHandlerWrapper/>
                    <Main/>
                </>
            </ScrollIntoView>
        </BrowserRouter>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object,
};
render(<Root store={store}/>, document.getElementById('app'));

