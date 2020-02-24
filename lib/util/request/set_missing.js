'use strict';

module.exports = (headers, key, value) => {
  let pattern = new RegExp('^' + key + '$', 'i'),
      keys    = Object.keys(headers).filter(pattern.test, pattern);

  if (keys.length === 0) headers[key] = value;
};
