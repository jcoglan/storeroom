'use strict';

const storeroom = require('../../'),
      store     = require('../local_store'),
      runDemo   = require('../run_demo'),
      $         = require('jquery');

let credentials = {
  key:      'j7lwwfemrbo86bf',
  callback: 'http://localhost:8000/acceptor.html'
};

$('form.connect').submit((event) => {
  event.preventDefault();

  storeroom.connectDropbox(credentials).then((session) => {
    console.log(session);
    store.put('/sessions/dropbox', session);
  }, (error) => {
    console.error(error);
  });
});

$('form.clear').submit((event) => {
  event.preventDefault();
  store.remove('/sessions/dropbox');
});

$('form.run').submit((event) => {
  event.preventDefault();

  store.get('/sessions/dropbox').then((session) => {
    console.log('[session]', session);

    let dropbox = storeroom.createStore({
      adapter:  storeroom.createDropboxAdapter(session),
      password: 'I was there'
    });

    runDemo(dropbox);
  });
});
