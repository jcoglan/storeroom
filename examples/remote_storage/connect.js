var storeroom  = require('../../'),
    localStore = require('../local_store');

var address = 'jcoglan@5apps.com';

storeroom.connectRemoteStorage({
  address: address,
  client:  'Storeroom Demo',
  scope:   'storeroom',
  options: {browser: 'elinks', inline: true}

}).then(function(session) {
  localStore.put('/remote-storage/' + address, session);

}).then(function() {
  setTimeout(process.exit, 1000);
});
