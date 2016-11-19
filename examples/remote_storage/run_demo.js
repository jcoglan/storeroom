var storeroom = require('../../'),
    store     = require('../local_store'),
    runDemo   = require('../run_demo');

var run = function(session) {
  var auth  = session.authorization.access_token,
      root  = session.webfinger.storageRoot,
      scope = session.scope;

  console.log('curl -isH "Authorization: Bearer ' + auth + '" ' + root + '/' + scope + '/');

  console.log('[session]', session);

  var remoteStorage = storeroom.createStore({
    adapter:  storeroom.createRemoteStorageAdapter(session),
    password: 'I was there'
  });

  runDemo(remoteStorage);
};

module.exports = run;

if (require.main === module)
  store.get('/sessions/remote_storage')
      .then(run)
      .catch(function(e) { console.error(e) });
