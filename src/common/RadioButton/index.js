import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {getLayeredIcon} from '@utils/common';

import './style.scss';

export default class RadioButton extends Component {

    onChange=(e)=>{
        let {handleChange}=this.props;
        if(e.target.value=="false") {
            handleChange(e.target.name, false);
        }
        else if(e.target.value=="true"){
            handleChange(e.target.name, true);
        }
        else {
            handleChange && handleChange(e.target.name, e.target.value);
        }
    };
    render(){

        const {isValueDifferent=false, value, label, keyValue, className, disabled=false, activeLabelClass='', showLabel=true}=this.props;
        return (
            <div className="radio-button" key={keyValue}>
                <input type="radio" name={this.props.name}
                       disabled={disabled}
                       onChange={this.props.chandler ? this.props.chandler: this.onChange}
                       value={value}
                       checked={this.props.checked}
                       className={className} />
                <label>
                    <i className="icon-check" />
                </label>
                {showLabel && <span className={`radio-text ${this.props.checked ? activeLabelClass : '' }`}>{isValueDifferent ? label : value}</span>}
            </div>
        )
    }
}

RadioButton.propTypes = {
    labelText: PropTypes.string,
    checked: PropTypes.bool,
    onChange : PropTypes.func,
    handleChange : PropTypes.func,
    chandler : PropTypes.func,
    name: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    className: PropTypes.string,
    activeLabelClass: PropTypes.string,
    label: PropTypes.string,
    isValueDifferent: PropTypes.bool,
    disabled: PropTypes.bool,
    showLabel: PropTypes.bool,
    keyValue: PropTypes.string,
};


