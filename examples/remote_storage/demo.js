var request    = require('../../lib/util/request'),
    localStore = require('./local_store');

var address = 'jcoglan@5apps.com';

localStore.get('/remote-storage/' + address).then(function(session) {
  console.log(session);

  var root = session.webfinger.storageRoot,
      item = root + '/foo/bar/hello',
      head = {Authorization: 'Bearer ' + session.authorization.access_token},
      sep  = Array(81).join('-');

  console.log(sep);
  console.log('curl -isH "Authorization: ' + head.Authorization + '" ' + root + '/');

  request('PUT', item, 'hello world', head).then(function(response) {
    return request('GET', root + '/', {}, head);

  }).then(function(response) {
    console.log(sep);
    console.log(JSON.parse(response.body.toString()));
    return request('DELETE', item, {}, head);

  }).then(function() {
    return request('GET', root + '/', {}, head);

  }).then(function(response) {
    console.log(sep);
    console.log(JSON.parse(response.body.toString()));
  });
});
