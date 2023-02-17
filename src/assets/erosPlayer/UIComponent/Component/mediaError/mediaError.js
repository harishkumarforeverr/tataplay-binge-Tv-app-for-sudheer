/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
 function logituitMediaErrorMessageComponent() {
    // var Component = videojs.getComponent('Component');
    var me;
    this.mediaErrorMessage = videojs.extend(videojs.getComponent('Component'), {
      constructor: function (player, status, message, caller) {
        videojs.getComponent('Component').apply(this, arguments);
        // this.applyStyles(options.styleCSS);
        // this.updateTextContent(message);
        this.elementRef;
        this.caller = caller;
        me = this;
        // 0   MEDIA_ERR_CUSTOM
        // 1   MEDIA_ERR_ABORTED
        // 2   MEDIA_ERR_NETWORK
        // 3   MEDIA_ERR_DECODE	
        // 4   MEDIA_ERR_SRC_NOT_SUPPORTED
        // 5   MEDIA_ERR_ENCRYPTED
        this.ErrorMsgPopup(status, message);
      },
      createEl: function (arg) {
        this.elementRef = videojs.dom.createEl('div', {
          className: 'logituit_media_error_msg'
        });
        return this.elementRef;
      },
      ErrorMsgPopup(status, message) {
          let errorTitle;
        switch(status) {
            case 2: 
                errorTitle = 'No Internet Connection';
                message = "Check your internet connection and try again";
                break;
            default: 
                errorTitle = 'ERROR'
                break;

        }
        //   let errorMsg = document.createElement("div");
        //   errorMsg.setAttribute("class", "error_msg");            
        //   let errorpopup = document.getElementsByClassName('error_msg')[0];
        let errorMsg = document.createElement("div");
        errorMsg.setAttribute("class", "error_msg");
        errorMsg.style.visibility = "visible";
  
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
        // retrybutton.style.backgroundImage = retryImg;
        retrybutton.style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_iconsMobile/forwardRewind/cta-10-frw.svg')"
  
  
        retrybutton.addEventListener("click", function (e) {
            me.caller.reinitPlayer();
        });
        retrybutton.addEventListener("touchstart", function (e) {
            me.caller.reinitPlayer();
        });
  
  
        var errorPopup = document.getElementsByClassName('error_msg')[0];
        // errorPopup.classList.add('visible');   
        let textData = document.createElement("p");
        textData.setAttribute("class", "error_text");
        textData.innerHTML = errorTitle;
        let textDataMsg = document.createElement("p");
        textDataMsg.setAttribute("class", "error_text_msg");
        textDataMsg.innerHTML = message;
        errorMsg.appendChild(textData);
        errorMsg.appendChild(textDataMsg);
        errorMsg.appendChild(retrybutton); // my change
        me.el().appendChild(errorMsg);
        errorMsg.addEventListener('touchstart', function(e){
          e.stopPropagation();
        });
  
      },
      updateTextContent: function (text) {
        if (typeof text !== 'string') {
          text = 'Title Unknown';
        }
        videojs.emptyEl(this.el());
        videojs.appendContent(this.el(), text);
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
    videojs.registerComponent('MediaError', this.mediaErrorMessage);
  }