'use strict'

var qs = require('./lib/util/querystring');

var query    = location.search.replace(/^\?/, ''),
    fragment = location.hash.replace(/^#/, ''),
    params   = qs.parse(fragment || query),
    callback = params.state;

delete params.state;

opener[callback](params);

close();
