/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitEpisodeButtonComponent() {
// var Button = videojs.getComponent('Button');
var me;
this.episodeButton = videojs.extend(videojs.getComponent('Button'), {
  constructor: function(player,option, uiEngine) {
    videojs.getComponent('Button').apply(this, arguments);
    this.applyStyles(option.styleCSS);
    this.updateTextContent(option.text);
    this.appendChildSub();
    this.elementRef;
    this.player = player;
    this.uiEngine = uiEngine;
    me = this;
  },
   createEl: function() {
   this.elementRef = videojs.dom.createEl('button', {
     className:'logituit_Episode'
   });
   return this.elementRef;
 },

 deactivatedall: function(){
  document.getElementsByClassName('logituit_Episode')[0].style.display="none";
},

 appendChildSub:function(){
  let ele=document.createElement('div');
  // ele.innerHTML="AllEpisode"
  ele.innerHTML="Next Episode";
  // ele.style.marginLeft="55px";
  // ele.style.marginLeft="161px";
  ele.style.left="100%";
  ele.style.paddingLeft="10px";
  ele.style.color="#ffffff";
  // ele.style.fontFamily="ProximaNova-Regular";
  ele.style.fontSize="12px";
  ele.style.fontWeight='normal';
  ele.style.fontStretch='normal';
  ele.style.fontStyle = 'normal';
  ele.style.letterSpacing = 'normal';
  // ele.style.top = '16px';
  ele.style.bottom = '6px';
  ele.style.position = 'absolute';
  ele.style.width = '100px';
  ele.style.display ='flex';
  this.el().appendChild(ele)
},

  updateTextContent: function(text) {
  if (typeof text !== 'string') {
    text = 'Title Unknown';
  }
 this.el().innerHTML=text
},
sendEvent: function() {
  var data = {
    currentTime: me.player.currentTime(),
  };
  var eventName = 'onEpisodeClick';
  var evt = new CustomEvent(eventName, {
    detail: data,
  });
  this.uiEngine.reportEventToUiEngine(evt);
},
handleClick: function() {
  me.player.trigger({type: 'playnext', bubbles: false});
  this.sendEvent();
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
    delete this.episodeButton;
    this.episodeButton = null;
  }
  }
});
videojs.registerComponent('episodeButton', this.episodeButton);
}
