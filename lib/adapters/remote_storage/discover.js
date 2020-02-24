'use strict';

const http    = require('../../util/http'),
      Promise = require('../../util/promise');

const WEBFINGER_PATHS = [
  'webfinger',
  'webfinger.json',
  'host-meta.json',
  'host-meta'
];

const REL_TAGS = [
  'http://tools.ietf.org/id/draft-dejong-remotestorage',
  'remotestorage',
  'remoteStorage',
  'lrdd'
];

const AUTH_KEYS = [
  'http://tools.ietf.org/html/rfc6749#section-4.2',
  'auth-endpoint'
];

const VERSION_KEYS = [
  'http://remotestorage.io/spec/version'
];

function rsLinkFromResponse(response, resource) {
  if (response.status !== 200)
    throw new Error('Response is not successful: ' + response.status);

  let links = JSON.parse(response.body.toString('utf8'));

  let rsLink = links.links.filter(function(link) {
    return REL_TAGS.some(function(tag) { return link.rel === tag });
  })[0];

  if (!rsLink)
    throw new Error('Could not find a RemoteStorage link');

  if (rsLink.template) {
    if (rsLink.rel === 'lrdd')
      return http.get(rsLink.template.replace('{uri}', encodeURIComponent(resource)))
             .then(rsLinkFromResponse);

    if (rsLink.rel === 'remoteStorage')
      return {
        version:     'remoteStorage-2011.10',
        authDialog:  rsLink.auth,
        storageRoot: rsLink.template.replace('/{category}', '')
      }
  }

  let lookup = function(value, key) { return value || rsLink.properties[key] };

  let version = VERSION_KEYS.reduce(lookup, null) || rsLink.type;
  if (!version)
    throw new Error('Could not determine RemoteStorage version');

  let authDialog = AUTH_KEYS.reduce(lookup, null);
  if (!authDialog)
    throw new Error('Could not determine RemoteStorage authorization endpoint');

  let storageRoot = rsLink.href;
  if (!storageRoot)
    throw new Error('Could not determine RemoteStorage storage root');

  return { version, authDialog, storageRoot };
}

module.exports = {
  withAddress(address) {
    let parts    = address.split('@'),
        user     = parts[0],
        host     = parts[1],
        resource = 'acct:' + address;

    let webfingerUrls = ['https://', 'http://'].reduce(function(list, scheme) {
      return list.concat(WEBFINGER_PATHS.map(function(path) {
        return scheme + host + '/.well-known/' + path;
      }));
    }, []);

    return webfingerUrls.reduce(function(promise, url) {
      return promise.catch(function() {
        return http.get(url, { resource }).then(function(response) {
          return rsLinkFromResponse(response, resource);
        });
      });
    }, Promise.reject());
  }
};
