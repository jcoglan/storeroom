'use strict';

module.exports = function(headers, key, value) {
  var pattern = new RegExp('^' + key + '$', 'i'),
      keys    = Object.keys(headers).filter(pattern.test, pattern);

  if (keys.length === 0) headers[key] = value;
};
