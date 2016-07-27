'use strict';

var storeroom      = require('./common_index'),
    DropboxAdapter = require('./adapters/dropbox'),
    RSAdapter      = require('./adapters/remote_storage');

storeroom.connectDropbox = function(options) {
  return DropboxAdapter.authorize.connect(options);
};

storeroom.handleDropboxCallback = function(options) {
  return DropboxAdapter.authorize.callback(options);
};

storeroom.handleRemoteStorageCallback = function() {
  return RSAdapter.authorize.callback();
};

module.exports = storeroom;
