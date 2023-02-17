import { PlayerEvent } from 'bitmovin-player';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';

// ========================================================================= //
//Flag to enable/disable logging
var _enableLogging = true
// ========================================================================= //

// ========================================================================= //
//Integration provided metadata
var _appProperties = null
var _assetProperties = null
// ========================================================================= //
var QUALITY_THRESHOLD = 0.49;
var QUALITY_UPPER_THRESHOLD = 49.5;
var STARTUP_BITRATE = '1000kbps';

var player;
var availableQualities = null;
var isInStartup = true;
var startupTimerID;

var preferredQuality =  1000000;
var startupSeconds =  10;
// ========================================================================= //
var _udid = ""
var _impl = null
var _clientIP = null
var _pingTimer = null
var _configTimer = null
var _lastPingTime = -1
var _stallTrackingTimer = null
var stopEvent = null
// ========================================================================= //

// ========================================================================= //
//Metadata Defaults
const KDefaultUEID = ""
const KDefaultProvider = "TataSky"
const KDefaultPlayerName = "Bitmovin"
const KDefaultAppName = "BingePremium"
const KDefaultSubscriberID = ""
const KDefaultCDN = ""
const KDefaultAssetID = "-"
const KDefaultStreamingURL = ""
const KDefaultContentType = ""
const KDefaultContentTitle = ""
const KDefaultPrevEvent = "NA"
const KDefaultSessionID = ""
const KDefaultAssetDuration = 0
const KDefaultHAS = ""
const KDefaultDRM = "Playready"//"Unknown"
const KDefaultAssetTypeIsLive = false
const KDefaultThroughput = 0
const KDefaultResolution = ""
const KDefaultACodec = ""
const KDefaultVideoCodec = ""
const KDefaultFrameRate = 0
const KDefaultBitrate = 0
const KInvalidTime = -1
const KInvalidPlaybackPos = -1
const KInvalidFrameLossCount = -1
const KInvalidStallDuration = -1
const KAutoPlayByDefaultDisable = true
const KDefaultLocation = ""
const KDefaultClientIP = "127.0.0.1"

//TataSky Beacon payload field defaults
const KSchemaVersion = "1.0.0"
const KSDKVersion = "1.0.0"
const KPlayerVersion = "8.96.0"
const KVideoTitile = "The Stranger"
var KDefaultPrevEventCount =1
var KDefaultSBlLevel = 0 
var KDefaultRBlLevel = 0 
// ========================================================================= //

// ========================================================================= //
//Endpoint Details
const KDoRegistrationEndpoint = "https://register-qoe.tataplaybinge.com/register-session"//"https://register-qoe.tataplaybinge.com/register-session"//"https://register.tskytech.com/register-session"
const KGETMitigationEndpoint = "https://register-qoe.tataplaybinge.com/get-mitigation-config"//"https://register-qoe.tataplaybinge.com/get-mitigation-config"//"https://register.tskytech.com/get-mitigation-config"
const KSendBeaconDefaultEndpoint = "https://beacon-qoe.tataplaybinge.com/api/analysis"//"https://beacon.tskytech.com/api/analysis"--dev//https://beacon-qoe.tataplaybinge.com/api/analysis
const KGetIPEndpoint = `https://api.ipify.org/?format=json`

const KDefaultPeriodicBeaconFrequencySec = 20*1000
const KSendBeaconDefaultEndpointNew="http://3.108.121.176:8000/api/analysis"//--dev

var _beaconUrl =KSendBeaconDefaultEndpoint// KSendBeaconDefaultEndpointNew// KSendBeaconDefaultEndpoint
var _beaconFrequency = KDefaultPeriodicBeaconFrequencySec
var _mitigationFrequency = KDefaultPeriodicBeaconFrequencySec
var ondestroyFrequency = 0;
// ========================================================================= //

// ========================================================================= //
//Keys for Local Storage
const KLocalStorageKeyMitigationID = "TSAnalyticsMitigationID"
const KLocalStorageKeyDownloadRate = "TSAnalyticsDownloadRate"
const KLocalStorageKeyStartupThreshold = "TSAnalyticsStartupThreshold"
const KLocalStorageKeyRebufferThreshold = "TSAnalyticRebufferThreshold"
const KLocalStorageKeyMitigationApplicationTime = "TSAnalyticsMitigationApplicationTime"
const KLocalStorageKeyUDID = "TSAnalyticsUDID"

//Mitigation Defaults
const KDefaultMitigationID = null//"7d5ef108-9b9d-43cc-9e5f-dcb21c91fcc4"
const KLocalStorageKeyMitigationApplicationTimeVal = 1
const KDefaultStartupBufferThreshold = 2
const KDefaultRebufferThreshold = 4
const KDefaultDownloadRate = 1000 //In Kbps 
// ========================================================================= //

// ========================================================================= //
const KStallTrackingDelayMS = 1000
// ========================================================================= //

// Session event state mgt ================================================= //

// ========================================================================= //

// Session Info ============================================================ //
var _playbackDurationTimer = {
    playbackStartTime: KInvalidTime,
    duration: 0
}

var _sessionState = {
    cdn: KDefaultCDN,    //Set by the application 
    provider: KDefaultProvider, //Set by the appliction
    videoId: KDefaultAssetID, //Set by the application
    streamingURL: KDefaultStreamingURL,   //Set by the application

    sessionId: KDefaultSessionID,  //Session ID computed when the session starts
    assetDuration: KDefaultAssetDuration,  //Computed from the player
    has: KDefaultHAS,    //In beginning of the session
    drm: KDefaultDRM,    //DRM of the session
    live: KDefaultAssetTypeIsLive, //Is Live

    frameRate: KDefaultFrameRate,  //Computed when Video representation swicth
    aCodec: KDefaultACodec, //ACodec
    vCodec: KDefaultVideoCodec, //VCodec
    bitrate: KDefaultBitrate,    //Computed when the video representation switch
    resolution: KDefaultResolution, //Resolution when the video representation switch

    throughput: KDefaultThroughput, //Average throughput computed whenever the segment downloads

    framelossAtLastPing: KInvalidFrameLossCount, //Computed from the player at ping frequency    
    stallDurationAtLastPing: KInvalidStallDuration, //Computed from the player at ping frequency

    playbackPosInSec: KInvalidPlaybackPos,   //Computed at the event send and the ping send

    prevEvent: KDefaultPrevEvent,
    playIntentTime: KInvalidTime, //Set when Play event is clicked for the first time
    playingTime: KInvalidTime, //Set when the playing event is done
    playClickedIntentExplicitExpected: KAutoPlayByDefaultDisable, //Default auto play assumption is false


    isSeeking: false,
    seekStartTime: KInvalidTime,
    seekEndTime: KInvalidTime,

    isBuffering: false,
    bufferingStartTime: 0,
    bufferingEndTime: 0,
    bufferingDurationAtLastPing: 0,
    bufferingDurationSession: 0,
    bufferingCount: 0,
    bufferingCountAtLastPing: 0,

    playbackDurationAtLastPing: 0,

    switchesUp: {},
    switchesDown: {},
    
}


var _deviceInfo = {
    platform: "Web",
    deviceType: "Desktop",
    manufacturer: "Manufacturer",
    model: "Model"
}

var _player = null
var _sessionActive = false
var _mitigationID = null
var _mitigationApplicationTime = KLocalStorageKeyMitigationApplicationTimeVal
var _initialDownloadRate = KDefaultDownloadRate
var _startupBufferThreshold = KDefaultStartupBufferThreshold
var _reBufferThreshold = KDefaultRebufferThreshold
var disable_mitigation_poll= false
var disable_qoe_beacons=false

// ========================================================================= //

class TSAnalyticsMitigtionSDKImpl {
    // ==============================Duration Timer========================= //
    _resetPlaybackDurationTimer() {
        _playbackDurationTimer.playbackStartTime = KInvalidTime
        _playbackDurationTimer.duration = 0
    }

    _startPlaybackDurationTimer() {
        if (_playbackDurationTimer.playbackStartTime == KInvalidTime) {
            _playbackDurationTimer.playbackStartTime = this._getCurrentTimeInSec()
        }
    }

    _getProgressSegmentPlaybackDurationTimer() {
        if (_playbackDurationTimer.playbackStartTime != KInvalidTime) {
            return _impl._getCurrentTimeInSec() - _playbackDurationTimer.playbackStartTime
        }
        return 0
    }

    _stopPlaybackDurationTimer() {
      try {
        _playbackDurationTimer.duration = _playbackDurationTimer.duration + _impl._getProgressSegmentPlaybackDurationTimer()
        _playbackDurationTimer.playbackStartTime = KInvalidTime
      } catch (error) {
        _playbackDurationTimer.duration = 0 // _playbackDurationTimer.duration + _impl._getProgressSegmentPlaybackDurationTimer()
        _playbackDurationTimer.playbackStartTime = 0
      }
    }

    _getPlaybackDurationTotal() {
        return _playbackDurationTimer.duration + _impl._getProgressSegmentPlaybackDurationTimer()
    }
    // ===================================================================== //

    // ===================================================================== //
    // util functions
    _getCurrentTimeInMilliSec() {
        return parseInt(new Date().getTime())
    }

    _getCurrentTimeInSec() {
        return parseInt(_impl._getCurrentTimeInMilliSec() / 1000)
    }
    _getClientIP() {
        if (_clientIP == null) {
            return KDefaultClientIP
        }
        return _clientIP
    }

    _persistKStrVP(key, val) {
        if (val != null) {
            localStorage.setItem(key, val)
        }
    }

    _persistKIntVP(key, val) {
        if (val >= 0) {
            this._persistKStrVP(key, val.toString())
        }
    }

    _getStrV(key) {
        return localStorage.getItem(key)
    }

    _getIntV(key) {
        console.log("miti--5--",this._getStrV(key), val);
        

        var val = this._getStrV(key)
        if (val != null) {
            const parsed = parseInt(val, 10);
            if (!isNaN(parsed))
                return parsed
        }
        return -1
    }

    _getUDID() {
        if(localStorage.getItem(KLocalStorageKeyUDID)!=null){
            return  _udid = localStorage.getItem(KLocalStorageKeyUDID);
        }else{
           // if (_udid == null || _udid.length == 0) {
                _udid = uuidv4();
                localStorage.setItem(KLocalStorageKeyUDID, _udid)
           // }
            return _udid
        }
    
     
    }
    // ========================================================================= //

    //External Metadata
    _getExternalSetProvider() {
        if (_assetProperties != null && (_assetProperties.Provider != null)) {
            return _assetProperties.Provider;
        }
        return KDefaultProvider
    }

    _getExternalSetCDN() {
        if (_assetProperties != null && (_assetProperties.CDN != null)) {
            return _assetProperties.CDN;
        }
        return KDefaultCDN
    }

    _getExternalAssetID() {
        if (_assetProperties != null && (_assetProperties.AssetID != null)) {
            return _assetProperties.AssetID;
        }
        return KDefaultAssetID
    }

    _getExternalSetStreamingURL() {
        if (_assetProperties != null && (_assetProperties.StreamingURL != null)) {
            return _assetProperties.StreamingURL;
        }
        return KDefaultStreamingURL
    }

    _getExternalContentTitle() {
        if (_assetProperties != null && (_assetProperties.ContentTitle != null)) {
            return _assetProperties.ContentTitle;
        }
        return KDefaultContentTitle
    }

    _getExternalContentType() {
        if (_assetProperties != null && (_assetProperties.ContentType != null)) {
            return _assetProperties.ContentType;
        }
        return KDefaultContentType
    }

    //App Properties
    _getEmailID() {
        if (_appProperties != null && _appProperties.UEID != null) {
            return _appProperties.UEID;
        }
        return KDefaultUEID
    }

    _getPlayerName() {
        if (_appProperties != null && (_appProperties.PlayerName != null)) {
            return _appProperties.PlayerName;
        }
        return KDefaultPlayerName
    }

    _getApplicationName() {
        if (_appProperties != null && (_appProperties.ApplicationName != null)) {
            return _appProperties.ApplicationName;
        }
        return KDefaultAppName
    }
//------------------------------------------------------------------------------------
    _getVideoTitle() {
        if (_assetProperties != null && (_assetProperties.videoTitle != null)) {
            return _assetProperties.videoTitle;
        }
        return KVideoTitile
    }
    _getPlayerVersion() {
        if (_assetProperties != null && (_assetProperties.playerVersion != null)) {
            return _assetProperties.playerVersion;
        }
        return KPlayerVersion
    }

    _getSubscriberID() {
        if (_appProperties != null && (_appProperties.SubscriberID != null)) {
            return _appProperties.SubscriberID;
        }
        return KDefaultSubscriberID
    }

    //Session State
    _updateSessionExternalMetadata() {
        _sessionState.cdn = this._getExternalSetCDN()
        _sessionState.provider = this._getExternalSetProvider()
        _sessionState.videoId = this._getExternalAssetID()
        _sessionState.streamingURL = this._getExternalSetStreamingURL()
        _sessionState.contentType = this._getExternalContentType()
        _sessionState.contentTitle = this._getExternalContentTitle()
    }

    _getCDN() {
        return _sessionState.cdn
    }

    _getProvider() {
        return _sessionState.provider
    }

    _getVideoID() {
        return _sessionState.videoId
    }

    _getContentTitle() {
        return _sessionState.contentTitle
    }

    _getContentType() {
        return _sessionState.contentType
    }

    _getStreamingURL() {
        return _sessionState.streamingURL
    }

    //Source Set Metadatat
    _setSourceMetadata(has, drm, live, duration) {
        _sessionState.has = has
        _sessionState.drm = drm
        _sessionState.live = live
        _sessionState.assetDuration = duration
    }

    _getHAS() {
      try {
        return _sessionState.has
      } catch (error) {
        return ""
      }
    }

    _getDRM() {
      try {
        return _sessionState.drm
      } catch (error) {
        return "Playready"
      }
    }

    _getLive() {
        try {
            return _sessionState.live
        } catch (error) {
          return false  
        }
    }

    _getAssetDuration() {
       try {
        return _sessionState.assetDuration
       } catch (error) {
        return 0;
       }
    }

    _getPlaybackPosInSec() {
        try {
            return _player.getCurrentTime()
        } catch (error) {
           return 0 
        }
    }

    _getSessionID() {
        return _sessionState.sessionId
    }

    _getTimeStamp() {
        return _impl._getCurrentTimeInSec()
    }

    //Video Adaptation change metadata
    _setVideoRepresentationMetadata(fRate, bitrate, resolution, audioCodec, videoCodec) {
        _sessionState.frameRate = fRate
        _sessionState.bitrate = bitrate
        _sessionState.resolution = resolution
        _sessionState.aCodec = audioCodec
        _sessionState.vCodec = videoCodec

    }


    _getFrameRate() {
        return _sessionState.frameRate
    }

    _getACodec() {
        return _sessionState.aCodec
    }

    _getVCodec() {
        return _sessionState.vCodec
    }

    _getBitrate() {
        return _sessionState.bitrate
    }

    _getResolution() {
        return _sessionState.resolution
    }

    //Session State
    _setThroughput(throughput) {
        //TODO: Do weighted avg of download rates since last ping
        _sessionState.throughput = parseInt(throughput) 
    }

    _getThroughput() {
        return _sessionState.throughput
    }

    _setPrevEvent(event) {
        _sessionState.prevEvent = event
    }

    _getPrevEvent() {
        return _sessionState.prevEvent
    }

    _initAssetExternalMetadata() {
        _sessionState.cdn = KDefaultCDN
        _sessionState.provider = KDefaultProvider
        _sessionState.videoId = KDefaultAssetID
        _sessionState.streamingURL = KDefaultStreamingURL
        _sessionState.contentType = KDefaultContentType
        _sessionState.contentTitle = KDefaultContentTitle
    }

    _initAssetSourceMetadata() {
        _sessionState.assetDuration = KDefaultAssetDuration  //Computed from the player
        _sessionState.has = KDefaultHAS    //In beginning of the session
        _sessionState.drm = KDefaultDRM    //DRM of the session
        _sessionState.live = KDefaultAssetTypeIsLive //Is Live
    }

    _initSessionState() {
        _sessionState.sessionId = KDefaultSessionID

        _sessionState.frameRate = KDefaultFrameRate  //Computed when Video representation swicth
        _sessionState.aCodec = KDefaultACodec //ACodec
        _sessionState.vCodec = KDefaultVideoCodec //VCodec
        _sessionState.bitrate = KDefaultBitrate    //Computed when the video representation switch
        _sessionState.resolution = KDefaultResolution //Resolution when the video representation switch

        _sessionState.throughput = KDefaultThroughput //Average throughput computed whenever the segment downloads

        _sessionState.framelossAtLastPing = KInvalidFrameLossCount //Computed from the player at ping frequency    
        _sessionState.stallDurationAtLastPing = KInvalidStallDuration //Computed from the player at ping frequency

        _sessionState.playbackPosInSec = KInvalidPlaybackPos   //Computed at the event send and the ping send

        _sessionState.prevEvent = KDefaultPrevEvent
        _sessionState.playIntentTime = KInvalidTime //Set when Play event is clicked for the first time
        _sessionState.playingTime = KInvalidTime //Set when the playing event is done

        _sessionState.playClickedIntentExplicitExpected = KAutoPlayByDefaultDisable //Default auto play assumption is false
        _sessionState.switchesUp = {}
        _sessionState.switchesDown = {}

        _sessionState.isSeeking = false
        _sessionState.seekStartTime = KInvalidTime
        _sessionState.seekEndTime = KInvalidTime

        _sessionState.isBuffering = false
        _sessionState.bufferingStartTime = 0
        _sessionState.bufferingEndTime = 0
        _sessionState.bufferingDurationAtLastPing = 0
        _sessionState.bufferingDurationSession = 0
        _sessionState.bufferingCount = 0
        _sessionState.bufferingCountAtLastPing = 0
        _sessionState.playbackDurationAtLastPing = 0

        this._resetPlaybackDurationTimer()
    }


    _resetSessionState() {
        _impl._initAssetExternalMetadata()
        _impl._initAssetSourceMetadata()
        _impl._initSessionState()
    }

    _initialiseNewSession(player) {
        _impl._resetSessionState()
        _player = player
        _sessionActive = true
        _sessionState.sessionId = uuidv4()
    }

    _initNewSessionForSameAsset() {
        _impl._initSessionState()
        _sessionActive = true
        _sessionState.sessionId = uuidv4()
    }

    _clearSessionID() {
        _sessionState.sessionId = KDefaultSessionID
    }

    _getPlatform() {
        return _deviceInfo.platform
    }

    _getDeviceType() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            ? 'Mobile'
            : 'Web';
    }

    _getManufacturer() {
        return _deviceInfo.manufacturer
    }

    _getModel() {
        return _deviceInfo.model
    }

    _getNetworkType() {
        //TODO: Fixme
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var type = connection.effectiveType;
        return "Cellular-" + type.toUpperCase()
    }

    _getDuration() {
        try {
            return _player.getDuration() 
        } catch (error) {
           return 0 
        }
    }

    _getMitigationID() {
        return _mitigationID
    }

    _getMitigationApplicationTime() {
        return _mitigationApplicationTime
    }

    _getLocation() {
        return KDefaultLocation
    }

    _getUA() {
        return navigator.userAgent
    }

    _updateDeviceInfo() {
        var ua = navigator.userAgent
        if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) 
        {
            _deviceInfo.manufacturer = "Opera" 
        }
        else if(navigator.userAgent.indexOf("Edg") != -1 )
        {
            _deviceInfo.manufacturer = "Edge"
        }
        else if(navigator.userAgent.indexOf("Chrome") != -1 )
        {
            _deviceInfo.manufacturer = "Chrome"
        }
        else if(navigator.userAgent.indexOf("Safari") != -1)
        {
            _deviceInfo.manufacturer = "Safari"
        }
        else if(navigator.userAgent.indexOf("Firefox") != -1 ) 
        {
            _deviceInfo.manufacturer = "Firefox"
        }
        else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
        {
            _deviceInfo.manufacturer = "IE"
        }  
        else 
        {
            _deviceInfo.manufacturer = "unknown"
        }

        //TODO: parse UA to get the device information
        _deviceInfo.platform = "Web"
        _deviceInfo.deviceType = "Desktop"
        _deviceInfo.model = ""//"1.16"
    }

    _createCommonEventPayload() { 
        if (stopEvent=="STOPPED" || stopEvent=="ERROR") {
            return {
                version: KSchemaVersion,
                sdkVersion: KSDKVersion,
                player: _impl._getPlayerName(),
                playerApp: _impl._getApplicationName(),
                cdn: _impl._getCDN(),
                clientIP: _impl._getClientIP(),//md5(_impl._getClientIP()),
                provider: _impl._getProvider(),
                contentType: _impl._getContentType(),
                ueid: md5(_impl._getEmailID()),
                subscriberId: _impl._getSubscriberID(),
                udid: _impl._getUDID(),
               platform: _impl._getPlatform(),
               deviceType: _impl._getDeviceType(),
                manufacturer: _impl._getManufacturer(),
                model: _impl._getModel(),
                networkType: _impl._getNetworkType(),
                sessionId: _impl._getSessionID(),
                timestamp: _impl._getTimeStamp(),
                playbackPosInSec: 0,
                videoId: _impl._getVideoID(),
                assetDuration: _impl._getAssetDuration(),
               frameRate: _impl._getFrameRate(),
                aCodec: _impl._getACodec(),
                vCodec: _impl._getVCodec(),
               bitrate: _impl._getBitrate(),
               resolution: _impl._getResolution(),
                throughput: _impl._getThroughput(),
               live: _impl._getLive().toString(),
               mitigationID: _impl._getMitigationID(),
               mitigationApplTime: _impl._getMitigationApplicationTime(),
                location: _impl._getLocation(),
                ua: _impl._getUA(),
                videoTitle: _impl._getContentTitle(),//_impl._getVideoTitle(),
                playerVersion:_impl._getPlayerVersion(),
                durationOfPlayback:(_impl._getPlaybackDurationTotal()- _sessionState.playbackDurationAtLastPing),
                 stall:{
                    count: _sessionState.bufferingCount - _sessionState.bufferingCountAtLastPing,
                    duration:  (_sessionState.bufferingDurationSession - _sessionState.bufferingDurationAtLastPing)
                }
            };
        } else {
            return {
                version: KSchemaVersion,
                sdkVersion: KSDKVersion,
                player: _impl._getPlayerName(),
                playerApp: _impl._getApplicationName(),
                cdn: _impl._getCDN(),
                clientIP: _impl._getClientIP(),//md5(_impl._getClientIP()),
                provider: _impl._getProvider(),
                contentType: _impl._getContentType(),
                ueid: md5(_impl._getEmailID()),
                subscriberId: _impl._getSubscriberID(),
                udid: _impl._getUDID(),
               platform: _impl._getPlatform(),
               deviceType: _impl._getDeviceType(),
                manufacturer: _impl._getManufacturer(),
                model: _impl._getModel(),
                networkType: _impl._getNetworkType(),
                sessionId: _impl._getSessionID(),
                timestamp: _impl._getTimeStamp(),
                playbackPosInSec:_impl._getPlaybackPosInSec(),
                videoId: _impl._getVideoID(),
                assetDuration: _impl._getAssetDuration(),
               frameRate: _impl._getFrameRate(),
                aCodec: _impl._getACodec(),
                vCodec: _impl._getVCodec(),
               bitrate: _impl._getBitrate(),
               resolution: _impl._getResolution(),
                throughput: _impl._getThroughput(),
               has:_player.getStreamType().toUpperCase(),
               drm: _impl._getDRM(),
               live: _impl._getLive().toString(),
               mitigationID: _impl._getMitigationID(),
               mitigationApplTime: _impl._getMitigationApplicationTime(),
                location: _impl._getLocation(),
                ua: _impl._getUA(),
                videoTitle: _impl._getContentTitle(),//_impl._getVideoTitle(),
                playerVersion:_impl._getPlayerVersion(),
                durationOfPlayback:(_impl._getPlaybackDurationTotal()- _sessionState.playbackDurationAtLastPing),
                 stall:{
                    count: _sessionState.bufferingCount - _sessionState.bufferingCountAtLastPing,
                    duration:  (_sessionState.bufferingDurationSession - _sessionState.bufferingDurationAtLastPing)
                }
            };  
        }
        
        
  
  
    }
    _onSessionReady(e) {
        console.log("duration--0--",e);

        if (_enableLogging) {
        }       
      try {
        var has = _player.getStreamType().toUpperCase()
        var drm = KDefaultDRM // getSupportedDRM
        var live = _player.isLive().toString()
        var duration = _player.getDuration()
        _impl._setSourceMetadata(has, drm, live, duration)
      } catch (error) {
        var has = ""//_player.getStreamType().toUpperCase()
        var drm = KDefaultDRM // getSupportedDRM
        var live = "false"//_player.isLive().toString()
        var duration =0// _player.getDuration()
        _impl._setSourceMetadata(has, drm, live, duration)
      }
    }

    _getCompleteEvent() {
        stopEvent = "STOPPED"
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "STOPPED"
        evt.eventData = {}
        return evt
    }
    _getFinishEvent() {
        stopEvent = "STOPPED"
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "COMPLETED"
        evt.eventData = {}
        return evt
    }

    _onCompleteHandler(e) {
        // if (_enableLogging) {
        // }
        ondestroyFrequency = 20000000000
        console.log("complete----",);

        _impl._stopPlaybackDurationTimer()
        var evt = _impl._getFinishEvent()
        _impl._setPrevEvent("COMPLETED")
        if(!disable_qoe_beacons){
        _impl._sendEvent(evt)
        }

        _impl._cancelStallTrackingTimer()
        _impl._cancelPeriodicEvents()
        _impl._cancelStallTrackingTimer()
        _sessionActive = false
    }

    _onSourceUnloaded(e) {

        if (_enableLogging) {
        }
        _impl._stopPlaybackDurationTimer()
        this._teardownSession()
    }
    _onSourceLoaded(e){
        console.log('onSourceLoaded: ' + JSON.stringify(e));

       // console.log('onSourceLoaded: ' + JSON.stringify(_player.getConfig()));

    }

     _onDestroy(e) {
        if (_enableLogging) {
        }
    //     clearInterval(_pingTimer)
    //     clearInterval(_configTimer)
            KDefaultPrevEventCount = 1
        // _pingTimer = undefined;
        // _configTimer = undefined;
        var evt = _impl._getCompleteEvent()
         if(disable_qoe_beacons===false){
        _impl._sendEvent(evt)
        _impl._cancelPeriodicEvents()
        _impl._teardownSession()
        ondestroyFrequency =20000000000
        stopEvent = null

         }



    }

    _isSessionActive() {
        return _sessionActive
    }
    _getSblLevel() {
        try {
            if(typeof _player !== "undefined" && _player != null ) {
                return _player.buffer.getLevel('forwardduration', 'video').level
            }  else{
                return 0    
            }
        } catch (error) {
            return 0   
        }
    }

    _getRblLevel() {
        try {
            if(typeof _player !== "undefined" && _player != null ) {
                return _player.buffer.getLevel('backwardduration', 'video').level
            }else{
                return 0    
            }
        } catch (error) {
          return 0  
        } 
    }


    _getPlaybackDuration() {
        return {
            playbackDurationSinceLastPing: -1,
            playbackDurationSession: -1
        }
    }

    _getPingEvent(playbackDuration) {
        //Log buffering interval
        //Log play duration
        //var video = _player.getVideoElement()
        // _player.buffer.setTargetLevel('forwardduration',2, 'video')
        // _player.buffer.setTargetLevel('backwardduration',1, 'video')
        // console.log('onSourceLoaded:--abcdef-- ' + JSON.stringify(_player.getConfig()));
        //  console.log('forward =Ping=abcdef--SBL' + JSON.stringify(_player.buffer.getLevel('forwardduration', 'video')));
        //  console.log('backward-Ping-abcdef--RBL' + JSON.stringify(_player.buffer.getLevel('backwardduration', 'video')));
        //  console.log('--abcdef-Ping-bitrate--' + JSON.stringify(_player.getDownloadedVideoData().bitrate));

          try {
        if(disable_qoe_beacons===false){
            var evt = this._createCommonEventPayload()
            evt.totalDurationOfPlayback = playbackDuration;

            var currTime = _impl._getCurrentTimeInSec()
            evt.diffTime = _impl._timeDiff(currTime)
    
            //Frame   Loss Info
            evt.frameLoss = _player.getDroppedVideoFrames()
    
            //Playback Duration
            evt.durationOfPlayback = (playbackDuration - _sessionState.playbackDurationAtLastPing)    
            evt.totalStallDuration = _sessionState.bufferingDurationSession
             evt.stall = {
                 count: _sessionState.bufferingCount - _sessionState.bufferingCountAtLastPing,
                 duration: (_sessionState.bufferingDurationSession - _sessionState.bufferingDurationAtLastPing)
             }
    
            //Switch Info
            evt.totalSwitchesUp = Object.keys(_sessionState.switchesUp).length
            evt.totalSwitchesDown = Object.keys(_sessionState.switchesDown).length
            evt.switch = {}
            evt.switch.up = _sessionState.switchesUp
            evt.switch.down = _sessionState.switchesDown

            // _mitigationID = this._getStrV(KLocalStorageKeyMitigationID)
            // _mitigationApplicationTime = this._getIntV(KLocalStorageKeyMitigationApplicationTime)
            // _initialDownloadRate = this._getIntV(KLocalStorageKeyDownloadRate)
            // _startupBufferThreshold = this._getIntV(KLocalStorageKeyStartupThreshold)
            // _reBufferThreshold = this._getIntV(KLocalStorageKeyRebufferThreshold)
            //Mitigation config
            evt.sbl = _startupBufferThreshold //this._getIntV(KLocalStorageKeyStartupThreshold) //
            evt.rbl = _reBufferThreshold //this._getIntV(KLocalStorageKeyRebufferThreshold)//
            evt.sblLevel = _impl._getSblLevel()
            evt.rblLevel = _impl._getRblLevel()
            evt.mitigationID =_mitigationID // this._getStrV(KLocalStorageKeyMitigationID)//
            
            return evt
        }else{
            var evt = this._createCommonEventPayload()

           let obj={
                platform: evt.platform,
                deviceType: evt.deviceType,
                timestamp: evt.timestamp,  
            }
            return obj
        }
      } catch (error) {
        
      }
    //   setTimeout(() => {
    //     let bufferInfo = [
    //         _player.buffer.getLevel("forwardduration", "video"),
    //       //  _player.buffer.getLevel("backwardduration", "video"),
    //         // _player.buffer.getLevel("forwardduration", "audio"),
    //         // _player.buffer.getLevel("backwardduration", "audio")
    //     ];
    //     console.log(bufferInfo,"--abcdef");
    // }, 3000);
    // console.log('player: -provide bitmovin-abcde-miti-' + JSON.stringify(_player));
    // console.log('Rebuffering-Buffer-Length (seconds): -provide bitmovin -abcde-miti-' + _player.buffer.getLevel('forwardduration', 'video').targetLevel); 
  
       
    }

    _timeDiff(currPingTime) {
        if (_lastPingTime > 1 && (currPingTime > _lastPingTime)) {
            return currPingTime - _lastPingTime
        } else {
            //assertion failure ... 
        }
    }

    _startPeriodicEvents() {
        _lastPingTime = _impl._getCurrentTimeInSec()
      let  _pingTimerrr = setInterval(() => {
        _pingTimer = _pingTimerrr
             if(ondestroyFrequency===20000000000){
                clearInterval(_pingTimerrr)
             }else{
                _impl._sendPing();
             }
        }, _beaconFrequency);
    }
    _startStartMitigationEvents() {
      let  _configTimerrr = setInterval(() => {
        _configTimer = _configTimerrr;
            if(ondestroyFrequency===20000000000){
                clearInterval(_configTimerrr)
             }else{
                _impl._sendMitigation();
             }
        }, _mitigationFrequency);
    }
    _cancelPeriodicEvents() {
        if (_pingTimer != null) {
            clearInterval(_pingTimer)
        }
        if (_configTimer != null) {
            clearInterval(_configTimer)
        }
    }

    _sendMitigation(){
        if(disable_mitigation_poll==false){
            fetch(KGETMitigationEndpoint, {
                method: "POST",
                body: JSON.stringify({
                    configRequest: {
                        version: KSchemaVersion,
                        udid: _impl._getUDID(),
                        ueid: md5(_impl._getEmailID()),
                        mitigationCfgID: _impl._getMitigationID(),
                        mitigationApplTime: _impl._getMitigationApplicationTime(),
                        clientIP:_impl._getClientIP(),// md5(_impl._getClientIP()),
                        ua: _impl._getUA(),
                    },
                    "err": null
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((json) => {
                    
                     //this.setState({ mc: json })
                     
                     if (json.mitigation_config_response.mc != null && json.mitigation_config_response.mc  != undefined ) {
                        console.log("miti--1--",json.mitigation_config_response.mc);
                        this._processMitigationConfig(json.mitigation_config_response.mc)

                        //overide the rbl and sbl on mitigation from _processMitigationConfig
                        this._persistKIntVP(KLocalStorageKeyStartupThreshold, playerConfig.buffer.setTargetLevel('forwardduration',_startupBufferThreshold, 'video'))
                        this._persistKIntVP(KLocalStorageKeyRebufferThreshold, playerConfig.buffer.setTargetLevel('backwardduration',_reBufferThreshold, 'video'))
                    }
                    
                    // else{

                    //     //  _startupBufferThreshold =  _player.buffer.getLevel('forwardduration', 'video').level //this._getIntV(KLocalStorageKeyStartupThreshold) //
                    //     // _reBufferThreshold = parse

                    //     // console.log('Startup-Buffer-Length (seconds):--abcde-- ' + _player.buffer.getLevel('forwardduration', 'video').level);
                    //     // console.log('Startup Bitrate: --abcde--' + _player.getDownloadedVideoData().bitrate);
                    //     // console.log('Rebuffering-Buffer-Length (seconds): --abcde--' + _player.buffer.getLevel('forwardduration', 'video').targetLevel); 
            
                    // }

                })
                .catch((err) => console.log("error event--", err))
           }


    }

    _sendPing() {
      
        stopEvent = null
        var currTime = _impl._getCurrentTimeInSec()
        var timeDiff = _impl._timeDiff(currTime)

        var playbackDuration = _impl._getPlaybackDurationTotal()
        var event = _impl._getPingEvent(playbackDuration)
        var strEvent = JSON.stringify({
            ping: event,
        }, function (key, value) {
            // limit precision of floats
            if (typeof value === 'number') {
                return parseFloat(value.toFixed(2));
            }
            return value;
        })

        _sessionState.playbackDurationAtLastPing = playbackDuration
        _sessionState.bufferingDurationAtLastPing = _sessionState.bufferingDurationSession
        _sessionState.bufferingCountAtLastPing = _sessionState.bufferingCount

        _lastPingTime = currTime
        _sessionState.switchesDown = {}
        _sessionState.switchesUp = {}

        if (_enableLogging) {
        }

        if (event) {
            fetch(_beaconUrl, {
                method: "POST",
                body: strEvent,
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
            })
                .then((response) => response.json())
                .then((json) =>{
                    disable_qoe_beacons = json.disable_qoe_beacons
                    disable_mitigation_poll = json.disable_mitigation_poll
                });
        }
    }

    _sendEvent(evt) {
        if (_enableLogging) {
        }
        ondestroyFrequency = 0;
        if (evt) {
            var payload = JSON.stringify({ event: evt }, function (key, value) {
                // limit precision of floats
                if (typeof value === 'number') {
                    return parseFloat(value.toFixed(2));
                }
                return value;
            })
            if (_enableLogging) {
            }

            fetch(_beaconUrl, {
                method: "POST",
                body: payload,
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
            })
                .then((response) => response.json())
                .then((json) => {
                    disable_qoe_beacons = false// json.disable_qoe_beacons
                    disable_mitigation_poll = false// json.disable_mitigation_poll
                })
                .catch((err) => console.log("error event--", err))
        }
    }

    _getPlayClickedEvent() {
        stopEvent = null
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "PLAYCLICKED"
        _impl._startPeriodicEvents()
        _impl._startStartMitigationEvents()
        return evt
    }

    _onPlayHandler(e) {
        if (_enableLogging) {
        }

        try {
            // console.log('forward =_onPlayHandler=abcdef--SBL' + JSON.stringify(_player.buffer.getLevel('forwardduration', 'video')));
            // console.log('backward-_onPlayHandler-abcdef--RBL' + JSON.stringify(_player.buffer.getLevel('backwardduration', 'video')));
            // console.log('--abcdef-_onPlayHandler-bitrate--' + JSON.stringify(_player.getDownloadedVideoData().bitrate));
    
    
            _impl._stopPlaybackDurationTimer()
        if (!_impl._isSessionActive()) {
            _impl._initNewSessionForSameAsset(_player)
        }

        if (_sessionState.playClickedIntentExplicitExpected == true) {
            _sessionState.playClickedIntentExplicitExpected = false
            _sessionState.playIntentTime = _impl._getCurrentTimeInSec()
        }
        if (_impl._getPrevEvent() === KDefaultPrevEvent && KDefaultPrevEventCount === 1) {
            KDefaultPrevEventCount = 2;
            var evt = _impl._getPlayClickedEvent()
            if(disable_qoe_beacons===false){
                _impl._sendEvent(evt)
                }
          _impl._setPrevEvent("PLAYCLICKED")
          
        //   _impl._startPeriodicEvents()
        //   _impl._startStartMitigationEvents()

       }
       else if(_impl._getPrevEvent()=="NA" && KDefaultPrevEventCount === 2){
         var evt = _impl._getPlayClickedEvent()
        // if(disable_qoe_beacons===false){
        //     _impl._sendEvent(evt)
        //     }
        // _impl._startPeriodicEvents()
        // _impl._startStartMitigationEvents()
      _impl._setPrevEvent(evt.eventPrev)
    }
    try {
        var has = _player.getStreamType().toUpperCase()
        var drm = KDefaultDRM // getSupportedDRM
        var live = _player.isLive().toString()
        var duration = _player.getDuration()
        _impl._setSourceMetadata(has, drm, live, duration)
      } catch (error) {
        var has = ""//_player.getStreamType().toUpperCase()
        var drm = KDefaultDRM // getSupportedDRM
        var live = "false"//_player.isLive().toString()
        var duration =0// _player.getDuration()
        _impl._setSourceMetadata(has, drm, live, duration)
      }
        
        _impl._setUpStallTrackingTimer()
        } catch (error) {
          //  console.log("_onPlayHandler--",error);
 
        }
    };

    _getPlayingEvent(latency) {
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()

        try {
        var has = _player.getStreamType().toUpperCase()
        var drm = KDefaultDRM // getSupportedDRM
        var live = _player.isLive().toString()
        var duration = _player.getDuration()
        _impl._setSourceMetadata(has, drm, live, duration)

        evt.event = "STARTED"
        evt.eventData = {}
        evt.eventData.latency = latency
        return evt
      } catch (error) {
        var has = ""//_player.getStreamType().toUpperCase()
        var drm = KDefaultDRM // getSupportedDRM
        var live = "false"//_player.isLive().toString()
        var duration =0// _player.getDuration()
        _impl._setSourceMetadata(has, drm, live, duration)

        evt.event = "STARTED"
        evt.eventData = {}
        evt.eventData.latency = latency
        return evt
      }

      
    }

    _getSeekedEvent(seek_duration) {
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "SEEKED"
        evt.eventData = {}
        evt.eventData.vrt = seek_duration
        return evt
    }

    _getResumedEvent() {
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "RESUMED"
        evt.eventData = {}
        return evt
    }

    _handleBufferingCompletion() {
        if (_sessionState.isBuffering) {
            _sessionState.bufferingEndTime = _impl._getCurrentTimeInSec()
            _impl._onStopBufferingHandler()
            _sessionState.isBuffering = false
        }
    }

    _onPlayingHandler(e) {
        if (_enableLogging) {
        }

         try {

            // console.log('forward =_onPlayingHandler=abcdef--SBL' + JSON.stringify(_player.buffer.getLevel('forwardduration', 'video')));
            // console.log('backward-_onPlayingHandler-abcdef--RBL' + JSON.stringify(_player.buffer.getLevel('backwardduration', 'video')));
            // console.log('--abcdef-_onPlayingHandler-bitrate--' + JSON.stringify(_player.getDownloadedVideoData().bitrate));
    
     
            
        _impl._startPlaybackDurationTimer()
        _impl._cancelStallTrackingTimer()
        var playingTime = _impl._getCurrentTimeInSec()
        
        if (_impl._getPrevEvent() == "PLAYCLICKED") {
            _sessionState.playClickedIntentExplicitExpected = false
            if (_sessionState.playIntentTime > playingTime) {
            }
            var latency = playingTime - _sessionState.playIntentTime
            var evt = _impl._getPlayingEvent(latency)
            if(disable_qoe_beacons===false){//commented, due to duplicate playClicked in payload
                _impl._sendEvent(evt)
                }
            _impl._setPrevEvent("STARTED")
            // _impl._startPeriodicEvents()
        }
        else if (_impl._getPrevEvent() == "PAUSED" ) {

            var evt = _impl._getResumedEvent()
            if(disable_qoe_beacons===false){
                _impl._sendEvent(evt)
                }
            _impl._setPrevEvent("RESUMED")
        }
        else if(_impl._getPrevEvent()=="NA" && KDefaultPrevEventCount === 2){
            var evt = _impl._getPlayClickedEvent()
        //     if(disable_qoe_beacons===false){
        //         _impl._sendEvent(evt)
        //         }
        //         KDefaultPrevEventCount = 3
           _impl._setPrevEvent(evt.eventPrev)
        }
        // _impl._handleBufferingCompletion()
         } catch (error) {
            console.log("_onPlayingHandler--",error);

         }
    }

    _getPausedEvent() {
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "PAUSED"
        evt.eventData = {}
        return evt
    }

    _onPauseHandler(e) {
        if (_enableLogging) {
        }
        _impl._stopPlaybackDurationTimer()
        _impl._cancelStallTrackingTimer()
        if (_impl._getPrevEvent() === KDefaultPrevEvent && KDefaultPrevEventCount === 1) {
            KDefaultPrevEventCount = 2
            var evt = _impl._getPlayClickedEvent()
            if(disable_qoe_beacons===false){
                _impl._sendEvent(evt)
                }
          _impl._setPrevEvent("PLAYCLICKED")

       }else if(_impl._getPrevEvent() !== KDefaultPrevEvent && KDefaultPrevEventCount === 2){
        var evt = _impl._getPausedEvent()
        if(disable_qoe_beacons===false){
            _impl._sendEvent(evt)
            }
        _impl._setPrevEvent("PAUSED")
       }
    }

    _onStallStartedHandler(e) {
        if (_enableLogging) {
        }
        _impl._stopPlaybackDurationTimer()
        _impl._cancelStallTrackingTimer()
        _impl._onStartBufferingHandler()
    }

    _onStallEndedHandler(e) {
        if (_enableLogging) {
        }
        _impl._handleBufferingCompletion()
        _impl._cancelStallTrackingTimer()
    }

    _onDownloadFinished(e) {

        if (e.mimeType && e.mimeType.indexOf("video") > -1) {
            let downloadRate = parseFloat(
                ((e.size * 8) / (e.downloadTime))
            ); //bps 
            _impl._setThroughput(downloadRate)
        }
    }

    _logSwitch(srcQuality, targetQuality, timestamp) {
        if (srcQuality == null) {
            srcQuality = {}
            srcQuality.bitrate = 0
        }
        if (targetQuality == null) {
            return
        }
        if (srcQuality.bitrate > targetQuality?.bitrate) {
            _sessionState.switchesDown[timestamp] = targetQuality?.bitrate
        } else if (srcQuality.bitrate < targetQuality?.bitrate) {
            _sessionState.switchesUp[timestamp] = targetQuality?.bitrate
        } else {
            if (_enableLogging) {
            }
        }
    }

    _onVideoDownloadQualityChanged(e) {

     //   console.log("_onVideoDownloadQualityChanged-abcdef--",e.targetQuality);
        if (_enableLogging) {
        }
       try {

       // e?.targetQuality?.bitrate = 50000
        var lastBitrate = e?.targetQuality?.bitrate
        var lastFrameRate = e?.targetQuality?.frameRate
        var ht = e?.targetQuality?.height
        var wd = e?.targetQuality?.width
        _impl._logSwitch(e?.sourceQuality, e?.targetQuality, _impl._getCurrentTimeInSec())
        var lastResolution = KDefaultResolution

        if (ht != null && ht != undefined && wd != undefined && wd != null) {
            lastResolution = wd.toString() + "x" + ht.toString()
        }
        _sessionState.bitrate = lastBitrate
        _sessionState.resolution = lastResolution
        _impl._setVideoRepresentationMetadata(0, lastBitrate, lastResolution, 0, 0)

       } catch (error) {
        console.log("qualityChange--",error);
       }
    }

    // Since there are no stall events during play / playing; seek / seeked; timeShift / timeShifted we need
    // to track stalling state between those events. To prevent tracking eg. when seeking in buffer we delay it.
    _setUpStallTrackingTimer() {
        _stallTrackingTimer = setTimeout(() => {
             _impl._onStartBufferingHandler()
        }, KStallTrackingDelayMS);
    }

    _cancelStallTrackingTimer() {
        if (_enableLogging) {
        }
        clearInterval(_stallTrackingTimer)
    }

    _getBufferingEvent() {
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "BUFFERING"
        evt.eventData = {}
        return evt
    }

    _onStartBufferingHandler() {
        if (_enableLogging) {
        }

        if (_sessionState.isSeeking == false) { //Do not send buffering while seek is in progress.
            _sessionState.bufferingStartTime = _impl._getCurrentTimeInSec()
            if (_impl._getPrevEvent() === KDefaultPrevEvent && KDefaultPrevEventCount === 1) {
                KDefaultPrevEventCount = 2
                var evt = _impl._getPlayClickedEvent()
                if(disable_qoe_beacons===false){
                    _impl._sendEvent(evt)
                    }
              _impl._setPrevEvent("PLAYCLICKED")
            //   _impl._startPeriodicEvents()
            //   _impl._startStartMitigationEvents()
           }else if(_impl._getPrevEvent() !== KDefaultPrevEvent && KDefaultPrevEventCount === 2){
            var evt = _impl._getBufferingEvent()
            if(disable_qoe_beacons===false){
                _impl._sendEvent(evt)
                }
            _impl._setPrevEvent("BUFFERING")
           }
            _sessionState.isBuffering = true
        }
    }

    _onStopBufferingHandler() {
        if (_sessionState.bufferingEndTime > _sessionState.bufferingStartTime) {
            _sessionState.bufferingCount = _sessionState.bufferingCount + 1
            _sessionState.bufferingDurationSession = _sessionState.bufferingDurationSession + (_sessionState.bufferingEndTime - _sessionState.bufferingStartTime)
        } else {
            console.log("Assertion Failue - Buffering : ", _sessionState.bufferingStartTime, "-", _sessionState.bufferingEndTime)
        }
    }

    _onSeek(e) {

        if (_enableLogging) {
        }

        _sessionState.isSeeking = true
        _sessionState.seekStartTime = _impl._getCurrentTimeInSec()
        _sessionState.seekEndTime = KInvalidTime

        _impl._handleBufferingCompletion() //If buffering was ongoing just before seek, this will terminate buffering. 
        _impl._setUpStallTrackingTimer()
    }

    _reportSeekedEvent(vrt) {
           
        if (_impl._getPrevEvent() === KDefaultPrevEvent && KDefaultPrevEventCount === 1) {
            KDefaultPrevEventCount = 2
            var evt = _impl._getPlayClickedEvent()
            if(disable_qoe_beacons===false){
                _impl._sendEvent(evt)
                }
          _impl._setPrevEvent("PLAYCLICKED")

       }else if(_impl._getPrevEvent() !== KDefaultPrevEvent && KDefaultPrevEventCount === 2){
        var evt = _impl._getSeekedEvent(vrt)
        
        if(disable_qoe_beacons===false){
            _impl._sendEvent(evt)
            }
        _impl._setPrevEvent("SEEKED")
       }
    }

    _onSeeked(e) {
        if (_enableLogging) {
        }
        _sessionState.seekEndTime = _impl._getCurrentTimeInSec()
        _sessionState.vrt = _sessionState.seekEndTime - _sessionState.seekStartTime
        _sessionState.isSeeking = false
        _impl._reportSeekedEvent(_sessionState.vrt)
        _impl._cancelStallTrackingTimer()
    }

    _onTimeShift(e) {
        if (_enableLogging) {
        }
        _impl._setUpStallTrackingTimer()
    }

    _onTimeShifted(e) {
        if (_enableLogging) {
        }
        _impl._cancelStallTrackingTimer()
    }

    _getErrorEvent(e) {
        var evt = _impl._createCommonEventPayload()
        evt.eventPrev = _impl._getPrevEvent()
        evt.event = "ERROR"
        evt.eventData = {}
        if(e){
            evt.eventData.desc = {}
            evt.eventData.desc.ErrorCode = e.data.statusCode.toString()
            evt.eventData.desc.ErrorName = e.name
            evt.eventData.desc.ErrorDetails = e.message

        }
        return evt
    }

    _onErrorHandler(e) {
        // if (_enableLogging) {
        // }
        var evt = _impl._getErrorEvent(e)
        console.log("_onErrorHandler",evt);

        if(disable_qoe_beacons===false){
            _impl._sendEvent(evt)
            }
        _impl._setPrevEvent("ERROR")
        _impl._cancelPeriodicEvents()
        _impl._cancelStallTrackingTimer()
        clearImmediate(_pingTimer)
        clearImmediate(_configTimer)
    }

    _getMitigationConfigurationAvailable() {
        // return _mitigationID != KDefaultMitigationID
        //Lets always be in control of configurations
        return true
    }

    _persistMitigationConfigToStorage(pendingMitigationID, pendingMitigationDownloadRate, pendingMitigationStartupThreshold, pendingMitigationRebufferThreshold) {
        this._persistKStrVP(KLocalStorageKeyMitigationID, pendingMitigationID)
        this._persistKIntVP(KLocalStorageKeyDownloadRate, pendingMitigationDownloadRate)
        this._persistKIntVP(KLocalStorageKeyStartupThreshold, pendingMitigationStartupThreshold)
        this._persistKIntVP(KLocalStorageKeyRebufferThreshold, pendingMitigationRebufferThreshold)

        // _mitigationID = this._getStrV(KLocalStorageKeyMitigationID)
        // _mitigationApplicationTime = this._getIntV(KLocalStorageKeyMitigationApplicationTime)
        // _initialDownloadRate = this._getIntV(KLocalStorageKeyDownloadRate)
        // _startupBufferThreshold = this._getIntV(KLocalStorageKeyStartupThreshold)
        // _reBufferThreshold = this._getIntV(KLocalStorageKeyRebufferThreshold)

       // console.log(_mitigationID,_mitigationApplicationTime,_initialDownloadRate,_startupBufferThreshold,_reBufferThreshold,'test')
    
    }

    _loadMitigationConfigFromStorage() {
        if (_enableLogging) {
        }
        _mitigationID = this._getStrV(KLocalStorageKeyMitigationID)
        _mitigationApplicationTime = this._getIntV(KLocalStorageKeyMitigationApplicationTime)
        _initialDownloadRate = this._getIntV(KLocalStorageKeyDownloadRate)
        _startupBufferThreshold = this._getIntV(KLocalStorageKeyStartupThreshold)
        _reBufferThreshold = this._getIntV(KLocalStorageKeyRebufferThreshold)

        //console.log(_mitigationID,_mitigationApplicationTime,_initialDownloadRate,_startupBufferThreshold,_reBufferThreshold,'test8')
        

        if (_mitigationID == null || _initialDownloadRate < 0 || _startupBufferThreshold < 0 || _reBufferThreshold < 0) {
            this._setMitigationConfigToDefaults()
            this._persistMitigationConfigToStorage(_mitigationID, _initialDownloadRate, _startupBufferThreshold, _reBufferThreshold)
        }
    }

    _readAndFinializeMitigationConifg() {
       try {
        this._loadMitigationConfigFromStorage()
        _mitigationApplicationTime = this._getCurrentTimeInSec()
        this._persistKIntVP(KLocalStorageKeyMitigationApplicationTime, _mitigationApplicationTime)
       } catch (error) {
        console.log("read--",error);
       }
    }

    _processMitigationConfig(mitigation_config) {
        if (mitigation_config != null) {
            this._persistMitigationConfigToStorage(mitigation_config.mitigationID, mitigation_config.estimatedDownloadRate, mitigation_config.startupBuffDuration, mitigation_config.rebufferingDuration)
            this._persistKIntVP(KLocalStorageKeyMitigationApplicationTime, KLocalStorageKeyMitigationApplicationTimeVal)
        }
    }

    _setMitigationConfigToDefaults() {
        _mitigationID = KDefaultMitigationID
        _mitigationApplicationTime = KLocalStorageKeyMitigationApplicationTimeVal
        _initialDownloadRate = KDefaultDownloadRate
        _startupBufferThreshold = KDefaultStartupBufferThreshold
        _reBufferThreshold = KDefaultRebufferThreshold
    }

    _processRegistrationResponse(response) {
        stopEvent= null
        _beaconFrequency = 20*1000
        _mitigationFrequency = 20*1000

        if (response != null && response.registration_response != null) {
            if (response.registration_response.bu != null) {
                 _beaconUrl = `${response.registration_response.bu}/api/analysis`
               // _beaconUrl =KSendBeaconDefaultEndpoint// KSendBeaconDefaultEndpointNew
            }else{
                _beaconUrl =KSendBeaconDefaultEndpoint// KSendBeaconDefaultEndpointNew  
            }
            KDefaultPrevEventCount === 1//set to default

            if (response.registration_response.kaInterval != null) {
                _beaconFrequency = parseInt(response.registration_response.kaInterval)*1000
            }else{
                _beaconFrequency = 20*1000
            }
            if(response.registration_response.kcInterval != null){
                _mitigationFrequency = parseInt(response.registration_response.kcInterval)*1000
            }else{
                _mitigationFrequency = 20*1000
            }
            //TODO: process server clock
            if (response.registration_response.cfg != null && response.registration_response.cfg != undefined && response.registration_response.cfg.mc != null && response.registration_response.cfg.mc != undefined) {
                if(response.registration_response.cfg.mc.estimatedDownloadRate ==-1 && response.registration_response.cfg.mc.startupBuffDuration == -1 && response.registration_response.cfg.mc.rebufferingDuration == -1){
                    this._persistKStrVP(KLocalStorageKeyMitigationID, response.registration_response.cfg.mc.mitigationID)
                    this._persistKIntVP(KLocalStorageKeyDownloadRate, 80000)    
                    this._persistKIntVP(KLocalStorageKeyStartupThreshold, 2)
                    this._persistKIntVP(KLocalStorageKeyRebufferThreshold, 4)


                 }else{
                    this._processMitigationConfig(response.registration_response.cfg.mc)
                 }
        
            }
        }
    }

    async _registerforMitigation(ip) {
        let options = {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                req: {
                    "ueid": md5(this._getEmailID()),
                    "udid": this._getUDID(),
                    "clientClock": this._getCurrentTimeInMilliSec(),
                    "mitigationCfgId": _mitigationID,
                    "mitigationApplTime": _mitigationApplicationTime == -1 ? 0 : _mitigationApplicationTime,  
                    "clientIP": _clientIP,
                    "ua": navigator.userAgent,
                    "version": "1.0.0"
                },
            })
        }

        let response = fetch(KDoRegistrationEndpoint, options)
            .then(res => res.json().then(response => { console.log("registration response =>", response); 
            this._processRegistrationResponse(response) }))
            
            .catch(function () { console.log("Registration with platform failed") })
    };

    async _getIP() {
      try {
        let responseip = await fetch(KGetIPEndpoint)
        let ipadressss = await responseip.json();
        return ipadressss;
      } catch (error) {
        
      }
    }

    //Top level functions
    registerApplication(applicationProperties) {
        if (_enableLogging) {
            console.log("Register Application In", applicationProperties)
            for (const item in applicationProperties) {
                console.log(item)
            }
        }
        _appProperties = applicationProperties

        this._getIP().then(res1 => {
            _clientIP = res1.ip
            if (_enableLogging) {
                console.log("ip=> " + _clientIP)
            }
            _impl._loadMitigationConfigFromStorage()
            _impl._updateDeviceInfo()
            _impl._registerforMitigation(res1.ip);
        });
    }

    getMitigationConfiguration(playerConfig) {

     try {
        // if (_enableLogging == true) {
        //     console.log("Get Config In", playerConfig)
        //     for (const item in playerConfig) {
        //         console.log(item,'ok 123')
        //     }
        // }

       // console.log("playerConfig-abcdef-",JSON.stringify(playerConfig));
       // console.log("playerConfig-abcdef-",playerConfig.adaptation );

        this._readAndFinializeMitigationConifg()


        if (this._getMitigationConfigurationAvailable() == true) {
            var bitratekbps = _initialDownloadRate / 1024
            playerConfig.adaptation = {}
            playerConfig.adaptation.desktop = {}
            playerConfig.adaptation.mobile = {}
            //playerConfig.adaptation.tweaks = {}
           
            playerConfig.adaptation = {
                desktop: {
                  startupBitrate:  bitratekbps.toString() + "kbps",

                },
                mobile: {
                  startupBitrate: bitratekbps.toString() + "kbps",
                },
              }
            //   playerConfig.buffer = {
			// 	video: {
			// 		forwardduration: _startupBufferThreshold,
			// 		backwardduration: _reBufferThreshold
			// 	}
			// }
            setTimeout(() => {
             playerConfig.buffer.setTargetLevel('forwardduration',_startupBufferThreshold, 'video')
             playerConfig.buffer.setTargetLevel('backwardduration',_reBufferThreshold, 'video')

            
            }, 3000);

           // return playerConfig
        }
       
     } catch (error) {
        //if playerConfig having null value
      //  return playerConfig

     }
    }

    _setPlayerHandlers() {
        if (_enableLogging) {
        }
        try {

           if(typeof _player !== "undefined" && _player != null ) {

            _player.on(PlayerEvent.Ready, _impl._onSessionReady);
            _player.on(PlayerEvent.PlaybackFinished, _impl._onCompleteHandler);
            _player.on(PlayerEvent.SourceUnloaded, _impl._onSourceUnloaded);
            _player.on(PlayerEvent.Destroy, _impl._onDestroy);
            _player.on(PlayerEvent.SourceLoaded, _impl._onSourceLoaded);

            _player.on(PlayerEvent.Play, _impl._onPlayHandler); //Intent to play (except when autoplay is true)
            _player.on(PlayerEvent.Playing, _impl._onPlayingHandler); //Player actually started playback
            _player.on(PlayerEvent.Paused, _impl._onPauseHandler);
    
            _player.on(PlayerEvent.StallStarted, _impl._onStallStartedHandler);
            _player.on(PlayerEvent.StallEnded, _impl._onStallEndedHandler);
    
            _player.on(PlayerEvent.DownloadFinished, _impl._onDownloadFinished);
    
            _player.on(PlayerEvent.VideoPlaybackQualityChanged, _impl._onVideoDownloadQualityChanged);
    
            _player.on(PlayerEvent.Seek, _impl._onSeek);
            _player.on(PlayerEvent.Seeked, _impl._onSeeked);
    
            _player.on(PlayerEvent.TimeShift, _impl._onTimeShift);
            _player.on(PlayerEvent.TimeShifted, _impl._onTimeShifted);
    
            _player.on(PlayerEvent.Error, _impl._onErrorHandler);
   
           }
        } catch (error) {
            console.log("setUplayehandler-3-abcd-",error);
   
        } 
    }

    registerPlaybackSession(assetProperties, player, playClickExpected) {
        
      try {
        if (_enableLogging) {
            for (const item in assetProperties) {
                console.log(item)
            }

            // _configTimer = setInterval(() => {

                  //if disable_mitigation_poll true then don't run this api
                  
                
            // }, _mitigationFrequency * 1000)//_beaconFrequency );
        }

        _impl._loadMitigationConfigFromStorage()

        if (_mitigationApplicationTime == KLocalStorageKeyMitigationApplicationTimeVal) {
            this._setMitigationConfigToDefaults()
        }

        if (typeof player !== "undefined" && player != null) {
            this._initialiseNewSession(player)
            _assetProperties = assetProperties
            this._updateSessionExternalMetadata()
        }

        if (playClickExpected != undefined) {
            if (playClickExpected == false) {
                _sessionState.playIntentTime = this._getCurrentTimeInSec()
            }
            _sessionState.playClickedIntentExplicitExpected = playClickExpected
        }

        this._setPlayerHandlers()
      } catch (error) {
        console.log("registerPlaybackSession-3-abcd-",error);

      }
    }

    unregisterApplication() {
    }

    reportError(errCode, errDescription) {
        console.log("reportError In", errCode, errDescription)
    }
}

export class TSAnalyticsMitigtionSDK {

    enableDebugLogging(enable = false) {
        _enableLogging = enable
    }

 //  constructor(){

//     var jQueryScript = document.createElement('script');  
//     jQueryScript.setAttribute('src','https://cdn.bitmovin.com/player/web/8/bitmovinplayer.js');
//     document.head.appendChild(jQueryScript);
//    }

    //Application is expected to call this function in the beginning before making call for any playback session
    //Also, whenever any property of application changes, it need to be passed in
    //Application properties accepted, and processed are:
    //ApplicationName : Name of application with version in the format $ApplicationName:Version. For example: TSBinge:1.0.0
    //PlayerName : Name of player with version in the format $PlayerName:Version. For example: Bitmovin:8.4
    //UEID: Email ID of the user. For example: guest@gmail.com. Please note that whenever ueid changes(due to different login), registerApplication should be called again
    registerApplication(applicationProperties) {
        
      try {
        if (_impl == null) {
            _impl = new TSAnalyticsMitigtionSDKImpl();
        }
        
        _impl.registerApplication(applicationProperties)
      } catch (error) {
        console.log("registerApplication-3-abcd-",error);

      }
    }

    //Assumption: Application is making new instance of player for every playback session
    //Before the start of the playback session. Application is expected to make call to this function, and get the modified configuration to be used for the player
    //This configuration will update the adapation and the tweaks of the configuration
    getMitigationConfiguration(playerConfig) {
       try {
        return _impl.getMitigationConfiguration(playerConfig)
       } catch (error) {
       }
    }

    //Whenever playback session starts, the properties of the asset should be set in this call
    //Playback session properties accepted, and processed are:
    //AssetID : ID of the asset
    //Provider: Provider of the asset. For example : Hotstar, Eros etc
    //CDN: CDN used for the playback session
    registerPlaybackSession(assetProperties, player, playclickExpected) {
      //  _configTimer = setInterval(() => {
           try {
            _impl.registerPlaybackSession(assetProperties, player, playclickExpected)
           } catch (error) {
            console.log("registerPlaybackSession-3-abcd-",error);

           }
          //   }, _mitigationFrequency * 1000)//_beaconFrequency );

    }

    //When the application is stopped, it should call unregisterApplication. 
    //This will help with proper cleanup
    unregisterApplication() {
        console.log("Unregister the application")
        _impl.unregisterApplication()
    }

    //Application can send the error event to the SDK
    reportError(errCode, errDescription) {
        console.log("reportError In", errCode, errDescription)
        _impl.reportError(errCode, errDescription)
    }
}
