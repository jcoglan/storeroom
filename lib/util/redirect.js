'use strict';

var qs = require('./querystring');

module.exports = function(endpoint, params) {
  var sep = /\?/.test(endpoint) ? '&' : '?';
  location.href = endpoint + sep + qs.stringify(params);
};
