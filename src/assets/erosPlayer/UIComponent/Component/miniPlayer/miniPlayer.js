/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitMiniPlayerComponent() {
    // var Button = videojs.getComponent("Button");
    var me;
    this.miniPlayer = videojs.extend(videojs.getComponent("Button"), {
      constructor: function (player, option, uiEngine, baseOptions) {
        videojs.getComponent("Button").apply(this, arguments);
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text);
        this.appendChildSubPip();
        this.elementRef;
        this.player = player;
        this.uiEngine = uiEngine;
        this.baseOptions = baseOptions;
        me = this;
        this.tooltipDataFun();
      },
      offLine: function(event) {
        if (me.uiEngine.getMiniplayerState())
        {
          if (me.player.play()) {
            me.player.pause();
          }
          me.uiEngine.showMiniplayerNoInternetError();
        }
      },
      tooltipDataFun: function () {
        let tooltipData = document.createElement("Label");
        tooltipData.setAttribute("class", "logituit_miniPlayerTooltip");
        tooltipData.innerHTML = "Mini-player";
        me.el().appendChild(tooltipData);
      },
      createEl: function () {
        this.elementRef = videojs.dom.createEl('button', {
          className: 'logituit_miniPlayer'
        });
        return this.elementRef;
      },
      sendEvent: function () {
        var data = {
          afterSeek: me.player.currentTime(),
        };
        var eventName = 'onMiniPlayerClick';
        var evt = new CustomEvent(eventName, {
          detail: data,
        });
        this.uiEngine.reportEventToUiEngine(evt);
      },
  
      handleClick: function () {
        me.showMiniplayer();
        this.sendEvent();
      },
  
      showMiniplayer() {
        var videoContainer = document.getElementById(me.baseOptions.videoId);
        var videoElement = document.getElementById(me.baseOptions.videoId + '_html5_api');
        var state = me.uiEngine.getMiniplayerState();
        if(!state) {
            if(me.player.isFullscreen()) {
              me.player.exitFullscreen();
            }
            me.uiEngine.setMiniplayerState(true);
            window.document.activeElement.blur();
            me.uiEngine.addkeyboardcontroldisableremove();
            videoContainer.classList.remove('vjs-16-9');
            videoContainer.classList.remove('vjs-fluid');
            videoContainer.classList.remove('desktopMainVideoContainer');
            me.player.textTracks_.tracks_.forEach(function (element, index) {
              if (me.player.textTracks_.tracks_[index].mode == "showing") {
                me.player.textTracks_.tracks_[index].mode = "disabled";               
                 }
                });
            videoContainer.classList.add('logituit_miniplayer_container');
            videoElement.classList.add('logituit_miniplayer_container_video');
            // videoContainer.classList.add('vjs-4-3');
            videoContainer.style.width = '427px';
            videoContainer.style.height = '240px';
            videoContainer.style.minHeight = "unset";
            videoContainer.style.padding = '0';
            videoContainer.style.position = 'fixed';
            videoContainer.style.bottom = '3.2%';
            videoContainer.style.right = '2%';
            videoContainer.style.zIndex = '1';
            videoElement.style.borderRadius = "8px";
            videoContainer.style.borderRadius = "8px";
            window.addEventListener('offline', this.offLine, isConnected = false);
            me.uiEngine.releaseResourceFromEventManager();
        }
      },

      showMiniPlayerAtEndOfPlayback() {
        var videoContainer = document.getElementById(me.baseOptions.videoId);
        var videoElement = document.getElementById(me.baseOptions.videoId + '_html5_api');
        var state = me.uiEngine.getMiniplayerState();
        if(!state) {
            if(me.player.isFullscreen()) {
              me.player.exitFullscreen();
            }
            me.uiEngine.setMiniplayerState(true);
            window.document.activeElement.blur();
            me.uiEngine.addkeyboardcontroldisableremove();
            videoContainer.classList.remove('vjs-16-9');
            videoContainer.classList.remove('vjs-fluid');
            videoContainer.classList.remove('desktopMainVideoContainer');
            me.player.textTracks_.tracks_.forEach(function (element, index) {
              if (me.player.textTracks_.tracks_[index].mode == "showing") {
                me.player.textTracks_.tracks_[index].mode = "disabled";               
                 }
                });
            videoContainer.classList.add('logituit_miniplayer_container');
            videoElement.classList.add('logituit_miniplayer_container_video');
            // videoContainer.classList.add('vjs-4-3');
            videoContainer.style.width = '427px';
            videoContainer.style.height = '240px';
            videoContainer.style.minHeight = "unset";
            videoContainer.style.padding = '0';
            videoContainer.style.position = 'fixed';
            videoContainer.style.bottom = '3.2%';
            videoContainer.style.right = '2%';
            videoContainer.style.zIndex = '1';
            videoElement.style.borderRadius = "8px";
            videoContainer.style.borderRadius = "8px";
            me.uiEngine.releaseResourceFromMiniplayerEndOfPlayback();
        }
      },

      appendChildSubPip: function () {
        let ele = document.createElement("div");
        ele.setAttribute("id", "PiP")
        this.el().appendChild(ele)
      },
  
      updateTextContent: function (text) {
        if (typeof text !== 'string') {
          text = 'Title Unknown';
        }
        this.el().innerHTML = text
      },
  
      applyStyles: function (options) {
        var element = this.el();
        if (element) {
          //element.setAttribute(); 
        }
        for (key in options) {
          let cssArray = options[key];
          let value = ""
          let obj = cssArray;
          Object.keys(obj).forEach(function(k) {
            if(typeof(obj[k]) == 'object') {
              obj[k].forEach(function(subkey) {
                value = value + k + ":" + subkey;
              });
            } else {
              value = value + k + ":" + obj[k];
            }
          });
          //  cssArray.forEach(function(element) {
          //    for(ele in element)
          //    {
          //     value=value+ele+":"+element[ele];
          //    }
          //  });
          if (element) {
            element.setAttribute(key, value);
          }
        }
      },
      applyClass: function (className) {
        this.el().setAttribute("class", className)
      },
      releaseResource: function () {
        //releasing the resources
        if (this.elementRef) {
          delete this.elementRef;
          this.elementRef = null;
          delete this.miniPlayer;
          this.miniPlayer = null;
        }
      }
  
    });
    videojs.registerComponent('LogixMiniPlayer', this.miniPlayer);
  }