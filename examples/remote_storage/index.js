'use strict';

const storeroom = require('../../'),
      store     = require('../local_store'),
      runDemo   = require('./run_demo'),
      $         = require('jquery');

let credentials = {
  client:   'Storeroom Demo',
  scope:    'storeroom',
  callback: location.origin + '/acceptor.html'
};

$('form.connect').submit((event) => {
  event.preventDefault();

  credentials.address = $('#address').val();

  storeroom.connectRemoteStorage(credentials).then((session) => {
    console.log(session);
    store.put('/sessions/remote_storage', session);
  }, (error) => {
    console.error(error);
  });
});

$('form.clear').submit((event) => {
  event.preventDefault();
  store.remove('/sessions/remote_storage');
});

$('form.run').submit((event) => {
  event.preventDefault();
  store.get('/sessions/remote_storage').then(runDemo);
});
