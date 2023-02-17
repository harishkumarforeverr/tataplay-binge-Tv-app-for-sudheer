function logituitRecommendedPopup() {
    var me;
      this.recommendedPopup = videojs.extend(videojs.getComponent('ClickableComponent'), {
          constructor: function (player, options, wrapper, baseOptions, uiEngine, endTime) {
              videojs.getComponent('ClickableComponent').apply(this, arguments);
              // this.applyStyles(options.styleCSS);
              this.options=options;
              this.uiEngine = uiEngine;
              this.player = player;
              this.endTime = endTime;
              this.baseOptions= baseOptions;
              me = this;
              me.headerAllEpisode();
              // this.player.on("recomendation",me.headerAllEpisode);
              this.player.on("closerecomendation",me.closeRecomendationPopup);
              
              
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
              let container = document.createElement("div");
              container.setAttribute("class", "containerRecommendedPopup");
  
              let topBarContainer = document.createElement("div");
              topBarContainer.setAttribute("class", "topBarContainerPopup");
  
              let recommendedHeader = document.createElement("label");
              recommendedHeader.setAttribute("class","recommendedHeader");
              recommendedHeader.innerHTML = "Suggested for You";
  
              let iconClose = document.createElement("img");
              iconClose.setAttribute("src","UIComponent/Component/assets/LogiPlayer_icons/cta-close/ic-close.svg" )
              // iconClose.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_icons/cta-close/ic-close.png)";
              iconClose.setAttribute("class","iconCloseRecommended");
              iconClose.addEventListener('click', function(event){
                //  me.uiEngine.removeAllEpisode();
                me.player.trigger({ type: 'closeRecommendation', bubbles: false });
                me.sendEvent('onRecommendedClosed', null, null);
                me.uiEngine.Wrapper.el_.removeChild(document.getElementsByClassName("logituit_recommendedUI")[0]);
                me.uiEngine.removeRecommendation();
                // if(me.player.duration() == me.player.currentTime()){
                if(me.player.duration() == me.player.currentTime()|| ((me.player_.duration() - me.player_.currentTime())<=1)){
                  if (window.history.length <= 1) {
                    window.close()
                  } else {
                    window.history.go(-1);
                  }
                }
              });              
              iconClose.addEventListener('touchstart', function(event){
                //  me.uiEngine.removeAllEpisode();
                me.player.trigger({ type: 'closeRecommendation', bubbles: false });
                me.sendEvent('onRecommendedClosed', null, null);
                me.uiEngine.Wrapper.el_.removeChild(document.getElementsByClassName("logituit_recommendedUI")[0]);
                me.uiEngine.removeRecommendation();
                //if(me.player.duration() == me.player.currentTime()){
                if(me.player.duration() == me.player.currentTime()|| ((me.player_.duration() - me.player_.currentTime())<=1)){
                  if (window.history.length <= 1) {
                    window.close()
                  } else {
                    window.history.go(-1);
                  }
                }
              });
              topBarContainer.appendChild(recommendedHeader);
              topBarContainer.appendChild(iconClose);
              container.appendChild(topBarContainer);
           
            // let menubar = document.createElement("ul");
            // menubar.setAttribute("class","episodMenubar");
  
            var selectedSeason = 'season 1';
            var selectedIndex = 0;
           
            var outerEpisodeContainer =  document.createElement("div");
            outerEpisodeContainer.setAttribute("class", "outerRecommendedContainer");
            outerEpisodeContainer.setAttribute("id","recommendation-scrollable-container");
            // if(isIPad() || isTablet()){
            //   outerEpisodeContainer.style.gridGap="25px";
              
            // }
            // else {
            //   outerEpisodeContainer.style.gridGap="5px";
            // }
              me.baseOptions.recommendations.forEach(function (element , index) {
                 
                let containerRecommended = document.createElement("Label");
                  containerRecommended.setAttribute("class", "containerRecommended");
                  containerRecommended.setAttribute("episodeId", index);
  
                //   if(me.uiEngine.getAllEpisode() == index){
                //     episodeContainer.classList.add('activeEpisode');
                //   }
                  
                  let recommendedImageContainer = document.createElement('div');
                  recommendedImageContainer.setAttribute("class","image_container");
                  // recommendedImageContainer.addEventListener('click', function (e) {
                  //   me.sendEvent('onRecommendedItemClicked', element.asset_id, element.content_id);
                  //   recommendedImage.click =  InitPlayer();      
                  // });

                  let recommendedImage = document.createElement('div'); 
                  recommendedImage.setAttribute("class","recommendedImage");
                  let recommendedImageTag = document.createElement('img'); 
                  recommendedImageTag.setAttribute("class","recommendedImageTag");

                  let imgUrl = element.images[0].cdn_url;
                  let variantIndex = element.images[0].variants.indexOf("xs");
                  let variant;
                  if(variantIndex >= 0){
                    variant  =  '_' + element.images[0].variants[variantIndex];
                  }
                  else{
                    variant = "";
                  }
               
                  let variantUrl = imgUrl.replace('.jpg',variant+'.jpg').replace('.png',variant+'.png').replace('.svg',variant+'.svg').replace('.jpeg',variant+'.jpeg')
                  recommendedImageTag.src =variantUrl;
                  
                  let imageGradient = document.createElement("div");
                  imageGradient.setAttribute("class","recommendedImageFilter");
                  recommendedImage.appendChild(recommendedImageTag);
                  recommendedImage.appendChild(imageGradient);
                  recommendedImageContainer.appendChild(recommendedImage);

                  let onHoverContainer = document.createElement('div');
                  onHoverContainer.setAttribute("class", "hover_container");
                  recommendedImageContainer.appendChild(onHoverContainer);
                  // recommendedImage.appendChild(onHoverContainer);

                  let onHoverTitle = document.createElement('label');
                  onHoverTitle.innerHTML = element.asset_title;
                  onHoverTitle.setAttribute("class","hover_title");

                  let onHoverButtons = document.createElement('div');
                  onHoverButtons.setAttribute("class","hover_buttons_container");

                  let onHoverPlay = document.createElement('div');
                  onHoverPlay.setAttribute("class","hover_button");

                  let onHoverPlayIcon = document.createElement('img');
                  onHoverPlayIcon.setAttribute("class","hover_icon");
                  onHoverPlayIcon.src = me.options.icons.play;
                  let onHoverPlayText = document.createElement('label');
                  onHoverPlayText.setAttribute("class","hover_text");
                  onHoverPlayText.innerHTML = "Watch";
                  onHoverPlay.append(onHoverPlayIcon);
                  onHoverPlay.append(onHoverPlayText);
                  onHoverPlay.addEventListener('click', function (e) {
                    me.sendEvent('recommendedWatchNowClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });
                  onHoverPlay.addEventListener('touchstart', function (e) {
                    me.sendEvent('recommendedWatchNowClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });

                  let onHoverWatchlist = document.createElement('div');
                  onHoverWatchlist.setAttribute("class","hover_button");

                  onHoverWatchlist.setAttribute("class","hover_button");
                  let onHoverWatchlistIcon = document.createElement('img');
                  onHoverWatchlistIcon.setAttribute("class","hover_icon");
                  onHoverWatchlistIcon.src = me.options.icons.watchleast;
                  let onHoverWatchText = document.createElement('label');
                  onHoverWatchText.setAttribute("class","hover_text");
                  onHoverWatchText.innerHTML = "Watchlist";
                  onHoverWatchlist.append(onHoverWatchlistIcon);
                  onHoverWatchlist.append(onHoverWatchText);
                  onHoverWatchlist.addEventListener('click', function (e) {
                    me.sendEvent('recommendedWatchListClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });
                  onHoverWatchlist.addEventListener('touchstart', function (e) {
                    me.sendEvent('recommendedWatchListClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });

                  let onHoverShare = document.createElement('div');
                  onHoverShare.setAttribute("class","hover_button");

                  onHoverShare.setAttribute("class","hover_button");
                  let onHoverShareIcon = document.createElement('img');
                  onHoverShareIcon.setAttribute("class","hover_icon");
                  onHoverShareIcon.src = me.options.icons.share;
                  let onHoverShareText = document.createElement('label');
                  onHoverShareText.setAttribute("class","hover_text");
                  onHoverShareText.innerHTML = "Share";
                  onHoverShare.append(onHoverShareIcon);
                  onHoverShare.append(onHoverShareText);
                  onHoverShare.addEventListener('click', function (e) {
                    me.sendEvent('recommendedShareClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });
                  onHoverShare.addEventListener('touchstart', function (e) {
                    me.sendEvent('recommendedShareClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });

                  let onHoverInfo = document.createElement('div');
                  onHoverInfo.setAttribute("class","hover_button");

                  onHoverInfo.setAttribute("class","hover_button");
                  let onHoverInfoIcon = document.createElement('img');
                  onHoverInfoIcon.setAttribute("class","hover_icon");
                  onHoverInfoIcon.src = me.options.icons.info;
                  let onHoverInfoText = document.createElement('label');
                  onHoverInfoText.setAttribute("class","hover_text");
                  onHoverInfoText.innerHTML = "Info";
                  onHoverInfo.append(onHoverInfoIcon);
                  onHoverInfo.append(onHoverInfoText);
                  onHoverInfo.addEventListener('click', function (e) {
                    me.sendEvent('recommendedInfoClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });
                  onHoverInfo.addEventListener('touchstart', function (e) {
                    me.sendEvent('recommendedInfoClicked', element.asset_id, element.content_id);
                    // recommendedImage.click =  InitPlayer();      
                  });

                  onHoverButtons.appendChild(onHoverPlay);
                  onHoverButtons.appendChild(onHoverWatchlist);
                  onHoverButtons.appendChild(onHoverShare);
                  onHoverButtons.appendChild(onHoverInfo);
                  onHoverContainer.appendChild(onHoverTitle);
                  onHoverContainer.appendChild(onHoverButtons);




                  // let infoImage = document.createElement('img'); 
                  // infoImage.setAttribute("class","icon-info");
                  // infoImage.setAttribute("src","UIComponent/Component/assets/LogiPlayer_icons/icon-info/icon-info.png" )

                  let recommendedAssetTitle = document.createElement("label");
                  recommendedAssetTitle.setAttribute("class","recommendedAssetTitle");
                  recommendedAssetTitle.innerHTML = element.asset_title;
  
                  let recommendedDesc = document.createElement("label");
                  recommendedDesc.setAttribute("class","recommendedDesc");
                  recommendedDesc.innerHTML = element.description;
                  
                  containerRecommended.appendChild(recommendedImageContainer);
                //   containerRecommended.appendChild(episodeNoLabel);
                containerRecommended.appendChild(recommendedAssetTitle);
                containerRecommended.appendChild(recommendedDesc);
                
               
                outerEpisodeContainer.appendChild(containerRecommended);
                container.appendChild(outerEpisodeContainer);

                containerRecommended.addEventListener('click', function (e) {
                  try{
                    let selectedIndex=episodeContainer.getAttribute("episodeId");
                    var hasclass = document.querySelectorAll('.activeEpisode')
                    if (hasclass && hasclass[0]) {
                        hasclass[0].classList.remove('activeEpisode')
                    }
                      me.uiEngine.setAllEpisode(selectedIndex); 
                      containerRecommended.classList.add('activeEpisode');
                  }
                  catch(e){}
                      // window.scrollTo(0,100);
                });
              });
              let leftArrowContainer = document.createElement("div");
              leftArrowContainer.setAttribute("class","left_arrow_container");
              leftArrowContainer.setAttribute("id","recommended-left-arrow-container");
              let leftArrow = document.createElement("img");
              leftArrow.src = "UIComponent/Component/assets/LogiPlayer_icons/icon-recommended/right-arrow.svg";
              leftArrow.setAttribute("class","left_arrow");
              leftArrow.addEventListener("click", function() {
                let scrollableContainer = document.getElementById("recommendation-scrollable-container");
                let rightContainer = document.getElementById("recommended-right-arrow-container");
                let leftContainer = document.getElementById("recommended-left-arrow-container");
                const scrollWidth = scrollableContainer.scrollWidth;
                if (scrollableContainer.scrollLeft !== 0) {
                  scrollableContainer.scrollTo(scrollableContainer.scrollLeft - (screen.width/4) * 3, 0);
                } 
                if (scrollableContainer.scrollLeft == 0) {
                  // outerEpisodeContainer.removeChild(leftContainer);
                  leftContainer.style.display = "none";
                }
                if(scrollableContainer.scrollLeft+screen.width !== scrollWidth) {
                  // outerEpisodeContainer.appendChild(rightContainer);
                  rightContainer.style.display = "block";
                }
              });
              leftArrow.addEventListener("touchstart", function() {
                let scrollableContainer = document.getElementById("recommendation-scrollable-container");
                let rightContainer = document.getElementById("recommended-right-arrow-container");
                let leftContainer = document.getElementById("recommended-left-arrow-container");
                const scrollWidth = scrollableContainer.scrollWidth;
                if (scrollableContainer.scrollLeft !== 0) {
                  scrollableContainer.scrollTo(scrollableContainer.scrollLeft - (screen.width/4) * 3, 0);
                } 
                if (scrollableContainer.scrollLeft == 0) {
                  // outerEpisodeContainer.removeChild(leftContainer);
                  leftContainer.style.display = "none";
                }
                if(scrollableContainer.scrollLeft+screen.width !== scrollWidth) {
                  // outerEpisodeContainer.appendChild(rightContainer);
                  rightContainer.style.display = "block";
                }
              });
              leftArrowContainer.appendChild(leftArrow);
              outerEpisodeContainer.appendChild(leftArrowContainer);
              

              let rightArrowContainer = document.createElement("div");
              rightArrowContainer.setAttribute("class","right_arrow_container");
              rightArrowContainer.setAttribute("id","recommended-right-arrow-container");
              let rightArrow = document.createElement("img");
              rightArrow.src = "UIComponent/Component/assets/LogiPlayer_icons/icon-recommended/right-arrow.svg";
              rightArrow.setAttribute("class","right_arrow");
              rightArrow.addEventListener("click", function() {
                let scrollableContainer = document.getElementById("recommendation-scrollable-container");
                let rightContainer = document.getElementById("recommended-right-arrow-container");
                let leftContainer = document.getElementById("recommended-left-arrow-container");
                const scrollWidth = scrollableContainer.scrollWidth;
                if (scrollableContainer.scrollLeft+screen.width !== scrollWidth) {
                  scrollableContainer.scrollTo(scrollableContainer.scrollLeft + (screen.width/4) * 3, 0);
                } else {
                  // outerEpisodeContainer.removeChild(rightContainer);
                  rightContainer.style.display = "none"
                }
                if(scrollableContainer.scrollLeft !== 0) {
                  // outerEpisodeContainer.appendChild(leftContainer);
                  leftContainer.style.display = "block";
                }
              });
              rightArrow.addEventListener("touchstart", function() {
                let scrollableContainer = document.getElementById("recommendation-scrollable-container");
                let rightContainer = document.getElementById("recommended-right-arrow-container");
                let leftContainer = document.getElementById("recommended-left-arrow-container");
                const scrollWidth = scrollableContainer.scrollWidth;
                if (scrollableContainer.scrollLeft+screen.width !== scrollWidth) {
                  scrollableContainer.scrollTo(scrollableContainer.scrollLeft + (screen.width/4) * 3, 0);
                } else {
                  // outerEpisodeContainer.removeChild(rightContainer);
                  rightContainer.style.display = "none"
                }
                if(scrollableContainer.scrollLeft !== 0) {
                  // outerEpisodeContainer.appendChild(leftContainer);
                  leftContainer.style.display = "block";
                }
              });
              rightArrowContainer.appendChild(rightArrow);
              outerEpisodeContainer.appendChild(rightArrowContainer);

              // let scrollableContainer = document.getElementById("recommendation-scrollable-container");
              if (outerEpisodeContainer.scrollLeft == outerEpisodeContainer.scrollWidth) {
                rightArrowContainer.style.display = "block";
              } else if (outerEpisodeContainer.scrollRight !== 0) {
                rightArrowContainer.style.display = "block";
              }
              
              if (outerEpisodeContainer.scrollLeft == 0) {
                leftArrowContainer.style.display = "none";
              } else if (outerEpisodeContainer.scrollLeft !== 0) {
                leftArrowContainer.style.display = "block";
              } 
             
  
              me.el().appendChild(container);
          },
          closeRecomendationPopup:function()
          {
            me.uiEngine.Wrapper.el_.removeChild(document.getElementsByClassName("logituit_recommendedUI")[0]);
          }
          ,
          createEl: function() {
              this.elementRef = videojs.dom.createEl('div', {
                className:'logituit_recommendedUI'
              });
              return this.elementRef;
            },
            releaseResource: function () {
              //releasing the resources
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
      isIPad = function () {
        var isIpaddev = false;
        var userAgent = navigator.userAgent;
        isIpaddev = (userAgent.match(/ipad/i) || (navigator.maxTouchPoints &&
          navigator.maxTouchPoints > 2 &&
          /MacIntel/.test(navigator.platform)));
        return isIpaddev;
      }
      isTablet = function(){
        const userAgent = navigator.userAgent.toLowerCase();
        const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
        return isTablet;
      }
      videojs.registerComponent('recommendedPopup', this.recommendedPopup);
  }