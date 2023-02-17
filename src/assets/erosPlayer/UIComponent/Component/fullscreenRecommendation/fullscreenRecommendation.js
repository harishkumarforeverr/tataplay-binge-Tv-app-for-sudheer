function logituitFullscreenRecommendedPopup() {
    var me;
      this.fullscreenRecommendedPopup = videojs.extend(videojs.getComponent('ClickableComponent'), {
          constructor: function (player, options, wrapper, baseOptions, uiEngine, width, height) {
              videojs.getComponent('ClickableComponent').apply(this, arguments);
              // this.applyStyles(options.styleCSS);
              this.options=options;
              this.uiEngine = uiEngine;
              this.player = player;
              this.baseOptions= baseOptions;
              this.width = width;
              this.height = height;
              me = this;
              me.headerAllEpisode();
              // this.player.on("fullscreenRecomendation",me.headerAllEpisode);
              // this.player.on("closerecomendation",me.closeRecomendationPopup);
              
              
          },
          sendEvent: function(eventName, assetId, contentId) {
            var data = {
              assetId: assetId,
              contentId: contentId
            };
            var evt = new CustomEvent(eventName, {
              detail: data,
            });
            this.uiEngine.reportEventToUiEngine(evt);
          },
          headerAllEpisode: function(){
            me.applyStyles(me.options.styleCSS);            
            let imgUrl = me.baseOptions.fullscreenRecommendationData[0].images[0].cdn_url;
            let variantIndex = me.baseOptions.fullscreenRecommendationData[0].images[0].variants.indexOf("xl");
            let variant;
            if(variantIndex >= 0){
                variant  =  '_' + me.baseOptions.fullscreenRecommendationData[0].images[0].variants[variantIndex];
            }
            else{
                variant = "";
            }
            let variantUrl = imgUrl.replace('.jpg',variant+'.jpg').replace('.png',variant+'.png').replace('.svg',variant+'.svg').replace('.jpeg',variant+'.jpeg');              
            
            let container = document.createElement("div");
              container.setAttribute("class", "fullscreenRecommendedPopup");
              container.style.width = me.width;
              container.style.height = me.height;            
              // me.el().style.backgroundImage = 
              //   "url("+ variantUrl+")";

              let imgContainer = document.createElement("div");
              imgContainer.setAttribute("class","imgContainer");
              let bgImage = "linear-gradient(90deg, #000000, transparent),url("+variantUrl+")"
              imgContainer.style.backgroundImage = bgImage;


              let innerContainer = document.createElement("div");
              innerContainer.setAttribute("class","innerFullscreenContainer")
  
              let leftContainer = document.createElement("div");
              leftContainer.setAttribute("class","leftContainer")

              let rightContainer = document.createElement("div");            
              rightContainer.setAttribute("class","rightContainer")

              let closeIcon = document.createElement("img");
              closeIcon.setAttribute("src","UIComponent/Component/assets/LogiPlayer_icons/ic-close/icon-close-recommendation.png")              
              closeIcon.setAttribute("class","closeIconRecommended");

              closeIcon.addEventListener('click', function(event){
                //  me.uiEngine.removeAllEpisode();
                me.uiEngine.removeFullscreenRecommendation()
                if (window.history.length<=1) {
                  window.close()
                } else {
                  window.history.go(-1);
                }
                // me.sendEvent('onRecommendedClosed', null, null);
                // me.uiEngine.Wrapper.el_.removeChild(document.getElementsByClassName("logituit_recommendedUI")[0]);
              });         

              let recommendedText = document.createElement("p");
              recommendedText.setAttribute("class","recommendedText")
              recommendedText.innerHTML= "Recommended for You";

              let detailContainer = document.createElement("div");
              detailContainer.setAttribute("class","detailContainer")              
              
              let watchContainer = document.createElement("div");
              watchContainer.setAttribute("class","watchContainer")  
              
                                     
              // recommendedgenre.innerHTML= me.baseOptions.fullscreenRecommendationData[0].genres[0].genre_name + "."
              //  me.baseOptions.fullscreenRecommendationData[0].genres[1].genre_name + "." + me.baseOptions.fullscreenRecommendationData[0].genres[2].genre_name;
              let recommendedgenre = document.createElement("p");                               
              recommendedgenre.setAttribute("class","recommendedgenre");
              let genres = [];
              try{
                me.baseOptions.fullscreenRecommendationData[0].genres.forEach(function(element){
                  genres.push(element.genre_name);
                })
              }
              catch (e) {
                Logger.error("error in fullscreen recommendation", e)
              }
              recommendedgenre.innerHTML = genres.join(" • ");

              let recommendedTitle = document.createElement("p");
              recommendedTitle.innerHTML= me.baseOptions.fullscreenRecommendationData[0].asset_title;
              recommendedTitle.setAttribute("class","recommendedTitle")

              let recommendedDescription = document.createElement("p");
              recommendedDescription.innerHTML=  me.baseOptions.fullscreenRecommendationData[0].description;              
              recommendedDescription.setAttribute("class","recommendedDescription")

              let watchNowRecommendedContainer = document.createElement("div");
              watchNowRecommendedContainer.setAttribute("class","watchNowRecommendedContainer")  
              watchNowRecommendedContainer.addEventListener('click',function(event){
                document.getElementById(me.baseOptions.divId).removeChild(me.container);
                me.sendEvent('recommendedPlayClicked', me.baseOptions.fullscreenRecommendationData[0].asset_id, me.baseOptions.fullscreenRecommendationData[0].content_id);
                // watchNowRecommendedContainer.click = InitPlayer();
              })

              let watchTrailerContainer = document.createElement("div");
              watchTrailerContainer.setAttribute("class","watchTrailerContainer")  
              watchTrailerContainer.addEventListener('click',function(event){
                document.getElementById(me.baseOptions.divId).removeChild(me.container);
                me.sendEvent('recommendedTrailer', me.baseOptions.fullscreenRecommendationData[0].asset_id, me.baseOptions.fullscreenRecommendationData[0].content_id);
              })

              let watchListContainer = document.createElement("div");
              watchListContainer.setAttribute("class","watchListContainer")  


              let playIcon = document.createElement("img");
              playIcon.setAttribute("src","UIComponent/Component/assets/LogiPlayer_icons/cta-play/icon-play-recommendation.png");   
              playIcon.setAttribute("class","playIconRecommended");

              let watchTrailerIcon = document.createElement("img");
              watchTrailerIcon.setAttribute("src","UIComponent/Component/assets/LogiPlayer_icons/ic-trailer/icon-trailer.png");
              watchTrailerIcon.setAttribute("class","watchTrailerIcon");

              let watchListIcon = document.createElement("img");
              watchListIcon.setAttribute("src","UIComponent/Component/assets/LogiPlayer_icons/icon-watchlist/icon-watchlist.png");
              watchListIcon.setAttribute("class","watchListIconRecommended");
              if(me.isTablet()){
                detailContainer.style.marginTop = "48px"
              }

              if(me.isSafari() || me.isTablet()){
                playIcon.style.marginRight = "16px";
                watchTrailerIcon.style.marginRight = "16px";
                watchListIcon.style.marginRight = "16px";
              }
              let recommendedWatchNowBtn = document.createElement("p");
              recommendedWatchNowBtn.innerHTML= "Watch Now";
              recommendedWatchNowBtn.setAttribute("class","recommendedWatchNowBtn")
              
              
              let recommendedWatchTrailer = document.createElement("p");
              recommendedWatchTrailer.innerHTML= "Watch Trailer";
              recommendedWatchTrailer.setAttribute("class","recommendedWatchTrailer")

              let recommendedWatchList = document.createElement("p");
              recommendedWatchList.innerHTML= "Watchlist";
              recommendedWatchList.setAttribute("class","recommendedWatchList")
              
              me.container = container;
              document.getElementById(me.baseOptions.divId).appendChild(me.container);
              container.appendChild(imgContainer)
              imgContainer.appendChild(innerContainer);
              container.appendChild(rightContainer);              
              innerContainer.appendChild(leftContainer);
              // innerContainer.appendChild(rightContainer);              
              rightContainer.appendChild(closeIcon);
              leftContainer.appendChild(recommendedText);
              leftContainer.appendChild(detailContainer);

              leftContainer.appendChild(watchContainer);

              watchContainer.appendChild(watchNowRecommendedContainer);
              watchContainer.appendChild(watchTrailerContainer);
              watchContainer.appendChild(watchListContainer);   

              watchNowRecommendedContainer.appendChild(playIcon);        
              watchNowRecommendedContainer.appendChild(recommendedWatchNowBtn);
              
              watchTrailerContainer.appendChild(watchTrailerIcon)              
              watchTrailerContainer.appendChild(recommendedWatchTrailer);

              watchListContainer.appendChild(watchListIcon);
              watchListContainer.appendChild(recommendedWatchList);
                                       
              detailContainer.appendChild(recommendedgenre);
              detailContainer.appendChild(recommendedTitle);
              detailContainer.appendChild(recommendedDescription);
          },
          closeRecomendationPopup:function()
          {
            me.uiEngine.Wrapper.el_.removeChild(document.getElementsByClassName("logituit_recommendedUI")[0]);
          }
          ,
          isSafari: function() {
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
          isTablet: function(){
            const userAgent = navigator.userAgent.toLowerCase();
            const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
            return isTablet;
          },
          createEl: function() {
              this.elementRef = videojs.dom.createEl('div', {
                className:'logituit_fullscreenRecommendedUI'
              });
              return this.elementRef;
            },
            releaseResource: function () {
              //releasing the resources
              document.getElementById(me.baseOptions.divId).removeChild(me.container);
              if (this.elementRef) {
                  delete this.elementRef;
                  this.elementRef = null;
                  delete this.allEpisode;
                  this.allEpisode = null;
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
      videojs.registerComponent('recommendedPopup', this.fullscreenRecommendedPopup);
  }