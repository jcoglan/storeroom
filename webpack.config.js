var path = require('path');

var eg = path.join(__dirname, 'examples');

module.exports = {
  devtool: 'source-map',

  entry: {
    dropbox:          path.join(eg, 'dropbox', 'index'),
    dropbox_callback: path.join(eg, 'dropbox', 'callback'),
    remote_storage:   path.join(eg, 'remote_storage', 'index')
  },

  output: {
    path:     path.join(eg, 'bundles'),
    filename: '[name].js'
  }
};
