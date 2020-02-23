'use strict';

var Cipher         = require('vault-cipher'),
    DropboxAdapter = require('./adapters/dropbox'),
    RSAdapter      = require('./adapters/remote_storage'),
    Store          = require('./store/store'),
    Promise        = require('./util/promise');

module.exports = {
  Buffer:  Cipher.Buffer,
  crypto:  Cipher.crypto,

  Promise,

  createStore(options) {
    return new Store(options);
  },

  createDropboxAdapter(options) {
    return new DropboxAdapter(options);
  },

  connectRemoteStorage(options) {
    return RSAdapter.authorize(options);
  },

  createRemoteStorageAdapter(session) {
    return new RSAdapter(session);
  }
};
