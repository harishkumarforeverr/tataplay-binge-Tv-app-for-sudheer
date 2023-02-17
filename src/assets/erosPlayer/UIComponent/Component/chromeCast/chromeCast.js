/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitChromeCastComponent() {
  // var Button = videojs.getComponent('Button');

  this.logixCC = videojs.extend(videojs.getComponent('Button'), {
    constructor: function (player, option) {
      videojs.getComponent('Button').apply(this, arguments);
      this.elementRef;
      this.applyStyles(option.styleCSS);
      this.updateTextContent(option.text);
    },
    createEl: function () {
      this.elementRef = videojs.dom.createEl('button', {
        className: 'logituit-chromecast'
      });
      return this.elementRef;
    },

    //  deactivatedChromecast: function(){
    //   document.getElementsByClassName('chromeCast')[0].style.display="none";
    // },


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
        let cssArray = options[key]
        let value = ""
        cssArray.forEach(function (element) {
          for (ele in element) {
            value = value + ele + ":" + element[ele];
          }
        });
        if (element) {
          element.setAttribute(key, value);
        }
      }
    },
    releaseResource: function () {
      //releasing the resources
      if (this.elementRef) {
        delete this.elementRef;
        this.elementRef = null;
        delete this.logixCC;
        this.logixCC = null;
      }
    }
  });
  videojs.registerComponent('LogixCC', this.logixCC);
}