'use strict';

const storeroom = require('../../'),
      store     = require('../local_store');

let address = 'jcoglan@5apps.com';

storeroom.connectRemoteStorage({
  address: address,
  client:  'Storeroom Demo',
  scope:   'storeroom',
  options: {browser: 'elinks', inline: true}

}).then((session) => {
  store.put('/sessions/remote_storage', session);

}).then(() => {
  setTimeout(process.exit, 1000);
});
