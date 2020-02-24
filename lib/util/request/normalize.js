'use strict';

const Buffer = require('vault-cipher').Buffer,
      qs     = require('../querystring');

module.exports = function(params) {
  if (typeof params === 'string') return Buffer.from(params, 'utf8');
  if (params instanceof Buffer)   return params;
  return Buffer.from(qs.stringify(params), 'utf8');
};
