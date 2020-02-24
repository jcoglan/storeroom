'use strict';

const discover = require('../discover'),
      oauth    = require('remotestorage-oauth'),
      Promise  = require('../../../util/promise');

module.exports = function(params) {
  let address = params.address,
      client  = params.client,
      scope   = params.scope,
      options = params.options;

  let scopes = [scope + ':rw'];

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
