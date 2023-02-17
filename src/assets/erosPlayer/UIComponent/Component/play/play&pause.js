/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
var Button = videojs.getComponent('Button');

var LogituitPlay = videojs.extend(Button, {
  constructor: function(player,option) {
    Button.apply(this, arguments);
    this.applyStyles(option.styleCSS);
    this.updateTextContent(option.text)  
  },
  createEl: function() {
  return videojs.dom.createEl('button', {
    className:'play'
  });
},

 handleClick: function(){
  if (this.player_.paused()) {
    this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/cta-pause/cta-pause.png')"; 
//    this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_iconsMobile/assets_03/drawable-mdpi/cta_pause.png')"; 
    this.player_.play();
  } else {
    this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_icons/ic-play/ic-play.png')"; 
   // this.el().style.backgroundImage = "url('UIComponent/Component/assets/LogiPlayer_iconsMobile/assets_02/drawable-mdpi/cta_play.png')"; 
    this.player_.pause();
    
  }
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
   for(key in options){
     let cssArray=options[key]
     let value=""
     cssArray.forEach(function(element) {
       for(ele in element)
       {
        value=value+ele+":"+element[ele];
       }
     });
      if(element){
     element.setAttribute(key,value); 
    }
   }
}
});
videojs.registerComponent('LogituitPlay', LogituitPlay);
