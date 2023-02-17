import React, { useEffect, useRef } from 'react';

export const RedirectionForm = props => {
    const { accessToken, url, isLoginForm , checksum , cartId } = props;
    const formRef = useRef();
    const loginFormRef = useRef();

    useEffect(() => {
        if (!!isLoginForm) {
            typeof loginFormRef.current.submit === 'function' &&  loginFormRef.current && loginFormRef?.current?.submit();
        } else {
            typeof formRef.current.submit === 'function' && formRef?.current?.submit();
        }
    }, [])

    if (!!isLoginForm) {
        return (
            <form ref={loginFormRef} id="testForm" method="post" action={url} style={{display:'none'}}>
                <input type="text" name="refreshToken" value={accessToken}/>
                <input type="text" name="checksum" value={checksum}/>
                <input type="text" name="cartId" value={cartId}/>
                <button type="submit">Submit</button>
            </form>
        )
    } else {
        return (
            <form ref={formRef} id="testForm" method="post" action={url} style={{display:'none'}}>
                <input type="text" name="accessToken" value={accessToken}/>
                <button type="submit">Submit</button>
            </form>
        )   
    }
}

export default RedirectionForm;