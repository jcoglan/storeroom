var path   = require('path'),
    vstore = require('../../');

module.exports = vstore.createStore({
  adapter:  vstore.createFileAdapter(path.resolve(__dirname, '.store')),
  password: 'I was there'
});
