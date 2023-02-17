import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const ToggleSwitch = (props) => {
    return (
        <span className="toggle-switch">
                {props.labelText && <span className='label-text'>{props.labelText}</span>}
            <span className={props.labelText ? 'float-right' : ''}><label className="switch">
                     <input type="checkbox" checked={props.checked} disabled={props.disabled}
                            name={props.name} id={props.id} onChange={props.onToggleChange}
                            className={props.className}/>
                    <span className="slider round"/>
                </label>
                </span>
            </span>
    )
}
ToggleSwitch.propTypes = {
    labelText: PropTypes.string,
    onToggleChange: PropTypes.func,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
};
export default ToggleSwitch;


