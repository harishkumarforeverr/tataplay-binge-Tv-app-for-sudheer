/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
 function logituitMiniplayerWatchNowComponent() {
    // var Component = videojs.getComponent('Component');

    this.miniplayerWatchNow = videojs.extend(videojs.getComponent('Component'), {
        constructor: function (player, option, uiEngine, baseOptions, recommendedFullScreen) {
            videojs.getComponent('Component').apply(this, arguments);
            this.applyStyles(option.styleCSS);
            this.updateTextContent('YOU WERE WATCHING');
            this.elementRef;
            if (recommendedFullScreen) {
                this.el().style.bottom = '34%';
            }
        },
        createEl: function (arg) {
            this.elementRef = videojs.dom.createEl('div', {
                className: 'logituit_miniplayer_watchnow'
            });
            return this.elementRef;
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
                delete this.miniplayerWatchNow;
                this.miniplayerWatchNow = null;
            }
        }
    });
    videojs.registerComponent('miniplayerWatchNow', this.miniplayerWatchNow);
}