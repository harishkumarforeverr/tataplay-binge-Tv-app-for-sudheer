/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitVideoTitleComponent() {
// var Button = videojs.getComponent('Button');
this.videoTitle = videojs.extend(videojs.getComponent('Button'), {
  constructor: function(player,option) {
    videojs.getComponent('Button').apply(this, arguments)
    this.applyStyles(option.styleCSS);
    this.updateTextContent(option.text)
    this.elementRef;
  },
   createEl: function() {
   this.elementRef = videojs.dom.createEl('button', {
     className:'logituit_videotitle'
   });
   return this.elementRef;
 },
 
  handleClick: function() {
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
    delete this.videoTitle;
    this.videoTitle = null;
  }
}
});
videojs.registerComponent('videotitle', this.videoTitle);
}