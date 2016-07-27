'use strict';

var Buffer = require('vault-cipher').Buffer,
    qs     = require('../querystring');

module.exports = function(params) {
  if (typeof params === 'string') return new Buffer(params, 'utf8');
  if (params instanceof Buffer)   return params;
  return new Buffer(qs.stringify(params), 'utf8');
};
