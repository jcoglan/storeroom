'use strict';

module.exports = (store) => {
  let writes = [
    store.put('/users/alice', {name: 'Alice Smith'}),
    store.put('/users/bob', {name: 'Bob Jones'})
  ];

  let records = ['/users/alice', '/users/bob'];

  Promise.all(writes).then(() => {
    return store.entries('/users/');

  }).then((entries) => {
    return Promise.all(entries.map((u) => store.get(`/users/${u}`)));

  }).then((results) => {
    console.log(results);
    return Promise.all(records.map(store.remove, store));

  }).then(() => {
    return store.entries('/users/');

  }).then((entries) => {
    return Promise.all(entries.map((u) => store.get(`/users/${u}`)));

  }).then(
    (m) => console.log(m),
    (e) => console.error(e)
  )
};
