'use strict';

const storeroom = require('../../'),
      store     = require('../local_store'),
      runDemo   = require('../run_demo');

function run(session) {
  let auth  = session.authorization.access_token,
      root  = session.webfinger.storageRoot,
      scope = session.scope;

  console.log(`curl -isH "Authorization: Bearer ${auth}" ${root}/${scope}/`);

  console.log('[session]', session);

  let remoteStorage = storeroom.createStore({
    adapter:  storeroom.createRemoteStorageAdapter(session),
    password: 'I was there'
  });

  runDemo(remoteStorage);
}

module.exports = run;

if (require.main === module)
  store.get('/sessions/remote_storage')
      .then(run)
      .catch((e) => console.error(e));
