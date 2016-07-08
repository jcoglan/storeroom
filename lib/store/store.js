'use strict';

var Cipher  = require('vault-cipher'),
    crypto  = Cipher.crypto,
    Bucket  = require('./bucket'),
    Promise = require('../util/promise');

var BUCKETS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    DEFAULT_HASH_BITS = 5;

var Store = function(options) {
  this._backend  = options.adapter;
  this._cipher   = new Cipher(options.password);
  this._hashBits = options.hashBits || DEFAULT_HASH_BITS;
};

Store.prototype.get = function(pathname) {
  var name = this._getBucketName(pathname),
      self = this;

  return this._backend.read(name).then(function(string) {
    var bucket = Bucket.parse(string, {cipher: self._cipher});
    return bucket.get(pathname);
  });
};

Store.prototype.put = function(pathname, value) {
  var name = this._getBucketName(pathname),
      self = this;

  return this._backend.read(name).then(function(string) {
    var bucket = Bucket.parse(string, {cipher: self._cipher});
    bucket.put(pathname, value);
    return self._backend.write(name, bucket.serialize());
  });
};

Store.prototype._getBucketName = function(pathname) {
  var key   = this._cipher.deriveKeys()[1],
      hmac  = crypto.createHmac('sha256', key),
      hash  = hmac.update(pathname).digest(),
      mask  = Math.pow(2, this._hashBits) - 1,
      index = hash.readUInt8(hash.length - 1) & mask;

  return BUCKETS[index];
};

module.exports = Store;
