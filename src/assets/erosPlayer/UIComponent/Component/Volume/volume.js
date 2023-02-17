/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitVolumeComponent() {
// var Button = videojs.getComponent('Button');
let wrapperSubtitleLayout;
let volumeslider;
var me;
this.volume = videojs.extend(videojs.getComponent('Button'), {
  constructor: function(player,option,wrapper,uiEngine) {
    videojs.getComponent('Button').apply(this, arguments);
    this.applyStyles(option.styleCSS);
   

    this.player=player;
    this.option=option;
    this.updateTextContent(option.text);
    this.volumeBarMouseOver();
    this.volumeBarMouseIn();
    this.volumeBarMouseOut();
   this.volumeBarTouchIn();
    this.uiEngine = uiEngine;
    wrapperSubtitleLayout= wrapper;
    volumeslider = new logituitVolumeSliderComponent(player,{name:'slider'});
    me = this;
    if(player.volume()>=0.7){
      me.showMoreVolumeIcon();
    }else if(!this.player_.muted()){
      me.showVolumeIcon();
    }
    player.on('volumechange', me.onVolumechange);
    

    this.tooltipDataFun();


  },

  onVolumechange:function(){
     var tent=me.player.volume();
    if(me.player.volume()>=0.7){
      me.showMoreVolumeIcon();
    }else if(!this.player_.muted()) {
      me.showVolumeIcon();
    }
  },
  tooltipDataFun: function(){
    let tooltipData = document.createElement("Label");
    tooltipData.setAttribute("class", "logituit_volumeTooltip"); 
    tooltipData.innerHTML = "Volume";
    me.el().appendChild(tooltipData);
  },
   createEl: function() {
   this.elementRef = videojs.dom.createEl('button', {
     className:'logituit_volumePanel'
   });
   return this.elementRef;
 },
 sendEvent: function(eventName) {
  var data = {
    mutedState: this.player_.muted(),
  };
  var evt = new CustomEvent(eventName, {
    detail: data,
  });
  this.uiEngine.reportEventToUiEngine(evt);
},

volumeBarMouseOver:function(){
    this.el().addEventListener("mouseover", function(event) {   
  });
},

volumeBarMouseIn:function(){
  
  this.el().addEventListener("mouseenter",function(event){
    var mouseover=document.getElementsByClassName('logituit_volumeSlider')[0];
     mouseover.style.visibility="visible";
  })
},

volumeBarMouseOut:function(){
  
  this.el().addEventListener("mouseout",function(event){
    var mouseover=document.getElementsByClassName('logituit_volumeSlider')[0];
     mouseover.style.visibility="hidden";
  })
},
volumeBarTouchIn:function(){
  if(isIPad() || isTablet()){
    let controlTimeOut;
  this.el().addEventListener('touchstart',function(event){
   event.defaultPrevented=false; 
    var touchin = document.getElementsByClassName('logituit_volumeSlider')[0];
    touchin.style.visibility="visible";
    
    if(me.uiEngine.volumeIconTimer){
      clearTimeout(me.uiEngine.volumeIconTimer);
      
    }
    me.uiEngine.volumeIconTimer=setTimeout(function(){
            var touchin = document.getElementsByClassName('logituit_volumeSlider')[0];
            touchin.style.visibility="hidden";
          },3000)
    
  })
  
}

},



  handleClick: function(){
   if (this.player_.muted()) {
     this.player_.muted(false);
     this.sendEvent('onUnmuteClick');
     me.uiEngine.setMuteState(false);
     //this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/ic-volume/ic-volume.svg')";
   } else {
     this.player_.muted(true);
     me.uiEngine.setMuteIcon(true);
     me.uiEngine.setMuteState(true);
     //this.player_.volume(0);
    // this.showMuteIcon()
     this.sendEvent('onMuteClick'); 
   }
   me.uiEngine.muteVolumeIcon();
 },

  updateTextContent: function(text) {
  if (typeof text !== 'string') {
    text = 'Title Unknown';
  }
 this.el().innerHTML=text
},

showMuteIcon:function(){
  this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/ic-volume/ic-volume-mute.svg')"; 
},
showVolumeIcon:function(){
  if(me.player.volume()>=0.7){
    me.showMoreVolumeIcon();
  } else {
    // this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/ic-volume/ic-volume.svg')"; 
    me.el().style.backgroundImage = "url(" + me.options_.volumeicon.volumeImage; + ")";
  }
},
showMoreVolumeIcon:function(){
  me.el().style.backgroundImage = "url(" + me.options_.volumeicon.moreVolume; + ")";
  // me.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/ic-volume/ic-more-volume.png')";
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
releaseResource: function() {
	//releasing the resources
	if (this.elementRef) {
	  delete this.elementRef;
	  this.elementRef = null;
	  delete this.volume;
	  this.volume = null;
	}
  }
});

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



videojs.registerComponent('LogixVolume', this.volume);
}