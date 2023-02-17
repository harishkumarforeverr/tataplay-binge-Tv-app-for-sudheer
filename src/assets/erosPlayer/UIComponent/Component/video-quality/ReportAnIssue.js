/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
var ClickableComponent = videojs.getComponent('ClickableComponent');
let Report;
var LogixReport = videojs.extend(ClickableComponent, {
  constructor: function(player,option) {
    ClickableComponent.apply(this, arguments);
    this.updateTextContent(option.text);
    this.applyStyles({'style':`border-radius: 30px;
    backdrop-filter: blur(10px);
    background-color:#2d3f5c;
    position: absolute;
    height:433px!important;
    width:100%!important;
    font-size:25px;
    opacity: 1;
    top:100%;
    left:0;`});

    Report=new VQChildComponent(player,{'style': {'font-size': '50px!important;',
                    'color': 'white!important;',
                    'margin-bottom': '8%!important;',
                    'opacity':'1;',
                    'margin-left':'-611px;',
                    'margin-top':'-182px;'},text:"Report an issue"});
                    this.addVQChildrenComponent(Report)
  },
   createEl: function() {
   return videojs.dom.createEl('button', {
     className:'logituit_reportissue'
   });
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

addVQChildrenComponent: function(child){
  this.addChild(child)
},

});
videojs.registerComponent('LogixReport', LogixReport);

var VQChildComponent=videojs.extend(ClickableComponent, {
  constructor: function(player, options) {
    ClickableComponent.apply(this, arguments);
    
    this.applyStyles(options)
    this.updateTextContent(options.text)
  },
  createEl: function() {
    return videojs.dom.createEl('div', {
      className:''
    });
  },

  handleClick: function(){
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
  setClass:function(className){
      this.el().setAttribute("class",className);
    },
    setID:function(idName){
      this.el().setAttribute("id",idName);
    }
  });
  videojs.registerComponent('VQChildComponent', VQChildComponent);
