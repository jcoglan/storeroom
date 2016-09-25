'use strict';

var discover = require('../discover'),
    oauth    = require('../../../util/oauth');

var DEFAULT_WIDTH  = 640,
    DEFAULT_HEIGHT = 580;

module.exports = function(options) {
  var address = options.address,
      scope   = options.scope,
      props   = {width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT};

  var params = {
    client_id:     options.client,
    redirect_uri:  options.callback,
    response_type: 'token',
    scope:         scope + ':rw'
  };

  return discover(address).then(function(webfinger) {
    return oauth.openWindow(webfinger.authDialog, params, props).then(function(response) {
      return {
        address:       address,
        scope:         scope,
        webfinger:     webfinger,
        authorization: response
      };
    });
  });
};
