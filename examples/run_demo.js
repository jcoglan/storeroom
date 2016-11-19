module.exports = function(store) {
  var writes = [
    store.put('/users/alice', {name: 'Alice Smith'}),
    store.put('/users/bob', {name: 'Bob Jones'})
  ];

  var records = ['/users/alice', '/users/bob'];

  Promise.all(writes).then(function() {
    return store.entries('/users/');

  }).then(function(entries) {
    return Promise.all(entries.map(function(u) { return store.get('/users/' + u) }));

  }).then(function(results) {
    console.log(results);
    return Promise.all(records.map(store.remove, store));

  }).then(function() {
    return store.entries('/users/');

  }).then(function(entries) {
    return Promise.all(entries.map(function(u) { return store.get('/users/' + u) }));

  }).then(
    function(m) { console.log(m) },
    function(e) { console.error(e) }
  )
};
