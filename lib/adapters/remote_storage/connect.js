'use strict';

var authorize = require('./authorize'),
    discover  = require('./discover');

module.exports = function(options) {
  var address = options.address,
      client  = options.client,
      scope   = options.scope,
      options = options.options;

  var scopes = [scope + ':rw'];

  return discover(address).then(function(webfinger) {
    return authorize(webfinger.authDialog, client, scopes, options).then(function(token) {
      return {
        address:       address,
        scope:         scope,
        webfinger:     webfinger,
        authorization: token
      };
    });
  });
};
