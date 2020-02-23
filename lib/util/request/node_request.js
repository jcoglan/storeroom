'use strict';

var http       = require('http'),
    https      = require('https'),
    url        = require('url'),
    Buffer     = require('vault-cipher').Buffer,
    assign     = require('../assign'),
    concat     = require('../concat'),
    normalize  = require('./normalize'),
    Promise    = require('../promise'),
    setMissing = require('./set_missing'),
    TYPES      = require('./content_types');

var request = function(method, _url, params, headers, options) {
  var uri     = url.parse(_url),
      client  = (uri.protocol === 'https:') ? https : http,
      path    = uri.path,
      sep     = /\?/.test(path) ? '&' : '?',
      isBlob  = (typeof params === 'string' || params instanceof Buffer),
      isWrite = /^(POST|PUT)$/.test(method);

  params  = normalize(params);
  headers = assign({}, headers);

  if (method === 'GET' || method === 'DELETE') {
    params = params.toString();
    if (params !== '') path += sep + params;
  }
  else if (isWrite) {
    headers['Content-Length'] = params.length.toString();
    setMissing(headers, 'Content-Type', TYPES[isBlob ? 'OCTET_STREAM' : 'FORM_ENCODED']);
  }

  if (method === 'DELETE') headers['Content-Length'] = '0';

  var host = uri.hostname,
      port = parseInt(uri.port || (client === https ? 443 : 80), 10);

  var requestOptions = assign({}, options, { host, port, method, path, headers });

  if (requestOptions.host === 'localhost')
    requestOptions.rejectUnauthorized = false;

  var req = client.request(requestOptions);

  return new Promise(function(resolve, reject) {
    req.on('response', function(response) {
      var status   = response.statusCode,
          headers  = response.headers,
          redirect = headers.location;

      if (status >= 300 && status < 400 && redirect) {
        redirect = url.resolve(_url, redirect);
        return resolve(request('GET', redirect, {}, {}, options));
      }

      concat(response, function(body) {
        resolve({ status, headers, body });
      });
    });

    req.on('error', reject);

    if (isWrite) req.write(params);
    req.end();
  });
};

module.exports = request;
