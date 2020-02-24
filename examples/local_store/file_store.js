'use strict';

const path      = require('path'),
      storeroom = require('../../');

module.exports = storeroom.createStore({
  adapter:  storeroom.createFileAdapter(path.resolve(__dirname, '..', '.store')),
  password: 'I was there'
});
