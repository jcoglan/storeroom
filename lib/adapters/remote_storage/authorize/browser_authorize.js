'use strict';

var Cipher   = require('vault-cipher'),
    Buffer   = Cipher.Buffer,
    discover = require('../discover'),
    Promise  = require('../../../util/promise'),
    qs       = require('../../../util/querystring'),
    redirect = require('../../../util/redirect');

var KEY = '4cb4337e-0b67-4b42-9b7a-7210de737083';

module.exports = {
  connect: function(options) {
    var address  = options.address,
        client   = options.client,
        scope    = options.scope,
        callback = options.callback;

    return discover(address).then(function(webfinger) {
      var keys   = Cipher.randomKeys(),
          cipher = new Cipher(keys);

      var state = {
        address:   address,
        scope:     scope,
        webfinger: webfinger
      };

      localStorage[KEY] = cipher.encrypt(JSON.stringify(state));

      redirect(webfinger.authDialog, {
        client_id:     client,
        redirect_uri:  callback || location.href.replace(/#.*$/, ''),
        response_type: 'token',
        scope:         scope + ':rw',
        state:         Buffer.concat(keys).toString('hex')
      });
    });
  },

  callback: function() {
    return new Promise(function(resolve, reject) {
      var hash = location.hash.replace(/^#/, '');
      if (!hash) return reject(new Error('No callback parameters present'));

      var params  = qs.parse(hash),
          keys    = new Buffer(params.state, 'hex'),
          cipher  = new Cipher([keys.slice(0, 32), keys.slice(32, 64)]),
          session = localStorage[KEY];

      delete localStorage[KEY];
      delete params.state;

      session = JSON.parse(cipher.decrypt(session));
      session.authorization = params;

      location.hash = '';

      resolve(session);
    });
  }
};
