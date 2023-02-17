/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */

function logituitMobileAudioPopup() {
var me;
 this.subtitleAudioComponent = videojs.extend(videojs.getComponent('ClickableComponent'), {
    constructor: function(player, options,wrapperLayout,baseOptions, uiEngine) {
        ClickableComponent.apply(this, arguments);
        this.uiEngine = uiEngine;
        this.options = options;
        this.wrapperLayout = wrapperLayout;
        this.baseOptions = baseOptions;
        this.player = player;
        this.updateTextContent(options.text)
        this.el().setAttribute("class","audioPopup");
        me = this;
        me.isPortrait = !me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
        me.isLandscape = me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
        if (me.isLandscape && (window.screen.width <=920
          || (window.screen.width <=1366 && me.isIPad()))) {
            this.applyStyles(options.option.styleCSSAudio);
            this.audioPopupMweb();
        } else if(me.isPortrait || me.isPortrait && me.isIPad()) {
            audioheight = screen.height - 320;
            // options.option.styleCSSAudio.style.top = audioheight + "px;";
            this.applyStyles(options.option.styleCSSAudio);
            this.audioPopupMweb();
        } else {
          
          var audioPopupStyle = options.option.styleCSSWebAudio;
          var styleForMacChrome = {left:"55%;"}
          var styleLeft = audioPopupStyle.style;
          // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36
          // if (navigator.userAgent.indexOf('Mac OS X') != -1) {
          // if (navigator.userAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36") {
            if(!me.isSafari() && navigator.userAgent.indexOf('Mac OS X') != -1)
            {
            // styleLeft[12] = styleForMacChrome;
            // audioPopupStyle = options.option.styleCSSWebAudio;
            // this.applyStyles(audioPopupStyle);`
            this.applyStyles(audioPopupStyle);
          } else {
            this.applyStyles(options.option.styleCSSWebAudio);
          }
          // this.applyStyles(options.option.styleCSSWebAudio);

                    AudioLanguage=new subtitleAudioChildComponent(player,{'style': {'font-size': '14px!important;',
                    'color': '#fff!important;',
                    'margin-bottom': '16px !important;',
                    'opacity':'0.5;',
                    'margin-left':'-115px;',
                    'margin-top':'-26px;'},text:"Audio"});
                     this.addSubtitleAudioChildrenComponent(AudioLanguage)

                     dividerLine=new ChildComponent(player,
                      {'style': {'width': '1px;',
                      'position': 'absolute;',
                      'right': '7%;',
                      'border-radius': '0.5px;',
                      'top':'9.3%;',
                      'background-color': 'rgba(255, 255, 255, 0.25);!important;',
                      'height' : '81.4%;'},text:""});
                      this.addSubtitleAudioChildrenComponent(dividerLine)

                    // baseOptions.audioLangOptions.forEach(function (element,index) {
                      let audioTracks = sortTracks(player.audioTracks()); 
                      // var playbackTitle = element.playback_al_title;
                      // var playbackId = element.playback_al_id;
                      audioTracks.tracks_.forEach(function(element, index) {
                        // if(audioTracks.tracks_[index].label.toLowerCase() == playbackTitle.toLowerCase()){
                      var playbackTitle = element.label;
                      var playbackId = element.id;
                      let containerAudio = document.createElement("Label");
                      containerAudio.setAttribute("class", "quality-label-container");
                      let createDiv = document.createElement("Div");
                      // createDiv.style.height = '15px';
                      let ele=document.createElement("input");
                      ele.setAttribute("type", "radio");
                      ele.setAttribute("name","AudioPopup");
                      ele.setAttribute("value",playbackId);
                      ele.setAttribute("title",playbackTitle);
                      
                      
                     
                      let AudioLabel=document.createElement("Label");
                     
                         
                          AudioLabel.setAttribute("for",playbackTitle);
                          if (playbackTitle) {
                            sessionStorage.setItem("audioKey", playbackTitle)
                          }
                          AudioLabel.innerHTML=playbackTitle;
                          AudioLabel.style.marginLeft="-54px"
                          // AudioLabel.style.fontFamily="ProximaNova-Regular"
                          AudioLabel.style.fontSize="14px";
                        
                        let addSpan = document.createElement("span");
                        addSpan.setAttribute("class", "checkmarkAudio");
                     

                     
                      // AudioLabel.setAttribute("for",element.playback_al_title);
                      // if (element.playback_al_title) {
                      //   sessionStorage.setItem("audioKey", element.playback_al_title)
                      // }
                      // AudioLabel.innerHTML=element.playback_al_title;
                      // AudioLabel.style.marginLeft="-54px"
                      // AudioLabel.style.fontFamily="ProximaNova-Regular"
                      // AudioLabel.style.fontSize="14px";
     
                      let br = document.createElement("br");
                      let text=document.createElement("span")
                      text.innerHTML="";
              
                     
                      containerAudio.appendChild(ele)
                      containerAudio.appendChild(AudioLabel)
                      containerAudio.appendChild(br)
                      containerAudio.appendChild(addSpan)
                      containerAudio.appendChild(text)
                      containerAudio.appendChild(createDiv);
                
                
                      me.el().appendChild(containerAudio)
            
                      ele.addEventListener('change', function (e) {
                        let selectedIndex=ele.getAttribute("value")
                        let selectedVal = ele.getAttribute('title');
                        // me.sendEventAudioLang(selectedVal,selectedIndex);
                        //  this.changeAudioSetting(player, selectedIndex);
                        let tracks = sortTracks(player.audioTracks());  
                        tracks.tracks_.forEach(function(element, index) {
                          if(tracks.tracks_[index].enabled == true){
                            tracks.tracks_[index].enabled= false;
                          }
                        });
                        me.uiEngine.setAudioLanguage(selectedVal);
                        tracks.tracks_.forEach(function(element, index){
                          if(selectedVal.toLowerCase() == tracks.tracks_[index].label.toLowerCase()){
                            tracks.tracks_[index].enabled=true;
                            tracks.tracks_[index].currentTime += me.player.currentTime();
                          }
                        });  
                        
                      });
                    // }
                  });
                     
                    // });
            }
            window.addEventListener("click", function(event) {
              var targetElement = event.target;
              if(targetElement != me.el()){
                me.uiEngine.removeMobileAudioPopup();
              }
            });
    },

    isSafari: function() {
      var userAgent = navigator.userAgent;
      
      // if (userAgent.indexOf("safari") != -1 || userAgent.indexOf("Safari") != -1) {
      var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      return safari;
    },

    isIPad :function () {
      var isIpaddev = false;
      var userAgent = navigator.userAgent;
      isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)));
      return isIpaddev;
      },
  
    audioPopupMweb: function(){
      // this.videoPopupComp = new logituitVideoPopupComponent();
      // var PopupComponentop = new this.videoPopupComp.PopupComponent(player, this.options, this.wrapperLayout,this.baseOptions,this.uiEngine);
      let containerData = document.createElement("div");
      let containerTitle = document.createElement("Label");
      containerTitle.innerHTML= "Audio Languages";
      containerTitle.setAttribute("class", "containerTitle");
      containerTitle.style.fontSize="20px";

      let icon_span = document.createElement("span");
      icon_span.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_iconsPortrait/asset_arrow/ic-arrow.png)";
      icon_span.style.width ="8%";
      icon_span.style.height="18%";
      icon_span.style.display="flex";
      icon_span.style.backgroundRepeat = "no-repeat";
      icon_span.style.marginLeft = '5%';
      icon_span.style.top = '7.5%';
      icon_span.style.position = "absolute";
      // icon_span.style.backgroundSize = "contain";

        containerData.appendChild(icon_span)
        containerData.appendChild(containerTitle)

        let qualityData = document.createElement("div");
        qualityData.setAttribute("class", "qualityData");

      // this.baseOptions.audioLangOptions.forEach(function (element) {
        let audioTracks = sortTracks(me.player.audioTracks()); 
        // var playbackTitle = element.playback_al_title;
        // var playbackId = element.playback_al_id;
        var defaultChecked = me.uiEngine.getAudioLanguage() || localStorage.getItem('defaultAudioLanguage');
        let isLanguagePresent = false
        let isHindiPresent = false
        let mainAudioTrack
        audioTracks.tracks_.forEach(function(element, index) {
          if(defaultChecked == element.label){
            isLanguagePresent = true;
          }
          if (audioTracks.tracks_[index].kind.toLowerCase() == 'main') {
            mainAudioTrack = audioTracks.tracks_[index].label;
          }
        })
        if(!isLanguagePresent){
          try{
            //defaultChecked = isHindiPresent? 'Hindi' : audioTracks.tracks_[0].label
            defaultChecked = mainAudioTrack ? mainAudioTrack : audioTracks.tracks_[0].label;
          }
          catch(e){}
        }
        if(!localStorage.getItem('defaultAudioLanguage')){
          localStorage.setItem('defaultAudioLanguage', defaultChecked)
          defaultChecked = me.uiEngine.getAudioLanguage() || localStorage.getItem('defaultAudioLanguage')
        }
        audioTracks.tracks_.forEach(function(element, index) {
        // if(audioTracks.tracks_[index].label.toLowerCase() == playbackTitle.toLowerCase()){
          var playbackTitle = element.label;
          var playbackId = element.id;
        let container = document.createElement("Label");
        container.setAttribute("class", "containerQuality");
        container.setAttribute("id" , playbackId);
        container.setAttribute("audioTitle" , playbackTitle);
        if(element.label == defaultChecked){
          container.classList.add('activeClass');
        }
        let quality=document.createElement("Label");
        if(playbackTitle != ""){
        quality.setAttribute("for",playbackTitle);
        quality.innerHTML= playbackTitle ;
        }else{
          quality.setAttribute("for",playbackTitle);
        quality.innerHTML= "default"
        }
        //quality.style.marginLeft="-76px"
        //quality.style.fontFamily="ProximaNova-Regular";
        quality.style.fontSize="14px";

      
        let br = document.createElement("br");
      
        container.appendChild(quality)
        container.appendChild(br)
        qualityData.appendChild(container)
        containerData.appendChild(qualityData)
        
        container.addEventListener('touchstart', function (e) {
          // let selectedVal = container.getAttribute('audioTitle');
          //this.sendEvent(selectedVal);
          let selectedIndex=container.getAttribute("value")
          let selectedVal = container.getAttribute('audioTitle');
         
          let tracks = sortTracks(me.player.audioTracks());  

          // let textTracks = me.player.textTracks();
          // if(me.uiEngine.getSubtitleLanguage() == "Off"){
          //   textTracks.tracks_.forEach(function (element, index) {
          //     if (textTracks.tracks_[index].mode == "showing") {
          //       textTracks.tracks_[index].mode = "disabled";               
          //     }
          //   });
          // }
          tracks.tracks_.forEach(function(element, index) {
            if(tracks.tracks_[index].enabled == true){
              tracks.tracks_[index].enabled= false;
            }
          });
          me.uiEngine.setAudioLanguage(selectedVal); 

          tracks.tracks_.forEach(function(element, index){
            if(selectedVal.toLowerCase() == tracks.tracks_[index].label.toLowerCase()){
              tracks.tracks_[index].enabled=true;
            }
          });  
          me.uiEngine.removeMobileAudioPopup();

          if(me.isLandscape && (window.screen.width <=920
            || (window.screen.width <=1366 && me.isIPad()))){
            //  PopupComponentop.resetDataLandscape();
            } else {
              // PopupComponentop.resetDataPortrait();
            }
          
            setTimeout(() => {
                
          
              let textTracks = me.player.textTracks();
              //if(me.uiEngine.getSubtitleLanguage() == "Off"){
              textTracks.tracks_.forEach(function (element, index){
                // console.log(textTracks.tracks_[index]);
                // console.log(textTracks.tracks_[index].mode);
                // console.log(textTracks.tracks_[index].mode == "showing" )
                // console.log(me.uiEngine.getSubtitleLanguage());
                // console.log(textTracks.tracks_[index].label != me.uiEngine.getSubtitleLanguage())
                // console.log(textTracks.tracks_[index].label == me.uiEngine.getSubtitleLanguage())
                    if (textTracks.tracks_[index].mode == "showing" && textTracks.tracks_[index].label != me.uiEngine.getSubtitleLanguage()) {
                      textTracks.tracks_[index].mode = "disabled";  
                      //console.log("disabled",textTracks.tracks_);   
                    }
              });
            //}

              textTracks.tracks_.forEach(function (element, index){
                    if (textTracks.tracks_[index].label == me.uiEngine.getSubtitleLanguage()) {
                  textTracks.tracks_[index].mode = "showing";    
                  //console.log("showing",textTracks.tracks_) ;
                }    
              });
            }, 1500);
        });
      // }
    });
      // });
      if((window.screen.width >=481 && window.screen.width <=920)){

        icon_span.addEventListener('touchstart', function (e) {
          me.uiEngine.removeMobileAudioPopup();
          me.uiEngine.addMobileSettingsPopup(me.options.option);
        });
       
      } else {
        icon_span.addEventListener('touchstart', function (e) {
          me.uiEngine.removeMobileAudioPopup();
          me.uiEngine.addMobileSettingsPopup(me.options.option);
        });
       
      }
        this.el().appendChild(containerData);
    
    },
    createEl: function() {
        this.elementRef = videojs.dom.createEl('div', {
          className: ''
      });
      return this.elementRef;
    },
    sendEventAudioLang: function(selectedVal) {
      var data = {
        audioSelected: selectedVal
      };
      var eventName = 'audioLanguageChanged';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      me.uiEngine.reportEventToUiEngine(evt);
    },
    handleClick: function(){
    },

    updateTextContent: function(text) {
      if (typeof text !== 'string') {
        text = '';
      }
      videojs.emptyEl(this.el());
      videojs.appendContent(this.el(), text);
    },


    applyStyles : function(options){
       var element=this.el();
       if(element){
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

    releaseResource: function () {
      //releasing the resources
      if (this.elementRef) {
          delete this.elementRef;
          this.elementRef = null;
          delete this.subtitleAudioComponent;
          this.subtitleAudioComponent = null;
      }
    },
    addSubtitleAudioChildrenComponent: function(child){
        this.addChild(child)
      }
    });
    videojs.registerComponent('subtitleAudioComponent', this.subtitleAudioComponent);
  }
    var subtitleAudioChildComponent=videojs.extend(ClickableComponent, {
        constructor: function(player, options) {
          ClickableComponent.apply(this, arguments);
          this.applyStyles(options.style);
          this.updateTextContent(options.text);
          //this.Language();
        },
        createEl: function() {
          return videojs.dom.createEl('div', {
            className:''
          });
        },
        handleClick: function() {
          this.setClass("select_quality")
        },
      

        updateTextContent: function(text) {
          if (typeof text !== 'string') {
            text = 'Title Unknown';
          }
          videojs.emptyEl(this.el());
          videojs.appendContent(this.el(), text);
        },
        applyStyles : function(options){
               var element=this.el();
               if(element){
                   //element.setAttribute(); 
               }
                let value = ""
                let obj = options;
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
              
        },
        addSubtitleAudioChildrenComponent: function(childArr){
  
        },
        setClass:function(className){
            this.el().setAttribute("class",className);
          },
          setID:function(idName){
            this.el().setAttribute("id",idName);
          }
        });

        sortTracks = function(audioTracks){
          try{
            for(let i=0;i<audioTracks.tracks_.length;i++){
              for(let j=0;j<i;j++){
                if(audioTracks.tracks_[i].label < audioTracks.tracks_[j].label){
                  let temp = audioTracks.tracks_[i]
                  audioTracks.tracks_[i] = audioTracks.tracks_[j]
                  audioTracks.tracks_[j] = temp
                }
              }
            }
          }
          catch(e){}
          return audioTracks;
        }
        videojs.registerComponent('subtitleAudioChildComponent', subtitleAudioChildComponent);