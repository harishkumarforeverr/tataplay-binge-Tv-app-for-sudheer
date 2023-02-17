import Loadable from "react-loadable";
import React from "react";

import Loader from "@common/Loader";
import Button from "@common/Buttons";
import { LOCALSTORAGE, PAGE_LOAD_DELAY } from "@constants/index";
import { getKey } from "@utils/storage";

function Loading({ error, pastDelay }) {
  if (error) {
    console.log("error", error);
    const style = {
      textAlign: "center",
      marginTop: "5%",
    };
    return (
      <div className="reload-page" style={style}>
        <p className="error-text">
          System is unable to load the page due of network issues, refresh the
          page by clicking on the below link.
        </p>
        {
          {
            /* eslint-disable react/jsx-no-bind */
          }
        }
        <Button
          clickHandler={() => window.location.reload()}
          cName="btn primary-btn"
          bValue="Retry"
        />
      </div>
    );
  } else if (pastDelay) {
    return <Loader />;
  } else {
    return null;
  }
}

const Home = Loadable({
  loader: () => import(/* webpackChunkName: "Home" */ "../../containers/Home"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const PIDetail = Loadable({
  loader: () =>
    import(/* webpackChunkName: "PIDetail" */ "../../containers/PIDetail"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const EpisodeDetails = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "EpisodeDetails" */ "../../containers/EpisodeDetails"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Search = Loadable({
  loader: () =>
    import(/* webpackChunkName: "Search" */ "../../containers/Search"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Player = Loadable({
  loader: () =>
    import(/* webpackChunkName: "Player" */ "../../containers/PlayerWeb"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const SeeAll = Loadable({
  loader: () =>
    import(/* webpackChunkName: "SeeALL" */ "../../containers/SeeAll"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Profile = Loadable({
  loader: () =>
    import(/* webpackChunkName: "Profile" */ "../../containers/Profile"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const ChangeEmail = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "ChangeEmail" */ "../../containers/Profile/ChangeEmail"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const ChangeName = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "ChangeName" */ "../../containers/Profile/ChangeName"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const ChangePassword = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "ChangePassword" */ "../../containers/Profile/ChangePassword"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const LinkAccount = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "LinkAccount" */ "../../containers/LinkAccount"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const TransactionHistory = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "TransactionHistory" */ "../../containers/TransactionHistory"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Transactions = Loadable({
  loader: () =>
    import("../../containers/Transactions"),
  loading: Loading,
});

const NotificationSettings = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "NotificationSetting" */ "../../containers/NotificationSettings"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const MyOffers = Loadable({
  loader: () =>
    import(/* webpackChunkName: "MyOffers" */ "../../containers/MyOffers"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const MySubscription = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "MySubscription" */ "../../containers/MySubscription"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const DeviceManagement = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "DeviceManagement" */ "../../containers/DeviceManagement"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const ContactUs = Loadable({
  loader: () =>
    import(/* webpackChunkName: "ContactUs" */ "../../common/Footer/ContactUs"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const PrivacyPolicy = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "PrivacyPolicy" */ "../../common/Footer/PrivacyPolicy"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const AppInstallPage = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "AppInstallPage" */ "../../containers/AppInstallPage"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const NotFoundPage = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "NotFoundPage" */ "../../containers/NotFoundPage"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Watchlist = Loadable({
  loader: () =>
    import(/* webpackChunkName: "WatchList" */ "../../containers/Watchlist"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Notification = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "Notification" */ "../../containers/Notification"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const BrowseByDetail = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "BrowseByDetail" */ "../../containers/BrowseByDetail"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Subscription = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "Subscription" */ "../../containers/Subscription"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const PackSelection = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "PackSelection" */ "../../containers/Subscription/PackSelection"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const MyPlan = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "MyPlan" */ "../../containers/Subscription/MyPlan"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const MyAccount = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "MyAccountMobile" */ "../../components/Header/MyAccountMobile"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Payment = Loadable({
  loader: () =>
    import(/* webpackChunkName: "Payment" */ "../../containers/Payment"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const SubscriptionPayment = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "SubscriptionPayment" */ "../../containers/SubscriptionPayment"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const SubscriptionPaymentRedirect = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "SubscriptionPaymentRedirect" */ "../../containers/SubscriptionPayment/SubscriptionPaymentRedirect"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const FireTvInstallation = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "FireTvInstallation" */ "../../containers/FireTvInstallation"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const TermsAndConditions = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "TermsAndConditions" */ "../../common/Footer/TermsAndConditions"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const BestViewMobile = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "BestViewMobile" */ "../../containers/BestViewMobile"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const SwitchAccountMobile = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "SwitchAccountMobile" */ "../../containers/SwitchAccountMobile"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const UpgradeFreeTrial = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "SwitchAccountMobile" */ "../../containers/MySubscription/UpgradeFreeTrial"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const Setting = Loadable({
  loader: () =>
    import(/* webpackChunkName: "Setting" */ "../../containers/Settings"),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const HelpCenter = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenter" */ "../../containers/HelpCenter/LandingScreen"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const HelpCenterSearch = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenterSearch" */ "../../containers/HelpCenter/SearchScreen"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const HelpCenterSearchResult = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenterSearchResult" */ "../../containers/HelpCenter/SearchResult"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const HelpCenterCategory = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenterCategory" */ "../../containers/HelpCenter/Category"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const HelpCenterVideoDetail = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenterVideoDetail" */ "../../containers/HelpCenter/VideoDetail"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const HelpCenterVideoSeeAll = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenterVideoSeeAll" */ "../../containers/HelpCenter/SeeAllVideos"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const TicketScreen = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenterVideoSeeAll" */ "../../containers/HelpCenter/TicketScreen"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const CampaignPage = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "HelpCenterVideoSeeAll" */ "../../containers/CampaignPage"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

const SubscriptionDiscount = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: "SubscriptionDiscount" */ "../../containers//Subscription/SubscriptionDiscount"
    ),
  loading: Loading,
  delay: PAGE_LOAD_DELAY,
});

export const URL = {
  LOGIN: "login",
  HOME: "home",
  MOVIES: "movies",
  TV_Shows: "shows",
  SPORTS: "sports",
  OLD_MOVIES: "OldMovies",
  DETAIL: "detail",
  SERIESDETAIL: "seriesDetail",
  SEE_ALL: "see-all",
  RECOMMENDED_SEE_ALL: "recommended-see-all",
  CONTINUE_WATCHING_SEE_ALL: "continue-watching-see-all",
  WATCHLIST_SEE_ALL: "watchlist-see-all",
  SEARCH: "search",
  PROFILE: "profile",
  CHANGE_EMAIL: "change-email",
  CHANGE_NAME: "change-name",
  CHANGE_PASSWORD: "change-password",
  LINK_ACCOUNT: "link-account",
  TRANSACTION_HISTORY: "transaction-history",
  NOTIFICATION_SETTINGS: "notification-settings",
  MY_OFFERS: "my-offers",
  MY_SUBSCRIPTION: "my-subscription",
  DEVICE_MANAGEMENT: "device-management",
  CONTACT_US: "contact-us",
  PRIVACY_POLICY: "privacy-policy",
  PLAYER: "player",
  TRAILER: "trailer",
  DEFAULT: "/",
  WATCHLIST: "watchlist",
  NOTIFICATION: "notification",
  PARTNER: "partner",
  BROWSE_BY: "browse-by",
  PACK_SELECTION: "pack-Selection",
  TVOD: "tvod",
  MY_ACCOUNT: "my-account",
  TA_SEE_ALL: "ta-see-all",
  SUBSCRIPTION_TRANSACTION: "subscription-transaction",
  SUBSCRIPTION_TRANSACTION_REDIRECT: "subscription-transaction/status",
  PAYMENT: "payment",
  FIRE_TV_INSTALLATION: "fire-tv-installation",
  TERMS_AND_CONDITIONS: "terms-and-conditions",
  REDIRECT_TO_APP: "redirectToApp",
  PAGE_NOT_FOUND: "page-not-found",
  APP_INSTALL: "appinstall",
  BEST_VIEW_MOBILE: "best-view-mobile",
  SWITCH_ACCOUNT: "switch-account",
  APP_INSTALL_2: "appinstall2",
  UPGRADE_FREE_TRIAL: "upgrade-free-trial",
  CATEGORIES: "categories",
  SETTING: "setting",
  HELP_CENTER: "help-center",
  HC_SEARCH_RESULT: "search-result",
  HC_SEARCH: "hc-search",
  HC_CATEGORY: "category",
  HC_CATEGORY_NAME: "categoryName",
  HC_VIDEO_DETAIL: "video-detail",
  HC_VIDEO_SEE_ALL: "video-see-all",
  HC_TICKET: "hc-ticket",
  MY_PLAN: "my-plan",
  SUBSCRIPTION: "subscription",
  BALANCE_INFO: "balance-info",
  LANGUAGE: "language",
  EPISODE: "episode",
  TRANSACTIONS: 'transactions',
  SUBSCRIPTION_CAMPAIGN: 'subscription-campaign',
  SUBSCRIPTION_DISCOUNT: 'subscription-discount',
  DISCOUNT: 'discount',
};

export const mainRoutes = [
  {
    path: `${URL.DEFAULT}`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.HOME}`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.MOVIES}`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.TV_Shows}`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SPORTS}`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.PARTNER}/:provider/:providerId`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.DETAIL}/:contentType/:id/:contentName`,
    component: PIDetail,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.DETAIL}/:contentType/:id`,
    component: PIDetail,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.EPISODE}/:contentType/:id`,
    component: EpisodeDetails,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SERIESDETAIL}/:contentType/:id`,
    component: PIDetail,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SEE_ALL}/:id`,
    component: SeeAll,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.RECOMMENDED_SEE_ALL}/:contentType/:id`,
    component: SeeAll,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.CONTINUE_WATCHING_SEE_ALL}/:id`,
    component: SeeAll,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.WATCHLIST_SEE_ALL}/:id`,
    component: SeeAll,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.HELP_CENTER}/${URL.HC_TICKET}`,
    component: TicketScreen,
    exact: true,
    mobileAccess: true,
    webAccess: true,
  },
  {
    path: `/${URL.TA_SEE_ALL}/:id`,
    component: SeeAll,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.TVOD}`,
    component: SeeAll,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.PROFILE}`,
    component: Profile,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.MY_PLAN}`,
    component: MyPlan,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.CHANGE_EMAIL}`,
    component: ChangeEmail,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.CHANGE_NAME}`,
    component: ChangeName,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.CHANGE_PASSWORD}`,
    component: ChangePassword,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.LINK_ACCOUNT}`,
    component: LinkAccount,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.TRANSACTION_HISTORY}`,
    component: TransactionHistory,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.TRANSACTIONS}`,
    component: Transactions,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.NOTIFICATION_SETTINGS}`,
    component: NotificationSettings,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.MY_OFFERS}`,
    component: MyOffers,
    exact: true,
    accessBeforeLogin: false,
  },
  // {
  //   path: `/${URL.MY_SUBSCRIPTION}`,
  //   component: MySubscription,
  //   exact: true,
  //   accessBeforeLogin: false,
  // },
  {
    path: `/${URL.DEVICE_MANAGEMENT}`,
    component: DeviceManagement,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.CONTACT_US}`,
    component: ContactUs,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.PRIVACY_POLICY}`,
    component: PrivacyPolicy,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SEARCH}`,
    component: Search,
    exact: false,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.PLAYER}/:contentType/:id`,
    component: Player,
    exact: false,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.TRAILER}/:contentType/:id`,
    component: Player,
    exact: false,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.WATCHLIST}`,
    component: Watchlist,
    exact: false,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.NOTIFICATION}`,
    component: Notification,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.BROWSE_BY}/:browseByType/:browseBy`,
    component: BrowseByDetail,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SUBSCRIPTION}`,
    component: Subscription,
    exact: false,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.PACK_SELECTION}`,
    component: PackSelection,
    exact: false,
    accessBeforeLogin: true,
  },

  // {
  //   path: `/${URL.MY_ACCOUNT}`,
  //   component: MyAccount,
  //   exact: true,
  //   accessBeforeLogin: true,
  // },
  {
    path: `/${URL.SUBSCRIPTION_TRANSACTION}`,
    component: SubscriptionPayment,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.SUBSCRIPTION_TRANSACTION_REDIRECT}`,
    component: SubscriptionPaymentRedirect,
    exact: true,
    accessBeforeLogin: () => {
      return !!JSON.parse(getKey(LOCALSTORAGE.IS_SILENT_LOGOUT))
    },
  },

  {
    path: `/${URL.BALANCE_INFO}`,
    component: SubscriptionPayment,
    exact: false,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.PAYMENT}`,
    component: Payment,
    exact: false,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.FIRE_TV_INSTALLATION}`,
    component: FireTvInstallation,
    exact: false,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.TERMS_AND_CONDITIONS}`,
    component: TermsAndConditions,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.REDIRECT_TO_APP}`,
    component: MyAccount,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.APP_INSTALL}`,
    component: AppInstallPage,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.APP_INSTALL_2}`,
    component: AppInstallPage,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.BEST_VIEW_MOBILE}`,
    component: BestViewMobile,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SWITCH_ACCOUNT}`,
    component: SwitchAccountMobile,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.SWITCH_ACCOUNT}`,
    component: SwitchAccountMobile,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.UPGRADE_FREE_TRIAL}`,
    component: UpgradeFreeTrial,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.CATEGORIES}/:contentType`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SETTING}/:componentName`,
    component: Setting,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.SETTING}`,
    component: Setting,
    exact: true,
    accessBeforeLogin: false,
  },
  {
    path: `/${URL.HELP_CENTER}`,
    component: HelpCenter,
    exact: true,
    mobileAccess: true,
    webAccess: true,
  },
  {
    path: `/${URL.HELP_CENTER}/${URL.HC_SEARCH}`,
    component: HelpCenterSearch,
    exact: true,
    mobileAccess: true,
    webAccess: true,
  },
  {
    path: `/${URL.HELP_CENTER}/${URL.HC_SEARCH_RESULT}/:id/:type`,
    component: HelpCenterSearchResult,
    exact: true,
    mobileAccess: true,
    webAccess: true,
  },
  {
    path: `/${URL.HELP_CENTER}/${URL.HC_CATEGORY}`,
    component: HelpCenterCategory,
    exact: true,
    mobileAccess: true,
    webAccess: true,
  },
  {
    path: `/${URL.HELP_CENTER}/${URL.HC_VIDEO_DETAIL}/:id/:type`,
    component: HelpCenterVideoDetail,
    exact: true,
    mobileAccess: true,
    webAccess: true,
  },
  {
    path: `/${URL.HELP_CENTER}/${URL.HC_VIDEO_SEE_ALL}`,
    component: HelpCenterVideoSeeAll,
    exact: true,
    mobileAccess: true,
    webAccess: true,
  },
  {
    path: `/${URL.SUBSCRIPTION_CAMPAIGN}`,
    component: CampaignPage,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.SUBSCRIPTION_DISCOUNT}`,
    component: SubscriptionDiscount,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `/${URL.PAGE_NOT_FOUND}`,
    component: NotFoundPage,
    exact: true,
    accessBeforeLogin: true,
  },
  {
    path: `*`,
    component: Home,
    exact: true,
    accessBeforeLogin: true,
  },
];
