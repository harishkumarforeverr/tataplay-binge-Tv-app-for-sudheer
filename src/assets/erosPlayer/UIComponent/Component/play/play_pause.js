/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */

function logituitPlayPauseComponent() {
    // var Button = videojs.getComponent('Button');
    var isTvApp = true;
    var me;
    var live_btn = true;
    this.playPause = videojs.extend(videojs.getComponent('Button'), {
        constructor: function (player, option, Wrapper, options, uiEngine) {
            videojs.getComponent('Button').apply(this, arguments);
            this.updateTextContent(option.text);
            this.elementRef;
            this.uiEngine = uiEngine;
            this.options = options;
            this.player = player;
            this.backgroundImgUrl;
            me = this;
            this.applyStyles(option.styleCSS);
            this.tooltipDataFun();
            this.playpauseFun(option.styleCSS);
        },
        playpauseFun: function (options) {
            let tooltipData = document.createElement("div");
            tooltipData.setAttribute("class", "logituit_playpause_animation");
            me.player.el().appendChild(tooltipData);
            let imgData = document.createElement("img");
            imgData.setAttribute("class", "play_img");
            for (key in options) {
                let cssArray = options[key];
                let value = ""
                let obj = cssArray;
                Object.keys(obj).forEach(function (k) {
                    if (k == 'background-image') {
                        me.backgroundImgUrl = obj[k];
                        imgData.setAttribute("style", k + ":" + obj[k]);
                    }
                });
            }
            me.player_.el().appendChild(imgData);
        },
        tooltipDataFun: function () {
            let tooltipData = document.createElement("Label");
            tooltipData.setAttribute("class", "logituit_playTooltip");
            tooltipData.innerHTML = "Play";
            me.el().appendChild(tooltipData);
        },
        createEl: function () {
            this.elementRef = videojs.dom.createEl('button', {
                className: 'logituit_play'
            });
            return this.elementRef;
        },
        sendEvent: function (eventName) {
            var data = {
                currentTime: me.player.currentTime(),
            };
            //var eventName = 'onPlayPauseClick';
            var evt = new CustomEvent(eventName, {
                detail: data,
            });
            this.uiEngine.reportEventToUiEngine(evt);
        },

        isIPad: function () {
            var isIpaddev = false;
            var userAgent = navigator.userAgent;
            isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
                navigator.maxTouchPoints > 2 &&
                /MacIntel/.test(navigator.platform)));
            return isIpaddev;
        },

        handleClick: function () {
            if (me.options.isLive) {
                me.player.liveTracker.seekToLiveEdge();
                me.uiEngine.setLiveFlag(true);
            }
            if ((me.uiEngine.isVideoEnded() && me.player.paused())) {
                let src=me.player.src();
                me.player.reset();
                me.player.currentTime(me.player.duration());
                me.uiEngine.setVideoEnded(false);
                me.player.src(src);
                me.player.load();
                me.player.play();
            } 
            else{
                this.player_.play();
                this.sendEvent('onPlayClick');
                me.uiEngine.showPauseIcon();

                setTimeout(function(){
                        me.player.play();
                },300)
                
            }
        },

        showOrHideControlsByClass: function (className, value) {
            var getClass = document.getElementsByClassName(className);
            var opacityValue;
            if (getClass && getClass[0]) {
                getClass[0].style.display = value;
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
                delete this.playPause;
                this.playPause = null;
            }
        },
        showPauseAnimation: function () {
            var animateIcon = document.getElementsByClassName('logituit_playpause_animation')[0];
            animateIcon.classList.add('visible');
            // animateIcon.classList.add('animationRipple');
            var playIcon = document.getElementsByClassName('pause_img')[0];
            playIcon.classList.add('visible');
            setTimeout(function () {
                animateIcon.classList.remove('visible');
                playIcon.classList.remove('visible');
                // animateIcon.classList.remove('animationRipple');
            }, 1000)
        },
        showPlayAnimation: function () {
            var animateIcon = document.getElementsByClassName('logituit_playpause_animation')[0];
            animateIcon.classList.add('visible');
            animateIcon.classList.add('animationRipple');
            var playIcon = document.getElementsByClassName('play_img')[0];
            playIcon.classList.add('visible');
            setTimeout(function () {
                animateIcon.classList.remove('visible');
                playIcon.classList.remove('visible');
                animateIcon.classList.remove('animationRipple');
            }, 1000)
        },
        showPlayIcon: function () {
            this.el().style.backgroundImage = me.backgroundImgUrl;
        }
    });
    videojs.registerComponent('LogituitPlay', this.playPause);
}