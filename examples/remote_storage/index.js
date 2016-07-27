var storeroom = require('../../'),
    $         = require('jquery');

$('form').on('submit', function(event) {
  event.preventDefault();

  var address = $('#address').val();

  storeroom.connectRemoteStorage({
    address: address,
    client:  'Storeroom Demo',
    scope:   'storeroom'

  }).catch(function(error) {
    console.error(error);
  });
});

storeroom.handleRemoteStorageCallback().then(function(session) {
  console.log(session);
});
