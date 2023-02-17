import React , {  useState }from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const ContentSwitch = (props) => {
    return (
        <div className="form-group"  >
                    <div className="form-data toogleContent">
                        <span className={`content-all ${props.value ? 'inactive':'active'}`} >All Content</span>
                    <span className="toggle-switch">
                    <span className={props.labelText ? 'float-right' : ''}><label className="switch">
                            <input type="checkbox" checked={props.value} disabled={props.disabled}
                                name={props.name} id={props.id} onChange={props.onToggleChange}
                                className={props.className}/>
                        <span className="slider round"/>
                    </label>
                    </span>
            </span>
            <span className={`content-free ${props.value ? 'active':'inactive'}`}>Free</span>
                    </div>
                </div>
    )
}
ContentSwitch.propTypes = {
    labelText: PropTypes.string,
    onToggleChange: PropTypes.func,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
};
export default ContentSwitch;
