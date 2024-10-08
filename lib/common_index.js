'use strict';

var Cipher         = require('vault-cipher'),
    DropboxAdapter = require('./adapters/dropbox'),
    RSAdapter      = require('./adapters/remote_storage'),
    Store          = require('./store/store');

module.exports = {
  Buffer:  Cipher.Buffer,
  crypto:  Cipher.crypto,
  Promise: Promise,

  createStore: function(options) {
    return new Store(options);
  },

  createDropboxAdapter: function(options) {
    return new DropboxAdapter(options);
  },

  connectRemoteStorage: function(options) {
    return RSAdapter.authorize(options);
  },

  createRemoteStorageAdapter: function(session) {
    return new RSAdapter(session);
  }
};
