var storeroom   = require('../../'),
    credentials = require('./credentials'),
    $           = require('jquery');

$('form.connect').submit(function(e) {
  e.preventDefault();

  storeroom.connectDropbox(credentials).then(function(session) {
    console.log(session);
  }, function(error) {
    console.error(error);
  });
});
