'use strict';

var discover = require('../discover'),
    oauth    = require('remotestorage-oauth');

module.exports = function(options) {
  var address = options.address,
      client  = options.client,
      scope   = options.scope,
      options = options.options;

  var scopes = [scope + ':rw'];

  return discover.withAddress(address).then(function(webfinger) {
    return new Promise(function(resolve, reject) {
      oauth.authorize(webfinger.authDialog, client, scopes, options, function(error, token) {
        if (error) return reject(error);

        resolve({
          address:       address,
          scope:         scope,
          webfinger:     webfinger,
          authorization: token
        });
      });
    });
  });
};
