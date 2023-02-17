/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
var ClickableComponent = videojs.getComponent('ClickableComponent');
var play;
var WrapperComponent=videojs.extend(ClickableComponent, {
    constructor: function(player, options) {
      ClickableComponent.apply(this, arguments);   
      },
      addChildToWrapper:function(child,cssOfchild)
      { 
        child.applyStyles(cssOfchild)
        this.addChild(child)
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
videojs.registerComponent('WrapperComponent', WrapperComponent);