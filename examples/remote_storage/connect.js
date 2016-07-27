var vstore     = require('../../'),
    localStore = require('../local_store');

var address = 'jcoglan@5apps.com';

var session = vstore.connectRemoteStorage({
  address: address,
  client:  'vault-store Demo',
  scope:   'demo',
  options: {browser: 'elinks', inline: true}
});

session.then(function(session) {
  localStore.put('/remote-storage/' + address, session);
});
