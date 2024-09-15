'use strict';

var fs     = require('fs'),
    path   = require('path'),
    mkdirp = require('mkdirp');

var FileAdapter = function(root) {
  this._root = path.resolve(root);
};

FileAdapter.prototype.read = function(name) {
  var pathname = path.join(this._root, name);

  return new Promise(function(resolve, reject) {
    fs.readFile(pathname, 'utf8', function(error, string) {
      if (error && error.code !== 'ENOENT')
        reject(error);
      else
        resolve(string || null);
    });
  });
};

FileAdapter.prototype.write = function(name, data) {
  var pathname = path.join(this._root, name),
      self     = this;

  return new Promise(function(resolve, reject) {
    var callback = function(error) {
      if (error) reject(error);
      else resolve();
    };

    if (data === null)
      fs.unlink(pathname, callback);
    else
      self._writeFile(pathname, data, callback);
  });
};

FileAdapter.prototype._writeFile = function(pathname, data, callback) {
  var self = this;

  fs.writeFile(pathname, data, 'utf8', function(error) {
    if (!error || error.code !== 'ENOENT') return callback(error);

    mkdirp(path.dirname(pathname), function(error) {
      if (error)
        callback(error);
      else
        self._writeFile(pathname, data, callback);
    });
  });
};

module.exports = FileAdapter;
