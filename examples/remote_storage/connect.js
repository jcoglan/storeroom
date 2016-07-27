var storeroom  = require('../../'),
    localStore = require('../local_store');

var address = 'jcoglan@5apps.com';

var session = storeroom.connectRemoteStorage({
  address: address,
  client:  'Storeroom Demo',
  scope:   'storeroom',
  options: {browser: 'elinks', inline: true}
});

session.then(function(session) {
  localStore.put('/remote-storage/' + address, session);
});
