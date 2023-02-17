/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitTimeDividerComponent() {
// var TimeDivider = videojs.getComponent('TimeDivider');
this.timeDivider = videojs.extend(videojs.getComponent('TimeDivider'), {
  constructor: function(player,option) {
    videojs.getComponent('TimeDivider').apply(this, arguments);
     this.applyStyles(option.styleCSS);
     this.applyClass(option.className);
     this.forTablet();
  },  
  applyClass:function(className){
    this.el().classList.add('logituit_timeDivider');
  },

  forTablet: function(){
    if(window.matchMedia("(orientation: portrait)").matches && (this.isIPad() || this.isTablet())){
      this.el().style.left="90.5%"
    }
    else if(window.matchMedia("(orientation: landscape)").matches && (this.isIPad() || this.isTablet())){
      // this.el().style.left="91%"
      this.el().style.left="calc(93.5% - 28px)";
    }
  },
  isIPad :function () {
    var isIpaddev = false;
    var userAgent = navigator.userAgent;
    isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2 &&
    /MacIntel/.test(navigator.platform)));
    return isIpaddev;
    },
    isTablet: function(){
      const userAgent = navigator.userAgent.toLowerCase();
      const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
      return isTablet;
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
      let type = typeof(obj[k]);
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
  if (this.timeDivider) {
    delete this.timeDivider;
    this.timeDivider = null;
  }
  }

});
videojs.registerComponent('logixTimeDivider', this.timeDivider);
}