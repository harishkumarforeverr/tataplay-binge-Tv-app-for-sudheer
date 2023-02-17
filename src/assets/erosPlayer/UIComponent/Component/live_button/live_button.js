/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitLiveButtonComponent() {
    // var Button = videojs.getComponent('Button');
    this.duration = new logituitDurationComponent();
    this.durationObj = this.duration;
    var me;
    this.liveButton = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option, uiEngine) {
        videojs.getComponent('Button').apply(this, arguments);
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text);
        this.elementRef;
        this.uiEngine = uiEngine;
        this.player = player;
        me=this;
        this.forIpad(); 
      },
      
      isIPad :function () {
        var isIpaddev = false;
        var userAgent = navigator.userAgent;
        isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform)));
        return isIpaddev;
      },
      forIpad(){
        var seekbar = document.getElementsByClassName('logituit_seekbar')[0];
        var subtitleButton = document.getElementsByClassName('logituit_subtitleButton')[0];
        var videoQButton = document.getElementsByClassName('logituit_videoQualityButton')[0];
        seekbar.style.width = "87%";  
        if(window.matchMedia("(orientation: landscape)").matches && me.isIPad()){
          // this.elementRef.style.left = "74%"
          // this.elementRef.style.bottom = "2.2%"
          this.elementRef.style.left = "76vw"
          this.elementRef.style.bottom = "0.1%"
        }
        else if(window.matchMedia("(orientation: portrait)").matches && me.isIPad()){           
          // this.elementRef.style.left = "74%"
          // this.elementRef.style.bottom = "1.2%"  
          this.elementRef.style.left = "76vw"
          this.elementRef.style.bottom = "0.1%"             
        }
        if (seekbar && videoQButton && !subtitleButton) {
          seekbar.style.width = "94.5%";  
        } else if(seekbar && !subtitleButton){
          seekbar.style.width = "100%";  
        }
      },
       createEl: function() {
       this.elementRef = videojs.dom.createEl('button', {
         className:'logituit_livebutton'
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
        delete this.elementRef;
        this.elementRef = null;
        delete this.liveButton;
        this.liveButton = null;
      }
      }
    });
    videojs.registerComponent('liveButton', this.liveButton);
    }
    