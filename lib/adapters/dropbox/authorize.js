'use strict';

var http     = require('../../util/http'),
    qs       = require('../../util/querystring'),
    redirect = require('../../util/redirect');

module.exports = {
  connect: function(options) {
    redirect('https://www.dropbox.com/1/oauth2/authorize', {
      client_id:     options.key,
      redirect_uri:  options.callback || location.href.replace(/#.*$/, ''),
      response_type: 'code'
    });
  },

  callback: function(options) {
    var params = qs.parse(location.search.replace(/^\?/, '')),
        code   = params.code;

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
