function logituitAllEpisodeIcon() {
  var me;
  this.allEpisodeIcon = videojs.extend(videojs.getComponent('ClickableComponent'), {
    constructor: function (player, options, wrapper, baseOptions, uiEngine, endTime) {
        videojs.getComponent('ClickableComponent').apply(this, arguments);
        this.applyStyles(options.styleCSS);
        
        this.uiEngine = uiEngine;
        this.player = player;
        this.endTime = endTime;
        this.baseOptions= baseOptions;
        me = this;
      //   this.headerAllEpisode();
      this.el().addEventListener("click", function(event) {
        if (me.baseOptions.allEpisodeData != null && me.baseOptions.allEpisodeData != undefined && typeof(me.baseOptions.allEpisodeData) == 'object' && me.baseOptions.allEpisodeData.length > 0) {
          me.uiEngine.createAllEpisode();
          me.sendEvent();
        } else if (me.baseOptions.allEpisodeData != null && me.baseOptions.allEpisodeData != undefined && typeof(me.baseOptions.allEpisodeData) == 'boolean' && me.baseOptions.allEpisodeData == true) {
          me.sendEvent();
        }
      })
      this.el().addEventListener("touchstart", function(event) {
        if (me.baseOptions.allEpisodeData != null && me.baseOptions.allEpisodeData != undefined && typeof(me.baseOptions.allEpisodeData) == 'object' && me.baseOptions.allEpisodeData.length > 0) {
          me.uiEngine.createAllEpisode();
          me.sendEvent();
        } else if (me.baseOptions.allEpisodeData != null && me.baseOptions.allEpisodeData != undefined && typeof(me.baseOptions.allEpisodeData) == 'boolean' && me.baseOptions.allEpisodeData == true) {
          me.sendEvent();
        }
      })
      this.tooltipDataFun();
      // me.uiEngine.addMobileSettingsPopup(me.uiOptions);
    },
    sendEvent: function () {
      var data = {};
      var eventName = 'onAllEpisodeIconClicked';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      me.uiEngine.reportEventToUiEngine(evt);
    },
    createEl: function() {
      this.elementRef = videojs.dom.createEl('div', {
        className:'logituit_allEpisodeIcon'
      });
      return this.elementRef;
    },
    releaseResource: function () {
      //releasing the resources
      if (this.elementRef) {
          delete this.elementRef;
          this.elementRef = null;
          delete this.allEpisode;
          this.allEpisode = null;
      }
    },
    tooltipDataFun: function(){
      let tooltipData = document.createElement("Label");
      tooltipData.setAttribute("class", "logituit_allEpisodeTooltip");
      tooltipData.innerHTML = "All Episodes";
      me.el().appendChild(tooltipData);
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
  });
  videojs.registerComponent('allEpisodeIcon', this.allEpisodeIcon);
}