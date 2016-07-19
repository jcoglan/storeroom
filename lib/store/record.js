'use strict';

var Encryptor = require('./encryptor');

var Record = function(cipher, plaintext, ciphertext) {
  this._cipher     = new Encryptor(cipher);
  this._plaintext  = plaintext;
  this._ciphertext = ciphertext;
};

Record.prototype.get = function() {
  if (this._plaintext === undefined) {
    this._plaintext = this._ciphertext &&
                      JSON.parse(this._cipher.decrypt(this._ciphertext));
  }
  return this._plaintext;
};

Record.prototype.put = function(value) {
  this._plaintext  = value;
  this._ciphertext = undefined;
};

Record.prototype.serialize = function() {
  if (this._ciphertext === undefined) {
    this._ciphertext = this._cipher.encrypt(JSON.stringify(this._plaintext));
    this._plaintext  = undefined;
  }
  return this._ciphertext;
};

module.exports = Record;
