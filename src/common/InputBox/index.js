import React, {Component} from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';

import {addClass, removeClass} from '@utils/common';
import './style.scss'

export default class InputBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            keys: {},
            isShow: false,
            type: 'password',
        }
        this.inputRef = React.createRef();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.state, nextState) || !isEqual(pickBy(nextProps, val => typeof val !== 'function'), pickBy(this.props, val => typeof val !== 'function'))
    }

    validateFloat = (value) => {
        let {decimalPoints} = this.props,
            decimalArr = value.split('.'),
            afterDecimal = value.split('.')[1],
            beforeDecimal = value.split('.')[0];
        if (decimalArr.length - 1 > 1) {
            return decimalArr.slice(0, 2).join('.')
        } else if (afterDecimal && afterDecimal.length > decimalPoints) {
            return beforeDecimal + '.' + afterDecimal.substr(0, decimalPoints)
        } else {
            return value
        }

    }

    onChange = (event) => {
        if (!event.isTrusted) return;
        let {
            name, onChange, isNumeric, isAlpha, isAlphaNumeric, isDate, isFloat, isName,
            isNumericWithZero, isFloatNotNegative, calendar = false, value: previousValue, removeSpaces,
        } = this.props;
        isNumeric ? event.target.value = event.target.value.replace(/^0|\D/g,''): false;
        isNumericWithZero ? event.target.value = event.target.value.replace(/\D/g, '') : false;
        isName ? event.target.value = event.target.value.replace(/^\s|\s{2}/g, '') : false;
        isFloat ? event.target.value = this.validateFloat(event.target.value) : false;
        if (isFloatNotNegative) {
            event.target.value = event.target.value.replace(/[^.0-9]/g, "");
            event.target.value = this.validateFloat(event.target.value)
        }
        isDate ? event.target.value = event.target.value.replace(/[^0-9/]/g, '') : false;
        isAlpha ? event.target.value = event.target.value.replace(/[^a-zA-Z ]/g, '') : false;
        isAlphaNumeric ? event.target.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '') : false;
        removeSpaces ? event.target.value = event.target.value.replace(/\s/g,'') : false;
        let {value} = event.target,
            element = document.getElementsByName(name)[0];
        value ? addClass(element, 'active') : removeClass(element, 'active');
        if (calendar) {
            onChange && value !== previousValue && onChange(name, value, this.state.keys);
        } else {
            onChange && onChange(name, value);
        }
    };

    handleBlur = (event) => {
        let {onBlur, name} = this.props, {value} = event.target;
        onBlur && onBlur(name, value);
        // value === '' && required ? addClass(event.target, 'error') : false;
    };

    clickHandler = (event) => {
        event.stopPropagation();
        let {onClick, name} = this.props, {value} = event.target;
        onClick && onClick(name, value);
        //value == '' && required ? addClass(event.target, 'error') : false;
    };

    onKeyPress = (event) => {
        const {ctrlKey, metaKey, charCode, keyCode} = event;
        this.setState({
            keys: {
                ctrlKey,
                metaKey,
                charCode,
                keyCode,
            },
        })
    }

    showHint = () => {
        this.setState({
            isShow: !this.state.isShow,
        })
    }

    showPassword = () => this.setState(({type}) => ({
        type: type === 'text' ? 'password' : 'text',
    }))

    render() {
        let {
            name, value = '', errorMessage, required = false, autoFocus = false, onKeyPress, optional = false, labelName,
            inputType = "text", iconName, disableField = false,
            isNumeric, isAlpha, isAlphaNumeric, placeholder, maxValue = "", maxLength = "255", blurChange, parentClass,
            prefillText, onBlur, clickHandler, minLength = "", onChange, InputId, convertNumberToString,
            showPasswordHint = false, initialVal, onFocusHandler, initialValIcon,removeSpaces = false, ...other
        } = this.props;
        let {isShow, type} = this.state;
        if (errorMessage) {
            // const bodyRect = document.body.getBoundingClientRect();
            // const elemRect = this.inputRef.current.getBoundingClientRect();
            // const offset   = elemRect.top - bodyRect.top;
            // window.scrollTo(0, Math.abs(elemRect.top))
            // this.inputRef.current.focus()
        }
        const showText = isShow ? 'show-text' : '';
        return (
            <div className={parentClass ? parentClass + ' form-data input-search' : 'form-data input-search'}>
                {labelName && <label>{labelName}{required && <span className="req-field">*</span>}
                    {optional && <span className="optional-text">(Optional)</span>}</label>}
                    <div>
                {initialVal && <span className='initialVal'>{initialVal}</span>}
                {initialValIcon && <span className='initialVal'><i className={initialValIcon}/></span>}
                <input {...other} type={inputType === 'password' ? type : inputType} autoFocus={autoFocus} name={name}
                         onKeyPress={onKeyPress}
                         ref={this.inputRef}
                         onKeyUp={this.onKeyPress}
                         value={value} placeholder={placeholder}
                         disabled={disableField} max={maxValue}
                         maxLength={maxLength}
                         minLength={minLength}
                         className={`${value && value.length > 0 ? errorMessage && (errorMessage.length > 0
                             || errorMessage === 'empty input') ? `active error ${showText}` : `active ${showText}` : ''
                         }${initialVal ? `initial-val-input` : null}`}
                         onBlur={this.handleBlur}
                         onChange={this.onChange}
                         onFocus={onFocusHandler}
                         onClick={this.clickHandler} autoComplete="Off"/>
                    </div>
                {(!labelName && required) &&
                <span className='asterick'><span className="req-field">*</span></span>}
                {errorMessage && errorMessage !== 'empty input' &&
                <span className='error-message'>{errorMessage}</span>}

                {parentClass && prefillText && <span className="text">{prefillText}</span>}

                {value && showPasswordHint && <div className="show-hint" onClick={this.showHint}>
                    <i className={isShow ? "icon-hide" : "icon-show"}/>
                </div>
                }
                {inputType === 'password' && value &&
                <div className="show-password">
                    <i className={type === 'text' ? 'icon-visibility_off' : 'icon-visibility_on'}
                       onClick={this.showPassword}
                       style={{color: `${value ? '#ffffff' : '#a3a6c2'}`}}/>
                </div>
                }

            </div>
        )
    }
}

InputBox.propTypes = {
    minLength: PropTypes.number,
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    blurChange: PropTypes.func,
    onClick: PropTypes.func,
    clickHandler: PropTypes.func,
    errorMessage: PropTypes.string,
    parentClass: PropTypes.string,
    prefillText: PropTypes.string,
    InputType: PropTypes.string,
    labelName: PropTypes.string,
    iconName: PropTypes.string,
    isNumeric: PropTypes.bool,
    isAlpha: PropTypes.bool,
    isDate: PropTypes.bool,
    required: PropTypes.bool,
    disableField: PropTypes.bool,
    autoFocus: PropTypes.bool,
    optional: PropTypes.bool,
    placeholder: PropTypes.string,
    maxValue: PropTypes.string,
    maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    decimalPoints: PropTypes.number,
    isAlphaNumeric: PropTypes.bool,
    isName: PropTypes.bool,
    showPasswordHint: PropTypes.bool,
    isFloat: PropTypes.bool,
    isFloatNotNegative: PropTypes.bool,
    calendar: PropTypes.string,
    isNumericWithZero: PropTypes.bool,
    onKeyPress: PropTypes.func,
    inputType: PropTypes.string,
    minlength: PropTypes.number,
    InputId: PropTypes.number,
    convertNumberToString: PropTypes.func,
    onBlur: PropTypes.func,
    onFocusHandler: PropTypes.func,
    initialVal: PropTypes.string,
    initialValIcon: PropTypes.string,
    removeSpaces: PropTypes.bool,
}

