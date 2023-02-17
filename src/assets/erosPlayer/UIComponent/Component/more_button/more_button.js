/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitMoreButtonsComponent() {
// var Button = videojs.getComponent('Button');
let settingPopup;
let wrapperSettinglayout;
var me;
this.moreButtons = videojs.extend(videojs.getComponent('Button'), {
  constructor: function(player,option,wrapper,options,uiEngine) {
    videojs.getComponent('Button').apply(this, arguments);
    this.applyStyles(option.styleCSS);
    this.updateTextContent(option.text)
    wrapperSettinglayout= wrapper;
    this.elementRef;
    this.uiEngine = uiEngine;
    this.uiOptions = option;
    this.player = player;
    // this.videoPopupComp = new logituitVideoPopupComponent();
    // settingPopup=new this.videoPopupComp.PopupComponent(player,{name:'popup',option: option},wrapper, options, uiEngine)  
    me = this;
  },
   createEl: function() {
   this.elementRef = videojs.dom.createEl('button', {
     className:'logituit_morebutton'
   });
   return this.elementRef;
 },
 sendEvent: function() {
  var data = {
    currentTime: me.player.currentTime(),
  };
  var eventName = 'onMoreButtonClick';
  var evt = new CustomEvent(eventName, {
    detail: data,
  });
  this.uiEngine.reportEventToUiEngine(evt);
},
 handleClick: function() {
  if(this.haschild(wrapperSettinglayout,"popup")){
    me.uiEngine.removeMobileSettingsPopup();
    me.uiEngine.showPauseIcon();
  }
  else {
    me.uiEngine.addMobileSettingsPopup(me.uiOptions);
    me.uiEngine.showPlayIcon();
  }
    this.sendEvent();
  },

  updateTextContent: function(text) {
  if (typeof text !== 'string') {
    text = 'Title Unknown';
  }
 this.el().innerHTML=text
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
    delete this.moreButtons;
    this.moreButtons = null;
  }
  }
});
videojs.registerComponent('LogixMoreButton', this.moreButtons);
}

