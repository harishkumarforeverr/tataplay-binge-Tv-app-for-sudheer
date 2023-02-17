/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */

function logituitVideoQualityComponent() {
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

    // this.el().addEventListener("mouseover", function(event) {
    //   if(me.haschild(wrapperSettinglayout,"popup"))
    //     me.uiEngine.removeMobileSettingsPopup();
    //   else 
    //     me.uiEngine.addMobileSettingsPopup(me.uiOptions);
    // })
    // me.uiEngine.addMobileSettingsPopup(me.uiOptions);
    this.tooltipDataFun();
  },
  isMobile:function(){     
    var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;     
},
  tooltipDataFun: function(){
    var  ContainerQuality = document.createElement("div");
    ContainerQuality.setAttribute("class", "ContainerVideoWebQuality");
    if(this.isTablet()){
      //ContainerQuality.style.right="-62%"
      ContainerQuality.style.right="calc(-38% + 8px)"
    }

    // var  settingLabel = document.createElement("Label");
    // settingLabel.setAttribute("class", "settingLabel");
    // settingLabel.innerHTML = "Settings";
    // ContainerQuality.appendChild(settingLabel);
    let icon_span = document.createElement("span");
    icon_span.style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_iconsPortrait/asset_arrow/ic-arrow.png)";
    icon_span.style.width = "9.1%";
    icon_span.style.height = "8.2%";
    icon_span.style.display = "flex";
    icon_span.style.cursor = "pointer";
    icon_span.style.backgroundRepeat = "no-repeat";
    icon_span.style.marginLeft = '7%';
    icon_span.style.top = '5.8%';
    icon_span.style.position = "absolute";
    icon_span.style.zIndex="1";
    ContainerQuality.appendChild(icon_span);
    icon_span.addEventListener('click', function (e) {
      me.uiEngine.removeWebVideoQualityPopup();
    });
    // console.log();
    icon_span.addEventListener('touchstart', function (e) {
      me.uiEngine.removeWebVideoQualityPopup();
    });
    var  VideoQualityLabel = document.createElement("Label");
    VideoQualityLabel.setAttribute("class", "VideoWebQualityLabel");
    VideoQualityLabel.innerHTML = "Video Quality";
    ContainerQuality.appendChild(VideoQualityLabel);

    // var dividerLineLabel = document.createElement("Label");
    // dividerLineLabel.setAttribute("class", "dividerLine");
    // ContainerQuality.appendChild(dividerLineLabel);

    // var reportIcon = document.createElement("Label");
    // reportIcon.setAttribute("class", "reportIcon");
    // reportIcon.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_icons/ic-issue/ic-issue.png)"
    // ContainerQuality.appendChild(reportIcon);

    // var reportElement = document.createElement("Label");
    // reportElement.setAttribute("class", "reportElement");
    // reportElement.innerHTML = "Report an issue";
    // ContainerQuality.appendChild(reportElement);

    me.options.videoQualitySettings.forEach(function (element,index) {

      let container = document.createElement("Label");
      container.setAttribute("class", "quality-label-container quality-level");
      container.style.marginLeft = "27px";
      container.style.paddingLeft ='unset';
      container.style.marginBottom = '0px';
      let ele=document.createElement("input");
      ele.setAttribute("type", "radio");
      ele.setAttribute("name","VideoQualitys");
      // ele.checked=element.playback_ql_checked;
      ele.setAttribute("id","label-" + element.playback_ql_title);
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
      quality.style.marginLeft="10px"
      quality.style.marginTop="6px"
      quality.style.marginBottom="0px"
      // quality.style.fontFamily="ProximaNova-Regular"
      quality.style.fontSize="14px"

      if(me.uiEngine.getVideoQuality() === element.playback_ql_title) {
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
      text.style.height="15px";
      text.style.float = "left";
      // text.style.margin="2% 3%";
      // text.style.marginLeft = "8px";
      // text.style.marginBottom = "0%";
         text.style.margin="10px";
         text.style.marginTop = "6px"
         text.style.marginBottom = "0px";
        //  text.style.fontFamily="ProximaNova-Regular";

      let addSpan = document.createElement("span");
      addSpan.setAttribute("class", "checkmark");
      // addSpan.setAttribute("inputType","radio");
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
        me.uiEngine.removeWebVideoQualityPopup();
      })
      ele.addEventListener('change', function (e) {
        let selectedIndex=ele.getAttribute("bitrate");
        let selectedVal = ele.getAttribute('qualityKey');
        var hasclass = document.querySelectorAll('.qualityActiveColor')
        if (hasclass && hasclass[0]) {
            hasclass[0].classList.remove('qualityActiveColor')
        }
        me.sendEvent(selectedVal,selectedIndex);
        me.uiEngine.setVideoQuality(selectedVal); 
        
         quality.classList.add('qualityActiveColor');
       
        me.changeQualityLevelStatus(player, selectedIndex);
        // me.uiEngine.removeMobileSettingsPopup();
      });
      addSpan.addEventListener('touchstart', function (e) {
        let selectedIndex=ele.getAttribute("bitrate");
        let selectedVal = ele.getAttribute('qualityKey');
        var hasclass = document.querySelectorAll('.qualityActiveColor')
        if (hasclass && hasclass[0]) {
            hasclass[0].classList.remove('qualityActiveColor')
        }        
        me.sendEvent(selectedVal,selectedIndex);        
        me.uiEngine.setVideoQuality(selectedVal); 
        
        quality.classList.add('qualityActiveColor');
        ele.checked= element.playback_ql_title;
        me.changeQualityLevelStatus(player, selectedIndex);
        // me.uiEngine.removeMobileSettingsPopup();
      });
     
    });
    // if(me.isIPad() || me.isTablet()){
    //       ContainerQuality.style.width="195px";              
    //   }
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
    // className:'logituit_videoQualityButton'
     className:'logituit_videoQualitySettings'
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
      var qLevels = me.player.dash.mediaPlayer.getBitrateInfoListFor('video');
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
        me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': false } } } });
        me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': false } } } });
      }
      else {  
        me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'video': true } } } });
        me.player.dash.mediaPlayer.updateSettings({ 'streaming': { 'abr': { 'autoSwitchBitrate': { 'audio': true } } } });
      }
  
      me.player.dash.mediaPlayer.setQualityFor('video', index);
      //me.player.dash.mediaPlayer.setFastSwitchEnabled(true);
      if(sessionStorage.getItem('qualityKey')==='auto'){
        index = me.player.dash.mediaPlayer.length;
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
