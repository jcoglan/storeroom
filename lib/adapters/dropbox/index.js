'use strict';

const authorize = require('./authorize'),
      errors    = require('../errors'),
      http      = require('../../util/http');

function lookup(object, keys) {
  return keys.reduce(function(value, key) { return value && value[key] }, object);
}

class DropboxAdapter {
  constructor(session) {
    this._session = session;
    this._token   = session.authorization.access_token;
    this._etags   = {};
  }

  read(name) {
    let args = { path: '/' + name },
        self = this;

    return http.post('https://content.dropboxapi.com/2/files/download', {}, {
      'Authorization':   'Bearer ' + this._token,
      'Content-Type':    ' ',
      'Dropbox-API-Arg': JSON.stringify(args)

    }).then(function(response) {
      let status = response.status,
          body   = response.body.toString(),
          props;

      if (status >= 200 && status < 300) {
        props = JSON.parse(response.headers['dropbox-api-result']);
        self._etags[name] = props.rev;
        return body;
      }

      delete self._etags[name];

      if (status === 401)
        throw new errors.AuthError('Dropbox error: ' + body);

      if (status === 409) {
        props = JSON.parse(body);
        if (lookup(props, ['error', 'path', '.tag']) === 'not_found') return null;
      }

      throw new Error('Dropbox error (' + status + '): ' + body);
    });
  }

  write(name, data) {
    if (data === null) return this._delete(name);

    let args = { path: '/' + name, autorename: false, mute: true },
        etag = this._etags[name],
        self = this;

    if (etag)
      args.mode = { '.tag': 'update', update: etag };
    else
      args.mode = 'add';

    return http.post('https://content.dropboxapi.com/2/files/upload', data, {
      'Authorization':   'Bearer ' + this._token,
      'Content-Type':    'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(args)

    }).then(function(response) {
      let status = response.status,
          body   = response.body.toString(),
          props;

      if (status >= 200 && status < 300) {
        props = JSON.parse(body);
        self._etags[name] = props.rev;
        return null;
      }

      if (status === 401)
        throw new errors.AuthError('Dropbox error: ' + body);

      if (status === 409) {
        props = JSON.parse(body);
        if (lookup(props, ['error', 'reason', '.tag']) === 'conflict')
          throw new errors.ConflictError('Dropbox error: ' + body);
      }

      throw new Error('Dropbox error (' + status + '): ' + body);
    });
  }

  _delete(name) {
    let args = { path: '/' + name },
        data = JSON.stringify(args),
        self = this;

    return http.post('https://api.dropboxapi.com/2/files/delete', data, {
      'Authorization': 'Bearer ' + this._token,
      'Content-Type':  'application/json'

    }).then(function(response) {
      let status = response.status,
          body   = response.body.toString(),
          props;

      if (status >= 200 && status < 300) {
        delete self._etags[name];
        return null;
      }

      if (status === 401)
        throw new errors.AuthError('Dropbox error: ' + body);

      if (status === 409) {
        props = JSON.parse(body);
        if (lookup(props, ['error', 'path_lookup', '.tag']) === 'not_found') return null;
      }

      throw new Error('Dropbox error (' + status + '): ' + body);
    });
  }
}

DropboxAdapter.authorize = authorize;

module.exports = DropboxAdapter;
