/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitMiniplayerExpandComponent() {
    // var currentTime = videojs.getComponent('CurrentTimeDisplay');
    var me;
    var isSafari = function () {
        var userAgent = navigator.userAgent;
    
        // if (userAgent.indexOf("safari") != -1 || userAgent.indexOf("Safari") != -1) {
        var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        return safari;
    }
    this.expandButton = videojs.extend(videojs.getComponent('Button'), {
        constructor: function (player, option, uiEngine,baseOptions) {
            videojs.getComponent('Button').apply(this, arguments);

            this.uiEngine = uiEngine;
            this.baseOptions = baseOptions;
            this.player=player;
            me = this;
            this.applyStyles(option.styleCSS);
        },
        createEl: function () {
            this.elementRef = videojs.dom.createEl('button', {
              className: 'logituit_miniplayer_expand'
            });
            return this.elementRef;
        },
        handleClick: function() {
            var videoContainer = document.getElementById(me.baseOptions.videoId);
            var videoElement = document.getElementById(me.baseOptions.videoId + '_html5_api');            
            var state = me.uiEngine.getMiniplayerState();
            if (state) {
                me.uiEngine.setMiniplayerState(false);
                me.uiEngine.addkeyboardcontroldisable();

                videoContainer.classList.add('vjs-fluid');
                videoContainer.classList.add('desktopMainVideoContainer');
                videoContainer.classList.remove('logituit_miniplayer_container');
                videoElement.classList.remove('logituit_miniplayer_container_video');
                // videoContainer.classList.add('vjs-4-3');
                videoContainer.style.width = '100%';
                videoContainer.style.height = '0';
                // videoContainer.style.padding = 'unset';
                videoContainer.style.display = 'block'
                videoContainer.style.minHeight = "100vh";
                // videoContainer.style.position = 'unset';
                videoContainer.style.removeProperty('position');
                videoContainer.style.removeProperty('padding');
                videoContainer.style.removeProperty('bottom');
                videoContainer.style.removeProperty('right');
                videoContainer.style.removeProperty('border-radius');

                videoElement.style.removeProperty('border-radius');
            } 
            me.uiEngine.initializeResources();
            me.player.currentTime(me.player.currentTime());
          if (typeof  me.player.vttThumbnails.initializeThumbnailsFunc == 'function') {
            me.player.vttThumbnails.initializeThumbnailsFunc();
          }
            let online = window.navigator.onLine;
            if (!online) {
               me.uiEngine.showErrorMsg();
            }
            setTimeout(() => {
                if (isSafari()) {
                    me.player.currentTime(me.player.currentTime()+0.0001);
                } else {
                    me.player.currentTime(me.player.currentTime());
                }
            },100);
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
            if (this.expandButton) {
                delete this.expandButton;
                this.expandButton = null;
            }
        }

    });
    videojs.registerComponent('logicMiniplayerExpandButton', this.expandButton);
}