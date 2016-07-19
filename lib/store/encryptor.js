'use strict';

var Cipher = require('vault-cipher'),
    Buffer = Cipher.Buffer;

var ENCRYPT_KEY_SIZE       = 32,
    SIGN_KEY_SIZE          = 32,
    ENCRYPTED_KEYPAIR_SIZE = 128;

var Encryptor = function(cipher) {
  this._cipher   = cipher;
  this._encoding = 'binary';
};

Encryptor.prototype.encrypt = function(plaintext) {
  var itemKeys   = Cipher.randomKeys(),
      itemCipher = new Cipher(itemKeys, {format: this._encoding}),

      keyBlock   = this._cipher.encrypt(Buffer.concat(itemKeys)),
      itemBlock  = itemCipher.encrypt(plaintext),
      record     = new Buffer(keyBlock + itemBlock, this._encoding);

  return record.toString('base64');
};

Encryptor.prototype.decrypt = function(ciphertext) {
  var record     = new Buffer(ciphertext, 'base64'),
      keyBlock   = record.slice(0, ENCRYPTED_KEYPAIR_SIZE),
      itemBlock  = record.slice(ENCRYPTED_KEYPAIR_SIZE, record.length),

      itemKeys   = new Buffer(this._cipher.decrypt(keyBlock), this._encoding),
      encryptKey = itemKeys.slice(0, ENCRYPT_KEY_SIZE),
      signKey    = itemKeys.slice(ENCRYPT_KEY_SIZE, itemKeys.length),
      itemCipher = new Cipher([encryptKey, signKey]);

  return itemCipher.decrypt(itemBlock);
};

module.exports = Encryptor;
