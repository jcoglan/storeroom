'use strict';

const forEach = Array.prototype.forEach,
      hasOwn  = Object.prototype.hasOwnProperty;

function assign(target) {
  forEach.call(arguments, (source, i) => {
    if (i === 0) return;

    for (let key in source) {
      if (hasOwn.call(source, key)) target[key] = source[key];
    }
  });

  return target;
}

module.exports = assign;
