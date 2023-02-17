function logituitAllEpisode() {
  var me;
  this.allEpisode = videojs.extend(videojs.getComponent('ClickableComponent'), {
    constructor: function (player, options, wrapper, baseOptions, uiEngine, endTime) {
      videojs.getComponent('ClickableComponent').apply(this, arguments);
      this.applyStyles(options.styleCSS);

      this.uiEngine = uiEngine;
      this.player = player;
      this.endTime = endTime;
      this.baseOptions = baseOptions;
      me = this;
      this.headerAllEpisode();

    },
    headerAllEpisode: function () {
      let container = document.createElement("div");
      container.setAttribute("class", "containerAllEpisode");
      container.style.overflow = "auto";
      let topBarContainer = document.createElement("div");
      topBarContainer.setAttribute("class", "topBarContainer");

      let allEpisodeHeader = document.createElement("label");
      allEpisodeHeader.setAttribute("class", "allEpisodeHeader");
      allEpisodeHeader.innerHTML = "All Episodes";

      let iconClose = document.createElement("img");
      iconClose.src=me.options_.icons.close;
      // iconClose.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_icons/cta-close/ic-close.png)";
      iconClose.setAttribute("class", "iconCloseAllEpisode");
      iconClose.addEventListener('click', function (event) {
        me.uiEngine.removeAllEpisode();
      });
      iconClose.addEventListener('touchstart', function (event) {
        me.uiEngine.removeAllEpisode();
      });
      topBarContainer.appendChild(allEpisodeHeader);
      topBarContainer.appendChild(iconClose);
      container.appendChild(topBarContainer);

      let menubar = document.createElement("ul");
      menubar.setAttribute("class", "episodMenubar");
      // menubar.style.overflowX = "auto";
      var selectedSeason = me.baseOptions.allEpisodeData[0];
      var selectedIndex = 0;
      let seasonSelected = false;
      let firstMenuOption;
      me.baseOptions.allEpisodeData.forEach(function (element, index) {
        
        let menuOption = document.createElement("li");
        if (index == 0) {
          firstMenuOption = menuOption;
        }
        let selIndex = index + 1;

        menuOption.setAttribute("class", "menuOption");
        menuOption.setAttribute('id', index)
        menuOption.innerHTML = element.asset_title;
        // if("getAllEpisodeSeason" in me.uiEngine) {
        //   qualityname = me.uiEngine.getAllEpisodeSeason();
        // }else {
        //   qualityname = me.uiEngine.defaultVideoQuality;
        // }
        element.contents.forEach(function(ele) {
          // console.log("keys: ", Object.keys(me.baseOptions.allEpisodeData));
          if (me.baseOptions.contentId == ele.content_id){
            seasonSelected = true;
            selectedIndex = parseInt(menuOption.getAttribute('id'));
            selectedSeason = ele;
            if (selectedIndex == 4) {
              window.scrollBy(100, 0);
            }
            var hasclass = document.querySelectorAll('.activeMenuOption')
            if (hasclass && hasclass[0]) {
              hasclass[0].classList.remove('activeMenuOption')
            }
            me.uiEngine.setAllEpisodeSeason(selectedIndex);
            menuOption.classList.add('activeMenuOption');
            //me.setEpisodes(container, selectedIndex, selectedSeason);
              
          }
        });
        // console.log("Object keys: ",Object.keys(me.baseOptions.allEpisodeData).length);
        if (index == (me.baseOptions.allEpisodeData.length)-1 && !seasonSelected) {
          var hasclass = document.querySelectorAll('.activeMenuOption')
          if (hasclass && hasclass[0]) {
            hasclass[0].classList.remove('activeMenuOption')
          }
          me.uiEngine.setAllEpisodeSeason(0);
          if (firstMenuOption)
            firstMenuOption.classList.add('activeMenuOption');
        }


        // var qualityname = me.uiEngine.getAllEpisodeSeason();
        // if (me.uiEngine.getAllEpisodeSeason() == index) {
        //   console.log("qualityname",qualityname)
        //   menuOption.classList.add('activeMenuOption');
        // }
        
        menubar.appendChild(menuOption);
        container.appendChild(menubar);



        let isDown = false;
        let startX;
        let scrollLeft;

        menubar.addEventListener('mousedown', (e) => {
          isDown = true;
          // menubar.classList.add('active');
          startX = e.pageX - menubar.offsetLeft;
          scrollLeft = menubar.scrollLeft;
        });
        menubar.addEventListener('mouseleave', () => {
          isDown = false;
          // menubar.classList.remove('active');
        });
        menubar.addEventListener('mouseup', () => {
          isDown = false;
          // menubar.classList.remove('active');
        });
        menubar.addEventListener('mousemove', (e) => {
          if(!isDown) return;
          e.preventDefault();
          const x = e.pageX - menubar.offsetLeft;
          const offset = (x - startX) * 3; //scroll-fast
          menubar.scrollLeft = scrollLeft - offset;
        });

        //for tablet

        menubar.addEventListener('touchstart', (e) => {
          isDown = true;
          startX = e.pageX - menubar.offsetLeft;
          scrollLeft = menubar.scrollLeft;
        });
        menubar.addEventListener('touchend', () => {
          isDown = false;
          
        });
        
        menubar.addEventListener('touchmove', (e) => {
          if(!isDown) return;
          e.preventDefault();
          const x = e.pageX - menubar.offsetLeft;
          const offset = (x - startX) * 3; //scroll-fast
          menubar.scrollLeft = scrollLeft - offset;
        });
        

        menuOption.addEventListener('click', function (event) {


          selectedIndex = parseInt(menuOption.getAttribute('id'));
          selectedSeason = me.baseOptions.allEpisodeData[selectedIndex];
          if (selectedIndex == 4) {
            window.scrollBy(100, 0);
          }

          var hasclass = document.querySelectorAll('.activeMenuOption')
          if (hasclass && hasclass[0]) {
            hasclass[0].classList.remove('activeMenuOption')
          }
          me.uiEngine.setAllEpisodeSeason(selectedIndex);

          menuOption.classList.add('activeMenuOption');
          me.setEpisodes(container, selectedIndex, selectedSeason);
          //me.uiEngine.removeAllEpisode();
          //me.uiEngine.createAllEpisode();
        });
        menuOption.addEventListener('touchstart', function (event) {
          selectedIndex = parseInt(menuOption.getAttribute('id'));
          selectedSeason = me.baseOptions.allEpisodeData[selectedIndex];
          if (selectedIndex == 4) {
            window.scrollBy(100, 0);
          }
          var hasclass = document.querySelectorAll('.activeMenuOption')
          if (hasclass && hasclass[0]) {
            hasclass[0].classList.remove('activeMenuOption')
          }
          me.uiEngine.setAllEpisodeSeason(selectedIndex);
          menuOption.classList.add('activeMenuOption');
          me.setEpisodes(container, selectedIndex, selectedSeason);
        });
      });




      // container.appendChild(episodesImage);
      // container.appendChild(episodeNoLabel);
      // container.appendChild(assetTitleLabel);
      // container.appendChild(descriptionLabel);
      //me.setEpisodes(container, 0, "season 1");
       me.setEpisodes(container, selectedIndex, selectedSeason);

      me.el().appendChild(container);
    },
    setEpisodes: function (container, selectedIndex, selectedSeason) {
      var list = document.getElementById("outerEpisodeContainer");
      if (list)
        container.removeChild(list);
      var outerEpisodeContainer = document.createElement("div");
      outerEpisodeContainer.setAttribute("class", "outerEpisodeContainer");
      outerEpisodeContainer.setAttribute("id", 'outerEpisodeContainer');
      me.baseOptions.allEpisodeData[selectedIndex].contents.forEach(function (element, index) {
        
        let episodeContainer = document.createElement("Label");
        episodeContainer.setAttribute("class", "containerEpisode");
        episodeContainer.setAttribute("episodeId", index);

        if (me.uiEngine.getAllEpisode() == index) {
          episodeContainer.classList.add('activeEpisode');
        }
        let imageContainer = document.createElement('div');
        imageContainer.setAttribute('class', 'imageContainer');
        let episodesImage = document.createElement('img');
        episodesImage.setAttribute("class", "episodesImage");
        if (element && element.images) {
          let imgUrl = element.images[0].cdn_url;
          let variantIndex = element.images[0].variants.indexOf("xs");
          let variant;
          if(variantIndex >= 0){
            variant  =  '_' + element.images[0].variants[variantIndex];
          } else{
            variant = "";
          }
          let variantUrl = imgUrl.replace('.jpg',variant+'.jpg').replace('.png',variant+'.png').replace('.svg',variant+'.svg').replace('.jpeg',variant+'.jpeg')
          episodesImage.src = variantUrl
          imageContainer.appendChild(episodesImage);
        }
        let playImage;

        if (me.baseOptions.contentId != element.content_id) {
          playImage = document.createElement('img');
          playImage.setAttribute("class", "playImage");
          //  playImage.style.backgroundImage="url("+me.options_.playimage.play+")"
           playImage.src=me.options_.icons.play;
          // playImage.src = 'UIComponent/Component/assets/LogiPlayer_icons/ic-play/ic-play-copy-3.svg';
          imageContainer.appendChild(playImage);
          playImage.addEventListener('click', function (event) {
            // element.content_id = me.baseOptions.contentId;       
            me.uiEngine.removeAllEpisode();
            me.sendEvent(element.content_id, me.baseOptions.allEpisodeData[selectedIndex].asset_id);

          });
          playImage.addEventListener('touchstart', function (event) {
            // element.content_id = me.baseOptions.contentId;       
            me.uiEngine.removeAllEpisode();
            me.sendEvent(element.content_id, me.baseOptions.allEpisodeData[selectedIndex].asset_id);

            //me.player.player.trigger({type: 'playnext', bubbles: false})
          });
        }

        if (element.duration) {
          var min = element.duration / 60;
          var prefectMin = Math.round(min);
        }

        let episodeWrapper = document.createElement("div");
        episodeWrapper.setAttribute("class", "episodeWrapper");

        let episodeDetailWrapper = document.createElement("div");
        episodeDetailWrapper.setAttribute("class", "episodeDetailWrapper");

        let episodeNoLabel = document.createElement("label");
        episodeNoLabel.setAttribute("class", "episodeNoLabel");
        episodeNoLabel.innerHTML = element.content_title + " . " + prefectMin + " min";

        let assetTitleLabel = document.createElement("label");
        assetTitleLabel.setAttribute("class", "contentSubTitleLabel");
        if (element.content_sub_title)
        assetTitleLabel.innerHTML = element.content_sub_title;

        let descriptionLabel = document.createElement("label");
        descriptionLabel.setAttribute("class", "descriptionLabel");
        descriptionLabel.innerHTML = element.description;

        let nowWatching = document.createElement("div");
        nowWatching.setAttribute("class", "nowWatching");
        nowWatching.innerHTML = "NOW WATCHING";

        let progressBar = document.createElement("div");
        progressBar.setAttribute("class", "progressBar");
        let myProgress = document.createElement("span");
        myProgress.setAttribute("class", "myProgress");

        let progressPercentage = Math.round((me.player.currentTime() / me.player.duration()) * 100);
        myProgress.style.width = progressPercentage + '%';


        progressBar.appendChild(myProgress);
        imageContainer.appendChild(progressBar);
        episodeDetailWrapper.appendChild(episodeNoLabel);
        episodeDetailWrapper.appendChild(assetTitleLabel);
        episodeDetailWrapper.appendChild(nowWatching)

        episodeWrapper.appendChild(imageContainer);
        episodeWrapper.appendChild(episodeDetailWrapper);

        episodeContainer.appendChild(episodeWrapper);


        episodeContainer.appendChild(descriptionLabel);
        outerEpisodeContainer.appendChild(episodeContainer);
        container.appendChild(outerEpisodeContainer);

        if (me.baseOptions.contentId == element.content_id) {
          nowWatching.style.visibility = "visible";
          progressBar.style.visibility = "visible";
        }
        episodeContainer.addEventListener('click', function (e) {
          let nextContentId = element.content_id;
          let nextAssetId = element.asset_id;
          let selectedIndex = episodeContainer.getAttribute("episodeId");
          var hasclass = document.querySelectorAll('.activeEpisode')
          if (hasclass && hasclass[0]) {
            hasclass[0].classList.remove('activeEpisode')
          }
          me.uiEngine.setAllEpisode(selectedIndex);
          episodeContainer.classList.add('activeEpisode');
          // me.sendEvent(nextContentId, nextAssetId);
          // window.scrollTo(0,100);
        });
      });
      me.el().appendChild(container);
    },
    sendEvent: function (nextContentId, nextAssetId) {
      var data = {
        nextContentId: nextContentId,
        nextAssetId: nextAssetId
      };
      var eventName = 'onEpisodeSelected';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
    createEl: function () {
      this.elementRef = videojs.dom.createEl('div', {
        className: 'logituit_allEpisode'
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
  videojs.registerComponent('allEpisode', this.allEpisode);
}