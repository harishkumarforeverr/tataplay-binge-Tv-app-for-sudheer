function logituitDivider() {
    var me;
    this.divider = videojs.extend(videojs.getComponent('ClickableComponent'), {
        constructor: function (player, options, wrapper, baseOptions, uiEngine, endTime) {
            videojs.getComponent('ClickableComponent').apply(this, arguments);
            this.applyStyles(options.styleCSS);

            this.uiEngine = uiEngine;
            this.player = player;
            this.baseOptions = baseOptions;
            me = this;
        },

        createEl: function () {
            this.elementRef = videojs.dom.createEl('div', {
                className: 'logituit_divider'
            });
            return this.elementRef;
        },
        releaseResource: function () {
            //releasing the resources
            if (this.elementRef) {
                delete this.elementRef;
                this.elementRef = null;
                delete this.divider;
                this.divider = null;
            }
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
    });
    videojs.registerComponent('divider', this.divider);
}