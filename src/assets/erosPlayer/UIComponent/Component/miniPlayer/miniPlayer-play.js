/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitMiniplayerPlayComponent() {
    // var currentTime = videojs.getComponent('CurrentTimeDisplay');
    var me;
    this.playButton = videojs.extend(videojs.getComponent('Button'), {
        constructor: function (player, option, uiEngine, baseOptions) {
            videojs.getComponent('Button').apply(this, arguments);
            this.uiEngine = uiEngine;
            this.baseOptions = baseOptions;
            this.elementRef;
            this.player = player;
            me = this;
            this.applyStyles(option.styleCSS);
            // window.addEventListener('offline', this.offLine, isConnected = false);
        },
        createEl: function () {
            this.elementRef = videojs.dom.createEl('button', {
              className: 'logituit_miniplayer_play'
            });
            return this.elementRef;
        },
        handleClick: function() {
            if (me.player.paused()) {
                // me.el().style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_icons/cta-pip/cta-pause.svg)";
                me.el().style.backgroundImage ="url(" +  me.options_.miniplayerPlayPause.miniplayerPlay + ")";
                if (me.baseOptions.isLive) {
                    me.player.liveTracker.seekToLiveEdge();
                }
                me.player.play();
            } else {
                // me.el().style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_icons/cta-pip/ic-play.svg)";
                me.el().style.backgroundImage = "url(" + me.options_.miniplayerPlayPause.miniplayerPause + ")";
                me.player.pause();
            }
            window.document.activeElement.blur();
        },
        online: function(event) {
            if(me.player.paused()) {
                me.player.play();         
                me.el().style.backgroundImage ="url(" +  me.options_.miniplayerPlayPause.miniplayerPlay + ")";       
               // me.el().style.backgroundImage = "url(" + me.options_.miniplayerPlayPause.miniplayerPause + ")";
             } 
            //else {
            //     me.el().style.backgroundImage ="url(" +  me.options_.miniplayerPlayPause.miniplayerPlay + ")";
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
            if (me.player.paused()) {
              //  this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/cta-pip/ic-play.svg')";
              this.el().style.backgroundImage ="url(" + me.options_.miniplayerPlayPause.miniplayerPause + ")";
            } else {
             //   this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/cta-pip/cta-pause.svg')";
             this.el().style.backgroundImage ="url(" +  me.options_.miniplayerPlayPause.miniplayerPlay + ")";
            }
        },
        releaseResource: function () {
            //releasing the resources
            if (this.playButton) {
                delete this.playButton;
                this.playButton = null;
            }
        }

    });
    videojs.registerComponent('logicMiniplayerPlayButton', this.playButton);
}