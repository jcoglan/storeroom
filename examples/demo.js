var localStore = require('./local_store');

var writes = [
  localStore.put('/users/alice', {name: 'Alice Smith'}),
  localStore.put('/users/bob', {name: 'Bob Jones'})
];

var records = ['/users/alice', '/users/bob'];

Promise.all(writes).then(function() {
  return localStore.entries('/users/');

}).then(function(entries) {
  return Promise.all(entries.map(function(u) { return localStore.get('/users/' + u) }));

}).then(function(results) {
  console.log(results);
  return Promise.all(records.map(localStore.remove, localStore));

}).then(function() {
  return localStore.entries('/users/');

}).then(function(entries) {
  return Promise.all(entries.map(function(u) { return localStore.get('/users/' + u) }));

}).then(console.log);
