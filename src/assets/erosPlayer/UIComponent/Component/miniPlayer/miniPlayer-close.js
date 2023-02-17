/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitMiniplayerCloseComponent() {
    // var currentTime = videojs.getComponent('CurrentTimeDisplay');
    var me;
    this.closeButton = videojs.extend(videojs.getComponent('Button'), {
        constructor: function (player, option, uiEngine, baseOptions) {
            videojs.getComponent('Button').apply(this, arguments);
            this.uiEngine = uiEngine;
            this.baseOptions = baseOptions;
            this.player = player;
            me = this;
            this.applyStyles(option.styleCSS);
        },
        createEl: function () {
            this.elementRef = videojs.dom.createEl('button', {
              className: 'logituit_miniplayer_close'
            });
            return this.elementRef;
        },
        handleClick: function() {
            me.uiEngine.setMiniplayerState(false);
            me.player.pause();
            me.player.trigger({type: 'close', bubbles: false});
            // var videoContainer = document.getElementById(me.baseOptions.videoId);
            // var videoElement = document.getElementById(me.baseOptions.videoId + '_html5_api');            
            // var state = me.uiEngine.getMiniplayerState();
            // if (state) {
            //     me.uiEngine.setMiniplayerState(false);
            //     videoContainer.classList.add('vjs-16-9');
            //     videoContainer.classList.add('vjs-fluid');
            //     videoContainer.classList.add('desktopMainVideoContainer');
            //     // videoContainer.classList.add('vjs-4-3');
            //     videoContainer.style.width = '100%';
            //     videoContainer.style.height = '0';
            //     // videoContainer.style.padding = 'unset';
            //     videoContainer.style.display = 'block'
            //     videoContainer.style.minHeight = "100vh";
            //     // videoContainer.style.position = 'unset';
            //     videoContainer.style.removeProperty('position');
            //     videoContainer.style.removeProperty('padding');
            //     videoContainer.style.removeProperty('bottom');
            //     videoContainer.style.removeProperty('right');
            //     videoContainer.style.removeProperty('border-radius');

            //     videoElement.style.removeProperty('border-radius');
            //     me.uiEngine.initializeResources();
            // } 
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
            if (this.closeButton) {
                delete this.closeButton;
                this.closeButton = null;
            }
        }

    });
    videojs.registerComponent('logicMiniplayerCloseButton', this.closeButton);
}