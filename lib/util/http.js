'use strict';

var request = require('./request');

module.exports = {
  del: function(url, params, headers) {
    return request('DELETE', url, params, headers);
  },

  get: function(url, params, headers) {
    return request('GET', url, params, headers);
  },

  post: function(url, params, headers) {
    return request('POST', url, params, headers);
  },

  put: function(url, params, headers) {
    return request('PUT', url, params, headers);
  }
};
