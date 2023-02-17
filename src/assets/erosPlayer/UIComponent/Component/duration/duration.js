/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitDurationComponent() {
  // var duration = videojs.getComponent('DurationDisplay');
  this.duration = videojs.extend(videojs.getComponent('DurationDisplay'), {
    constructor: function (player, option) {
      videojs.getComponent('DurationDisplay').apply(this, arguments);
      this.applyStyles(option.styleCSS);
      this.updateContent();
      this.applyClass(option.className);
    },

    updateTextContent: function (text) {
      if (this.player_.remainingTimeDisplay) {
        this.updateFormattedTime_(this.player_.remainingTimeDisplay());
      } else {
        this.updateFormattedTime_(this.player_.remainingTime());
      }
    },

    applyClass: function (className) {
      this.el().classList.add('logituit_duration');
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
        Object.keys(obj).forEach(function (k) {
          if (typeof (obj[k]) == 'object') {
            obj[k].forEach(function (subkey) {
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
    releaseResource: function () {
      //releasing the resources
      if (this.duration) {
        delete this.duration;
        this.duration = null;
      }
    }
  });
  videojs.registerComponent('logixDuration', this.duration);
}