/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitVolumeSliderComponent() {
var me;
this.volumeSlider = videojs.extend(videojs.getComponent('VolumeBar'), {
  constructor: function(player,option,wrapper,uiEngine) {
     videojs.getComponent('VolumeBar').apply(this, arguments);
    this.applyStyles(option.styleCSS);
    this.applyClass(option.className);
    this.uiEngine = uiEngine;
    
    this.volumeBarTouchIn();
    me = this;
    this.volumeBarMouseIn();
    this.volumeBarMouseOut(); 
  },
applyClass:function(className){
  this.el().classList.add('logituit_volumeSlider');
},
  updateTextContent: function(text) {
  if (typeof text !== 'string') {
    text = 'Title Unknown';
  }
 this.el().innerHTML=text
},
volumeBarMouseIn:function(){
  
  this.el().addEventListener("mouseenter",function(event){
    var mouseover=document.getElementsByClassName('logituit_volumeSlider')[0];
     mouseover.style.visibility="visible";
  })
},

volumeBarMouseOut:function(){
  // setTimeout(() => {
    this.el().addEventListener("mouseout",function(event){
      var mouseover=document.getElementsByClassName('logituit_volumeSlider')[0];
    
       mouseover.style.visibility="hidden";
    })
  // }, 1000);
 
},


volumeBarTouchIn:function(){
  if(isIPad() || isTablet()){
    let controlTimeOut;
  this.el().addEventListener('touchstart',function(event){ 
   event.defaultPrevented=false;
   if(me.uiEngine.volumeIconTimer){
     clearTimeout(me.uiEngine.volumeIconTimer)
     me.uiEngine.volumeIconTimer=null;
   } 
   if(controlTimeOut){
  
   clearTimeout(controlTimeOut);
   me.uiEngine.clearTimeoutOfEventmanager();
   me.uiEngine.showControlsFromEventManager();
   controlTimeOut=null;
   }
    var touchin = document.getElementsByClassName('logituit_volumeSlider')[0];
    touchin.style.visibility="visible";
    
  })
  this.el().addEventListener('touchend',function(event){
  if(!controlTimeOut){
    controlTimeOut = setTimeout(function(){
   
      var touchin = document.getElementsByClassName('logituit_volumeSlider')[0];
    touchin.style.visibility="hidden";
    me.uiEngine.hideControlsWithTimeEventmanager();
    },3000)
  }
  })
}

},

applyStyles : function(options){
   var element=this.el();
   if(element){
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
// releaseResource: function() {
// 	//releasing the resources
// 	if (this.elementRef) {
// 	  delete this.elementRef;
// 	  this.elementRef = null;
// 	  delete this.volume;
// 	  this.volume = null;
// 	}
//   }
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
videojs.registerComponent('LogixVolumeSlider', this.volumeSlider);
}