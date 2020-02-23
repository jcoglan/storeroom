'use strict';

var discover = require('../discover'),
    oauth    = require('remotestorage-oauth'),
    Promise  = require('../../../util/promise');

module.exports = function(options) {
  var address = options.address,
      client  = options.client,
      scope   = options.scope,
      options = options.options;

  var scopes = [scope + ':rw'];

  return discover.withAddress(address).then(function(webfinger) {
    return new Promise(function(resolve, reject) {
      oauth.authorize(webfinger.authDialog, client, scopes, options, function(error, authorization) {
        if (error)
          reject(error);
        else
          resolve({ address, scope, webfinger, authorization });
      });
    });
  });
};
