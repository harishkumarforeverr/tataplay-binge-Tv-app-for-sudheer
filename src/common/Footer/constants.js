import {URL} from "@constants/routeConstants";
import {SIDE_MENU_HEADERS} from "@components/Header/APIs/constants";

export const FOOTER_ITEMS = [
    {
        'name': 'goVIP',
        'displayName': SIDE_MENU_HEADERS.SUBSCRIBE,
        'linkToRedirect': `${URL.SUBSCRIPTION}`,//'Compare plan go vip screen'
        accessBeforeLogin: false,
    },
    {
        'name': 'privacyPolicy',
        'displayName': 'Privacy Policy',
        'linkToRedirect': `${URL.PRIVACY_POLICY}`,
        accessBeforeLogin: true,
    },
    {
        'name': 'termsAndConditions',
        'displayName': 'Terms And Conditions',
        'linkToRedirect': `${URL.TERMS_AND_CONDITIONS}`,
        accessBeforeLogin: true,
    },
    {
        'name': 'helpAndSupport',
        'displayName': 'Help and Support',
        'linkToRedirect': `${URL.HELP_CENTER}`,
        accessBeforeLogin: true,
    },
    {
        'name': 'tataSkyUrl',
        'displayName': 'www.tataplay.com',
        'redirectionUrl': 'https://www.tatasky.com',
        accessBeforeLogin: true,
    },
];

export const CONTACT_US_ITEMS = [
    {
        'name': 'faqs',
        'displayName': 'FAQs',
        'leftIcon': 'icon-faq',
    },
];