'use strict';

var http    = require('http'),
    https   = require('https'),
    qs      = require('querystring'),
    url     = require('url'),
    concat  = require('../concat'),
    extend  = require('../extend'),
    Promise = require('../promise');

var TYPES = {
  FORM_ENCODED: 'application/x-www-form-urlencoded',
  OCTET_STREAM: 'application/octet-stream'
};

var normaliseParams = function(params) {
  if (typeof params === 'string') return new Buffer(params, 'utf8');
  if (params instanceof Buffer)   return params;
  return new Buffer(qs.stringify(params), 'utf8');
};

var request = function(method, _url, params, headers, options) {
  var uri    = url.parse(_url),
      client = (uri.protocol === 'https:') ? https : http,
      path   = uri.path,
      sep    = /\?/.test(path) ? '&' : '?',
      isBlob = (typeof params === 'string' || params instanceof Buffer);

  params  = normaliseParams(params);
  headers = extend({}, headers);

  var typeKeys = Object.keys(headers).filter(function(key) {
    return /^content-type$/i.test(key);
  });

  if (method === 'GET') {
    params = params.toString();
    if (params !== '') path = path + sep + params;
  }
  else if (method === 'PUT') {
    headers['Content-Length'] = params.length.toString();
    if (typeKeys.length === 0)
      headers['Content-Type'] = TYPES[isBlob ? 'OCTET_STREAM' : 'FORM_ENCODED'];
  }
  else if (method === 'DELETE') {
    headers['Content-Length'] = '0';
  }

  var requestOptions = extend({
    method:  method,
    host:    uri.hostname,
    port:    uri.port || (client === https ? 443 : 80),
    path:    path,
    headers: headers
  }, options);

  if (requestOptions.host === 'localhost')
    requestOptions.rejectUnauthorized = false;

  var req = client.request(requestOptions);

  return new Promise(function(resolve, reject) {
    req.on('response', function(response) {
      var status   = response.statusCode,
          redirect = response.headers.location;

      if (status >= 300 && status < 400 && redirect) {
        redirect = url.resolve(_url, redirect);
        return resolve(request('GET', redirect, params, headers, options));
      }

      concat(response, function(body) {
        response.body = body;
        resolve(response);
      });
    });

    req.on('error', reject);

    if (method === 'PUT') req.write(params);
    req.end();
  });
};

module.exports = request;
