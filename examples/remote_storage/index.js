var vstore = require('../../'),
    $      = require('jquery');

$('form').on('submit', function(event) {
  event.preventDefault();

  var address = $('#address').val();

  vstore.connectRemoteStorage({
    address: address,
    client:  'vault-store Demo',
    scope:   'demo'

  }).catch(function(error) {
    console.error(error);
  });
});

vstore.handleRemoteStorageCallback().then(function(session) {
  console.log(session);
});
