var storeroom   = require('../../'),
    credentials = require('./credentials');

storeroom.handleDropboxCallback(credentials).then(function(session) {
  console.log(session);

}, function(error) {
  console.error(error);
});
