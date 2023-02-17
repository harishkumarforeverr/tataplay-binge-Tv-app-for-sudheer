/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitExitScreenComponent() {
    // var Button = videojs.getComponent('Button');
    //exitScreenEngine = new ExitscreenEngine();
    var me;
    this.exitScreenObj = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option, uiEngine) {
        try{
          videojs.getComponent('Button').apply(this, arguments);
          this.applyStyles(option.styleCSS);
          this.updateTextContent(option.text);
          this.applyClass(option.className);
          //this.makeVideofullScreen(player);
          this.elementRef;
          this.player = player;
          me = this;
          this.uiEngine = uiEngine;
          this.tooltipDataFun();
        } catch (error) {
          Logger.error("error: ",error);
        }
      },
      hideIcon: function(){
        me.el_.style.display='none';
        },

    tooltipDataFun: function(){
      let tooltipData = document.createElement("Label");
      tooltipData.setAttribute("class", "logituit_exitScreenTooltip");
      tooltipData.innerHTML = "Exit Fullscreen";
      me.el().appendChild(tooltipData);
    },
     sendEvent: function(eventName) {
      var data = {
        currentTime: me.player.currentTime(),
      };
      //var eventName = 'onPlayPauseClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
    
    iOSDevice:function()
    {
      var iOSdev=false;
      var userAgent=navigator.userAgent;
      iOSdev=userAgent.match(/ipad/i) || userAgent.match(/iphone/i) || userAgent.match(/iPod/i);
      return iOSdev;
    },
    
    isIPad :function () {
      var isIpaddev = false;
      var userAgent = navigator.userAgent;
      isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)));
      return isIpaddev;
    },
    
    makeVideofullScreen:function(player) {
      try{
        var isIosDevice = false;
          isIosDevice = this.iOSDevice();
          var nativeControls = false;   
          if(isIosDevice)
             nativeControls = true;
        if (ExitscreenEngine) {
          ExitscreenEngine.InitializePlugin(player,nativeControls)
        } 
    }
    catch(exception){
      Logger.error("Exception : ",exception);
    }
    },
    
     handleClick: function(){
      this.player_.exitFullscreen();
      me.uiEngine.showFullScreenIcon();
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
    applyClass:function(className){
      this.el().setAttribute("class","logituit_exitscreen")
    },
    releaseResource: function() {
        //releasing the resources
        if (this.elementRef) {
          delete this.elementRef;
          this.elementRef = null;
          delete this.fullScreenObj;
          this.fullScreenObj = null;
        }
      }
    });
    videojs.registerComponent('LogixExitscreen', this.exitScreenObj);
    }