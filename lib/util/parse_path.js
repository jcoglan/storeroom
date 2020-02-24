'use strict';

module.exports = function(pathname) {
  pathname = pathname.replace(/^\/?/, '/');
  let parts = pathname.match(/[^\/]*\/?/g);

  return parts.slice(0, parts.length - 1).map(function(segment, i, list) {
    return {
      filename: segment,
      pathname: list.slice(0, i + 1).join('')
    };
  });
};
