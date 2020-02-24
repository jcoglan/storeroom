'use strict';

const assign      = require('./util/assign'),
      storeroom   = require('./common_index'),
      FileAdapter = require('./adapters/file');

module.exports = assign(storeroom, {
  createFileAdapter(pathname) {
    return new FileAdapter(pathname);
  }
});
