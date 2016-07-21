'use strict';

var authorize = require('./authorize'),
    discover  = require('./discover');

module.exports = function(options) {
  var address = options.address,
      client  = options.client,
      scopes  = options.scopes,
      options = options.options;

  return discover(address).then(function(webfinger) {
    return authorize(webfinger.authDialog, client, scopes, options).then(function(token) {
      return {
        address:       address,
        webfinger:     webfinger,
        authorization: token
      };
    });
  });
};
