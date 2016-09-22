'use strict';

var crypto  = require('vault-cipher').crypto,
    http    = require('../../util/http'),
    open    = require('../../util/open'),
    Promise = require('../../util/promise');

var AUTH_URL       = 'https://www.dropbox.com/1/oauth2/authorize',
    EXCHANGE_URL   = 'https://www.dropbox.com/1/oauth2/token',
    DEFAULT_WIDTH  = 640,
    DEFAULT_HEIGHT = 580;

module.exports = {
  connect: function(options) {
    var callback = '__cb__' + crypto.randomBytes(16).toString('hex'),
        props    = {width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT},
        self     = this;

    var params = {
      client_id:     options.key,
      redirect_uri:  options.callback,
      response_type: 'code',
      state:         callback
    };

    return new Promise(function(resolve, reject) {
      window[callback] = function(payload) {
        self.removeCallback(callback);
        if (payload.error) reject(new Error(payload.error_description));
        else resolve(payload.code);
      };

      open(AUTH_URL, params, props);

    }).then(function(code) {
      return self.exchangeCode(options, code);
    });
  },

  removeCallback: function(callback) {
    try {
      delete window[callback];
    } catch (error) {
      window[callback] = undefined;
    }
  },

  exchangeCode: function(options, code) {
    return http.post(EXCHANGE_URL, {
      client_id:     options.key,
      client_secret: options.secret,
      redirect_uri:  options.callback,
      grant_type:    'authorization_code',
      code:          code

    }).then(function(response) {
      var status = response.statusCode,
          body   = response.body.toString();

      if (status >= 200 && status < 300)
        return {authorization: JSON.parse(body)};
      else
        throw new Error('Dropbox error (' + status + '): ' + body);
    });
  }
};
