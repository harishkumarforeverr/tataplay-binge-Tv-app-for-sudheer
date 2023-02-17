/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitSeekBarComponent() {
  var me;
  var Seekbar = videojs.getComponent('SeekBar');
  this.seekBar = videojs.extend(videojs.getComponent('SeekBar'), {
    constructor: function (player, option, uiEngine) {
      videojs.getComponent('SeekBar').apply(this, arguments);
      this.applyStyles(option.styleCSS);
      //  this.spriteThumbnail(player);
      this.applyClass(option.className);
      this.player = player;
      this.uiEngine = uiEngine;
      me = this;
      this.seekbarTouchEvent();
      // player.currentTime(uiEngine.getSeekTime());
    },
    // createEl: function() {
    // this.elementRef = videojs.dom.createEl('SeekBar', {
    //   className:'SeekBar'
    // });
    // return this.elementRef;
    // },
    isMobile: function () {
      var check = false;
      (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    },
    seekbarTouchEvent: function(){
     me.el().addEventListener('touchstart', function(event){
       if(me.uiEngine.logituitMobileSettingsPopup){
        me.uiEngine.removeMobileSettingsPopup();        
       }      
       else if(me.uiEngine.logituitMobileAudioQualityPopup)
       {   
         me.uiEngine.removeMobileAudioQualityPopup();
       }   
       else if(me.uiEngine.logituitMobileVideoQualityPopup)
       {   
         me.uiEngine.removeMobileVideoQualityPopup();
       }    
       else if(me.uiEngine.logituitMobileSubtitlePopup)
       {   
         me.uiEngine.removeMobileSubtitlePopup();
       }  
       else if(me.uiEngine.logituitMobileAudioPopup)
       {   
         me.uiEngine.removeMobileAudioPopup();
       }    
       else if(me.uiEngine.logituitMobileReportIssuePopup){
         me.uiEngine.removeMobileReportPopup();
       }    
     });
  },
    applyClass: function (className) {
      // this.el().setAttribute("class","seekbar")
      this.el().classList.add('logituit_seekbar');
    },
    sendEvent: function () {
      var data = {
        afterSeek: me.player.currentTime(),
      };
      var eventName = 'onSeekBarClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
    handleClick: function () {
      this.sendEvent();
      if(!me.player.paused()){
          me.player.pause();
          me.player.play();
      }
  
    },
    
    spriteThumbnail: function (player) {
      var customScale = -1, customScaleW, customScaleH, additionalMargin = 0;
      var spriteImageUrl = '';
      spriteImageUrlData = {};
      if (!this.isMobile()) {
        spriteImageUrl = ''
        // spriteImageUrl = 'https://www.radiantmediaplayer.com/media/vtt/thumbnails/assets/bbb-sprite.jpg'
        // spriteImageUrl ='https://sprite.sonyliv.com/2020/5/4/show_sab_taarak_mehta_ep2953_20200320T065727_640_360_73.jpg'
        //spriteImageUrl="https://bitmovin-a.akamaihd.net/content/MI201109210084_1/thumbnails/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.vtt"
      }
      // set up default width for frame
      let frameWidth = 160;
      // set up default height for frame
      let frameheight = 90;
      // set up default intervals 
      //let framesIntervals = 1;
      // Wrap up below operation with try catch block
      try {
        // Check if we have proper Url
        if (spriteImageUrl != null && spriteImageUrl != '' && spriteImageUrl.length > 0) {
          // Extract properties at this point
          let properties = spriteImageUrl.split("_");
          // Extract out number of frame properties
          var frames = properties[properties.length - 1].split(".")
          // Check for valid frame object
          if (frames != null && frames.length > 0) {
            // let totalVideoDuration = logixplayer.duration();
            // Set frame intervals based on total durations
            // framesIntervals = totalVideoDuration/(frames[0]);
            if (properties.length > 3) {
              // Lets set width and height of the frames
              frameWidth = properties[properties.length - 3];
              frameheight = properties[properties.length - 2];
            }
          }


          // customized parameters for sprite thumbnails
          if (spriteImageUrl && spriteImageUrl.length > 0) {
            // desktop
            if (!this.isMobile()) {
              customScale = 0.5;
              customScaleW = 350 / frameWidth;
              customScaleH = 197 / frameheight;
              additionalMargin = 30;
            }
            // mobile
            else {
              customScale = 0.5;
              customScaleW = 200 / frameWidth;
              customScaleH = 113 / frameheight;
              additionalMargin = 42;
            }
          }

          //send this data to logituiitplayer
          spriteImageUrlData = {
            "spriteUrl": spriteImageUrl,
            "width": frameWidth,
            "height": frameheight,
            "framesData": frames[0],
            "customScale": customScale,
            "customScaleW": customScaleW,
            "customScaleH": customScaleH,
            "additionalMargin": additionalMargin
          }
        }
      } catch (exception) {
        Logger.error("Exception caught during extracting sprite properties", exception)
      }
      if (player && spriteImageUrlData && spriteImageUrlData.spriteUrl) {
        // if (!opt.playerMetadataInfo.playbackInfo.resultObj.isDVR) {
        let framesIntervals = 1;
        let totalVideoDuration = 653.791667;
        // Set frame intervals based on total durations
        framesIntervals = totalVideoDuration / (spriteImageUrlData.framesData);

        if (framesIntervals > 0)
          player.spriteThumbnails({
            url: spriteImageUrlData.spriteUrl,
            control: this.el(),
            ele: this,
            width: spriteImageUrlData.width,
            height: spriteImageUrlData.height,
            customScale: spriteImageUrlData.customScale,
            customScaleW: spriteImageUrlData.customScaleW,
            customScaleH: spriteImageUrlData.customScaleH,
            additionalMargin: spriteImageUrlData.additionalMargin,
            interval: framesIntervals
          });
        //}

      }
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
      if (this.seekBar) {
        delete this.seekBar;
        this.seekBar = null;
      }
    }
  });
  videojs.registerComponent('Seek', this.seekBar);
}