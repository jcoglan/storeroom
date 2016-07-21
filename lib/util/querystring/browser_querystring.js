'use strict';

var DEFAULT_SEP = '&',
    DEFAULT_EQ  = '=';

module.exports = {
  parse: function(string, sep, eq) {
    sep = sep || DEFAULT_SEP;
    eq  = eq  || DEFAULT_EQ;

    var pairs  = string.split(sep),
        params = {};

    pairs.forEach(function(pair) {
      var parts = pair.split(eq);
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    });

    return params;
  },

  stringify: function(params, sep, eq) {
    sep = sep || DEFAULT_SEP;
    eq  = eq  || DEFAULT_EQ;

    var pairs = [];

    for (var key in params)
      pairs.push(encodeURIComponent(key) + eq + encodeURIComponent(params[key]));

    return pairs.join(sep);
  }
};
