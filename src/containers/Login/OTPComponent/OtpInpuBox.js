import React, { useRef, useLayoutEffect, useEffect } from "react";
import usePrevious from "../../../Hooks/usePrevious";
import PropTypes from "prop-types";
import { LENGTH_CHECK } from "@utils/constants";
import EditableContainer from "@common/EditableContainer";

function OtpInpuBox(props) {
  const { focus, autoFocus, value, otpValue,handlePasteValue, ...rest } = props;

  const inputRef = useRef();
  const prevFocus = usePrevious(!!focus);
 
  useLayoutEffect(() => {
    if (inputRef.current) {
      if (focus && autoFocus) {
        inputRef.current.focus();
      }
      if (focus && autoFocus && focus !== prevFocus) {
        inputRef.current.focus();
      }
    }
  }, [autoFocus, focus, prevFocus]);

  useEffect(()=>{
    const currentValue = inputRef?.current?.innerHTML;
    if(currentValue !== value){
      inputRef.current.innerHTML = value;
    }
  },[value])

  useEffect(()=>{
    if (otpValue.length === LENGTH_CHECK.OTP) {
      inputRef.current.blur();
    }
  },[otpValue])

  return <EditableContainer handlePasteValue={handlePasteValue} inputRef={inputRef} inputMode={"decimal"} {...rest} value={value} />
  // return <input ref={inputRef} {...rest} />;
}

export default OtpInpuBox;

OtpInpuBox.propTypes = {
  focus: PropTypes.bool,
  autoFocus: PropTypes.bool,
  handlePasteValue: PropTypes.func
};
