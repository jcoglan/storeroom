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

Bucket.prototype.put = function(key, value) {
  var index = this._indexOf(key);

  if (index < 0) {
    index = Math.abs(index + 1);
    this._keys.get().splice(index, 0, key);
    this._values.splice(index, 0, new Record(this._cipher));
  }
  this._values[index].put(value);
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

module.exports = Bucket;
