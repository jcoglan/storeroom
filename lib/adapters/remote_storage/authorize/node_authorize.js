'use strict';

var oauth   = require('remotestorage-oauth'),
    Promise = require('../../../util/promise');

module.exports = function(endpoint, client, scopes, options) {
  return new Promise(function(resolve, reject) {
    oauth.authorize(endpoint, client, scopes, options, function(error, token) {
      if (error) reject(error);
      else resolve(token);
    });
  });
};
