'use strict';

const Encryptor = require('./encryptor');

class Record {
  constructor(cipher, plaintext, ciphertext) {
    this._cipher     = new Encryptor(cipher);
    this._plaintext  = plaintext;
    this._ciphertext = ciphertext;
  }

  get() {
    if (this._plaintext === undefined) {
      this._plaintext = this._ciphertext &&
                        JSON.parse(this._cipher.decrypt(this._ciphertext));
    }
    return this._plaintext;
  }

  put(value) {
    this._plaintext  = value;
    this._ciphertext = undefined;
  }

  serialize() {
    if (this._ciphertext === undefined) {
      this._ciphertext = this._cipher.encrypt(JSON.stringify(this._plaintext));
      this._plaintext  = undefined;
    }
    return this._ciphertext;
  }
}

module.exports = Record;
