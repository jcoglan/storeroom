'use strict';

var Promise = require('../../util/promise'),
    request = require('../../util/request');

var WEBFINGER_PATHS = [
  'webfinger',
  'webfinger.json',
  'host-meta.json',
  'host-meta'
];

var REL_TAGS = [
  'http://tools.ietf.org/id/draft-dejong-remotestorage',
  'remotestorage',
  'remoteStorage',
  'lrdd'
];

var AUTH_KEYS = [
  'http://tools.ietf.org/html/rfc6749#section-4.2',
  'auth-endpoint'
];

var VERSION_KEYS = [
  'http://remotestorage.io/spec/version'
];

var rsLinkFromResponse = function(response, resource) {
  if (response.statusCode !== 200)
    throw new Error('Response is not successful: ' + response.statusCode);

  var links = JSON.parse(response.body.toString('utf8'));

  var rsLink = links.links.filter(function(link) {
    return REL_TAGS.some(function(tag) { return link.rel === tag });
  })[0];

  if (!rsLink)
    throw new Error('Could not find a RemoteStorage link');

  if (rsLink.template) {
    if (rsLink.rel === 'lrdd')
      return request('GET', rsLink.template.replace('{uri}', encodeURIComponent(resource)))
             .then(rsLinkFromResponse);

    if (rsLink.rel === 'remoteStorage')
      return {
        version:     'remoteStorage-2012.04',
        authDialog:  rsLink.auth,
        storageRoot: rsLink.template.replace('/{category}', '')
      }
  }

  var lookup = function(value, key) { return value || rsLink.properties[key] };

  return {
    version:     VERSION_KEYS.reduce(lookup, null) || rsLink.type,
    authDialog:  AUTH_KEYS.reduce(lookup, null),
    storageRoot: rsLink.href
  };
};

module.exports = function(address) {
  var parts    = address.split('@'),
      user     = parts[0],
      host     = parts[1],
      resource = 'acct:' + address;

  var webfingerUrls = ['https://', 'http://'].reduce(function(list, scheme) {
    return list.concat(WEBFINGER_PATHS.map(function(path) {
      return scheme + host + '/.well-known/' + path;
    }));
  }, []);

  return webfingerUrls.reduce(function(promise, url) {
    return promise.catch(function() {
      return request('GET', url, {resource: resource}).then(function(response) {
        return rsLinkFromResponse(response, resource);
      });
    });
  }, Promise.reject());
};
