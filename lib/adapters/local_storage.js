'use strict';

var Promise = require('../util/promise');

var LocalStorageAdapter = function(prefix) {
  this._prefix = prefix;
};

LocalStorageAdapter.prototype.read = function(name) {
  var itemName = this._join(name);
  return Promise.resolve(localStorage.getItem(itemName));
};

LocalStorageAdapter.prototype.write = function(name, data) {
  var itemName = this._join(name);

  return new Promise(function(resolve, reject) {
    if (data === null)
      localStorage.removeItem(itemName);
    else
      localStorage.setItem(itemName, data);

    resolve();
  });
};

LocalStorageAdapter.prototype._join = function(name) {
  return this._prefix ? [this._prefix, name].join(':') : name;
};

module.exports = LocalStorageAdapter;
