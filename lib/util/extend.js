'use strict';

module.exports = function(target, source) {
  for (var key in source) {
    if (!target.hasOwnProperty(key))
      target[key] = source[key];
  }
  return target;
};
