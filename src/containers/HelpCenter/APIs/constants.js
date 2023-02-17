export const ACTION = {
  GET_FAQ_LIST: "GET_FAQ_LIST",
  GET_HELP_VIDEO: "GET_HELP_VIDEO",
  GET_CATEGORY_LIST: "GET_CATEGORY_LIST",
  GET_SEARCH_RESULT: "GET_SEARCH_RESULT",
  GET_SEARCH_AUTO_COMPLETE: "GET_SEARCH_AUTO_COMPLETE",
  GET_CATEGORY_DEATILS: "GET_CATEGORY_DEATILS",
  CLEAR_CATEGORY_DEATILS: "CLEAR_CATEGORY_DEATILS",
  HC_VIEW_MORE_DATA: "HC_VIEW_MORE_DATA",
  HC_SEE_ALL_DATA: "HC_SEE_ALL_DATA",
  CLEAR_HC_SEE_ALL_DATA: "CLEAR_HC_SEE_ALL_DATA",
  RESET_HC_SEE_ALL_DATA:"RESET_HC_SEE_ALL_DATA",
  CLEAR_SEARCH_AUTO_COMPLETE: "CLEAR_SEARCH_AUTO_COMPLETE",
  HC_SEARCH_DETAIL_VIEW_MORE: "HC_SEARCH_DETAIL_VIEW_MORE",
  GET_OUTAGE_BANNER_DATA: "GET_OUTAGE_BANNER_DATA",
  VALIDATE_HELP_CENTER_TOKEN: "VALIDATE_HELP_CENTER_TOKEN",
  HC_POPULARITY_TRACK: "HC_POPULARITY_TRACK",
  HC_GET_CHAT_NOW_URL: "HC_GET_CHAT_NOW_URL",
  HC_TICKET: "HC_TICKET",
  HC_TICKETDETAILS: "HC_TICKETDETAILS",
  RENDER_HC_VIEW: "RENDER_HC_VIEW",
  HC_REOPEN_TICKET:"HC_REOPEN_TICKET",
  CLEAR_HC_TICKET:"CLEAR_HC_TICKET",
  SET_DEEPLINK_FLAG: "SET_DEEPLINK_FLAG",
};

export const TRENDING_TYPE = {
  FAQ: "faq",
  HELP_VIDEO: "help_video",
};

export const CATEGORY_LIST = [
  {
    name: "Default-icon",
    leftIcon: "icon-Partner-apps",
    isLayeredIcon: false,
  },
  // {
  //     'name': 'Category-1',
  //     'leftIcon': 'icon-Platform-support',
  //     'isLayeredIcon': false
  // },
  // {
  //     'name': 'Category-12',
  //     'leftIcon': 'icon-Billing-plans',
  //     'isLayeredIcon': false
  // },
  {
  name: "Account and Profile",
    leftIcon: "icon-bingeHelp-Account-and-Profile",
    isLayeredIcon: false,
  },
  {
    name: "Plans & Payment",
    leftIcon: "icon-bingehelp-plans-and-payment",
    isLayeredIcon: false,
  },
  {
    name: "Platform Support",
    leftIcon: "icon-Platform-support",
    isLayeredIcon: false,
  },
  {
    name:"Content and Viewing",
    leftIcon: "icon-bingehelp-content-and-viewing",
    isLayeredIcon: false,
  },
  {
    name: "Troubleshooting",
    leftIcon: "icon-bingehelp-troubleshooting",
    isLayeredIcon: false,
  },
  {
    name: "Getting Started",
    leftIcon: "icon-bingehelp-getting-started",
    isLayeredIcon: false,
  },
  {
    name: "Referrals Related",
    leftIcon: "icon-Referrals",
    isLayeredIcon: false,
  },
  {
    name: "Consumer Corner – T&C",
    leftIcon: "icon-Terms-and-conditions",
    isLayeredIcon: false,
  },
  {
    name: "Videos",
    leftIcon: "icon-video-icon",
    isLayeredIcon: false,
  },   
];

//Dummy data
export const CATEGORY_SCREEN_DATA = {
  data: {
    faqs: {
      title: "Dummy-faqs",
      rail: [
        {
          label: "Reacharge",
          value: "recharge",
          id: "1pSPZAGO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
          title: "first-question",
        },
        {
          label: "Login",
          value: "recharge",
          id: "x7AurjpZGA",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
          title: "first-question",
        },
        {
          label: "Subsciption Details",
          value: "recharge",
          id: "1pSPZGeO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
          title: "first-question",
        },
        {
          label: "Hotstar",
          value: "recharge",
          id: "1pSZAGeO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
          title: "first-question",
        },
        {
          label: "Billing",
          value: "recharge",
          id: "1pSPZeO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
          title: "first-question",
        },
      ],
    },
    subCategories: [
      {
        title: "Dummy-faqs",
        rail: [
          {
            label: "Reacharge",
            value: "recharge",
            id: "1pSPZAGeOdd3w",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Login",
            value: "recharge",
            id: "x7AurjpuZsaaGA",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Subsciption Details",
            value: "recharge",
            id: "O3w",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Hotstar",
            value: "recharge",
            id: "1pSPZAGeO3w",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Billing",
            value: "recharge",
            id: "9d9",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
        ],
      },
      {
        title: "Dummy-faqs",
        rail: [
          {
            label: "Reacharge",
            value: "recharge",
            id: "ccd",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Login",
            value: "recharge",
            id: "dhdh",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Subsciption Details",
            value: "recharge",
            id: "ddkjdjdj",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Hotstar",
            value: "recharge",
            id: "99djdjdjd",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
          {
            label: "Billing",
            value: "recharge",
            id: "djdjd",
            duration: "2.45m",
            question: "Which OTT Apps are available on Binge App?",
            title: "first-question",
          },
        ],
      },
    ],
    helpVideos: {
      title: "FIRST_RAIL",
      rail: [
        {
          label: "Reacharge",
          value: "recharge",
          id: "1pSPZAGeO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
        },
        {
          label: "Login",
          value: "recharge",
          id: "x7AurjpuZGA",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
        },
        {
          label: "Subsciption Details",
          value: "recharge",
          id: "1pSPZAGeO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
        },
        {
          label: "Hotstar",
          value: "recharge",
          id: "1pSPZAGeO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
        },
        {
          label: "Billing",
          value: "recharge",
          id: "1pSPZAGeO3w",
          duration: "2.45m",
          question: "Which OTT Apps are available on Binge App?",
        },
      ],
    },
  },
};

export const OFFSET_DEFAULT_VALUE = 0;
export const ACCORDION_DEFAULT_LIMIT = 3;
export const FAQ_DEFAULT_LIMIT = 5;
export const CATEGORY_DEFAULT_LIMIT = 15;

export const USER_TYPE = {
  LOGGED_IN: "LOGGED_IN",
  GUEST: "GUEST",
};

export const checkEmbedLink = (data) => {
  let link = data?.videoLink ? data.videoLink : data?.diyVideoLink;
  return !!(link && link.includes("embed"));
};

export const HC_SCREEN_NAME = {
  LANDING_SCREEN: "Landing Screen",
  CATEGORY_DETAIL_SCREEN: "Category Detail Screen",
  FAQ_DETAIL_SCREEN: "FAQ Detail Screen",
  VIDEO_DETAIL_SCREEN: "Video Detail Screen",
  HC_SEARCH: "Help Center Search Page",
  HC_SEE_ALL: "Help Center See All Screen",
};

export const MAX_CHAR = 5;

export const TICKET_STATUS = {
    REOPEN:"Reopened:",
    CREATED:"Created:",
    RECLOSED:"Re-resolved:",
    SOLVED_BY:"Will be solved by:",
    RESOLVED:"Resolved:",
    VIEW_DETAIL:"View Detail",
};

export const CHATBOT_TYPE = {
  ORISERVE: 'ORISERVE',
  S360: 'S360',
};

export const TICKET_STATE = {
  OPEN: 'open',
  CLOSE: 'close',
  REOPEN: 'reopen',
};

export const TICKET_TAG = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
}
