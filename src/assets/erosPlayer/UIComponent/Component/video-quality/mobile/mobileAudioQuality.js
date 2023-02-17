function logituitMobileAudioQualityPopup() {
    var me;
    this.mobileAudioQuality = videojs.extend(videojs.getComponent('ClickableComponent'), {
        constructor: function (player, options, wrapper, baseOptions, uiEngine) {
            // this.videoPopupComp = new logituitVideoPopupComponent();
            // var PopupComponentop = new this.videoPopupComp.PopupComponent(player, options, wrapper, baseOptions, uiEngine);
            videojs.getComponent('ClickableComponent').apply(this, arguments);
            me = this;
            this.options = options;
            this.uiEngine = uiEngine;
            this.applyStyles(options.option.styleCSSQuality)
            let containerData = document.createElement("div");
            let icon_span = document.createElement("span");

            this.el().setAttribute("class", "audioQualityChildPopup");

            let containerTitle = document.createElement("Label");
            containerTitle.innerHTML = "Audio Quality";
            containerTitle.setAttribute("class", "containerTitle");
            containerTitle.style.fontSize = "20px";


            icon_span.style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_iconsPortrait/asset_arrow/ic-arrow.png)";
            icon_span.style.width = "8%";
            icon_span.style.height = "10%";
            icon_span.style.display = "flex";
            icon_span.style.backgroundRepeat = "no-repeat";
            icon_span.style.marginLeft = '5%';
            icon_span.style.top = '7.5%';
            icon_span.style.position = "absolute";
            // icon_span.style.backgroundSize = "contain";

            containerData.appendChild(icon_span)
            containerData.appendChild(containerTitle)

            let qualityData = document.createElement("div");
            qualityData.setAttribute("class", "qualityData");
            baseOptions.audioQualitySettings.forEach(function (element) {
                let container = document.createElement("Label");
                container.setAttribute("class", "containerQuality");
                container.setAttribute("id", element.playback_ql_id);
                container.setAttribute("bitrate", element.playback_ql_bitrate);
                container.setAttribute("quality", element.playback_ql_title);
                if(me.uiEngine.getAudioQuality() === element.playback_ql_title) {
                    container.classList.add('activeClass');
                }
                if (element.playback_ql_checked) {
                    container.classList.add('activeClass');
                    element.playback_ql_checked = false;
                }
                let quality = document.createElement("Label");
                quality.setAttribute("for", element.playback_ql_title);
                if (element.playback_ql_quality) {
                    quality.innerHTML = element.playback_ql_title;
                } 
                else if(element.playback_ql_title == "Auto"){
                    quality.innerHTML = element.playback_ql_title;
                }
                else {
                    quality.innerHTML = element.playback_ql_title;
                }
                // quality.style.marginLeft="-76px"
                // quality.style.fontFamily = "ProximaNova-Regular";
                quality.style.fontSize = "14px";

                let br = document.createElement("br");

                container.appendChild(quality)
                container.appendChild(br)
                qualityData.appendChild(container)
                containerData.appendChild(qualityData)
                var containerQualityDiv = document.getElementsByClassName('containerQuality');
                container.addEventListener('touchstart', function (e) {
                    var hasclass = document.querySelectorAll('.activeClass')
                    if (hasclass && hasclass[0]) {
                        hasclass[0].classList.remove('activeClass')
                    }
                    let selectedIndex = container.getAttribute("bitrate")
                    let selectedVal = container.getAttribute('quality');
                    container.classList.add('activeClass');
                    // selectedId = e.currentTarget.id;
                    // e.target.htmlFor;
                    me.sendEvent(selectedVal, selectedIndex);
                    me.uiEngine.setAudioQuality(selectedVal); 


                    // me.changeQualityLevelStatus(player, selectedIndex);
                    me.uiEngine.removeMobileAudioQualityPopup();
                   
                    if (window.matchMedia("(orientation: landscape)").matches && (window.screen.width <= 920
                        || (window.screen.width <= 1366 && me.isIPad()))) {
                        // PopupComponentop.resetDataLandscape();
                    } else {
                        //PopupComponentop.resetDataPortrait();
                    }
                });

            });


            if (window.matchMedia("(orientation: landscape)").matches && (window.screen.width <= 920
                || (window.screen.width <= 1366 && me.isIPad()))) {
                icon_span.addEventListener('touchstart', function (e) {
                    me.uiEngine.removeMobileAudioQualityPopup();
                    me.uiEngine.addMobileSettingsPopup(me.options.option);
                });

            } else {
                icon_span.addEventListener('touchstart', function (e) {
                    me.uiEngine.removeMobileAudioQualityPopup();
                    me.uiEngine.addMobileSettingsPopup(me.options.option);
                });

            }
            me.el().appendChild(containerData);
            window.addEventListener("click", function(event) {
                var targetElement = event.target;
                if(targetElement != me.el()){
                  me.uiEngine.removeMobileAudioQualityPopup();
                }
              });
        },

        isIPad :function () {
            var isIpaddev = false;
            var userAgent = navigator.userAgent;
            isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(navigator.platform)));
            return isIpaddev;
        },

        createEl: function () {
            this.elementRef = videojs.dom.createEl('div', {
                className: ''
            });
            return this.elementRef;
        },
        sendEvent: function (selectedVal) {
            var data = {
                qualitySelected: selectedVal
            };
            var eventName = 'audioQualityChanged';
            var evt = new CustomEvent(eventName, {
                detail: data,
            });
            me.uiEngine.reportEventToUiEngine(evt);
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
                Object.keys(obj).forEach(function(k) {
                  if(typeof(obj[k]) == 'object') {
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
        changeQualityLevelStatusDash: function (player, configBitrate) {
            var qLevels = player.dash.mediaPlayer.getBitrateInfoListFor('video');
            var closest = qLevels[0].bitrate;
            let selectedIndex = 0;

            for (let i = 1; i < qLevels.length; i++) {
                if (Math.abs(qLevels[i].bitrate / 1000 - Number.parseInt(configBitrate)) < Math.abs(closest / 1000 - Number.parseInt(configBitrate))) {
                    closest = qLevels[i].bitrate;
                    selectedIndex = i;
                }
            }
            var index = selectedIndex;
            var selectedQuality = sessionStorage.getItem("qualityName")
            var maxbitrate;
            if (index == 1) {
                closest = qLevels[0].bitrate;
                index = 0;
            }

            if (selectedQuality != "Auto") {
                player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': false } } } });
                player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': false } } } });
            }
            else {
                player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': true } } } });
                player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': true } } } });
            }

            player.dash.mediaPlayer.setQualityFor('video', index);
            player.dash.mediaPlayer.setFastSwitchEnabled(true);
            if (sessionStorage.getItem('qualityKey') === 'auto') {
                index = player.dash.mediaPlayer.length;
            }
        },

        //hls
        changeQualityLevelStatus: function (player, configBitrate) {
            if (player.qualityLevels().levels_.length) {
                var playerBitrates = player.qualityLevels().levels_;

                var closest = playerBitrates[0].bitrate;
                let selectedIndex = 0;
                //playerBitrates.forEach((element,index) => {    });

                for (let i = 1; i < playerBitrates.length; i++) {
                    if (Math.abs(playerBitrates[i].bitrate / 1000 - Number.parseInt(configBitrate)) < Math.abs(closest / 1000 - Number.parseInt(configBitrate))) {
                        closest = playerBitrates[i].bitrate;
                        selectedIndex = i;
                    }
                }


                var index = selectedIndex;
                if (sessionStorage.getItem('qualityKey') === 'auto') {
                    index = player.qualityLevels().length;
                }


                for (var i = 0; i < player.qualityLevels().length; i++) {
                    if (i == index) {
                        player.qualityLevels()[i].enabled = true;
                    }
                    else {
                        player.qualityLevels()[i].enabled = false;
                    }
                }
            } else {
                var qLevels = player.dash.mediaPlayer.getBitrateInfoListFor('video');
                var closest = qLevels[0].bitrate;
                let selectedIndex = 0;

                for (let i = 1; i < qLevels.length; i++) {
                    if (Math.abs(qLevels[i].bitrate / 1000 - Number.parseInt(configBitrate)) < Math.abs(closest / 1000 - Number.parseInt(configBitrate))) {
                        closest = qLevels[i].bitrate;
                        selectedIndex = i;
                    }
                }
                var index = selectedIndex;
                var selectedQuality = sessionStorage.getItem("qualityName")
                var maxbitrate;
                if (index == 1) {
                    closest = qLevels[0].bitrate;
                    index = 0;
                }

                if (selectedQuality != "Auto") {
                    player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': false } } } });
                    player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': false } } } });
                }
                else {
                    player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': true } } } });
                    player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': true } } } });
                }

                player.dash.mediaPlayer.setQualityFor('video', index);
                player.dash.mediaPlayer.setFastSwitchEnabled(true);
                if (sessionStorage.getItem('qualityKey') === 'auto') {
                    index = player.dash.mediaPlayer.length;
                }
            }

        },
        releaseResource: function () {
            //releasing the resources
            if (this.elementRef) {
                delete this.elementRef;
                this.elementRef = null;
                delete this.mobileAudioQuality;
                this.mobileAudioQuality = null;
            }
        }
    });
    videojs.registerComponent('mobileAudioQuality', this.mobileAudioQuality);
}