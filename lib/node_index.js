'use strict';

var vstore      = require('./common_index'),
    FileAdapter = require('./adapters/file');

vstore.createFileAdapter = function(pathname) {
  return new FileAdapter(pathname);
};

module.exports = vstore;
