var storeroom = require('../../'),
    $         = require('jquery');

$('form').on('submit', function(event) {
  event.preventDefault();

  var address = $('#address').val();

  storeroom.connectRemoteStorage({
    address:  address,
    client:   'Storeroom Demo',
    scope:    'storeroom',
    callback: 'http://localhost:8000/acceptor.html'

  }).then(function(session) {
    console.log(session);
  }, function(error) {
    console.error(error);
  });
});
