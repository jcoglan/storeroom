'use strict';

var authorize = require('./authorize'),
    errors    = require('../errors'),
    http      = require('../../util/http');

var RemoteStorageAdapter = function(session) {
  this._session = session;
  this._rootUrl = session.webfinger.storageRoot.replace(/\/?$/, '/') + session.scope;
  this._token   = session.authorization.access_token;
};

RemoteStorageAdapter.prototype.read = function(name) {
  var url  = this._rootUrl + '/' + name,
      head = { Authorization: 'Bearer ' + this._token };

  return http.get(url, {}, head).then(function(response) {
    var status = response.status,
        body   = response.body.toString();

    if (status >= 200 && status < 300) return body;

    if (status === 401 || status === 403)
      throw new errors.AuthError('RemoteStorage error: ' + body);

    if (status === 404) return null;

    throw new Error('RemoteStorage error (' + status + '): GET ' + url);
  });
};

RemoteStorageAdapter.prototype.write = function(name, data) {
  if (data === null) return this._delete(name);

  var url  = this._rootUrl + '/' + name,
      head = { Authorization: 'Bearer ' + this._token };

  head['Content-Type'] = 'text/plain';

  return http.put(url, data, head).then(function(response) {
    var status = response.status,
        body   = response.body.toString();

    if (status >= 200 && status < 300) return null;

    if (status === 401 || status === 403)
      throw new errors.AuthError('RemoteStorage error: ' + body);

    if (status === 409 || status === 412)
      throw new errors.ConflictError('RemoteStorage error: ' + body);

    throw new Error('RemoteStorage error (' + status + '): PUT ' + url);
  });
};

RemoteStorageAdapter.prototype._delete = function(name) {
  var url  = this._rootUrl + '/' + name,
      head = { Authorization: 'Bearer ' + this._token };

  return http.del(url, {}, head).then(function(response) {
    var status = response.status,
        body   = response.body.toString();

    if (status >= 200 && status < 300) return null;

    if (status === 401 || status === 403)
      throw new errors.AuthError('RemoteStorage error: ' + body);

    if (status === 404) return null;

    if (status === 409 || status === 412)
      throw new errors.ConflictError('RemoteStorage error: ' + body);

    throw new Error('RemoteStorage error (' + status + '): DELETE ' + url);
  });
};

RemoteStorageAdapter.authorize = authorize;

module.exports = RemoteStorageAdapter;
