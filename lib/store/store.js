'use strict';

var Cipher    = require('vault-cipher'),
    crypto    = Cipher.crypto,
    Bucket    = require('./bucket'),
    Mutex     = require('../util/mutex'),
    Promise   = require('../util/promise'),
    parsePath = require('../util/parse_path');

var BUCKETS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    DEFAULT_HASH_BITS = 5;

var Store = function(options) {
  this._backend  = options.adapter;
  this._cipher   = new Cipher(options.password);
  this._hashBits = options.hashBits || DEFAULT_HASH_BITS;
  this._mutexes  = {};
};

Store.prototype.get = function(pathname) {
  var name = this._getBucketName(pathname),
      self = this;

  return this._backend.read(name).then(function(string) {
    var bucket = Bucket.parse(string, {cipher: self._cipher});
    return bucket.get(pathname);
  });
};

Store.prototype.entries = function(dirname) {
  var name = this._getBucketName(dirname),
      self = this;

  return this._backend.read(name).then(function(string) {
    var bucket = Bucket.parse(string, {cipher: self._cipher});
    return bucket.entries(dirname);
  });
};

Store.prototype.put = function(pathname, value) {
  var docBucket = this._getBucketName(pathname),
      pathParts = parsePath(pathname),
      children  = [],
      self      = this;

  pathParts.reduce(function(parent, child) {
    var pathname = parent.pathname;
    children.push([self._getBucketName(pathname), pathname, child.filename]);
    return child;
  });

  var names = children.map(function(c) { return c[0] }).concat(docBucket);

  return this._withBuckets(names, function(buckets) {
    children.forEach(function(child) {
      buckets[child[0]].addChild(child[1], child[2]);
    });
    buckets[docBucket].put(pathname, value);
  });
};

Store.prototype.remove = function(pathname) {
  var name = this._getBucketName(pathname),
      self = this;

  return this._mutex(name).synchronize(function() {
    return self._backend.read(name).then(function(string) {
      var bucket = Bucket.parse(string, {cipher: self._cipher});
      bucket.remove(pathname);
      return self._backend.write(name, bucket.serialize());
    });
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

Store.prototype._mutex = function(name) {
  return this._mutexes[name] = this._mutexes[name] || new Mutex();
};

Store.prototype._withBuckets = function(names, task) {
  var set = {};
  names.forEach(function(name) { set[name] = true });
  names = Object.keys(set).sort();

  var mutexes = names.map(this._mutex, this),
      buckets = {},
      self    = this;

  return Mutex.multi(mutexes, function() {
    var bucketsLoaded = names.map(function(name) {
      return self._backend.read(name).then(function(string) {
        buckets[name] = Bucket.parse(string, {cipher: self._cipher});
      });
    });

    return Promise.all(bucketsLoaded).then(function() {
      task(buckets);

      var writes = names.map(function(name) {
        return self._backend.write(name, buckets[name].serialize());
      });
      return Promise.all(writes);
    });
  });
};

module.exports = Store;
