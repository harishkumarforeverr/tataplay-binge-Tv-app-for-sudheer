/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitButtongoLiveComponent() {
    // var Button = videojs.getComponent('Button');
    this.duration = new logituitDurationComponent();
    this.durationObj = this.duration;
    var me;
    this.GoliveButton = videojs.extend(videojs.getComponent('Button'), {
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
         className:'logituit_Golivebutton'
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

      // me.player.currentTime(
      //   me.player.duration()
      // );
      
      this.el().style.display="none";
      // var livetvbuttonactivated=document.getElementsByClassName('logituit_livebutton')[0];
      // livetvbuttonactivated.style.display ="block";
      var forward = document.getElementsByClassName("logituit_forward");
      if(forward && forward[0])
      {
        forward[0].style.disabled= "true";
        forward[0].style.opacity="0.5";
        forward[0].style.display= "block";
      }
      // setTimeout(function(){
      //   var seekbardeactivate=document.getElementsByClassName('vjs-play-progress');
      // if(seekbardeactivate && seekbardeactivate[1]){
      //   seekbardeactivate[1].style.width ="100%";
      // }
      // },500)

    this.showOrHideControlsByClass('logituit_currentTime',"none");
    this.showOrHideControlsByClass('logituit_timeDivider',"none");
    this.showOrHideControlsByClass('logituit_duration',"none");

      me.player.liveTracker.seekToLiveEdge();
      me.player.play();
      var playBtn=document.getElementsByClassName("play")[0];
      playBtn.style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_iconsMobile/assets_03/drawable-mdpi/cta_pause.png)"
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

  showOrHideControlsByClass : function(className, value) {
      var getClass = document.getElementsByClassName(className);
      var opacityValue;
      if (getClass && getClass[0]) {
          getClass[0].style.display = value;
      }
  },

    releaseResource: function() {
      //releasing the resources
      if (this.elementRef) {
        delete this.elementRef;
        this.elementRef = null;
        delete this.GoliveButton;
        this.GoliveButton = null;
      }
      }
    });
    videojs.registerComponent('GoliveButton', this.GoliveButton);
    }
    