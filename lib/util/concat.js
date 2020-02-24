'use strict';

module.exports = function(stream, callback) {
  let chunks = [];

  stream.on('data', function(c) { chunks.push(c) });

  stream.on('end', function() {
    callback(Buffer.concat(chunks));
  });
};
