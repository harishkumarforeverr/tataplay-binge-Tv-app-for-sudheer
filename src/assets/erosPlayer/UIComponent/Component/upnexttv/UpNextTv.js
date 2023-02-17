

function loguituitupnextTvComponent() {
    // var Button = videojs.getComponent('Button');
    // var opt;
    var me;
    this.upnextButton = videojs.extend(videojs.getComponent('Button'), {
      constructor: function(player,option, uiEngine) {
        videojs.getComponent('Button').apply(this, arguments);
        this.opt = option;
        this.applyStyles(option.styleCSS);
        this.updateTextContent(option.text)
        this.elementRef;
        this.uiEngine = uiEngine;
        this.player = player;
        this.seekbartv();
      },
       createEl: function() {
       this.elementRef = videojs.dom.createEl('button', {
         className:'UpnextTv'
       });
       return this.elementRef;
     },

     seekbartv:function(){
        var seekbar= document.createElement("div")
        seekbar.setAttribute("class","seekbarLive");

        var upnextimage=document.createElement("div")
        upnextimage.setAttribute("class","upnextimage")
         upnextimage.innerHTML = '<img class="logix-skipIntro-icon" src="player/assets/player_assets/ic-backbuttontv/flesh.jpg">'
        //  upnextimage.src=playbackData.nextContent[0].images[0].storage_path
        // playbackData.nextContent[0].images[0].storage_path

        // upnextimage.style.width="93.4%";
        // upnextimage.style.height="40%";
        // upnextimage.style.backgroundColor="blue";
        // upnextimage.style.marginLeft="1.3%";
        // upnextimage.style.position="absolute";
        // upnextimage.style.top="-23%";
        // upnextimage.style.borderRadius="10px";

        var upnexttext=document.createElement("div")
        upnexttext.setAttribute("class","upnexttext")
        upnexttext.innerHTML="UP NEXT"
        // upnexttext.style.fontSize="20px"
        // upnexttext.style.position="absolute";
        // upnexttext.style.top="24.4%";
        // upnexttext.style.marginLeft="6.9%";

        var flipttext=document.createElement("div")
        flipttext.setAttribute("class","flipttext")
        flipttext.innerHTML=playbackData.nextContent[0].asset_title;
        // flipttext.style.fontSize="24px"
        // flipttext.style.position="absolute";
        // flipttext.style.top="31.8%";
        // flipttext.style.marginLeft="6.9%";

        var seasontext=document.createElement("div")
        seasontext.setAttribute("class","seasontext")
        seasontext.innerHTML=playbackData.nextContent[0].content_title
        // seasontext.style.fontSize="20px"
        // seasontext.style.position="absolute";
        // seasontext.style.top="40.1%";
        
        // seasontext.style.width="71.2%";
        // seasontext.style.height="39.1%";

        var playlogo=document.createElement("div")
        playlogo.setAttribute("class","playlogo")
        // playlogo.style.backgroundImage='url(player/assets/player_assets/ic-backbuttontv/ic_next.png);'
        playlogo.innerHTML = '<img class="logix-skipIntro-icon" src="player/assets/player_assets/ic-backbuttontv/cta_play.png">'
        // playlogo.style.position="absolute";
        // playlogo.style.top="56.2%";
        // playlogo.style.marginLeft="6.9%";

        var playinginText=document.createElement("div")
        playinginText.setAttribute("class","playinginText")
        // playinginText.innerHTML="Playing in 4 sec"
        // playinginText.style.fontSize="20px"
        // playinginText.style.position="absolute";
        // playinginText.style.top="56.2%";
        // playinginText.style.marginLeft="25.3%";
       

        var hidebutton=document.createElement("div")
        hidebutton.setAttribute("class","hidebutton")
        hidebutton.innerHTML="Hide"
        // hidebutton.style.fontSize="20px"
        // hidebutton.style.position="absolute";
        // hidebutton.style.top="76%";
        // hidebutton.style.marginLeft="6.9%";
        // hidebutton.style.backgroundColor="white";
        // hidebutton.style.color="black";
        // hidebutton.style.width="60.3%";
        // hidebutton.style.height="16.6%";
        // hidebutton.style.borderRadius="10px";
        // hidebutton.style.display="flex";
        // hidebutton.style.alignItems="center";
        // hidebutton.style.justifyContent="center";

       







        // seekbar.style.width="80%";
        // seekbar.style.height="9%";
        // seekbar.style.backgroundColor="#40c6b6";
        // seekbar.style.position="absolute";
        // seekbar.style.display="block"
        // var seekbardot=document.createElement("div")
        // seekbardot.setAttribute("class","seekbardot")
        // seekbardot.style.width="17px"
        // seekbardot.style.height="16px"
        // seekbardot.style.backgroundColor="white"
        // seekbardot.style.borderRadius="50%"
        // seekbardot.style.marginTop="-5px"
        // seekbardot.style.marginLeft="99%"
        // seekbar.appendChild(seekbardot)

        seekbar.appendChild(upnextimage)
        seekbar.appendChild(upnexttext)
        seekbar.appendChild(flipttext)
        seekbar.appendChild(seasontext)
        seekbar.appendChild(playlogo)
        seekbar.appendChild(playinginText)
        seekbar.appendChild(hidebutton)
         if(navigator.userAgent.indexOf("Tizen")>-1 || navigator.userAgent.indexOf("web0S")>-1){
        this.el().appendChild(seekbar);
     }
    },
     sendEvent: function(rewindTime) {
      var data = {
        currentTime: me.player.currentTime(),
        seekTime: me.player.currentTime()-rewindTime
      };
      var eventName = 'onRewindButtonClick';
      var evt = new CustomEvent(eventName, {
        detail: data,
      });
      this.uiEngine.reportEventToUiEngine(evt);
    },
      handleClick: function() {
        let rewindTime = 10;
        if(this.opt.rewindTime) {
          rewindTime = this.opt.rewindTime;
        }
        me.player.currentTime(me.player.currentTime() - 10);
        this.sendEvent(rewindTime);
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
    releaseResource: function() {
      //releasing the resources
      if (this.elementRef) {
        delete this.elementRef;
        this.elementRef = null;
        delete this.upnextButton;
        this.upnextButton = null;
      }
    }
    });
    videojs.registerComponent('upnextButton', this.upnextButton);
    }