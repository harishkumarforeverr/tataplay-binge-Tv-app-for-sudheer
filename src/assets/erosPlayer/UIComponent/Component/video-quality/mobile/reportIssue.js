function logituitMobileReportIssuePopup() {
    var me;
    this.reportAnIssue =videojs.extend(videojs.getComponent('ClickableComponent'), {
        constructor: function(player, options,wrapper, baseOptions, uiEngine) {
      
          ClickableComponent.apply(this, arguments);  
          me=this;
          this.uiEngine = uiEngine;
          opt = options;
          this.options = options;
          me.isPortrait = !me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
          me.isLandscape = me.uiEngine.isLandscape() && (me.uiEngine.isMobile() || me.uiEngine.isIPad() || me.uiEngine.isTablet());
          if (me.isLandscape && (window.screen.width <=920
            || (window.screen.width <=1366 && me.isIPad()))) {
              this.applyStyles(options.option.styleCSSReportIssue);
              
          } else if(me.isPortrait || me.isPortrait && me.isIPad()) {
              reportheight = screen.height - 400;
              // options.option.styleCSSReportIssue.style.top = reportheight + "px;";
              this.applyStyles(options.option.styleCSSReportIssue);     
          }
          
          let containerData = document.createElement("div");
          let containerTitle = document.createElement("Label");
          containerTitle.innerHTML= "Report an issue";
          containerTitle.setAttribute("class", "containerTitle");
          containerTitle.style.fontSize="20px";
      
          let icon_span = document.createElement("span");
          icon_span.style.backgroundImage= "url(UIComponent/Component/assets/LogiPlayer_iconsPortrait/asset_arrow/ic-arrow.png)";
          icon_span.style.width ="8%";
          icon_span.style.height="10%";
          icon_span.style.display="flex";
          icon_span.style.backgroundRepeat = "no-repeat";
          icon_span.style.marginLeft = '5%';
          icon_span.style.top = '8.7%';
          icon_span.style.position = "absolute";
          // icon_span.style.backgroundSize = "contain";
      
            containerData.appendChild(icon_span)
            containerData.appendChild(containerTitle)
      
            let reportDataSubhead = document.createElement("div");
            reportDataSubhead.setAttribute("class", "reportdata");
            reportDataSubhead.innerHTML= "If you are facing troubles with";
           
            let reportContainer = document.createElement("ul");
            reportContainer.setAttribute("class", "reportdataul");
            let reportContData1 = document.createElement("li");
            reportContData1.innerHTML= "video playback";
            reportContainer.appendChild(reportContData1);
      
            let reportContData2 = document.createElement("li");
            reportContData2.innerHTML= "Sound";
            reportContainer.appendChild(reportContData2);
      
            let reportContData3 = document.createElement("li");
            reportContData3.innerHTML= "Buffering";
            reportContainer.appendChild(reportContData3);
      
            let reportContData4 = document.createElement("li");
            reportContData4.innerHTML= "Other issues";
            reportContainer.appendChild(reportContData4);
          
            let br = document.createElement("br");
            
            let reportbutton = document.createElement("button");
            reportbutton.setAttribute("class", "reportbutton");
            reportbutton.innerHTML= "Report";
      
            
            containerData.appendChild(reportDataSubhead)
            containerData.appendChild(reportContainer)
            containerData.appendChild(reportbutton)
            
            
            icon_span.addEventListener('touchstart', function (e) {
                me.uiEngine.removeMobileReportPopup();
                me.uiEngine.addMobileSettingsPopup(me.options.option);
            });
          
          
          me.el().appendChild(containerData);
          window.addEventListener("click", function(event) {
            var targetElement = event.target;
            if(targetElement != me.el()){
              me.uiEngine.removeMobileReportPopup();
            }
          });
        },
        createEl: function() {
          return videojs.dom.createEl('div', {
            className:''
          });
        },
        sendEvent: function() {
          var data = {
            reposrtIssue: true
          };
          var eventName = 'reportIssueClicked';
          var evt = new CustomEvent(eventName, {
            detail: data,
          });
          me.uiEngine.reportEventToUiEngine(evt);
        },
        releaseResource: function () {
            //releasing the resources
            if (this.elementRef) {
                delete this.elementRef;
                this.elementRef = null;
                delete this.mobileVideoQuality;
                this.mobileVideoQuality = null;
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
        applyStyles: function (options) {
            var element = this.el();
            if (element) {
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
      
      videojs.registerComponent('reportAnIssue', this.reportAnIssue);
      
      
}
