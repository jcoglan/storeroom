'use strict';

const request = require('./request');

module.exports = {
  del(url, params, headers) {
    return request('DELETE', url, params, headers);
  },

  get(url, params, headers) {
    return request('GET', url, params, headers);
  },

  post(url, params, headers) {
    return request('POST', url, params, headers);
  },

  put(url, params, headers) {
    return request('PUT', url, params, headers);
  }
};
