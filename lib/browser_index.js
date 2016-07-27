'use strict';

var vstore         = require('./common_index'),
    DropboxAdapter = require('./adapters/dropbox'),
    RSAdapter      = require('./adapters/remote_storage');

vstore.connectDropbox = function(options) {
  return DropboxAdapter.authorize.connect(options);
};

vstore.handleDropboxCallback = function(options) {
  return DropboxAdapter.authorize.callback(options);
};

vstore.handleRemoteStorageCallback = function() {
  return RSAdapter.authorize.callback();
};

module.exports = vstore;
