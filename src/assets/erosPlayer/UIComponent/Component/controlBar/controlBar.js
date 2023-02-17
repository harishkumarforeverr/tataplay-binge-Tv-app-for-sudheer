/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
var controlBar = videojs.getComponent('ControlBar');

var CB = videojs.extend(controlBar, {
  constructor: function(player,option) {
    controlBar.apply(this, arguments);
    this.applyStyles(option.styleCSS);
    this.updateTextContent(option.text)  
  },
   createEl: function() {
   return videojs.dom.createEl('div', {
     className:''
   });
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
}
});
videojs.registerComponent('CB', CB);
