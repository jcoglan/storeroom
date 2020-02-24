'use strict';

const forEach = Array.prototype.forEach,
      hasOwn  = Object.prototype.hasOwnProperty;

module.exports = function(target) {
  forEach.call(arguments, function(source, i) {
    if (i === 0) return;

    for (let key in source) {
      if (hasOwn.call(source, key)) target[key] = source[key];
    }
  });

  return target;
};
