/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
 function logituitLoadingSpinnerComponent() {
    // var Button = videojs.getComponent('Button');
    var me;
    this.LoadingSpinner = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option, uiEngine) {
        // console.error
        if(!option.icon)
          return;
        videojs.getComponent('Button').apply(this, arguments);
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text);
        this.elementRef;
        this.player = player;
        this.uiEngine = uiEngine;        
        me = this;
      },
       createEl: function() {
        const path = this.options_.icon;
        if(typeof(path) !== 'undefined'){
          this.elementRef = document.getElementsByClassName('custom-spinner')
          if(this.elementRef.length){
            this.elementRef = this.elementRef[0]
          }
          else
          {
            this.elementRef = videojs.dom.createEl('img', {
              className:'vjs-loading-spinner custom-spinner',
              src: path,
              //src: 'UIComponent/Component/assets/LogiPlayer_icons/ic-loader/logix_tv_play_back_loader.gif'
            });
          }
        }
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
      var eventName = 'onLoadingSpinner';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },

    
    
    handleClick: function() {
      this.sendEvent();
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
        delete this.LoadingSpinner;
        this.LoadingSpinner = null;
      }
      }
    });
    videojs.registerComponent('LoadingSpinner', this.LoadingSpinner);
    }
    