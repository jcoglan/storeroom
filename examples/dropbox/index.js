var storeroom = require('../../'),
    store     = require('../local_store'),
    runDemo   = require('../run_demo'),
    $         = require('jquery');

var credentials = {
  key:      'j7lwwfemrbo86bf',
  callback: 'http://localhost:8000/acceptor.html'
};

$('form.connect').submit(function(event) {
  event.preventDefault();

  storeroom.connectDropbox(credentials).then(function(session) {
    console.log(session);
    store.put('/sessions/dropbox', session);
  }, function(error) {
    console.error(error);
  });
});

$('form.clear').submit(function(event) {
  event.preventDefault();
  store.remove('/sessions/dropbox');
});

$('form.run').submit(function(event) {
  event.preventDefault();

  store.get('/sessions/dropbox').then(function(session) {
    console.log('[session]', session);

    var dropbox = storeroom.createStore({
      adapter:  storeroom.createDropboxAdapter(session),
      password: 'I was there'
    });

    runDemo(dropbox);
  });
});
