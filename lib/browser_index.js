'use strict';

const assign         = require('./util/assign'),
      storeroom      = require('./common_index'),
      DropboxAdapter = require('./adapters/dropbox'),
      LSAdapter      = require('./adapters/local_storage'),
      RSAdapter      = require('./adapters/remote_storage');

module.exports = assign(storeroom, {
  connectDropbox(options) {
    return DropboxAdapter.authorize(options);
  },

  createLocalStorageAdapter(prefix, storage) {
    return new LSAdapter(prefix, storage);
  }
});
