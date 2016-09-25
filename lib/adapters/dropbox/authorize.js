'use strict';

var http  = require('../../util/http'),
    oauth = require('../../util/oauth');

var AUTH_URL       = 'https://www.dropbox.com/1/oauth2/authorize',
    EXCHANGE_URL   = 'https://www.dropbox.com/1/oauth2/token',
    DEFAULT_WIDTH  = 640,
    DEFAULT_HEIGHT = 580;

module.exports = {
  connect: function(options) {
    var props = {width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT},
        self  = this;

    var params = {
      client_id:     options.key,
      redirect_uri:  options.callback,
      response_type: 'code'
    };

    return oauth.openWindow(AUTH_URL, params, props).then(function(response) {
      if (response.error) throw new Error(response.error_description);
      return self.exchangeCode(options, response.code);
    });
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
