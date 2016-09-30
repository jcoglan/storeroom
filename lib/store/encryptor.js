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
  var itemKeys   = Cipher.randomKeys(),
      itemCipher = new Cipher(itemKeys, this._options),

      header     = new Buffer([metadata.recordHeader]),
      keyBlock   = this._cipher.encrypt(Buffer.concat(itemKeys)),
      itemBlock  = itemCipher.encrypt(plaintext),
      record     = Buffer.concat([header, keyBlock, itemBlock]);

  return record.toString('base64');
};

Encryptor.prototype.decrypt = function(ciphertext) {
  var record     = new Buffer(ciphertext, 'base64'),
      data       = record.slice(1, record.length),
      keyBlock   = data.slice(0, consts.ENCRYPTED_KEYPAIR_SIZE),
      itemBlock  = data.slice(consts.ENCRYPTED_KEYPAIR_SIZE, data.length),

      itemKeys   = this._cipher.decrypt(keyBlock),
      encryptKey = itemKeys.slice(0, consts.ENCRYPT_KEY_SIZE),
      signKey    = itemKeys.slice(consts.ENCRYPT_KEY_SIZE, itemKeys.length),
      itemCipher = new Cipher([encryptKey, signKey], this._options);

  return itemCipher.decrypt(itemBlock);
};

module.exports = Encryptor;
