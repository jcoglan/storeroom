'use strict';

var storeroom      = require('./common_index'),
    DropboxAdapter = require('./adapters/dropbox'),
    LSAdapter      = require('./adapters/local_storage'),
    RSAdapter      = require('./adapters/remote_storage');

storeroom.connectDropbox = function(options) {
  return DropboxAdapter.authorize.connect(options);
};

storeroom.handleDropboxCallback = function(options) {
  return DropboxAdapter.authorize.callback(options);
};

storeroom.createLocalStorageAdapter = function(prefix) {
  return new LSAdapter(prefix);
};

storeroom.handleRemoteStorageCallback = function() {
  return RSAdapter.authorize.callback();
};

module.exports = storeroom;
