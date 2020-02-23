var path = require('path');

var eg   = path.join(__dirname, 'examples'),
    spec = path.join(__dirname, 'spec');

module.exports = {
  devtool: 'source-map',

  entry: {
    'examples/bundles/acceptor':       path.join(eg, 'acceptor'),
    'examples/bundles/dropbox':        path.join(eg, 'dropbox', 'index'),
    'examples/bundles/remote_storage': path.join(eg, 'remote_storage', 'index'),
    'spec/bundles/browser':            path.join(spec, 'browser')
  },

  output: {
    path: __dirname,
    filename: '[name].js'
  },

  module: {
    noParse: /jstest/
  }
};
