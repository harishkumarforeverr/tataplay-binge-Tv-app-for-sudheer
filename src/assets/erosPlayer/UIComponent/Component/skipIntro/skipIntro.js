/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function loguituitSkipIntroButtonComponent() {
    var me ;
    this.skipIntroButton = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option, uiEngine, baseOptions) {
        videojs.getComponent('Button').apply(this, arguments);
        this.opt = option;
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text)
        this.elementRef;
        this.uiEngine = uiEngine;
        this.player = player;
        this.baseOptions = baseOptions;
        me = this;
      },
       createEl: function() {
       this.elementRef = videojs.dom.createEl('button', {
         className:'logituit_skipIntro'
       });
       return this.elementRef;
     },
     sendEvent: function() {
      var data = {
        currentTime: me.player.currentTime()
      };
      var eventName = 'onSkipIntroButtonClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
      handleClick: function() {
        this.el_.style.display='none';
        var recapObj;
      me.baseOptions.cuePointList.forEach(function(element) {
        if(element.title.toString().toLowerCase() == 'intro') {
          recapObj = element;
        }
      });
      me.player.currentTime(me.player.currentTime() + (recapObj.end_time - me.player.currentTime()))
      this.sendEvent();
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
        delete this.elementRef;
        this.elementRef = null;
        delete this.skipIntroButton;
        this.skipIntroButton = null;
      }
    }
    });
    videojs.registerComponent('skipIntroButton', this.skipIntroButton);
    }