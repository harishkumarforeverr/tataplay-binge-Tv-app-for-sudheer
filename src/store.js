import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import Reducer from './reducer';

const middleware = [thunk];
let environment = (process.env.NODE_ENV || 'development').toString().trim().toLowerCase();
const isDevelopmentEnvironment = environment !== 'production' && typeof window !== "undefined";
if (isDevelopmentEnvironment) {
    middleware.push(createLogger());
}
const composeEnhancers = isDevelopmentEnvironment ? composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
}) : compose;

let initialState = {};

if (typeof window !== 'undefined') {
    initialState = window.__initial_state__;
}

const store = createStore(Reducer, initialState, composeEnhancers(
    // other store enhancers if any
    // Commented logs for production environment
    applyMiddleware(...middleware),
));

export default store;
