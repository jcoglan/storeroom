'use strict';

var connect = require('./connect'),
    request = require('../../util/request');

var RemoteStorageAdapter = function(session) {
  this._session = session;
  this._rootUrl = session.webfinger.storageRoot.replace(/\/?$/, '/') + session.scope;
  this._token   = session.authorization.access_token;
};

RemoteStorageAdapter.prototype.read = function(name) {
  var url  = this._rootUrl + '/' + name,
      head = {'Authorization': 'Bearer ' + this._token};

  return request('GET', url, {}, head).then(function(response) {
    var status = response.statusCode;

    if (status >= 200 && status < 300) return response.body.toString();
    if (status === 404) return null;

    throw new Error('Request failed (' + status + '): GET ' + url);
  });
};

RemoteStorageAdapter.prototype.write = function(name, data) {
  var url = this._rootUrl + '/' + name;

  var head = {
    'Authorization': 'Bearer ' + this._token,
    'Content-Type':  'text/plain'
  };

  return request('PUT', url, data, head).then(function(response) {
    var status = response.statusCode;
    if (status >= 200 && status < 300) return null;

    throw new Error('Request failed (' + status + '): PUT ' + url);
  });
};

RemoteStorageAdapter.connect = connect;

module.exports = RemoteStorageAdapter;
