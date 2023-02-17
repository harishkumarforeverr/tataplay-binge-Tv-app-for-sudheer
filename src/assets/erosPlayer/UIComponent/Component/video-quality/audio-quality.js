function logituitAudioQualityComponent() {
    // var Button = videojs.getComponent('Button');
    let wrapperSettinglayout;
    let subtitlePopup;
    let allEpisode;
    let qualitypopup;
    var me;
    this.videoQuality = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option,wrapper, options, uiEngine) {
        videojs.getComponent('Button').apply(this, arguments);
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text);
        wrapperSettinglayout= wrapper;
        this.elementRef;
        this.options = options
        this.uiEngine = uiEngine;
        this.uiOptions = option;
        this.player = player;
        this.videoPopupComp = new logituitVideoPopupComponent();
        qualitypopup=new this.videoPopupComp.PopupComponent(player,{name:'popup',option: option},wrapper, options, uiEngine)
        me = this;

        this.tooltipDataFun();
      },
      tooltipDataFun: function(){
        var  ContainerQuality = document.createElement("div");
        ContainerQuality.setAttribute("class", "ContainerWebQuality");
        
        if(this.isTablet()){
          //ContainerQuality.style.right="calc(-87% + 8px)"  
          ContainerQuality.style.right="calc(-38% + 8px)"
        }
    
        let icon_span = document.createElement("span");
        icon_span.style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_iconsPortrait/asset_arrow/ic-arrow.png)";
        icon_span.style.width = "9.1%";
        icon_span.style.height = "8.2%";
        icon_span.style.display = "flex";
        icon_span.style.backgroundRepeat = "no-repeat";
        icon_span.style.marginLeft = '4%';
        icon_span.style.top = '6.6%';
        icon_span.style.left = '2.3%';
        icon_span.style.position = "absolute";
        icon_span.style.zIndex="1";
        ContainerQuality.appendChild(icon_span);
        // icon_span.addEventListener('click', function (e) {
        //   me.uiEngine.removeWebAudioQualityPopup();
        //   //me.uiEngine.addSettingPopup();
        // });
        icon_span.addEventListener('touchstart', function (e) {
          me.uiEngine.removeWebAudioQualityPopup();
          //me.uiEngine.addSettingPopup();
        });
        var  AudioQualityLabel = document.createElement("Label");
        AudioQualityLabel.setAttribute("class", "AudioWebQualityLabel");
        AudioQualityLabel.innerHTML = "Audio Quality";
        AudioQualityLabel.style.transform = "translateX(-7%)";
        AudioQualityLabel.style.paddingBottom = "10px";
        ContainerQuality.appendChild(AudioQualityLabel);
    
        me.options.audioQualitySettings.forEach(function (element,index) {
    
          let container = document.createElement("Label");
          container.setAttribute("class", "quality-label-container audio-level");
          container.style.marginLeft = "30px";
          container.style.paddingLeft ='unset';
          container.style.marginBottom = '1px','!important'; 
          let ele=document.createElement("input");
          ele.setAttribute("type", "radio");
          ele.setAttribute("name","VideoQualitys");
          // ele.checked=element.playback_ql_checked;
          ele.setAttribute("id","High");
          ele.setAttribute("value",element.playback_ql_id);
          ele.setAttribute("bitrate",element.playback_ql_bitrate);
          ele.setAttribute("qualityKey", element.playback_ql_title);
          if(element.playback_ql_bitrate ==  me.options.initialVideoBirate) {
            ele.setAttribute('checked','');
          }
          let quality=document.createElement("Span");
          quality.setAttribute("for",element.playback_ql_title);
          if (element.playback_ql_title) {
            sessionStorage.setItem("qualityKey", element.playback_ql_title)
          }
          container.style.display="block";
          quality.innerHTML=element.playback_ql_title;
          quality.style.float="left"
          quality.style.marginLeft="8px"
          quality.style.marginTop="6px"
          quality.style.marginBottom="0px"
          // quality.style.fontFamily="ProximaNova-Regular"
          quality.style.fontSize="14px"
    
          if(me.uiEngine.getAudioQuality() === element.playback_ql_title) {
            quality.classList.add('qualityActiveColor');
            ele.checked= element.playback_ql_title;
          } else {
            ele.checked=element.playback_ql_checked;
          }
          let br = document.createElement("br");
          let text=document.createElement("span")
          text.innerHTML=element.playback_ql_subtitle;
          text.style.fontSize="12px";
          text.style.opacity="0.5";
          text.style.height="16px";
          text.style.float = "left";
          text.style.margin="2% 3%";
          text.style.marginLeft = "8px";
          text.style.marginBottom = "0%";
          // text.style.fontFamily="ProximaNova-Regular";
    
          let addSpan = document.createElement("span");
          addSpan.setAttribute("class", "checkmark");
          addSpan.setAttribute("inputType","radio");
          container.appendChild(ele)
          container.appendChild(quality)
          container.appendChild(br)
          container.appendChild(addSpan)
          container.appendChild(text)
    
          ContainerQuality.appendChild(container);
          // ContainerQuality.appendChild(dividerLineLabel);
          // ContainerQuality.appendChild(reportIcon);
          // ContainerQuality.appendChild(reportElement);
    
          me.el().appendChild(ContainerQuality);
          ContainerQuality.addEventListener('mouseleave',function(e){
           me.uiEngine.removeWebAudioQualityPopup();
          })
          ele.addEventListener('change', function (e) {
            let selectedIndex=ele.getAttribute("bitrate");
            let selectedVal = ele.getAttribute('qualityKey');
            var hasclass = document.querySelectorAll('.qualityActiveColor')
            if (hasclass && hasclass[0]) {
                hasclass[0].classList.remove('qualityActiveColor')
            }
          //   me.sendEvent(selectedVal,selectedIndex);
             me.uiEngine.setAudioQuality(selectedVal); 
            
            quality.classList.add('qualityActiveColor');
           
            //me.changeQualityLevelStatus(player, selectedIndex);
            // me.uiEngine.removeMobileSettingsPopup();
          });
          container.addEventListener('touchstart', function (e) {
            let selectedIndex=ele.getAttribute("bitrate");
            let selectedVal = ele.getAttribute('qualityKey');
            var hasclass = document.querySelectorAll('.qualityActiveColor')
            if (hasclass && hasclass[0]) {
                hasclass[0].classList.remove('qualityActiveColor')
            }
          //   me.sendEvent(selectedVal,selectedIndex);
             me.uiEngine.setAudioQuality(selectedVal); 
            
            quality.classList.add('qualityActiveColor');
            ele.checked= element.playback_ql_title;
            //me.changeQualityLevelStatus(player, selectedIndex);
            // me.uiEngine.removeMobileSettingsPopup();
          });
         
        });
        if(me.isIPad() || me.isTablet()){
              ContainerQuality.style.width="200px";              
          }
      },
      isTablet: function(){
        const userAgent = navigator.userAgent.toLowerCase();
        const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
        return isTablet;
      },
    isIPad :function () {
      var isIpaddev = false;
      var userAgent = navigator.userAgent;
      isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)));
      return isIpaddev;
      },
       createEl: function() {
       this.elementRef = videojs.dom.createEl('button', {
         className:'logituit_audioQualitySettings'
       });
       return this.elementRef;
     },
     sendEvent: function() {
      var data = {
        currentTime: me.player.currentTime(),
      };
      var eventName = 'qualityPopupClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
     handleClick: function(){
        
      //   if(this.haschild(wrapperSettinglayout,"popup"))
      //   me.uiEngine.removeMobileSettingsPopup();
      // else 
      //   me.uiEngine.addMobileSettingsPopup(me.uiOptions);
        this.sendEvent();
    },
    
      updateTextContent: function(text) {
      if (typeof text !== 'string') {
        text = '';
      }
     this.el().innerHTML=text
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
    haschild:function(parent,name)
      {
        let ispresent= parent.children_.filter(function(e){
            if(e.name_)
            return e.name_==name 
            })
            if(ispresent.length==0)
            return false;
            else
            return true;
      },
      applyClass:function(className){
        this.el().setAttribute("class",className)
      },
      changeQualityLevelStatus: function(player, configBitrate) {
        if(me.player.qualityLevels().levels_.length) {
          var playerBitrates = me.player.qualityLevels().levels_;
      
          var closest=playerBitrates[0].bitrate;
          let selectedIndex=0;
          //playerBitrates.forEach((element,index) => {    });
      
          for( let i=1; i< playerBitrates.length; i++) {
            if (Math.abs(playerBitrates[i].bitrate/1000 - Number.parseInt(configBitrate)) < Math.abs(closest/1000 - Number.parseInt(configBitrate))) {
              closest = playerBitrates[i].bitrate;
              selectedIndex = i;
            }
          }
      
           
          var index = selectedIndex;
          if(sessionStorage.getItem('qualityKey')==='auto'){
            index = me.player.qualityLevels().length;
          }
        
          for (var i = 0; i < me.player.qualityLevels().length; i++) {
            if (i == index){
              me.player.qualityLevels()[i].enabled = true;
            }
            else{
              me.player.qualityLevels()[i].enabled = false;
            }
          }
        } else {
          var qLevels = me.player.dash.mediaplayer.getBitrateInfoListFor('video');
          var closest=qLevels[0].bitrate;
          let selectedIndex=0;
          
          for( let i=1; i< qLevels.length; i++) {
            if (Math.abs(qLevels[i].bitrate/1000 - Number.parseInt(configBitrate)) < Math.abs(closest/1000 - Number.parseInt(configBitrate))) {
              closest = qLevels[i].bitrate;
              selectedIndex = i;
            }
          }
          var index = selectedIndex;
          var selectedQuality=sessionStorage.getItem("qualityName")
          var maxbitrate;
          if(index == 1) {
            closest = qLevels[0].bitrate;
            index = 0;
          }
        
          if (selectedQuality!="Auto") {
            me.player.dash.mediaplayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': false } } } });
            me.playerdash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': false } } } });
          }
          else {  
            me.playerdash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': true } } } });
            me.playerdash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': true } } } });
          }
      
          me.playerdash.mediaPlayer.setQualityFor('video', index);
          me.playerdash.mediaPlayer.setFastSwitchEnabled(true);
          if(sessionStorage.getItem('qualityKey')==='auto'){
            index = me.playerdash.mediaPlayer.length;
          }
        }
          
        },
      releaseResource: function() {
        //releasing the resources
        if (this.elementRef) {
          delete this.elementRef;
          this.elementRef = null;
          delete this.videoQuality;
          this.videoQuality = null;
        }
        }
    });
    videojs.registerComponent('LogixVideoQuality', this.videoQuality);
    }
