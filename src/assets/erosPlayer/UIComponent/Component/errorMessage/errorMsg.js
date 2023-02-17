/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitErrorMessageComponent() {
  // var Component = videojs.getComponent('Component');
  var me;
  this.errorMessage = videojs.extend(videojs.getComponent('Component'), {
    constructor: function (player, options, uiEngine, eventManager) {
      videojs.getComponent('Component').apply(this, arguments);
      this.applyStyles(options.styleCSS);
      this.updateTextContent(options.text);
      this.elementRef;
      this.uiEngine = uiEngine;
      this.eventManager = eventManager;
      this.options = options;
      me = this;
      this.ErrorMsgPopup(me.options.retryImage);
    },
    createEl: function (arg) {
      this.elementRef = videojs.dom.createEl('div', {
        className: 'logituit_error_msg'
      });
      return this.elementRef;
    },
    ErrorMsgPopup(retryImg) {

      //   let errorMsg = document.createElement("div");
      //   errorMsg.setAttribute("class", "error_msg");            
      //   let errorpopup = document.getElementsByClassName('error_msg')[0];
      let errorMsg = document.createElement("div");
      errorMsg.setAttribute("class", "error_msg");

      // changes start here 
      let retrybutton = document.createElement("div");
      // retrybutton.setAttribute("class", "logituit_forwardIcon");
      //  me.player_.el().appendChild(retrybutton);
      // retrybutton.innerHTML = "Check your internet connection and try again";
      retrybutton.style.height = "17%";
      retrybutton.style.width = "9%";
      retrybutton.style.left = "48%";
      retrybutton.style.top = "30%";
      retrybutton.style.position = "absolute";
      retrybutton.style.backgroundRepeat = "no-repeat"
      retrybutton.style.backgroundImage = retryImg;
      //  retrybutton.style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_iconsMobile/forwardRewind/cta-10-frw.svg')"


      retrybutton.addEventListener("click", function (e) {
        online = window.navigator.onLine;
        if (online) {
          if (me.uiEngine) {
            me.uiEngine.onLine();
          } else {
            me.eventManager.onLine();
          }
        }
      });

      errorMsg.addEventListener("click", function (e) {
        online = window.navigator.onLine;
        if (online) {
          if (me.uiEngine) {
            me.uiEngine.onLine();
          } else {
            me.eventManager.onLine();
          }
        }
      });

      retrybutton.addEventListener("touchstart", function (e) {
        online = window.navigator.onLine;
        if (online) {
          
          if (me.uiEngine) {
            me.uiEngine.onLine();
          } else {
            me.eventManager.onLine();
          }
        }
      });

      errorMsg.addEventListener("touchstart", function (e) {
        online = window.navigator.onLine;
        if (online) {
          
          if (me.uiEngine) {
            me.uiEngine.onLine();
          } else {
            me.eventManager.onLine();
          }
        }
      });
      //end here


      var errorPopup = document.getElementsByClassName('error_msg')[0];
      // errorPopup.classList.add('visible');   
      let textData = document.createElement("p");
      textData.setAttribute("class", "error_text");
      textData.innerHTML = "No Internet Connection";
      let textDataMsg = document.createElement("p");
      textDataMsg.setAttribute("class", "error_text_msg");
      textDataMsg.innerHTML = "Check your internet connection and try again";
      errorMsg.appendChild(textData);
      errorMsg.appendChild(textDataMsg);
      errorMsg.appendChild(retrybutton); // my change
      me.el().appendChild(errorMsg);
      errorMsg.addEventListener('touchstart', function(e){
        e.stopPropagation();
      });

    },
    showErrorMsg() {
      var errorPopup = document.getElementsByClassName('error_msg')[0];
      errorPopup.classList.add('visible');
    },
    removeErrorMsg() {
      var errorPopup = document.getElementsByClassName('error_msg')[0];
      errorPopup.classList.remove('visible');
    },
    updateTextContent: function (text) {
      if (typeof text !== 'string') {
        text = 'Title Unknown';
      }
      videojs.emptyEl(this.el());
      videojs.appendContent(this.el(), text);
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
      if (this.elementRef) {
        delete this.elementRef;
        this.elementRef = null;
        delete this.titleBar;
        this.titleBar = null;
      }
    }
  });
  videojs.registerComponent('TitleBar', this.errorMessage);
}