'use strict';

var discover = require('../discover'),
    oauth    = require('remotestorage-oauth'),
    Promise  = require('../../../util/promise');

module.exports = {
  connect: function(options) {
    var address = options.address,
        client  = options.client,
        scope   = options.scope,
        options = options.options;

    var scopes = [scope + ':rw'];

    return discover(address).then(function(webfinger) {
      var endpoint = webfinger.authDialog;

      return new Promise(function(resolve, reject) {
        oauth.authorize(endpoint, client, scopes, options, function(error, token) {
          if (error) reject(new Error('OAuth error: ' + error.message));

          resolve({
            address:       address,
            scope:         scope,
            webfinger:     webfinger,
            authorization: token
          });
        });
      });
    });
  }
};
