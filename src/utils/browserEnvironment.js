import {BROWSER_TYPE, OS} from '@constants/browser';

let systemDetail = {
    os: null,
    osVersion: null,
    browser: null,
    browserVersion: null,
};

const setSystemDetails = () => {
    //let nVer = navigator.appVersion;
    let nAgt = navigator.userAgent;
    let version = '' + parseFloat(navigator.appVersion);
    //let majorVersion = parseInt(navigator.appVersion, 10);
    let nameOffset, verOffset, ix, majorVersion;

    // Opera
    if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
        systemDetail.browser = BROWSER_TYPE.OPERA;
        version = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf('Version')) !== -1) {
            version = nAgt.substring(verOffset + 8);
        }
    } else if ((verOffset = nAgt.indexOf('OPR')) !== -1) {
        // Opera Next
        systemDetail.browser = BROWSER_TYPE.OPERA;
        version = nAgt.substring(verOffset + 4);
    } else if ((verOffset = nAgt.indexOf('Edge')) !== -1) {
        // Edge
        systemDetail.browser = BROWSER_TYPE.EDGE;
        version = nAgt.substring(verOffset + 5);
    } else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
        // MSIE
        systemDetail.browser = BROWSER_TYPE.IE;
        version = nAgt.substring(verOffset + 5);
    } else if ((verOffset = nAgt.indexOf('Chrome')) !== -1  || (verOffset = nAgt.indexOf('CriOS')) !== -1 || navigator?.vendor.includes("Google Inc")) {
        // Chrome
        systemDetail.browser = BROWSER_TYPE.CHROME;
        version = nAgt.substring(verOffset + 7);
    } else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
        // Safari
        systemDetail.browser = BROWSER_TYPE.SAFARI;
        version = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf('Version')) !== -1) {
            version = nAgt.substring(verOffset + 8);
        }
    } else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
        // Firefox
        systemDetail.browser = BROWSER_TYPE.FIREFOX;
        version = nAgt.substring(verOffset + 8);
    } else if (nAgt.indexOf('Trident/') !== -1) {
        // MSIE 11+
        systemDetail.browser = BROWSER_TYPE.IE;
        version = nAgt.substring(nAgt.indexOf('rv:') + 3);
    } else if (navigator.userAgent.match(/^Mozilla\/5\.0 .+ Gecko\/$/)) {
        // UC browser
        systemDetail.browser = BROWSER_TYPE.UC;
    } else {
        // Other browsers
        systemDetail.browser = nAgt.substring(nameOffset, verOffset);
        version = nAgt.substring(verOffset + 1);
    }

    // trim the version string
    if ((ix = version.indexOf(';')) !== -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(' ')) !== -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(')')) !== -1) version = version.substring(0, ix);

    majorVersion = parseInt('' + version, 10);
    if (isNaN(majorVersion)) {
        //version = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    // system
    let os = null;
    let clientStrings = [
        {s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/},
        {s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/},
        {s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/},
        {s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/},
        {s: 'Windows Vista', r: /Windows NT 6.0/},
        {s: 'Windows Server 2003', r: /Windows NT 5.2/},
        {s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/},
        {s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/},
        {s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/},
        {s: 'Windows 98', r: /(Windows 98|Win98)/},
        {s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/},
        {s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
        {s: 'Windows CE', r: /Windows CE/},
        {s: 'Windows 3.11', r: /Win16/},
        {s: 'Android', r: /Android/},
        {s: 'Open BSD', r: /OpenBSD/},
        {s: 'Sun os', r: /SunOS/},
        {s: 'Linux', r: /(Linux|X11)/},
        {s: 'iOS', r: /(iPhone|iPad|iPod)/},
        {s: 'Mac os X', r: /Mac os X/},
        {s: 'Mac os', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
        {s: 'QNX', r: /QNX/},
        {s: 'UNIX', r: /UNIX/},
        {s: 'BeOS', r: /BeOS/},
        {s: 'os/2', r: /os\/2/},
        {s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/},
    ];
    for (let id in clientStrings) {
        let cs = clientStrings[id];
        if (cs.r.test(nAgt)) {
            os = cs.s;
            systemDetail.os = os;
            break;
        }
    }

    let osVersion = null;

    if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1];
        //os = 'Windows';
        systemDetail.os = OS.WINDOWS;
    }

    systemDetail.osVersion = osVersion;
    systemDetail.browserVersion = majorVersion;

    return systemDetail;
};

const getSystemDetails = () => {
    if (systemDetail.browser) {
        return systemDetail;
    } else {
        return setSystemDetails();
    }
};


export {
    getSystemDetails,
}