'use strict';

var Cipher   = require('vault-cipher'),
    Buffer   = Cipher.Buffer,
    crypto   = Cipher.crypto,
    assign   = require('../util/assign'),
    consts   = require('./consts'),
    errors   = require('../adapters/errors'),
    metadata = require('./metadata');

var FILENAME     = '.keys',
    HASH_BITS    = 5,
    HASH_VERSION = 1,
    SALT         = '35b7c7ed-f71e-4adf-9051-02fb0f1e0e17',
    CIPHER_OPTS  = { input: null, format: null, salt: SALT },
    WORK_BASE    = 10,
    WORK_FACTOR  = 13;

var MasterKeys = function(keys, options) {
  this._hashKey  = keys[0];
  this._hashBits = options.hashBits || HASH_BITS;
  this._cipher   = new Cipher(keys[1], CIPHER_OPTS);
};

MasterKeys.prototype.hashPathname = function(pathname) {
  var hmac   = crypto.createHmac('sha256', this._hashKey),
      hash   = hmac.update(pathname).digest(),
      mask   = Math.pow(2, this._hashBits) - 1,
      index  = hash.readUInt8(hash.length - 1) & mask,
      digits = Math.ceil(this._hashBits / 4);

  index = index.toString(16);
  while (index.length < digits) index = '0' + index;

  return index;
};

MasterKeys.prototype.encrypt = function(plaintext) {
  return this._cipher.encrypt(plaintext);
};

MasterKeys.prototype.decrypt = function(ciphertext) {
  return this._cipher.decrypt(ciphertext);
};

MasterKeys.create = function(options) {
  return options.adapter.read(FILENAME).then(function(keys) {
    if (keys)
      return MasterKeys.parse(options, keys);
    else
      return MasterKeys.generate(options);

  }).then(function(keys) {
    return new MasterKeys(keys, options);

  }, function(error) {
    if (error instanceof errors.ConflictError)
      return MasterKeys.create(options);
    else
      throw error;
  });
};

MasterKeys.generate = function(options) {
  var keys = [
    crypto.randomBytes(consts.HASH_KEY_SIZE),
    new Cipher().randomKeys()
  ];

  var fileHead = JSON.stringify(metadata.fileHeader);

  var work     = Math.pow(2, WORK_FACTOR),
      password = new Cipher(options.password, assign({ work }, CIPHER_OPTS)),
      encKeys  = password.encrypt(Buffer.concat(keys)),
      block    = Buffer.alloc(1 + encKeys.length);

  block.writeUInt8((HASH_VERSION << 4) | (WORK_FACTOR - WORK_BASE), 0);
  encKeys.copy(block, 1);
  block = block.toString('base64');

  return options.adapter.write(FILENAME, [fileHead, block].join('\n'))
         .then(function() { return keys });
};

MasterKeys.parse = function(options, keys) {
  var lines    = keys.split('\n'),
      block    = Buffer.from(lines[1], 'base64'),
      header   = block.readUInt8(0),
      encKeys  = block.slice(1, block.length),
      work     = Math.pow(2, WORK_BASE + header & 0xF),
      password = new Cipher(options.password, assign({ work }, CIPHER_OPTS));

  keys = password.decrypt(encKeys);

  var offset1 =           consts.HASH_KEY_SIZE,
      offset2 = offset1 + consts.ENCRYPT_KEY_SIZE + consts.SIGN_KEY_SIZE;

  return [
    keys.slice(      0, offset1),
    keys.slice(offset1, offset2)
  ];
};

module.exports = MasterKeys;
