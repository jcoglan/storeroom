'use strict';

var crypto   = require('vault-cipher').crypto,
    http     = require('../../util/http'),
    Promise  = require('../../util/promise'),
    qs       = require('../../util/querystring'),
    redirect = require('../../util/redirect');

module.exports = {
  connect: function(options) {
    var callback = '__cb__' + crypto.randomBytes(16).toString('hex'),
        self     = this;

    var url = 'https://www.dropbox.com/1/oauth2/authorize?' + qs.stringify({
      client_id:     options.key,
      redirect_uri:  options.callback,
      response_type: 'code',
      state:         callback
    });

    var props  = {width: 640, height: 580};
    props.left = (screen.width  - props.width)  / 2;
    props.top  = (screen.height - props.height) / 2.4;
    props      = Object.keys(props).map(function(k) { return k + '=' + props[k] }).join(',');

    return new Promise(function(resolve, reject) {
      window[callback] = function(payload) {
        try {
          delete window[callback];
        } catch (error) {
          window[callback] = undefined;
        }

        if (payload.error) reject(new Error(payload.error_description));
        else resolve(payload.code);
      };

      open(url, 'storeroom-dropbox-window', props);

    }).then(function(code) {
      return self.exchangeCode(options, code);
    });
  },

  exchangeCode: function(options, code) {
    return http.post('https://www.dropbox.com/1/oauth2/token', {
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
