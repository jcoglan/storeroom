'use strict';

const Buffer     = require('vault-cipher').Buffer,
      assign     = require('../assign'),
      normalize  = require('./normalize'),
      Promise    = require('../promise'),
      setMissing = require('./set_missing'),
      TYPES      = require('./content_types');

module.exports = (method, uri, params, headers, options) => {
  let sep     = /\?/.test(uri) ? '&' : '?',
      isBlob  = (typeof params === 'string' || params instanceof Buffer),
      isWrite = /^(POST|PUT)$/.test(method);

  params  = normalize(params);
  headers = assign({}, headers);

  if (method === 'GET' || method === 'DELETE') {
    params = params.toString();
    if (params !== '') uri += sep + params;
  }
  else if (isWrite) {
    setMissing(headers, 'Content-Type', TYPES[isBlob ? 'OCTET_STREAM' : 'FORM_ENCODED']);
  }

  let xhr = global.XDomainRequest ? new XDomainRequest() : new XMLHttpRequest();
  xhr.open(method, uri, true);

  for (let key in headers) {
    if (xhr.setRequestHeader) xhr.setRequestHeader(key, headers[key]);
  }

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      let response = {
        status:  xhr.status,
        headers: {},
        body:    Buffer.from(xhr.responseText, 'utf8')
      };

      let headers = xhr.getAllResponseHeaders().match(/^[^:]+:/gm) || [];

      headers.forEach((name) => {
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
