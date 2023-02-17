function logituitNextEpisode() {
    var me;
    this.nextEpisode = videojs.extend(videojs.getComponent('ClickableComponent'), {
        constructor: function (player, options, wrapper, baseOptions, uiEngine,endTime,startTime) {
            videojs.getComponent('ClickableComponent').apply(this, arguments);
            this.applyStyles(options.styleCSS);
            me = this;
            this.endTime = endTime;
            this.startTime = startTime;
            this.uiEngine = uiEngine;
            this.player = player;
            this.options = options;
            this.baseOptions= baseOptions;
            this.webNextEpisodePopup();         
        },

        isSafari: function() {
          var userAgent = navigator.userAgent;
          
          // if (userAgent.indexOf("safari") != -1 || userAgent.indexOf("Safari") != -1) {
          var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          return safari;
        },
        isIPad :function () {
          var isIpaddev = false;
          var userAgent = navigator.userAgent;
          isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
          navigator.maxTouchPoints > 2 &&
          /MacIntel/.test(navigator.platform)));
          return isIpaddev;
        },
        isTablet : function(){
          const userAgent = navigator.userAgent.toLowerCase();
          const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
          return isTablet;
        },
        isMobile:function(){     
          var check = false;
              (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
              return check;     
      },
      setOnlineFlag(state){
          me.isOnline = state;             
      },
      setBackgroundFlag(state){
          me.isInBackground = state;      
      },
        webNextEpisodePopup: function(){
            var timer;
            let container = document.createElement("div");
            container.setAttribute("class", "containerNextEpisode");
            let landscapeInnerContainer = document.createElement("div");
            landscapeInnerContainer.setAttribute("class", "landscapeInnerContainer");
            let desktopNextEpiPopup = document.createElement("div");
            desktopNextEpiPopup.setAttribute("class", "desktopNextEpiPopup");
            let mobileNextEpiPopup = document.createElement("div");
            mobileNextEpiPopup.setAttribute("class", "mobileNextEpiPopup");
            let landscapeNextEpiPopup = document.createElement("div");
            landscapeNextEpiPopup.setAttribute("class", "landscapeNextEpiPopup");
                  
             container.style.display = 'none';
            let innerContainer = document.createElement("div");
            innerContainer.setAttribute("class", "innerContainer");
            let nextEpisodeImage = document.createElement('div'); 
            nextEpisodeImage.setAttribute("class","nextEpisodeImage");

            let imgUrl = this.baseOptions.next_content.images[0].cdn_url;
            let variantIndex = this.baseOptions.next_content.images[0].variants.indexOf("xs");
            let variant;
            if(variantIndex >= 0){
              variant  =  '_' + this.baseOptions.next_content.images[0].variants[variantIndex];
            }
            else{
              variant = "";
            }

            let variantUrl = imgUrl.replace('.jpg',variant+'.jpg').replace('.png',variant+'.png').replace('.svg',variant+'.svg').replace('.jpeg',variant+'.jpeg');

            if(window.matchMedia("(orientation: portrait)").matches|| 
            window.matchMedia("(orientation: landscape)").matches && me.isIPad()) {
                nextEpisodeImage.style.backgroundImage = 
                "url("+variantUrl+")";
            } else {
                nextEpisodeImage.style.backgroundImage = 
                "url("+variantUrl+")";
            }
            
            let iconClose = document.createElement("span");
            if(window.matchMedia("(orientation: portrait)").matches|| 
            window.matchMedia("(orientation: landscape)").matches && me.isIPad()) {
             // iconClose.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_icons/cta-close/ic-close.png)";
                   iconClose.style.backgroundImage= me.options.icon["close"];
            } else {
            //  iconClose.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_icons/cta-close/ic-close.svg)";
                 iconClose.style.backgroundImage= me.options.icon["close"];
          }
            iconClose.setAttribute("class","iconNextClose");
            iconClose.addEventListener('click', function(event){
              me.player.trigger({type: 'recomendation', bubbles: false});
              // me.uiEngine.showRecomendationScreen();
              me.player.trigger({type: 'closeWatchNext', bubbles: false});
              me.uiEngine.removeNextEpisode();
              clearInterval(timer);
            });

            let nextEpisodeLabel = document.createElement("div");
            nextEpisodeLabel.setAttribute("class","nextEpisodeLabel");
      
            let upNextLabel = document.createElement("span");
            upNextLabel.setAttribute("class","upNextLabel");
            upNextLabel.innerHTML = "UP NEXT";

            let upNextLabelMobile = document.createElement("span");
            upNextLabelMobile.setAttribute("class","upNextLabelMobile");
            upNextLabelMobile.innerHTML = "UP NEXT";

            let contentLabel = document.createElement("span");
            contentLabel.innerHTML = this.baseOptions.next_content.content_title;
            contentLabel.setAttribute("class","contentLabel");
            

            let assetLabel = document.createElement("span");
            assetLabel.innerHTML = this.baseOptions.next_content.asset_title;
            assetLabel.setAttribute("class","assetLabel");
      
            // new spinner code
            // let countdown = document.createElement("div");
            // countdown.setAttribute("class","countdown");
            // container.appendChild(countdown);
            // let svg = document.createElement("svg");
            // countdown.appendChild(svg);
            // let circle = document.createElement("circle");
            // circle.setAttribute("r","18");
            // circle.setAttribute("cx","20");
            // circle.setAttribute("cy","20");
            // svg.appendChild(circle);

            let loaderContainer = document.createElement("div");
            loaderContainer.setAttribute("class","loaderContainer");
            
        
   
            //countdown spinner code
            let center = document.createElement("div");
            center.setAttribute("class","logix-center");
            // let leftHalf = document.createElement("div");
            // leftHalf.setAttribute("class","leftHalf");
            // center.appendChild(leftHalf);
            // let rightHalf = document.createElement("div");
            // rightHalf.setAttribute("class","rightHalf");
            // center.appendChild(rightHalf);
            let progressbar =  document.createElement("div");
            me.timerWatchNext = me.endTime - me.player.currentTime();
            progressbar.innerHTML = `<div class="base-timer">
            <svg class="base-timer__nextEpisode" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="50%" stop-color="#0aa1ea" />      
      <stop offset="100%" stop-color="#40c6b6" />
    </linearGradient>
  </defs>
              <g class="base-timer__circle-nextEpisode">
                <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45">
                </circle>
                <path
                  id="base-timer-path-remaining"
                  stroke-dasharray="`+(me.calculateTimeFraction(me.endTime - me.player.currentTime()) * 283).toFixed(1)+` 283"
                  class="base-timer__path-remaining-nextEpisode orange"
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
            

            let spinnerBg = document.createElement("div");
            spinnerBg.setAttribute("class","spinnerBg");

            let iconPlayBg = document.createElement("div");
            iconPlayBg.setAttribute("class","iconPlayBg");


            let iconPlay = document.createElement("span");
            iconPlay.setAttribute("class","iconPlay");
           // iconPlay.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_icons/cta-play/cta-play2.png)";
              iconPlay.style.backgroundImage= me.options.icon["play"];
            iconPlay.addEventListener('click', function(event){
              clearInterval(timer);
              me.player.trigger({type: 'playnext', bubbles: false})
            });
            iconPlay.addEventListener('touchstart', function(event){
              clearInterval(timer);
              me.player.trigger({type: 'playnext', bubbles: false})
            });
           
            let playingTimeCombine = document.createElement("div");
            playingTimeCombine.setAttribute("class","playingTimeNextEpisode")
            if(me.isSafari()){
              playingTimeCombine.style.marginLeft="9px";
              contentLabel.style.marginTop="10px";
              assetLabel.style.marginTop="10px";
              iconClose.style.width="14px";
              iconClose.style.height="14px";
            }
            if(me.isSafari() && me.isMobile()){
              nextEpisodeLabel.style.marginLeft="15px";
            }
            
            if(me.isTablet()){
              playingTimeCombine.style.marginLeft="9px";
              contentLabel.style.marginTop="10px";
              assetLabel.style.marginTop="10px";
            }
            let playingTime = document.createElement("span");
            // playingTime.innerHTML = "Playing in 4 seconds";
            playingTime.setAttribute("class","playingTime");

            let forSpace = document.createElement("span");
            forSpace.setAttribute("class","forSpace");

            if(!me.isSafari() && navigator.userAgent.indexOf('Mac OS X') != -1)
            {
              forSpace.style.left = "43%"
            }
            if((window.matchMedia("(orientation: portrait)").matches && me.isMobile())){
              container.style.display = 'flex';
            }
            else{
              container.style.display = 'block';
            }
            me.timerWatchNext = me.endTime - me.player.currentTime();
            let timerTime =  (me.endTime - me.startTime)/2; 
            // forSpace.innerHTML = Number.parseInt(me.timerWatchNext) + " seconds"
            // playingTime.innerHTML = "Playing in ";                       
            // me.timerWatchNext--;
            if(me.timerWatchNext >=0 && me.timerWatchNext <= (me.endTime - me.startTime)){
                timer = setInterval(function(){
                if (me.timerWatchNext > (me.endTime - me.startTime)) {
                  clearInterval(timer);
                  me.uiEngine.removeWatchNow();
                }
                if (me.timerWatchNext <= 0 || (document.hidden && (me.isMobile() || me.isTablet() || me.isIPad()))) {
                  clearInterval(timer);
                }         
                try{
                  me.setCircleDasharray(me.timerWatchNext - 1);
                  // console.error("endtime",me.endTime);
                  // console.error("starttime",me.startTime);            
                }
                catch{}
                // forSpace.innerHTML = me.timerWatchNext + " seconds"
                forSpace.innerHTML = Number.parseInt(me.timerWatchNext) + " seconds"
                playingTime.innerHTML = "Playing in ";
              

                if (me.player.paused() && me.timerWatchNext > 0 && me.isOnline && ((!document.hidden && (me.isMobile() || me.isTablet() || me.isIPad())) || (!me.isMobile() && !me.isTablet() && !me.isIPad()))){
                  me.timerWatchNext = me.timerWatchNext - 1;
                } else{
                  if ((me.endTime - me.player.currentTime()) < me.timerWatchNext)
                    me.timerWatchNext = me.endTime - (me.player.currentTime());
                }
                if (me.timerWatchNext <= 0 && me.isOnline && !document.hidden) {
                  // me.timerWatchNext = me.endTime - me.player.currentTime() - 1;
                  clearInterval(timer);
                  me.player.trigger({type: 'playnext', bubbles: false});
                }
                // container.style.display = 'flex';
              }, 1000);
            }
            if(!(me.isMobile())){
              container.classList.add('desktopNextEpiPopup')
              spinnerBg.appendChild(center);
              spinnerBg.appendChild(iconPlay);
              loaderContainer.appendChild(spinnerBg);
              loaderContainer.appendChild(playingTimeCombine)
              nextEpisodeLabel.appendChild(upNextLabel);
              nextEpisodeLabel.appendChild(contentLabel);
              nextEpisodeLabel.appendChild(assetLabel);
              innerContainer.appendChild(nextEpisodeImage);
              innerContainer.appendChild(iconClose);              
              container.appendChild(innerContainer);
              container.appendChild(nextEpisodeLabel);
              container.appendChild(loaderContainer);
            }
            else if(window.matchMedia("(orientation: portrait)").matches && me.isMobile()){
              container.classList.add('mobileNextEpiPopup');     
              loaderContainer.appendChild(spinnerBg);
              loaderContainer.appendChild(playingTimeCombine)  
              spinnerBg.appendChild(center);
            spinnerBg.appendChild(iconPlay);       
              container.appendChild(iconClose);
              container.appendChild(upNextLabel)
              container.appendChild(loaderContainer)      
              container.appendChild(contentLabel)
              container.appendChild(assetLabel) 
            }
            else if(window.matchMedia("(orientation: landscape)").matches && me.isMobile()){
              container.classList.add('landscapeNextEpiPopup');
              spinnerBg.appendChild(center);
              spinnerBg.appendChild(iconPlay);
              nextEpisodeLabel.appendChild(upNextLabel);
              nextEpisodeLabel.appendChild(contentLabel);
              nextEpisodeLabel.appendChild(assetLabel);
              nextEpisodeLabel.appendChild(playingTimeCombine)
              nextEpisodeImage.appendChild(spinnerBg);
              landscapeInnerContainer.appendChild(nextEpisodeImage)             
              landscapeInnerContainer.appendChild(nextEpisodeLabel)
              container.appendChild(iconClose);
              container.appendChild(landscapeInnerContainer)
            }
            // container.appendChild(upNextLabelMobile);
            // container.appendChild(nextEpisodeLabelMobile);
            
            
             
            // container.appendChild(iconPlayBg);                       
            
            playingTimeCombine.appendChild(playingTime);
            playingTimeCombine.appendChild(forSpace);
            // container.appendChild(playingTime);
            
          

            me.el().appendChild(container);

            iconClose.addEventListener('touchstart', function(e){
              me.player.trigger({type: 'closeWatchNext', bubbles: false});
              if (me.isIPad()|| me.isTablet()) {
                me.player.trigger({type: 'recomendation', bubbles: false});
                //me.uiEngine.showRecomendationScreen();
              }
              me.uiEngine.removeNextEpisode();

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
        createEl: function() {
          this.elementRef = videojs.dom.createEl('div', {
            className:'logituit_nextEpisode'
          });
          return this.elementRef;
        },
        releaseResource: function () {
          //releasing the resources
          if (this.elementRef) {
              delete this.elementRef;
              this.elementRef = null;
              delete this.nextEpisode;
              this.nextEpisode = null;
          }
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
    });
    videojs.registerComponent('LogixNextEpisode', this.nextEpisode);
}