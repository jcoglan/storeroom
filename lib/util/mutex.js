'use strict';

const Promise = require('./promise');

class Mutex {
  constructor() {
    this._busy  = false;
    this._queue = [];
  }

  synchronize(task) {
    return new Promise((resolve, reject) => {
      this._queue.push([task, resolve, reject]);
      if (!this._busy) this._dequeue();
    });
  }

  _dequeue() {
    this._busy = true;
    let next = this._queue.shift();

    if (next)
      this._execute(next);
    else
      this._busy = false;
  }

  _execute(record) {
    let task    = record[0],
        resolve = record[1],
        reject  = record[2];

    task().then(resolve, reject).then(() => this._dequeue());
  }

  static multi(mutexes, task) {
    let nesting = mutexes.reduceRight((task, mutex) => {
      return () => mutex.synchronize(task);
    }, task);

    return nesting();
  }
}

module.exports = Mutex;
