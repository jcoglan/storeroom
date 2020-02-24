'use strict';

const storeroom   = require('./common_index'),
      FileAdapter = require('./adapters/file');

storeroom.createFileAdapter = function(pathname) {
  return new FileAdapter(pathname);
};

module.exports = storeroom;
