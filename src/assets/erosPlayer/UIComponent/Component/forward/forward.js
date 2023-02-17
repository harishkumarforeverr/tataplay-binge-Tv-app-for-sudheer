/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
// var Button = videojs.getComponent('Button');
// var opt;
function logituitForwardButtonComponent() {

  var touchcount =0;
  var me;
  var count = 0;
  var x,animationTimeoutClick= null;
  this.forwardButton = videojs.extend(videojs.getComponent('Button'), {
    constructor: function(player,option, baseOptions, uiEngine) {
      videojs.getComponent('Button').apply(this, arguments);
      this.opt = option;
      this.elementRef;
      this.applyStyles(option.styleCSS);
       this.updateTextContent(option.text);
      //  this.applyClass(option.className);
       this.uiEngine = uiEngine;
       this.player = player
       me = this;
       this.tooltipDataFun();
       this.forwardFun();
    },
    showForwardAnimation: function(){
      var animateIcon = document.getElementsByClassName('logituit_forward_animation')[0];
            animateIcon.classList.add('visible');
            // animateIcon.classList.add('animationRipple');
            var playIcon = document.getElementsByClassName('animationForwardIcon')[0];
            playIcon.classList.add('visible');
            setTimeout (function(){
              animateIcon.classList.remove('visible');
              playIcon.classList.remove('visible');
              // animateIcon.classList.remove('animationRipple');
            },1000);
      // player.currentTime(player.currentTime() + 10);
    },
    isMobile:function(){        
      var check = false;
          (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
          return check;      
    },
    forwardFun: function () {
      let tooltipData = document.createElement("div");
      tooltipData.setAttribute("class", "logituit_forward_animation");
      me.player_.el().appendChild(tooltipData);
      let imgData =  document.createElement("img");
      imgData.setAttribute("class","animationForwardIcon");
     // imgData.setAttribute("src","UIComponent/Component/assets/LogiPlayer_icons/ic-forward-10-secs/ic-forward-10-secs.svg")
      var forward = me.options_.icons["forward"];
      imgData.setAttribute("src", forward);
      me.player_.el().appendChild(imgData);
  
      let isPortrait = !me.uiEngine.isLandscape() && me.uiEngine.isMobile();
      let isLandscape = me.uiEngine.isLandscape() && me.uiEngine.isMobile();
       if(isPortrait && window.screen.width <= 480) {
          this.forwardIcon();
          this.innerText();
          me.el().addEventListener('click', function (e) {
          // forwardIcon.classList.add('logituit_forwardIcon_animation');
          // forwardText.classList.add('logituit_forwardText_animation');
          setTimeout(function(){
            var forwardIcon = document.getElementsByClassName('logituit_forwardIcon')[0];
            var forwardText = document.getElementsByClassName('logituit_forwardText')[0];
            forwardIcon.classList.remove('logituit_forwardIcon_animation');
            forwardText.classList.remove('logituit_forwardText_animation');
          },0)
        });
        me.el().addEventListener('touchstart', function (e) {
      //    me.timeAnimation();
      clearTimeout(y);
          var forwardIcon = document.getElementsByClassName('logituit_forwardIcon')[0];
          var forwardText = document.getElementsByClassName('logituit_forwardText')[0];
          forwardIcon.classList.add('logituit_forwardIcon_animation');
          forwardText.classList.add('logituit_forwardText_animation');
          var y = setTimeout(function(){            
            forwardIcon.classList.remove('logituit_forwardIcon_animation');
            forwardText.classList.remove('logituit_forwardText_animation');
          },1000)
        });
      }
       if ( isLandscape && (window.screen.width <=920) && 
       me.isMobile()) {
       this.forwardIcon();
       this.innerText();
       
       me.el().addEventListener('click', function (e) {
        var forwardIcon = document.getElementsByClassName('logituit_forwardIcon')[0];
        var forwardText = document.getElementsByClassName('logituit_forwardText')[0];
        // forwardIcon.classList.add('logituit_forwardIcon_animation');
        // forwardText.classList.add('logituit_forwardText_animation');
        setTimeout(function(){
          forwardIcon.classList.remove('logituit_forwardIcon_animation');
          forwardText.classList.remove('logituit_forwardText_animation');
        },0)
      });
      me.el().addEventListener('touchstart', function (e) {
     //   me.timeAnimation();
     clearTimeout(y);
        var forwardIcon = document.getElementsByClassName('logituit_forwardIcon')[0];
        var forwardText = document.getElementsByClassName('logituit_forwardText')[0];
        forwardIcon.classList.add('logituit_forwardIcon_animation');
        forwardText.classList.add('logituit_forwardText_animation');
        var y = setTimeout(function(){
          forwardIcon.classList.remove('logituit_forwardIcon_animation');
          forwardText.classList.remove('logituit_forwardText_animation');
        },1000)
      });
    }
    },
    forwardIcon: function(){
      let iconDiv = document.createElement("div");
      iconDiv.setAttribute("class", "logituit_forwardIcon");
      iconDiv.style.backgroundImage = "url("+ me.opt.icons["forward"]+")"
      me.el().appendChild(iconDiv);
    },
    innerText: function(){
      let textData = document.createElement("p");
      textData.setAttribute("class", "logituit_forwardText");
      textData.innerHTML = "10";
      me.el().appendChild(textData);
    },
    tooltipDataFun: function(){
      let tooltipData = document.createElement("Label");
      tooltipData.setAttribute("class", "logituit_forwardTooltip");
      tooltipData.innerHTML = "+10 s";
      me.el().appendChild(tooltipData);
    },
     createEl: function() {
     this.elementRef = videojs.dom.createEl('button', {
       className:'logituit_forward'
     });
     return this.elementRef;
   },
   isIPad :function () {
    var isIpaddev = false;
    var userAgent = navigator.userAgent;
    isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2 &&
    /MacIntel/.test(navigator.platform)));
    return isIpaddev;
  },
   sendEvent: function(forwardTime) {
      var data = {
        currentTime: me.player.currentTime(),
        seekTime: me.player.currentTime()+forwardTime
      };
      var eventName = 'onForwardButtonClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      if(this.uiEngine.reportEventToUiEngine){
        this.uiEngine.reportEventToUiEngine(evt);
      }
     
   },
    handleClick: function() {
      let forwardTime = 10;
      if(this.opt.forwardTime) {
        forwardTime = this.opt.forwardTime;
      }
      if(this.isMobile()){
       me.timeAnimation();
      // var clearTimeforw;
      // var forwardIcon = document.getElementsByClassName('logituit_forwardIcon')[0];
      // var forwardText = document.getElementsByClassName('logituit_forwardText')[0];
      // var getInnerHtmlClass = document.getElementsByClassName('logituit_forwardText');
      // forwardIcon.classList.add('logituit_forwardIcon_animation');
      // forwardText.classList.add('logituit_forwardText_animation');
  
  //     setTimeout(function(){
  //       forwardIcon.classList.remove('logituit_rewindIcon_animation');
  //       forwardText.classList.remove('logituit_rewindText_animation');
  //       touchcount += 1;
       
  //       if(getInnerHtmlClass && getInnerHtmlClass[0]){
  //           getInnerHtmlClass[0].innerHTML = '+'+10*touchcount;
  //       }
  //       clearTimeout(clearTimeforw);
  //       clearTimeforw = setTimeout(function(){
  //        // getInnerHtmlClass[0].innerHTML = getInnerHtmlClass[0].innerHTML.replace(/\+/g, ' ');
  //       //   if(getInnerHtmlClass && getInnerHtmlClass[0]){
  //       //      getInnerHtmlClass[0].innerHTML = 10;
  //       //      touchcount=0;
  //       //  }
  //       //  },550) //3000 original
  
  //       try {
  //         if ((me.player.seeking.length * 10000) <(me.player.duration() - (me.player.currentTime()))) {
  //           //  mPlayer.currentTime(10000, me.player.seeking.length * 10000);
  //             console.log("entered in try");
  //          //   LOGIX_LOG.info(TAG, "AnalyticUtils: seek forward : scrubLength : " + counterSeekFwd * 10000);
  //          //   LOGIX_LOG.info(TAG, "AnalyticUtils: seek forward : resumeTime : " + mPlayer.getCurrentPosition());
  //          //   mPlayer.jumpForward();
  //           //  mPlayer.setJumpDurations(10000, 10000);
  //          // me.player.forward();
  //        //   me.player.currentTime(10000, 10000);
  //         } else {
  //           console.log("entered in try else");
  //        //     mPlayer.seekTo(mPlayer.getDuration() - 6000);
  //      //  me.player.currentTime((me.player.currentTime() + forwardTime)-6000)
  //         } 
  
  //       }
  //     // }
  //     catch (exception) {
  //       Logger.error("entered in catch",  exception)
  //     } finally {
  //       console.log("entered in finally");
  //  //     me.player.seekTime(10000, 10000)
  //     //   me.player.currentTime(10000, 10000);
  
  //      }
  
  //     },me.player.duration())
  //      clearTimeforw = setTimeout(function(){
  //      // getInnerHtmlClass[0].innerHTML = getInnerHtmlClass[0].innerHTML.replace(/\+/g, ' ');
  //        if(getInnerHtmlClass && getInnerHtmlClass[0]){
  //           getInnerHtmlClass[0].innerHTML = 10;
  //           touchcount=0;
  //       }
  //       },10000) //2000 1050 original
  
  //     })
    }
      me.player.currentTime(me.player.currentTime() + forwardTime); 
      this.sendEvent(forwardTime);
      //delete custom events once completed
    },
  
    timeAnimation: function(){       
      var forwardIcon = document.getElementsByClassName('logituit_forwardIcon')[0];
      var forwardText = document.getElementsByClassName('logituit_forwardText')[0];
      // var getInnerHtmlClass = document.getElementsByClassName('logituit_forwardText');
    
      // if(!animationTimeoutClick){
      //   animationTimeoutClick = setTimeout(function(){
      //     forwardIcon.classList.remove('logituit_forwardIcon_animation');
      //     forwardText.classList.remove('logituit_forwardText_animation');
      //     animationTimeoutClick = null;
      //   },3000)
      // }  
           
          count = count + 10;
          document.getElementsByClassName('logituit_forwardText')[0].innerHTML= "+" + count    
          forwardIcon.classList.add('logituit_forwardIcon_animation');
          forwardText.classList.add('logituit_forwardText_animation');                
          // forwardIcon.classList.remove('logituit_forwardIcon_animation');
          // forwardText.classList.remove('logituit_forwardText_animation');   
          clearTimeout(x);                                   
         x=setTimeout(()=>{  
          forwardIcon.classList.remove('logituit_forwardIcon_animation');
          forwardText.classList.remove('logituit_forwardText_animation');           
          count = 0;  
            document.getElementsByClassName('logituit_forwardText')[0].innerHTML=10;           
          },1000);      
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
  applyClass:function(className){
    this.el().setAttribute("class",className)
  },
  releaseResource: function() {
    //releasing the resources
    if (this.elementRef) {
      delete this.elementRef;
      this.elementRef = null;
      delete this.forwardButton;
      this.forwardButton = null;
    }
  }
  });
  videojs.registerComponent('ForwardBtn', this.forwardButton);
  };
  // var player = videojs('my-player',{
  //   fluid:true
  // });
  
  // var createObj={text: '10',cssAttribute:{'style':`top:33%;position:absolute;left:32%;height:25%;width:25%;display:block;transform: rotate(0deg);
  // transition: transform 500ms linear;
  // z-index: 1;
  // cursor: pointer;
  // position: absolute;
  // right: 24rem;
  // bottom: 45%;
  // width: 6em;
  // background-repeat: no-repeat;
  // background-position: center;
  // background-image: url(/assets/LogiPlayer_icons/shape_rwnd.png);`}};
  
  // player.addChild('myButton',createObj);