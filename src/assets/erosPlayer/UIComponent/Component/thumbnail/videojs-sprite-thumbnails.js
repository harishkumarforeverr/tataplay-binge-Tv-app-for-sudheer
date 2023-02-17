/*! @name videojs-sprite-thumbnails @version 0.5.2 @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = global || self, global.videojsSpriteThumbnails = factory(global.videojs));
}(this, function (videojs) { 'use strict';

  videojs = videojs && videojs.hasOwnProperty('default') ? videojs['default'] : videojs;

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  /**
   * Set up sprite thumbnails for a player.
   *
   * @function spriteThumbs
   * @param {Player} player
   *        The current player instance.
   * @param {Object} options
   *        Configuration options.
   */

  function spriteThumbs(player, options) {
    var url = options.url;
    var height = options.height;
    var width = options.width;
    var responsive = options.responsive;
    var dom = videojs.dom || videojs;
    var controls = options.ele;
    var progress = options.ele;
    var seekBar = progress;
    var customScale = options.customScale;
    //var mouseTimeDisplay = options.control.children[1];
    var mouseTimeDisplay = seekBar.mouseTimeDisplay;
    var customScaleW = options.customScaleW;
    var customScaleH = options.customScaleH;
    var additionalMargin = options.additionalMargin || 0;
    var supportedOrientation = options.supportedOrientation || null;
    var thumbnailDisplayTimeout = options.thumbnailDisplayTimeout || 5000;
    var thumbnailDisplayTimer = null;
    var isTouchEnabled = false;

    if (url && height && width && mouseTimeDisplay) {
      var img = dom.createEl('img', {
        src: url
      });

      var tooltipStyle = function tooltipStyle(obj) {
        Object.keys(obj).forEach(function (key) {
          var val = obj[key];
          var ttstyle = mouseTimeDisplay.timeTooltip.el_.style;

          if (val !== '') {
            ttstyle.setProperty(key, val);
          } else {
            ttstyle.removeProperty(key);
          }
        });
      };

      var clearThumbnail = function(){
        clearTimeout(thumbnailDisplayTimer);
        thumbnailDisplayTimer= setTimeout(function(){
          if(mouseTimeDisplay)
          mouseTimeDisplay.el().style.display='none';  
        },thumbnailDisplayTimeout)       
      // return;
      }

      function isTouchDevice() {
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var mq = function (query) {
            return window.matchMedia(query).matches;
        }
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }
        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
      }
      isTouchEnabled = isTouchDevice(); 

      var formatTime = function(val){
        return (Math.floor(val/3600))+":"+padZero(Math.floor((val%3600)/60))+":"+padZero(Math.floor(val%60));
      }
    
      var padZero = function(val){
        if((val.toString()).length==1)
            return '0'+val;
        return val;
    }
    
      var getPercentage = function(e){
        if(!isTouchEnabled){
          var percentage = parseFloat(e.clientX);
          percentage = player.duration() * (percentage / seekBar.el_.clientWidth);
          // Logger.error('web',percentage)
          return percentage
        }
        else{
          var percentage = player.duration() * (e.touches[0].clientX - seekBar.el_.offsetLeft) / seekBar.el_.offsetWidth;
          seekBar.el_.children[2].style.width = percentage + '%';
          const timerText = document.querySelector('.vjs-time-tooltip');
          if(timerText){
            var time = percentage * player.duration() / 100;
            timerText.innerHTML = formatTime(time);
            var seekbarOffset = (e.touches[0].clientX - seekBar.el_.offsetLeft) / seekBar.el_.offsetWidth * 100;
            timerText.parentElement.style.left = seekbarOffset + '%';
          }
          // Logger.error('mweb',percentage)

          return percentage;
        }
      }

      var hijackMouseTooltip = function hijackMouseTooltip(e) {
        // clearTimeout(thumbnailDisplayTimer);
        if(supportedOrientation && !(window.matchMedia("(orientation: "+supportedOrientation+")").matches)){
          if(mouseTimeDisplay)
            mouseTimeDisplay.el().style.display='none';  
          return;
        }
        mouseTimeDisplay.el().style.display='block';
        var imgWidth = img.naturalWidth;
        var imgHeight = img.naturalHeight;

        var scaledWidth, scaledHeight, cleft, ctop, bgSize ;

        if (imgWidth && imgHeight) {
          var seekBarEl = seekBar.el_;
          var hoverPosition;
          try{
            hoverPosition = getPercentage(e)
            // Logger.error('try',hoverPosition)
          }
          catch(error){
            // Logger.error(error)
            hoverPosition = parseFloat(mouseTimeDisplay.el_.style.left);
            hoverPosition = player.duration() * (hoverPosition / seekBar.el_.clientWidth);
            // Logger.error('error',hoverPosition)
          }
          // Logger.error('final',hoverPosition)
          if (!isNaN(hoverPosition)) {
            hoverPosition = hoverPosition / options.interval;
            var playerWidth = player.el_.clientWidth;
            var scaleFactor = responsive && playerWidth < responsive ? playerWidth / responsive : 1;
            if(customScale && customScale>0)
              scaleFactor = customScale;
            var columns = imgWidth / width;

            if(customScaleH && customScaleW){
              scaledWidth = width * customScaleW;
              scaledHeight = height * customScaleH;
              cleft = Math.floor(hoverPosition % columns) * -scaledWidth;
              ctop = Math.floor(hoverPosition / columns) * -scaledHeight;
              bgSize = imgWidth * customScaleW + 'px ' + imgHeight * customScaleH + 'px';
            }
            else{
              scaledWidth = width * scaleFactor;
              scaledHeight = height * scaleFactor;
              cleft = Math.floor(hoverPosition % columns) * -scaledWidth;
              ctop = Math.floor(hoverPosition / columns) * -scaledHeight;
              bgSize = imgWidth * scaleFactor + 'px ' + imgHeight * scaleFactor + 'px';
            }
            
            var controlsTop = dom.getBoundingClientRect(controls.el_).top;
            var seekBarTop = dom.getBoundingClientRect(seekBarEl).top; // top of seekBar is 0 position

            // for additional margin
            var topOffset = -scaledHeight - Math.max(0, seekBarTop - controlsTop)- additionalMargin;
            tooltipStyle({
              'width': scaledWidth + 'px',
              'height': scaledHeight + 'px',
              'background-image': 'linear-gradient(transparent 80%,black) , url(' + url + ')',
              'background-repeat': 'no-repeat',
              'background-position': cleft + 'px ' + ctop + 'px',
              'background-size': bgSize,
              'top': topOffset + 'px',
              'color': '#fff',
              'text-shadow': '1px 1px #000',
              'border':'1px solid black',
              'border-bottom':'26px solid',
              'border-image': 'linear-gradient(180deg, rgba(255, 255, 255, 0.0)60%, rgba(16, 16, 16, 0.95))40%',              
              'margin': '0 1px',
              'line-height' : (scaledHeight * 2 - 40) + 'px',
              'visibility':'visible',
              'left':(e.clientX-250) + 'px'
            });
          }
        }
      };

      tooltipStyle({
        'width': '',
        'height': '',
        'background-image': '',
        'background-repeat': '',
        'background-position': '',
        'background-size': '',
        'top': '',
        'color': '',
        'text-shadow': '',
        'border': '',
        'margin': '',
        'visibility':''
      });

      var hijackMouseTooltipOut = function hijackMouseTooltipOut(e) {
        tooltipStyle({
          'width': '',
          'height': '',
          'background-image': '',
          'background-repeat': '',
          'background-position': '',
          'background-size': '',
          'top': '',
          'color': '',
          'text-shadow': '',
          'border': '',
          'margin': '',
          'visibility':'hidden'
        });
      }
      progress.on('mousemove', hijackMouseTooltip);
      progress.on('mouseout', hijackMouseTooltipOut)
      progress.on('touchmove', hijackMouseTooltip);
      progress.on('touchstart', hijackMouseTooltip);
      progress.on('touchend', clearThumbnail);
      player.addClass('vjs-sprite-thumbnails');
    }
  }

  var version = "0.5.2";

  var Plugin = videojs.getPlugin('plugin');
  /**
   * Default plugin options
   *
   * @param {String} url
   *        Sprite location. Must be set by user.
   * @param {Integer} width
   *        Width in pixels of a thumbnail. Must be set by user.
   * @param {Integer} height
   *        Height in pixels of a thumbnail. Must be set by user.
   * @param {Number} interval
   *        Interval between thumbnail frames in seconds. Default: 1.
   * @param {Integer} responsive
   *        Width of player below which thumbnails are reponsive. Default: 600.
   */

  var defaults = {
    url: '',
    width: 0,
    height: 0,
    interval: 1,
    responsive: 600
  };
  /**
   * An advanced Video.js plugin. For more information on the API
   *
   * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
   */

  var SpriteThumbnails =
  /*#__PURE__*/
  function (_Plugin) {
    _inheritsLoose(SpriteThumbnails, _Plugin);

    /**
     * Create a SpriteThumbnails plugin instance.
     *
     * @param  {Player} player
     *         A Video.js Player instance.
     *
     * @param  {Object} [options]
     *         An optional options object.
     */
    function SpriteThumbnails(player, options) {
      var _this;

      // the parent class will add player under this.player
      _this = _Plugin.call(this, player) || this;
      _this.options = videojs.mergeOptions(defaults, options);

      _this.player.ready(function () {
        spriteThumbs(_this.player, _this.options);
      });

      return _this;
    }

    return SpriteThumbnails;
  }(Plugin); // Define default values for the plugin's `state` object here.


  SpriteThumbnails.defaultState = {}; // Include the version number.

  SpriteThumbnails.VERSION = version; // Register the plugin with video.js.

  videojs.registerPlugin('spriteThumbnails', SpriteThumbnails);

  return SpriteThumbnails;

}));
