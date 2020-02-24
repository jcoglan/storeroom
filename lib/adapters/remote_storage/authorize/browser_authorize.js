'use strict';

const discover = require('../discover'),
      oauth    = require('../../../util/oauth');

const DEFAULT_WIDTH  = 640,
      DEFAULT_HEIGHT = 580;

module.exports = function(options) {
  let address = options.address,
      scope   = options.scope,
      props   = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };

  let params = {
    client_id:     options.client,
    redirect_uri:  options.callback,
    response_type: 'token',
    scope:         scope + ':rw'
  };

  return discover.withAddress(address).then(function(webfinger) {
    return oauth.openWindow(webfinger.authDialog, params, props).then(function(authorization) {
      return { address, scope, webfinger, authorization };
    });
  });
};
