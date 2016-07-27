'use strict';

var RSAdapter = require('./adapters/remote_storage'),
    Store     = require('./store/store');

module.exports = {
  createStore: function(options) {
    return new Store(options);
  },

  connectRemoteStorage: function(options) {
    return RSAdapter.authorize.connect(options);
  },

  createRemoteStorageAdapter: function(session) {
    return new RSAdapter(session);
  }
};
