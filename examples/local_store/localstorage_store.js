'use strict';

const storeroom = require('../../');

module.exports = storeroom.createStore({
  adapter:  storeroom.createLocalStorageAdapter('prefix'),
  password: 'I was there'
});
