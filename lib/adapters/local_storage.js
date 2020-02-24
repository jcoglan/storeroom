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
    let itemName = this._join(name);

    return new Promise((resolve, reject) => {
      if (data === null)
        this._storage.removeItem(itemName);
      else
        this._storage.setItem(itemName, data);

      resolve();
    });
  }

  _join(name) {
    return this._prefix ? [this._prefix, name].join(':') : name;
  }
}

module.exports = LocalStorageAdapter;
