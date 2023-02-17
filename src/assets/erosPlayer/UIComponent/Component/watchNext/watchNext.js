function logituitWatchNext() {
  var me;
  this.watchNext = videojs.extend(videojs.getComponent('ClickableComponent'), {
    constructor: function (player, options, wrapper, baseOptions, uiEngine, endTime,startTime) {
      videojs.getComponent('ClickableComponent').apply(this, arguments);
      this.applyStyles(options.styleCSS);
      this.uiEngine = uiEngine;
      this.player = player;
      this.options = options;
      this.endTime = endTime;
      this.startTime = startTime;
      this.baseOptions = baseOptions;
      me = this;
      this.webWatchNextPopup();    
      //this.formatTime();
    },

    isSafari: function () {
      var userAgent = navigator.userAgent;

      // if (userAgent.indexOf("safari") != -1 || userAgent.indexOf("Safari") != -1) {
      var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      return safari;
    },
    isIPad: function () {
      var isIpaddev = false;
      var userAgent = navigator.userAgent;
      isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform)));
      return isIpaddev;
    },
    isTablet: function () {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
      return isTablet;
    },
    isMobile: function () {
      var check = false;
      (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    },
    setOnlineFlag(state){
      //console.log("online flag: ",state);
      me.isOnline = state;             
  },
  setBackgroundFlag(state){
      //console.log("set bacground flg: ",state);
      me.isInBackground = state;      
  },
    webWatchNextPopup: function () {
      var timer;
      let container = document.createElement("div");
      container.setAttribute("class", "containerWatchNext");

      let desktopPopup = document.createElement("div");
      desktopPopup.setAttribute("class", "desktopPopup");

      let mobilePopup = document.createElement("div");
      mobilePopup.setAttribute("class", "mobilePopup");


      let landscapePopup = document.createElement("div");
      landscapePopup.setAttribute("class", "landscapePopup");
      let innerContainer = document.createElement("div");
      innerContainer.setAttribute("class", "innerContainerWatchNext");
      let watchNextImage = document.createElement('div');
      watchNextImage.setAttribute("class", "watchNextImage");

      let imgUrl = this.baseOptions.next_content.images[0].cdn_url;
      let variantIndex = this.baseOptions.next_content.images[0].variants.indexOf("xs");
      let variant;
      if (variantIndex >= 0) {
        variant = '_' + this.baseOptions.next_content.images[0].variants[variantIndex];
      }
      else {
        variant = "";
      }
      let variantUrl = imgUrl.replace('.jpg', variant + '.jpg').replace('.png', variant + '.png').replace('.svg', variant + '.svg').replace('.jpeg', variant + '.jpeg')


      if (window.matchMedia("(orientation: portrait)").matches ||
        window.matchMedia("(orientation: landscape)").matches && me.isIPad()) {
        watchNextImage.style.backgroundImage =
          "url(" + variantUrl + ")";
      } else {
        watchNextImage.style.backgroundImage =
          "url(" + variantUrl + ")";
      }


      let iconClose = document.createElement("span");
      if (window.matchMedia("(orientation: portrait)").matches ||
        window.matchMedia("(orientation: landscape)").matches && me.isIPad()) {
        //  iconClose.style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_icons/cta-close/ic-close.png)";
        iconClose.style.backgroundImage = me.options.icon["close"];
      } else {
        //   iconClose.style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_icons/cta-close/ic-close.svg)";
        iconClose.style.backgroundImage = me.options.icon["close"];
      }
      iconClose.setAttribute("class", "iconNextCloseWatchNext");
      iconClose.addEventListener('click', function (event) {
        me.player.trigger({ type: 'recomendation', bubbles: false });
        // me.uiEngine.showRecomendationScreen();
        me.player.trigger({ type: 'closeWatchNext', bubbles: false });
        me.uiEngine.removeWatchNow();
        clearInterval(timer);
      });
      let watchNextLabel = document.createElement("div");
      watchNextLabel.setAttribute("class", "watchNextLabel");
      let upNextLabel = document.createElement("span");
      upNextLabel.setAttribute("class", "upNextLabelWatchNext");
      upNextLabel.innerHTML = "UP NEXT";


      let upNextLabelMobile = document.createElement("span");
      upNextLabelMobile.setAttribute("class", "upNextLabelWatchNextMobile");
      upNextLabelMobile.innerHTML = "UP NEXT";

      let contentLabel = document.createElement("span");
      contentLabel.innerHTML = this.baseOptions.next_content.content_title;
      contentLabel.setAttribute("class", "contentLabelWatchNext");


      // let assetLabel = document.createElement("span");
      // assetLabel.innerHTML = this.baseOptions.next_content[0].asset_title;
      // assetLabel.setAttribute("class", "assetLabelWatchNext");


      // let iconPlay = document.createElement("span");
      // iconPlay.setAttribute("class", "iconPlayWatchNext");
      // iconPlay.style.backgroundImage = "url(UIComponent/Component/assets/LogiPlayer_icons/cta-play/cta-play.png)";
      // iconPlay.addEventListener('click', function (event) {
      //   me.me.player.trigger({ type: 'playnext', bubbles: false })
      // });
      // iconPlay.addEventListener('touchstart', function (event) {
      //   me.me.player.trigger({ type: 'playnext', bubbles: false })
      // });

      // let countdown = document.createElement("div");
      // countdown.setAttribute("class", "countdown");
      // container.appendChild(countdown);
      // let svg = document.createElement("svg");
      // countdown.appendChild(svg);
      // let circle = document.createElement("circle");
      // circle.setAttribute("r", "18");
      // circle.setAttribute("cx", "20");
      // circle.setAttribute("cy", "20");
      // svg.appendChild(circle);

      let center = document.createElement("div");
      center.setAttribute("class", "logix-center-watchNext");
      // let leftHalf = document.createElement("div");
      // leftHalf.setAttribute("class", "leftHalf");
      // center.appendChild(leftHalf);
      // me.timerWatchNext = me.endTime - me.me.player.currentTime();
      // var duration = me.timerWatchNext;
      // leftHalf.style.animationDuration=duration + 's';
      // let rightHalf = document.createElement("div");
      // rightHalf.setAttribute("class", "rightHalf");
      // center.appendChild(rightHalf);
      let progressbar =  document.createElement("div");
      progressbar.innerHTML = `<div class="base-timer-watch-next">
      <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" stop-color="#0aa1ea" />      
        <stop offset="100%" stop-color="#40c6b6" />
      </linearGradient>
    </defs>
        <g class="base-timer__circle">
          <circle class="base-timer__path-elapsed-watch-next" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            stroke-dasharray="`+(me.calculateTimeFraction(me.endTime - me.player.currentTime()) * 283).toFixed(1)+` 283"
            class="base-timer__path-remaining orange"
            stroke="url(#gradient)" 
            stroke-width="6" 
            fill="none"
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
        </g>
      </svg><div id='episode-starts-card-timer-text'"></div>
      </span>
    </div>`
    center.appendChild(progressbar);
    
      let spinnerContainer = document.createElement("div");
      spinnerContainer.setAttribute("class", "spinnerContainer");
      

      let spinnerBg = document.createElement("div");
      spinnerBg.setAttribute("class", "spinnerBgWatchNext");

      let iconPlayBgWatchNext = document.createElement("div");
      iconPlayBgWatchNext.setAttribute("class", "iconPlayBgWatchNext");


      let iconPlayWatchNext = document.createElement("span");
      iconPlayWatchNext.setAttribute("class", "iconPlayWatchNext");
      //  iconPlayWatchNext.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_icons/cta-play/cta-play2.png)";
      iconPlayWatchNext.style.backgroundImage = me.options.icon["play"];
      iconPlayWatchNext.addEventListener('click', function (event) {
        clearInterval(timer);
        me.player.trigger({ type: 'playnext', bubbles: false })
      });
      iconPlayWatchNext.addEventListener('touchstart', function (event) {
        clearInterval(timer);
        me.player.trigger({ type: 'playnext', bubbles: false })
      });

      let playingTimeCombine = document.createElement("div");
      playingTimeCombine.setAttribute("class", "playingTimeCombine")
      if(me.isSafari() || me.isTablet()){
        playingTimeCombine.style.marginLeft="9px";
        contentLabel.style.marginTop="10px";
        iconClose.style.width="14px";
        iconClose.style.height="14px";
        if(me.isSafari() && me.isMobile())
          watchNextLabel.style.marginLeft = "15px";
      }
      
      let playingTime = document.createElement("span");
      // playingTime.innerHTML = "Playing in 4 seconds";
      playingTime.setAttribute("class", "playingTimeWatchNext");

      let forSpace = document.createElement("span");
      forSpace.setAttribute("class", "forSpaceWatchNext");
      if (!me.isSafari() && navigator.userAgent.indexOf('Mac OS X') != -1) {
        forSpace.style.left = "43%"
      }
      
      me.timerWatchNext = me.endTime - me.player.currentTime();
      // console.log('before timer watch next: ',me.timerWatchNext);
      // console.log('before current time: ',me.player.currentTime());
      // console.log('before current diff: ',me.player.currentTime() - me.endTime);     
      forSpace.innerHTML = Number.parseInt(me.timerWatchNext) + " seconds"
      playingTime.innerHTML = "Playing in ";      
      // me.timerWatchNext--;
      if (me.timerWatchNext >= 0 && me.timerWatchNext <= (me.endTime - me.startTime)) {
         timer = setInterval(function () {
          if (me.timerWatchNext > (me.endTime - me.startTime)) {
            clearInterval(timer);
            me.uiEngine.removeWatchNow();
          }
          // console.log("me.isMobile: ", me.isMobile());
          // console.log("me.isTab: ", me.isTablet());
          // console.log("me.isIpad: ", me.isIPad());
          if (me.timerWatchNext <= 0 || (document.hidden && (me.isMobile() || me.isTablet() || me.isIPad()))) {
            clearInterval(timer);
          }
          try{
            // console.log('timer watch next: ',me.timerWatchNext);
            // console.log('current time: ',me.player.currentTime());
            // console.log('current diff: ',me.player.currentTime() - me.endTime);     
            me.setCircleDasharray(me.timerWatchNext-1);
            // console.error("endtime",me.endTime);
            // console.error("starttime",me.startTime); 
          }
          catch{}

          forSpace.innerHTML = Number.parseInt(me.timerWatchNext) + " seconds"
          playingTime.innerHTML = "Playing in ";
          if (me.player.paused() && me.timerWatchNext > 0 && me.isOnline && ((!document.hidden && (me.isMobile() || me.isTablet() || me.isIPad())) || (!me.isMobile() && !me.isTablet() && !me.isIPad()))){
            me.timerWatchNext = me.timerWatchNext - 1;
          } else {
            if ((me.endTime - me.player.currentTime()) < me.timerWatchNext)
              me.timerWatchNext = me.endTime - (me.player.currentTime());
          }
          if (me.timerWatchNext <= 0 && me.isOnline && !document.hidden) {
            // me.timerWatchNext = me.endTime - me.player.currentTime() - 1;
            clearInterval(timer);
            me.player.trigger({ type: 'playnext', bubbles: false });
          }
        }, 1000);
      }
      // if(window.matchMedia("(orientation: landscape)").matches && me.isIPad()){       
      //   watchNextImage.style.width = "60.4%";
      //   forSpace.style.display = "inline-flex";
      //   playingTimeCombine.style.top="72%";
      //   // center.innerHTML.style.width="11%"
      //   var baseTimer= document.getElementsByClassName('base-timer')[0];
      // }     

      let mobileInnerContainer = document.createElement("div");
      mobileInnerContainer.setAttribute("class", "mobileInnerContainer");
      // if(window.matchMedia("(orientation: landscape)").matches && me.isMobile()){
      //   watchNextImage.style.width="192px";
      //   watchNextLabel.appendChild(playingTimeCombine);
      //   // watchNextImage.style.height="108px";
      // }
      if (!(me.isMobile())) {
        container.classList.add('desktopPopup')
        watchNextLabel.appendChild(upNextLabel);
        watchNextLabel.appendChild(contentLabel);
        spinnerContainer.appendChild(spinnerBg);
        spinnerContainer.appendChild(playingTimeCombine)
        innerContainer.appendChild(watchNextImage);
        innerContainer.appendChild(iconClose);
        container.appendChild(innerContainer)
        container.appendChild(watchNextLabel)
        container.appendChild(spinnerContainer)
      }
      else if (window.matchMedia("(orientation: portrait)").matches && me.isMobile()) {
        container.classList.add('mobilePopup');
        watchNextLabel.appendChild(upNextLabel);
        watchNextLabel.appendChild(contentLabel);
        spinnerContainer.appendChild(spinnerBg);
        spinnerContainer.appendChild(playingTimeCombine)
        mobileInnerContainer.appendChild(watchNextImage)
        watchNextImage.appendChild(spinnerContainer)
        mobileInnerContainer.appendChild(watchNextLabel)
        container.appendChild(iconClose);
        container.appendChild(mobileInnerContainer);
        // var mobile = document.getElementsByClassName('containerWatchNext')[0];        
      }
      else if (window.matchMedia("(orientation: landscape)").matches && me.isMobile()) {
        container.classList.add('landscapePopup');
        spinnerContainer.appendChild(spinnerBg);
        watchNextImage.appendChild(spinnerContainer)
        watchNextLabel.appendChild(upNextLabel);
        watchNextLabel.appendChild(contentLabel);
        watchNextLabel.appendChild(playingTimeCombine)
        mobileInnerContainer.appendChild(watchNextImage)
        mobileInnerContainer.appendChild(watchNextLabel)
        container.appendChild(iconClose);
        container.appendChild(mobileInnerContainer);
      }



      playingTimeCombine.appendChild(playingTime);
      playingTimeCombine.appendChild(forSpace);
      // watchNextLabel.appendChild(assetLabel);      
      spinnerBg.appendChild(center);
      spinnerBg.appendChild(iconPlayWatchNext);
      // container.appendChild(iconPlayBgWatchNext);

      me.el().appendChild(container);

      iconClose.addEventListener('touchstart', function (e) {
        me.player.trigger({ type: 'closeWatchNext', bubbles: false });
        if (me.isIPad() || me.isTablet()) {
          me.player.trigger({ type: 'recomendation', bubbles: false });
          // me.uiEngine.showRecomendationScreen();
        }
        me.uiEngine.removeWatchNow();
        
        if(me.isMobile()){
          if(!me.player.paused()){
              me.uiEngine.showPauseIcon();
          }
        }
        clearInterval(timer);
      })
    },


    calculateTimeFraction: function(timeLeft)  {
      var timeLimit = me.endTime - me.startTime;          
      const rawTimeFraction = (timeLimit - timeLeft) / timeLimit;
      // if(rawTimeFraction<0.6)
      // document.getElementsByClassName("base-timer__path-remaining")[0].style.color = "linear-gradient(to left, yellow, orange)";
      return rawTimeFraction - ((1 / timeLimit) * (1 - rawTimeFraction));
    },
    setCircleDasharray: function (timeLeft) {
      // console.error("timeleft" + timeLeft);
      try{     
          const circleDasharray = `${(
            me.calculateTimeFraction(timeLeft) * 283
          ).toFixed(1)} 283`;
          // console.error("const value" + circleDasharray);
          if (document.getElementById("base-timer-path-remaining")) {
            document
              .getElementById("base-timer-path-remaining")
              .setAttribute("stroke-dasharray", circleDasharray);
          }                  
      }
      catch(e){
        console.warn(e)
      }
    },

    createEl: function () {
      this.elementRef = videojs.dom.createEl('div', {
        className: 'logituit_watchNext'
      });
      return this.elementRef;
    },
    releaseResource: function () {
      //releasing the resources
      if (this.elementRef) {
        delete this.elementRef;
        this.elementRef = null;
        delete this.watchNext;
        this.watchNext = null;
      }
    },

    applyStyles: function (options) {
      var element = this.el();
      if (element) {
        //element.setAttribute(); 
      }
      for (key in options) {
        let cssArray = options[key];
        let value = ""
        let obj = cssArray;
        Object.keys(obj).forEach(function (k) {
          if (typeof (obj[k]) == 'object') {
            obj[k].forEach(function (subkey) {
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
  });
  videojs.registerComponent('LogixWatchNext', this.watchNext);
}