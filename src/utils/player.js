import {PLAYER_TYPE, BROWSER_TYPE, OS} from "@constants/browser";
import {getSystemDetails} from "./browserEnvironment";
import {PLAYER_SOURCE, CONTRACT} from "@constants/index";


let playerDetail = {
    playerType: null,  // eg: BITMOVIN, SILVERLIGHT
    playerSource: null,// eg: WIDEWINE, PLAYREADY, SSs
};

const setPlayerDetails = (content = null) => {
    let systemDetail = getSystemDetails();
    let isFairplayEnabled = true;
    // Bitmovin : chrome, firefox, Opera, Edge, IE11-windows os-8,10,
    // Silverlight : Safari:7-8, IE:10-9, IE-11 on windows7
    switch (systemDetail.browser) {
        case BROWSER_TYPE.CHROME:
        case BROWSER_TYPE.FIREFOX:
        case BROWSER_TYPE.OPERA:
        case BROWSER_TYPE.EDGE:
            playerDetail.playerType = PLAYER_TYPE.BITMOVIN;
            playerDetail.playerSource = PLAYER_SOURCE.WIDEVINE;
            break;
        case BROWSER_TYPE.SAFARI:
            if (content && !!content.fairplayUrl && isFairplayEnabled) {
                playerDetail.playerType = PLAYER_TYPE.BITMOVIN;
                playerDetail.playerSource = PLAYER_SOURCE.FAIR_PLAY;
            }
            break;
        default:
            playerDetail.playerType = PLAYER_TYPE.BITMOVIN;
            playerDetail.playerSource = PLAYER_SOURCE.WIDEVINE;
            break;
    }
    return playerDetail;

};

const getPlayerDetail = (content = null) => {
    let systemDetail = getSystemDetails();
    if (playerDetail.playerType) {
        if (systemDetail.browser === BROWSER_TYPE.SAFARI) {
            return setPlayerDetails(content);
        }
        return playerDetail;
    } else {
        return setPlayerDetails(content);
    }

};

export {
    getPlayerDetail,
}