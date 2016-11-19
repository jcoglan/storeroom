'use strict';

var Promise = require('../util/promise');

var DEFAULT_STORAGE = global.localStorage;

var LocalStorageAdapter = function(prefix, storage) {
  this._prefix  = prefix;
  this._storage = storage || DEFAULT_STORAGE;
};

LocalStorageAdapter.prototype.read = function(name) {
  var itemName = this._join(name);
  return Promise.resolve(this._storage.getItem(itemName));
};

LocalStorageAdapter.prototype.write = function(name, data) {
  var itemName = this._join(name),
      self     = this;

  return new Promise(function(resolve, reject) {
    if (data === null)
      self._storage.removeItem(itemName);
    else
      self._storage.setItem(itemName, data);

    resolve();
  });
};

LocalStorageAdapter.prototype._join = function(name) {
  return this._prefix ? [this._prefix, name].join(':') : name;
};

module.exports = LocalStorageAdapter;
