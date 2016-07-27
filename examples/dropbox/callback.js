var vstore      = require('../../'),
    credentials = require('./credentials');

vstore.handleDropboxCallback(credentials).then(function(session) {
  console.log(session);

}, function(error) {
  console.error(error);
});
