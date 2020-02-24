'use strict';

const fs      = require('fs'),
      path    = require('path'),
      mkdirp  = require('mkdirp'),
      Promise = require('../util/promise');

class FileAdapter {
  constructor(root) {
    this._root = path.resolve(root);
  }

  read(name) {
    let pathname = path.join(this._root, name);

    return new Promise((resolve, reject) => {
      fs.readFile(pathname, 'utf8', (error, string) => {
        if (error && error.code !== 'ENOENT')
          reject(error);
        else
          resolve(string || null);
      });
    });
  }

  write(name, data) {
    let pathname = path.join(this._root, name);

    return new Promise((resolve, reject) => {
      function callback(error) {
        if (error) reject(error);
        else resolve();
      }

      if (data === null) return fs.unlink(pathname, callback);

      mkdirp(path.dirname(pathname), (error) => {
        if (error) return reject(error);
        fs.writeFile(pathname, data, 'utf8', callback);
      });
    });
  }
}

module.exports = FileAdapter;
