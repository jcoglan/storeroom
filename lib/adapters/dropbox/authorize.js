'use strict';

var http  = require('../../util/http'),
    oauth = require('../../util/oauth');

var AUTH_URL       = 'https://www.dropbox.com/1/oauth2/authorize',
    EXCHANGE_URL   = 'https://www.dropbox.com/1/oauth2/token',
    DEFAULT_WIDTH  = 640,
    DEFAULT_HEIGHT = 580,
    DEFAULT_TYPE   = 'token';

module.exports = function(options) {
  var props = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };

  var params = {
    client_id:     options.key,
    redirect_uri:  options.callback,
    response_type: options.type || DEFAULT_TYPE
  };

  var result = oauth.openWindow(AUTH_URL, params, props);

  if (params.response_type === 'token')
    return result.then(function(response) { return { authorization: response } });

  return result.then(function(response) {
    return http.post(EXCHANGE_URL, {
      client_id:     options.key,
      client_secret: options.secret,
      redirect_uri:  options.callback,
      grant_type:    'authorization_code',
      code:          response.code
    });
  }).then(function(response) {
    var status = response.status,
        body   = response.body.toString();

    if (status >= 200 && status < 300)
      return { authorization: JSON.parse(body) };
    else
      throw new Error('Dropbox error (' + status + '): ' + body);
  });
};
