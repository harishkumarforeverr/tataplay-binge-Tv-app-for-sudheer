import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const Button = (props) => {
    return (
        !props.isButtonTagging ? <button disabled={props.disabled} className={props.cName} onClick={props.clickHandler}
                                         type={props.bType} style={props.style}>
                {props.bIcon && <span className='button-icon'>{props.bIcon}</span>}
                <span className='button-text' dangerouslySetInnerHTML={{ __html: props.bValue}}/>
            </button> :
            <div disabled={props.disabled} className={'button-tag ga-login' + props.cName} onClick={props.clickHandler}
                 type={props.bType}>{props.bValue}</div>
    )
};
Button.propTypes = {
    cName: PropTypes.string,
    bType: PropTypes.string,
    bIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    bValue: PropTypes.string,
    disabled: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    clickHandler: PropTypes.func,
    isButtonTagging: PropTypes.bool,
    style: PropTypes.object,
};

export default Button;

