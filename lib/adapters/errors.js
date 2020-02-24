'use strict';

function errorType(name) {
  return class extends Error {
    constructor(message) {
      super(message);
      this.name = name;
    }
  };
}

module.exports = {
  AuthError:     errorType('AuthError'),
  ConflictError: errorType('ConflictError')
};
