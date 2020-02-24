'use strict';

const binarySearch = require('../util/binary_search'),
      metadata     = require('./metadata'),
      Record       = require('./record');

function Bucket(keys, values, options) {
  this._keys = (keys === null)
             ? new Record(options.cipher, [])
             : new Record(options.cipher, undefined, keys);

  this._values = values.map(function(value) { 
    return new Record(options.cipher, undefined, value);
  });

  this._cipher = options.cipher;
};

Bucket.parse = function(string, options) {
  if (typeof string !== 'string') return new Bucket(null, [], options);

  let lines  = string.split('\n'),
      keys   = lines[1],
      values = lines.slice(2);

  return new Bucket(keys, values, options);
};

Bucket.prototype.get = function(pathname) {
  let index = this._indexOf(pathname);

  return (index >= 0)
       ? this._values[index].get()
       : undefined;
};

Bucket.prototype.entries = function(dirname) {
  let value = this.get(dirname);
  return value ? value.slice() : [];
};

Bucket.prototype.put = function(pathname, value) {
  this._recordFor(pathname).put(value);
};

Bucket.prototype.addChild = function(dirname, filename) {
  let record = this._recordFor(dirname),
      list   = record.get() || [],
      index  = binarySearch(list, filename);

  if (index < 0) {
    list.splice(Math.abs(index + 1), 0, filename);
    record.put(list);
  }
};

Bucket.prototype.remove = function(pathname) {
  let index = this._indexOf(pathname);
  if (index < 0) return;

  let list = this._keys.get();
  list.splice(index, 1);
  this._keys.put(list);

  this._values.splice(index, 1);
};

Bucket.prototype.removeChild = function(dirname, filename) {
  let index = this._indexOf(dirname);
  if (index < 0) return;

  let list = this._values[index].get(),
      idx  = binarySearch(list, filename);

  if (idx >= 0) {
    list.splice(idx, 1);
    this._values[index].put(list);
  }
};

Bucket.prototype.serialize = function() {
  let head    = JSON.stringify(metadata.fileHeader),
      index   = this._keys.serialize(),
      records = this._values.map(function(r) { return r.serialize() });

  if (records.length === 0) return null;

  return [head, index].concat(records).join('\n');
};

Bucket.prototype._indexOf = function(key) {
  return binarySearch(this._keys.get(), key);
};

Bucket.prototype._recordFor = function(key) {
  let index = this._indexOf(key), list;

  if (index < 0) {
    index = Math.abs(index + 1);
    this._values.splice(index, 0, new Record(this._cipher));

    list = this._keys.get()
    list.splice(index, 0, key);
    this._keys.put(list);
  }
  return this._values[index];
};

module.exports = Bucket;
