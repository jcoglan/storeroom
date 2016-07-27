'use strict';

var DropboxAdapter = require('./adapters/dropbox'),
    RSAdapter      = require('./adapters/remote_storage'),
    Store          = require('./store/store');

module.exports = {
  createStore: function(options) {
    return new Store(options);
  },

  createDropboxAdapter: function(options) {
    return new DropboxAdapter(options);
  },

  connectRemoteStorage: function(options) {
    return RSAdapter.authorize.connect(options);
  },

  createRemoteStorageAdapter: function(session) {
    return new RSAdapter(session);
  }
};
