var vstore     = require('../../'),
    localStore = require('./local_store');

var address = 'jcoglan@5apps.com';

var session = vstore.connectRemoteStorage({
  address: address,
  client:  'Demo',
  scope:   'demo',
  options: {browser: 'elinks', inline: true}
});

session.then(function(credentials) {
  localStore.put('/remote-storage/' + address, credentials);
});
