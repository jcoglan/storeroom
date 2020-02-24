'use strict';

const discover = require('../discover'),
      oauth    = require('remotestorage-oauth'),
      Promise  = require('../../../util/promise');

function authorize(params) {
  let address = params.address,
      client  = params.client,
      scope   = params.scope,
      options = params.options;

  let scopes = [scope + ':rw'];

  return discover.withAddress(address).then((webfinger) => {
    return new Promise((resolve, reject) => {
      oauth.authorize(webfinger.authDialog, client, scopes, options, (error, authorization) => {
        if (error)
          reject(error);
        else
          resolve({ address, scope, webfinger, authorization });
      });
    });
  });
}

module.exports = authorize;
