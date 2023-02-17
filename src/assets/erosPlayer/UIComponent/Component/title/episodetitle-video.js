/**
 * @license
 * logix player
 * @version 1.0
 * @copyright © 2020 Emtarang Techlabs Private Limited All Rights Reserved
 */
function logituitEpisodeTitleBarComponent() {
	// var Component = videojs.getComponent('Component');

	this.episodetitleBar = videojs.extend(videojs.getComponent('Component'), {
		constructor: function (player, options) {
			videojs.getComponent('Component').apply(this, arguments);
			this.applyStyles(options.styleCSS);
			this.updateTextContent(options.text);
			this.elementRef;
		},
		isTablet : function(){
			const userAgent = navigator.userAgent.toLowerCase();
			const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
			return isTablet;
		  },
		createEl: function (arg) {
			this.elementRef = videojs.dom.createEl('div', {
				className: 'logituit_vjs-episode-title-bar'
			});
		// 	if (window.matchMedia("(orientation: portrait)").matches) {
		// 		this.elementRef = videojs.dom.createEl('div', {
		// 			className: 'logituit_vjs-episode-title-bar logituit_vjs-episode-title-bar-portrait'
		// 		});
		//  }
			return this.elementRef;
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
			if(this.isTablet())
			{ 
			//    var episodeTitle;
			//     episodeTitle=document.getElementsByClassName("logituit_vjs-episode-title-bar");
				element.style.top="calc(8.0% + 15px)";
			}
		},
		releaseResource: function () {
			//releasing the resources
			if (this.elementRef) {
				delete this.elementRef;
				this.elementRef = null;
				delete this.episodetitleBar;
				this.episodetitleBar = null;
			}
		}
	});
	videojs.registerComponent('episodeTitleBar', this.episodetitleBar);
}