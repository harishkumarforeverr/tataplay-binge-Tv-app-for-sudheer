/* eslint-disable react/self-closing-comp */
import { getSystemDetails } from '@utils/browserEnvironment';
import { noop } from '@utils/common'
import React, { useEffect, useState } from 'react'
import "./style.scss"
import PropTypes from "prop-types";
import { BROWSER_TYPE } from '@utils/constants/browser';


export default function EditableContainer({
  maxLength,
  className,
  inputMode,
  inputRef,
  handlePasteValue,
  onChange = noop,
  onBlur = noop,
  onKeyDown = noop,
  onFocus = noop,
  value,
  ...rest
}) {

  const [classMorz, setClassMorz] = useState();
  useEffect(() => {
    const classMoz = browser.browser === BROWSER_TYPE.FIREFOX ? "cursor-moz" : " ";
    setClassMorz(classMoz);
    value ? setClassMorz("") : setClassMorz(classMoz)
  }, [value])

  const handleOnChange = (event) => {
    let value = event.target.innerHTML || '';
    if((value).toString().length === 6 && Number(value)){
      handlePasteValue(value)
      return
    }
    if (value?.length > maxLength) {
      value = value.slice(-1);
      inputRef.current.innerHTML = value;
    }
    onChange(event, value)
  }
  const browser = getSystemDetails();
  /** function to caret/cursor to the end of the editable input on focus */
  const moveCaretAtTheEnd = (event) => {
    if (!inputRef?.current?.innerHTML) {
      onFocus();
      return;
    }
    const range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(inputRef?.current);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    const selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
    onFocus();
  }

  return (
    <div
      className={`editable-container ${className} ${classMorz}`}
      ref={inputRef}
      maxLength={maxLength}
      inputMode={inputMode}
      contentEditable="true"
      tabIndex={"0"}
      onBlur={onBlur}
      onInput={handleOnChange}
      onFocus={moveCaretAtTheEnd}
      onKeyDown={onKeyDown}
      value={value}
      {...rest}
    ></div>
  )
}

EditableContainer.propTypes = {
  getSystemDetails: PropTypes.func,
  handlePasteValue:  PropTypes.func,
}

