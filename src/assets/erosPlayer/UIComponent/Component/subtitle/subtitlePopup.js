/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */

function logituitMobileSubtitlePopup() {
var me;
 this.subtitleComponent = videojs.extend(videojs.getComponent('ClickableComponent'), {
    constructor: function(player, options, wrapperLayout,baseOptions, uiEngine) {
        ClickableComponent.apply(this, arguments);
        this.updateTextContent(options.text);
        me = this;
        this.options = options;
        this.wrapperLayout = wrapperLayout;
        this.baseOptions = baseOptions;
        this.uiEngine = uiEngine;
        this.player = player;
        this.el().setAttribute("class","subtitlePopup");
        me.isPortrait = !me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
        me.isLandscape = me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
        if (me.isLandscape && (window.screen.width <=920
          || (window.screen.width <=1366 && me.isIPad()))) {
            this.applyStyles(options.option.styleCSSSubtitle)
            this.subtitlepopupMweb();
        } else if(me.isPortrait || me.isPortrait && me.isIPad()) {
              subtitleheight = screen.height - 320;
              // options.option.styleCSSSubtitle.style.top = subtitleheight + "px;";
              this.applyStyles(options.option.styleCSSSubtitle);

              this.subtitlepopupMweb();
        } else {
          this.applyStyles(options.option.styleCSSWebSubtitle);
              Subtitle=new subtitleChildComponent(player,{'style':{'font-size': '14px!important;',
              'color': '#fff!important;',
              'margin-bottom': '16px!important;',
              'position' : 'absolute;',
              'opacity':'0.5;',
              'left': '12%;',
              'margin-top':'-26px;' },text:"Subtitle"});
               this.addSubtitleChildrenComponent(Subtitle)

              // baseOptions.subtitles.forEach(function (elementUP,indexUP) {
                tracksArray = []
                player.textTracks_.tracks_.forEach((track,index) => {
                  tracksArray.push({
                    "kind" : "subtitles",
                    "label" : track.label,
                    "language" : track.language,
                    "id" : index,
                    "src": ""})
                })
                let tracks = player.textTracks_;
                // var indexUp =  indexUP;
                // var playbackLanguage = elementUP.language;
                // var playbackId = elementUP.id;      
                tracksArray.forEach(function(element, index) {
                  // if((playbackLanguage == "Off" && indexUp == 0 && index == 0) || (tracksArray[index].label.toLowerCase() == playbackLanguage.toLowerCase())){
                  if(tracksArray[index].language != ""){
                    var playbackLanguage = tracksArray[index].label;
                    var langCode = tracksArray[index].language;
                    var playbackId = 1;
                  let containerSubtile = document.createElement("Label");
                containerSubtile.setAttribute("class", "quality-label-container");
                let createDiv = document.createElement("Div");
                // createDiv.style.height = '15px';
                let ele=document.createElement("input");
                ele.setAttribute("type", "radio");
                ele.setAttribute("name","SubtitlePopup");
                ele.setAttribute("value",langCode);
                ele.setAttribute("title",playbackLanguage);
                

                let AudioLabel=document.createElement("Label");
                AudioLabel.setAttribute("for",playbackLanguage);
                if (playbackLanguage) {
                  sessionStorage.setItem("audioKey", playbackLanguage)
                }
                AudioLabel.innerHTML=playbackLanguage;
                AudioLabel.style.marginLeft="-54px"
                // AudioLabel.style.fontFamily="ProximaNova-Regular"
                AudioLabel.style.fontSize="14px";

                // if(me.uiEngine.getSubtitleLanguage() === playbackLanguage) {
                //   AudioLabel.classList.add('activeColor');
                //   ele.checked= playbackLanguage;
                // } else {
                //   AudioLabel.classList.add('activeColor');
                //   ele.checked=checked;
                // }

                let br = document.createElement("br");

                let text=document.createElement("span")
                text.innerHTML="";
               
                let addSpan = document.createElement("span");
                addSpan.setAttribute("class", "checkmarkAudio");
                containerSubtile.appendChild(ele)
                containerSubtile.appendChild(AudioLabel)
                containerSubtile.appendChild(br)
                containerSubtile.appendChild(addSpan)
                containerSubtile.appendChild(text)
                containerSubtile.appendChild(createDiv);
          
                me.el().appendChild(containerSubtile)
                
                ele.addEventListener('change', function (e) {
                    
                    let tracks = player.textTracks_;  
                    let selectedLang = ele.getAttribute("value");
                    // tracks[0].mode='showing';
                    me.sendEventSubtitle(selectedLang);
                    var hasclass = document.querySelectorAll('.activeColor')
                    if (hasclass && hasclass[0]) {
                        hasclass[0].classList.remove('activeColor')
                    }
                    
                    tracks.tracks_.forEach(function(element, index){
                      if(tracks.tracks_[index].mode == "showing") {
                        tracks.tracks_[index].mode="disabled";
                      }
                    });
                    tracks.tracks_.forEach(function(element, index) {
                      if(selectedLang.toLowerCase() == tracks.tracks_[index].language.toLowerCase() ||
                      me.uiEngine.getSubtitleLanguage() == tracks.tracks_[index].language.toLowerCase()) {
                        tracks.tracks_[index].mode="showing";
                      }
                    });
                    me.uiEngine.setSubtitleLanguage(selectedLang); 
                    AudioLabel.classList.add('activeColor');
                     
                });
              }
            });
               
              // });
        }
    },

    subtitlepopupMweb: function(){
      // this.videoPopupComp = new logituitVideoPopupComponent();
      // var PopupComponentop = new this.videoPopupComp.PopupComponent(player, this.options, this.wrapperLayout,this.baseOptions,this.uiEngine);
      let containerData = document.createElement("div");
      let containerTitle = document.createElement("Label");
      containerTitle.innerHTML= "Subtitles";
      containerTitle.setAttribute("class", "containerTitle");
      containerTitle.style.fontSize="20px";
      this.el().setAttribute("class","subtitlePopup");

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

      // this.baseOptions.subtitles.forEach(function (elementUP ,indexUP) {
        let tracks = me.player.textTracks();
        // var indexUp =  indexUP;
        // var playbackLanguage = elementUP.language;
        // var playbackId = elementUP.id;
        var langCodes = [];
            tracksArray = []
            me.player.textTracks_.tracks_.forEach((track,index) => {
              tracksArray.push({
                "kind" : "subtitles",
                "label" : track.label,
                "language" : track.language,
                "id" : index,
                "src": ""})
            })
        tracksArray = sortTextTracks(tracksArray)
            tracksArray.push({
              "kind" : "subtitles",
              "label" : "Off",
              "language" : "Off",
              "id" : "1",
              "src": ""
            })
        let selectedSubtitle = me.uiEngine.getSubtitleLanguage() || "Off";
        let isSubtitlePresent = false;
        tracksArray.forEach(function(element, index) {
          if(element.label == selectedSubtitle){
            isSubtitlePresent = true
          }
        })
        if(!isSubtitlePresent){
          selectedSubtitle = "Off"
        }
          tracksArray.forEach(function(element, index) {
          // if((playbackLanguage == "Off" && indexUp == 0 && index == 0) || tracks.tracks_[index].label.toLowerCase() == playbackLanguage.toLowerCase()){
        if((tracksArray[index].language != "" || tracksArray[index].label.toLowerCase() === 'off') && !langCodes.includes(tracksArray[index].language)){
          langCodes.push(tracksArray[index].language);
          var playbackLanguage = tracksArray[index].label;
          var langCode = tracksArray[index].language;
          let container = document.createElement("Label");
        container.setAttribute("class", "containerQuality");
        // container.setAttribute("id" , elementUP.id);
        // container.setAttribute("language", elementUP.language);
        // container.setAttribute("code", elementUP.code);
        container.setAttribute("value",langCode);
        container.setAttribute("title",playbackLanguage);
        if(selectedSubtitle == playbackLanguage){
          container.classList.add('activeClass')
        }
        let quality=document.createElement("Label");
        quality.setAttribute("for",playbackLanguage);
        quality.innerHTML=playbackLanguage ;
        // quality.style.marginLeft="-76px"
        // quality.style.fontFamily="ProximaNova-Regular";
        quality.style.fontSize="14px";
      
        let br = document.createElement("br");
      
        container.appendChild(quality)
        container.appendChild(br)
        qualityData.appendChild(container)
        containerData.appendChild(qualityData)
        
        container.addEventListener('touchstart', function (e) {
          try{
          let tracks = me.player.textTracks();
          let selectedLangCode = container.getAttribute("code");   
          let selectedLang = container.getAttribute("value"); 
          let selectedLangLabel = container.getAttribute("title");

          //if(me.uiEngine.getSubtitleLanguage() == "Off"){
            tracks.tracks_.forEach(function(element, index){
              if(tracks.tracks_[index].mode == "showing") {
                tracks.tracks_[index].mode="disabled";
              }
            });
          //}
            tracks.tracks_.forEach(function(element, index) {
              if(selectedLang.toLowerCase() == tracks.tracks_[index].language.toLowerCase()) {
                tracks.tracks_[index].mode="showing";
              }
            }); 
            me.uiEngine.setSubtitleLanguage(selectedLangLabel); 
          } catch(error) {
            Logger.error("error in switching subtitle",error);
          }
          var hasclass = document.querySelectorAll('.activeClass')
          if(hasclass && hasclass[0]){
            hasclass[0].classList.remove('activeClass')
          }
          me.uiEngine.setSubtitleLanguage(element.label)
          // sessionStorage.setItem('subtitleName',  element.language);
          let selectedVal = container.getAttribute("title");
          container.classList.add('activeClass');
          me.uiEngine.removeMobileSubtitlePopup();
          me.sendEventSubtitle(selectedVal);
         

          // setTimeout(() => {
          //   wrapper.removeChild(popupSubtitle);
          // }, 1000);
          // if(me.isLandscape && (window.screen.width <=920
          //   || (window.screen.width <=1366 && me.isIPad()))){
          //    PopupComponentop.resetDataLandscape();
          //   } else {
          //     PopupComponentop.resetDataPortrait();
          //   }

            setTimeout(() => {
                
          
              let textTracks = me.player.textTracks();
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
  
              textTracks.tracks_.forEach(function (element, index){
                    if (textTracks.tracks_[index].label == me.uiEngine.getSubtitleLanguage()) {
                  // textTracks.tracks_[index].mode = "showing";    
                  //console.log("showing",textTracks.tracks_) ;
                }    
              });
            }, 1000);     
        });
      }
    });
      // });
      if(me.isLandscape && (window.screen.width <=920
        || (window.screen.width <=1366 && me.isIPad()))){
        icon_span.addEventListener('touchstart', function (e) {
          me.uiEngine.removeMobileSubtitlePopup();
          me.uiEngine.addMobileSettingsPopup(me.options.option);
          // wrapperLayout.removeChild(subtitlepopup);
          // PopupComponentop.setTextQualityLandscape();
        });
        
      } else {
        icon_span.addEventListener('touchstart', function (e) {
          me.uiEngine.removeMobileSubtitlePopup();
          me.uiEngine.addMobileSettingsPopup(me.options.option);
          // wrapperLayout.removeChild(subtitlepopup);
          // PopupComponentop.setTextQuality();
        });
        
      }
      this.el().appendChild(containerData);
      window.addEventListener("click", function(event) {
        var targetElement = event.target;
        if(targetElement != me.el()){
          me.uiEngine.removeMobileSubtitlePopup();
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
    isMobile:function(){
          
      var check = false;
          (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
          return check;      
    },
    isSafari: function() {
      var userAgent = navigator.userAgent;
      
      // if (userAgent.indexOf("safari") != -1 || userAgent.indexOf("Safari") != -1) {
      var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      return safari;
    },
    //New function
    iOSDevice:function () {
        var iOSdev = false;
        var userAgent = navigator.userAgent;
        iOSdev = userAgent.match(/ipad/i) || userAgent.match(/iphone/i) || userAgent.match(/iPod/i);
        return iOSdev;
    },
    createEl: function () {
      this.elementRef = videojs.dom.createEl('div', {
          className: ''
      });
      return this.elementRef;
    },
    sendEventSubtitle: function(selectedVal) {
      var data = {
        subtitleSelected: selectedVal
      };
      var eventName = 'subtitleLanguageChanged';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      me.uiEngine.reportEventToUiEngine(evt);
    },
    releaseResource: function () {
      //releasing the resources
      if (this.elementRef) {
          delete this.elementRef;
          this.elementRef = null;
          delete this.subtitleComponent;
          this.subtitleComponent = null;
      }
    },

    updateTextContent: function(text) {
      if (typeof text !== 'string') {
        text = '';
      }
      videojs.emptyEl(this.el());
      videojs.appendContent(this.el(), text);
    },

    applyStylesPot : function(options){
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


    addSubtitleChildrenComponent: function(child){
        this.addChild(child)
      }
    });
    videojs.registerComponent('subtitleComponent', this.subtitleComponent);
  }
    var subtitleChildComponent=videojs.extend(ClickableComponent, {
        constructor: function(player, options) {
          ClickableComponent.apply(this, arguments);
          
          this.applyStyles(options.style)
          this.updateTextContent(options.text)
        },
        createEl: function() {
          return videojs.dom.createEl('div', {
            className:''
          });
        },

        handleClick: function(){
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
        addSubtitleChildrenComponent: function(childArr){
  
        },
        setClass:function(className){
            this.el().setAttribute("class",className);
          },
          setID:function(idName){
            this.el().setAttribute("id",idName);
          }
        });

        sortTextTracks = function(textTracks){
          try{
            for(let i=0;i<textTracks.length;i++){
              for(let j=0;j<i;j++){
                if(textTracks[i].label < textTracks[j].label){
                  let temp = textTracks[i]
                  textTracks[i] = textTracks[j]
                  textTracks[j] = temp
                }
              }
            }
          }
          catch(e){}
          return textTracks;
        }
        
        videojs.registerComponent('subtitleChildComponent', subtitleChildComponent);