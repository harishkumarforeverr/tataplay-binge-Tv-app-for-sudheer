/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitCloseButtonComponent() {
// var Button = videojs.getComponent('CloseButton');
var me;
this.closeButtonObj = videojs.extend(videojs.getComponent('Button'), {
  constructor: function(player,option, uiEngine, eventManager) {
    videojs.getComponent('Button').apply(this, arguments);
    this.applyStyles(option.styleCSS);
    this.updateTextContent(option.text);
    this.elementRef;
    this.player = player;
    this.uiEngine = uiEngine;
    this.eventManager = eventManager;
    me = this;
    // this.logituitUiManager = new logituitUiEngine();
    this.tooltipDataFun();
  },
  tooltipDataFun: function(){
    let tooltipData = document.createElement("Label");
    tooltipData.setAttribute("class", "logituit_closeTooltip");
    tooltipData.innerHTML = "Close";
    me.el().appendChild(tooltipData);
  },
   createEl: function() {
   this.elementRef = videojs.dom.createEl('button', {
     className:'logituit_close'
   });
   return this.elementRef;
 },
 sendEvent: function() {
  var data = {
    closeTime: me.player.currentTime(),
  };
  var eventName = 'onCloseButtonClick';
  var evt = new CustomEvent(eventName, {
    detail: data,
  });
  if (this.uiEngine) {
    this.uiEngine.reportEventToUiEngine(evt);
  }
  else if (this.eventManager) {
    this.eventManager.reportEventToEventManager(evt);
  }
},
 handleClick: function(){
  this.sendEvent();
  this.player_.trigger({type: 'close', bubbles: false});
  // this.trigger({type: 'close', bubbles: false});
  // if (me.player) {
  //   me.player.destoryPlayer();
  //   me.player = null;
  // }trigger
 },

  updateTextContent: function(text) {
  if (typeof text !== 'string') {
    text = 'Title Unknown';
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
releaseResource: function() {
  //releasing the resources
  if (this.elementRef) {
    delete this.elementRef;
    this.elementRef = null;
    delete this.closeButton;
    this.closeButton = null;
  }
  }

});
videojs.registerComponent('closeButton', this.closeButtonObj);
}
