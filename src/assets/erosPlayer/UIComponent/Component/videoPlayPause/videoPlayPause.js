/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function loguituitVideoPlayPauseButtonComponent() {
    var me ;
    var live_btn;
    this.videoPlayPauseButton = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option,options,uiEngine) {
        videojs.getComponent('Button').apply(this, arguments);
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text)
        this.elementRef;
        this.uiEngine = uiEngine;
        this.player = player;
        this.options = options;
        me = this;
        setTimeout(() => {
          if (this.elementRef) {
            this.elementRef.addEventListener('dblclick',this.doubleClick);
          }
        }, 1000);
      },
       createEl: function() {
       this.elementRef = videojs.dom.createEl('div', {
         className:'logituit_videoplaypause'
       });
       return this.elementRef;
     },
     sendEvent: function() {
      var data = {
        currentTime: me.player.currentTime()
      };
    //   var eventName = 'onVideoPlayPauseButtonClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
    doubleClick: function(){
      if(!me.uiEngine.getMiniplayerState())
      {
      if(me.player.isFullscreen()) {
        me.player.exitFullscreen();
        me.uiEngine.showFullScreenIcon();
      } else {
        me.player.requestFullscreen();
        me.uiEngine.showExitScreenIcon();
      }
      }
    },
      handleClick: function() {
        if(me.uiEngine.isIPad() || me.uiEngine.isTablet()){
          if (me.uiEngine.isVideoEnded() && me.player.paused()) {
            let src=me.player.src();
            me.player.reset();
            me.player.currentTime(me.player.duration());
            me.uiEngine.setVideoEnded(false);
            me.player.src(src);
            me.player.load();
            me.player.play();
            }
        }
        else
        {
      //  if(me.uiEngine.isSafari() || me.uiEngine.isIPad()){
        if (me.uiEngine.isVideoEnded() && me.player.paused()) {
          let src=me.player.src();
          me.player.reset();
          me.player.currentTime(me.player.duration());
          me.uiEngine.setVideoEnded(false);
          me.player.src(src);
          me.player.load();
          me.player.play();
        }
     // }
        if(!me.uiEngine.getMiniplayerState())
        {
        me.uiEngine.removeSettingPopup();
        }
        // this.sendEvent();
        
        if (this.player_.paused()) {
          if(me.options.isLive){   
            me.player.liveTracker.seekToLiveEdge();                       
            me.uiEngine.setLiveFlag(true);
          }
          if(!me.uiEngine.getMiniplayerState())
          {
            
            me.uiEngine.showPauseIcon();
            this.player_.play();
            setTimeout(function(){

              me.player.play();
            
      },300)
          }
        }
        else
        {
          if(me.options.isLive){        
            me.player.liveTracker.seekToLiveEdge();   
            me.uiEngine.setLiveFlag(false);
          }
          if(!me.uiEngine.getMiniplayerState())
          {
            me.uiEngine.showPlayIcon();
            this.player_.pause();
          }
        }
      }
      },
    
      updateTextContent: function(text) {
      if (typeof text !== 'string') {
        text = 'Title Unknown';
      }
     this.el().innerHTML=text
    },
    applyStyles : function(options){
       var element=this.el();
       if(element){
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
    releaseResource: function() {
      //releasing the resources
      if (this.elementRef) {
        this.elementRef.removeEventListener('dblclick',this.doubleClick);
        delete this.elementRef;
        this.elementRef = null;
        delete this.videoPlayPauseButton;
        this.videoPlayPauseButton = null;
      }
    }
    });
    videojs.registerComponent('videoPlayPause', this.videoPlayPauseButton);
    }