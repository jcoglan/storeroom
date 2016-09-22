'use strict';

var qs = require('./querystring');

module.exports = function(url, params, options) {
  url += (/\?/.test(url) ? '&' : '?') + qs.stringify(params);

  var props  = {width: options.width, height: options.height};
  props.left = (screen.width  - props.width)  / 2;
  props.top  = (screen.height - props.height) / 2.4;
  props      = Object.keys(props).map(function(k) { return k + '=' + props[k] }).join(',');

  open(url, 'storeroom-popup-window', props);
};
