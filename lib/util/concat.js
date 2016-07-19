'use strict';

module.exports = function(stream, callback) {
  var chunks = [];

  stream.on('data', function(c) { chunks.push(c) });

  stream.on('end', function() {
    callback(Buffer.concat(chunks));
  });
};
