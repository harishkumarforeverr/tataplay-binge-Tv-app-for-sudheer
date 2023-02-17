/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */

var ClickableComponent = videojs.getComponent('ClickableComponent');
var Auto;
var Best;
var High;
var Medium;
var Low;
var that;
let wrapperLayout;
let protSubtitle;
let reportPopup;
let selectedId;
var opt;
var baseOptionspopup;
let PopupChild;
let portraitheight, qualityheight ,subtitleheight, audioheight, reportheight;
let popupQuality ,popupSubtitle ,popupAudio, popupReportIssue;

function logituitVideoPopupComponent() {
  var me;
this.PopupComponent = videojs.extend(ClickableComponent, {
  constructor: function(player, options,wrapper, baseOptions, uiEngine) {
    ClickableComponent.apply(this, arguments);  
    this.uiEngine = uiEngine;
    this.options= options;
    this.baseOptions = baseOptions;
    that=this;
    this.uiEngine = uiEngine;
    this.player = player;
    me = this;
    opt = options;
    me.isPortrait = !me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
    me.isLandscape = me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
    wrapperLayout= wrapper;
    baseOptionspopup = baseOptions
    this.updateTextContent(options.text)
    portraitheight = screen.height - 350;
    this.el().setAttribute("class","videoQualityPopup");
    // PopupChild=new PopupChildComponent(player,{name:'childPopup'},wrapper, options)
    if (me.isLandscape && window.screen.width <=920 && !me.isTablet() && !me.isIPad())
    //if(window.matchMedia("(orientation: landscape)").matches && (window.screen.width >=481 && window.screen.width <=920))
    {
      this.applyStyles(this.options.option.styleCSSQuality);
      Settings=new ChildComponent(player,
        {'style': {
          'font-size': '20px!important;',
          'color': '#fff!important;',
          'margin-left': '6.3%;',
          'font-weight': 'bold !important;',
          'margin-bottom': '8.8%;',
          'margin-top' : '7.5%;',
          'display':'flex;' },text:"Settings"});
        this.addChildrenComponent(Settings)
        this.options.option.mobile_setting_option.forEach(function (element) {
          if(((that.isMobile() && that.iOSDevice()) && that.isSafari()) && element.setting_title == 'Video Quality') {
          } else {            
            let container = document.createElement("Label");
            container.setAttribute("class", "containerPotrait");
            container.setAttribute("id" , element.setting_id);
            let icon_span = document.createElement("span");
            icon_span.style.backgroundImage= element.setting_icon;
            icon_span.style.width ="10%";
            icon_span.style.height="100%";
            icon_span.style.backgroundPosition="center";
            icon_span.style.backgroundRepeat = " no-repeat";
            // icon_span.style.marginLeft = '-163px';
            icon_span.style.position = "absolute";
            // icon_span.style.backgroundSize = "36px";
          
            
            let quality=document.createElement("Label");
            quality.setAttribute("for",element.setting_title);
            quality.innerHTML=element.setting_title;
            quality.style.margin="2% 0% auto 14%"
            // quality.style.fontFamily="ProximaNova-Regular"
            // quality.style.fontSize="14px"
            quality.style.fontSize="14px"
            // quality.style.fontWeight="bold";
            let br = document.createElement("br");

          
            var qualityname = me.uiEngine.getVideoQuality();//sessionStorage.getItem('qualityname');
            var subtitleName;
            let tempSubtitleTracks = me.player.textTracks();
            tempSubtitleTracks.tracks_.forEach(function(element){
              if (me.uiEngine.getSubtitleLanguage() == element.label) {
                subtitleName = me.uiEngine.getSubtitleLanguage();
              }
            });

            //...................................
            var audiolangname;
            let mainAudioTrack;
            let tempaudiolandTrack = me.player.audioTracks_;
            tempaudiolandTrack.tracks_.forEach(function(element, index){
              if (me.uiEngine.getAudioLanguage() == element.label) {
                audiolangname = me.uiEngine.getAudioLanguage();
              }
              if (tempaudiolandTrack.tracks_[index].kind.toLowerCase() == 'main') {
                mainAudioTrack = tempaudiolandTrack.tracks_[index].label;
              }
            });
            if (!audiolangname) {
              audiolangname = mainAudioTrack ? mainAudioTrack : tempaudiolandTrack.tracks_[0].label;
            }
            //................................
            
            //  = me.uiEngine.getSubtitleLanguage();
            var audioQuality = me.uiEngine.getAudioQuality();
            //var audioName = me.uiEngine.getAudioLanguage();
            let text=document.createElement("span");
            text.setAttribute("class", "optionSub");
            text.style.color = "#86888b";
            if(element.setting_selected_op){
              if(element.setting_title == "Video Quality"){
                if(qualityname){
                  text.innerHTML=qualityname
                } else {
                  text.innerHTML= "Auto"
                }
              } 
              else if(element.setting_title == "Audio Quality"){
                if(audioQuality){
                  text.innerHTML=audioQuality
                } else {
                  text.innerHTML= "Dolby 5.1"
                }
              }
              else if(element.setting_title == "Subtitles"){
                if(subtitleName){
                  text.innerHTML=subtitleName
                } else {
                  text.innerHTML= "Off"
                }
              } else if(element.setting_title == "Audio Language"){
                if(audiolangname){
                  text.innerHTML=audiolangname;
                }
                else {
                  text.innerHTML= "default"
                }
              }else {
                text.innerHTML=element.setting_selected_op
              }
            text.style.margin = 'auto';
            text.style.fontSize = '12px';
            text.style.marginLeft='3.3%';
            text.style.opacity="0.5";
            text.style.marginTop="3%";
            text.style.textTransform = 'capitalize'
            // text.style.fontFamily="ProximaNova-Regular"
            }
          
            container.appendChild(icon_span);
            container.appendChild(quality)
            container.appendChild(br)
            
            container.appendChild(text);
      
            that.el().appendChild(container)
          
            container.addEventListener('touchstart',function(e){
              selectedId = e.currentTarget.id;
                if(selectedId == "1"){
                if(me.haschild(wrapperLayout,"popup")) {
                if(me.isLandscape && window.screen.width <=920){
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileVideoQualityPopup(me.options.option);
                } else {
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileVideoQualityPopup(me.options.option);

                }
                } else
                //wrapperLayout.addChild(settingPopup);
                me.uiEngine.addMobileSettingsPopup();
              } 
              if(selectedId == "2"){
                if(me.haschild(wrapperLayout,"popup")) {
                if(window.matchMedia("(orientation: landscape)").matches && window.screen.width <=920){
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileAudioQualityPopup(me.options.option);
                } else {
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileAudioQualityPopup(me.options.option);
                }
                } else
                //wrapperLayout.addChild(settingPopup);
                me.uiEngine.addMobileSettingsPopup();
              }
              else if(selectedId == "3"){
                if(me.haschild(wrapperLayout,"popup")) {  
                if(me.isLandscape && window.screen.width <=920){
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileSubtitlePopup(me.options.option);
                  // subtitlepopup=new subtitleComponent(player,{name:'popup', option:this.options.option}, wrapperLayout, baseOptionspopup,this.uiEngine)
                  // wrapperLayout.addChild(subtitlepopup);
                } else {
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileSubtitlePopup(me.options.option);
                  // subtitlepopup=new subtitleComponent(player,{name:'popup',option:this.options.option}, wrapperLayout, baseOptionspopup,this.uiEngine)
                  // wrapperLayout.addChild(subtitlepopup);
                // wrapperLayout.addChild(popupSubtitle);
                }
                } else
                me.uiEngine.addMobileSettingsPopup();
              } else if(selectedId == "4"){
                if(me.haschild(wrapperLayout,"popup")) {
                if(me.isLandscape && window.screen.width <=920){
                    let tracks = sortTracks(me.player.audioTracks());
                  if(tracks.length >= 1){
                    me.uiEngine.removeMobileSettingsPopup();
                    me.uiEngine.addMobileAudioPopup(me.options.option);
                  }
                  else{
                    me.uiEngine.removeMobileSettingsPopup();
                  }
                  // subtitleAudiopopup=new subtitleAudioComponent(player,{name:'popup',option:this.options.option},wrapperLayout, baseOptionspopup,this.uiEngine )
                  // wrapperLayout.addChild(subtitleAudiopopup);
                } else {
                  let tracks = sortTracks(me.player.audioTracks());        
                  if(tracks.length >= 1){          
                    me.uiEngine.removeMobileSettingsPopup();
                    me.uiEngine.addMobileAudioPopup(me.options.option);
                  }

                  
                  // subtitleAudiopopup=new subtitleAudioComponent(player,{name:'popup',option:this.options.option},wrapperLayout, baseOptionspopup,this.uiEngine )
                  // wrapperLayout.addChild(subtitleAudiopopup);
                  }
                } else
                me.uiEngine.addMobileSettingsPopup();
              } else if(selectedId == "5"){
                if(me.haschild(wrapperLayout,"popup")) {
                if(me.isLandscape && window.screen.width <=920){
                    me.uiEngine.removeMobileSettingsPopup();
                    me.uiEngine.addMobileReportIssuePopup(me.options.option);
                } else {
                  me.uiEngine.removeMobileSettingsPopup();
                  reportheight = screen.height - 400;
                  me.uiEngine.addMobileReportIssuePopup(me.options.option);
                  }
                }
                else
                me.uiEngine.addMobileSettingsPopup();
              } 
            })

            container.addEventListener('click', function (e) { 
              selectedId = e.currentTarget.id;
            });
          }
         
        });
 
    }

    else if(me.isPortrait && !me.isTablet() && !me.isIPad())    
    {
      // opt.option.styleCSSQuality.style.top = portraitheight + "px;";      
      this.applyStyles(options.option.styleCSSQuality);

      Settings=new ChildComponent(player,
      {'style':  {
        'font-size': '20px!important;',
        'color': '#fff!important;',
        'margin-left':'4.4%;',
        'margin-bottom':'15px;',
        'margin-top':'24px;',
        'font-weight': 'bold!important;',
        'float': 'left;',
        'display':'flex;'
      },'text':"Settings"});
      this.addChildrenComponent(Settings)
      this.options.option.mobile_setting_option.forEach(function (element) {
        if(((that.isMobile() && that.iOSDevice()) || that.isSafari()) && element.setting_title == 'Video Quality') {
        } else {
          
          let container = document.createElement("Label");
          container.setAttribute("class", "containerPotrait");
          container.setAttribute("id" , element.setting_id);
          let icon_span = document.createElement("span");
          icon_span.style.backgroundImage= element.setting_icon;
          icon_span.style.width ="8%";
          icon_span.style.height="100%";
          icon_span.style.backgroundRepeat = " no-repeat";
          icon_span.style.backgroundPosition="center";
          // icon_span.style.marginLeft = '-163px';
          icon_span.style.position = "absolute";
          // icon_span.style.backgroundSize = "36px";


          let quality=document.createElement("Label");
          quality.setAttribute("for",element.setting_title);
          quality.innerHTML=element.setting_title;
          quality.style.margin="2% 0% auto 11%"
          // quality.style.fontFamily="ProximaNova-Regular"
          // quality.style.fontSize="14px"
          quality.style.fontSize="14px"
          // quality.style.fontWeight="bold";
          let br = document.createElement("br");

        

          let text=document.createElement("span")
          text.setAttribute("class", "optionSub");
          text.style.color = "#86888b";
          var qualityname = "";
          if("getVideoQuality" in me.uiEngine) {
            qualityname = me.uiEngine.getVideoQuality();
          }else {
            qualityname = me.uiEngine.defaultVideoQuality;
          }
          var audioName = me.uiEngine.getAudioLanguage();
          var audioQuality = me.uiEngine.getAudioQuality();
          var subtitleName;
          let tempSubtitleTracks = me.player.textTracks();
          tempSubtitleTracks.tracks_.forEach(function(element){
            if (me.uiEngine.getSubtitleLanguage() == element.label) {
              subtitleName = me.uiEngine.getSubtitleLanguage();
            }
          });

          //......................................
          var audiolangname;
          let mainAudioTrack;
          let tempaudiolandTrack = me.player.audioTracks_;
          tempaudiolandTrack.tracks_.forEach(function(element, index){
            if (me.uiEngine.getAudioLanguage() == element.label) {
              audiolangname = me.uiEngine.getAudioLanguage();
            }
            if (tempaudiolandTrack.tracks_[index].kind.toLowerCase() == 'main') {
              mainAudioTrack = tempaudiolandTrack.tracks_[index].label;
            }
          });
          if (!audiolangname) {
            audiolangname = mainAudioTrack ? mainAudioTrack : tempaudiolandTrack.tracks_[0].label;
          }

          //.......................................
          if(element.setting_selected_op){
            if(element.setting_title == "Video Quality"){
              if(qualityname){
                text.innerHTML=qualityname;
              } else {
                text.innerHTML="Auto";
              }
            }
            else if(element.setting_title == "Audio Quality"){
              if(audioQuality){
                text.innerHTML=audioQuality;
              } else {
                text.innerHTML= "Dolby 5.1"
              }
            }
            else if(element.setting_title == "Subtitle"){
              if(subtitleName){
                text.innerHTML=subtitleName
              } else {
                text.innerHTML= "Off"
              }
            } else if(element.setting_title == "Audio Language"){
              if(audiolangname){
                text.innerHTML=audiolangname;
              }
               else {
                text.innerHTML= "default"
              }
            } else {
              text.innerHTML=element.setting_selected_op;
            }
          text.style.margin = 'auto';
          text.style.fontSize = '12px';
          text.style.marginLeft='3.3%';
          text.style.opacity="0.5";
          text.style.marginTop="3%";
          // text.style.fontFamily="ProximaNova-Regular";
          }
        
          container.appendChild(icon_span);
          container.appendChild(quality)
          container.appendChild(br)
          
          container.appendChild(text);
    
          that.el().appendChild(container)
        
          container.addEventListener('touchstart',function(e){
            selectedId = e.currentTarget.id;
            if(selectedId == "1"){
              if(me.haschild(wrapperLayout,"popup")) {
              if(me.isLandscape && window.screen.width <=920){
                me.uiEngine.removeMobileSettingsPopup();
                me.uiEngine.addMobileVideoQualityPopup(me.options.option);
              } else {
                me.uiEngine.removeMobileSettingsPopup();
                me.uiEngine.addMobileVideoQualityPopup(me.options.option);

              }
              } else
              //wrapperLayout.addChild(settingPopup);
              me.uiEngine.addMobileSettingsPopup();
            } 
            if(selectedId == "2"){
              if(me.haschild(wrapperLayout,"popup")) {
              if(window.matchMedia("(orientation: landscape)").matches && window.screen.width <=920){
                me.uiEngine.removeMobileSettingsPopup();
                me.uiEngine.addMobileAudioQualityPopup(me.options.option);
              } else {
                me.uiEngine.removeMobileSettingsPopup();
                me.uiEngine.addMobileAudioQualityPopup(me.options.option);
              }
              } else
              //wrapperLayout.addChild(settingPopup);
              me.uiEngine.addMobileSettingsPopup();
            }
            else if(selectedId == "3"){
              if(me.haschild(wrapperLayout,"popup")) {  
              if(me.isLandscape && window.screen.width <=920){
                me.uiEngine.removeMobileSettingsPopup();
                me.uiEngine.addMobileSubtitlePopup(me.options.option);
                // subtitlepopup=new subtitleComponent(player,{name:'popup', option:this.options.option}, wrapperLayout, baseOptionspopup,this.uiEngine)
                // wrapperLayout.addChild(subtitlepopup);
              } else {
                me.uiEngine.removeMobileSettingsPopup();
                me.uiEngine.addMobileSubtitlePopup(me.options.option);
                // subtitlepopup=new subtitleComponent(player,{name:'popup',option:this.options.option}, wrapperLayout, baseOptionspopup,this.uiEngine)
                // wrapperLayout.addChild(subtitlepopup);
              // wrapperLayout.addChild(popupSubtitle);
              }
              } else
              me.uiEngine.addMobileSettingsPopup();
            } else if(selectedId == "4"){
              if(me.haschild(wrapperLayout,"popup")) {
              if(me.isLandscape && window.screen.width <=920){
                  let tracks = sortTracks(me.player.audioTracks());
                if(tracks.length >= 1){
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileAudioPopup(me.options.option);
                }
                else{
                  me.uiEngine.removeMobileSettingsPopup();
                }
                // subtitleAudiopopup=new subtitleAudioComponent(player,{name:'popup',option:this.options.option},wrapperLayout, baseOptionspopup,this.uiEngine )
                // wrapperLayout.addChild(subtitleAudiopopup);
              } else {
                let tracks = sortTracks(me.player.audioTracks());        
                if(tracks.length >= 1){          
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileAudioPopup(me.options.option);
                }

                
                // subtitleAudiopopup=new subtitleAudioComponent(player,{name:'popup',option:this.options.option},wrapperLayout, baseOptionspopup,this.uiEngine )
                // wrapperLayout.addChild(subtitleAudiopopup);
                }
              } else
              me.uiEngine.addMobileSettingsPopup();
            } else if(selectedId == "5"){
              if(me.haschild(wrapperLayout,"popup")) {
              if(me.isLandscape && window.screen.width <=920){
                  me.uiEngine.removeMobileSettingsPopup();
                  me.uiEngine.addMobileReportIssuePopup(me.options.option);
              } else {
                me.uiEngine.removeMobileSettingsPopup();
                reportheight = screen.height - 400;
                me.uiEngine.addMobileReportIssuePopup(me.options.option);
                }
              }
              else
              me.uiEngine.addMobileSettingsPopup();
            } 
          })

          container.addEventListener('click', function (e) { 
            selectedId = e.currentTarget.id;
          })
        }
       
      });
    }
    window.addEventListener("click", function(event) {
      var targetElement = event.target;
      if(targetElement != me.el()){
        me.uiEngine.removeMobileSettingsPopup();
      }
    });
  },
  sendEvent: function(selectedVal,selectedBitrate) {
    var data = {
      qualitySelected: selectedVal,
      selectedBitrate: selectedBitrate
    };
    var eventName = 'settingsPopupOpened';
    var evt = new CustomEvent(eventName, {
      detail: null,
    });
    that.uiEngine.reportEventToUiEngine(evt);
  },
  isIPad :function () {
    var isIpaddev = false;
    var userAgent = navigator.userAgent;
    isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2 &&
    /MacIntel/.test(navigator.platform)));
    return isIpaddev;
    },
    isTablet: function(){
      const userAgent = navigator.userAgent.toLowerCase();
      const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
      return isTablet;
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
  createEl: function() {
    this.elementRef = videojs.dom.createEl('div', {
      className:''
    });
    return this.elementRef;
  },
  setTextQuality: function (){
    // var moreButtonsComponent = new logituitMoreButtonsComponent();
    // var logituitMoreButtons = new moreButtonsComponent.moreButtons(player, this.options,wrapperLayout, this.baseOptions, this.uiEngine)
    wrapperLayout.addChild(settingPopup);
  },
  resetDataLandscape:  function(){
    // var moreButtonsComponent = new logituitVideoQualityComponent();
    // var logituitMoreButtons = new moreButtonsComponent.videoQuality(player, this.options,wrapperLayout, this.baseOptions, this.uiEngine);
  },
  resetDataPortrait:  function(){
    // var moreButtonsComponent = new logituitMoreButtonsComponent();
    // var logituitMoreButtons = new moreButtonsComponent.moreButtons(player, this.options,wrapperLayout, this.baseOptions, this.uiEngine)
  },
  setTextQualityLandscape: function(){
    // var moreButtonsComponent = new logituitVideoQualityComponent();
    // var logituitMoreButtons = new moreButtonsComponent.videoQuality(player, this.options,wrapperLayout, this.baseOptions, this.uiEngine)
    wrapperLayout.addChild(qualitypopup);
  },
  handleClick: function(e){
    this.sendEvent();
  },

  changeQualityLevelStatusDash: function(player, index) {
    var selectedQuality=sessionStorage.getItem("qualityName")
    var maxbitrate;
    let tracks = player.textTracks();
  
         if (index <= player.qualityLevels().length && selectedQuality!="Auto") {
        me.player.dash.mediaPlayer.setQualityFor('video', index);
        me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': false } } } });
        me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': false } } } });
    }
    else {
      
      me.player.dash.mediaPlayer.setQualityFor('video', player.qualityLevels().length-1);
      me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': true } } } });
      me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': true } } } });
    }
  },

  //hls
changeQualityLevelStatus: function(player, configBitrate) {
  if(player.qualityLevels().levels_.length) {
    var playerBitrates = player.qualityLevels().levels_;

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
      index = player.qualityLevels().length;
    }
  
    for (var i = 0; i < player.qualityLevels().length; i++) {
      if (i == index){
        player.qualityLevels()[i].enabled = true;
      }
      else{
        player.qualityLevels()[i].enabled = false;
      }
    }
  } else {
    var qLevels = player.dash.mediaPlayer.getBitrateInfoListFor('video');
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
      player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': false } } } });
      player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': false } } } });
    }
    else {  
      player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': true } } } });
      player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': true } } } });
    }

    player.dash.mediaPlayer.setQualityFor('video', index);
    //player.dash.mediaPlayer.setFastSwitchEnabled(true);
    if(sessionStorage.getItem('qualityKey')==='auto'){
      index = player.dash.mediaPlayer.length;
    }
  }
    
  },



 dividerLine:function(){
    let createDivLine = document.createElement("Div");
    createDivLine.style.height = '1px';
    createDivLine.style.backgroundColor ='#2d3f5c';
    createDivLine.style.width ='177px';
    createDivLine.style.position = 'absolute';
    createDivLine.style.bottom = '15%';
    createDivLine.style.marginLeft = '7.7%';
    createDivLine.style.borderRadius = '0.5px';
    this.el().appendChild(createDivLine);
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

  addChildrenComponent: function(child){
    this.addChild(child)
  },

  releaseResource: function() {
    //releasing the resources
    if (this.elementRef) {
      delete this.elementRef;
      this.elementRef = null;
      delete this.PopupComponent;
      this.PopupComponent = null;
    }
  }
 
});
videojs.registerComponent('PopupComponent', this.PopupComponent);
}

var ChildComponent=videojs.extend(ClickableComponent, {
    constructor: function(player, options) {
      ClickableComponent.apply(this, arguments);
      
      this.applyStyles(options.style)
      this.updateTextContent(options.text)
      this.setBitrates(options.bitrate)
      this.setImage(options.image)
    },

    createEl: function() {
      return videojs.dom.createEl('div', {
        className:''
      });
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

    setBitrates:function(Bitrates){
        this.el().setAttribute("Bitrates",Bitrates);
    },

    setImage: function(){
      var img = document.createElement('img');
      this.el().appendChild(img);
    },

    setClass:function(className){
      this.el().setAttribute("class",className);
    },

    setID:function(idName){
      this.el().setAttribute("id",idName);
    },

    setValue:function(valueName){
      this.el().setAttribute("value",valueName);
    },

    getID: function(){
    return this.el().getAttribute("id");  
    },

    getValue: function(){
      return this.el().getAttribute("value");
    },

  });

  sortTracks= function(audioTracks){
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

  videojs.registerComponent('ChildComponent', ChildComponent);