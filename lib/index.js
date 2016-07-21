'use strict';

var Cipher      = require('vault-cipher'),
    Store       = require('./store/store'),
    FileAdapter = require('./adapters/file'),
    RSAdapter   = require('./adapters/remote_storage');

var vstore = {
  Buffer: Cipher.Buffer,
  crypto: Cipher.crypto,

  createStore: function(options) {
    return new Store(options);
  },

  createFileAdapter: function(pathname) {
    return new FileAdapter(pathname);
  },

  connectRemoteStorage: function(options) {
    return RSAdapter.connect(options);
  }
};

module.exports = vstore;
