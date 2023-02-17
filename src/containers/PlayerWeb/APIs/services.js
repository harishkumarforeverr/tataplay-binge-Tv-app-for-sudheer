import {doRequest} from "@src/services/api";
import {serviceConstants} from "@utils/apiService";
import {getLionsGatePlaybackData} from "@containers/PlayerWeb/APIs/actions";

class PlayerService {
    addWatchlist(id, contentTypeData, isHover) {
        return doRequest(serviceConstants.addWatchlist(id, contentTypeData, isHover))
    }

    checkWatchlistContent(id, contentTypeData) {
        return doRequest(serviceConstants.checkWatchlistContent(id, contentTypeData))
    }

    checkNextPrevEpisode(id) {
        return doRequest(serviceConstants.checkNextPrevEpisode(id))
    }

    getVootUrl(id, contentType, provider, partnerUniqueId) {
        return doRequest(serviceConstants.getVootUrl(id, contentType, provider, partnerUniqueId))
    }

    getPlanetMarathiUrl(contentId) {
        return doRequest(serviceConstants.getPlanetMarathiUrl(contentId))
    }

    getChaupalUrl(id, contentType, contentId) {
        return doRequest(serviceConstants.getChaupalUrl(id, contentType, contentId))
    }

    getLionsGatePlaybackData(payload) {
        return doRequest(serviceConstants.getLionsGatePlaybackData(payload))
    }

    setContinueWatching(id, watchDuration, totalDuration, contentType) {
        return doRequest(serviceConstants.setContinueWatching(id, watchDuration, totalDuration, contentType))
    }

    setLA(data) {
        return doRequest(serviceConstants.setLA(data))
    }

    getZee5Tag(partnerUniqueId) {
        return doRequest(serviceConstants.getZee5Tag(partnerUniqueId))
    }

    generateToken(body) {
        return doRequest(serviceConstants.generateToken(body))
    }

    resendLicenseChallenge(url, body, header) {
        return doRequest(serviceConstants.resendLicenseChallenge(url, body, header))
    }

    viewCountLearnAction(contentType, id) {
        return doRequest(serviceConstants.viewCountLearnAction(contentType, id))
    }

    setEpiconDocubayAnalyticsData(providerName, deviceId, data) {
        return doRequest(serviceConstants.setEpiconDocubayAnalyticsData(providerName, deviceId, data))
    }

    setLionsgateAnalyticsData(data) {
        return doRequest(serviceConstants.setLionsgateAnalyticsData(data))
    }

    getSonyToken() {
        return doRequest(serviceConstants.getSonyToken())
    }

    getHoiChoiToken() {
        return doRequest(serviceConstants.getHoiChoiToken())
    }
    getGenericDrm(payload) {
        return doRequest(serviceConstants.getGenericDrmUrl(payload))
    }

    getDigitalFeed(payload) {
        return doRequest(serviceConstants.getDigitalFeed(payload));
    }
}

const PlayerServiceInstance = new PlayerService();
export default PlayerServiceInstance;
