export const ERROR_MESSAGES = {
    CONTENT_UNAVAILABLE: 'Something went wrong.Unable to play content',
    TVOD_CONTENT_EXPIRED: 'You have no longer access to view this content',
    NO_INTERNET: 'No Internet Connection',
    DEFAULT_ERROR_HEADING: 'Video unavailable',
    DEFAULT_ERROR_MESSAGE: 'We are unable to play your video right now. Please try again in a few minutes',
    DEVICE_REMOVED: 'Device Removed',
    DEVICE_REMOVED_MESSAGE: 'You have been logged out of this device. Please log in again.',
    CONCURRENCY: 'You have exceeded the limit of screens on which you can watch this video. Please stop playback on one of the other devices to watch here.',
};

export const PLAYER_CODES = {
    ERROR_2003: 2003, //"DRM_FAILED_LICENSE_REQUEST"
    ERROR_403: 403, // Forbidden: Access is denied.
    ERROR_401: 401, //Unauthorized: Access is denied due to invalid credentials.
    ERROR_130301: 130301, // Geo-blocking
    ERROR_130302: 130302, // Proxy detection
    ERROR_130401: 130401, // CSM concurrency
    ERROR_100209: 100209, // JWT-token expiry
};

export const PROVIDER_NAME = {
    SHEMAROOME: 'shemaroome',
    TATASKY: 'tatasky',
    VOOT: 'voot',
    CURIOSITY_STREAM: 'curiositystream',
    VOOTSELECT: 'vootselect',
    VOOTKIDS: 'vootkids',
    ZEE5: 'zee5',
    HOTSTAR: 'hotstar',
    PRIME: 'prime',
    SONYLIV: 'sonyliv',
    SUNNXT: 'sunnxt',
    EROS_NOW: 'erosnow',
    HUNGAMA: 'hungama',
    DOCUBAY: 'docubay',
    EPICON: 'epicon',
    HOICHOI: 'hoichoi',
    PLANET_MARATHI: 'planetmarathi',
    CHAUPAL: 'chaupal',
    MX_PLAYER: 'mxplayer',
    LIONS_GATE:'lionsgate',
    TRAVEL_XP: 'travelxp',
    APPLE: 'apple',
};

export const SHEMAROO_ANALYTICS_EVENT = {
    PLAY: 'PLAY',
    BUFFERING: 'BUFFERING',
    REGULAR_INTERVAL: 'REGULAR_INTERVAL',
};

export const INTEGRATED_PARTNER_LIST = [
    PROVIDER_NAME.SHEMAROOME,
    PROVIDER_NAME.VOOTSELECT,
    PROVIDER_NAME.VOOTKIDS,
    PROVIDER_NAME.TATASKY,
    PROVIDER_NAME.CURIOSITY_STREAM,
    PROVIDER_NAME.ZEE5,
    PROVIDER_NAME.HOTSTAR,
    PROVIDER_NAME.HUNGAMA,
    PROVIDER_NAME.EPICON,
    PROVIDER_NAME.DOCUBAY,
    PROVIDER_NAME.EROS_NOW,
    PROVIDER_NAME.SONYLIV,
    PROVIDER_NAME.PLANET_MARATHI,
    PROVIDER_NAME.CHAUPAL,
    PROVIDER_NAME.HOICHOI,
    PROVIDER_NAME.LIONS_GATE,
    PROVIDER_NAME.MX_PLAYER,
    PROVIDER_NAME.APPLE,
]

export const PLAY_AUTH_TYPE ={
    JWT_TOKEN:'JWTToken',
    DRM_PLAYBACK:"DRM_TokenAPI",
    NONE:"None",
    UNKNOWN:"Unknown",
    DEEP_LINK_REDIRECTION:"DeeplinkRedirection",
};

export const GENERIC_DEVICE_OS = {
    ANDROID: 'Android',
    IOS: 'iOS',
};

export const MX_PLAYER_CONTENT_TYPE = {
    MOVIE: 'movie',
    SHORTS: 'shorts',
    EPISODE: 'episode',
};

export const LIVE_LABEL = {
    GO_LIVE: 'Go Live',
    LIVE: 'Live',
};
