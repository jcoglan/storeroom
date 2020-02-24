'use strict';

const Promise = require('../util/promise');

const DEFAULT_STORAGE = global.localStorage;

class LocalStorageAdapter {
  constructor(prefix, storage) {
    this._prefix  = prefix;
    this._storage = storage || DEFAULT_STORAGE;
  }

  read(name) {
    let itemName = this._join(name);
    return Promise.resolve(this._storage.getItem(itemName));
  }

  write(name, data) {
    let itemName = this._join(name),
        self     = this;

    return new Promise(function(resolve, reject) {
      if (data === null)
        self._storage.removeItem(itemName);
      else
        self._storage.setItem(itemName, data);

      resolve();
    });
  }

  _join(name) {
    return this._prefix ? [this._prefix, name].join(':') : name;
  }
}

module.exports = LocalStorageAdapter;
