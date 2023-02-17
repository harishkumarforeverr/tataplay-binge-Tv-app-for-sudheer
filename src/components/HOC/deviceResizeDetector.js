import React, {Component} from 'react';
import PropTypes from "prop-types";

import {URL} from "@constants/routeConstants";
import {isMobile, safeNavigation} from "@utils/common";


export default function (ComposedComponent) {
    class DeviceResizeDetector extends Component {

        componentDidMount() {
            this.handleResizing();
            window.addEventListener('resize', this.handleResizing);
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.handleResizing);
        }

        handleResizing = () => {
            let {history, location: {pathname}} = this.props;
            const urlArr = pathname.split('/');
            if(!isMobile.any() && urlArr.includes(URL.MY_ACCOUNT)){
                safeNavigation(history, URL.DEFAULT)
            }
        };

        render() {
            return (
                <div>
                    <ComposedComponent {...this.props} />
                </div>
            );
        }
    }

    DeviceResizeDetector.propTypes = {
        history: PropTypes.object,
        location: PropTypes.object,
    };

    return (DeviceResizeDetector);
}
