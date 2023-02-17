import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const NoDataAvailable = (props) => {
    const {text} = props;
    return (
        <div className="no-data"><p>{text}</p></div>
    )
}

NoDataAvailable.propTypes = {
    text: PropTypes.string,
}
NoDataAvailable.defaultProps = {
    text: 'No Data Available!',
}

export default NoDataAvailable;

