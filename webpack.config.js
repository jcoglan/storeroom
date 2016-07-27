var path = require('path');

var eg = path.join(__dirname, 'examples');

module.exports = {
  devtool: 'source-map',

  entry: {
    remote_storage: path.join(eg, 'remote_storage', 'index')
  },

  output: {
    path:     path.join(eg, 'bundles'),
    filename: '[name].js'
  }
};
