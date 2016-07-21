var oauth      = require('remotestorage-oauth'),
    discover   = require('../../lib/adapters/remote_storage/discover'),
    localStore = require('./local_store');

var address = 'jcoglan@5apps.com';

var session = discover(address).then(function(response) {
  var endpoint = response.authDialog,
      client   = 'Demo',
      scopes   = ['*:rw'],
      options  = {browser: 'elinks', inline: true};

  return new Promise(function(resolve, reject) {
    oauth.authorize(endpoint, client, scopes, options, function(error, token) {
      if (error)
        reject(error);
      else
        resolve({address: address, webfinger: response, authorization: token});
    });
  });
});

session.then(function(credentials) {
  return localStore.put('/remote-storage/' + address, credentials);
}).then(process.exit);
