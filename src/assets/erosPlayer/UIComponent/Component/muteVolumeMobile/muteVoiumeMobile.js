/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
 function logituitMuteVolumeMobileComponent() {
    // var Button = videojs.getComponent('Button');
    let wrapperSubtitleLayout;
    let volumeslider;
    var me;
    this.MuteMobileVolume = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option,wrapper,uiEngine) {
        videojs.getComponent('Button').apply(this, arguments);
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text);
        this.uiEngine = uiEngine;
        this.player = player;
        wrapperSubtitleLayout= wrapper;
        //volumeslider = new logituitMuteVolumeSliderComponent(player,{name:'slider'});
        me = this;
        //this.tooltipDataFun();
      },
       createEl: function() {
       this.elementRef = videojs.dom.createEl('button', {
         className:'logituit_MuteMobileVolumePanel'
       });
       return this.elementRef;
     },
     sendEvent: function(eventName) {
      var data = {
        mutedState: me.player.muted(),
      };
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
    
      handleClick: function(){
         me.player.muted(false);
         this.sendEvent('onMuteClick');
         me.uiEngine.removeUnmuteIcon()
       //me.uiEngine.displayVolumeIcon();
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
          delete this.MuteMobileVolume;
          this.MuteMobileVolume = null;
        }
      }
    });
    videojs.registerComponent('LogixMuteVolume', this.MuteMobileVolume);
    }