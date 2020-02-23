'use strict';

var metadata = require('./metadata');

var Cipher = require('vault-cipher'),
    Buffer = Cipher.Buffer,
    consts = require('./consts');

var Encryptor = function(cipher) {
  this._cipher  = cipher;
  this._options = {input: 'utf8', format: null};
};

Encryptor.prototype.encrypt = function(plaintext) {
  var itemCipher = new Cipher(null, this._options),
      itemKeys   = itemCipher.randomKeys(),

      header     = Buffer.from([metadata.recordHeader]),
      keyBlock   = this._cipher.encrypt(itemKeys),
      itemBlock  = itemCipher.encrypt(plaintext),
      record     = Buffer.concat([header, keyBlock, itemBlock]);

  return record.toString('base64');
};

Encryptor.prototype.decrypt = function(ciphertext) {
  var record     = Buffer.from(ciphertext, 'base64'),
      data       = record.slice(1, record.length),
      keyBlock   = data.slice(0, consts.ENCRYPTED_KEYPAIR_SIZE),
      itemBlock  = data.slice(consts.ENCRYPTED_KEYPAIR_SIZE, data.length),

      itemKeys   = this._cipher.decrypt(keyBlock),
      itemCipher = new Cipher(itemKeys, this._options);

  return itemCipher.decrypt(itemBlock);
};

module.exports = Encryptor;
