'use strict';

const asap = require('asap');

const PENDING   = 0,
      FULFILLED = 1,
      REJECTED  = 2;

const RETURN = (x) => { return x },
      THROW  = (x) => { throw  x };

class Promise {
  constructor(task) {
    this._state       = PENDING;
    this._onFulfilled = [];
    this._onRejected  = [];

    if (typeof task !== 'function') return;

    task((value)  => resolve(this, value),
         (reason) => reject(this, reason));
  }

  then(onFulfilled, onRejected) {
    let next = new Promise();
    registerOnFulfilled(this, onFulfilled, next);
    registerOnRejected(this, onRejected, next);
    return next;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new Promise((resolve, reject) => resolve(value));
  }

  static reject(reason) {
    return new Promise((resolve, reject) => reject(reason));
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      let list = [], n = promises.length;

      if (n === 0) return resolve(list);

      for (let i = 0; i < n; i++)
        Promise.resolve(promises[i]).then((value) => {
          list[i] = value;
          if (--n === 0) resolve(list);
        }, reject);
    });
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      for (let i = 0, n = promises.length; i < n; i++)
        Promise.resolve(promises[i]).then(resolve, reject);
    });
  }
}

function registerOnFulfilled(promise, onFulfilled, next) {
  if (typeof onFulfilled !== 'function') onFulfilled = RETURN;
  let handler = (value) => invoke(onFulfilled, value, next);

  if (promise._state === PENDING) {
    promise._onFulfilled.push(handler);
  } else if (promise._state === FULFILLED) {
    handler(promise._value);
  }
}

function registerOnRejected(promise, onRejected, next) {
  if (typeof onRejected !== 'function') onRejected = THROW;
  let handler = (reason) => invoke(onRejected, reason, next);

  if (promise._state === PENDING) {
    promise._onRejected.push(handler);
  } else if (promise._state === REJECTED) {
    handler(promise._reason);
  }
}

function invoke(fn, value, next) {
  asap(() => _invoke(fn, value, next));
}

function _invoke(fn, value, next) {
  let outcome;

  try {
    outcome = fn(value);
  } catch (error) {
    return reject(next, error);
  }

  if (outcome === next) {
    reject(next, new TypeError('Recursive promise chain detected'));
  } else {
    resolve(next, outcome);
  }
}

function resolve(promise, value) {
  let called = false, type, then;

  try {
    type = typeof value;
    then = value !== null && (type === 'function' || type === 'object') && value.then;

    if (typeof then !== 'function') return fulfill(promise, value);

    then.call(value, (v) => {
      if (!(called ^ (called = true))) return;
      resolve(promise, v);
    }, (r) => {
      if (!(called ^ (called = true))) return;
      reject(promise, r);
    });
  } catch (error) {
    if (!(called ^ (called = true))) return;
    reject(promise, error);
  }
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) return;

  promise._state      = FULFILLED;
  promise._value      = value;
  promise._onRejected = [];

  let onFulfilled = promise._onFulfilled, fn;
  while (fn = onFulfilled.shift()) fn(value);
}

function reject(promise, reason) {
  if (promise._state !== PENDING) return;

  promise._state       = REJECTED;
  promise._reason      = reason;
  promise._onFulfilled = [];

  let onRejected = promise._onRejected, fn;
  while (fn = onRejected.shift()) fn(reason);
}

Promise.deferred = Promise.pending = () => {
  let tuple = {};

  tuple.promise = new Promise((resolve, reject) => {
    tuple.resolve = resolve;
    tuple.reject  = reject;
  });
  return tuple;
}

module.exports = Promise;
