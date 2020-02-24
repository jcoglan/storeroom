'use strict';

const DEFAULT_SEP = '&',
      DEFAULT_EQ  = '=';

module.exports = {
  parse(string, sep, eq) {
    sep = sep || DEFAULT_SEP;
    eq  = eq  || DEFAULT_EQ;

    let pairs  = string.split(sep),
        params = {};

    pairs.forEach((pair) => {
      let parts = pair.split(eq);
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    });

    return params;
  },

  stringify(params, sep, eq) {
    sep = sep || DEFAULT_SEP;
    eq  = eq  || DEFAULT_EQ;

    let pairs = [];

    for (let key in params)
      pairs.push(encodeURIComponent(key) + eq + encodeURIComponent(params[key]));

    return pairs.join(sep);
  }
};
