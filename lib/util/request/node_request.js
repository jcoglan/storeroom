'use strict';

var http    = require('http'),
    https   = require('https'),
    qs      = require('querystring'),
    url     = require('url'),
    concat  = require('../concat'),
    extend  = require('../extend'),
    Promise = require('../promise');

var normaliseParams = function(params) {
  if (typeof params === 'string')  params = new Buffer(params, 'utf8');
  if (!(params instanceof Buffer)) params = new Buffer(qs.stringify(params), 'utf8');
  return params;
};

var request = function(method, _url, params, headers, options) {
  var uri    = url.parse(_url),
      client = (uri.protocol === 'https:') ? https : http,
      path   = uri.path,
      sep    = /\?/.test(path) ? '&' : '?';

  params = normaliseParams(params);

  if (method === 'GET') {
    params = params.toString();
    if (params !== '') path = path + sep + params;
  }
  else if (method === 'PUT') {
    headers['Content-Length'] = params.length.toString();
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
