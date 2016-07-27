'use strict';

var Buffer     = require('vault-cipher').Buffer,
    extend     = require('../extend'),
    normalize  = require('./normalize'),
    Promise    = require('../promise'),
    setMissing = require('./set_missing'),
    TYPES      = require('./content_types');

module.exports = function(method, uri, params, headers, options) {
  var sep     = /\?/.test(uri) ? '&' : '?',
      isBlob  = (typeof params === 'string' || params instanceof Buffer),
      isWrite = /^(POST|PUT)$/.test(method);

  params  = normalize(params);
  headers = extend({}, headers);

  if (method === 'GET') {
    params = params.toString();
    if (params !== '') uri += sep + params;
  }
  else if (isWrite) {
    setMissing(headers, 'Content-Type', TYPES[isBlob ? 'OCTET_STREAM' : 'FORM_ENCODED']);
  }

  var xhr = global.XDomainRequest ? new XDomainRequest() : new XMLHttpRequest();
  xhr.open(method, uri, true);

  for (var key in headers) {
    if (xhr.setRequestHeader) xhr.setRequestHeader(key, headers[key]);
  }

  return new Promise(function(resolve, reject) {
    xhr.onload = function() {
      var response = {
        statusCode: xhr.status,
        headers:    {},
        body:       new Buffer(xhr.responseText, 'utf8')
      };

      xhr.getAllResponseHeaders().match(/^[^:]+:/gm).forEach(function(name) {
        name = name.replace(/^\s*/, '').replace(/:\s*$/, '');
        response.headers[name.toLowerCase()] = xhr.getResponseHeader(name);
      });

      resolve(response);
    };

    xhr.onerror = xhr.ontimeout = reject;

    if (isWrite) xhr.send(params.toString());
    else xhr.send('');
  });
};