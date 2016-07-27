var storeroom  = require('../../'),
    Promise    = require('../../lib/util/promise'),
    localStore = require('../local_store');

var address = 'jcoglan@5apps.com';

localStore.get('/remote-storage/' + address).then(function(session) {
  var auth  = session.authorization.access_token,
      root  = session.webfinger.storageRoot,
      scope = session.scope;

  console.log('curl -isH "Authorization: Bearer ' + auth + '" ' + root + '/' + scope + '/');

  var remoteStore = storeroom.createStore({
    adapter:  storeroom.createRemoteStorageAdapter(session),
    password: 'I was there'
  });

  var writes = [
    remoteStore.put('/users/alice', {name: 'Alice Smith'}),
    remoteStore.put('/users/bob', {name: 'Bob Jones'})
  ];

  var records = ['/users/alice', '/users/bob'];

  return Promise.all(writes).then(function() {
    return remoteStore.entries('/users/');

  }).then(function(entries) {
    return Promise.all(entries.map(function(u) { return remoteStore.get('/users/' + u) }));

  }).then(function(results) {
    console.log(results);
    return Promise.all(records.map(remoteStore.remove, remoteStore));

  }).then(function() {
    return remoteStore.entries('/users/');

  }).then(function(entries) {
    return Promise.all(entries.map(function(u) { return remoteStore.get('/users/' + u) }));

  }).then(console.log);

}).catch(console.error);
