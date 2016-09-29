var storeroom = require('../../'),
    store     = require('../local_store'),
    runDemo   = require('./run_demo'),
    $         = require('jquery');

var credentials = {
  client:   'Storeroom Demo',
  scope:    'storeroom',
  callback: location.origin + '/acceptor.html'
};

$('form.connect').submit(function(event) {
  event.preventDefault();

  credentials.address = $('#address').val();

  storeroom.connectRemoteStorage(credentials).then(function(session) {
    console.log(session);
    store.put('/sessions/remote_storage', session);
  }, function(error) {
    console.error(error);
  });
});

$('form.clear').submit(function(event) {
  event.preventDefault();
  store.remove('/sessions/remote_storage');
});

$('form.run').submit(function(event) {
  event.preventDefault();
  store.get('/sessions/remote_storage').then(runDemo);
});
