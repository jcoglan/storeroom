'use strict';

var storeroom      = require('./common_index'),
    DropboxAdapter = require('./adapters/dropbox'),
    LSAdapter      = require('./adapters/local_storage'),
    RSAdapter      = require('./adapters/remote_storage');

storeroom.connectDropbox = function(options) {
  return DropboxAdapter.authorize(options);
};

storeroom.createLocalStorageAdapter = function(prefix, storage) {
  return new LSAdapter(prefix, storage);
};

module.exports = storeroom;
