/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitButtongoLiveTvComponent() {
    // var Button = videojs.getComponent('Button');
    this.duration = new logituitDurationComponent();
    this.durationObj = this.duration;
    var me;
    this.GoliveButtonTv = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option, uiEngine) {
        videojs.getComponent('Button').apply(this, arguments);
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text);
        this.elementRef;
        this.player = player;
        this.uiEngine = uiEngine;
        me = this;
      },
       createEl: function() {
       this.elementRef = videojs.dom.createEl('button', {
         className:'logituit_GolivebuttonTV'
       });
       return this.elementRef;
     },
        
      updateTextContent: function(text) {
      if (typeof text !== 'string') {
        text = 'Title Unknown';
      }
     this.el().innerHTML=text
    },
    sendEvent: function() {
      var data = {
        currentTime: me.player.currentTime(),
      };
      var eventName = 'onLiveClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
    

    handleClick: function() {
      // this.sendEvent();
      me.player.currentTime(
        me.player.duration()
      );
      
      this.el().style.display="none";
      var livetvbuttonactivated=document.getElementsByClassName('logituit_livebuttonTV')[0];
      livetvbuttonactivated.style.display ="block";
      me.player.play()
        var playTv=document.getElementsByClassName("play")[0]
        playTv.style.backgroundImage = "url(player/assets/player_assets/ic-backbuttontv/icon_pause_broad.png)"
    },
    applyStyles : function(options){
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
        delete this.elementRef;
        this.elementRef = null;
        delete this.GoliveButtonTv;
        this.GoliveButtonTv = null;
      }
      }
    });
    videojs.registerComponent('liveButton', this.GoliveButtonTv);
    }
    