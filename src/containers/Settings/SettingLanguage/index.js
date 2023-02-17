import React, { useEffect, useState } from 'react'
import { getLanguageListing } from '../../Languages/APIs/actions'
import SelectLanguage from '../../Languages/SelectLanguage'
import { CATEGORY_NAME, LOCALSTORAGE } from "@constants";
import { getKey } from "@utils/storage";
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import "./style.scss"
import { getVerbiages } from "@utils/common";

export default function SettingSelectLanguage() {
    const dispatch = useDispatch();
    const [state, setState] = useState({ languageHeader: "", languageSubHeader: "" })

    const getLanguageVerbiages = () => {
        let data = getVerbiages(CATEGORY_NAME.LANGUAGE_SETTING);
        setState({
            languageHeader: data?.header || "Content Language",
            languageSubHeader: data?.subHeader || 'Watch content in these preferred languages'
        })
    }

    useEffect(() => {
        let id = getKey(LOCALSTORAGE.ANONYMOUS_ID);
        dispatch(getLanguageListing(id));
        getLanguageVerbiages();
    }, [])

    return (
        <div className='preferred-content-language'>
            <h3 className='content-header'>{state.languageHeader}</h3>
            <p className='content-subtitle'>{state.languageSubHeader}</p>
            <SelectLanguage isChangeSelectedLanguageComponent={true} />
        </div>
    )
}
SettingSelectLanguage.prototype = {
    getLanguageListing: PropTypes.func,
}