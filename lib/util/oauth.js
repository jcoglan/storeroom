'use strict';

var crypto  = require('vault-cipher').crypto,
    Promise = require('./promise'),
    qs      = require('./querystring');

module.exports = {
  openWindow(url, params, options) {
    var callback = '__cb__' + crypto.randomBytes(16).toString('hex');
    params.state = callback;

    url += (/\?/.test(url) ? '&' : '?') + qs.stringify(params);

    var props  = { width: options.width, height: options.height };
    props.left = (screen.width  - props.width)  / 2;
    props.top  = (screen.height - props.height) / 2.4;
    props      = Object.keys(props).map(function(k) { return k + '=' + props[k] }).join(',');

    return new Promise(function(resolve, reject) {
      window[callback] = function(response) {
        try {
          delete window[callback];
        } catch (error) {
          window[callback] = undefined;
        }

        if (response.error)
          return reject(new Error(response.error_description || response.error));

        resolve(response);
      };

      open(url, 'storeroom-popup-window', props);
    });
  }
};
