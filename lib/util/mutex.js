'use strict';

var Promise = require('./promise');

var Mutex = function() {
  this._busy  = false;
  this._queue = [];
};

Mutex.multi = function(mutexes, task) {
  var nesting = mutexes.reduceRight(function(task, mutex) {
    return function() {
      return mutex.synchronize(task);
    };
  }, task);

  return nesting();
};

Mutex.prototype.synchronize = function(task) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self._queue.push([task, resolve, reject]);
    if (!self._busy) self._dequeue();
  });
};

Mutex.prototype._dequeue = function() {
  this._busy = true;
  var next = this._queue.shift();

  if (next)
    this._execute(next);
  else
    this._busy = false;
};

Mutex.prototype._execute = function(record) {
  var task    = record[0],
      resolve = record[1],
      reject  = record[2],
      self    = this;

  task().then(resolve, reject).then(function() {
    self._dequeue();
  });
};

module.exports = Mutex;
