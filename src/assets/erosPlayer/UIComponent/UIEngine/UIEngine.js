/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */

// var Component = videojs.getComponent('Component');
function logituitUiEngine() {
  var DesktopWrapper;
  var me;
  var isTvApp = true;
  // var me.videoPlaying = '';
  var isMiniplayerEnabled = false;
  var logixdocument = document;
  var selectedSeason = 0;
  var selectedEpisode = 0;
  var mobile;
  var iOSdev;
  this.volumeIconTimer; 
  var liveFlag = true;
  var landscapeMode;
  var setNextVideoVolume;
  var ismute;
  // var player = videojs('erosPlayerUI',{fluid:true,aspectRatio: '16:9'});
  //videoUrl: "https://content.uplynk.com/5bc38f7536d0425f87723ddd5fd2b59d.m3u8",
  //  player.src({src:"https://content.uplynk.com/5bc38f7536d0425f87723ddd5fd2b59d.m3u8",type: 'application/x-mpegURL'})

  //  player.src({src:"https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",type: 'application/x-mpegURL'})
  //player.src({src:"https://d2zihajmogu5jn.cloudfront.net/elephantsdream/hls/ed_hd.m3u8",type: 'application/x-mpegURL'})
  // player.poster("https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/art-of-motion_poster.jpg")
  this.UIEngine = videojs.extend(videojs.getComponent('Component'), {
    constructor: function (player, options, eventManager) {
      try {
        videojs.getComponent('Component').apply(this, arguments);
        me = this;
        this.eventManager = eventManager;
        this.player = player;
        mobile = me.isMobile();
        iOSdev = me.iOSDevice();
        landscapeMode = me.isLandscape();
        //  this.setLiveFlag(liveFlag)
        this.playerState = "";
        this.baseOptions = options;
        this.uiStyleOption;
        this.videoPlaying = '';
        // let audioTracks = me.player.audioTracks_.tracks_;
        // let tracks = this.player.textTracks();
        // this.player.textTracks().tracks_.forEach(function (element) {
        //   if (element.default || element.mode == 'showing')
        //     me.eventManager.selectedSubtitleLanguage = element.language;
        // })        

        // new changes
        let defaultSub =  me.baseOptions.defaultSubtitle;
        let tracks = me.player.textTracks_.tracks_;
          let givenDefaultMatches = false;
       //   if(defaultSub != (null || undefined) && !(defaultSub === "")){     
        if(defaultSub != (null || undefined) && !(defaultSub === "") && !me.getSubtitleLanguage()){
            tracks.forEach(function (element) {
              if(defaultSub == element.language){
                givenDefaultMatches = true;
                // me.eventManager.selectedSubtitleLanguage = element.label;
              }
            });
          }
          if(!givenDefaultMatches && !me.getSubtitleLanguage()) {
            tracks.forEach(function (element) {
              if(element.label == "Off"){
                // me.eventManager.selectedSubtitleLanguage = element.label;
              }
            })
            let tracksArray = me.player.textTracks();
            var defaultChecked = me.getSubtitleLanguage();
            tracksArray.tracks_.forEach(function (element, index) {
              if (defaultChecked == element.label) {
                if(tracks.tracks_[index].language =="off"){
                tracksArray.tracks_[index].mode = "disabled";
                }
              } else {
                tracksArray.tracks_[index].mode = "disabled";
              }
            });
            // let defaultSubtitle = false;
            // tracks.forEach(function (element) {
            //   if(element.default || element.mode == 'showing'){
            //     defaultSubtitle = true;
            //     me.eventManager.selectedSubtitleLanguage = element.label;
            //   }
            // });
            // if(!defaultSubtitle){
            //   tracks.forEach(function (element) {
            //     if(element.label == "Off"){
            //       me.eventManager.selectedSubtitleLanguage = element.label;
            //     }
            //   })
            // }
          }
          if (me.isMobile()) {
            let tracksArray = me.player.textTracks();
            var defaultChecked = me.getSubtitleLanguage();
            tracksArray.tracks_.forEach(function (element, index) {
              if (defaultChecked == element.label) {
                if(tracks && tracks.tracks_ && tracks.tracks_[index].language =="off"){   
                  tracksArray.tracks_[index].mode = "disabled";
                }
              } else {
                tracksArray.tracks_[index].mode = "disabled";
              }
            });
          }

          try{
            if(me.isMobile()){
              document.querySelector("html").classList.add("landscape-mobile-dimen");
              document.querySelector("body").classList.add("landscape-mobile-dimen");
              document.querySelector("#main").classList.add("landscape-mobile-dimen");
              document.querySelector("#erosPlayer").classList.add("landscape-mobile-dimen");
              document.querySelector(".video-js.vjs-16-9").classList.add("landscape-mobile-dimen");
              document.querySelector(".video-js.vjs-16-9").classList.add("landscape-mobile-player-dimen");
            }
          }
          catch(e){}
          let foundDefault = false;
          let audioTracks = sortTracks(me.player.audioTracks());
        if(me.baseOptions.defaultAudio && me.baseOptions.defaultAudio != '' && !me.eventManager.selectedAudioLanguage) {
          audioTracks.tracks_.forEach(function (element) {
            if (element.language.toLowerCase() == me.baseOptions.defaultAudio.toLowerCase()) {
              me.eventManager.selectedAudioLanguage = element.label;
              foundDefault = true;
            }
          });
        }
        if (!foundDefault && audioTracks.length > 0) {
          me.eventManager.selectedAudioLanguage =  audioTracks.tracks_[0].label;
          audioTracks.tracks_.forEach(function (element) {   
            if(element.enabled == true)  
            me.eventManager.selectedAudioLanguage =  element.label;
          });
        }

        if (me.isMobile()) {
          let audioTracks = sortTracks(me.player.audioTracks());
          // var playbackTitle = element.playback_al_title;
          // var playbackId = element.playback_al_id;
          var defaultChecked = me.getAudioLanguage();
          var isLanguagePresent = false;
          var isHindiPresent = false;
          let mainAudioTrack = '';
          audioTracks.tracks_.forEach(function (element, index) {
            if(audioTracks.tracks_[index].label.toLowerCase() == 'hindi' ){
              isHindiPresent = true
            }
            if (audioTracks.tracks_[index].kind.toLowerCase() == 'main') {
              mainAudioTrack = audioTracks.tracks_[index].label;
             }
            if (defaultChecked && audioTracks.tracks_[index].label == defaultChecked) {
              audioTracks.tracks_[index].enabled = true;
              isLanguagePresent = true
            } else {
              audioTracks.tracks_[index].enabled= false;
            }
          });
          if(!isLanguagePresent){
            if(mainAudioTrack){
              audioTracks.tracks_.forEach(function (element, index) {
                if(element.label.toLowerCase() == mainAudioTrack.toLowerCase()){
                  audioTracks.tracks_[index].enabled = true
                }
              })
            }
            else{
              audioTracks.tracks_[0].enabled = true
            }
          }
        }
         //  else if(audioTracks != (null||0)) {
         //   let audioTracks = this.player.audioTracks();
         // me.eventManager.selectedAudioLanguage =  audioTracks.tracks_[0].label;
        //  }

        // let textTracks = this.player.textTracks();
        // this.player.textTracks().tracks_.forEach(function (element) {
        //   if (element.default || element.mode == 'showing')
        //     me.eventManager.selectedSubtitleLanguage = element.language;
        // })

        var vjsTech = document.getElementsByClassName("vjs-tech");
        if (me.isMobile() && vjsTech && vjsTech[0]) {
          vjsTech[0].style.opacity = "0.5";
        }
        this.defaultVideoQuality = me.eventManager.selectedBitrate;

        // if(options.audioLangOptions.forEach(function(element) {
        //   if(element.playback_al_checked){
        //     selectedLanguage = element.playback_al_title;
        //   }
        // }));
        // this.defaultAudio = selectedLanguage;

        // if(options.subtitles.forEach(function(element) {
        //   if(element.checked){
        //     selectedLanguage = element.language;
        //   }
        // }));
        // this.defaultSubtitle = selectedLanguage;

        // this.spriteThumbnail(player);
        this.Wrapper = this.initializeWrapperLayout({
          'style': {
            'position': 'absolute;',
            'top': '0;',
            'height': '100%;',
            'width': '100%;'
          }
        }, player)
        let isPortrait = !me.isLandscape() && (me.isMobile() || me.isIPad() || me.isTablet());
        let isLandscape = me.isLandscape() && (me.isMobile() || me.isIPad() || me.isTablet());
        Logger.debug('------------------> isLandscape: ',isLandscape);
        Logger.debug('------------------> isPortrait: ',isPortrait);
        //for ipad
        if ((isLandscape && (me.isIPad() || me.isTablet())) ||
          (isPortrait && (me.isIPad() || me.isTablet()))) {
          if (this.baseOptions.isLive) {
            this.initializeComponent(options.playerControlsLayout.livejson, this.Wrapper, player, options);
            me.baseOptions.playerControlsLayout.livejson.forEach(function (record) {
              if (record.control == "live_button") {
                me.liveButtonComponent = new logituitLiveButtonComponent();
                me.logituitLiveButton = new me.liveButtonComponent.liveButton(player, record);
                me.Wrapper.addChild(me.logituitLiveButton);
              }
            });
            var seekbardeactivate = document.getElementsByClassName('vjs-play-progress');
            if (seekbardeactivate && seekbardeactivate[1])
              seekbardeactivate[1].style.display = "none";

            var loadProgress = document.getElementsByClassName("vjs-load-progress");
            if(loadProgress && loadProgress[1]){
              loadProgress[1].style.display = "none";
            } 

            var slider = document.getElementsByClassName("logituit_seekbar");
            if (slider && slider[0])
              slider[0].style.backgroundImage = "linear-gradient(to right, #0aa1ea, #40c6b6)";
            this.uiStyleOption = options.playerControlsLayout.livejson;
          }
          else {
            this.initializeComponent(options.playerControlsLayout.desktopjson, this.Wrapper, player, options)
            this.uiStyleOption = options.playerControlsLayout.desktopjson;
            this.showSkipRecap = true;
            this.showSkipIntro = true;
          }
        }

        // for phone and tab - portrait
        else if ((isPortrait)) {
          if (this.baseOptions.isLive) {
            this.initializeComponent(options.playerControlsLayout.protraitLiveJson, this.Wrapper, player, options);
            me.baseOptions.playerControlsLayout.protraitLiveJson.forEach(function (record) {
              if (record.control == "live_button") {
                me.liveButtonComponent = new logituitLiveButtonComponent();
                me.logituitLiveButton = new me.liveButtonComponent.liveButton(player, record);
                me.Wrapper.addChild(me.logituitLiveButton);
              }
            });
            var seekbardeactivate = document.getElementsByClassName('vjs-play-progress');
            if (seekbardeactivate && seekbardeactivate[1])
              seekbardeactivate[1].style.display = "none";

            var loadProgress = document.getElementsByClassName("vjs-load-progress");
            if(loadProgress && loadProgress[1]){
              loadProgress[1].style.display = "none";
            }

            var slider = document.getElementsByClassName("logituit_seekbar");
            if (slider && slider[0])
              slider[0].style.backgroundImage = "linear-gradient(to right, #0aa1ea, #40c6b6)";
            this.uiStyleOption = options.playerControlsLayout.protraitLiveJson;
          }

          else {
            this.initializeComponent(options.playerControlsLayout.protrait, this.Wrapper, player, options)
            this.uiStyleOption = options.playerControlsLayout.protrait;
            this.showSkipRecap = false;
            this.showSkipIntro = false;
          }
        }
        // else if((window.matchMedia("(orientation: landscape)").matches) &&(me.isIPad())){
        //   this.initializeComponent(options.playerControlsLayout.desktopjson,this.Wrapper,player, options)
        // this.uiStyleOption = options.playerControlsLayout.desktopjson;
        // this.showSkipRecap = true;
        // }

        // for phone and tab - landscape
        else if (
          (isLandscape && (window.screen.width <= 920
          )) || (iOSdev && landscapeMode) ||
          (mobile && landscapeMode)
        ) {
          if (this.baseOptions.isLive) {
            this.initializeComponent(options.playerControlsLayout.mobilelivejson, this.Wrapper, player, options);
            me.baseOptions.playerControlsLayout.mobilelivejson.forEach(function (record) {
              if (record.control == "live_button") {
                me.liveButtonComponent = new logituitLiveButtonComponent();
                me.logituitLiveButton = new me.liveButtonComponent.liveButton(player, record);
                me.Wrapper.addChild(me.logituitLiveButton);
              }
            });
            var seekbardeactivate = document.getElementsByClassName('vjs-play-progress');
            if (seekbardeactivate && seekbardeactivate[1])
              seekbardeactivate[1].style.display = "none";

            var loadProgress = document.getElementsByClassName("vjs-load-progress");
            if(loadProgress && loadProgress[1]){
              loadProgress[1].style.display = "none";
            }  
            var slider = document.getElementsByClassName("logituit_seekbar");
            if (slider && slider[0])
              slider[0].style.backgroundImage = "linear-gradient(to right, #0aa1ea, #40c6b6)";
            this.uiStyleOption = options.playerControlsLayout.mobilelivejson;
          }
          else {
            this.initializeComponent(options.playerControlsLayout.mobilejson, this.Wrapper, player, options)
            this.uiStyleOption = options.playerControlsLayout.mobilejson;
            this.showSkipRecap = true;
            this.showSkipIntro = true;
          }
        }


        // for desktop
        else {
          if (this.baseOptions.isLive) {
            this.initializeComponent(options.playerControlsLayout.livejson, this.Wrapper, player, options);
            me.baseOptions.playerControlsLayout.livejson.forEach(function (record) {
              if (record.control == "live_button") {
                me.liveButtonComponent = new logituitLiveButtonComponent();
                me.logituitLiveButton = new me.liveButtonComponent.liveButton(player, record);
                me.Wrapper.addChild(me.logituitLiveButton);
              }
            });
            var seekbardeactivate = document.getElementsByClassName('vjs-play-progress');
            if (seekbardeactivate && seekbardeactivate[1])
              seekbardeactivate[1].style.display = "none";
            
            var loadProgress = document.getElementsByClassName("vjs-load-progress");
            if(loadProgress && loadProgress[1]){
              loadProgress[1].style.display = "none";
            }
            var slider = document.getElementsByClassName("logituit_seekbar");
            if (slider && slider[0])
              slider[0].style.backgroundImage = "linear-gradient(to right, #0aa1ea, #40c6b6)";
            this.uiStyleOption = options.playerControlsLayout.livejson;
          }
          else {
            this.initializeComponent(options.playerControlsLayout.desktopjson, this.Wrapper, player, options)
            this.uiStyleOption = options.playerControlsLayout.desktopjson;
            this.showSkipIntro = true;
            this.showSkipRecap = true;
            //this.showSkipIntro = true;
          }
        }
      } catch (ex) {
        Logger.error("Exception->> UI Engine Constructior: ", ex);
      }

    },

    getSeekTime() {
      // me.playerState = playerState;
      if (me.eventManager.seekTime) {
        return me.eventManager.seekTime;
      }
    },
    getPlayerState(playerState) {
      // me.playerState = playerState;
      if (me.eventManager.isPlayerPaused) {
        return 'Paused';
      } else {
        return 'Play';
      }
    },
    initializeWrapperLayout: function (style, player) {
      try {
        DesktopWrapper = new WrapperComponent(player);
        DesktopWrapper.applyStyles(style);
        return DesktopWrapper;
      } catch (ex) {
        Logger.error("exception occured initializeWrapperLayout: ", ex);
      }
    },

    createWatchNow: function (endTime, startTime,nextVideoObject) {
      me.baseOptions.next_content = nextVideoObject;
      if ((window.matchMedia("(orientation: portrait)").matches) && window.screen.width <= 480) {
        me.baseOptions.playerControlsLayout.protrait.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitWatchNextButton) {
              me.WatchNextComponent = new logituitWatchNext();
              me.logituitWatchNextButton = new me.WatchNextComponent.watchNext(me.player, record, me.Wrapper, me.baseOptions, me, endTime,startTime);
              me.Wrapper.addChild(me.logituitWatchNextButton);
            }
          }
        });

      }
      else if ((window.matchMedia("(orientation: landscape)").matches && me.isIPad()) ||
        (window.matchMedia("(orientation: portrait)").matches && me.isIPad())) {
        me.baseOptions.playerControlsLayout.desktopjson.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitWatchNextButton) {
              me.WatchNextComponent = new logituitWatchNext();
              me.logituitWatchNextButton = new me.WatchNextComponent.watchNext(me.player, record, me.Wrapper, me.baseOptions, me, endTime,startTime);
              me.Wrapper.addChild(me.logituitWatchNextButton);
            }
          }
        });
      }
      else if (
        (window.matchMedia("(orientation: landscape)").matches && (window.screen.width <= 920)) || (iOSdev && landscapeMode) ||
        (mobile && landscapeMode)
      ) {
        me.baseOptions.playerControlsLayout.mobilejson.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitWatchNextButton) {
              me.WatchNextComponent = new logituitWatchNext();
              me.logituitWatchNextButton = new me.WatchNextComponent.watchNext(me.player, record, me.Wrapper, me.baseOptions, me, endTime,startTime);
              me.Wrapper.addChild(me.logituitWatchNextButton);
            }
          }
        });
      }

      else {
        me.baseOptions.playerControlsLayout.desktopjson.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitWatchNextButton) {
              me.WatchNextComponent = new logituitWatchNext();
              me.logituitWatchNextButton = new me.WatchNextComponent.watchNext(me.player, record, me.Wrapper, me.baseOptions, me, endTime,startTime);
              me.Wrapper.addChild(me.logituitWatchNextButton);
            }
          }
        });
      }
    },
    addkeyboardcontroldisable: function () {
      me.eventManager.addkeyboardcontrol();
   },
   addkeyboardcontroldisableremove: function () {
    me.eventManager.addkeyboardcontrolremove();
 },
    removeWatchNow: function () {
      if (me.logituitWatchNextButton) {
        me.logituitWatchNextButton.releaseResource();
        me.Wrapper.removeChild(me.logituitWatchNextButton);
        delete me.logituitWatchNextButton;
        me.logituitWatchNextButton = null;
      }
      if (me.WatchNextComponent) {
        delete me.WatchNextComponent;
        me.WatchNextComponent = null;
      }
    },
    createNextEpisode: function (timerWatchNext,startTime,nextVideoObject) {   
      me.baseOptions.next_content = nextVideoObject;
      if ((window.matchMedia("(orientation: portrait)").matches && window.screen.width <= 480)) {
        me.baseOptions.playerControlsLayout.protrait.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitNextEpisodeButton) {
              me.NextEpisodeComponent = new logituitNextEpisode();
              me.logituitNextEpisodeButton = new me.NextEpisodeComponent.nextEpisode(me.player, record, me.Wrapper, me.baseOptions, me, timerWatchNext,startTime);                                                                                   
              me.Wrapper.addChild(me.logituitNextEpisodeButton);
            }
          }
        });
      }
      else if ((window.matchMedia("(orientation: landscape)").matches && me.isIPad()) ||
        (window.matchMedia("(orientation: portrait)").matches && me.isIPad())) {
        me.baseOptions.playerControlsLayout.desktopjson.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitNextEpisodeButton) {
              me.NextEpisodeComponent = new logituitNextEpisode();
              me.logituitNextEpisodeButton = new me.NextEpisodeComponent.nextEpisode(me.player, record, me.Wrapper, me.baseOptions, me, timerWatchNext,startTime);
              me.Wrapper.addChild(me.logituitNextEpisodeButton);
            }
          }
        });
      }
      else if (
        (window.matchMedia("(orientation: landscape)").matches && (window.screen.width <= 920)) || (iOSdev && landscapeMode) ||
        (mobile && landscapeMode)
      ) {
        me.baseOptions.playerControlsLayout.mobilejson.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitNextEpisodeButton) {
              me.NextEpisodeComponent = new logituitNextEpisode();
              me.logituitNextEpisodeButton = new me.NextEpisodeComponent.nextEpisode(me.player, record, me.Wrapper, me.baseOptions, me, timerWatchNext,startTime);
              me.Wrapper.addChild(me.logituitNextEpisodeButton);
            }
          }
        });
      }
      else {
        me.baseOptions.playerControlsLayout.desktopjson.forEach(function (record) {
          if (record.control == "watchNext_popup") {
            if (!me.logituitNextEpisodeButton) {
              me.NextEpisodeComponent = new logituitNextEpisode();
              me.logituitNextEpisodeButton = new me.NextEpisodeComponent.nextEpisode(me.player, record, me.Wrapper, me.baseOptions, me, timerWatchNext,startTime);
              me.Wrapper.addChild(me.logituitNextEpisodeButton);
            }
          }
        });
      }
    },
    removeNextEpisode: function () {
      if (me.logituitNextEpisodeButton) {
        me.logituitNextEpisodeButton.releaseResource();
        me.Wrapper.removeChild(me.logituitNextEpisodeButton);
        delete me.logituitNextEpisodeButton;
        me.logituitNextEpisodeButton = null;
      }
      if (me.NextEpisodeComponent) {
        delete me.NextEpisodeComponent;
        me.NextEpisodeComponent = null;
      }
    },

    createAllEpisode: function () {
      {
        me.baseOptions.playerControlsLayout.desktopjson.forEach(function (record) {
          if (record.control == "allEpisode_ui") {
            if (!me.logituitAllEpisodeButton) {
              me.allEpisodeComponent = new logituitAllEpisode();
              me.logituitAllEpisodeButton = new me.allEpisodeComponent.allEpisode(me.player, record, me.Wrapper, me.baseOptions, me);
              me.Wrapper.addChild(me.logituitAllEpisodeButton);
            }
          }
        });
      }
    },
    removeAllEpisode: function () {
      if (me.logituitAllEpisodeButton) {
        me.logituitAllEpisodeButton.releaseResource();
        me.Wrapper.removeChild(me.logituitAllEpisodeButton);
        delete me.logituitAllEpisodeButton;
        me.logituitAllEpisodeButton = null;
      }
      if (me.allEpisodeComponent) {
        delete me.allEpisodeComponent;
        me.allEpisodeComponent = null;
      }
    },
    removePlayPause: function () {
      if (me.logituitVideoPlayPauseButton) {
        me.logituitVideoPlayPauseButton.releaseResource();
        me.Wrapper.removeChild(me.logituitVideoPlayPauseButton);
        delete me.logituitVideoPlayPauseButton;
        me.logituitVideoPlayPauseButton = null;
      }
      if (me.videoPlayPauseButtonComponent) {
        delete me.videoPlayPauseButtonComponent;
        me.videoPlayPauseButtonComponent = null;
      }
    },
    addPlayPause: function () {
      me.uiStyleOption.forEach(function (record) {
        if (record.control == "videoplaypause_button" && !me.logituitVideoPlayPauseButton) {
          me.videoPlayPauseButtonComponent = new loguituitVideoPlayPauseButtonComponent();
          me.logituitVideoPlayPauseButton = new me.videoPlayPauseButtonComponent.videoPlayPauseButton(me.player, record, me.baseOptions, me);
          me.Wrapper.addChild(me.logituitVideoPlayPauseButton);
        }
      })
    },
    releaseResource: function () {
      try {
        //forward button
        if (me.logituitForwardButton) {
          me.logituitForwardButton.releaseResource();
          me.Wrapper.removeChild(me.logituitForwardButton);
          delete me.logituitForwardButton;
          me.logituitForwardButton = null;
        }
        if (me.forwardButtonComponent) {
          delete me.forwardButtonComponent;
          me.forwardButtonComponent = null;
        }

        //rewind button
        if (me.logituitRewindButton) {
          me.logituitRewindButton.releaseResource();
          me.Wrapper.removeChild(me.logituitRewindButton);
          delete me.logituitRewindButton;
          me.logituitRewindButton = null;
        }
        if (me.rewindButtonComponent) {
          delete me.rewindButtonComponent;
          me.rewindButtonComponent = null;
        }

        //seekBar
        if (me.logituitSeekBar) {
          me.logituitSeekBar.releaseResource();
          me.Wrapper.removeChild(me.logituitSeekBar);
          delete me.logituitSeekBar;
          me.logituitSeekBar = null;
        }
        if (me.seekBarComponent) {
          delete me.seekBarComponent;
          me.seekBarComponent = null;
        }

        //upnextTv
        if (me.logituitupnextTv) {
          me.logituitupnextTv.releaseResource();
          me.Wrapper.removeChild(me.logituitupnextTv);
          delete me.logituitupnextTv;
          me.logituitupnextTv = null;
        }
        if (me.upnexttvComponent) {
          delete me.upnexttvComponent;
          me.upnexttvComponent = null;
        }

        if (me.logituitVideoTitle) {
          me.logituitVideoTitle.releaseResource();
          me.Wrapper.removeChild(me.logituitVideoTitle);
          delete me.logituitVideoTitle;
          me.logituitVideoTitle = null;
        }
        if (me.videoTitleComponent) {
          delete me.videoTitleComponent;
          me.videoTitleComponent = null;
        }
        //errorMsg
        if (me.logituitErrorMsg) {
          me.logituitErrorMsg.releaseResource();
          me.Wrapper.removeChild(me.logituitErrorMsg);
          delete me.logituitErrorMsg;
          me.logituitErrorMsg = null;
        }
        if (me.errroMsgComponent) {
          delete me.errroMsgComponent;
          me.errroMsgComponent = null;
        }
        //back button
        if (me.logituitBackButton) {
          me.logituitBackButton.releaseResource();
          me.Wrapper.removeChild(me.logituitBackButton);
          delete me.logituitBackButton;
          me.logituitBackButton = null;
        }
        if (me.backButtonComponent) {
          delete me.backButtonComponent;
          me.backButtonComponent = null;
        }

        //title
        if (me.logituitTitleBar) {
          me.logituitTitleBar.releaseResource();
          me.Wrapper.removeChild(me.logituitTitleBar);
          delete me.logituitTitleBar;
          me.logituitTitleBar = null;
        }
        if (me.titleBarComponent) {
          delete me.titleBarComponent;
          me.titleBarComponent = null;
        }
        //episodetitle
        if (me.episodelogituitTitleBar) {
          me.episodelogituitTitleBar.releaseResource();
          me.Wrapper.removeChild(me.episodelogituitTitleBar);
          delete me.episodelogituitTitleBar;
          me.episodelogituitTitleBar = null;
        }
        if (me.episodetitleBarComponent) {
          delete me.episodetitleBarComponent;
          me.episodetitleBarComponent = null;
        }

        //playpause
        if (me.logituitPlayPause) {
          me.logituitPlayPause.releaseResource();
          me.Wrapper.removeChild(me.logituitPlayPause);
          delete me.logituitPlayPause;
          me.logituitPlayPause = null;
        }
        if (me.playPauseComponent) {
          delete me.playPauseComponent;
          me.playPauseComponent = null;
        }

        //pauseButton
        if (me.logituitPause) {
          me.logituitPause.releaseResource();
          me.Wrapper.removeChild(me.logituitPause);
          delete me.logituitPause;
          me.logituitPause = null;
        }
        if (me.pauseComponent) {
          delete me.pauseComponent;
          me.pauseComponent = null;
        }

        //fullscreen
        if (me.logituitFullScreen) {
          me.logituitFullScreen.releaseResource();
          me.Wrapper.removeChild(me.logituitFullScreen);
          delete me.logituitFullScreen;
          me.logituitFullScreen = null;
        }
        if (me.fullScreenComponent) {
          delete me.fullScreenComponent;
          me.fullScreenComponent = null;
        }

        //exitScreen
        if (me.logituitExitScreen) {
          me.logituitExitScreen.releaseResource();
          me.Wrapper.removeChild(me.logituitExitScreen);
          delete me.logituitExitScreen;
          me.logituitExitScreen = null;
        }
        if (me.exitScreenComponent) {
          delete me.exitScreenComponent;
          me.exitScreenComponent = null;
        }


        //volume
        if (me.logituitVolume) {
          me.logituitVolume.releaseResource();
          me.Wrapper.removeChild(me.logituitVolume);
          delete me.logituitVolume;
          me.logituitVolume = null;
        }
        if (me.volumeComponent) {
          delete me.volumeComponent;
          me.volumeComponent = null;
        }

        //volume slider
        if (me.logituitVolumeSlider) {
          me.logituitVolumeSlider.releaseResource();
          me.Wrapper.removeChild(me.logituitVolumeSlider);
          delete me.logituitVolumeSlider;
          me.logituitVolumeSlider = null;
        }
        if (me.volumeSliderComponent) {
          delete me.volumeSliderComponent;
          me.volumeSliderComponent = null;
        }

        //muteVolume
        if (me.logituitMuteVolume) {
          me.logituitMuteVolume.releaseResource();
          me.Wrapper.removeChild(me.logituitMuteVolume);
          delete me.logituitMuteVolume;
          me.logituitMuteVolume = null;
        }
        if (me.muteVolumeComponent) {
          delete me.muteVolumeComponent;
          me.muteVolumeComponent = null;
        }

        //muteMobileVolume
        // if (me.logituitMuteMobileVolume) {
        //   me.logituitMuteMobileVolume.releaseResource();
        //   me.Wrapper.removeChild(me.logituitMuteMobileVolume);
        //   delete me.logituitMuteMobileVolume;
        //   me.logituitMuteMobileVolume = null;
        // }
        // if (me.muteMobileVolumeComponent) {
        //   delete me.muteMobileVolumeComponent;
        //   me.muteMobileVolumeComponent = null;
        // }

        //  //muteVolumeSlider
        //  if(me.logituitMuteVolumeSlider) {
        //   me.logituitMuteVolumeSlider.releaseResource();
        //   me.Wrapper.removeChild(me.logituitMuteVolumeSlider);
        //   delete me.logituitMuteVolumeSlider;
        //   me.logituitMuteVolumeSlider = null;
        // }
        // if(me.muteVolumeSliderComponent) {
        //   delete me.muteVolumeSliderComponent;
        //   me.muteVolumeSliderComponent = null;
        // }

        //videoQuality
        if (me.logituitVideoQuality) {
          me.logituitVideoQuality.releaseResource();
          me.Wrapper.removeChild(me.logituitVideoQuality);
          delete me.logituitVideoQuality;
          me.logituitVideoQuality = null;
        }
        if (me.videoQuality) {
          delete me.videoQuality;
          me.videoQuality = null;
        }

        //subtitle
        if (me.logituitSubTitle) {
          me.logituitSubTitle.releaseResource();
          me.Wrapper.removeChild(me.logituitSubTitle);
          delete me.logituitSubTitle;
          me.logituitSubTitle = null;
        }
        if (me.subTitleComponent) {
          delete me.subTitleComponent;
          me.subTitleComponent = null;
        }

        //chrome cast
        if (me.logituitChromeCast) {
          me.logituitChromeCast.releaseResource();
          me.Wrapper.removeChild(me.logituitChromeCast);
          delete me.logituitChromeCast;
          me.logituitChromeCast = null;
        }
        if (me.chromeCastComponent) {
          delete me.chromeCastComponent;
          me.chromeCastComponent = null;
        }

        //share button
        if (me.logituitShareButton) {
          me.logituitShareButton.releaseResource();
          me.Wrapper.removeChild(me.logituitShareButton);
          delete me.logituitShareButton;
          me.logituitShareButton = null;
        }
        if (me.shareButtonComponent) {
          delete me.shareButtonComponent;
          me.shareButtonComponent = null;
        }

        //mini player
        if (me.logituitMiniPlayer) {
          me.logituitMiniPlayer.releaseResource();
          me.Wrapper.removeChild(me.logituitMiniPlayer);
          delete me.logituitMiniPlayer;
          me.logituitMiniPlayer = null;
        }
        if (me.miniPlayerComponent) {
          delete me.miniPlayerComponent;
          me.miniPlayerComponent = null;
        }

        //time divider
        if (me.logituitTimeDivider) {
          me.logituitTimeDivider.releaseResource();
          me.Wrapper.removeChild(me.logituitTimeDivider);
          delete me.logituitTimeDivider;
          me.logituitTimeDivider = null;
        }
        if (me.timeDividerComponent) {
          delete me.timeDividerComponent;
          me.timeDividerComponent = null;
        }

        //current time display
        if (me.logituitCurrentTime) {
          me.logituitCurrentTime.releaseResource();
          me.Wrapper.removeChild(me.logituitCurrentTime);
          delete me.logituitCurrentTime;
          me.logituitCurrentTime = null;
        }
        if (me.currentTimeComponent) {
          delete me.currentTimeComponent;
          me.currentTimeComponent = null;
        }

        //close
        if (me.logituitCloseButton) {
          me.logituitCloseButton.releaseResource();
          me.Wrapper.removeChild(me.logituitCloseButton);
          delete me.logituitCloseButton;
          me.logituitCloseButton = null;
        }
        if (me.closeButtonComponent) {
          delete me.closeButtonComponent;
          me.closeButtonComponent = null;
        }

        //episode
        if (me.logituitEpisodeButton) {
          me.logituitEpisodeButton.releaseResource();
          me.Wrapper.removeChild(me.logituitEpisodeButton);
          delete me.logituitEpisodeButton;
          me.logituitEpisodeButton = null;
        }
        if (me.episodeButtonComponent) {
          delete me.episodeButtonComponent;
          me.episodeButtonComponent = null;
        }

        //loadingSpinner
        if (me.logituitLoadingSpinner) {
          me.logituitLoadingSpinner.releaseResource();
          me.Wrapper.removeChild(me.logituitLoadingSpinner);
          delete me.logituitLoadingSpinner;
          me.logituitLoadingSpinner = null;
        }
        if (me.loadingSpinnerComponent) {
          delete me.loadingSpinnerComponent;
          me.loadingSpinnerComponent = null;
        }

        //watermark
        if (me.logituitWaterMark) {
          me.logituitWaterMark.releaseResource();
          me.Wrapper.removeChild(me.logituitWaterMark);
          delete me.logituitWaterMark;
          me.logituitWaterMark = null;
        }
        if (me.waterMarkComponent) {
          delete me.waterMarkComponent;
          me.waterMarkComponent = null;
        }

        //morebuttons
        if (me.logituitMoreButtons) {
          me.logituitMoreButtons.releaseResource();
          me.Wrapper.removeChild(me.logituitMoreButtons);
          delete me.logituitMoreButtons;
          me.logituitMoreButtons = null;
        }
        if (me.moreButtonsComponent) {
          delete me.moreButtonsComponent;
          me.moreButtonsComponent = null;
        }

        //livebutton
        if (me.logituitLiveButton) {
          me.logituitLiveButton.releaseResource();
          me.Wrapper.removeChild(me.logituitLiveButton);
          delete me.logituitLiveButton;
          me.logituitLiveButton = null;
        }
        if (me.liveButtonComponent) {
          delete me.liveButtonComponent;
          me.liveButtonComponent = null;
        }

        if (me.logituitButtongoLive) {
          me.logituitButtongoLive.releaseResource();
          me.Wrapper.removeChild(me.logituitButtongoLive);
          delete me.logituitButtongoLive;
          me.logituitButtongoLiveTv = null;
        }
        if (me.ButtongoLiveComponent) {
          delete me.ButtongoLiveComponent;
          me.ButtongoLiveComponent = null;
        }


        //livebutton TV
        if (me.logituitLiveButtonTv) {
          me.logituitLiveButtonTv.releaseResource();
          me.Wrapper.removeChild(me.logituitLiveButtonTv);
          delete me.logituitLiveButtonTv;
          me.logituitLiveButtonTv = null;
        }
        if (me.liveButtonTvComponent) {
          delete me.liveButtonTvComponent;
          me.liveButtonTvComponent = null;
        }


        if (me.logituitButtongoLiveTv) {
          me.logituitButtongoLiveTv.releaseResource();
          me.Wrapper.removeChild(me.logituitButtongoLiveTv);
          delete me.logituitButtongoLiveTv;
          me.logituitButtongoLiveTv = null;
        }
        if (me.ButtongoLiveTvComponent) {
          delete me.ButtongoLiveTvComponent;
          me.ButtongoLiveTvComponent = null;
        }

        //nextEPisode tv

        if (me.logituitnextEpisodeButton) {
          me.logituitnextEpisodeButton.releaseResource();
          me.Wrapper.removeChild(me.logituitnextEpisodeButton);
          delete me.logituitnextEpisodeButton;
          me.logituitnextEpisodeButton = null;
        }
        if (me.nextEpisodeButtonComponent) {
          delete me.nextEpisodeButtonComponent;
          me.nextEpisodeButtonComponent = null;
        }

        //skip intro TV

        // if(me.skipintroButtonComponent) {
        //   me.skipintroButtonComponent.releaseResource();
        //   me.Wrapper.removeChild(me.skipintroButtonComponent);
        //   delete me.skipintroButtonComponent;
        //   me.skipintroButtonComponent = null;
        // }
        // if(me.skipintroButtonComponent) {
        //   delete me.skipintroButtonComponent;
        //   me.skipintroButtonComponent = null;
        // }

        //for animation
        if (me.playpauseAnimationComponent) {
          me.playpauseAnimationComponent.releaseResource();
          me.Wrapper.removeChild(me.playpauseAnimationComponent);
          delete me.playpauseAnimationComponent;
          me.playpauseAnimationComponent = null;
        }
        if (me.playpauseAnimationComponent) {
          delete me.playpauseAnimationComponent;
          me.playpauseAnimationComponent = null;
        }

        //for complete video click
        if (me.logituitVideoPlayPauseButton) {
          me.logituitVideoPlayPauseButton.releaseResource();
          me.Wrapper.removeChild(me.logituitVideoPlayPauseButton);
          delete me.logituitVideoPlayPauseButton;
          me.logituitVideoPlayPauseButton = null;
        }
        if (me.videoPlayPauseButtonComponent) {
          delete me.videoPlayPauseButtonComponent;
          me.videoPlayPauseButtonComponent = null;
        }

        //fordivider
        try{
        if (me.logituitDividerComponent) {
          me.logituitDividerComponent.releaseResource();
          me.Wrapper.removeChild(me.logituitDividerComponent);
          delete me.logituitDividerComponent;
          me.logituitDividerComponent = null;
        }
        if (me.logituitDividerButton) {
          delete me.logituitDividerButton;
          me.logituitDividerButton = null;
        }
      }
      catch(e){}

        me.player.removeChild(me.Wrapper)
        delete me.Wrapper;
        me.Wrapper = null;

      } catch (error) {
        Logger.error("release resource error UIEngine: ", error);
      }

      try{
        if(this.isMobile()){
          document.querySelector("html").classList.remove("landscape-mobile-dimen");
          document.querySelector("body").classList.remove("landscape-mobile-dimen");
          document.querySelector("#main").classList.remove("landscape-mobile-dimen");
          document.querySelector("#erosPlayer").classList.remove("landscape-mobile-dimen");
          document.querySelector(".video-js.vjs-16-9").classList.remove("landscape-mobile-dimen");
          document.querySelector(".video-js.vjs-16-9").classList.remove("landscape-mobile-player-dimen");
        }
      }
      catch(e){}
      // for all component
    },
    applyStyles: function (options) {
      var element = this.el();
      if (element) {
        //element.setAttribute(); 
      }
      for (key in options) {
        if (element) {
          element.setAttribute(key, options[key]);
        }
      }
    },
    destroyMember: function () {
      this.subtitle = null;
      this.videoquality = null
      this.FrdBtn = null;
    },
    isMobile: function () {

      var check = false;
      (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    },
    isSafari: function () {
      var userAgent = navigator.userAgent;

      // if (userAgent.indexOf("safari") != -1 || userAgent.indexOf("Safari") != -1) {
      var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      return safari;
    },
    //New function
    iOSDevice: function () {
      var iOSdev = false;
      var userAgent = navigator.userAgent;
      iOSdev = userAgent.match(/ipad/i) || userAgent.match(/iphone/i) || userAgent.match(/iPod/i);
      return iOSdev;
    },
    iosMobile: function () {
      var iOSdev = false;
      var userAgent = navigator.userAgent;
      iOSdev = userAgent.match(/iphone/i) || userAgent.match(/iPod/i);
      return iOSdev;
    },
    iPhone:function(){
      var iOSdev = false;
      var userAgent = navigator.userAgent;
      iOSdev = userAgent.match(/iphone/i);
      return iOSdev;
    },
    isIPad: function () {
      var isIpaddev = false;
      var userAgent = navigator.userAgent;
      isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform)));
      return isIpaddev;
    },
    isTablet: function () {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
      return isTablet;
    },
    iOSversion: function () {
      if (/iP(hone|od|ad)/.test(navigator.platform)) {
        // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
        var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
      }
    },

    isLandscape: function () {

      //Start
      var isLandscapeMode = false;
      try {
        var orientationDetails = window.orientation || window.screen.orientation;
        var orientation;

        var mobile = this.isMobile();
        var iOSdev = this.iOSDevice();


        if (mobile) {
          if (iOSdev && iOSdev.length > 0) {
            switch (window.orientation) {  
              case 0:
                  orientation = 'portrait';
                  break; 
                  
              case 180:
                  orientation = 'portrait';
                  break; 
            
              case -90: 
                  orientation = 'landscape';
                  break;  
            
              case 90:  
                  orientation = 'landscape';
                  break;
              }
          }
          else {
            orientation = (window.screen.orientation || {}).type || window.screen.mozOrientation || window.screen.msOrientation;
          }

          if (orientation == 'portrait' || orientation == 'portrait-primary' || orientation == 'portrait-secondary' || orientation == 0 || orientation == -180) {
            isLandscapeMode = false;
          }
          else {

            isLandscapeMode = true;
          }

        }
      }
      catch (e) {
        Logger.error("this.isLandscape : Error ", e)
      }
      //End


      return isLandscapeMode;

    },
    // hideControls: function(event) {

    //   options.forEach(function(record) {
    //     if(record.control=="forwardbutton")
    //     {
    //     this.forwardButtonComponent = new logituitForwardButtonComponent();
    //     // record.forwardTime = baseOptions.forwardRewindTime;
    //     this.logituitForwardButton = new forwardButtonComponent.forwardButton(player,record,baseOptions,me);
    //     var forwprd  = this.logituitForwardButton.getElementsByClassName("logituit_forward");
    //     }
    //   });
    // },

    setLiveFlag: function (isLiveFlag) {
      if (isLiveFlag) {
        if ((window.matchMedia("(orientation: landscape)").matches && me.isIPad()) ||
          (window.matchMedia("(orientation: portrait)").matches && me.isIPad())) {
          me.baseOptions.playerControlsLayout.livejson.forEach(function (record) {
            if (record.control == "live_button") {
              if(!me.logituitLiveButton) {
                me.liveButtonComponent = new logituitLiveButtonComponent();
                me.logituitLiveButton = new me.liveButtonComponent.liveButton(me.player, record);
                me.Wrapper.addChild(me.logituitLiveButton);
              }
            }
          });
        }
        else if ((window.matchMedia("(orientation: portrait)").matches)) {
          me.baseOptions.playerControlsLayout.protraitLiveJson.forEach(function (record) {
            if (record.control == "live_button") {
              if(!me.logituitLiveButton) {
                me.liveButtonComponent = new logituitLiveButtonComponent();
                me.logituitLiveButton = new me.liveButtonComponent.liveButton(me.player, record);
                me.Wrapper.addChild(me.logituitLiveButton);
              }
            }
          });
        }

        else if (
          (window.matchMedia("(orientation: landscape)").matches && (window.screen.width <= 920))
          || (iOSdev && landscapeMode) ||
          (mobile && landscapeMode)
        ) {
          me.baseOptions.playerControlsLayout.mobilelivejson.forEach(function (record) {
            if (record.control == "live_button") {
              if(!me.logituitLiveButton) {
                me.liveButtonComponent = new logituitLiveButtonComponent();
                me.logituitLiveButton = new me.liveButtonComponent.liveButton(me.player, record);
                me.Wrapper.addChild(me.logituitLiveButton);
              }
            }
          });
        }

        else {
          me.baseOptions.playerControlsLayout.livejson.forEach(function (record) {
            if (record.control == "live_button") {
              if(!me.logituitLiveButton) {
              me.liveButtonComponent = new logituitLiveButtonComponent();
              me.logituitLiveButton = new me.liveButtonComponent.liveButton(me.player, record);
              me.Wrapper.addChild(me.logituitLiveButton);
              }
            }
          });
        }
      }
      // else {
      //   if (me.logituitLiveButton) {
      //     me.logituitLiveButton.releaseResource();
      //     me.Wrapper.removeChild(me.logituitLiveButton);
      //     delete me.logituitLiveButton;
      //     me.logituitLiveButton = null;
      //   }
      //   if (me.liveButtonComponent) {
      //     delete me.liveButtonComponent;
      //     me.liveButtonComponent = null;
      //   }
      //   // me.Wrapper.removeChild(this.liveButtonComponent);
      // }

    },


    reportEventToUiEngine: function (event) {
      try {
        this.eventManager.reportEventToEventManager(event);
      } catch (error) {
        Logger.error("error in throwing event in UiEngine", error);
      }
    },

    initializeComponent: function (options, Wrapper, player, baseOptions) {
      try {
        options.forEach(function (record) {
          try {
            if (record.control == "forwardbutton") {
              if (baseOptions.isLive == false) {
                me.forwardButtonComponent = new logituitForwardButtonComponent();
                record.forwardTime = baseOptions.forwardRewindTime;
                me.logituitForwardButton = new me.forwardButtonComponent.forwardButton(player, record, baseOptions, me);
                me.Wrapper.addChild(me.logituitForwardButton);
              }
              else
                return;
            }
            else if (record.control == "rewindbutton") {
              if (baseOptions.isLive == false) {
                me.rewindButtonComponent = new loguituRewindButtonComponent();
                record.rewindTime = baseOptions.forwardRewindTime;
                me.logituitRewindButton = new me.rewindButtonComponent.rewindButton(player, record, me);
                me.Wrapper.addChild(me.logituitRewindButton);
              }
              else
                return;
            }

            else if (record.control == "seekbar") {
              this.seekBarComponent = new logituitSeekBarComponent();
              this.logituitSeekBar = new seekBarComponent.seekBar(player, record, me);
              Wrapper.addChild(this.logituitSeekBar);
            }

            else if (record.control == "videotitle") {
              this.videoTitleComponent = new logituitVideoTitleComponent();
              this.logituitVideoTitle = new videoTitleComponent.videoTitle(player, record);
              Wrapper.addChild(this.logituitVideoTitle);
            }

            else if (record.control == "backbutton") {
              this.backButtonComponent = new logituitBackButtonComponent();
              this.logituitBackButton = new backButtonComponent.backButton(player, record, me);
              Wrapper.addChild(logituitBackButton);
            }

            else if (record.control == "upnexttv") {
              this.upnexttvComponent = new loguituitupnextTvComponent();
              this.logituitupnextTv = new upnexttvComponent.upnextButton(player, record, me);
              Wrapper.addChild(this.logituitupnextTv);
            }


            else if (record.control == "mouseTime") {
              this.mouseTime = new mouseTime(player, record);
              Wrapper.addChild(mouseTime);
            }
            else if (record.control == "errorMsg") {
              me.errroMsgComponent = new logituitErrorMessageComponent();
              me.logituitErrorMsg = new me.errroMsgComponent.errorMessage(player, record, me);
              Wrapper.addChild(me.logituitErrorMsg)
            }
            else if (record.control == "title") {
              this.titleBarComponent = new logituitTitleBarComponent();
              record.text = baseOptions.contentTitle;
              this.logituitTitleBar = new titleBarComponent.titleBar(player, record, baseOptions);
              Wrapper.addChild(this.logituitTitleBar);
            }
            else if (record.control == "episode_title" && baseOptions.episodeTitle != baseOptions.contentTitle) {
              this.episodetitleBarComponent = new logituitEpisodeTitleBarComponent();
              record.text = baseOptions.episodeTitle;
              this.episodelogituitTitleBar = new episodetitleBarComponent.episodetitleBar(player, record);
              Wrapper.addChild(this.episodelogituitTitleBar);
            }
            else if (record.control == "play_pause" && player.paused()) {
              if (me.logituitPause) {
                me.logituitPause.releaseResource();
                me.Wrapper.removeChild(me.logituitPause);
                delete me.logituitPause;
                me.logituitPause = null;
              }
              if (me.pauseComponent) {
                delete me.pauseComponent;
                me.pauseComponent = null;
              }
              me.playPauseComponent = new logituitPlayPauseComponent();
              me.logituitPlayPause = new me.playPauseComponent.playPause(player, record, Wrapper, baseOptions, me);
              Wrapper.addChild(me.logituitPlayPause);
            }
            else if (record.control == "pauseButton" && !player.paused()) {
              if (me.logituitPlayPause) {
                me.logituitPlayPause.releaseResource();
                me.Wrapper.removeChild(me.logituitPlayPause);
                delete me.logituitPlayPause;
                me.logituitPlayPause = null;
              }
              if (me.playPauseComponent) {
                delete me.playPauseComponent;
                me.playPauseComponent = null;
              }
              me.pauseComponent = new logituitPauseButton();
              me.logituitPause = new me.pauseComponent.pauseButton(player, record, Wrapper, baseOptions, me);
              Wrapper.addChild(me.logituitPause);
            }

            else if (record.control == "fullScreen" && !player.isFullscreen() && (me.isMobile() && me.iosMobile() && me.isLandscape() || (!me.iosMobile()))){
            //if((me.baseOptions.isLive) || !me.isMobile() || true){
                me.fullScreenComponent = new logituitFullScreenComponent();
                me.logituitFullScreen = new me.fullScreenComponent.fullScreenObj(player, record, me);
                Wrapper.addChild(me.logituitFullScreen);
              //   if(!(me.baseOptions.isLive) && me.isMobile()){
              //     //hide icon
              //     me.logituitFullScreen.hideIcon();
              // }  
            }

            else if (record.control == "exit-fullScreen" && player.isFullscreen() && (me.isMobile() && me.iosMobile() && me.isLandscape() || (!me.iosMobile()))) {
              // if((me.baseOptions.isLive) || !me.isMobile()){
              me.exitScreenComponent = new logituitExitScreenComponent();
              me.logituitExitScreen = new me.exitScreenComponent.exitScreenObj(player, record, me);
              Wrapper.addChild(me.logituitExitScreen);
            // }            
            
          }
            else if (record.control == "volume" && !me.player.muted()) {
              me.volumeComponent = new logituitVolumeComponent();
              me.logituitVolume = new me.volumeComponent.volume(player, record, Wrapper, me);
              Wrapper.addChild(me.logituitVolume);
            }

            else if (record.control == "volumeSlider") {
              this.volumeSliderComponent = new logituitVolumeSliderComponent();
              this.logituitVolumeSlider = new volumeSliderComponent.volumeSlider(player, record,Wrapper, me);
              Wrapper.addChild(this.logituitVolumeSlider);
            }

            else if (record.control == "muteVolume" && me.player.muted()) {
              me.muteVolumeComponent = new logituitMuteVolumeComponent();
              me.logituitMuteVolume = new me.muteVolumeComponent.muteVolume(player, record, Wrapper, me);
              Wrapper.addChild(me.logituitMuteVolume);
              //}
            }
          

            else if (record.control == "MobileMuteVolume") {
            //   if(me.iPhone() && me.player.muted()){
            //   me.muteMobileVolumeComponent = new logituitMuteVolumeMobileComponent();
            //   me.logituitMuteMobileVolume = new me.muteMobileVolumeComponent.MuteMobileVolume(player, record, Wrapper, me);
            //   Wrapper.addChild(me.logituitMuteMobileVolume);
            //   //}
            // }
          }

            // else if(record.control=="muteVolumeSlider")
            // {
            //   this.muteVolumeSliderComponent = new logituitMuteVolumeSliderComponent();
            //   this.logituitMuteVolumeSlider = new muteVolumeSliderComponent.MuteVolumeSlider(player,record,me);
            //     Wrapper.addChild(this.logituitMuteVolumeSlider);
            // }

            // else if(record.control=="videoQuality")
            else if (record.control == "videoQuality") {
              // if (me.isSafari() && !(me.isMobile() || me.isIPad())) {
              // } else {

                // this.videoQualityComponent = new logituitVideoQualityComponent();
                // this.logituitVideoQuality=new videoQualityComponent.videoQuality(player,record,Wrapper, baseOptions,me);
                // Wrapper.addChild(this.logituitVideoQuality);
                me.QualitySettingsComponent = new logituitSettingsComponent();
                me.logituitQualitySettings = new me.QualitySettingsComponent.videoQuality(player, record, Wrapper, baseOptions, me);
                me.Wrapper.addChild(me.logituitQualitySettings);
            //  }

            }

            else if (record.control == "subtitle") {
              this.subTitleComponent = new logituitSubTitleComponent();
              this.logituitSubTitle = new subTitleComponent.subTitle(player, record, Wrapper, baseOptions, me);
              Wrapper.addChild(this.logituitSubTitle);
            }

            else if (record.control == "chromeCast") {
              this.chromeCastComponent = new logituitChromeCastComponent();
              this.logituitChromeCast = new chromeCastComponent.logixCC(player, record);
              Wrapper.addChild(logituitChromeCast);
            }

            else if (record.control == "duration") {
              this.durationComponent = new logituitDurationComponent();
              this.logituitDuration = new durationComponent.duration(player, record);
              Wrapper.addChild(this.logituitDuration);
            }

            // else if(record.control=="skipRecap") 
            // {
            //     this.skipRecapButtonComponent = new loguituitSkipRecapButtonComponent();
            //     this.logituitSkipRecap=new skipRecapButtonComponent.skipRecapButton(player,record, me);
            //     Wrapper.addChild(this.logituitSkipRecap);
            // }  
            else if (record.control == "share") {
              this.shareButtonComponent = new logituitShareButtonComponent();
              this.logituitShare = new shareComponent.shareButton(player, record, me);
              Wrapper.addChild(this.logituitShare);
            }
            else if (record.control == "miniPalyer") {
              me.miniPlayerComponent = new logituitMiniPlayerComponent();
              me.logituitMiniPlayer = new me.miniPlayerComponent.miniPlayer(player, record, me, me.baseOptions);
              Wrapper.addChild(me.logituitMiniPlayer);
            }

            else if (record.control == "timeDivider") {
              this.timeDividerComponent = new logituitTimeDividerComponent();
              this.logituitTimeDivider = new timeDividerComponent.timeDivider(player, record);
              Wrapper.addChild(this.logituitTimeDivider)
            }

            else if (record.control == "currentTime") {
              this.currentTimeComponent = new logituitCurrentTimeComponent();
              this.logituitCurrentTime = new currentTimeComponent.currentTime(player, record);
              Wrapper.addChild(this.logituitCurrentTime);
            }

            else if (record.control == "close") {
              this.closeButtonComponent = new logituitCloseButtonComponent();
              this.logituitCloseButton = new closeButtonComponent.closeButtonObj(player, record, me);
              Wrapper.addChild(this.logituitCloseButton)
            }

            else if (record.control == "episode" && (me.baseOptions.assetType == "Episode") && me.baseOptions.nextVideoMetadata) {
              me.episodeButtonComponent = new logituitEpisodeButtonComponent();
              me.logituitExpisodeButton = new me.episodeButtonComponent.episodeButton(player, record, me);
              Wrapper.addChild(me.logituitExpisodeButton)
            }
    
            else if (record.control == "loadingSpinner") {
              this.loadingSpinnerComponent = new logituitLoadingSpinnerComponent();
              this.logituitLoadingSpinner = new loadingSpinnerComponent.LoadingSpinner(player, record, me);
              Wrapper.addChild(this.logituitLoadingSpinner)
            }

            else if (record.control == "waterMark") {
              this.waterMarkComponent = new logituitWaterMarkComponent();
              this.logituitWaterMark = new waterMarkComponent.waterMark(player, record);
              Wrapper.addChild(this.logituitWaterMark);
            }
            else if (record.control == "more_button") {
              this.moreButtonsComponent = new logituitMoreButtonsComponent();
              this.logituitMoreButtons = new moreButtonsComponent.moreButtons(player, record, Wrapper, baseOptions, me);
              Wrapper.addChild(this.logituitMoreButtons);
            }
            /** For live Button component */
            // else if(record.control=="live_button")
            // {
            //      this.liveButtonComponent = new logituitLiveButtonComponent();
            //      this.logituitLiveButton= new liveButtonComponent.liveButton(player,record);
            //      Wrapper.addChild(this.logituitLiveButton);
            // }            
            else if (record.control == "Golive_button") {

              this.GoliveButtonComponent = new logituitButtongoLiveComponent();
              this.logituitGoLiveButton = new GoliveButtonComponent.GoliveButton(player, record);
              Wrapper.addChild(this.logituitGoLiveButton);

            }
            //next episode for tv
            else if (record.control == "nextEpisode_button") {

              this.nextEpisodeButtonComponent = new logituitButtonnextEpisodeTvComponent();
              this.logituitnextEpisodeButton = new nextEpisodeButtonComponent.nextEpisodeButtonTv(player, record);
              Wrapper.addChild(this.logituitnextEpisodeButton);

            }

            //skip intro for tv
            // else if(record.control=="skipintro_button")
            // {

            //     this.skipintroButtonComponent = new logituitskipintroTvComponent();
            //     this.logituitskipintroButton = new skipintroButtonComponent.skipintroButtonTv(player,record);
            //     Wrapper.addChild(this.logituitskipintroButton);

            // } 
            // else if(record.control=="playpause_animation")
            // {
            //   this.playpauseAnimationComponent = new loguituitVideoPlayPauseAnimationComponent();
            //   this.loguituitVideoPlayPauseAnimation = new playpauseAnimationComponent.videoPlayPauseAnimation(player,record,baseOptions,me);
            //   Wrapper.addChild(this.loguituitVideoPlayPauseAnimation)
            // }
            //for complete video play pause anywhere

            else if (record.control == "videoplaypause_button") {
              me.videoPlayPauseButtonComponent = new loguituitVideoPlayPauseButtonComponent();
              me.logituitVideoPlayPauseButton = new me.videoPlayPauseButtonComponent.videoPlayPauseButton(player, record, baseOptions, me);
              me.Wrapper.addChild(me.logituitVideoPlayPauseButton);
            }

            else if (record.control == "live_buttonTv") {
              this.liveButtonTvComponent = new logituitLiveButtonTvComponent();
              this.logituitLiveTvButton = new liveButtonTvComponent.liveButtonTv(player, record);
              Wrapper.addChild(this.logituitLiveTvButton);
            }

            else if (record.control == "Golive_buttonTv") {
              this.GoliveButtonTvComponent = new logituitButtongoLiveTvComponent();
              this.logituitGoLiveTvButton = new GoliveButtonTvComponent.GoliveButtonTv(player, record);
              Wrapper.addChild(this.logituitGoLiveTvButton);
            }
            // else if(record.control=="watchNext_popup")
            // {

            //     this.WatchNextComponent = new logituitWatchNext();
            //     this.logituitnextEpisodeButton = new WatchNextComponent.watchNext(player,record,Wrapper, baseOptions,me);
            //     Wrapper.addChild(this.logituitnextEpisodeButton);

            // } 

            else if (record.control == "allEpisodeIcon_ui") {
                if (me.baseOptions.allEpisodeData  != null  && me.baseOptions.allEpisodeData != undefined && ((typeof(me.baseOptions.allEpisodeData) == 'object' && me.baseOptions.allEpisodeData.length >0) || (typeof(me.baseOptions.allEpisodeData)== 'boolean' && me.baseOptions.allEpisodeData == true))) {
                  me.allEpisodeIconComponent = new logituitAllEpisodeIcon();
                  me.logituitAllEpisodeIconButton = new me.allEpisodeIconComponent.allEpisodeIcon(player, record, me.Wrapper, me.baseOptions, me);
                  me.Wrapper.addChild(me.logituitAllEpisodeIconButton);
              }
            }
            // else if (record.control == "recommendedUI") {
            //   this.recommendedPopupComponent = new logituitRecommendedPopup();
            //   this.logituitRecommendedPopupButton = new recommendedPopupComponent.recommendedPopup(player, record, me.Wrapper, me.baseOptions, me);
            //   Wrapper.addChild(this.logituitRecommendedPopupButton);
            // }
            // else if (record.control == "fullscreenRecommendedUI") {
            //   this.fullscreenRecommendedPopupComponent = new logituitFullscreenRecommendedPopup();
            //   this.logituitFullscreenRecommendedPopupButton = new fullscreenRecommendedPopupComponent.fullscreenRecommendedPopup(player, record, me.Wrapper, me.baseOptions, me);
            //   Wrapper.addChild(this.logituitFullscreenRecommendedPopupButton);
            // }
            // else if(record.control=='divider') {
            //   this.logituitDividerComponent = new logituitDivider();
            //   this.logituitDivider = new logituitDividerComponent.divider(player,record,me.Wrapper, me.baseOptions,me);
            //   Wrapper.addChild(this.logituitDivider);
            // }
            else if (record.control == 'divider' && me.baseOptions.allEpisodeData  != null  && me.baseOptions.allEpisodeData != undefined && ((typeof(me.baseOptions.allEpisodeData) == 'object' && me.baseOptions.allEpisodeData.length >0) || (typeof(me.baseOptions.allEpisodeData)== 'boolean' && me.baseOptions.allEpisodeData == true))) {
              this.logituitDividerComponent = new logituitDivider();
              this.logituitDividerButton = new logituitDividerComponent.divider(player, record, me.Wrapper, me.baseOptions, me);
              me.Wrapper.addChild(this.logituitDividerButton);
            }
          } catch (ex) {
            Logger.error("Exception in control: ", record.control, ex);
          }
        });
        //adding wrapper to player
        player.addChild(Wrapper);
      } catch (ex) {
        Logger.error("Exception initializeComponent: ", ex);
      }



    },

    // addVolumeSlider: function (){
    //   me.logituitVolumeSliderComponent = new logituitVolumeSliderComponent();
    //   me.logituitVolumeSlide = new me.logituitVolumeSliderComponent.volumeSlider(me.player, {name:'popup', option: uiOption}, me.Wrapper, me.baseOptions, me);
    //   me.Wrapper.addChild(this.logituitMobileAudioPopup);
    // },
    removeMobileSettingsPopup: function () {
      me.eventManager.showingMwebSettingsPopup = false;
      if (me.logituitMobileSettingsPopup) {
        if (me.videoPlaying == 'PLAY') {
          me.player.play();
        } else {
          me.player.pause();
        }
        me.logituitMobileSettingsPopup.releaseResource();
        me.Wrapper.removeChild(me.logituitMobileSettingsPopup);
        delete me.logituitMobileSettingsPopup;
        me.logituitMobileSettingsPopup = null;
      }
      if (me.settingPopupComponent) {
        delete me.settingPopupComponent;
        me.settingPopupComponent = null;
      }
    },
    addSkipRecapButton: function () {
      if (me.showSkipRecap) {
        var skipRecord;
        for (var i = 0; i < me.uiStyleOption.length; i++) {
          if (me.uiStyleOption[i].control == 'skipRecap') {
            skipRecord = me.uiStyleOption[i];
            break;
          }
        }
        me.skipRecapButtonComponent = new loguituitSkipRecapButtonComponent();
        me.loguituitSkipRecapButtonComponent = new me.skipRecapButtonComponent.skipRecapButton(me.player, skipRecord, me, me.baseOptions);
        me.Wrapper.addChild(me.loguituitSkipRecapButtonComponent);
      }
    },

    addSkipIntroButton: function () {
      if (me.showSkipIntro) {
        var skipIntro;
        for (var i = 0; i < me.uiStyleOption.length; i++) {
          if (me.uiStyleOption[i].control == 'skipIntro') {
            skipIntro = me.uiStyleOption[i];
            break;
          }
        }
        me.skipIntroButtonComponent = new loguituitSkipIntroButtonComponent();
        me.loguituitSkipIntroButtonComponent = new me.skipIntroButtonComponent.skipIntroButton(me.player, skipIntro, me, me.baseOptions);
        me.Wrapper.addChild(me.loguituitSkipIntroButtonComponent);
      }
    },
    showRecomendationScreen: function(recommendationObject){
     if(!me.recommendedPopupComponent){
        var recommendation;
        for (var i = 0; i < me.uiStyleOption.length; i++) {
          if (me.uiStyleOption[i].control == 'recommendedUI') {
            recommendation = me.uiStyleOption[i];
            break;
          }
        }
        me.baseOptions.recommendations = recommendationObject;
        me.recommendedPopupComponent = new logituitRecommendedPopup();
        me.logituitRecommendedPopupButton = new me.recommendedPopupComponent.recommendedPopup(me.player, recommendation, me.Wrapper, me.baseOptions, me);
        me.Wrapper.addChild(me.logituitRecommendedPopupButton);
      }
    },
    removeRecommendation: function(){
      if(me.logituitRecommendedPopupButton){
        me.logituitRecommendedPopupButton.releaseResource();
        me.Wrapper.removeChild(me.logituitRecommendedPopupButton);
        delete me.logituitRecommendedPopupButton;
        me.logituitRecommendedPopupButton=null;
      }
      if(me.recommendedPopupComponent){
        delete me.recommendedPopupComponent;
        me.recommendedPopupComponent=null;
      }
       
    },       
    showFullScreenRecommendation: function (width, height) {
      if (!me.fullscreenRecommendedPopupComponent) {
        if (me.baseOptions.fullscreenRecommendation) {
          var showRecommendation;
          for (var i = 0; i < me.uiStyleOption.length; i++) {
            if (me.uiStyleOption[i].control == 'fullscreenRecommendedUI') {
              showRecommendation = me.uiStyleOption[i];
              break;
            }
          }
          me.fullscreenRecommendedPopupComponent = new logituitFullscreenRecommendedPopup();
          me.logituitFullscreenRecommendedPopupButton = new me.fullscreenRecommendedPopupComponent.fullscreenRecommendedPopup(me.player, showRecommendation, me.Wrapper, me.baseOptions, me, width, height);
          me.Wrapper.addChild(me.logituitFullscreenRecommendedPopupButton);
        }
      }
    },
    removeFullscreenRecommendation: function(){    
        if (me.logituitFullscreenRecommendedPopupButton) {
          me.logituitFullscreenRecommendedPopupButton.releaseResource();
          me.Wrapper.removeChild(me.logituitFullscreenRecommendedPopupButton);
          delete me.logituitFullscreenRecommendedPopupButton;
          me.logituitFullscreenRecommendedPopupButton = null;
        }
        if (me.fullscreenRecommendedPopupComponent) {
          delete me.fullscreenRecommendedPopupComponent;
          me.fullscreenRecommendedPopupComponent = null;
        }      
    },
    addSettingPopup: function () {
      if (me.logituitQualitySettings)
        me.logituitQualitySettings.showSettingsPopup();
    },
    removeSettingPopup: function () {
      if (me.logituitQualitySettings)
        me.logituitQualitySettings.hideSettingsPopup();
    },

    addWebAudioQualityPopup: function () {
      this.showQualityPopup = true;
      if (me.showQualityPopup) {
        var showPopup;
        for (var i = 0; i < me.uiStyleOption.length; i++) {
          if (me.uiStyleOption[i].control == 'audioQuality') {
            showPopup = me.uiStyleOption[i];
            break;
          }
        }
      }
      if (!me.isMobile()) {   
        me.audioQualityComponent = new logituitAudioQualityComponent();
        me.logituitAudioQuality = new me.audioQualityComponent.videoQuality(me.player, showPopup, me.Wrapper, me.baseOptions, me);
         me.Wrapper.addChild(this.logituitAudioQuality);
      }
    },
    addWebVideoQualityPopup: function () {
      this.showQualityPopup = true;
      if (me.showQualityPopup) {
        var showPopup;
        for (var i = 0; i < me.uiStyleOption.length; i++) {
          if (me.uiStyleOption[i].control == 'videoQuality') {
            showPopup = me.uiStyleOption[i];
            break;
          }
        }
      }
      if (me.isSafari() && !(me.isMobile() || me.isIPad())) {
      } else {
        me.videoQualityComponent = new logituitVideoQualityComponent();
        me.logituitVideoQuality = new me.videoQualityComponent.videoQuality(me.player, showPopup, me.Wrapper, me.baseOptions, me);
        // me.logituitVideoQuality=new me.videoQualityComponent.videoQuality(player,option,wrapper, options, uiEngine);
        me.Wrapper.addChild(this.logituitVideoQuality);
      }
    },
    removeWebAudioQualityPopup: function () {
      if (me.showQualityPopup) {
        if (me.logituitAudioQuality) {
          me.logituitAudioQuality.releaseResource();
          me.Wrapper.removeChild(me.logituitAudioQuality);
          delete me.logituitAudioQuality;
          me.logituitAudioQuality = null;
        }
        if (me.videoQualityComponent) {
          delete me.videoQualityComponent;
          me.videoQualityComponent = null;
        }
      }
    },
    removeWebVideoQualityPopup: function () {
      if (me.showQualityPopup) {
        if (me.logituitVideoQuality) {
          me.logituitVideoQuality.releaseResource();
          me.Wrapper.removeChild(me.logituitVideoQuality);
          delete me.logituitVideoQuality;
          me.logituitVideoQuality = null;
        }
        if (me.videoQualityComponent) {
          delete me.videoQualityComponent;
          me.videoQualityComponent = null;
        }
      }
    },
    removeQualitySettingsPopup: function () {
      if (me.logituitQualitySettings) {
        me.logituitQualitySettings.releaseResource();
        me.Wrapper.removeChild(me.logituitQualitySettings);
        delete me.logituitQualitySettings;
        me.logituitQualitySettings = null;
      }
      if (me.videoQualityComponent) {
        delete me.videoQualityComponent;
        me.videoQualityComponent = null;
      }
    },

    removeSkipRecapButton: function () {
      if (me.showSkipRecap) {
        if (me.loguituitSkipRecapButtonComponent) {
          me.loguituitSkipRecapButtonComponent.releaseResource();
          me.Wrapper.removeChild(me.loguituitSkipRecapButtonComponent);
          delete me.loguituitSkipRecapButtonComponent;
          me.loguituitSkipRecapButtonComponent = null;
        }
        if (me.skipRecapButtonComponent) {
          delete me.skipRecapButtonComponent;
          me.skipRecapButtonComponent = null;
        }
      }
    },

    removeSkipIntroButton: function () {
      if (me.showSkipIntro) {
        if (me.loguituitSkipIntroButtonComponent) {
          me.loguituitSkipIntroButtonComponent.releaseResource();
          me.Wrapper.removeChild(me.loguituitSkipIntroButtonComponent);
          delete me.loguituitSkipIntroButtonComponent;
          me.loguituitSkipIntroButtonComponent = null;
        }
        if (me.skipIntroButtonComponent) {
          delete me.skipIntroButtonComponent;
          me.skipIntroButtonComponent = null;
        }
      }
    },

    addMobileSettingsPopup: function (uiOption) {
      me.eventManager.showingMwebSettingsPopup = true;
      if (me.videoPlaying == '') {
        if (me.player.paused()) {
          me.videoPlaying = 'PAUSE';
          //me.showPauseIcon();
        } else {
          me.videoPlaying = 'PLAY';
          //me.showPlayIcon();
        }
      }
      me.player.pause();
      me.settingPopupComponent = new logituitVideoPopupComponent();
      me.logituitMobileSettingsPopup = new me.settingPopupComponent.PopupComponent(me.player, { name: 'popup', option: uiOption }, me.Wrapper, me.baseOptions, me);
      me.Wrapper.addChild(this.logituitMobileSettingsPopup);
    },
    addMobileAudioQualityPopup: function(uiOption){
      me.eventManager.showingMwebSettingsPopup = true;
      if (me.videoPlaying == '') {
        if (me.player.paused()) {
          me.videoPlaying = 'PAUSE';
        } else {
          me.videoPlaying = 'PLAY';
        }
      }
      me.player.pause();
      me.mobileAudioQualityPopupComponent = new logituitMobileAudioQualityPopup();
      me.logituitMobileAudioQualityPopup = new me.mobileAudioQualityPopupComponent.mobileAudioQuality(me.player, { name: 'popup', option: uiOption }, me.Wrapper, me.baseOptions, me);
      me.Wrapper.addChild(this.logituitMobileAudioQualityPopup);
    },
    removeMobileAudioQualityPopup: function () {
      me.eventManager.showingMwebSettingsPopup = false;
      if (me.logituitMobileAudioQualityPopup) {
        if (me.videoPlaying == 'PLAY') {
          me.player.play();
        } else {
          me.player.pause();
        }
        me.logituitMobileAudioQualityPopup.releaseResource();
        me.Wrapper.removeChild(me.logituitMobileAudioQualityPopup);
        delete me.logituitMobileAudioQualityPopup;
        me.logituitMobileAudioQualityPopup = null;
      }
      if (me.mobileVideoQualityPopupComponent) {
        delete me.mobileVideoQualityPopupComponent;
        me.mobileVideoQualityPopupComponent = null;
      }
    },
    addMobileVideoQualityPopup: function (uiOption) {
      me.eventManager.showingMwebSettingsPopup = true;
      if (me.videoPlaying == '') {
        if (me.player.paused()) {
          me.videoPlaying = 'PAUSE';
        } else {
          me.videoPlaying = 'PLAY';
        }
      }
      me.player.pause();
      me.mobileVideoQualityPopupComponent = new logituitMobileVideoQualityPopup();
      me.logituitMobileVideoQualityPopup = new me.mobileVideoQualityPopupComponent.mobileVideoQuality(me.player, { name: 'popup', option: uiOption }, me.Wrapper, me.baseOptions, me);
      me.Wrapper.addChild(this.logituitMobileVideoQualityPopup);
    },
    removeMobileVideoQualityPopup: function () {
      me.eventManager.showingMwebSettingsPopup = false;
      if (me.logituitMobileVideoQualityPopup) {
        if (me.videoPlaying == 'PLAY') {
          me.player.play();
        } else {
          me.player.pause();
        }
        me.logituitMobileVideoQualityPopup.releaseResource();
        me.Wrapper.removeChild(me.logituitMobileVideoQualityPopup);
        delete me.logituitMobileVideoQualityPopup;
        me.logituitMobileVideoQualityPopup = null;
      }
      if (me.mobileVideoQualityPopupComponent) {
        delete me.mobileVideoQualityPopupComponent;
        me.mobileVideoQualityPopupComponent = null;
      }
    },
    addMobileAudioPopup: function (uiOption) {
      me.eventManager.showingMwebSettingsPopup = true;
      if (me.videoPlaying == '') {
        if (me.player.paused()) {
          me.videoPlaying = 'PAUSE';
        } else {
          me.videoPlaying = 'PLAY';
        }
      }
      me.player.pause();
      me.mobileAudioPopupComponent = new logituitMobileAudioPopup();
      me.logituitMobileAudioPopup = new me.mobileAudioPopupComponent.subtitleAudioComponent(me.player, { name: 'popup', option: uiOption }, me.Wrapper, me.baseOptions, me);
      me.Wrapper.addChild(this.logituitMobileAudioPopup);
    },
    removeMobileAudioPopup: function () {
      me.eventManager.showingMwebSettingsPopup = false;
      if (me.logituitMobileAudioPopup) {
        if (me.videoPlaying == 'PLAY') {
          me.player.play();
        } else {
          me.player.pause();
        }
        me.logituitMobileAudioPopup.releaseResource();
        me.Wrapper.removeChild(me.logituitMobileAudioPopup);
        delete me.logituitMobileAudioPopup;
        me.logituitMobileAudioPopup = null;
      }
      if (me.mobileAudioPopupComponent) {
        delete me.mobileAudioPopupComponent;
        me.mobileAudioPopupComponent = null;
      }
    },
    addMobileSubtitlePopup: function (uiOption) {
      me.eventManager.showingMwebSettingsPopup = true;
      if (me.videoPlaying == '') {
        if (me.player.paused()) {
          me.videoPlaying = 'PAUSE';
        } else {
          me.videoPlaying = 'PLAY';
        }
      }
      me.player.pause();
      me.mobileSubtitlePopupComponent = new logituitMobileSubtitlePopup();
      me.logituitMobileSubtitlePopup = new me.mobileSubtitlePopupComponent.subtitleComponent(me.player, { name: 'popup', option: uiOption }, me.Wrapper, me.baseOptions, me);
      me.Wrapper.addChild(this.logituitMobileSubtitlePopup);
    },
    removeMobileSubtitlePopup: function () {
      me.eventManager.showingMwebSettingsPopup = false;
      if (me.logituitMobileSubtitlePopup) {
        if (me.videoPlaying == 'PLAY') {
          me.player.play();
        } else {
          me.player.pause();
        }
        me.logituitMobileSubtitlePopup.releaseResource();
        me.Wrapper.removeChild(me.logituitMobileSubtitlePopup);
        delete me.logituitMobileSubtitlePopup;
        me.logituitMobileSubtitlePopup = null;
      }
      if (me.mobileSubtitlePopupComponent) {
        delete me.mobileSubtitlePopupComponent;
        me.mobileSubtitlePopupComponent = null;
      }
    },
    addMobileReportIssuePopup: function (uiOption) {
      me.eventManager.showingMwebSettingsPopup = true;
      if (me.videoPlaying != '') {
        if (me.player.paused()) {
          me.videoPlaying = 'PAUSE';
        } else {
          me.videoPlaying = 'PLAY';
        }
      }
      me.player.pause();
      me.mobileReportIssueComponent = new logituitMobileReportIssuePopup();
      me.logituitMobileReportIssuePopup = new me.mobileReportIssueComponent.reportAnIssue(me.player, { name: 'popup', option: uiOption }, me.Wrapper, me.baseOptions, me);
      me.Wrapper.addChild(this.logituitMobileReportIssuePopup);
    },
    removeMobileReportPopup: function () {
      me.eventManager.showingMwebSettingsPopup = false;
      if (me.logituitMobileReportIssuePopup) {
        if (me.videoPlaying == 'PLAY') {
          me.player.play();
        } else {
          me.player.pause();
        }
        me.logituitMobileReportIssuePopup.releaseResource();
        me.Wrapper.removeChild(me.logituitMobileReportIssuePopup);
        delete me.logituitMobileReportIssuePopup;
        me.logituitMobileReportIssuePopup = null;
      }
      if (me.mobileReportIssueComponent) {
        delete me.mobileReportIssueComponent;
        me.mobileReportIssueComponent = null;
      }
    },
    showRewindAnimation: function () {
      if (me.logituitRewindButton)
        me.logituitRewindButton.showRewindAnimation();
    },
    pauseTimer: function(state){
      if(me.logituitWatchNextButton){
        me.logituitWatchNextButton.setOnlineFlag(state);
      }
      else if(me.logituitNextEpisodeButton){
        me.logituitNextEpisodeButton.setOnlineFlag(state);
      }
    },
    pauseTimerBackground:  function(state){
      if(me.logituitWatchNextButton){
        me.logituitWatchNextButton.setBackgroundFlag(state);
      }
      else if(me.logituitNextEpisodeButton){
        me.logituitNextEpisodeButton.setBackgroundFlag(state);
      }
    },
    showForwardAnimation: function () {
      if (me.logituitForwardButton)
        me.logituitForwardButton.showForwardAnimation();
    },
    hideFullscreen: function(){
        if(me.logituitExitScreen){
          me.logituitExitScreen.hideIcon();
        }
        else if(me.logituitFullScreen){
          me.logituitFullScreen.hideIcon();
        }
    },
    showPauseAnimation: function () {
      if (me.logituitPause)
        me.logituitPause.showPauseAnimation();
    },
    showPlayAnimation: function () {
      if (me.logituitPlayPause)
        me.logituitPlayPause.showPlayAnimation();
    },

    displayVolumeIcon: function () {
      if (!me.logituitVolume) {
        if (me.logituitMuteVolume) {
          me.logituitMuteVolume.releaseResource();
          me.Wrapper.removeChild(me.logituitMuteVolume);
          delete me.logituitMuteVolume;
          me.logituitMuteVolume = null;
        }
        if (me.muteVolumeComponent) {
          delete me.muteVolumeComponent;
          me.muteVolumeComponent = null;
        }
        me.uiStyleOption.forEach(function (record) {
          if (record.control == "volume") {
            me.volumeComponent = new logituitVolumeComponent();
            me.logituitVolume = new me.volumeComponent.volume(me.player, record, me.Wrapper, me);
            me.Wrapper.addChild(me.logituitVolume);
          }
        });
      }
    },

    muteVolumeIcon: function () {
      if (!me.logituitMuteVolume) {
        if (me.logituitVolume) {
          me.logituitVolume.releaseResource();
          me.Wrapper.removeChild(me.logituitVolume);
          delete me.logituitVolume;
          me.logituitVolume = null;
        }
        if (me.volumeComponent) {
          delete me.volumeComponent;
          me.volumeComponent = null;
        }

        me.uiStyleOption.forEach(function (record) {
          if (record.control == "muteVolume") {
            me.muteVolumeComponent = new logituitMuteVolumeComponent();
            me.logituitMuteVolume = new me.muteVolumeComponent.muteVolume(me.player, record, me.Wrappers, me);
            me.Wrapper.addChild(me.logituitMuteVolume);
          }
        });
      }
    },

 
    showExitScreenIcon: function () {
    //  if (!(me.isMobile()) || me.isMobile() || (me.baseOptions.isLive && me.isMobile())){
        if (me.logituitFullScreen) {
          me.logituitFullScreen.releaseResource();
          me.Wrapper.removeChild(me.logituitFullScreen);
          delete me.logituitFullScreen;
          me.logituitFullScreen = null;
        }
        if (me.fullScreenComponent) {
          delete me.fullScreenComponent;
          me.fullScreenComponent = null;
        }
        if (!me.logituitExitScreen && (me.isMobile() && me.iosMobile() && me.isLandscape() || (!me.iosMobile()))) {
          me.uiStyleOption.forEach(function (record) {
            if (record.control == "exit-fullScreen") {
              me.exitScreenComponent = new logituitExitScreenComponent();
              me.logituitExitScreen = new me.exitScreenComponent.exitScreenObj(me.player, record, me);
              me.Wrapper.addChild(me.logituitExitScreen);
            }
          });
        }
    //  }
    },

    showFullScreenIcon: function () {
   //   if (!(me.isMobile()) || me.isMobile() || (me.baseOptions.isLive && me.isMobile())){
        if (me.logituitExitScreen) {
          me.logituitExitScreen.releaseResource();
          me.Wrapper.removeChild(me.logituitExitScreen);
          delete me.logituitExitScreen;
          me.logituitExitScreen = null;
        }
        if (me.exitScreenComponent) {
          delete me.exitScreenComponent;
          me.exitScreenComponent = null;
        }
        if (!me.logituitFullScreen && (me.isMobile() && me.iosMobile() && me.isLandscape() || (!me.iosMobile()))) {
          me.uiStyleOption.forEach(function (record) {
            if (record.control == "fullScreen") {
              me.fullScreenComponent = new logituitFullScreenComponent();
              me.logituitFullScreen = new me.fullScreenComponent.fullScreenObj(me.player, record, me);
             if(!(me.getMiniplayerState()))
             {
              me.Wrapper.addChild(me.logituitFullScreen);
             }
            }
          });
        }
   //   }
    },
    showErrorMsg() {
      if(me.logituitErrorMsg) {
        me.eventManager.errorMsgVisible = true;
        me.logituitErrorMsg.showErrorMsg();
      }
    },
    removeErrorMsg() {
      if(me.logituitErrorMsg)
      me.logituitErrorMsg.removeErrorMsg();
    },
    showPlayIcon: function () {
     // if (!me.eventManager.skipRecapVisible && !me.eventManager.skipIntroVisible) {
        if (me.logituitPause) {
          me.logituitPause.releaseResource();
          me.Wrapper.removeChild(me.logituitPause);
          delete me.logituitPause;
          me.logituitPause = null;
        }
        if (me.pauseComponent) {
          delete me.pauseComponent;
          me.pauseComponent = null;
        }
        me.uiStyleOption.forEach(function (record) {
          if (record.control == "play_pause" && !me.logituitPlayPause) {
            me.playPauseComponent = new logituitPlayPauseComponent();
            me.logituitPlayPause = new me.playPauseComponent.playPause(me.player, record, me.Wrapper, me.baseOptions, me);
            me.Wrapper.addChild(me.logituitPlayPause);
          }
        });
      //}
    },
    showPauseIcon: function () {
     // if (!me.eventManager.skipRecapVisible && !me.eventManager.skipIntroVisible) {
        if (me.logituitPlayPause) {
          me.logituitPlayPause.releaseResource();
          me.Wrapper.removeChild(me.logituitPlayPause);
          delete me.logituitPlayPause;
          me.logituitPlayPause = null;
        }
        if (me.playPauseComponent) {
          delete me.playPauseComponent;
          me.playPauseComponent = null;
        }
        if (me.uiStyleOption) {
          me.uiStyleOption.forEach(function (record) {
            if (record.control == "pauseButton" && !me.logituitPause) {
              me.pauseComponent = new logituitPauseButton();
              me.logituitPause = new me.pauseComponent.pauseButton(me.player, record, me.Wrapper, me.baseOptions, me);
              me.Wrapper.addChild(me.logituitPause);
            }
          });
        }
     // }
      
    },
    setVideoQuality: function (videoQuality) {
      // localStorage.setItem('selectedBitrate',videoQuality)
      me.eventManager.selectedBitrate = videoQuality;
    },
    getVideoQuality: function () {      
      // return localStorage.getItem('selectedBitrate') || me.eventManager.selectedBitrate;
      return me.eventManager.selectedBitrate;
    },
    setAudioLanguage: function (audioLanguage) {
      localStorage.setItem('selectedAudioLanguage',audioLanguage)
      me.eventManager.selectedAudioLanguage = audioLanguage;
    },
    getAudioLanguage: function () {
      return localStorage.getItem('selectedAudioLanguage')
      //  || me.eventManager.selectedAudioLanguage;
    },
    setSubtitleLanguage: function (subtitleLanguage) {
      localStorage.setItem('selectedSubtitleLanguage',subtitleLanguage)
      me.eventManager.selectedSubtitleLanguage = subtitleLanguage;
    },
    getSubtitleLanguage: function () {
      return localStorage.getItem('selectedSubtitleLanguage')
      //  || me.eventManager.selectedSubtitleLanguage;
    },
    setAudioQuality: function (audioQuality) {
      // localStorage.setItem('selectedAudioQuality',audioLanguage)      
      me.eventManager.selectedAudioQuality = audioQuality;
    },
    getAudioQuality: function () {
      // return localStorage.getItem('selectedAudioQuality') || me.eventManager.selectedAudioQuality;
      return me.eventManager.selectedAudioQuality;
    },

    setAllEpisodeSeason: function (season) {
      selectedSeason = season;
    },
    getAllEpisodeSeason: function () {
      return selectedSeason;
    },

    setAllEpisode: function (selEpisode) {
      selectedEpisode = selEpisode;
    },
    getAllEpisode: function () {
      return selectedEpisode;
    },
    setMiniplayerState(state) {
      isMiniplayerEnabled = state;
    },
    getMiniplayerState() {
      return isMiniplayerEnabled;
    },
    releaseResourceFromEventManager() {
      me.releaseResource();
      me.Wrapper = this.initializeWrapperLayout(
        {
          'style': {
            'position': 'absolute;',
            'top': '0;',
            'height': '100%;',
            'width': '100%;'
          }
        }
        , player);
        
  //    me.baseOptions.playerControlsLayout.desktopjson.forEach(function (record) {
    setTimeout(function(){
        me.uiStyleOption.forEach(function (record) {
        if (record.control == "miniPlayerExpand") {
          me.miniplayerExpandComponent = new logituitMiniplayerExpandComponent();
          me.logituitMiniplayerExpandButton = new me.miniplayerExpandComponent.expandButton(me.player, record, me, me.baseOptions);
          me.Wrapper.addChild(me.logituitMiniplayerExpandButton);
        }
        if (record.control == "miniPlayerClose") {
          me.miniplayerCloseComponent = new logituitMiniplayerCloseComponent();
          me.logituitMiniplayerCloseButton = new me.miniplayerCloseComponent.closeButton(me.player, record, me, me.baseOptions);
          me.Wrapper.addChild(me.logituitMiniplayerCloseButton);
        }
        if (record.control == "miniPlayerPlay") {
          me.miniplayerPlayComponent = new logituitMiniplayerPlayComponent();
          me.logituitMiniplayerPlayButton = new me.miniplayerPlayComponent.playButton(me.player, record, me, me.baseOptions);
          me.Wrapper.addChild(me.logituitMiniplayerPlayButton);
        }
        if (record.control == "miniplayerEpisodeTitle") {
          me.miniplayerEpisodeTitleComponent = new logituitMiniplayerEpisodeTitleComponent();
          me.logituitMiniplayerEpisodeTitle = new me.miniplayerEpisodeTitleComponent.miniplayerEpisodeTitle(me.player, record, me, me.baseOptions);
          me.Wrapper.addChild(me.logituitMiniplayerEpisodeTitle);
        }
        if (record.control == "miniplayerTitle") {
          me.miniplayerTitleComponent = new logituitMiniplayerTitleComponent();
          me.logituitMiniplayerTitle = new me.miniplayerTitleComponent.miniplayerTitle(me.player, record, me, me.baseOptions);
          me.Wrapper.addChild(me.logituitMiniplayerTitle);
        }
        if (record.control == 'miniplayerErrorMsg') {
          me.logituitMiniplayerErrorComponent = new logituitMiniplayerErrorMessageComponent();
          me.logituitMiniplayerError = new me.logituitMiniplayerErrorComponent.miniplayerErrorMessage(player, record, me);
          me.Wrapper.addChild(me.logituitMiniplayerError);
        }
      });   
    },700)

      me.player.addChild(me.Wrapper);
    },
    initializeResources() {
      if (me.logituitMiniplayerTitle) {
        me.logituitMiniplayerTitle.releaseResource();
        me.Wrapper.removeChild(me.logituitMiniplayerTitle);
        delete me.logituitMiniplayerTitle;
        me.logituitMiniplayerTitle = null;
      }
      if (me.miniplayerTitleComponent) {
        delete me.miniplayerTitleComponent;
        me.miniplayerTitleComponent = null;
      }

      if (me.logituitMiniplayerEpisodeTitle) {
        me.logituitMiniplayerEpisodeTitle.releaseResource();
        me.Wrapper.removeChild(me.logituitMiniplayerEpisodeTitle);
        delete me.logituitMiniplayerEpisodeTitle;
        me.logituitMiniplayerEpisodeTitle = null;
      }
      if (me.miniplayerEpisodeTitleComponent) {
        delete me.miniplayerEpisodeTitleComponent;
        me.miniplayerEpisodeTitleComponent = null;
      }

      if (me.logituitMiniplayerPlayButton) {
        me.logituitMiniplayerPlayButton.releaseResource();
        me.Wrapper.removeChild(me.logituitMiniplayerPlayButton);
        delete me.logituitMiniplayerPlayButton;
        me.logituitMiniplayerPlayButton = null;
      }
      if (me.miniplayerPlayComponent) {
        delete me.miniplayerPlayComponent;
        me.miniplayerPlayComponent = null;
      }

      if (me.logituitMiniplayerExpandButton) {
        me.logituitMiniplayerExpandButton.releaseResource();
        me.Wrapper.removeChild(me.logituitMiniplayerExpandButton);
        delete me.logituitMiniplayerExpandButton;
        me.logituitMiniplayerExpandButton = null;
      }
      if (me.miniplayerExpandComponent) {
        delete me.miniplayerExpandComponent;
        me.miniplayerExpandComponent = null;
      }

      if (me.logituitMiniplayerCloseButton) {
        me.logituitMiniplayerCloseButton.releaseResource();
        me.Wrapper.removeChild(me.logituitMiniplayerCloseButton);
        delete me.logituitMiniplayerCloseButton;
        me.logituitMiniplayerCloseButton = null;
      }
      if (me.miniplayerCloseComponent) {
        delete me.miniplayerCloseComponent;
        me.miniplayerCloseComponent = null;
      }

      if (me.logituitFullscreenRecommendedPopupButton) {
        me.logituitFullscreenRecommendedPopupButton.releaseResource();
        me.Wrapper.removeChild(me.logituitFullscreenRecommendedPopupButton);
        delete me.logituitFullscreenRecommendedPopupButton;
        me.logituitFullscreenRecommendedPopupButton = null;
      }
      if (me.fullscreenRecommendedPopupComponent) {
        delete me.fullscreenRecommendedPopupComponent;
        me.fullscreenRecommendedPopupComponent = null;
      }

      if (me.logituitMiniplayerWatchNow) {
        me.logituitMiniplayerWatchNow.releaseResource();
        me.Wrapper.removeChild(me.logituitMiniplayerWatchNow);
        delete me.logituitMiniplayerWatchNow;
        me.logituitMiniplayerWatchNow = null;
      }
      if (me.miniplayerWatchNowComponent) {
        delete me.miniplayerWatchNowComponent;
        me.miniplayerWatchNowComponent = null;
      }
      
      me.player.removeChild(me.Wrapper)
      delete me.Wrapper;
      me.Wrapper = null;
      me.eventManager.initializeUiResources();
      me.eventManager.skipIntroVisible = false;
      me.eventManager.skipRecapVisible = false;
      try{
        const currentVolume = me.getNextVolume() || 1;
        me.player.volume(currentVolume)
        if(!me.player.muted()){
        logixdocument.querySelectorAll('.vjs-volume-level')[1].style.width = currentVolume*100 + "%"
        }else{
        logixdocument.querySelectorAll('.vjs-volume-level')[1].style.width = 0 + "%"
        }
      }
      catch(e){
        console.error(e)
      }
    },
    showMiniPlayer() {
      me.logituitMiniPlayer.showMiniplayer();
    },
    showMiniPlayerAtEndOfPlayback() {
      me.logituitMiniPlayer.showMiniPlayerAtEndOfPlayback();
    },
    releaseResourceFromMiniplayerEndOfPlayback() {
      me.releaseResource();
      me.Wrapper = this.initializeWrapperLayout(
        {
          'style': {
            'position': 'absolute;',
            'top': '0;',
            'height': '100%;',
            'width': '100%;'
          }
        }
        , player);

  //    me.baseOptions.playerControlsLayout.desktopjson.forEach(function (record) {
        me.uiStyleOption.forEach(function (record) {
        if (record.control == "miniPlayerExpand") {
          me.miniplayerExpandComponent = new logituitMiniplayerExpandComponent();
          me.logituitMiniplayerExpandButton = new me.miniplayerExpandComponent.expandButton(me.player, record, me, me.baseOptions);
          me.Wrapper.addChild(me.logituitMiniplayerExpandButton);
        }
        // if (record.control == "miniPlayerClose") {
        //   me.miniplayerCloseComponent = new logituitMiniplayerCloseComponent();
        //   me.logituitMiniplayerCloseButton = new me.miniplayerCloseComponent.closeButton(me.player, record, me, me.baseOptions);
        //   me.Wrapper.addChild(me.logituitMiniplayerCloseButton);
        // }
        // if (record.control == "miniPlayerPlay") {
        //   me.miniplayerPlayComponent = new logituitMiniplayerPlayComponent();
        //   me.logituitMiniplayerPlayButton = new me.miniplayerPlayComponent.playButton(me.player, record, me, me.baseOptions);
        //   me.Wrapper.addChild(me.logituitMiniplayerPlayButton);
        // }
        if (record.control == "miniplayerWatchingNow") {
          me.miniplayerWatchNowComponent = new logituitMiniplayerWatchNowComponent();
          me.logituitMiniplayerWatchNow = new me.miniplayerWatchNowComponent.miniplayerWatchNow(me.player, record, me, me.baseOptions, true);
          me.Wrapper.addChild(me.logituitMiniplayerWatchNow);
        }
        if (record.control == "miniplayerEpisodeTitle") {
          me.miniplayerEpisodeTitleComponent = new logituitMiniplayerEpisodeTitleComponent();
          me.logituitMiniplayerEpisodeTitle = new me.miniplayerEpisodeTitleComponent.miniplayerEpisodeTitle(me.player, record, me, me.baseOptions, true);
          me.Wrapper.addChild(me.logituitMiniplayerEpisodeTitle);
        }
        if (record.control == "miniplayerTitle") {
          me.miniplayerTitleComponent = new logituitMiniplayerTitleComponent();
          me.logituitMiniplayerTitle = new me.miniplayerTitleComponent.miniplayerTitle(me.player, record, me, me.baseOptions, true);
          me.Wrapper.addChild(me.logituitMiniplayerTitle);
        }
      });
      me.player.addChild(me.Wrapper);
    },
    showMuteIcon() {
      me.logituitVolume.showMuteIcon();
    },
    showVolumeIcon() {
      if (me.logituitVolume)
        me.logituitVolume.showVolumeIcon();
    },
    onLine() {
      me.eventManager.onLine();
    },
    showUnmuteIcon() {
      me.uiStyleOption.forEach(function (record) {
        if(record.control == "MobileMuteVolume" && !me.logituitMuteMobileVolume && me.iPhone() && me.player.muted()){
          me.muteMobileVolumeComponent = new logituitMuteVolumeMobileComponent();
          me.logituitMuteMobileVolume = new me.muteMobileVolumeComponent.MuteMobileVolume(me.player, record, me.Wrapper, me);
          me.Wrapper.addChild(me.logituitMuteMobileVolume);
        }
      });
    },
    removeUnmuteIcon() {
      if (me.logituitMuteMobileVolume) {
        me.logituitMuteMobileVolume.releaseResource();
        me.Wrapper.removeChild(me.logituitMuteMobileVolume);
        delete me.logituitMuteMobileVolume;
        me.logituitMuteMobileVolume = null;
      }
      if (me.muteMobileVolumeComponent) {
        delete me.muteMobileVolumeComponent;
        me.muteMobileVolumeComponent = null;
      }
    },
    showAllEpisodeIcon(allEpisodeData) {
      me.baseOptions.allEpisodeData = allEpisodeData;
      me.uiStyleOption.forEach(function (record) {
        if (record.control == "allEpisodeIcon_ui" && !me.allEpisodeIconComponent && ((typeof(me.baseOptions.allEpisodeData)== 'object' && me.baseOptions.allEpisodeData.length >0) || (typeof(me.baseOptions.allEpisodeData) == 'boolean' && me.baseOptions.allEpisodeData == true))) {
          me.allEpisodeIconComponent = new logituitAllEpisodeIcon();
          me.logituitAllEpisodeIconButton = new me.allEpisodeIconComponent.allEpisodeIcon(player, record, me.Wrapper, me.baseOptions, me);
          me.Wrapper.addChild(me.logituitAllEpisodeIconButton);
        }
      });
    },
    setAllEpisodeData(AllEpisodeArray){		
      me.baseOptions.allEpisodeData = AllEpisodeArray;
    },
    showdivider(){
      // if (me.logituitDividerButton) {
      //   me.logituitDividerButton.releaseResource();
      //   me.Wrapper.removeChild(me.logituitDividerButton);
      //   delete me.logituitDividerButton;
      //   me.logituitDividerButton = null;
      // }
      // if (me.logituitDividerComponent) {
      //   delete me.logituitDividerComponent;
      //   me.logituitDividerComponent = null;
      // }
      me.uiStyleOption.forEach(function (record) {
       if (record.control == 'divider' && !this.logituitDividerComponent && me.baseOptions.allEpisodeData  != null && me.baseOptions.allEpisodeData != undefined && ((typeof(me.baseOptions.allEpisodeData) == 'object' && me.baseOptions.allEpisodeData.length >0) || (typeof(me.baseOptions.allEpisodeData)== 'boolean' && me.baseOptions.allEpisodeData == true))) {
        this.logituitDividerComponent = new logituitDivider();
        this.logituitDividerButton = new logituitDividerComponent.divider(player, record, me.Wrapper, me.baseOptions, me);
        me.Wrapper.addChild(this.logituitDividerButton);
      }
    });
    },
    setNextVolume:function(nextVolume){
      localStorage.setItem('setNextVideoVolume',nextVolume)
      //me.eventManager.setNextVideoVolume = nextVolume;
    },
    getNextVolume:function(){
      return localStorage.getItem('setNextVideoVolume') || me.eventManager.setNextVideoVolume;
    },
    setMuteIcon:function(val){
      me.eventManager.ismute = val;
    },
    getMuteIcon : function(){
      return me.eventManager.ismute;
    },

    setMuteState : function(state){
      localStorage.setItem('muteState',state)
    },
    getMuteState : function(){
      return localStorage.getItem('muteState')
    },

    showMiniplayerNoInternetError() {
    //   me.uiStyleOption.forEach(function (record) {
    //     if (record.control == 'miniplayerErrorMsg') {
    //      me.logituitMiniplayerErrorComponent = new logituitMiniplayerErrorMessageComponent();
    //      me.logituitMiniplayerError = new me.logituitMiniplayerErrorComponent.miniplayerErrorMessage(player, record, me);
    //      me.Wrapper.addChild(me.logituitMiniplayerError);
    //    }
    //  });
      if (me.logituitMiniplayerError) {
        me.logituitMiniplayerError.show();
      }
    },
    removeMiniplayerNoInternetError() {
      // if (me.logituitMiniplayerError) {
      //   me.Wrapper.removeChild(me.logituitMiniplayerError);
      //   me.logituitMiniplayerError.releaseResource();
      //   delete me.logituitMiniplayerError;
      //   me.logituitMiniplayerError = null;
      // }
      // if (me.logituitMiniplayerErrorComponent) {
      //   delete me.logituitMiniplayerErrorComponent;
      //   me.logituitMiniplayerErrorComponent = null;
      // }
      // me.eventManager.errorMsgVisible = false;
      if (me.logituitMiniplayerError) {
        me.logituitMiniplayerError.hide();
      }
    },
    playPauseButtonState() {
      if (me.logituitMiniplayerPlayButton) {
        me.logituitMiniplayerPlayButton.online();
      }
    },

   showControlsFromEventManager(){
     me.eventManager.showControls();
   },
   hideControlsWithTimeEventmanager(){
     me.eventManager.hideControlsTimeout();
   },
   clearTimeoutOfEventmanager(){
     me.eventManager.clearControlsTimeout();
   },


   showMiniPlayerPlayicon(){
    if (me.logituitMiniplayerPlayButton) {
      me.logituitMiniplayerPlayButton.releaseResource();
      me.Wrapper.removeChild(me.logituitMiniplayerPlayButton);
      delete me.logituitMiniplayerPlayButton;
      me.logituitMiniplayerPlayButton = null;
    }
    if (me.miniplayerPlayComponent) {
      delete me.miniplayerPlayComponent;
      me.miniplayerPlayComponent = null;
    }

    me.uiStyleOption.forEach(function (record) {
      if (record.control == "miniPlayerPlay") {
        me.miniplayerPlayComponent = new logituitMiniplayerPlayComponent();
        me.logituitMiniplayerPlayButton = new me.miniplayerPlayComponent.playButton(me.player, record, me, me.baseOptions);
        me.Wrapper.addChild(me.logituitMiniplayerPlayButton);
      }
    });

   },

   isVideoEnded() {
     return me.eventManager.videoEnded;
   },

   setVideoEnded(state) {
     me.eventManager.videoEnded = state;
   },

   sortTracks(audioTracks){
    try{
      for(let i=0;i<audioTracks.tracks_.length;i++){
        for(let j=0;j<i;j++){
          if(audioTracks.tracks_[i].label < audioTracks.tracks_[j].label){
            let temp = audioTracks.tracks_[i]
            audioTracks.tracks_[i] = audioTracks.tracks_[j]
            audioTracks.tracks_[j] = temp
          }
        }
      }
    }
    catch(e){}
    return audioTracks;
  }, 

   showNextEpisodeButton() {
    me.uiStyleOption.forEach(function (record) {
      if (!me.logituitExpisodeButton && record.control == "episode" && (me.baseOptions.assetType == "Episode")) {
        me.episodeButtonComponent = new logituitEpisodeButtonComponent();
        me.logituitExpisodeButton = new me.episodeButtonComponent.episodeButton(me.player, record, me);
        me.Wrapper.addChild(me.logituitExpisodeButton)
      }
    });
   }
  });



  videojs.registerComponent('UIEngine', this.UIEngine);
}