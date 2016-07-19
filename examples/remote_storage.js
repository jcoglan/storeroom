var oauth    = require('remotestorage-oauth'),
    discover = require('../lib/adapters/remote_storage/discover');

discover('jcoglan@5apps.com').then(function(response) {
  console.log(response);

  var endpoint = response.authDialog,
      client   = 'Demo',
      scopes   = ['*:rw'];

  oauth.authorize(endpoint, client, scopes, {}, function(error, token) {
    console.log(error, token);
    process.exit();
  });
}, console.error);
