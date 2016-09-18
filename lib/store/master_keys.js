'use strict';

var Cipher   = require('vault-cipher'),
    Buffer   = Cipher.Buffer,
    crypto   = Cipher.crypto,
    consts   = require('./consts'),
    errors   = require('../adapters/errors'),
    metadata = require('./metadata');

var BUCKETS   = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    FILENAME  = '.keys',
    HASH_BITS = 5,
    SALT      = '35b7c7ed-f71e-4adf-9051-02fb0f1e0e17',
    WORK      = 100;

var MasterKeys = function(keys, options) {
  this._hashKey  = keys[0];
  this._hashBits = options.hashBits || HASH_BITS;
  this._cipher   = new Cipher(keys.slice(1), {input: null, format: null});
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
      password = new Cipher(options.password, {input: null, salt: SALT, work: WORK});

  return adapter.read(FILENAME).then(function(keys) {
    if (keys) return MasterKeys.parse(keys, password);

    var newKeys = MasterKeys.generateKeys(),
        block   = password.encrypt(Buffer.concat(newKeys)),
        head    = JSON.stringify(metadata);

    return adapter.write(FILENAME, [head, block].join('\n')).then(function() { return newKeys });

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
  return [crypto.randomBytes(consts.HASH_KEY_SIZE)].concat(Cipher.randomKeys());
};

MasterKeys.parse = function(keys, password) {
  var lines = keys.split('\n');
  keys = password.decrypt(lines[1]);

  var offset1 =           consts.HASH_KEY_SIZE,
      offset2 = offset1 + consts.ENCRYPT_KEY_SIZE,
      offset3 = offset2 + consts.SIGN_KEY_SIZE;

  return [
    keys.slice(      0, offset1),
    keys.slice(offset1, offset2),
    keys.slice(offset2, offset3)
  ];
};

module.exports = MasterKeys;
