import React from 'react'

import './style.scss';
import PropTypes from "prop-types";
import Heading from "@common/Heading";

const ProgressBar = (props) => {
    let {stepNumberArray, activeStep} = props;
    return (
        <div className={'progress-bar-container'}>
            {
                stepNumberArray && stepNumberArray.map((item, index) => {
                    return <div key={index} className={index === activeStep - 1 ? 'progress-dots active' : 'progress-dots'}/>
                })
            }
        </div>
    );
};

ProgressBar.propTypes = {
    stepNumberArray: PropTypes.array,
    activeStep: PropTypes.number,
};

export default ProgressBar;