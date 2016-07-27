'use strict';

var vstore    = require('./common_index'),
    RSAdapter = require('./adapters/remote_storage');

vstore.handleRemoteStorageCallback = function() {
  return RSAdapter.authorize.callback();
};

module.exports = vstore;
