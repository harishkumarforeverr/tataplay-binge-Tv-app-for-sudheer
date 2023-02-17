/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitMiniPlayerComponent1() {
  // var Button = videojs.getComponent("Button");
  this.miniPlayer = videojs.extend(videojs.getComponent("Button"), {
    constructor: function (player, option, wrapper) {
      videojs.getComponent("Button").apply(this, arguments);
      this.applyStyles(option.styleCSS);
      this.updateTextContent(option.text);
      this.appendChildSubPip();
      this.elementRef;
      this.player = player;
      this.wrapper = wrapper;
      me = this;
      this.tooltipDataFun();
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

    handleClick: function () {
      let isPiPSupported = 'pictureInPictureEnabled' in document,
        isPiPEnabled = document.pictureInPictureEnabled;
      this.player.requestPictureInPicture();
      if (!isPiPSupported) {
        Logger.debug('The Picture-in-Picture Web API is not available.');
      }
      else if (!isPiPEnabled) {
        Logger.debug('The Picture-in-Picture Web API is disabled.');
      } else {
        Logger.debug("PiP supported");
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