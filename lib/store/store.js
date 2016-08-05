'use strict';

var Bucket     = require('./bucket'),
    MasterKeys = require('./master_keys'),
    Mutex      = require('../util/mutex'),
    Promise    = require('../util/promise'),
    parsePath  = require('../util/parse_path');

var Store = function(options) {
  this._backend = options.adapter;
  this._options = options;
  this._mutexes = {};
};

Store.prototype.get = function(pathname) {
  var self = this;

  return this._getKeys().then(function(masterKeys) {
    var name = masterKeys.hashPathname(pathname);

    return self._backend.read(name).then(function(string) {
      var bucket = Bucket.parse(string, {cipher: masterKeys});
      return bucket.get(pathname);
    });
  });
};

Store.prototype.entries = function(dirname) {
  var self = this;

  return this._getKeys().then(function(masterKeys) {
    var name = masterKeys.hashPathname(dirname);

    return self._backend.read(name).then(function(string) {
      var bucket = Bucket.parse(string, {cipher: masterKeys});
      return bucket.entries(dirname);
    });
  });
};

Store.prototype.put = function(pathname, value) {
  var pathParts = parsePath(pathname),
      children  = [],
      self      = this;

  return this._getKeys().then(function(masterKeys) {
    var docBucket = masterKeys.hashPathname(pathname);

    pathParts.reduce(function(parent, child) {
      var pathname = parent.pathname;
      children.push([masterKeys.hashPathname(pathname), pathname, child.filename]);
      return child;
    });

    var names = children.map(function(c) { return c[0] }).concat(docBucket);

    return self._withBuckets(names, masterKeys, function(buckets) {
      children.forEach(function(child) {
        buckets[child[0]].addChild(child[1], child[2]);
      });
      buckets[docBucket].put(pathname, value);
    });
  });
};

Store.prototype.remove = function(pathname) {
  var pathParts = parsePath(pathname),
      pathnames = pathParts.map(function(p) { return p.pathname }),
      self      = this;

  return this._getKeys().then(function(masterKeys) {
    var names = pathnames.map(masterKeys.hashPathname, masterKeys);

    return self._withBuckets(names, masterKeys, function(buckets) {
      var i = pathParts.length - 1,
          doc, docBucket;

      doc = pathParts[i];
      docBucket = buckets[names[i]];
      docBucket.remove(doc.pathname);

      while (i--) {
        doc = pathParts[i];
        docBucket = buckets[names[i]];

        if (docBucket.entries(doc.pathname).length === 1) {
          docBucket.remove(doc.pathname);
        } else {
          docBucket.removeChild(doc.pathname, pathParts[i + 1].filename);
          break;
        }
      }
    });
  });
};

Store.prototype._getKeys = function() {
  return this._masterKeys = this._masterKeys || MasterKeys.create(this._options);
};

Store.prototype._mutex = function(name) {
  return this._mutexes[name] = this._mutexes[name] || new Mutex();
};

Store.prototype._withBuckets = function(names, masterKeys, task) {
  var set = {};
  names.forEach(function(name) { set[name] = true });
  names = Object.keys(set).sort();

  var mutexes = names.map(this._mutex, this),
      buckets = {},
      self    = this;

  return Mutex.multi(mutexes, function() {
    var bucketsLoaded = names.map(function(name) {
      return self._backend.read(name).then(function(string) {
        buckets[name] = Bucket.parse(string, {cipher: masterKeys});
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
