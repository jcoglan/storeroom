var localStore = require('./local_store');

var writes = [
  localStore.put('/users/alice', {name: 'Alice Smith'}),
  localStore.put('/users/bob', {name: 'Bob Jones'})
];

var records = ['/users/alice', '/users/bob'];

return Promise.all(writes).then(function() {
  return Promise.all(records.map(localStore.get, localStore));

}).then(function(results) {
  console.log(results);
  return Promise.all(records.map(localStore.remove, localStore));

}).then(function() {
  return Promise.all(records.map(localStore.get, localStore));

}).then(console.log);
