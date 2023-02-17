/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
// function logituitSubtitleEngine(){
var ClickableComponent = videojs.getComponent('ClickableComponent');
var me;
var hindi;
var english;
var Auto;
var isoMap = new Map();
var player;
isoMap.set("in-HI","Hindi")
isoMap.set("in-GU","Gujrati")
isoMap.set("in-TE","Telugu")
isoMap.set("in-TA","Tamil")
isoMap.set("in-KA","Kanada")
isoMap.set("ara","Arabic")
isoMap.set("eng","English")
isoMap.set("hi","Hindi")
isoMap.set("en","English")

 var subtitleAudioTVComponent = videojs.extend(ClickableComponent, {
  constructor: function (player, options,updatesubtitle) {
    me = this;
    player = player;
    ClickableComponent.apply(this, arguments);
    this.updateTextContent(options.text)
    this.applyStyles({
      'style': `border-radius: 6px;
                    -webkit-backdrop-filter: blur(10px);
                    backdrop-filter: blur(10px);
                    background-color: #171f2c;
                    padding: 47px;
                    position: absolute;
                    width: 28%;      
                    height: 100%;     
                    left:72%;
                    z-index:99;
                    font-size:25px;
                    margin-bottom: 23%!important;
                    opacity: 1;`
    })
   

    this.audioTitle();
    this.audioTV();
    this.subtitlesTitle();
    this.subtitleTV();
  },
  createEl: function () {
    return videojs.createEl('div', {
      className: 'logituit_SUBTITLEtv'
    });
  },
  // updatesubtitle:function(){
  //   this.audioTitle();
  //   this.audioTV();
  //   this.subtitlesTitle();
  //   this.subtitleTV();
  // },
  

  audioTitle: function () {
    var audiotitle = document.createElement("span");
    audiotitle.innerHTML = "audio";
    audiotitle.style.top = "9.3%";
    audiotitle.style.position = "absolute";
    audiotitle.style.marginLeft = "-40%";
    audiotitle.style.opacity = "0.5";
    audiotitle.style.fontSize = "20px";
    this.el().appendChild(audiotitle);
  },

  subtitlesTitle: function () {
    var audiotitle = document.createElement("span");
    audiotitle.innerHTML = "subtitles";
    audiotitle.style.top = "40.7%";
    audiotitle.style.position = "absolute";
    audiotitle.style.marginLeft = "-40%";
    audiotitle.style.opacity = "0.5";
    audiotitle.style.fontSize = "20px";
    this.el().appendChild(audiotitle);
  },

  audioTV: function () {
    // setTimeout(function () {
      var NewAudio;
      var Audiocontainer = document.createElement("div");
      Audiocontainer.setAttribute("class", "Audiocontainer");
      Audiocontainer.style.marginTop = "15.7%";
      Audiocontainer.style.height = "27.3%";
      Audiocontainer.style.width = "74%";
      Audiocontainer.style.display = "grid";
      Audiocontainer.style.overflowY = "scroll";

      Audiocontainer.style.position = "absolute";
      // var audioTrack=me.player.audioTracks()
      
      // for (i = 0; i <audioTrack.tracks_.length; i++) {
      //   Audiobutton = document.createElement("div")
      //   Audiobutton.setAttribute("class", "Audiobutton")
      //   Audiobutton.innerHTML = isoMap.get(audioTrack.tracks_[i].language);
      //   Audiobutton.style.fontSize = "1.45vw";
      //   Audiobutton.style.fontFamily = "ProximaNova-Semibold";
      //   //Audiobutton.style.top="14.1%";
      //   Audiobutton.style.position = "relative";
      //   Audiobutton.style.marginTop = "2%";

      //   Audiobutton.style.paddingTop = "3%";
      //   Audiobutton.style.paddingbottom = "2%";

      //   Audiobutton.setAttribute("id", isoMap.get(audioTrack.tracks_[i].language));
      //   Audiobutton.style.width = "100%";
      //   // Audiobutton.style.height = "100%";
      //   Audiobutton.style.paddingLeft = "5%";
      //   Audiobutton.style.display = "flex";
      //   Audiobutton.style.color = "#d8d8d8";
      //   // Audiobutton.classList.add("select_quality")
      //   Audiobutton.addEventListener('click', (e) => {
      //     // Audiobutton.classList.add("select_subtitle")

      //     var audioTrack=me.player.audioTracks()
      //     for (var j = 0; j <audioTrack.tracks_.length; j++) {
      //       // if (audioTrack.tracks_[j].label !== "") {
      //       var audiolabel = audioTrack.tracks_[j];
      //       if (isoMap.get(audiolabel.language) == e.srcElement.innerText){
      //         audiolabel.enabled=true;
      //         NewAudio = audiolabel.label;
              
      //       }
      //     // }
      //     // var toggleAudio = document.getElementsByClassName("select_audio")[0];
      //     // if (toggleAudio) {
      //     //   toggleAudio.classList.remove("select_audio")
      //     // }
      //     $(".select_audio").removeClass("select_audio");
      //     // e.target.classList.add("select_audio");
      //     var Audiobutton = document.getElementsByClassName("Audiobutton")[0]
      //     for (var i = 0; i < Audiobutton.length; i++) {
      //       Audiobutton[i].classList.remove("select_audio")
      //     }
      //     e.target.classList.add("select_audio");
      //   }
         
      //   });

      //   Audiocontainer.appendChild(Audiobutton);
      // }
      me.el().appendChild(Audiocontainer);
    // }, 7000)
  },

  subtitleTV: function (e) {
    // setTimeout(function () {

      var prevSubtitle;
      var NewSubtitle;
      var subtitleObject = {};
      var subtitleExist = false;

      var Subtitlecontainer = document.createElement("div");
      Subtitlecontainer.setAttribute("class", "Subtitlecontainer");
      Subtitlecontainer.style.marginTop = "78.7%";
      Subtitlecontainer.style.height = "5.3%";
      Subtitlecontainer.style.width = "74%";
      Subtitlecontainer.style.position = "absolute";
      // let tracks = me.player.textTracks();
      // // tracks.tracks_.reverse()
     
      // var Subtitlebutton = document.createElement("div")
      // Subtitlebutton.setAttribute("class", "Subtitlebutton")
      // Subtitlebutton.innerHTML = "Off";
      // Subtitlebutton.style.fontSize = "1.45vw";
      // Subtitlebutton.style.fontFamily = "ProximaNova-Semibold";
      // Subtitlebutton.style.position = "relative";
      // Subtitlebutton.style.textAlign = "left";
      // Subtitlebutton.style.paddingTop = "4%";

      // Subtitlebutton.style.paddingLeft = "5%";
      // Subtitlebutton.style.height = "100%";
      // Subtitlebutton.style.color = "#d8d8d8";
      // Subtitlebutton.style.marginTop = "2%";
      // Subtitlebutton.classList.add("select_subtitle")
      // var subtitleLabel_tv = sessionStorage.getItem("subtitleLabel_Tv")
      // Subtitlebutton.addEventListener('click', (e) => {
      //   for (var i = 1; i <= tracks.tracks_.length - 1; i++) {
      //     var subtitlelabel = tracks.tracks_[i];
      //     if (subtitlelabel.mode == "showing") {
      //       subtitlelabel.mode = "hidden";
      //     }
      //   }
      //   // var togglesubtitle = document.getElementsByClassName("select_subtitle")[0];
      //   // if (togglesubtitle) {
      //   //   togglesubtitle.classList.remove("select_subtitle")
      //   // }
      //   $(".select_subtitle").removeClass("select_subtitle");
      //   e.target.classList.add("select_subtitle");
      //   var subtitlebutton = document.getElementsByClassName("Subtitlebutton")
      //   for (var i = 0; i < subtitlebutton.length; i++) {
      //     subtitlebutton[i].classList.remove("select_subtitle")
      //   }
      //   e.target.classList.add("select_subtitle");
      // });
      // Subtitlecontainer.appendChild(Subtitlebutton);

      // for (var i = 0; i <= tracks.tracks_.length - 1; i++) {
      //   if (tracks.tracks_[i].language !== "" && tracks.tracks_[i].language !== "undefined") {
      //     var captionlabel = tracks.tracks_[i]
      //     var subtitleallbutton = document.createElement("div")
      //     subtitleallbutton.setAttribute("class", "subtitleallbutton")
      //     subtitleallbutton.innerHTML = tracks.tracks_[i].label;

      //     subtitleallbutton.style.fontSize = "1.45vw";
      //     subtitleallbutton.style.fontFamily = "ProximaNova-Semibold";
      //     subtitleallbutton.style.position = "relative";
      //     subtitleallbutton.style.textAlign = "left";
      //     subtitleallbutton.style.paddingTop = "4%";
      //     subtitleallbutton.style.height = "100%";
      //     subtitleallbutton.style.paddingLeft = "5%";
      //     subtitleallbutton.style.color = "#d8d8d8";
      //     subtitleallbutton.style.display = "flex";


      //     subtitleallbutton.setAttribute("id", tracks.tracks_[i].label);
      //     var captionlabel = tracks.tracks_[i];
      //     if (captionlabel.mode != "hidden") {
      //       subtitleExist = true;
      //       subtitleallbutton.innerHTML = captionlabel.label;
      //       if (captionlabel.mode == "showing") {
      //         prevSubtitle = captionlabel.label;
      //       }
      //     }

      //     subtitleallbutton.addEventListener('click', (e) => {
      //       subtitleObject = {
      //         type: "video_subtitle_selected",
      //         previousSubtitle: prevSubtitle,
      //         selectedSubtitle: e.srcElement.innerText,
      //       }
      //       for (var i = 0; i <= tracks.tracks_.length - 1; i++) {
      //         if (tracks.tracks_[i].language !== "" && tracks.tracks_[i].language !== "undefined") {
      //           var subtitlelabel = tracks.tracks_[i];
      //           if (subtitlelabel.label == e.srcElement.innerText) {
      //             subtitlelabel.mode = "showing";
      //             NewSubtitle = subtitlelabel.label;
      //           }
      //           else if (subtitlelabel.mode == "showing") {
      //             subtitlelabel.mode = "disabled";
      //           }
      //         }
      //       }
      //       var togglevideoquality = document.getElementsByClassName("select_subtitle")[0];
      //       if (togglevideoquality) {
      //         togglevideoquality.classList.remove("select_subtitle")
      //       }
      //       e.target.classList.add("select_subtitle");
      //       var videoqualitybutton = document.getElementsByClassName("subtitleallbutton")
      //       for (var i = 0; i < videoqualitybutton.length; i++) {
      //         videoqualitybutton[i].classList.remove("select_subtitle")
      //       }
      //       e.target.classList.add("select_subtitle");

      //       // alert("hii")
      //     });
      //     Subtitlecontainer.appendChild(subtitleallbutton);
      //   }
      // }
      me.el().appendChild(Subtitlecontainer);
    // }, 3000);
  },



  updateTextContent: function (text) {
    if (typeof text !== 'string') {
      text = '';
    }
    videojs.emptyEl(this.el());
    videojs.appendContent(this.el(), text);
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

  addSubtitleAudioChildrenComponent: function (child) {
    this.addChild(child)
  }
});
videojs.registerComponent('subtitleAudioTVComponent', subtitleAudioTVComponent);

var subtitleAudioChildComponent = videojs.extend(ClickableComponent, {
  constructor: function (player, options) {
    ClickableComponent.apply(this, arguments);
    this.applyStyles(options);
    this.updateTextContent(options.text);
    //this.Language();
  },
  createEl: function () {
    return videojs.createEl('div', {
      className: ''
    });
  },
  handleClick: function () {
    // updatesubtitle()
    // hindi.removeClass("select_quality")
    // english.removeClass("select_quality")
    // this.setClass("select_quality")
  },


  updateTextContent: function (text) {
    if (typeof text !== 'string') {
      text = 'Title Unknown';
    }
    videojs.emptyEl(this.el());
    videojs.appendContent(this.el(), text);
  },
  applyStyles: function (options) {
    var element = this.el();
    if (element) {
      //element.setAttribute(); 
    }
    for (key in options) {
      if (element) {
        element.setAttribute(key, options[key]);
      }
    }
  },
  addSubtitleAudioChildrenComponent: function (childArr) {

  },
  setClass: function (className) {
    this.el().setAttribute("class", className);
  },
  setID: function (idName) {
    this.el().setAttribute("id", idName);
  }
});

videojs.registerComponent('subtitleAudioChildComponent', subtitleAudioChildComponent);

// }