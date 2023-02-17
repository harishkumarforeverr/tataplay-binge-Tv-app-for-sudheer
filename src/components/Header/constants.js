import {URL} from "@constants/routeConstants";

export const MESSAGES = {
    SIGN_OUT: {
        HEADING: 'Sign Out',
        INSTRUCTIONS: 'Are you sure that you want to sign out?',
        PRIMARY_BTN_TEXT: 'Yes',
        SECONDARY_BTN_TEXT: 'No',
    },
};

export const VIEW = {
    WEB_SMALL: 'web-small',
};

export const ACTION_BTN_NAME = {
    RENEW: 'Renew',
    RECHARGE: 'Recharge',
    GET_A_PLAN :'Get a Plan',
    ENTER: 'Enter',
};

export const BOTTOM_CONTACT_LIST = [
    {
        'name': 'termsAndConditions',
        'displayName': 'Terms & Conditions',
        'reDirectTo': `/${URL.TERMS_AND_CONDITIONS}`,
        'showDot': false,
    },
    {
        'name': 'privacyPolicy',
        'displayName': 'Privacy Policy',
        'reDirectTo': `/${URL.PRIVACY_POLICY}`,
        'showDot': true,
    },
];

export const SUGGESTOR = {
    GENRE_SUGGESTOR: 'GenreSuggestor',
    KEYWORD_SUGGESTOR: 'KeywordSuggestor',
    LANGUAGE_SUGGESTOR: 'LanguageSuggestor',
    PROVIDER_SUGGESTOR: 'ProviderSuggestor',
    TITLE_SUGGESTOR: 'TitleSuggestor',
};
