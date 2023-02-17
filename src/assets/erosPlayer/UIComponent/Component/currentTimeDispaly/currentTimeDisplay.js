/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitCurrentTimeComponent() {
  var me;
  this.currentTime = videojs.extend(videojs.getComponent('CurrentTimeDisplay'), {
    constructor: function (player, option) {
      videojs.getComponent('CurrentTimeDisplay').apply(this, arguments);
      this.player = player;
      me = this;
      this.applyStyles(option.styleCSS);
      this.applyClass(option.className);
      this.currentTime()
    },
    applyClass: function (className) {
      this.el().classList.add('logituit_currentTime');
    },

    currentTime: function () {
      var myPlayer = me.player.currentTime()
      var minutes = Math.floor(myPlayer / 60);
      var seconds = Math.floor(myPlayer - minutes * 60)
      var x = minutes < 10 ? "0" + minutes : minutes;
      var y = seconds < 10 ? "0" + seconds : seconds;
      this.formattedTime_ = ""
      var a = this.eventBusEl_.getElementsByClassName("vjs-current-time");
      a.innerHTML = this.formattedTime_;
      //this.eventBusEl_.getElementsByClassName("vjs-current-time-dispaly").innerHTML=this.formattedTime_;
      this.el().getElementsByClassName("logituit_currentTime").innerHTML = x + ":" + y;
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

    setClass: function (className) {
      this.el().setAttribute("class", className);
    },
    releaseResource: function () {
      //releasing the resources
      if (this.currentTime) {
        delete this.currentTime;
        this.currentTime = null;
      }
    }

  });
  videojs.registerComponent('logixCurrentTIme', this.currentTime);
}