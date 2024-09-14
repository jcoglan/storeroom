'use strict';

var Mutex = function() {
  this._current = Promise.resolve();
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
  this._current = this._current.then(task, task)
  return this._current
};

module.exports = Mutex;
