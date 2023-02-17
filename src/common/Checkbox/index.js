import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const Checkbox = (props) => {
    return (
        <div className="checkbox" id={props.id}>
            {props.leftLabelText && <span className="checkbox-text left">{props.leftLabelText}</span>}
            <input type="checkbox" checked={props.checked} disabled={props.disabled}
                   name={props.name} id={props.id} onChange={props.chandler} className={props.className}/>
            <label className={`${props.termsAndConditionsChecked || props.checked ? 'checked' : 'unchecked'} ${props.leftLabelText ? 'right' : ''}`}>
                <i className="icon-check"/>
            </label>
            {props.rightLabelText && <span className="checkbox-text right">{props.rightLabelText}</span>}
        </div>
    )
}
Checkbox.propTypes = {
    leftLabelText: PropTypes.string,
    rightLabelText: PropTypes.string,
    chandler: PropTypes.func,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    className: PropTypes.string,
    id: PropTypes.string,
    termsAndConditionsChecked: PropTypes.bool,
}

export default Checkbox;

