function logituitPauseButton() {
    var me;
    this.pauseButton = videojs.extend(videojs.getComponent('Button'), {
        constructor: function(player, options, wrapper, baseOptions, uiEngine, endTime) {
            videojs.getComponent('Button').apply(this, arguments);

            this.uiEngine = uiEngine;
            this.player = player;
            this.baseOptions = baseOptions;
            this.backgroundImgUrl;
            this.options = options;
            me = this;
            this.applyStyles(options.styleCSS);
            this.tooltipDataFunc();
            this.pauseAnimFunc(options.styleCSS);
        },
        pauseAnimFunc: function(options) {
            let tooltipData = document.createElement("div");
            tooltipData.setAttribute("class", "logituit_pause_animation");
            me.player.el().appendChild(tooltipData);
            let imgplayData = document.createElement("img");
            imgplayData.setAttribute("class", "pause_img");
            for (key in options) {
                let cssArray = options[key];
                let value = ""
                let obj = cssArray;
                Object.keys(obj).forEach(function(k) {
                    if (k == 'background-image') {
                        me.backgroundImgUrl = obj[k];                        
                        imgplayData.setAttribute("style", k + ":" + obj[k]);
                    }
                });
            }
            me.player_.el().appendChild(imgplayData);
        },
        tooltipDataFunc: function() {
            let tooltipData = document.createElement("Label");
            tooltipData.setAttribute("class", "logituit_pauseTooltip");
            tooltipData.innerHTML = "Pause";
            me.el().appendChild(tooltipData);
        },
        createEl: function() {
            this.elementRef = videojs.dom.createEl('div', {
                className: 'logituit_pause'
            });
            return this.elementRef;
        },
        releaseResource: function() {
            //releasing the resources
            if (this.elementRef) {
                delete this.elementRef;
                this.elementRef = null;
                delete this.allEpisode;
                this.allEpisode = null;
            }
        },
        handleClick: function() {
            if(me.baseOptions.isLive){
                me.player.liveTracker.seekToLiveEdge();
                me.uiEngine.setLiveFlag(false);
            }
            this.player_.pause();
            this.sendEvent('onPauseClick');
            me.uiEngine.showPlayIcon();
            // this.el().style.backgroundImage = me.backgroundImgUrl;
        },
        applyStyles: function(options) {
            var element = this.el();
            if (element) {
                //element.setAttribute(); 
            }
            for (key in options) {
                let cssArray = options[key];
                let value = ""
                let obj = cssArray;
                Object.keys(obj).forEach(function(k) {
                    if (typeof(obj[k]) == 'object') {
                        obj[k].forEach(function(subkey) {
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
        sendEvent: function(eventName) {
            var data = {
                currentTime: me.player.currentTime(),
            };
            //var eventName = 'onPlayPauseClick';
            var evt = new CustomEvent(eventName, {
                detail: data,
            });
            this.uiEngine.reportEventToUiEngine(evt);
        },
        showPauseAnimation: function() {
            var animateIcon = document.getElementsByClassName('logituit_pause_animation')[0];
            animateIcon.classList.add('visible');
            // animateIcon.classList.add('animationRipple');
            var pauseIcon = document.getElementsByClassName('pause_img')[0];
            pauseIcon.classList.add('visible');
            setTimeout(function() {
                animateIcon.classList.remove('visible');
                pauseIcon.classList.remove('visible');
                // animateIcon.classList.remove('animationRipple');
            }, 1000)
        },
        showPauseIcon: function() {
            this.el().style.backgroundImage = me.backgroundImgUrl;
            // if(me.options.isLive){
            //     me.player.liveTracker.seekToLiveEdge();
            //     me.uiEngine.setLiveFlag(false);
            // }
        }
    });
    videojs.registerComponent('pauseButton', this.pauseButton);
}