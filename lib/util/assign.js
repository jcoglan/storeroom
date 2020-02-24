'use strict';

const slice  = Array.prototype.slice,
      hasOwn = Object.prototype.hasOwnProperty;

function assign(target) {
  let sources = slice.call(arguments, 1);

  for (let source of sources) {
    for (let key in source) {
      if (hasOwn.call(source, key)) target[key] = source[key];
    }
  }

  return target;
}

module.exports = assign;
