var path = require('path');

var eg   = path.join(__dirname, 'examples'),
    spec = path.join(__dirname, 'spec');

module.exports = {
  devtool: 'source-map',

  entry: {
    'examples/bundles/dropbox':          path.join(eg, 'dropbox', 'index'),
    'examples/bundles/dropbox_callback': path.join(eg, 'dropbox', 'callback'),
    'examples/bundles/remote_storage':   path.join(eg, 'remote_storage', 'index'),
    'spec/bundles/browser':              path.join(spec, 'browser')
  },

  output: {
    filename: '[name].js'
  },

  module: {
    noParse: /jstest/
  }
};
