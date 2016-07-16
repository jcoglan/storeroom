'use strict';

var binarySearch = require('../util/binary_search'),
    Record       = require('./record');

var HEADER = {version: 3};

var Bucket = function(keys, values, options) {
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

  var lines  = string.split('\n'),
      keys   = lines[1],
      values = lines.slice(2);

  return new Bucket(keys, values, options);
};

Bucket.prototype.get = function(key) {
  var index = this._indexOf(key);

  return (index >= 0)
       ? this._values[index].get()
       : undefined;
};

Bucket.prototype.entries = function(dirname) {
  var value = this.get(dirname);
  return value ? value.slice() : [];
};

Bucket.prototype.put = function(key, value) {
  this._recordFor(key).put(value);
};

Bucket.prototype.addChild = function(dirname, filename) {
  var record = this._recordFor(dirname),
      list   = record.get() || [],
      index  = binarySearch(list, filename);

  if (index < 0) {
    list.splice(Math.abs(index + 1), 0, filename);
    record.put(list);
  }
};

Bucket.prototype.serialize = function() {
  var head    = JSON.stringify(HEADER),
      index   = this._keys.serialize(),
      records = this._values.map(function(r) { return r.serialize() });

  return [head, index].concat(records).join('\n');
};

Bucket.prototype._indexOf = function(key) {
  return binarySearch(this._keys.get(), key);
};

Bucket.prototype._recordFor = function(key) {
  var index = this._indexOf(key), list;

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
