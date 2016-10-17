'use strict';

var Cipher   = require('vault-cipher'),
    Buffer   = Cipher.Buffer,
    crypto   = Cipher.crypto,
    consts   = require('./consts'),
    errors   = require('../adapters/errors'),
    metadata = require('./metadata');

var BUCKETS      = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    FILENAME     = '.keys',
    HASH_BITS    = 5,
    HASH_VERSION = 1,
    SALT         = '35b7c7ed-f71e-4adf-9051-02fb0f1e0e17',
    WORK_BASE    = 10,
    WORK_FACTOR  = 13;

var MasterKeys = function(keys, options) {
  this._hashKey  = keys[0];
  this._hashBits = options.hashBits || HASH_BITS;
  this._cipher   = new Cipher(keys[1], {input: null, format: null});
};

MasterKeys.prototype.hashPathname = function(pathname) {
  var hmac  = crypto.createHmac('sha256', this._hashKey),
      hash  = hmac.update(pathname).digest(),
      mask  = Math.pow(2, this._hashBits) - 1,
      index = hash.readUInt8(hash.length - 1) & mask;

  return BUCKETS[index];
};

MasterKeys.prototype.encrypt = function(plaintext) {
  return this._cipher.encrypt(plaintext);
};

MasterKeys.prototype.decrypt = function(ciphertext) {
  return this._cipher.decrypt(ciphertext);
};

MasterKeys.create = function(options) {
  var adapter  = options.adapter,
      work     = Math.pow(2, WORK_FACTOR),
      password = new Cipher(options.password, {input: null, format: null, salt: SALT, work: work});

  return adapter.read(FILENAME).then(function(keys) {
    if (keys) return MasterKeys.parse(keys, password);

    var header = new Buffer(1);
    header.writeUInt8((HASH_VERSION << 4) | (WORK_FACTOR - WORK_BASE), 0);

    var fileHead = JSON.stringify(metadata.fileHeader),
        newKeys  = MasterKeys.generateKeys(),
        encKeys  = password.encrypt(Buffer.concat(newKeys)),
        block    = Buffer.concat([header, encKeys]).toString('base64');

    return adapter.write(FILENAME, [fileHead, block].join('\n'))
           .then(function() { return newKeys });

  }).then(function(keys) {
    return new MasterKeys(keys, options);

  }, function(error) {
    if (error instanceof errors.ConflictError)
      return MasterKeys.create(options);
    else
      throw error;
  });
};

MasterKeys.generateKeys = function() {
  return [
    crypto.randomBytes(consts.HASH_KEY_SIZE),
    new Cipher().randomKeys()
  ];
};

MasterKeys.parse = function(keys, password) {
  var lines   = keys.split('\n'),
      block   = new Buffer(lines[1], 'base64'),
      encKeys = block.slice(1, block.length);

  keys = password.decrypt(encKeys);

  var offset1 =           consts.HASH_KEY_SIZE,
      offset2 = offset1 + consts.ENCRYPT_KEY_SIZE + consts.SIGN_KEY_SIZE;

  return [
    keys.slice(      0, offset1),
    keys.slice(offset1, offset2)
  ];
};

module.exports = MasterKeys;
