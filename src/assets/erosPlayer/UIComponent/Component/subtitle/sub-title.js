/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
let subtitlepopup;
let subtitleAudiopopup;
let listenToEvents = true;
function logituitSubTitleComponent() {
  // var Button = videojs.getComponent('Button');

  let wrapperSubtitleLayout;
  let me;
  var element;
  var isTvApp = true;
  let containerSubAudioParent;

  this.subTitle = videojs.extend(videojs.getComponent('Button'), {
    constructor: function (player, option, wrapper, baseOptions, uiEngine) {
      videojs.getComponent('Button').apply(this, arguments);
      this.applyStyles(option.styleCSS);
      this.updateTextContent(option.text)
      this.appendChildSub();
      this.elementRef;
      this.uiEngine = uiEngine;
      this.baseOptions = baseOptions;
      wrapperSubtitleLayout = wrapper;
      this.logituitMobileAudioPopup = new logituitMobileAudioPopup();
      subtitleAudiopopup = new this.logituitMobileAudioPopup.subtitleAudioComponent(player, { name: 'popup', option: option }, wrapper, baseOptions, this.uiEngine)
      this.logituitMobileSubtitlePopup = new logituitMobileSubtitlePopup();
      subtitlepopup = new this.logituitMobileSubtitlePopup.subtitleComponent(player, { name: 'popup', option: option }, wrapper, baseOptions, this.uiEngine)

      subtitleAudioTv = new subtitleAudioTVComponent(player, { name: 'popup' })

      me = this;
      this.player = player;
      var popupVisible = false;

      // this.el().addEventListener("mouseover", function(event) { 
      //   if(me.haschild(wrapperSubtitleLayout,"popup"))
      //     {
      //     wrapperSubtitleLayout.removeChild(subtitlepopup);
      //     wrapperSubtitleLayout.removeChild(subtitleAudiopopup);
      //     wrapperSubtitleLayout.removeChild(subtitleAudioTv);
      //     }
      //       else{ 
      //     wrapperSubtitleLayout.addChild(subtitlepopup);
      //     wrapperSubtitleLayout.addChild(subtitleAudiopopup);
      //       }


      // });
      this.tooltipDataFun(this.player);      
      try{
        this.elementRef.addEventListener('touchstart', function (event) {                        
          var showPopup = document.getElementsByClassName('containerSubAudioParent')             
          if (showPopup[0].style.visibility == "hidden") {
            showPopup[0].style.visibility = "visible";
          }
          else {            
            showPopup[0].style.visibility = "hidden";                      
          }                 
        });
      }
      catch(e){
        Logger.error(e);        
      }
    },
    tooltipDataFun: function (player) {
      try {
      containerSubAudioParent = document.createElement("div");
      containerSubAudioParent.setAttribute("class", "containerSubAudioParent");

      let containerSubAudio = document.createElement("div");
      containerSubAudio.setAttribute("class", "containerSubAudio");

      let containerParentAudio = document.createElement("div");
      containerParentAudio.setAttribute("class", "containerAudio");

      let audioLabel = document.createElement("label");
      audioLabel.setAttribute("class", "audioLabel");
      audioLabel.innerHTML = "Audio";
      containerParentAudio.appendChild(audioLabel);

      let dividerLine = document.createElement("label");
      dividerLine.setAttribute("class", "dividerLineSubAudio");
      // containerParentAudio.appendChild(dividerLine);
      let selectedTextTrack = me.uiEngine.getSubtitleLanguage() || localStorage.getItem('defaultTextTrack');
      // console.error("selected subtitle: ", me.uiEngine.getSubtitleLanguage());
      // console.error("default subtitle: ", localStorage.getItem('defaultTextTrack'));
      // console.error(" selectedTextTrack: ", selectedTextTrack);
      
      if (isIPad() || isTablet()) {
        containerSubAudio.addEventListener('touchstart', function (e) {           
          e.stopPropagation();        
          e.preventDefault();   
        });
      }

      // this.baseOptions.audioLangOptions.forEach(function (element, index) {
        let audioTracks = me.player.audioTracks();
        // var playbackTitle = element.playback_al_title;
        // var playbackId = element.playback_al_id;
        var defaultChecked = me.uiEngine.getAudioLanguage() || localStorage.getItem('defaultAudioLanguage');
        let isAudioTrackPresent = false;
        let isHindiPresent = false;
        let mainAudioTrack = '';
        audioTracks.tracks_.forEach(function (element, index) {
          if(audioTracks.tracks_[index].label.toLowerCase() == 'Hindi'.toLowerCase()){
            isHindiPresent = true
          }
           if (audioTracks.tracks_[index].kind.toLowerCase() == 'main') {
            mainAudioTrack = audioTracks.tracks_[index].label;
           }
          if(defaultChecked && audioTracks.tracks_[index].label == defaultChecked || 
            audioTracks.tracks_[index].label == localStorage.getItem('defaultAudioLanguage')){
            isAudioTrackPresent = true
          }
        });
        if(!isAudioTrackPresent){
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

      audioTracks = sortTracks(audioTracks);
        audioTracks.tracks_.forEach(function (element, index) {
          if(audioTracks.length == 1 && element.label == ""){

          }
          if(!(element.label == "") || (audioTracks.length == 1 && element.label == "")){
            if(audioTracks.length == 1 && element.label == ""){
              var playbackTitle = "default";              
          }
            else{
              playbackTitle = element.label;
            }
            var playbackId = element.id;
            let containerAudio = document.createElement("Label");
            containerAudio.setAttribute("class", "quality-label-container");
            let createDiv = document.createElement("Div");
            // createDiv.style.height = '15px';
            let ele = document.createElement("input");
            ele.setAttribute("type", "radio");
            ele.setAttribute("name", "AudioPopups");
            ele.setAttribute("class","inputCheck");
            ele.setAttribute("value", playbackId);
            ele.setAttribute("title", playbackTitle);

            let AudioLabel = document.createElement("Span");
            AudioLabel.setAttribute("for", playbackTitle);
            AudioLabel.setAttribute("class", "subPopupLabel");
            AudioLabel.setAttribute("id", 'label-' + playbackTitle);
            if (playbackTitle) {
              sessionStorage.setItem("audioKey", playbackTitle)
            }
            AudioLabel.innerHTML = playbackTitle;

            if(navigator.userAgent.indexOf("Firefox") != -1 ){
              AudioLabel.style.marginTop = "5px"
            }
            if(isSafari() || isIPad()){
              containerAudio.style.whiteSpace="pre"
            }
            let addSpan = document.createElement("span");
            addSpan.setAttribute("class", "checkmarkAudio");
            addSpan.setAttribute("type", "radio");
            if(navigator.userAgent.indexOf("Firefox") != -1 ){
              addSpan.style.marginTop = "5px"
            }
            // addSpan.setAttribute("inputType","radio");
            let br = document.createElement("br");
            let text = document.createElement("span")
            text.innerHTML = "";
            containerAudio.appendChild(ele)
            containerAudio.appendChild(AudioLabel)
            containerAudio.appendChild(br)
            containerAudio.appendChild(addSpan)
            containerAudio.appendChild(text)
            containerAudio.appendChild(createDiv);

            containerParentAudio.appendChild(containerAudio)

            if (defaultChecked && audioTracks.tracks_[index].label == defaultChecked) {
              isAudioTrackPresent = true;
              audioTracks.tracks_[index].enabled = true;
              AudioLabel.classList.add('audioActiveColor');
              ele.setAttribute('checked', '');
              // console.error(audioTracks.tracks_[index].label, me.uiEngine.getAudioLanguage() , localStorage.getItem('defaultAudioLanguage'))
            }
            else if(audioTracks.length == 1 && element.label == ""){
              AudioLabel.classList.add('audioActiveColor');
              ele.setAttribute('checked', '');
            }
            // me.el().appendChild(containerAudio)
            ele.addEventListener('change', function (e) {
              let selectedIndex = ele.getAttribute("value")
              let selectedVal = ele.getAttribute('title');
              let selectedTitleId = 'label-' + selectedVal;
              let selectedLabel = document.getElementById(selectedTitleId);
              let audioTracks = sortTracks(me.player.audioTracks());

              // let textTracks = me.player.textTracks();
              // if(me.uiEngine.getSubtitleLanguage() == "Off"){
              //   textTracks.tracks_.forEach(function (element, index) {
              //     if (textTracks.tracks_[index].mode == "showing") {
              //       textTracks.tracks_[index].mode = "disabled";               
              //     }
              //     if(textTracks.tracks_[index].label == "Off"){
              //       textTracks.tracks_[index].mode = "showing";     
              //     }
              //   });
              // }

              audioTracks.tracks_.forEach(function (element, index) {
                if (audioTracks.tracks_[index].enabled == true) {
                  audioTracks.tracks_[index].enabled = false;
                  var hasclass = document.querySelectorAll('.audioActiveColor')
                  if (hasclass && hasclass[0]) {
                    hasclass[0].classList.remove('audioActiveColor')
                  }
                }

              });
              let currentPlayerTime = me.player.currentTime();
              // Logger.error(currentPlayerTime)
              me.uiEngine.setAudioLanguage(selectedVal);

              audioTracks.tracks_.forEach(function (element, index) {
                // let textTracks = me.player.textTracks();
              	// if(selectedVal.toLowerCase() == textTracks.tracks_[index].label.toLowerCase()){
              	// 	if(me.uiEngine.getSubtitleLanguage() == "Off"){
              	// 		textTracks.tracks_[index].enabled = false;
              	// 	}
              	// }
                // else if (selectedVal.toLowerCase() == tracks.tracks_[index].label.toLowerCase()) {
                if (selectedVal.toLowerCase() == audioTracks.tracks_[index].label.toLowerCase()) {
                  audioTracks.tracks_[index].enabled = true;
                  selectedLabel.classList.add('audioActiveColor');                 
                  audioTracks.tracks_[index].currentPlayerTime = me.player.currentTime();
                  me.player.currentTime(currentPlayerTime);
                }
              });

              setTimeout(() => {
                
          
                let textTracks = me.player.textTracks();
                // textTracks.tracks_.forEach(function (element, index){
                //   // console.log(textTracks.tracks_[index]);
                //   // console.log(textTracks.tracks_[index].mode);
                //   // console.log(textTracks.tracks_[index].mode == "showing" )
                //   // console.log(me.uiEngine.getSubtitleLanguage());
                //   // console.log(textTracks.tracks_[index].label != me.uiEngine.getSubtitleLanguage())
                //   // console.log(textTracks.tracks_[index].label == me.uiEngine.getSubtitleLanguage())
                //       if (textTracks.tracks_[index].mode == "showing" && textTracks.tracks_[index].label != me.uiEngine.getSubtitleLanguage()) {
                //         textTracks.tracks_[index].mode = "disabled";  
                //         //console.log("disabled",textTracks.tracks_);   
                //       }
                // });
                let selectedTextTrack = me.uiEngine.getSubtitleLanguage() || localStorage.getItem('defaultTextTrack');
                textTracks.tracks_.forEach(function (element, index){
                  // console.error('selected text teack: ',selectedTextTrack);
                  // console.error('comparing text teack: ',textTracks.tracks_[index].label);
                  if (textTracks.tracks_[index].label == selectedTextTrack) {
                    textTracks.tracks_[index].mode = "showing";    
                    //console.log("showing",textTracks.tracks_) ;
                  }
                  else{
                    textTracks.tracks_[index].mode = "disabled";    
                  }    
                });
              }, 1000);

            });
            containerAudio.addEventListener('touchstart', function (e) {             
              let selectedIndex = ele.getAttribute("value")
              let selectedVal = ele.getAttribute('title');
              let selectedTitleId = 'label-' + selectedVal;
              let selectedLabel = document.getElementById(selectedTitleId);
              let audioTracks = sortTracks(me.player.audioTracks());

              // let textTracks = me.player.textTracks();
              // if(me.uiEngine.getSubtitleLanguage() == "Off"){
              //   textTracks.tracks_.forEach(function (element, index) {
              //     if (textTracks.tracks_[index].mode == "showing") {
              //       textTracks.tracks_[index].mode = "disabled";      
              //     }
              //     if(textTracks.tracks_[index].label == "Off"){
              //       textTracks.tracks_[index].mode = "showing";     
              //     }
              //   });
              // }

              audioTracks.tracks_.forEach(function (element, index) {
                if (audioTracks.tracks_[index].enabled == true) {
                  audioTracks.tracks_[index].enabled = false;
                  var hasclass = document.querySelectorAll('.audioActiveColor')                  
                  var isChecked = document.querySelectorAll('.inputCheck:checked')
                  if (isChecked && isChecked[0]) {
                    isChecked[0].removeAttribute('checked')                   
                  }
                  if (hasclass && hasclass[0]) {
                    hasclass[0].classList.remove('audioActiveColor')                   
                  }                 
                }

              });
              let currentPlayerTime = me.player.currentTime();
              // Logger.error(currentPlayerTime)
              me.uiEngine.setAudioLanguage(selectedVal);

              audioTracks.tracks_.forEach(function (element, index) {
                // let textTracks = me.player.textTracks();
              	// if(selectedVal.toLowerCase() == textTracks.tracks_[index].label.toLowerCase()){
              	// 	if(me.uiEngine.getSubtitleLanguage() == "Off"){
              	// 		textTracks.tracks_[index].mode = "disabled";
              	// 	}
              	// }
                // else if (selectedVal.toLowerCase() == tracks.tracks_[index].label.toLowerCase()) {
                if (selectedVal.toLowerCase() == audioTracks.tracks_[index].label.toLowerCase()) {
                  audioTracks.tracks_[index].enabled = true;
                  ele.setAttribute('checked', '');
                  selectedLabel.classList.add('audioActiveColor');                   
                  audioTracks.tracks_[index].currentPlayerTime = me.player.currentTime();
                  me.player.currentTime(currentPlayerTime);
                  // e.stopPropagation();                  
                  //containerSubAudio.style.visibility = "hidden";                                                                                      
                  // containerSubAudioParent.style.visibility = "hidden";                                                                                      
                }
              });
              setTimeout(() => {
                
          
                let textTracks = me.player.textTracks();
                // textTracks.tracks_.forEach(function (element, index){
                //   // console.log(textTracks.tracks_[index]);
                //   // console.log(textTracks.tracks_[index].mode);
                //   // console.log(textTracks.tracks_[index].mode == "showing" )
                //   // console.log(me.uiEngine.getSubtitleLanguage());
                //   // console.log(textTracks.tracks_[index].label != me.uiEngine.getSubtitleLanguage())
                //   // console.log(textTracks.tracks_[index].label == me.uiEngine.getSubtitleLanguage())
                //       if (textTracks.tracks_[index].mode == "showing" && textTracks.tracks_[index].label != selectedTextTrack) {
                //         textTracks.tracks_[index].mode = "disabled";  
                //         //console.log("disabled",textTracks.tracks_);   
                //       }
                // });
                let selectedTextTrack = me.uiEngine.getSubtitleLanguage() || localStorage.getItem('defaultTextTrack');
                textTracks.tracks_.forEach(function (element, index){
                  if (textTracks.tracks_[index].label == selectedTextTrack) {
                    textTracks.tracks_[index].mode = "showing";    
                    //console.log("showing",textTracks.tracks_) ;
                  }
                  else{
                    textTracks.tracks_[index].mode = "disabled"; 
                  }    
                });
              }, 1000);           
            });
          }
          // if (tracks.tracks_[index].label.toLowerCase() == playbackTitle.toLowerCase()) {
      
          // }
        });
      // });

      let containerSub = document.createElement("div");
      containerSub.setAttribute("class", "containerSub");

      let SubtitleLabel = document.createElement("label");
      SubtitleLabel.setAttribute("class", "SubtitleLabel");
      SubtitleLabel.innerHTML = "Subtitles";
      containerSub.appendChild(SubtitleLabel);



      // text tracks

      let tracks = me.player.textTracks();

      let localTracks = [...tracks.tracks_];
      // var indexUp =  indexUP;
      // var playbackLanguage = elementUP.language;
      // var playbackId = elementUP.id;
      let offIndex = -1;
      for(let i=0; i<tracks.tracks_.length;i++){
        if(tracks.tracks_[i].label.toLowerCase().includes('off') || tracks.tracks_[i].language.toLowerCase().includes('off'))
          offIndex=i
      }
      if(offIndex<0){
        // player.addRemoteTextTrack({
        //   "kind" : "subtitles",
        //   "label" : "Off",
        //   "language" : "Off",
        //   "id" : "1",
        //   "src": ""
        // })
        // setTimeout(()=>{
          localTracks =[...tracks.tracks_];
          // localTracks.splice(0,0,localTracks[localTracks.length-1])
          // localTracks.pop()
        // },1000)
      }
      else{
        localTracks =[...tracks.tracks_];
        // localTracks.splice(0,0,localTracks[offIndex])
        // localTracks.splice(offIndex+1,1)
      }
      
      selectedTextTrack = me.uiEngine.getSubtitleLanguage()
      let isTrackPresent = false;
      localTracks.forEach(track=>{
        if(me.uiEngine.getSubtitleLanguage() == track.label || me.uiEngine.getSubtitleLanguage() == track.language){
          isTrackPresent = true
        }
      })

      if(selectedTextTrack == null || !isTrackPresent){
        selectedTextTrack = 'Off'
      }
      localStorage.setItem('defaultTextTrack', selectedTextTrack)
      var langArray = [];
      var labelArray = [];
      var tracksArray = [];
      var sideLoaded = me.baseOptions.subtitles;
      // tracks.tracks_.forEach(function (element) {
      //   sideLoaded.forEach(function(ele){
      //     if(ele.language == element.language){
      //       var ifLang = tracksArray.includes(ele.language)
      //       if(!ifLang){
      //         tracksArray.push(ele);
      //       }
      //     }
      //     else{
      //       var ifLang = tracksArray.includes(element.language)
      //       if(!ifLang){
      //         tracksArray.push(element);
      //       }            
      //     }
      //   })
      // });

      function populateSubtitles(event){
        if(typeof(event)!=='undefined' && event.track && event.track.label !== 'Off'){
          return;
        }
        console.count('count')
        let tracks = me.player.textTracks();
        let localTracks = [...tracks.tracks_];
        if(offIndex<0){
          localTracks =[...tracks.tracks_];
          // localTracks.splice(0,0,localTracks[localTracks.length-1])
          // localTracks.pop()
        // },1000)
      }
      else{
        localTracks =[...tracks.tracks_];
        // localTracks.splice(0,0,localTracks[offIndex])
        // localTracks.splice(offIndex+1,1)
      }

        
        localTracks.forEach(function (element) {
          if(!(element.label == "")){
          if (tracksArray.length) {
            var ifLang = tracksArray.filter( function(e) {
              let filterElement = e.language;
              let loopElement = element.language;
              if(e.language.includes('external')) {
                filterElement = e.language.substring(0, e.language.indexOf('_external'))
              }
              if(element.language.includes('external')) {
                loopElement = element.language.substring(0, element.language.indexOf('_external'))
              }
              return filterElement == loopElement;
            });
            if (ifLang.length == 0) {
              // let dupTrack = localTracks.filter( e => e.language == element.language);
              // if (dupTrack.length <= 1)
              //   tracksArray.push(element);
              // else {
              //   if(!element.id.includes('external') || element.language.toLowerCase() == 'off') {
              //     tracksArray.push(element);
              //   }
              tracksArray.push(element);
            } else {
              let matchedIndex = -1;
              tracksArray.forEach(function(m, index) {
                let filterElement = m.language;
                let loopElement = element.language;
                if(m.language.includes('external')) {
                  filterElement = m.language.substring(0, m.language.indexOf('_external'))
                }
                if(element.language.includes('external')) {
                  loopElement = element.language.substring(0, element.language.indexOf('_external'))
                }
                if (filterElement == loopElement) {
                  if(m.id.includes('external')) {
                    matchedIndex = index;
                  }
                }
              });
              if (matchedIndex >= 0) {
                tracksArray.splice(matchedIndex, 1);
                tracksArray.push(element);
                // tracksArray.push(element);
                // tracksArray[matchedIndex] = element
              }
            }
          } else {
            tracksArray.push(element);
          }
        }
        });

        tracksArray = sortTextTracks(tracksArray)
        tracksArray.push({
          "kind" : "subtitles",
          "label" : "Off",
          "language" : "Off",
          "id" : "1",
          "src": ""
        })

        tracksArray.forEach(function (element, index) {
        if(!(element.label == "")){
          if(element.label == selectedTextTrack){
            element.mode = 'showing'
          }
          else{
            element.mode = 'disabled'
          }                    
          var checkLang = langArray.includes(element.language);
            if(!checkLang){
              langArray.push(element.language);
            }  
            var checkLabel = labelArray.includes(element.label);
            if(!checkLabel){
              labelArray.push(element.label);
            }
          
          if (langArray != "" && labelArray != "" && !checkLabel && !checkLang && (element.kind == "subtitles" || element.kind == "captions"))  {                            
            var playbackLanguage = labelArray[index];
            var langCode = langArray[index];
            var defaultChecked = selectedTextTrack == element.label || selectedTextTrack == element.language;
            var playbackId = 1;
            let containerSubtile = document.createElement("Label");
            containerSubtile.setAttribute("class", "quality-label-container");
            let createDiv = document.createElement("Div");
            // createDiv.style.height = '15px';
            let ele = document.createElement("input");
            ele.setAttribute("type", "radio");
            ele.setAttribute("class","inputCheckSub")
            ele.setAttribute("name", "SubtitlePopup");
            ele.setAttribute("value", langCode);
            ele.setAttribute("title", playbackLanguage);
  
  
            let AudioLabel = document.createElement("Span");
            AudioLabel.setAttribute("for", playbackLanguage);
            AudioLabel.setAttribute("class", "popupSubLabel");
            if (playbackLanguage) {
              sessionStorage.setItem("audioKey", playbackLanguage)
            }
            if(navigator.userAgent.indexOf("Firefox") != -1 ){
              AudioLabel.style.marginTop= "5px"
              
            }
            AudioLabel.innerHTML = playbackLanguage;
            AudioLabel.setAttribute("id", 'subtitle-' + playbackLanguage);

            let br = document.createElement("br");

            let text = document.createElement("span")
            text.innerHTML = "";
  
            if (defaultChecked) {
              // if(tracks.tracks_[index].language =="off"){
              // tracksArray[index].mode = "showing";
              AudioLabel.classList.add('activeColor');
              ele.setAttribute('checked', '');
            }          
            let addSpan = document.createElement("span");
            addSpan.setAttribute("class", "checkmarkAudio");          
            if(navigator.userAgent.indexOf("Firefox") != -1 ){
              addSpan.style.marginTop= "5px"
              
            }       
            containerSubtile.appendChild(ele)
            containerSubtile.appendChild(AudioLabel)
            containerSubtile.appendChild(br)
            containerSubtile.appendChild(addSpan)
            containerSubtile.appendChild(text)
            containerSubtile.appendChild(createDiv);
            containerSub.appendChild(containerSubtile)


            containerSubtile.addEventListener('touchstart', function (e) {            
              var playbackLanguage = ele.getAttribute("title");
              let tracks = me.player.textTracks();            
              let selectedLang = ele.getAttribute("value");
              let selectedTitleId = 'subtitle-' + playbackLanguage;
              let selectedLabel = document.getElementById(selectedTitleId);
              // tracks[0].mode='showing';
              me.sendEventSubtitle(selectedLang);
  
              // if(me.uiEngine.getSubtitleLanguage() == "Off"){
              //   var hasclass = document.querySelectorAll('.activeColor')
              //     var isChecked = document.querySelectorAll('.inputCheckSub:checked')
              //     if (isChecked && isChecked[0]) {
              //       isChecked[0].removeAttribute('checked');                  
              //     }
              //     if (hasclass && hasclass[0]) {
              //       hasclass[0].classList.remove('activeColor')                  
              //     }
              // }
  
              // localTracks.forEach(function (element, index) {
              //   if (localTracks[index].mode == "showing") {
              //     localTracks[index].mode = "disabled";
              //     var hasclass = document.querySelectorAll('.activeColor')
              //     var isChecked = document.querySelectorAll('.inputCheckSub:checked')
              //       if (isChecked && isChecked[0]) {
              //         isChecked[0].removeAttribute('checked')                   
              //       }
              //     if (hasclass && hasclass[0]) {
              //       hasclass[0].classList.remove('activeColor')                  
              //     }
              //   }
              // });
              // localTracks.forEach(function (element, index) {
              //   if (selectedLang.toLowerCase() == localTracks[index].language.toLowerCase()) {
              //     localTracks[index].mode = "showing";
              //     ele.setAttribute('checked', '');
              //     // selectedTextTrack = localTracks[index].label;
              //     selectedLabel.classList.add('activeColor');
              //     me.uiEngine.setSubtitleLanguage(localTracks[index].label);
              //     // e.stopPropagation();
              //     //containerSubAudio.style.visibility = "hidden";                                            
              //     //containerSubAudioParent.style.visibility = "hidden";                                            
              //   }
              // });
              // console.error('touch')
              var oldSubLanguage = document.querySelector('.popupSubLabel.activeColor');
              var oldLanguageCheck = document.querySelector('.inputCheckSub:checked')
                if(oldSubLanguage){
                  oldSubLanguage.classList.remove('activeColor');
                  oldLanguageCheck.removeAttribute('checked');
                }
                var subLanguage = document.getElementById( 'subtitle-' + playbackLanguage);
                  subLanguage.classList.add('activeColor');
                  ele.setAttribute('checked', '');                   
                // if (localTracks[index].label.toLowerCase() == playbackLanguage.toLowerCase() ||
                // localTracks[index].language.toLowerCase() == playbackLanguage.toLowerCase()
                // ) {
                  me.uiEngine.setSubtitleLanguage(playbackLanguage)                 
                // }
                me.sendEventSubtitle(selectedLang);
              // });
              tracks.tracks_.forEach(function (element, index){
                if (tracks.tracks_[index].label.toLowerCase() == playbackLanguage.toLowerCase()) {
                  tracks.tracks_[index].mode = "showing";    
                }
                else{
                  tracks.tracks_[index].mode = "disabled";
                }    
              });

              
            });

            ele.addEventListener('change', function (e) {
              // console.error('click')
              var playbackLanguage = ele.getAttribute("title");
              let tracks = me.player.textTracks();            
              let selectedLang = ele.getAttribute("value");
              let selectedTitleId = 'subtitle-' + playbackLanguage;
              let selectedLabel = document.getElementById(selectedTitleId);
              // tracks[0].mode='showing';
  
              // localTracks.forEach(function (element, index) {
                
                var oldSubLanguage = document.querySelector('.popupSubLabel.activeColor');
                if(oldSubLanguage){
                  oldSubLanguage.classList.remove('activeColor')
                }
                var subLanguage = document.getElementById( 'subtitle-' + playbackLanguage);
                  subLanguage.classList.add('activeColor');                   
                // if (localTracks[index].label.toLowerCase() == playbackLanguage.toLowerCase() ||
                // localTracks[index].language.toLowerCase() == playbackLanguage.toLowerCase()
                // ) {
                  me.uiEngine.setSubtitleLanguage(playbackLanguage)                 
                // }
                me.sendEventSubtitle(selectedLang);
              // });
              tracks.tracks_.forEach(function (element, index){
                if (tracks.tracks_[index].label.toLowerCase() == playbackLanguage.toLowerCase()) {
                  tracks.tracks_[index].mode = "showing";    
                }
                else{
                  tracks.tracks_[index].mode = "disabled";
                }    
              });
            });
          }
        }
      
      
      });
    }
      // if(!!(offIndex>=0 || (!isIPad() && !isSafari()))){
        populateSubtitles();
      // }
      // else{
      //   if(listenToEvents){
      //     // player.textTracks_.off("addtrack",populateSubtitles)
      //     player.textTracks_.removeEventListener("addtrack",populateSubtitles);
      //     player.textTracks_.addEventListener("addtrack",populateSubtitles)
      //     // listenToEvents = false;          
      //   }
      // }
      containerSubAudio.appendChild(containerParentAudio);
      containerSubAudio.appendChild(dividerLine);
      containerSubAudio.appendChild(containerSub);
      containerSubAudioParent.appendChild(containerSubAudio);
      me.el().appendChild(containerSubAudioParent);

      // me.el().appendChild(containerSubAudio);   
    } catch (exe) {
      Logger.error("exception in sub-title: ",exe);
    }    
    },


    createEl: function () {
      this.elementRef = videojs.dom.createEl('button', {
        className: 'logituit_subtitleButton'
      });
      // me.element = this.elementRef;
      return this.elementRef;
    },
    sendEventSubtitle: function (selectedVal) {
      var data = {
        subtitleSelected: selectedVal
      };
      var eventName = 'subtitleLanguageChanged';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      me.uiEngine.reportEventToUiEngine(evt);
    },
    appendChildSub: function () {
      let ele = document.createElement('span');
      ele.innerHTML = "Audio&Subtitles"
      ele.style.fontSize = "26px"
      ele.style.marginLeft = "55px"
      // if(isTvApp || navigator.userAgent.indexOf("Tizen")>-1 || navigator.userAgent.indexOf("webos")>-1){
      // this.el().appendChild(ele)
      // }
    },
    sendEvent: function () {
      var data = {
      };
      var eventName = 'subtitlePopupClicked';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
    handleClick: function () {
      // var popupVisible = false;
      if (this.haschild(wrapperSubtitleLayout, "popup")) {
        wrapperSubtitleLayout.removeChild(subtitleAudioTv);
      }
      else if (navigator.userAgent.indexOf("Tizen") > -1 || navigator.userAgent.indexOf("web0S") > -1) {
        wrapperSubtitleLayout.addChild(subtitleAudioTv);
      }
      this.sendEvent();
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

    haschild: function (parent, name) {
      let ispresent = parent.children_.filter(function (e) {
        if (e.name_)
          return e.name_ == name
      })
      if (ispresent.length == 0)
        return false;
      else
        return true;
    },
    applyClass: function (className) {
      this.el().setAttribute("class", className)
    },
    releaseResource: function () {
      //releasing the resources
      if (this.elementRef) {
        delete this.elementRef;
        this.elementRef = null;
        delete this.subTitle;
        this.subTitle = null;
      }
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

  isIPad = function () {
    var isIpaddev = false;
    var userAgent = navigator.userAgent;
    isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)));
    return isIpaddev;
  }
  isTablet = function(){
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    return isTablet;
  }

  isSafari= function() {
    var userAgent = navigator.userAgent;
    
    // if (userAgent.indexOf("safari") != -1 || userAgent.indexOf("Safari") != -1) {
    var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return safari;
  }

  videojs.registerComponent('LogixSubtitle', this.subTitle);
}

