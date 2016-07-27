'use strict';

var errorType = function(name) {
  var klass = function(message) {
    this.name    = name;
    this.message = message;
    this.stack   = new Error().stack;
  };

  klass.prototype = Object.create(Error.prototype);
  klass.prototype.constructor = klass;

  return klass;
};

module.exports = {
  AuthError:     errorType('AuthError'),
  ConflictError: errorType('ConflictError')
};
